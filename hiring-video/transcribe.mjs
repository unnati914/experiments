import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { installWhisperCpp, downloadWhisperModel, transcribe, toCaptions } from '@remotion/install-whisper-cpp';

const input = process.argv[2];
const dir = path.resolve('whisper');
await installWhisperCpp({ to: dir, version: '1.5.5' });
await downloadWhisperModel({ model: 'base.en', folder: dir });
fs.mkdirSync('work', { recursive: true });
execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-i', input, '-ar', '16000', '-ac', '1', 'work/rec16k.wav'], { stdio: 'ignore' });
const out = await transcribe({ inputPath: path.resolve('work/rec16k.wav'), whisperPath: dir, whisperCppVersion: '1.5.5', model: 'base.en', tokenLevelTimestamps: true });
const { captions } = toCaptions({ whisperCppOutput: out });
fs.writeFileSync('work/words.json', JSON.stringify(captions, null, 1));
console.log(out.transcription.map((t) => `[${t.timestamps.from} → ${t.timestamps.to}] ${t.text}`).join('\n'));
