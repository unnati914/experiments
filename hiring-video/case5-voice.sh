#!/bin/zsh
# Swap case #005's placeholder narration for Unnati's recording; every beat re-times from word timings.
# usage: ./case5-voice.sh <recording.m4a> [tempo=1.45]
set -e
cd "$(dirname "$0")"
SRC="$1"; TEMPO="${2:-1.45}"
mkdir -p work/f5 work/ff-public/f5
python3 clean215.py "$SRC" work/f5/clean.wav 9999                                  # denoise
python3 speedvo.py work/f5/clean.wav work/f5/fast.wav $TEMPO 0 "" 0.28 0.14 >/dev/null # trim pauses, speed up (pitch kept)
python3 mic.py work/f5/fast.wav work/ff-public/f5/voice.wav -16                      # broadcast-mic sound
npx remotion ffmpeg -hide_banner -loglevel error -y -i work/ff-public/f5/voice.wav -ac 1 -ar 16000 work/f5/v16.wav
./whisper/main -m whisper/ggml-small.bin -f work/f5/v16.wav -l en -t 8 -bs 1 -bo 1 -mc 0 -ml 1 -sow -oj -of work/f5/words >/dev/null 2>&1
python3 -c "
import json;d=json.load(open('work/f5/words.json'))
w=[{'t':x['offsets']['from']/1000,'e':x['offsets']['to']/1000,'w':x['text'].strip()} for x in d['transcription'] if x['text'].strip()]
json.dump(w,open('src/f5-words.json','w'));print(len(w),'words, voice ends at',round(w[-1]['e'],1),'s')"
npx remotion render FailureFiles5 out/case-005-funny.mp4 --public-dir=work/ff-public --log=error
cp out/case-005-funny.mp4 ~/Desktop/ai-failure-files/
echo "done -> ~/Desktop/ai-failure-files/case-005-funny.mp4"
