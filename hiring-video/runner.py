"""Original bouncy 'endless-runner' style track: lead (whistle | kazoo | steel), staccato octave bass, punchy drums, claps, fx on cuts.
usage: runner.py <sec> <hits> <out.wav> [bpm] [transpose] [lead] [fx: coin | slide | boing]"""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3]
BPM = float(sys.argv[4]) if len(sys.argv) > 4 else 120
TRANS = int(sys.argv[5]) if len(sys.argv) > 5 else 0
LEAD = sys.argv[6] if len(sys.argv) > 6 else 'whistle'
FX = sys.argv[7] if len(sys.argv) > 7 else 'coin'
SEED = int(sys.argv[8]) if len(sys.argv) > 8 else 0  # 0 = the original hand-written melody, else a generated one
beat = 60 / BPM
six = beat / 4
bar = 4 * beat
n = int(T * SR)
rng = np.random.default_rng(42)


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


def square(f, k, duty=0.5):
    return np.where((f * k) % 1 < duty, 1.0, -1.0)


# G major, I - V - vi - IV  (G D Em C), one bar each
ROOTS = [r + TRANS for r in [43, 38, 40, 36]]
# original 2-bar lead phrases in 16ths: (step, midi, len16) ; None-free, alternating A/B
LEAD_A = [(0, 79, 2), (2, 79, 1), (3, 81, 1), (4, 83, 2), (6, 81, 2), (8, 79, 1), (10, 76, 2), (12, 74, 2), (14, 76, 2),
          (16, 78, 2), (18, 78, 1), (19, 79, 1), (20, 81, 3), (24, 79, 2), (26, 78, 2), (28, 74, 4)]
LEAD_B = [(0, 76, 2), (2, 79, 2), (4, 83, 1), (5, 84, 1), (6, 83, 2), (8, 81, 2), (10, 79, 2), (12, 76, 1), (13, 79, 1), (14, 81, 2),
          (16, 79, 2), (18, 76, 2), (20, 72, 2), (22, 74, 2), (24, 76, 2), (26, 74, 1), (27, 72, 1), (28, 71, 4)]

if SEED:  # generate fresh two-bar phrases from the G major pentatonic, rhythm-first so they stay bouncy
    mrng = np.random.default_rng(SEED)
    SCALE = [67, 69, 71, 74, 76, 79, 81, 83, 86]

    def phrase():
        out, st, idx = [], 0, int(mrng.integers(2, 6))
        while st < 32:
            l16 = int(mrng.choice([1, 1, 2, 2, 2, 3, 4]))
            if st + l16 > 32:
                l16 = 32 - st
            idx = int(np.clip(idx + mrng.choice([-2, -1, -1, 1, 1, 2, 0]), 0, len(SCALE) - 1))
            if mrng.random() > 0.15 or st == 0:
                out.append((st, SCALE[idx], l16))
            st += l16
        return out
    LEAD_A, LEAD_B = phrase(), phrase()

