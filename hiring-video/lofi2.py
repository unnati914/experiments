"""Original lo-fi hip-hop bed: dusty swung boom-bap, jazzy Rhodes (ii-V-I-VI), round bass, soft piano motif,
vinyl crackle + hiss, tape wow, low-passed master. Soft 'page turn' swell on cuts.
usage: lofi2.py <sec> <hits> <out.wav> [bpm] [transpose] [seed]"""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = float(sys.argv[4]) if len(sys.argv) > 4 else 80
TR = int(sys.argv[5]) if len(sys.argv) > 5 else 0
SEED = int(sys.argv[6]) if len(sys.argv) > 6 else 1
SYNTH = len(sys.argv) > 7 and sys.argv[7] == 'synth'  # dreamy synthwave-lofi: saw pad + arp instead of Rhodes
beat = 60 / BPM
six = beat / 4
bar = 4 * beat
n = int(T * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(SEED)


def midi(m):
    return 440.0 * 2 ** ((m + TR - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


def bandpass(x, lo, hi):
    return lowpass(x, hi) - lowpass(x, lo)


def add(buf, start, sig):
    st = int(start * SR)
    if st >= n or st < 0:
        return
    ln = min(len(sig), n - st)
    buf[st:st + ln] += sig[:ln]


def sw(step):  # heavy lazy swing
    return step * six + (0.28 * six if step % 2 else 0) + rng.normal(0, 0.004)


# Dm9 - G13 - Cmaj9 - A7b9, one bar each
CHORDS = [[50, 53, 57, 60, 64], [43, 53, 57, 59, 64], [48, 52, 55, 59, 62], [45, 49, 55, 58, 61]]
ROOTS = [38, 31, 36, 33]
# soft piano motif (original), 2 bars, (step, midi), repeats every 4 bars with variation
MOTIF = [(2, 76), (5, 74), (7, 72), (10, 69), (16, 72), (19, 71), (22, 67), (26, 69)]

drums, keys, bass, piano, fx = (np.zeros(n) for _ in range(5))
bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar
    chord, root = CHORDS[b % 4], ROOTS[b % 4]
    for st in range(16):
        tt = t0 + sw(st)
        if st in (0, 10) or (st == 7 and b % 2):
            ln = int(0.35 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.8 * np.sin(2 * np.pi * np.cumsum(45 + 70 * np.exp(-k * 30)) / SR) * np.exp(-k * 9))
        if st in (4, 12):  # dusty snare / rim
            ln = int(0.25 * SR)
            k = np.arange(ln) / SR
            nz = bandpass(rng.standard_normal(ln), 900, 5000)
            add(drums, tt, 0.42 * nz * np.exp(-k * 16) + 0.25 * np.sin(2 * np.pi * 210 * k) * np.exp(-k * 30))
        if st % 2 == 0 or rng.random() < 0.3:
            ln = int(0.05 * SR)
            h = bandpass(rng.standard_normal(ln), 6000, 12000)
            add(drums, tt, (0.11 if st % 4 == 2 else 0.06) * h * np.exp(-np.arange(ln) / SR * 70))
    if SYNTH:  # soft detuned saw pad held for the bar + gentle 8th-note arp
        ln = int(bar * SR * 1.05)
        k = np.arange(ln) / SR
        pad = np.zeros(ln)
        for m in chord[1:]:
            for d in (0.994, 1.0, 1.006):
                pad += 2 * ((midi(m) * d * k) % 1) - 1
        env = np.minimum(1, k / 0.35) * np.minimum(1, (k[-1] - k) / 0.3 + 1e-3)
        add(keys, t0, lowpass(pad * env, 1400) / 9)
        for st in range(0, 16, 2):
            m = chord[1 + (st // 2) % 4] + 12
            ln = int(0.4 * SR)
            k = np.arange(ln) / SR
            add(piano, t0 + sw(st), np.sin(2 * np.pi * midi(m) * k) * np.exp(-k * 7) * 0.22)
    # Rhodes: warm chord, slightly late, long decay with tremolo
    for st, amp in (() if SYNTH else ((0, 0.9), (11, 0.45))):
        tt = t0 + sw(st) + 0.02
        ln = int((bar if st == 0 else bar * 0.4) * SR)
        k = np.arange(ln) / SR
        sig = np.zeros(ln)
        for m in chord[1:]:
            fc = midi(m)
            sig += np.sin(2 * np.pi * fc * k + 0.9 * np.exp(-k * 5) * np.sin(2 * np.pi * fc * k)) + 0.15 * np.sin(2 * np.pi * 2 * fc * k) * np.exp(-k * 3)
        trem = 1 + 0.18 * np.sin(2 * np.pi * 4.2 * k)
        add(keys, tt, amp * sig * trem * np.exp(-k * 0.9) * np.minimum(1, k / 0.01) / 5)
    # round bass: root on 1, fifth/approach note later
    for st, iv, l16 in ((0, 0, 6), (7, 7, 2), (10, 0, 4), (14, -1 if b % 4 == 3 else 2, 2)):
        tt = t0 + sw(st)
        ln = int(l16 * six * SR)
        k = np.arange(ln) / SR
        f = midi(root + iv)
        add(bass, tt, (np.sin(2 * np.pi * f * k) + 0.25 * np.sin(4 * np.pi * f * k)) * np.minimum(1, k / 0.01) * np.exp(-k * 2.5) * 0.55)
    # piano motif every other pair of bars
    if not SYNTH and (b // 2) % 2 == 1 and b % 2 == 0:
        for st, m in MOTIF:
            tt = t0 + sw(st % 16) + (bar if st >= 16 else 0)
            ln = int(1.4 * SR)
            k = np.arange(ln) / SR
            fc = midi(m + (2 if b % 8 == 6 and st > 20 else 0))
            add(piano, tt, (np.sin(2 * np.pi * fc * k) + 0.3 * np.sin(4 * np.pi * fc * k) * np.exp(-k * 6)) * np.exp(-k * 2.4) * 0.3)

# vinyl: crackle pops + hiss
vinyl = 0.006 * bandpass(rng.standard_normal(n), 3000, 9000)
for p in rng.choice(n, size=int(T * 9), replace=False):
    ln = int(0.002 * SR)
    vinyl[p:p + ln] += rng.choice([-1, 1]) * 0.12 * np.exp(-np.arange(min(ln, n - p)) / (0.0004 * SR))

for h in HITS:  # soft swell (like a page turning)
    ln = int(0.8 * SR)
    k = np.arange(ln) / SR
    add(fx, h - 0.6, 0.05 * bandpass(rng.standard_normal(ln), 1500, 6000) * np.sin(np.pi * k / k[-1]) ** 2)

mix = 0.8 * drums + 0.65 * keys + 0.6 * bass + 0.45 * piano + fx
# tape wow: slow pitch wobble via resampled time warp
warp = t + 0.0018 * np.sin(2 * np.pi * 0.55 * t) + 0.0006 * np.sin(2 * np.pi * 2.3 * t)
mix = np.interp(warp, t, mix)
mix = lowpass(mix, 3600) + vinyl
fi, fo = int(1.2 * SR), int(2.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(1.2 * mix / (np.max(np.abs(mix)) + 1e-9))
mix *= 0.85 / np.max(np.abs(mix))
stereo = np.stack([mix, np.roll(mix, int(0.011 * SR)) * 0.96], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
