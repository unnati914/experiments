"""Original cute track: music-box melody in C major, soft pad, gentle pizzicato bass, sparkle on scene changes.
usage: cute.py <sec> <hits> <out.wav>"""
import sys, wave
import numpy as np
SR = 44100
T = float(sys.argv[1]); HITS = [float(x) for x in sys.argv[2].split(',') if x]; OUT = sys.argv[3]
BPM = 104; beat = 60 / BPM; n = int(T * SR)
rng = np.random.default_rng(3)
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def add(buf, t0, sig):
    s = int(t0 * SR)
    if s >= n: return
    l = min(len(sig), n - s); buf[s:s + l] += sig[:l]
def musicbox(f, dur):
    k = np.arange(int(dur * SR)) / SR
    env = np.exp(-k * 3.2) * np.minimum(1, k / 0.002)
    return (np.sin(2*np.pi*f*k) + 0.35*np.sin(2*np.pi*2.01*f*k)*np.exp(-k*6) + 0.12*np.sin(2*np.pi*3.99*f*k)*np.exp(-k*10)) * env
# C - Am - F - G (two bars each), melody in C major
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
MEL = [(0,72,1),(1,76,1),(2,79,2),(4,76,1),(5,74,1),(6,72,2),
       (8,69,1),(9,72,1),(10,76,2),(12,74,1),(13,72,1),(14,71,2),
       (16,65,1),(17,69,1),(18,72,2),(20,69,1),(21,67,1),(22,65,2),
       (24,67,1),(25,71,1),(26,74,2),(28,72,1),(29,67,1),(30,64,2)]
mel, pad, bass, spark = (np.zeros(n) for _ in range(4))
bars = int(T / (4*beat)) + 1
for b in range(bars):
    t0 = b * 4 * beat; ch = CH[b % 4]
    # soft pad
    k = np.arange(int(4*beat*SR)) / SR
    p = sum(np.sin(2*np.pi*midi(m)*k) + np.sin(2*np.pi*midi(m)*1.004*k) for m in ch)
    add(pad, t0, p * np.minimum(1, k/0.4) * np.minimum(1, (k[-1]-k)/0.5) / 12)
    # pizzicato bass on 1 and 3
    for q in (0, 2):
        k2 = np.arange(int(0.5*SR)) / SR
        add(bass, t0 + q*beat, 0.5*np.sin(2*np.pi*midi(ch[0]-24)*k2)*np.exp(-k2*8))
    # bounce: tiny off-beat shaker
    for q in (0.5, 1.5, 2.5, 3.5):
        l = int(0.03*SR); h = rng.standard_normal(l); add(spark, t0+q*beat, 0.04*h*np.exp(-np.arange(l)/SR*150))
for ph in range(0, 64, 32):
    pass
for b in range(bars):
    for (st, m, l) in MEL:
        if (st // 16) != (b % 2) and False: continue
    for (st, m, l) in MEL:
        blk = (b % 8) * 4
        if st < 4 * (b % 8) or st >= 4*(b % 8)+4: continue
    pass
# play the melody phrase repeatedly across the track
t_pat = 8 * beat  # 8 beats per phrase
for rep in range(int(T / (8*beat*2)) + 1):
    base = rep * 8 * beat * 2
    for (st, m, l) in MEL:
        add(mel, base + st*beat/2, musicbox(midi(m), l*beat/2*1.15))
for h in HITS:  # sparkle on scene change
    for j, m in enumerate((84, 88, 91, 96)):
        add(spark, h + j*0.06, 0.18*musicbox(midi(m), 0.6))
mix = 0.7*mel + 0.22*pad + 0.45*bass + spark
fi, fo = int(0.4*SR), int(2.0*SR)
mix[:fi] *= np.linspace(0, 1, fi); mix[-fo:] *= np.linspace(1, 0, fo)
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.85
st = np.stack([mix, np.roll(mix, int(0.01*SR))*0.96], axis=1)
with wave.open(OUT, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st*32767).astype(np.int16).tobytes())
print('wrote', OUT)
