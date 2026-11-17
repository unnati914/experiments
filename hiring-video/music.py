"""Generate an original lo-fi background loop (no samples, no licensing issues)."""
import sys
import wave

import numpy as np

SR = 44100
BPM = 88
SECONDS = float(sys.argv[1]) if len(sys.argv) > 1 else 120.0
OUT = sys.argv[2] if len(sys.argv) > 2 else 'public/music/lofi.wav'

beat = 60 / BPM
bar = 4 * beat
n = int(SECONDS * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(7)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def env(length, attack, release):
    e = np.ones(length)
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r)
    return e


# Am9 - Fmaj7 - Cmaj7 - G6, one bar each
CHORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [48, 55, 59, 64, 67], [55, 59, 62, 64, 69]]
BASS = [45, 41, 48, 43]

pad = np.zeros(n)
bass = np.zeros(n)
bars = int(np.ceil(SECONDS / bar))
for b in range(bars):
    start = int(b * bar * SR)
    length = min(int(bar * SR), n - start)
    if length <= 0:
        break
    tt = np.arange(length) / SR
    chord = CHORDS[b % 4]
    tone = np.zeros(length)
    for m in chord:
        f = midi(m) * (1 + 0.0015 * np.sin(2 * np.pi * 0.3 * tt))  # gentle detune wobble
        tone += np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) + 0.1 * np.sin(6 * np.pi * f * tt)
    pad[start:start + length] += tone * env(length, 0.25, 0.4) / len(chord)
    # bass plucks on beats 1 and 3
    for k in (0, 2):
        s0 = start + int(k * beat * SR)
        ln = min(int(1.6 * beat * SR), n - s0)
        if ln <= 0:
            continue
        tb = np.arange(ln) / SR
        bass[s0:s0 + ln] += np.sin(2 * np.pi * midi(BASS[b % 4]) * tb) * np.exp(-tb * 2.2)

pad = lowpass(pad, 1800)

# drums
drums = np.zeros(n)
beats = int(SECONDS / beat)
for k in range(beats):
    s0 = int(k * beat * SR)
    pos = k % 4
    if pos in (0, 2) or (pos == 3 and (k // 4) % 2 == 1):
        ln = min(int(0.35 * SR), n - s0)
        tk = np.arange(ln) / SR
        freq = 45 + 75 * np.exp(-tk * 30)
        drums[s0:s0 + ln] += 0.9 * np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-tk * 9)
    if pos in (1, 3):
        ln = min(int(0.2 * SR), n - s0)
        ts = np.arange(ln) / SR
        noise = rng.standard_normal(ln)
        noise = noise - lowpass(noise, 900)  # crude high-pass for a snappier snare
        drums[s0:s0 + ln] += 0.35 * noise * np.exp(-ts * 18)
    for h in (0, 0.5):
        s1 = int((k + h) * beat * SR + rng.normal(0, 0.006) * SR)  # slight swing/humanize
        if s1 < 0 or s1 >= n:
            continue
        ln = min(int(0.04 * SR), n - s1)
        hat = rng.standard_normal(ln)
        hat = hat - lowpass(hat, 6000)
        drums[s1:s1 + ln] += (0.12 if h == 0 else 0.08) * hat * np.exp(-np.arange(ln) / SR * 80)

drums = lowpass(drums, 7000)

# sidechain-ish pump on the pad after each kick
pump = np.ones(n)
for k in range(0, beats, 2):
    s0 = int(k * beat * SR)
    ln = min(int(0.3 * SR), n - s0)
    pump[s0:s0 + ln] = 0.55 + 0.45 * np.linspace(0, 1, ln)

crackle = np.zeros(n)
pops = rng.integers(0, n, int(SECONDS * 6))
crackle[pops] = rng.uniform(-0.25, 0.25, len(pops))
crackle = lowpass(crackle, 4000) + 0.004 * lowpass(rng.standard_normal(n), 3000)

mix = 0.55 * pad * pump + 0.45 * bass + 0.6 * drums + crackle
mix = lowpass(mix, 9000)  # warm, slightly muffled lo-fi top end

# fades
fade_in = int(1.5 * SR)
fade_out = int(3.0 * SR)
mix[:fade_in] *= np.linspace(0, 1, fade_in)
mix[-fade_out:] *= np.linspace(1, 0, fade_out)

mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.89  # about -1 dBFS

left = mix
right = np.roll(mix, int(0.012 * SR)) * 0.96  # tiny delay for width
stereo = np.stack([left, right], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print(f'wrote {OUT} ({SECONDS:.1f}s)')
