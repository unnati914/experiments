"""Original funk groove: syncopated bass, offbeat clav stabs, swung 16th hats, kick/snare with ghost notes, cut hits."""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
HITS = [float(x) for x in sys.argv[2].split(',')] if len(sys.argv) > 2 and sys.argv[2] else []
OUT = sys.argv[3] if len(sys.argv) > 3 else 'public/music/funk.wav'
BPM = 108
beat = 60 / BPM
six = beat / 4
n = int(T * SR)
rng = np.random.default_rng(5)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


def add(buf, start, sig):
    st = int(start * SR)
    if st >= n:
        return
    ln = min(len(sig), n - st)
    buf[st:st + ln] += sig[:ln]


def swing(step):  # 16th-note swing: delay every off-16th a little
    return step * six + (0.18 * six if step % 2 else 0)


drums, bass, clav = np.zeros(n), np.zeros(n), np.zeros(n)
bars = int(T / (4 * beat)) + 1

# one-bar patterns in 16ths (0..15)
KICK = [0, 6, 8, 11]
SNARE = [4, 12]
GHOST = [7, 10, 15]
# bass: (step, midi, length in 16ths)  E minor pentatonic funk line, alternating bars
BASS_A = [(0, 40, 2), (3, 40, 1), (6, 52, 1), (7, 50, 1), (8, 43, 2), (11, 45, 1), (14, 47, 1), (15, 50, 1)]
BASS_B = [(0, 40, 2), (3, 52, 1), (5, 40, 1), (8, 45, 2), (10, 45, 1), (12, 47, 1), (13, 50, 1), (14, 52, 2)]
# clav stabs on offbeats: Em9 then A13 voicings
CHORDS = [[64, 67, 71, 74, 78], [61, 66, 67, 71, 73]]
CLAV_STEPS = [2, 6, 10, 13]

for b in range(bars):
    t0 = b * 4 * beat
    for st in range(16):
        tt = t0 + swing(st)
        # hats
        ln = int(0.05 * SR)
        hat = rng.standard_normal(ln)
        hat = hat - lowpass(hat, 7000)
        add(drums, tt, (0.16 if st % 2 == 0 else 0.1) * hat * np.exp(-np.arange(ln) / SR * 70))
        if st == 14 and b % 2 == 1:  # open hat
            ln2 = int(0.18 * SR)
            oh = rng.standard_normal(ln2)
            oh = oh - lowpass(oh, 6500)
            add(drums, tt, 0.14 * oh * np.exp(-np.arange(ln2) / SR * 14))
        if st in KICK:
            ln = int(0.3 * SR)
            k = np.arange(ln) / SR
            add(drums, tt, 0.95 * np.sin(2 * np.pi * np.cumsum(50 + 90 * np.exp(-k * 35)) / SR) * np.exp(-k * 10))
        if st in SNARE or st in GHOST:
            ln = int(0.18 * SR)
            k = np.arange(ln) / SR
            noise = rng.standard_normal(ln)
            noise = noise - lowpass(noise, 1200)
            body = np.sin(2 * np.pi * 190 * k) * np.exp(-k * 30)
            amp = 0.55 if st in SNARE else 0.12
            add(drums, tt, amp * (noise * np.exp(-k * 20) + 0.6 * body))
    # bass
    for st, m, length in (BASS_A if b % 2 == 0 else BASS_B):
        tt = t0 + swing(st)
        ln = int(length * six * SR * 0.92)
        k = np.arange(ln) / SR
        f = midi(m)
        # slap-ish: bright attack, saw-like harmonics, quick decay
        tone = sum((0.9 / h) * np.sin(2 * np.pi * f * h * k) for h in range(1, 6))
        env = np.minimum(1, k / 0.004) * np.exp(-k * 7)
        pop = 0.5 * np.sin(2 * np.pi * f * 4 * k) * np.exp(-k * 60)
        add(bass, tt, (tone * env + pop) * 0.5)
    # clav
    chord = CHORDS[(b // 2) % 2]
    for st in CLAV_STEPS:
        tt = t0 + swing(st)
        ln = int(0.16 * SR)
        k = np.arange(ln) / SR
        sig = np.zeros(ln)
        for m in chord:
            f = midi(m)
            sig += np.sign(np.sin(2 * np.pi * f * k)) * 0.5 + np.sin(2 * np.pi * f * 2 * k) * 0.3
        add(clav, tt, sig * np.exp(-k * 22) / len(chord))

bass = lowpass(bass, 2500)
clav = lowpass(clav, 4500)

# scene-cut hits: riser into a stab
hits = np.zeros(n)
for h in HITS:
    ln = int(0.5 * SR)
    k = np.arange(ln) / SR
    sweep = rng.standard_normal(ln) * np.linspace(0, 1, ln) ** 2
    add(hits, h - 0.5, 0.18 * (sweep - lowpass(sweep, 3000)))
    ln = int(0.4 * SR)
    k = np.arange(ln) / SR
    stab = sum(np.sin(2 * np.pi * midi(m) * k) for m in (52, 59, 64, 67)) / 4
    add(hits, h, 0.7 * stab * np.exp(-k * 9))

mix = 0.85 * drums + 0.8 * bass + 0.5 * clav + hits
fi, fo = int(0.3 * SR), int(1.5 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.88
stereo = np.stack([mix, np.roll(mix, int(0.006 * SR)) * 0.97], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
