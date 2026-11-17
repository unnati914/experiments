import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { transcribe } from '@remotion/install-whisper-cpp';
const dir = path.resolve('whisper');
const result = {};
for (const f of fs.readdirSync('public/hin').filter((f) => f.endsWith('.wav')).sort()) {
  const tmp = path.resolve(`work/hv-${f}`);
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-i', `public/hin/${f}`, '-ar', '16000', '-ac', '1', tmp], { stdio: 'ignore' });
  const out = await transcribe({ inputPath: tmp, whisperPath: dir, whisperCppVersion: '1.5.5', model: 'small', language: 'en', printOutput: false });
  result[f] = out.transcription.map((t) => ({ ms: t.offsets.from, text: t.text.trim() }));
  console.log(`\n== ${f}`);
  for (const t of result[f]) console.log(`  ${(t.ms / 1000).toFixed(1)}s  ${t.text}`);
}
fs.writeFileSync('work/hin-sent.json', JSON.stringify(result));
