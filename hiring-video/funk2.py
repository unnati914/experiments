"""Original produced funk: swung drums w/ ghost notes, slap bass w/ octave pops + slides, Rhodes-style e-piano,
brass stabs, wah-guitar scratches, echo + glue compression, riser/stab on cuts.
usage: funk2.py <sec> <hits> <out.wav> [bpm] [transpose] [seed]"""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = float(sys.argv[4]) if len(sys.argv) > 4 else 112
TR = int(sys.argv[5]) if len(sys.argv) > 5 else 0
SEED = int(sys.argv[6]) if len(sys.argv) > 6 else 1
beat = 60 / BPM
six = beat / 4
bar = 4 * beat
n = int(T * SR)
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


def sw(step):  # swing: delay off-16ths
    return step * six + (0.16 * six if step % 2 else 0)


# Em9 | A13 | Cmaj9 | B7#9  (2 bars each) -> classic funk minor vamp with a turnaround
CHORDS = [[52, 59, 62, 66, 67], [57, 61, 66, 67, 71], [48, 55, 59, 62, 64], [47, 54, 57, 62, 63]]
ROOTS = [40, 45, 36, 35]

# slap bass: a few hand-picked rhythmic cells, chosen per bar by seed; (step, interval, len16, kind) kind: t=thumb, p=pop, g=ghost
CELLS = [
    [(0, 0, 2, 't'), (3, 12, 1, 'p'), (4, 0, 1, 'g'), (6, 0, 1, 't'), (7, 12, 1, 'p'), (10, 7, 1, 't'), (11, 10, 1, 'p'), (14, 12, 2, 'p')],
    [(0, 0, 1, 't'), (2, 0, 1, 'g'), (3, 0, 1, 't'), (4, 12, 1, 'p'), (8, 0, 2, 't'), (11, 3, 1, 't'), (12, 5, 1, 't'), (13, 7, 2, 'p')],
    [(0, 0, 3, 't'), (3, 12, 1, 'p'), (6, 10, 1, 'p'), (7, 7, 1, 't'), (8, 0, 1, 't'), (9, 0, 1, 'g'), (10, 12, 1, 'p'), (12, 7, 1, 't'), (14, 10, 2, 'p')],
]
cell_order = [int(rng.integers(0, len(CELLS))) for _ in range(4)]
# brass riff: original hits on the 'and's, from the chord tones, decided by seed
brass_steps = sorted(set([2, 6] + [int(x) for x in rng.choice([10, 11, 13, 14, 15], size=2, replace=False)]))

