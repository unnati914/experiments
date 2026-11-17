// Builds the static site: site/index.html (all companies) + site/<slug>/index.html (one POC walkthrough each).
// Results from `node run.mjs <slug>` (results/<slug>.json) are shown on that company's page when present.
import fs from 'node:fs';
import path from 'node:path';
import { COMPANIES } from './data/companies.js';
import { SUITES } from './data/suites.js';

const ME = { name: 'Unnati Chhabra', role: 'AI engineer', site: 'https://www.unnati-chhabra.xyz', github: 'https://github.com/unnati914' };
const OUT = 'site';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s, c) => s.replaceAll('{company}', c.name).replaceAll('{product}', c.product);

const CSS = `
:root{--bg:#f7f6f2;--card:#fff;--ink:#16161a;--soft:#5d5f6b;--line:#e4e2db;--accent:#3557e8;--good:#1f8a4c;--bad:#c93a3a;--chip:#eef1ff}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111216;--card:#1a1c22;--ink:#ecedf1;--soft:#a2a6b3;--line:#2b2e37;--accent:#8aa2ff;--good:#5fd38f;--bad:#ff7b7b;--chip:#232845}}
:root[data-theme="dark"]{--bg:#111216;--card:#1a1c22;--ink:#ecedf1;--soft:#a2a6b3;--line:#2b2e37;--accent:#8aa2ff;--good:#5fd38f;--bad:#ff7b7b;--chip:#232845}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 -apple-system,'Segoe UI',Inter,system-ui,sans-serif}
main{max-width:920px;margin:0 auto;padding:40px 16px 80px}a{color:var(--accent)}
h1{font-size:clamp(28px,5vw,40px);line-height:1.15;margin:8px 0 12px;letter-spacing:-.02em}h2{font-size:20px;margin:36px 0 10px}
.kicker{font:600 13px/1 ui-monospace,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--soft)}
.lead{font-size:18px;color:var(--soft);margin:0 0 8px}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:12px 0}
.chip{display:inline-block;background:var(--chip);color:var(--accent);border-radius:999px;padding:2px 10px;font-size:13px;font-weight:600;margin:0 6px 6px 0}
.flow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.flow span{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:14px}.flow b{color:var(--soft)}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;vertical-align:top;padding:10px 8px;border-bottom:1px solid var(--line)}th{color:var(--soft);font-weight:600}
.turns div{margin:2px 0}.gate{color:var(--bad);font-weight:700;font-size:12px}.pass{color:var(--good);font-weight:700}.fail{color:var(--bad);font-weight:700}
.wrap{overflow-x:auto}code{font:13px ui-monospace,Menlo,monospace;background:var(--chip);padding:1px 6px;border-radius:6px}
footer{margin-top:40px;color:var(--soft);font-size:14px}input{width:100%;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--ink);font-size:15px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px}.grid a{text-decoration:none;color:inherit}.grid .card{margin:0;height:100%}.grid .card:hover{border-color:var(--accent)}
`;

const page = (title, body, desc) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><style>${CSS}</style></head><body><main>${body}
<footer>Built by <a href="${ME.site}">${ME.name}</a> · ${ME.role} · <a href="${ME.github}">GitHub</a></footer></main></body></html>`;

function companyPage(c) {
  const s = SUITES[c.suite];
  const resFile = path.join('results', `${c.slug}.json`);
  const res = fs.existsSync(resFile) ? JSON.parse(fs.readFileSync(resFile, 'utf8')) : null;
  const byId = Object.fromEntries((res?.cases ?? []).map((r) => [r.id, r]));
  const gateCases = s.cases.filter((k) => k.gate).length;
  const rows = s.cases.map((k) => {
    const r = byId[k.id];
    const result = r ? `<span class="${r.pass === null ? '' : r.pass ? 'pass' : 'fail'}" style="${r.pass === null ? 'color:var(--soft);font-weight:700' : ''}">${r.pass === null ? 'RETEST' : r.pass ? 'PASS' : 'FAIL'}</span><div style="color:var(--soft)">${esc(r.reason)}</div>` : '<span style="color:var(--soft)">not run</span>';
    return `<tr><td><b>${esc(k.name)}</b>${k.gate ? '<div class="gate">SHIP GATE</div>' : ''}</td>
      <td class="turns">${k.turns.map((t, i) => `<div>${k.turns.length > 1 ? `<b>${i + 1}.</b> ` : ''}${esc(t)}</div>`).join('')}</td>
      <td>${esc(k.expect)}</td><td>${result}</td></tr>`;
  }).join('');
  const summary = res
    ? `<div class="card"><b>Run on ${esc(res.date)}</b> against a reference bot (${esc(res.model)}): <span class="pass">${res.passed} passed</span>, <span class="fail">${res.failed} failed</span>${res.retest ? ` · ${res.retest} to retest` : ''} · ship gate: <b class="${res.gateOk ? 'pass' : 'fail'}">${res.gateOk ? 'OPEN' : 'BLOCKED'}</b></div>`
    : `<div class="card">Not run yet. Results appear here after <code>node run.mjs ${esc(c.slug)}</code>.</div>`;

  const body = `