drums, bass, lead, chords, fx = (np.zeros(n) for _ in range(5))
bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar
    root = ROOTS[b % 4]
    for st in range(16):
        tt = t0 + st * six
        if st in (0, 6, 8, 10):  # kick, bouncy
            ln = int(0.25 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.95 * np.sin(2 * np.pi * np.cumsum(55 + 120 * np.exp(-k * 45)) / SR) * np.exp(-k * 11))
        if st in (4, 12):  # snare + clap
            ln = int(0.2 * SR)
            k = np.arange(ln) / SR
            nz = rng.standard_normal(ln)
            nz = nz - lowpass(nz, 1500)
            add(drums, tt, 0.5 * nz * np.exp(-k * 18) + 0.35 * np.sin(2 * np.pi * 200 * k) * np.exp(-k * 25))
        if st % 2 == 0:  # hats
            ln = int(0.04 * SR)
            h = rng.standard_normal(ln)
            h = h - lowpass(h, 8000)
            add(drums, tt + (0.0 if st % 4 == 0 else 0.0), (0.14 if st % 4 == 2 else 0.08) * h * np.exp(-np.arange(ln) / SR * 80))
        # staccato octave bass on 8ths
        if st % 2 == 0:
            m = root + (12 if st % 4 == 2 else 0)
            ln = int(six * 1.6 * SR)
            k = np.arange(ln) / SR
            sig = square(midi(m), k, 0.35) * np.exp(-k * 14)
            add(bass, tt, 0.4 * sig)
    # chord stabs on offbeats (major triad above root)
    for st in (2, 6, 10, 14):
        ln = int(0.12 * SR)
        k = np.arange(ln) / SR
        sig = sum(square(midi(root + 24 + iv), k, 0.25) for iv in ((0, 4, 7) if b % 4 != 2 else (0, 3, 7))) / 3
        add(chords, t0 + st * six, sig * np.exp(-k * 25))
    # lead: whistly square + slight vibrato, two-bar phrases
    if b % 2 == 0:
        phrase = LEAD_A if (b // 2) % 2 == 0 else LEAD_B
        for st, m, l16 in phrase:
            ln = int(l16 * six * SR * 0.9)
            k = np.arange(ln) / SR
            m += TRANS
            vib = 0.02 if LEAD == 'kazoo' else 0.006
            f = midi(m) * (1 + vib * np.sin(2 * np.pi * (7 if LEAD == 'kazoo' else 6) * k) * np.minimum(1, k / 0.1))
            ph = np.cumsum(f) / SR
            if LEAD == 'kazoo':  # buzzy saw + nasal harmonics: goofy
                sig = (2 * (ph % 1) - 1) * 0.6 + 0.4 * np.sin(2 * np.pi * 3 * ph) + 0.3 * np.sin(2 * np.pi * 5 * ph)
                env = np.minimum(1, k / 0.02) * np.minimum(1, (k[-1] - k) / 0.03 + 0.001)
            elif LEAD == 'brass':  # punchy synth brass: saw stack with a bright attack
                sig = sum((2 * ((ph * r) % 1) - 1) / (1 + j) for j, r in enumerate((1, 1.003, 2)))
                env = np.minimum(1, k / 0.015) * (0.7 + 0.3 * np.exp(-k * 10)) * np.minimum(1, (k[-1] - k) / 0.03 + 0.001)
            elif LEAD == 'steel':  # steel-drum: inharmonic partials, fast decay
                sig = np.sin(2 * np.pi * ph) + 0.5 * np.sin(2 * np.pi * 2.0 * ph) + 0.35 * np.sin(2 * np.pi * 3.01 * ph) * np.exp(-k * 8)
                env = np.minimum(1, k / 0.002) * np.exp(-k * 5)
            else:
                sig = np.where(ph % 1 < 0.5, 1.0, -1.0) * 0.5 + np.sin(2 * np.pi * ph) * 0.5
                env = np.minimum(1, k / 0.006) * np.minimum(1, (k[-1] - k) / 0.02 + 0.001) * (0.8 + 0.2 * np.exp(-k * 6))
            add(lead, t0 + st * six, sig * env * 0.32)

bass = lowpass(bass, 1600)
chords = lowpass(chords, 3500)
lead = lowpass(lead, 5000)

for h in HITS:
    if FX == 'slide':  # slide whistle up
        ln = int(0.45 * SR)
        k = np.arange(ln) / SR
        f = midi(72) * 2 ** (2 * k / k[-1])
        add(fx, h - 0.3, 0.3 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, k / 0.03) * np.minimum(1, (k[-1] - k) / 0.05))
    elif FX == 'boing':  # cartoon boing: pitch wobble down
        ln = int(0.5 * SR)
        k = np.arange(ln) / SR
        f = 220 * (1 + 0.5 * np.exp(-k * 6) * np.sin(2 * np.pi * 18 * k)) * (1.6 - 0.6 * k / k[-1])
        add(fx, h, 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-k * 5))
    else:  # coin blip: two quick rising square notes
        for j, m in enumerate((88, 95)):
            ln = int(0.12 * SR) if j == 0 else int(0.35 * SR)
            k = np.arange(ln) / SR
            add(fx, h + j * 0.07, 0.25 * square(midi(m), k) * np.exp(-k * (30 if j == 0 else 8)))
fx = lowpass(fx, 6000)

mix = 0.85 * drums + 0.75 * bass + 0.35 * chords + 0.6 * lead + fx
fi, fo = int(0.1 * SR), int(1.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.88
stereo = np.stack([mix, np.roll(mix, int(0.007 * SR)) * 0.96], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
