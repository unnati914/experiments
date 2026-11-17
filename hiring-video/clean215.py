"""Clean the Case #001 voiceover: high-pass, spectral noise gate, gentle compression, level, trim after 'stay tuned'."""
import subprocess
import wave

import numpy as np

import sys
SRC = sys.argv[1] if len(sys.argv) > 1 else 'New Recording 215.m4a'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/voice/files1.wav'
SR = 44100
END = float(sys.argv[3]) if len(sys.argv) > 3 else 107.6  # just after the last word


def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def fft_highpass(x, cutoff=85.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x)).astype(np.float32)


def denoise(x, n_fft=2048, hop=512, reduce_db=16.0):
    win = np.hanning(n_fft).astype(np.float32)
    pad = np.concatenate([np.zeros(n_fft), x, np.zeros(n_fft)])
    frames = np.lib.stride_tricks.sliding_window_view(pad, n_fft)[::hop] * win
    spec = np.fft.rfft(frames, axis=1)
    mag = np.abs(spec)
    energy = mag.mean(axis=1)
    quiet = mag[energy <= np.percentile(energy, 12)]
    noise = np.percentile(quiet, 80, axis=0) * 1.5
    gain = np.clip((mag - noise) / (mag + 1e-9), 0, 1)
    floor = 10 ** (-reduce_db / 20)
    gain = floor + (1 - floor) * gain
    k_t = np.ones(5) / 5
    gain = np.apply_along_axis(lambda g: np.convolve(g, k_t, mode='same'), 0, gain)
    k_f = np.ones(3) / 3
    gain = np.apply_along_axis(lambda g: np.convolve(g, k_f, mode='same'), 1, gain)
    out_frames = np.fft.irfft(spec * gain, n=n_fft, axis=1) * win
    out = np.zeros(len(pad))
    norm = np.zeros(len(pad))
    for i, fr in enumerate(out_frames):
        out[i * hop:i * hop + n_fft] += fr
        norm[i * hop:i * hop + n_fft] += win ** 2
    out /= np.maximum(norm, 1e-6)
    return out[n_fft:n_fft + len(x)].astype(np.float32)


def compress(x, thresh_db=-22, ratio=3.0):
    hop = int(0.005 * SR)
    n = len(x) // hop
    rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
    db = 20 * np.log10(rms)
    over = np.maximum(db - thresh_db, 0)
    gdb = -over * (1 - 1 / ratio)
    # smooth gain (attack/release)
    sm = np.copy(gdb)
    for i in range(1, n):
        a = 0.5 if gdb[i] < sm[i - 1] else 0.05
        sm[i] = sm[i - 1] + a * (gdb[i] - sm[i - 1])
    g = np.repeat(10 ** (sm / 20), hop)
    g = np.concatenate([g, np.full(len(x) - len(g), g[-1])])
    return x * g


subprocess.run(['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', SRC, '-ac', '1', '-ar', str(SR), 'work/clean_in.wav'], check=True)
x = read('work/clean_in.wav')[: int(END * SR)]
x = fft_highpass(x)
x = denoise(x)
x = compress(x)
x = x / (np.max(np.abs(x)) + 1e-9) * 0.93
fo = int(0.3 * SR)
x[-fo:] *= np.linspace(1, 0, fo)
import os
os.makedirs('public/voice', exist_ok=True)
stereo = np.stack([x, x], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())
print('wrote', OUT, round(len(x) / SR, 2), 's')
