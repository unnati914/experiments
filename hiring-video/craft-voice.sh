#!/bin/zsh
# Swap the placeholder narration for a real recording; every beat re-times itself from word timings.
# usage: ./craft-voice.sh <recording> [tempo=1.3]
set -e
cd "$(dirname "$0")"
SRC="$1"; TEMPO="${2:-1.3}"
D=work/craft; P=work/craft-public/craft
python3 clean215.py "$SRC" $D/clean.wav 9999            # high-pass, denoise, compress
python3 speedvo.py $D/clean.wav $D/fast.wav $TEMPO 0 "" 0.40 0.22 >/dev/null   # trim pauses, speed up (pitch kept)
python3 clarify.py $D/fast.wav $P/vo.wav -16            # presence EQ, de-ess, -16 LUFS
npx remotion ffmpeg -hide_banner -loglevel error -y -i $P/vo.wav -ar 16000 -ac 1 $D/vo16.wav
./whisper/main -m whisper/ggml-small.bin -f $D/vo16.wav -l en -t 8 -bs 1 -bo 1 -mc 0 -ml 1 -sow -oj -of $D/words >/dev/null 2>&1
python3 -c "
import json;d=json.load(open('$D/words.json'))
w=[{'t':x['offsets']['from']/1000,'e':x['offsets']['to']/1000,'w':x['text'].strip()} for x in d['transcription'] if x['text'].strip()]
json.dump(w,open('src/craft-words.json','w'));print(len(w),'words, voice ends at',w[-1]['e'],'s')"
python3 surf.py 200 $P/surf.wav 104 >/dev/null
echo "Now render: npx remotion render CraftPitch out/craft-pitch-16x9.mp4 --public-dir=work/craft-public (and CraftPitchVertical)"