<div class="kicker">POC for ${esc(c.name)} · ${esc(c.sector)}</div>
<h1>${esc(s.title)} for ${esc(c.name)}</h1>
<p class="lead">${esc(c.idea.charAt(0).toUpperCase() + c.idea.slice(1))}.</p>
<div><span class="chip">${esc(c.city)}</span><span class="chip">${esc(s.short)}</span><span class="chip">${s.cases.length} cases · ${gateCases} ship gates</span></div>

<h2>Why this, for ${esc(c.name)}</h2>
<div class="card"><p style="margin:0"><b>Relevant to:</b> ${esc(c.hook)}.</p><p style="margin:8px 0 0">${esc(s.problem)}</p></div>

<h2>How it works</h2>
<div class="flow"><span>Test cases (one or more turns)</span><b>→</b><span>Bot under test</span><b>→</b><span>Code checks (regex: wrong amounts, leaks)</span><b>→</b><span>AI judge (Claude, structured output)</span><b>→</b><span>Ship gate</span></div>
<div class="card" style="margin-top:12px"><b>Ship gate:</b> ${esc(s.gate)}</div>

<h2>Results</h2>
${summary}

<h2>The test cases</h2>
<div class="wrap"><table><thead><tr><th style="width:18%">Case</th><th style="width:34%">Conversation</th><th style="width:28%">A good bot must</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>

<h2>Reference bot used for the demo</h2>
<div class="card"><pre style="white-space:pre-wrap;margin:0;font:13px/1.5 ui-monospace,Menlo,monospace">${esc(fill(s.refBot, c))}</pre></div>

<h2>Trade-offs and next steps</h2>
<div class="card"><ul style="margin:0;padding-left:20px">
<li><b>Reference bot, not your system.</b> This demo tests a stand-in built from public information about ${esc(c.name)}'s product. The same suite runs against a real endpoint by setting <code>BOT_URL</code>.</li>
<li><b>Code checks first, AI judge second.</b> Anything with one right answer (amounts, leaks, numbers) is checked in code; the judge only grades behavior that needs judgment.</li>
<li><b>Judge validation.</b> Before trusting the judge, compare it with human labels on ~30 cases.</li>
<li><b>Cost.</b> One run is ~2 model calls per case (${s.cases.length * 2} calls for this suite).</li>
<li><b>Next:</b> add your real policies and 50 real (anonymized) conversations, then run on every model or prompt change in CI.</li>
</ul></div>

<h2>About me</h2>
<div class="card">I'm ${ME.name}, an AI engineer working on GenAI and agentic systems (Grid Dynamics, GenAI agents for VISA). Before that: Zomato (Parchi Orders for HyperPure, ~70% of GMV; GenAI bot evaluation framework; invoice OCR ₹35 → ₹5) and Paysecure (payment plugins for 40 merchants). I also make <b>AI Failure Files</b>, short videos on real AI failures and the tests that catch them.<br><a href="${ME.site}">${ME.site.replace('https://', '')}</a> · <a href="${ME.github}">github.com/unnati914</a></div>
`;
  return page(`${c.name} · ${s.title}`, body, `${s.title} POC for ${c.name} by ${ME.name}`);
}

function indexPage() {
  const cards = COMPANIES.map((c) => `<a href="./${c.slug}/" data-s="${esc((c.name + ' ' + c.sector + ' ' + c.city + ' ' + SUITES[c.suite].short).toLowerCase())}"><div class="card"><div class="kicker">${esc(c.sector)}</div><b>${esc(c.name)}</b><div style="color:var(--soft);font-size:14px;margin-top:4px">${esc(SUITES[c.suite].title)}</div></div></a>`).join('');
  const body = `<div class="kicker">Eval POCs</div><h1>AI reliability POCs for ${COMPANIES.length} companies</h1>
<p class="lead">For each company: a test suite built for its kind of AI product (payments agents, ordering agents, support bots, voice agents, coding agents, data agents, hiring bots, advice assistants), with a one-page walkthrough.</p>
<input id="q" placeholder="Search a company, sector or city…" oninput="for(const a of document.querySelectorAll('.grid a'))a.style.display=a.dataset.s.includes(this.value.toLowerCase())?'':'none'">
<div class="grid" style="margin-top:14px">${cards}</div>`;
  return page('Eval POCs', body, `AI eval POCs for ${COMPANIES.length} companies by ${ME.name}`);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), indexPage());
for (const c of COMPANIES) {
  fs.mkdirSync(path.join(OUT, c.slug), { recursive: true });
  fs.writeFileSync(path.join(OUT, c.slug, 'index.html'), companyPage(c));
}
console.log(`built ${COMPANIES.length} company pages + index in ./${OUT}`);
