"""Denoise the cinematic recording and cut it into acts, keeping the dramatic pauses."""
import json
import subprocess
import wave

import numpy as np

SRC = 'New Recording 209.m4a'
SR = 44100
FF = ['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']
# (start, end) seconds in the original, cut in the middle of the pauses between acts
ACTS = [(0.0, 9.35), (11.35, 35.95), (37.65, 75.85), (76.85, 101.95), (104.05, 127.15), (128.45, 137.05),
        (138.55, 157.75), (158.85, 191.45), (194.55, 206.25), (209.15, 235.25), (236.15, 254.45)]


def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write(path, x):
    stereo = np.stack([x, x], axis=1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())


def highpass(x, cutoff=85.0):
    # one-pole high-pass, applied twice for a gentler 12 dB/oct slope
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        prev_x = prev_y = 0.0
        for i, v in enumerate(x):
            prev_y = a * (prev_y + v - prev_x)
            prev_x = v
            y[i] = prev_y
        x = y
    return x


def denoise(x, n_fft=2048, hop=512, reduce_db=18.0):
    """Spectral gate: learn the noise spectrum from the quietest frames, then attenuate bins near it."""
    win = np.hanning(n_fft).astype(np.float32)
    pad = np.concatenate([np.zeros(n_fft), x, np.zeros(n_fft)])
    frames = np.lib.stride_tricks.sliding_window_view(pad, n_fft)[::hop] * win
    spec = np.fft.rfft(frames, axis=1)
    mag = np.abs(spec)
    energy = mag.mean(axis=1)
    quiet = mag[energy <= np.percentile(energy, 12)]
    noise = np.percentile(quiet, 80, axis=0) * 1.6  # per-bin noise ceiling with margin
    gain = np.clip((mag - noise) / (mag + 1e-9), 0, 1)
    floor = 10 ** (-reduce_db / 20)
    gain = floor + (1 - floor) * gain
    # smooth the mask over time and frequency so it doesn't sound watery
    k_t = np.ones(5) / 5
    gain = np.apply_along_axis(lambda g: np.convolve(g, k_t, mode='same'), 0, gain)
    k_f = np.ones(3) / 3
    gain = np.apply_along_axis(lambda g: np.convolve(g, k_f, mode='same'), 1, gain)
    out_frames = np.fft.irfft(spec * gain, n=n_fft, axis=1) * win
    out = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    for i, f in enumerate(out_frames):
        out[i * hop:i * hop + n_fft] += f
        norm[i * hop:i * hop + n_fft] += win ** 2
    out /= np.maximum(norm, 1e-6)
    return out[n_fft:n_fft + len(x)].astype(np.float32)


def cap_pauses(x, max_gap=0.9, keep=0.75, thresh_db=-45):
    """Keep dramatic pauses, but shorten any silence longer than max_gap down to `keep` seconds."""
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
    quiet = 20 * np.log10(rms) < thresh_db
    out, i, last = [], 0, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * hop / SR > max_gap:
                half = int(keep / 2 * SR)
                out.append(x[last:i * hop + half])
                last = j * hop - half
            i = j
        else:
            i += 1
    out.append(x[last:])
    return np.concatenate(out)


subprocess.run(FF + ['-i', SRC, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', 'work/209-mono.wav'], check=True)
x = read('work/209-mono.wav')
x = highpass(x)
x = denoise(x)
write('work/209-clean.wav', x)

durs = []
for k, (a, b) in enumerate(ACTS, 1):
    seg = x[int(a * SR):int(b * SR)].copy()
    seg = cap_pauses(seg)
    f = int(0.03 * SR)
    seg[:f] *= np.linspace(0, 1, f)
    seg[-f:] *= np.linspace(1, 0, f)
    tmp = f'work/209-act{k:02d}.wav'
    write(tmp, seg)
    out = f'public/v209/{k:02d}.wav'
    subprocess.run(FF + ['-i', tmp, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
    with wave.open(out) as w:
        d = w.getnframes() / w.getframerate()
    durs.append(round(d, 3))
    print(f'act {k:02d}: {b - a:5.1f}s -> {d:5.1f}s')
json.dump(durs, open('src/v209-durations.json', 'w'))
print('total voice', round(sum(durs), 1))
