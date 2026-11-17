"""Make a voiceover sound like it was spoken into a broadcast / podcast mic.
Close-mic warmth, cleaner mids, presence + air, de-essed, firm "radio" compression, light tape-style saturation,
a very short booth reflection, then -16 LUFS with ffmpeg loudnorm.
usage: mic.py <in.wav> <out.wav> [lufs=-16] [room=0.06]"""
import subprocess
import sys
import wave

import numpy as np

SRC, OUT = sys.argv[1], sys.argv[2]
LUFS = sys.argv[3] if len(sys.argv) > 3 else '-16'
ROOM = float(sys.argv[4]) if len(sys.argv) > 4 else 0.06

with wave.open(SRC) as w:
    SR, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch).mean(axis=1) / 32768

# 1) EQ (zero-phase, frequency domain)
X = np.fft.rfft(x)
f = np.fft.rfftfreq(len(x), 1 / SR) + 1e-6
bell = lambda fc, g, q: g / (1 + (np.log2(f / fc) * q * 2) ** 2)
eq_db = (
    -30 / (1 + (f / 75) ** 4)                 # high-pass ~75 Hz (no rumble)
    + 3.5 / (1 + (f / 160) ** 2)             # proximity warmth: the "close to the mic" low end
    + bell(380, -2.5, 1.0)                   # clear the mud
    + bell(3000, 3.5, 0.7)                   # presence
    + bell(7000, -1.5, 1.8)                  # tame harshness before the de-esser
    + 2.5 / (1 + (10000 / f) ** 2)           # air
)
x = np.fft.irfft(X * 10 ** (eq_db / 20), n=len(x)).astype(np.float32)

# 2) de-esser: compress only the 5-9 kHz band when it spikes
S = np.fft.rfft(x)
band = (f > 5000) & (f < 9000)
sib = np.fft.irfft(S * band, n=len(x)).astype(np.float32)
rest = x - sib
hop = int(0.003 * SR)
n = len(x) // hop
env = np.sqrt((sib[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9
thr = np.percentile(env, 85)
g = np.minimum(1, (thr / env) ** 0.6)
g = np.convolve(g, np.ones(5) / 5, 'same')
g = np.concatenate([np.repeat(g, hop), np.full(len(x) - n * hop, g[-1] if n else 1)])
x = rest + sib * g

# 3) radio compressor: 4:1 above -26 dBFS, fast attack, medium release
hop = int(0.005 * SR)
n = len(x) // hop
rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9
db = 20 * np.log10(rms)
gdb = -np.maximum(db - (-26), 0) * (1 - 1 / 4)
sm = np.copy(gdb)
for i in range(1, n):
    a = 0.6 if gdb[i] < sm[i - 1] else 0.06
    sm[i] = sm[i - 1] + a * (gdb[i] - sm[i - 1])
gain = np.repeat(10 ** (sm / 20), hop)
x = x * np.concatenate([gain, np.full(len(x) - len(gain), gain[-1] if len(gain) else 1)])

# 4) light saturation (adds harmonics, the "mic preamp" glue)
x = x / (np.max(np.abs(x)) + 1e-9) * 0.7
x = np.tanh(1.6 * x) / np.tanh(1.6)

# 5) tiny booth: a few very early reflections, no audible echo
if ROOM > 0:
    wet = np.zeros_like(x)
    for d_ms, gdb_r in [(7, -20), (11, -23), (17, -26), (23, -30)]:
        d = int(d_ms / 1000 * SR)
        wet[d:] += x[:-d] * 10 ** (gdb_r / 20)
    lp = np.fft.irfft(np.fft.rfft(wet) / (1 + (f / 5000) ** 2), n=len(x)).astype(np.float32)
    x = x + lp * (ROOM / 0.06)

x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
tmp = OUT + '.tmp.wav'
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes())
subprocess.run(['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp,
                '-af', f'loudnorm=I={LUFS}:TP=-1.5:LRA=7', '-ar', '48000', '-ac', '2', OUT], check=True)
print('wrote', OUT)