drums, bass, keys, brass, gtr, fx = (np.zeros(n) for _ in range(6))
bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar
    ci = (b // 2) % 4
    chord, root = CHORDS[ci], ROOTS[ci]
    # drums
    for st in range(16):
        tt = t0 + sw(st)
        if st in (0, 7, 10) or (st == 15 and b % 2):
            ln = int(0.3 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.95 * np.sin(2 * np.pi * np.cumsum(48 + 100 * np.exp(-k * 38)) / SR) * np.exp(-k * 9))
        if st in (4, 12):
            ln = int(0.22 * SR)
            k = np.arange(ln) / SR
            nz = bandpass(rng.standard_normal(ln), 1500, 9000)
            add(drums, tt, 0.6 * nz * np.exp(-k * 19) + 0.45 * np.sin(2 * np.pi * 185 * k) * np.exp(-k * 28))
        if st in (3, 6, 9, 14):  # ghost snares
            ln = int(0.08 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.1 * bandpass(rng.standard_normal(ln), 1500, 8000) * np.exp(-k * 45))
        ln = int(0.045 * SR)
        h = bandpass(rng.standard_normal(ln), 7000, 15000)
        add(drums, tt, (0.2 if st % 4 == 2 else 0.11) * h * np.exp(-np.arange(ln) / SR * 75))
        if st == 14 and b % 2 == 0:
            ln = int(0.25 * SR)
            add(drums, tt, 0.13 * bandpass(rng.standard_normal(ln), 6000, 15000) * np.exp(-np.arange(ln) / SR * 11))
    # slap bass
    for st, iv, l16, kind in CELLS[cell_order[ci]]:
        tt = t0 + sw(st)
        ln = int(l16 * six * SR * 0.9)
        k = np.arange(ln) / SR
        f = midi(root + iv)
        if kind == 'g':
            add(bass, tt, 0.25 * bandpass(rng.standard_normal(ln), 80, 600) * np.exp(-k * 60))
            continue
        slide = 1 + (0.06 * np.exp(-k * 40) if kind == 'p' else -0.03 * np.exp(-k * 50))
        ph = np.cumsum(f * slide) / SR
        tone = sum((1 / h) * np.sin(2 * np.pi * h * ph) for h in range(1, 7))
        bright = 0.6 * np.sin(2 * np.pi * 5 * ph) * np.exp(-k * (45 if kind == 'p' else 70))
        env = np.minimum(1, k / 0.003) * np.exp(-k * (6 if kind == 't' else 9)) * np.minimum(1, (k[-1] - k) / 0.01 + 1e-3)
        add(bass, tt, (tone + bright) * env * (0.5 if kind == 't' else 0.42))
    # e-piano: stabs on the 'and' of 2 and on 4 (FM-ish bell + tine, tremolo)
    for st, amp in ((6, 0.8), (12, 0.55), (15, 0.35) if b % 2 else (13, 0.4)):
        tt = t0 + sw(st)
        ln = int(0.9 * SR)
        k = np.arange(ln) / SR
        sig = np.zeros(ln)
        for m in chord[1:]:
            fc = midi(m + 12)
            sig += np.sin(2 * np.pi * fc * k + 1.6 * np.exp(-k * 7) * np.sin(2 * np.pi * fc * k))
        trem = 1 + 0.25 * np.sin(2 * np.pi * 5.5 * k)
        add(keys, tt, amp * sig * trem * np.exp(-k * 3.2) * np.minimum(1, k / 0.004) / 4)
    # brass stabs every other bar
    if b % 2 == 1:
        for st in brass_steps:
            tt = t0 + sw(st)
            ln = int(0.17 * SR)
            k = np.arange(ln) / SR
            sig = np.zeros(ln)
            for m in chord[2:]:
                for d in (0.997, 1.0, 1.004):
                    sig += 2 * ((midi(m + 12) * d * k) % 1) - 1
            env = np.minimum(1, k / 0.01) * np.exp(-k * 9)
            add(brass, tt, sig * env / 9)
    # wah guitar: muted scratches on 16ths with a sweeping band
    for st in range(16):
        if st % 4 in (1, 3) or (st % 8 == 2):
            tt = t0 + sw(st)
            ln = int(0.07 * SR)
            k = np.arange(ln) / SR
            centre = 700 + 1300 * (0.5 + 0.5 * np.sin(2 * np.pi * (b * 16 + st) / 8))
            nz = bandpass(rng.standard_normal(ln), centre * 0.7, centre * 1.4)
            add(gtr, tt, (0.33 if st % 4 == 3 else 0.2) * nz * np.exp(-k * 55))

bass = lowpass(bass, 2600)
keys = lowpass(keys, 5000)
brass = lowpass(brass, 3800)

for h in HITS:
    ln = int(0.6 * SR)
    k = np.arange(ln) / SR
    add(fx, h - 0.6, 0.16 * bandpass(rng.standard_normal(ln), 1500, 11000) * (k / k[-1]) ** 2.5)
    ln = int(0.5 * SR)
    k = np.arange(ln) / SR
    st = np.zeros(ln)
    for m in CHORDS[0][1:]:
        for d in (0.996, 1.004):
            st += 2 * ((midi(m + 12) * d * k) % 1) - 1
    add(fx, h, 0.5 * lowpass(st, 4000) / 8 * np.exp(-k * 6))

mix = 0.9 * drums + 0.85 * bass + 0.42 * keys + 0.5 * brass + 0.38 * gtr + fx
# echo on keys/brass/fx bus (dotted 8th), then glue compression
bus = 0.42 * keys + 0.5 * brass + fx
d = int(0.75 * beat * SR)
echo = np.zeros(n)
for i in range(1, 4):
    echo[d * i:] += bus[:-d * i] * (0.3 ** i)
mix += lowpass(echo, 3500)
fi, fo = int(0.1 * SR), int(1.8 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(1.5 * mix / (np.max(np.abs(mix)) + 1e-9))
mix *= 0.9 / np.max(np.abs(mix))
stereo = np.stack([mix + 0.08 * np.roll(gtr, 200), np.roll(mix, int(0.006 * SR)) * 0.97 + 0.08 * brass], axis=1)
stereo /= np.max(np.abs(stereo)) / 0.9
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
