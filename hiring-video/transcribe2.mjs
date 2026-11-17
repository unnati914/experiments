import path from 'node:path';
import fs from 'node:fs';
import { downloadWhisperModel, transcribe, toCaptions } from '@remotion/install-whisper-cpp';
const [input, lang, outName] = process.argv.slice(2);
const dir = path.resolve('whisper');
await downloadWhisperModel({ model: 'small', folder: dir });
const out = await transcribe({ inputPath: path.resolve(input), whisperPath: dir, whisperCppVersion: '1.5.5', model: 'small', language: lang, tokenLevelTimestamps: true, printOutput: false });
fs.writeFileSync(outName, JSON.stringify(toCaptions({ whisperCppOutput: out }).captions));
for (const t of out.transcription) console.log(`[${t.timestamps.from.slice(3, 8)}] ${t.text.trim()}`);
