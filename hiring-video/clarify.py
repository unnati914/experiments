"""Make a voiceover clearer: high-pass, cut mud (~250 Hz), boost presence (~3 kHz) and air (8 kHz+), tame sibilance,
compress, then loudness-normalise to -16 LUFS with ffmpeg loudnorm.
usage: clarify.py <in.wav> <out.wav> [lufs]"""
import subprocess
import sys
import wave

import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
LUFS = sys.argv[3] if len(sys.argv) > 3 else '-16'
SR = 44100

with wave.open(SRC) as w:
    ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch)[:, 0] / 32768

# zero-phase EQ curve (dB) applied in the frequency domain
X = np.fft.rfft(x)
f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-6


def bell(fc, gain_db, q):
    return gain_db / (1 + ((np.log2(f / fc)) * q * 2) ** 2)


eq_db = (
    -24 * (1 / (1 + (f / 90) ** 4))          # high-pass below ~90 Hz
    + bell(250, -3.5, 0.9)                   # less mud / boxiness
    + bell(3200, 4.0, 0.8)                   # presence: consonants + words
    + bell(6800, -2.0, 1.6)                  # soften harsh 's'
    + 2.5 / (1 + (9000 / f) ** 2)            # gentle air shelf
)
x = np.fft.irfft(X * 10 ** (eq_db / 20), n=len(x)).astype(np.float32)

# compressor (5 ms windows, smooth attack/release)
hop = int(0.005 * SR)
n = len(x) // hop
rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
db = 20 * np.log10(rms)
gdb = -np.maximum(db - (-24), 0) * (1 - 1 / 3.5)
sm = np.copy(gdb)
for i in range(1, n):
    a = 0.45 if gdb[i] < sm[i - 1] else 0.04
    sm[i] = sm[i - 1] + a * (gdb[i] - sm[i - 1])
g = np.repeat(10 ** (sm / 20), hop)
g = np.concatenate([g, np.full(len(x) - len(g), g[-1])])
x = x * g
x = x / (np.max(np.abs(x)) + 1e-9) * 0.9

tmp = OUT + '.tmp.wav'
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp,
                '-af', f'loudnorm=I={LUFS}:TP=-1.0:LRA=7', '-ar', str(SR), '-ac', '2', OUT], check=True)
print('wrote', OUT)
