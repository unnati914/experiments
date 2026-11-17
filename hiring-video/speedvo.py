"""Speed up a cleaned voiceover: shorten long pauses, then time-stretch (pitch kept) with ffmpeg atempo.
Prints how original timestamps map to new ones so the video beats can be re-synced.
usage: speedvo.py <in.wav> <out.wav> <tempo> <anchor seconds comma-separated> [cuts "a-b;c-d"] [max_gap] [keep]"""
import json
import subprocess
import sys
import wave

import numpy as np

SRC, OUT, TEMPO = sys.argv[1], sys.argv[2], float(sys.argv[3])
ANCHORS = [float(x) for x in sys.argv[4].split(',')]
SR = 44100
CUTS = [tuple(map(float, c.split('-'))) for c in sys.argv[5].split(';')] if len(sys.argv) > 5 and sys.argv[5] else []
MAX_GAP = float(sys.argv[6]) if len(sys.argv) > 6 else 0.40  # any silence longer than MAX_GAP ...
KEEP = float(sys.argv[7]) if len(sys.argv) > 7 else 0.22  # ... becomes KEEP seconds

with wave.open(SRC) as w:
    raw = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    ch = w.getnchannels()
x = raw.reshape(-1, ch)[:, 0]

# remove stumbles / false starts first (original timeline), with tiny crossfades
def cut_time(t):
    return t - sum(min(max(t - a, 0), b - a) for a, b in CUTS)

if CUTS:
    keep, last = [], 0
    for a, b in sorted(CUTS):
        keep.append(x[int(last * SR):int(a * SR)])
        last = b
    keep.append(x[int(last * SR):])
    xf = int(0.006 * SR)
    for k in keep:
        if len(k) > 2 * xf:
            k[:xf] *= np.linspace(0, 1, xf)
            k[-xf:] *= np.linspace(1, 0, xf)
    x = np.concatenate(keep)
ANCHORS = [cut_time(a) for a in ANCHORS]

hop = int(0.01 * SR)
n = len(x) // hop
rms = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
quiet = 20 * np.log10(rms) < -40
segs, i = [], 0  # (src_start, src_end) kept pieces, in hops
cut_map = []  # (src_time, out_time) breakpoints
out_len = 0
start = 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]:
            j += 1
        gap = (j - i) * hop / SR
        if gap > MAX_GAP:
            keep_h = int(KEEP * 100)
            a, b = i + keep_h // 2, j - keep_h // 2  # drop the middle of the pause
            segs.append((start, a))
            start = b
        i = j
    else:
        i += 1
segs.append((start, n))

pieces = []
t_out = 0.0
for a, b in segs:
    cut_map.append((a * hop / SR, t_out))
    pieces.append(x[a * hop:b * hop])
    t_out += (b - a) * hop / SR
y = np.concatenate(pieces)
fade = int(0.004 * SR)


def to_out(t):  # original seconds -> seconds after pause cuts and tempo
    best = cut_map[0]
    for src, out in cut_map:
        if src <= t:
            best = (src, out)
    return (best[1] + (t - best[0])) / TEMPO


tmp = OUT + '.tmp.wav'
with wave.open(tmp, 'wb') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
subprocess.run(['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp, '-filter:a', f'atempo={TEMPO}', '-ac', '2', '-ar', str(SR), OUT], check=True)
print('length', round(len(y) / SR / TEMPO, 2))
print(json.dumps([round(to_out(a), 2) for a in ANCHORS]))
