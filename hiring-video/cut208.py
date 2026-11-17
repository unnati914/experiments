import subprocess, json, wave
import numpy as np

SRC = 'New Recording 208.m4a'
SEGS = [(0.0, 18.23), (20.91, 30.99), (33.44, 42.07), (42.79, 53.65), (57.53, 73.42), (77.02, 94.02), (95.80, 112.48), (117.16, 125.15), (126.53, 146.0)]
SR = 44100
FF = ['npx', 'remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y']

def read(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(np.float32)

def write(path, x):
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(np.clip(x, -32768, 32767).astype(np.int16).tobytes())

def tighten(x, thresh_db=-38, min_gap=0.25, keep=0.12):
    hop = int(0.01 * SR)
    n = len(x) // hop
    rms = np.sqrt((x[: n * hop].mean(axis=1).reshape(n, hop) ** 2).mean(axis=1)) + 1e-9
    quiet = 20 * np.log10(rms / 32768) < thresh_db
    out, i, last = [], 0, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]:
                j += 1
            if (j - i) * hop / SR > min_gap:
                half = int(keep / 2 * SR)
                a, b = i * hop + half, j * hop - half
                out.append(x[last:a])
                last = b
            i = j
        else:
            i += 1
    out.append(x[last:])
    # 5 ms fades at each joint to avoid clicks
    f = int(0.005 * SR)
    ramp = np.linspace(0, 1, f)[:, None]
    for k, seg in enumerate(out):
        if len(seg) > 2 * f:
            if k > 0: seg[:f] *= ramp
            if k < len(out) - 1: seg[-f:] *= ramp[::-1]
    return np.concatenate(out)

durs = []
for i, (a, b) in enumerate(SEGS, 1):
    raw, tight, out = f'work/raw208_{i:02d}.wav', f'work/tight208_{i:02d}.wav', f'public/v208/{i:02d}.wav'
    subprocess.run(FF + ['-ss', str(a), '-to', str(b), '-i', SRC, '-ac', '2', '-ar', str(SR), '-c:a', 'pcm_s16le', raw], check=True)
    write(tight, tighten(read(raw).copy()))
    subprocess.run(FF + ['-i', tight, '-af', 'atempo=1.08,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', out], check=True)
    with wave.open(out) as w:
        d = w.getnframes() / w.getframerate()
    durs.append(round(d, 3))
    print(f'{i:02d} {b - a:5.2f}s -> {d:5.2f}s')
json.dump(durs, open('src/v208-durations.json', 'w'))
print('total voice', round(sum(durs), 2))
