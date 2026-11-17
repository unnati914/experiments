"""Original bouncy house track: four-on-the-floor kick, offbeat hats, claps, sidechained chord pumps, pluck arp, cut hits."""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = 122
beat = 60 / BPM
n = int(T * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(9)


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


drums = np.zeros(n)
beats = int(T / beat) + 1
for b in range(beats):
    tt = b * beat
    k = np.arange(int(0.35 * SR)) / SR
    add(drums, tt, 1.0 * np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-k * 40)) / SR) * np.exp(-k * 8))
    hl = int(0.12 * SR)
    hat = rng.standard_normal(hl)
    hat = hat - lowpass(hat, 8000)
    add(drums, tt + beat / 2, 0.22 * hat * np.exp(-np.arange(hl) / SR * 30))
    if b % 2 == 1:  # clap on 2 and 4
        cl = int(0.2 * SR)
        kk = np.arange(cl) / SR
        nz = rng.standard_normal(cl)
        nz = lowpass(nz - lowpass(nz, 900), 6000)
        env = sum(np.exp(-np.maximum(kk - d, 0) * 60) * (kk >= d) for d in (0, 0.01, 0.022)) / 3
        add(drums, tt, 0.6 * nz * env)
    for q in (0.25, 0.75):  # quiet 16th shakers
        sl = int(0.04 * SR)
        sh = rng.standard_normal(sl)
        add(drums, tt + q * beat, 0.05 * (sh - lowpass(sh, 9000)) * np.exp(-np.arange(sl) / SR * 90))

# chords: Fmaj7 - Am7 - Dm9 - Bbmaj7, two bars each, sidechain pumped
PROG = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 64, 65], [46, 53, 57, 62]]
chords = np.zeros(n)
bar = 4 * beat
for i in range(int(T / (2 * bar)) + 1):
    notes = PROG[i % 4]
    a = int(i * 2 * bar * SR)
    b = min(n, int((i + 1) * 2 * bar * SR))
    if a >= n:
        break
    tt = np.arange(b - a) / SR
    seg = np.zeros(b - a)
    for m in notes:
        for d in (-0.006, 0, 0.007):
            f = midi(m + 12) * (1 + d)
            seg += 2 * ((f * tt) % 1) - 1  # saw
    chords[a:b] += seg / (len(notes) * 3)
chords = lowpass(chords, 2200)
pump = np.minimum(1, ((t % beat) / beat) * 3.2) ** 1.5
chords *= 0.25 + 0.75 * pump

# pluck arp, 16ths, follows the chord
arp = np.zeros(n)
six = beat / 4
for st in range(int(T / six)):
    tt = st * six
    notes = PROG[int(tt / (2 * bar)) % 4]
    m = notes[[0, 2, 1, 3, 2, 1, 3, 0][st % 8] % len(notes)] + 24
    ln = int(0.18 * SR)
    k = np.arange(ln) / SR
    f = midi(m)
    add(arp, tt, (np.sin(2 * np.pi * f * k) + 0.3 * np.sin(4 * np.pi * f * k)) * np.exp(-k * 18) * 0.5)

# bass: root on offbeats
bass = np.zeros(n)
for b in range(beats):
    tt = b * beat + beat / 2
    root = PROG[int(tt / (2 * bar)) % 4][0] - 12
    ln = int(beat * 0.45 * SR)
    k = np.arange(ln) / SR
    f = midi(root)
    add(bass, tt, (np.sin(2 * np.pi * f * k) + 0.4 * np.sin(4 * np.pi * f * k)) * np.minimum(1, k / 0.005) * np.exp(-k * 5))

hits = np.zeros(n)
for h in HITS:
    ln = int(0.8 * SR)
    sweep = rng.standard_normal(ln) * np.linspace(0, 1, ln) ** 3
    add(hits, h - 0.8, 0.22 * (sweep - lowpass(sweep, 2500)))
    ln = int(0.5 * SR)
    k = np.arange(ln) / SR
    add(hits, h, 0.6 * np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-k * 10)) / SR) * np.exp(-k * 5))

mix = 0.9 * drums + 0.55 * chords + 0.3 * arp + 0.7 * bass + hits
fi, fo = int(0.2 * SR), int(1.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.88
stereo = np.stack([mix, np.roll(mix, int(0.008 * SR)) * 0.96], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
