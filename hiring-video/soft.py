"""Original soft launch-video bed: felt-piano chords, marimba arp, light shaker, soft kick, airy pad, gentle swells on cuts."""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = 96
beat = 60 / BPM
bar = 4 * beat
n = int(T * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(21)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


def add(buf, start, sig):
    st = int(start * SR)
    if st >= n or st < 0:
        return
    ln = min(len(sig), n - st)
    buf[st:st + ln] += sig[:ln]


# Dmaj9 - Bm7 - Gmaj7 - A6sus, one bar each
PROG = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 54, 59, 62, 66], [45, 52, 57, 59, 64]]

piano, arp, pad, bass, perc = (np.zeros(n) for _ in range(5))
bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar
    notes = PROG[b % 4]
    # felt piano: chord on 1, softer re-strike on the "and" of 2
    for off, amp in ((0, 0.9), (1.5 * beat, 0.45), (3 * beat, 0.35)):
        ln = int(2.2 * SR)
        k = np.arange(ln) / SR
        sig = np.zeros(ln)
        for j, m in enumerate(notes[1:]):
            f = midi(m)
            sig += (np.sin(2 * np.pi * f * k) + 0.25 * np.sin(4 * np.pi * f * k) * np.exp(-k * 4)) * np.exp(-k * 1.6)
        add(piano, t0 + off, amp * sig * np.minimum(1, k / 0.01) / 4)
    # marimba arp in 8ths
    for st in range(8):
        m = notes[[1, 2, 3, 4, 3, 2, 4, 3][st]] + 12
        ln = int(0.35 * SR)
        k = np.arange(ln) / SR
        f = midi(m)
        add(arp, t0 + st * beat / 2, (np.sin(2 * np.pi * f * k) + 0.2 * np.sin(2 * np.pi * f * 4 * k) * np.exp(-k * 30)) * np.exp(-k * 9) * 0.35)
    # soft bass
    ln = int(bar * SR)
    k = np.arange(ln) / SR
    add(bass, t0, np.sin(2 * np.pi * midi(notes[0] - 12) * k) * np.minimum(1, k / 0.03) * np.exp(-k * 0.9) * 0.5)
    # soft kick on 1 and 3, shaker 8ths, rim on 2 and 4
    for q in range(4):
        tt = t0 + q * beat
        if q in (0, 2):
            ln = int(0.3 * SR)
            k = np.arange(ln) / SR
            add(perc, tt, 0.55 * np.sin(2 * np.pi * np.cumsum(50 + 60 * np.exp(-k * 30)) / SR) * np.exp(-k * 12))
        else:
            ln = int(0.08 * SR)
            k = np.arange(ln) / SR
            add(perc, tt, 0.18 * np.sin(2 * np.pi * 1700 * k) * np.exp(-k * 70))
        for e in (0, 0.5):
            ln = int(0.07 * SR)
            sh = rng.standard_normal(ln)
            sh = sh - lowpass(sh, 6000)
            add(perc, tt + e * beat, (0.07 if e else 0.045) * sh * np.exp(-np.arange(ln) / SR * 45))

# airy pad (whole song), slow swell
for b in range(bars):
    notes = PROG[b % 4]
    a = int(b * bar * SR)
    e = min(n, int((b + 1) * bar * SR) + int(0.5 * SR))
    if a >= n:
        break
    k = np.arange(e - a) / SR
    seg = np.zeros(e - a)
    for m in notes[1:]:
        for d in (-0.003, 0.003):
            seg += np.sin(2 * np.pi * midi(m + 12) * (1 + d) * k)
    env = np.minimum(1, k / 0.8) * np.minimum(1, np.maximum(0, (k[-1] - k)) / 0.5)
    pad[a:e] += seg * env / 8
pad = lowpass(pad, 3000)

# gentle swell + chime into each cut
sw = np.zeros(n)
for h in HITS:
    ln = int(1.0 * SR)
    k = np.arange(ln) / SR
    noise = rng.standard_normal(ln)
    add(sw, h - 1.0, 0.06 * lowpass(noise - lowpass(noise, 1500), 7000) * (k / k[-1]) ** 2)
    ln = int(1.5 * SR)
    k = np.arange(ln) / SR
    add(sw, h, 0.18 * (np.sin(2 * np.pi * midi(86) * k) + 0.5 * np.sin(2 * np.pi * midi(93) * k)) * np.exp(-k * 3))

mix = 0.55 * piano + 0.5 * arp + 0.35 * pad + 0.45 * bass + 0.7 * perc + sw
fi, fo = int(1.0 * SR), int(2.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.85
stereo = np.stack([mix, np.roll(mix, int(0.012 * SR)) * 0.95], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
