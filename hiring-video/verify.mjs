import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { transcribe, toCaptions } from '@remotion/install-whisper-cpp';
const dir = path.resolve('whisper');
const result = {};
for (const f of fs.readdirSync('public/her').filter((f) => f.endsWith('.wav')).sort()) {
  const tmp = path.resolve(`work/v-${f}`);
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-i', `public/her/${f}`, '-ar', '16000', '-ac', '1', tmp], { stdio: 'ignore' });
  const out = await transcribe({ inputPath: tmp, whisperPath: dir, whisperCppVersion: '1.5.5', model: 'base.en', tokenLevelTimestamps: true, printOutput: false });
  result[f] = toCaptions({ whisperCppOutput: out }).captions;
  console.log(f, '|', out.transcription.map((t) => t.text).join('').trim());
}
fs.writeFileSync('work/her-words.json', JSON.stringify(result));
