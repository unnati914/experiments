"""Original cinematic score timed to the acts: piano arpeggios + string pad + drone, a dropout before
"I won", sub booms on key beats, and a swell into the finale."""
import json
import math
import wave

import numpy as np

SR = 44100
FPS = 30
LEAD, GAP, OUTRO = 15, 36, 150  # must match src/Cinema.tsx

durs = json.load(open('src/v209-durations.json'))
clip = [math.ceil(d * FPS) for d in durs]
starts, at = [], LEAD
for c in clip:
    starts.append(at)
    at += c + GAP
total_frames = starts[-1] + clip[-1] + OUTRO
T = total_frames / FPS + 0.5
n = int(T * SR)
t = np.arange(n) / SR
act = [st / FPS for st in starts]  # act start times (s)
rng = np.random.default_rng(3)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# --- intensity curve per act (0..1), smoothed
levels = [0.28, 0.42, 0.55, 0.6, 0.5, 0.45, 0.5, 0.55, 0.45, 0.7, 1.0]
curve = np.zeros(n)
for i, lv in enumerate(levels):
    a = int(act[i] * SR)
    b = int((act[i + 1] if i + 1 < len(act) else T) * SR)
    curve[a:b] = lv
curve[: int(act[0] * SR)] = levels[0]
k = int(2.5 * SR)
cs = np.concatenate([[0], np.cumsum(curve)])
lo = np.clip(np.arange(n) - k // 2, 0, n)
hi = np.clip(np.arange(n) + k // 2, 0, n)
curve = (cs[hi] - cs[lo]) / np.maximum(hi - lo, 1)

# dropout before "I won" (act 5 starts with "And then Zomato ran a hackathon, I won")
won = act[4] + 3.1
drop_a, drop_b = act[4] + 0.6, won
mask = np.ones(n)
fade = int(0.6 * SR)
ia, ib = int(drop_a * SR), int(drop_b * SR)
mask[ia:ia + fade] = np.linspace(1, 0, fade)
mask[ia + fade:ib] = 0
# after "I won", the music comes back stronger
curve[ib:int((act[4] + 9) * SR)] = np.maximum(curve[ib:int((act[4] + 9) * SR)], 0.8)
# swell through the finale
fin = int(act[10] * SR)
curve[fin:] = np.minimum(1.0, curve[fin:] + np.linspace(0, 0.35, n - fin))

# --- harmony: Dm - Bb - F - C, 64 bpm, one bar each
BPM = 64
beat = 60 / BPM
bar = 4 * beat
CHORDS = [[50, 53, 57, 62], [46, 50, 53, 58], [41, 45, 48, 53], [48, 52, 55, 60]]
ARP = [[62, 65, 69, 74, 69, 65], [58, 62, 65, 70, 65, 62], [57, 60, 65, 69, 65, 60], [60, 64, 67, 72, 67, 64]]

piano = np.zeros(n)
pad = np.zeros(n)
drone = 0.5 * np.sin(2 * np.pi * midi(38) * t) + 0.25 * np.sin(2 * np.pi * midi(26) * t)
bars = int(T / bar) + 1
step = bar / 6
for b in range(bars):
    s0 = b * bar
    ch = b % 4
    # piano arpeggio: 6 notes per bar, soft hammer + decay
    for j, m in enumerate(ARP[ch]):
        st = int((s0 + j * step + rng.normal(0, 0.008)) * SR)
        if st >= n:
            break
        ln = min(int(3.2 * SR), n - st)
        tt = np.arange(ln) / SR
        f = midi(m)
        tone = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 3) + 0.1 * np.sin(6 * np.pi * f * tt) * np.exp(-tt * 5)
        vel = 0.75 if j == 0 else 0.5
        piano[st:st + ln] += vel * tone * np.exp(-tt * 1.6) * np.minimum(1, tt / 0.004)
    # string pad: detuned partials, slow swell
    st = int(s0 * SR)
    ln = min(int(bar * SR) + int(0.8 * SR), n - st)
    if ln <= 0:
        continue
    tt = np.arange(ln) / SR
    tone = np.zeros(ln)
    for m in CHORDS[ch]:
        for det in (-0.004, 0.0, 0.005):
            f = midi(m) * (1 + det)
            tone += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt) + 0.12 * np.sin(6 * np.pi * f * tt)
    env = np.minimum(1, tt / 1.2) * np.minimum(1, (ln / SR - tt) / 0.8)
    pad[st:st + ln] += tone * env / 12


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


pad = lowpass(pad, 2200)
piano = lowpass(piano, 5000)

# --- booms on key beats: title card, "I won", "why should you hire me", end card
booms = [act[0] + 6.6, won, act[9] + 0.6, act[10] + 12.1, act[10] + clip[10] / FPS + 0.4]
boom = np.zeros(n)
for bt in booms:
    st = int(bt * SR)
    if st >= n:
        continue
    ln = min(int(3.0 * SR), n - st)
    tt = np.arange(ln) / SR
    f = 30 + 28 * np.exp(-tt * 4)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 1.4)
    hit = rng.standard_normal(ln) * np.exp(-tt * 18) * 0.25
    boom[st:st + ln] += body + hit
boom = lowpass(boom, 900)

# --- simple reverb: convolve with a decaying noise impulse response
ir_len = int(2.6 * SR)
ir = rng.standard_normal(ir_len) * np.exp(-np.arange(ir_len) / SR * 2.4)
ir[0] = 1.0
ir /= np.sqrt((ir ** 2).sum())


def reverb(x, wet=0.35):
    size = 1 << int(np.ceil(np.log2(len(x) + ir_len)))
    y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - wet) * x + wet * y * 3


piano_w = reverb(piano, 0.4)
pad_w = reverb(pad, 0.3)

# piano leads early; strings grow with intensity
mix = (0.55 * piano_w * (0.6 + 0.4 * curve) + 0.6 * pad_w * curve ** 1.3 + 0.18 * drone * curve) * mask + 0.9 * boom

# fade in / out
fi = int(2.0 * SR)
fo = int(4.0 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9

right = np.roll(mix, int(0.009 * SR))
stereo = np.stack([mix, right * 0.97], axis=1)
with wave.open('public/music/score.wav', 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f'score: {T:.1f}s, total frames {total_frames}, act starts (s): {[round(a, 1) for a in act]}')
