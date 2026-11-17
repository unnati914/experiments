// Runs every company that has no results yet, N at a time (default 5), one child process per company.
// usage: node run-all.mjs [concurrency]   (needs ANTHROPIC_API_KEY in the environment)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { COMPANIES } from './data/companies.js';

const N = Number(process.argv[2] || 5);
const todo = COMPANIES.map((c) => c.slug).filter((s) => !fs.existsSync(`results/${s}.json`));
fs.mkdirSync('logs', { recursive: true });
console.log(`${todo.length} companies to run, ${N} at a time`);

let done = 0;
const failed = [];
const runOne = (slug) => new Promise((resolve) => {
  const log = fs.openSync(`logs/${slug}.log`, 'w');
  const p = spawn('node', ['run.mjs', slug], { stdio: ['ignore', log, log], env: process.env });
  p.on('close', (code) => {
    done++;
    if (code !== 0 || !fs.existsSync(`results/${slug}.json`)) failed.push(slug);
    const r = fs.existsSync(`results/${slug}.json`) ? JSON.parse(fs.readFileSync(`results/${slug}.json`, 'utf8')) : null;
    console.log(`[${done}/${todo.length}] ${slug}: ${r ? `${r.passed}/${r.passed + r.failed} · gate ${r.gateOk ? 'OPEN' : 'BLOCKED'}` : 'FAILED TO RUN'}`);
    resolve();
  });
});

const queue = [...todo];
await Promise.all(Array.from({ length: N }, async () => {
  while (queue.length) await runOne(queue.shift());
}));
console.log(failed.length ? `\nNot finished (re-run later): ${failed.join(', ')}` : '\nAll companies finished.');
