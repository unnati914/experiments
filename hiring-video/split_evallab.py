"""Cut out/evallab.mp4 into standalone clips: hook + one segment + CTA each."""
import os
import subprocess

SRC = 'out/evallab.mp4'
OUT = os.path.expanduser('~/Desktop/eval-lab-clips')
os.makedirs(OUT, exist_ok=True)
os.makedirs('out/parts', exist_ok=True)

HOOK = (0, 6)
CTA = (64, 70)
CLIPS = {
    '1-fintech-payments-disputes': (6, 16),
    '2-food-delivery-support-bots': (16, 26),
    '3-rag-copilot-citations': (26, 36),
    '4-nutrition-ai-allergies': (36, 46),
    '5-kyc-document-extraction': (46, 56),
    '6-receipts': (56, 64),
}


def ff(*args):
    subprocess.run(['npx', 'remotion', 'ffmpeg', '-y', '-loglevel', 'error', *args], check=True)


def cut(a, b, name):
    path = f'out/parts/{name}.mp4'
    ff('-ss', str(a), '-i', SRC, '-t', str(b - a), '-c:v', 'libx264', '-crf', '18', '-preset', 'fast', '-c:a', 'aac', '-b:a', '192k', path)
    return path


hook = cut(*HOOK, 'hook')
cta = cut(*CTA, 'cta')
for name, (a, b) in CLIPS.items():
    mid = cut(a, b, name)
    lst = f'out/parts/{name}.txt'
    with open(lst, 'w') as f:
        for p in (hook, mid, cta):
            f.write(f"file '{os.path.abspath(p)}'\n")
    ff('-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', os.path.join(OUT, f'eval-lab-{name}.mp4'))
    print('wrote', name)
