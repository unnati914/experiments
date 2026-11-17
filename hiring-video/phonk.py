"""Original Brazilian-phonk style track: 3-3-2 tamborzao kicks, claps + rims, distorted gliding 808, pitched cowbell riff, impacts on cuts.
usage: phonk.py <sec> <hits> <out.wav> [bpm] [root_midi] [seed]"""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = float(sys.argv[4]) if len(sys.argv) > 4 else 130
ROOT = int(sys.argv[5]) if len(sys.argv) > 5 else 42  # F#2
SEED = int(sys.argv[6]) if len(sys.argv) > 6 else 1
beat = 60 / BPM
six = beat / 4
bar = 4 * beat
n = int(T * SR)
rng = np.random.default_rng(SEED)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


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


# minor-key progression (i - VI - VII - v) as semitone offsets from ROOT
PROG = [0, -4, -2, -5]
KICKS = [0, 3, 6, 8, 11, 14]  # 3-3-2 + 3-3-2
CLAPS = [4, 12]
RIMS = [7, 10, 15]

# cowbell riff: original, generated from the minor pentatonic, 2 bars of 16ths, syncopated
PENT = [0, 3, 5, 7, 10, 12, 15]
riff = []
st = 0
idx = 3
while st < 32:
    l16 = int(rng.choice([1, 2, 2, 3]))
    idx = int(np.clip(idx + rng.choice([-2, -1, 1, 2, 0]), 0, len(PENT) - 1))
    if rng.random() > 0.2 or st % 8 == 0:
        riff.append((st, PENT[idx]))
    st += l16

drums, bass, bell, fx = (np.zeros(n) for _ in range(4))
bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar
    off = PROG[(b // 2) % 4]
    for st in range(16):
        tt = t0 + st * six
        if st in KICKS:
            ln = int(0.18 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.8 * np.sin(2 * np.pi * np.cumsum(60 + 140 * np.exp(-k * 50)) / SR) * np.exp(-k * 22))
            # 808 under every kick: long, distorted, slight downward glide on the last kick of the bar
            ln = int((6 if st != 14 else 2) * six * SR * 0.95)
            k = np.arange(ln) / SR
            f0 = midi(ROOT + off + (12 if st in (6, 14) else 0) - 12)
            glide = 1 - (0.25 * (k / k[-1]) if st == 14 else 0)
            sig = np.tanh(3.0 * np.sin(2 * np.pi * np.cumsum(f0 * glide) / SR)) * np.minimum(1, k / 0.004) * np.exp(-k * 2.2)
            add(bass, tt, 0.6 * sig)
        if st in CLAPS:
            ln = int(0.2 * SR)
            k = np.arange(ln) / SR
            nz = bandpass(rng.standard_normal(ln), 800, 7000)
            env = sum(np.exp(-np.maximum(k - d, 0) * 50) * (k >= d) for d in (0, 0.008, 0.018)) / 3
            add(drums, tt, 0.75 * nz * env)
        if st in RIMS:
            ln = int(0.05 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.22 * np.sin(2 * np.pi * 1800 * k) * np.exp(-k * 90))
        if st % 2 == 0:
            ln = int(0.03 * SR)
            h = rng.standard_normal(ln)
            add(drums, tt, 0.07 * (h - lowpass(h, 9000)) * np.exp(-np.arange(ln) / SR * 120))
    # cowbell riff over every 2 bars (808-style: two detuned squares, bandpassed, short)
    if b % 2 == 0:
        for st, iv in riff:
            ln = int(0.22 * SR)
            k = np.arange(ln) / SR
            base = midi(ROOT + off + 36 + iv)
            sq = np.sign(np.sin(2 * np.pi * base * k)) + np.sign(np.sin(2 * np.pi * base * 1.48 * k))
            add(bell, t0 + st * six, sq * np.exp(-k * 14) * 0.5)

bell = bandpass(bell, 400, 5000)
bass = lowpass(bass, 900)

for h in HITS:  # reverse-cymbal riser into an 808 impact
    ln = int(0.7 * SR)
    k = np.arange(ln) / SR
    add(fx, h - 0.7, 0.16 * bandpass(rng.standard_normal(ln), 2000, 12000) * (k / k[-1]) ** 3)
    ln = int(0.9 * SR)
    k = np.arange(ln) / SR
    add(fx, h, 0.7 * np.tanh(2 * np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-k * 8)) / SR)) * np.exp(-k * 3.5))

mix = 0.9 * drums + 0.8 * bass + 0.42 * bell + fx
fi, fo = int(0.1 * SR), int(1.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(1.3 * mix / (np.max(np.abs(mix)) + 1e-9))
mix *= 0.9 / np.max(np.abs(mix))
stereo = np.stack([mix, np.roll(mix, int(0.006 * SR)) * 0.96], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
