"""Original underscore for the eval video: low pulse + pad, a hit on FAIL, a chime on PASS, a lift at the end."""
import sys
import wave

import numpy as np

SR = 44100
T = float(sys.argv[1])
FAIL_AT = float(sys.argv[2])
PASS_AT = float(sys.argv[3])
LIFT_AT = float(sys.argv[4])
OUT = sys.argv[5]
n = int(T * SR)
t = np.arange(n) / SR
rng = np.random.default_rng(11)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / (1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, n=len(x))


# pad: Am add9 until the pass, then F major 7 (resolves warmer), detuned partials
def chord(notes, start, end):
    a, b = int(start * SR), int(end * SR)
    tt = np.arange(b - a) / SR
    out = np.zeros(b - a)
    for m in notes:
        for d in (-0.004, 0, 0.005):
            f = midi(m) * (1 + d)
            out += np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)
    env = np.minimum(1, tt / 2.0) * np.minimum(1, (tt[-1] - tt) / 1.5)
    return a, out * env / (len(notes) * 3)

pad = np.zeros(n)
for notes, s, e in [([45, 52, 57, 59, 64], 0, PASS_AT - 0.2), ([41, 48, 53, 57, 64], PASS_AT - 0.6, LIFT_AT + 0.4), ([41, 48, 53, 60, 65, 69], LIFT_AT, T)]:
    a, seg = chord(notes, s, min(e, T))
    pad[a:a + len(seg)] += seg
pad = lowpass(pad, 1600)

# heartbeat-like pulse (two soft thumps), 66 bpm, quieter after the pass
pulse = np.zeros(n)
beat = 60 / 66
k = 0
while k * beat < T - 1:
    for off, amp in ((0, 1.0), (0.22, 0.6)):
        st = int((k * beat + off) * SR)
        ln = min(int(0.3 * SR), n - st)
        tt = np.arange(ln) / SR
        f = 48 + 30 * np.exp(-tt * 25)
        level = 0.55 if k * beat < PASS_AT else 0.3
        pulse[st:st + ln] += level * amp * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 12)
    k += 1

# FAIL hit: sub drop + noise
hit = np.zeros(n)
st = int(FAIL_AT * SR)
ln = min(int(2.5 * SR), n - st)
tt = np.arange(ln) / SR
hit[st:st + ln] += np.sin(2 * np.pi * np.cumsum(32 + 30 * np.exp(-tt * 5)) / SR) * np.exp(-tt * 1.6)
hit[st:st + ln] += 0.2 * rng.standard_normal(ln) * np.exp(-tt * 14)
hit = lowpass(hit, 800)

# PASS chime: bell-like partials
chime = np.zeros(n)
for i, m in enumerate([76, 81, 84]):
    st = int((PASS_AT + i * 0.12) * SR)
    ln = min(int(2.5 * SR), n - st)
    tt = np.arange(ln) / SR
    f = midi(m)
    chime[st:st + ln] += (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3)) * np.exp(-tt * 2.2) * 0.35

mix = 0.7 * pad + pulse + 0.9 * hit + chime
fi, fo = int(1.5 * SR), int(3 * SR)
mix[:fi] *= np.linspace(0, 1, fi)
mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.85
stereo = np.stack([mix, np.roll(mix, int(0.01 * SR)) * 0.97], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype(np.int16).tobytes())
print('wrote', OUT)
