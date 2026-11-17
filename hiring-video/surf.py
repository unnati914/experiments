"""Original bouncy 'street runner' track: punchy hip-hop drums, claps, round bass, bright steel-drum lead
(original melody), marimba chords, little whistle blips. Upbeat, playful, mobile-game energy.
usage: surf.py <sec> <out.wav> [bpm]"""
import sys, wave
import numpy as np
SR = 44100
T = float(sys.argv[1]); OUT = sys.argv[2]; BPM = float(sys.argv[3]) if len(sys.argv) > 3 else 104
beat = 60 / BPM; n = int(T * SR); rng = np.random.default_rng(7)
mix = np.zeros(n)
def add(t0, sig, g):
    s = int(t0 * SR)
    if s >= n: return
    l = min(len(sig), n - s); mix[s:s + l] += sig[:l] * g
def k(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def kick():
    x = k(0.35); f = 50 + 110 * np.exp(-x * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9)
def snare():
    x = k(0.2); z = rng.standard_normal(len(x)); z -= np.convolve(z, np.ones(5) / 5, 'same')
    return z * np.exp(-x * 22) * 0.8 + np.sin(2 * np.pi * 190 * x) * np.exp(-x * 30) * 0.5
def clap():
    x = k(0.18); z = rng.standard_normal(len(x)); z -= np.convolve(z, np.ones(3) / 3, 'same')
    env = sum(np.exp(-np.maximum(x - d, 0) * 60) * (x >= d) for d in (0, 0.011, 0.022))
    return z * env * 0.5
def hat(o=False):
    x = k(0.15 if o else 0.04); z = rng.standard_normal(len(x)); z -= np.convolve(z, np.ones(3) / 3, 'same')
    return z * np.exp(-x * (25 if o else 120))
def steel(f, d=0.4):  # steel-pan: inharmonic partials, quick decay
    x = k(d); e = np.exp(-x * 7) * np.minimum(1, x / 0.003)
    return (np.sin(2 * np.pi * f * x) + 0.5 * np.sin(2 * np.pi * 2 * f * x) * np.exp(-x * 4)
            + 0.25 * np.sin(2 * np.pi * 3.01 * f * x) * np.exp(-x * 10)) * e
def marimba(f, d=0.5):
    x = k(d); return (np.sin(2 * np.pi * f * x) + 0.2 * np.sin(2 * np.pi * 4 * f * x) * np.exp(-x * 30)) * np.exp(-x * 9)
def bass(f, d):
    x = k(d); s = np.sin(2 * np.pi * f * x); s = np.tanh(2.2 * s)
    return s * np.minimum(1, x / 0.005) * np.minimum(1, (d - x) / 0.03).clip(0, 1) * np.exp(-x * 2)
def blip(f0, f1, d=0.12):
    x = k(d); f = f0 + (f1 - f0) * x / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 14)
# C major-ish: C | Am | F | G
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
BS = [36, 33, 29, 31]
# Original 2-bar motifs (beat offset, midi, len), sixteenth-note bounce.
A = [(0, 72, .5), (.75, 74, .25), (1, 76, .5), (1.5, 79, .5), (2.5, 76, .25), (2.75, 74, .25), (3, 72, .75),
     (4, 69, .5), (4.75, 72, .25), (5, 74, .5), (5.5, 76, .5), (6, 74, .25), (6.25, 72, .25), (6.5, 69, 1)]
B = [(0, 77, .5), (.5, 76, .25), (.75, 74, .25), (1, 72, .5), (2, 72, .25), (2.25, 74, .25), (2.5, 76, .5), (3.5, 79, .5),
     (4, 79, .25), (4.25, 81, .25), (4.5, 79, .5), (5, 76, .5), (5.5, 74, .5), (6, 72, .25), (6.5, 74, .25), (7, 79, .75)]
bar = 4 * beat; bars = int(T / bar) + 1
for b in range(bars):
    t0 = b * bar; c = b % 4
    for i in range(4):
        t = t0 + i * beat
        add(t, kick(), 0.9 if i in (0, 2) else 0)
        if i == 2 and b % 2: add(t + beat * .75, kick(), 0.6)
        if i in (1, 3): add(t, snare(), 0.45); add(t, clap(), 0.5)
        for h in range(4): add(t + h * beat / 4, hat(h == 2 and i == 3), 0.12 if h % 2 else 0.18)
    for i, off in enumerate([0, 1.5, 2.5, 3]):  # bouncy bass
        add(t0 + off * beat, bass(midi(BS[c] + (12 if i == 2 else 0)), beat * 0.45), 0.32)
    for j, m in enumerate(CH[c]):
        for off in (0.5, 2.5): add(t0 + off * beat + j * 0.012, marimba(midi(m)), 0.08)
    if b >= 2:  # lead enters after two bars
        ph = A if (b // 2) % 2 == 0 else B
        half = (b % 2) * 4
        for off, m, ln in ph:
            if half <= off < half + 4: add(t0 + (off - half) * beat, steel(midi(m), max(.25, ln * beat * 1.4)), 0.2)
    if b % 4 == 3: add(t0 + 3.5 * beat, blip(900, 1800), 0.08); add(t0 + 3.75 * beat, blip(1800, 2400), 0.06)
X = np.fft.rfft(mix); fr = np.fft.rfftfreq(n, 1 / SR); X *= 1 / (1 + (fr / 9000) ** 4); mix = np.fft.irfft(X, n)
mix[:int(0.2 * SR)] *= np.linspace(0, 1, int(0.2 * SR)); f = int(1.2 * SR); mix[-f:] *= np.linspace(1, 0, f)
mix = mix / np.abs(mix).max() * 0.85
st = np.stack([mix, np.roll(mix, int(0.003 * SR)) * 0.97], 1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
