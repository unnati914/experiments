// First Day on Flask: onboarding quest + change preview, driven by data.json
// (exported from a local Repowise index by scripts/export.py).
"use strict";

const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const short = (p) => p.replace(/^src\/flask\//, "flask/");
const fileTag = (p) => `<span class="file">${esc(short(p))}</span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

let D, F, SRC, TESTS;

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rnd = Math.random;
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (arr, n) => shuffle(arr).slice(0, n);

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1600);
}

/* ------------------------------------------------------------------ rounds */
// Each builder returns {type, label, prompt, sub, kind:'single'|'multi'|'slider', options, correct, evidence(answer), agent}
// or null when the data can't support it (then another round type is used).

function partnersIn(f) { return (F[f].partners || []).filter((p) => F[p.file] && p.file !== f); }
const linked = (a, b) => F[a].imports.includes(b) || F[b].imports.includes(a);

const BUILDERS = {
  blast() {
    const cands = SRC.filter((f) => F[f].importers.length >= 3 && F[f].importers.length <= 10);
    if (!cands.length) return null;
    const x = pick(cands), imps = F[x].importers;
    const right = sample(imps, Math.min(imps.length, 2 + Math.floor(rnd() * 2)));
    const pool = SRC.concat(TESTS).filter((f) => f !== x && !imps.includes(f) && !F[x].imports.includes(f));
    const wrong = sample(pool, 5 - right.length);
    return {
      type: "blast", label: "What breaks",
      prompt: `You're about to change ${fileTag(x)}. Which of these files import it?`,
      sub: "Pick every one that does. These are the files you'd need to re-check.",
      kind: "multi", options: shuffle(right.concat(wrong)), correct: right, x,
      evidence: () => `${fileTag(x)} is imported by ${plural(imps.length, "file")} in total: ${imps.map(fileTag).join(" ")}`,
      agent: `get_risk(targets=["${x}"])`,
      fact: { dependents: imps.length, sample: imps.slice(0, 4) },
    };
  },
  partner() {
    const cands = SRC.filter((f) => partnersIn(f).length >= 1);
    if (!cands.length) return null;
    const x = pick(cands), ps = partnersIn(x), top = ps[0];
    const known = new Set((F[x].partners || []).map((p) => p.file));
    const pool = SRC.concat(TESTS).filter((f) => f !== x && !known.has(f));
    const hidden = !linked(x, top.file);
    return {
      type: "partner", label: "Hidden partner",
      prompt: `When someone changes ${fileTag(x)}, which file most often changes in the same commit?`,
      sub: "Git history knows things the import graph doesn't.",
      kind: "single", options: shuffle([top.file].concat(sample(pool, 3))), correct: [top.file], x,
      evidence: () => `${fileTag(top.file)} changed in the same commit as ${fileTag(x)} ${plural(top.together, "time")}${top.last ? `, most recently on ${top.last}` : ""}. ` +
        (F[top.file].test ? `It's a test file: when this code changes, that test usually needs updating too.` :
         hidden ? `Neither file imports the other, so a diff that touches only one of them can quietly miss the other.` : `They're also linked by an import.`),
      agent: `get_risk(changed_files=["${x}"])  # co-change partners missing from the diff`,
      fact: { co_change_partner: top.file, together: top.together, import_link: !hidden },
    };
  },
  tests() {
    const cands = SRC.filter((f) => F[f].tests.length >= 2 && F[f].tests[0].calls > F[f].tests[1].calls);
    if (!cands.length) return null;
    const x = pick(cands), ts = F[x].tests, top = ts[0].file;
    const pool = TESTS.filter((t) => !ts.some((y) => y.file === t));
    return {
      type: "tests", label: "Test first",
      prompt: `You changed ${fileTag(x)}. Which test file exercises it the most?`,
      sub: "Run this one first, before the whole suite.",
      kind: "single", options: shuffle([top].concat(sample(pool, 3))), correct: [top], x,
      evidence: () => `${fileTag(top)} calls into ${fileTag(x)} ${plural(ts[0].calls, "time")}. Next: ${ts.slice(1, 3).map((t) => `${fileTag(t.file)} (${t.calls})`).join(", ")}.`,
      agent: `get_context(targets=["${x}"], include=["callers"])`,
      fact: { tests: ts.slice(0, 3) },
    };
  },
  center() {
    const pool = SRC.filter((f) => !/__init__|__main__|typing\.py/.test(f));
    for (let i = 0; i < 30; i++) {
      const opts = sample(pool, 4), n = opts.map((f) => F[f].importers.length), mx = Math.max(...n);
      if (n.filter((v) => v === mx).length === 1 && mx >= 4) {
        const best = opts[n.indexOf(mx)];
        return {
          type: "center", label: "Start reading here",
          prompt: "You can read one of these first. Which one do the most other files depend on?",
          sub: "The most-depended-on file explains the most code per minute of reading.",
          kind: "single", options: opts, correct: [best],
          evidence: () => opts.map((f) => `${fileTag(f)} ${F[f].importers.length}`).join(" · ") + " (files that import it).",
          agent: `get_overview()  # module map, entry points, most central files`,
          fact: Object.fromEntries(opts.map((f) => [short(f), { importers: F[f].importers.length, pagerank: +F[f].pagerank.toFixed(4) }])),
        };
      }
    }
    return null;
  },
  fixfirst() {
    const scored = SRC.filter((f) => F[f].health && F[f].health.score != null);
    const weak = scored.filter((f) => F[f].health.score < 6), strong = scored.filter((f) => F[f].health.score >= 8.5);
    if (!weak.length || strong.length < 2) return null;
    const w = pick(weak), opts = shuffle([w].concat(sample(strong, 2)));
    const h = F[w].health;
    return {
      type: "fixfirst", label: "Fix first",
      prompt: "One of these files is in much worse shape than the others. Which one?",
      sub: "Repowise scores every file from 1 to 10 using complexity, size, duplication and bug history.",
      kind: "single", options: opts, correct: [w],
      evidence: () => opts.map((f) => `${fileTag(f)} ${F[f].health.score}/10`).join(" · ") +
        `<br>${fileTag(w)}: ${h.nloc} lines of code, its most complex function has ${h.maxCcn} branches${h.dup ? `, ${h.dup}% duplicated` : ""}${F[w].fixes ? `, ${plural(F[w].fixes, "bug fix")} traced to it` : ""}.`,
      agent: `get_health(targets=["${w}"])`,
      fact: { file: short(w), ...h },
    };
  },
  owner() {
    const names = [...new Set(Object.values(F).flatMap((v) => (v.authors || []).map((a) => a.name)).filter(Boolean))];
    const counts = {}; SRC.forEach((f) => { counts[F[f].owner] = (counts[F[f].owner] || 0) + 1; });
    const usual = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const cands = SRC.filter((f) => F[f].owner && F[f].owner !== usual);
    if (!cands.length || names.length < 4) return null;
    const x = pick(cands), o = F[x].owner, topCommitter = (F[x].authors[0] || {}).name;
    const opts = shuffle([o, usual].concat(sample(names.filter((n) => n !== o && n !== usual), 2)));
    return {
      type: "owner", label: "Who to ask",
      prompt: `Who wrote most of the lines that are in ${fileTag(x)} today?`,
      sub: `Hint: the obvious answer for most of Flask is ${esc(usual)}. Is it here?`,
      kind: "single", options: opts, correct: [o], x, names: true,
      evidence: () => `By git blame, ${esc(o)} owns most of the lines in this file today (${Math.round((F[x].ownerPct || 0) * 100)}% of its commits).` +
        (topCommitter && topCommitter !== o ? ` ${esc(topCommitter)} made the most commits, but a lot of those lines have since been rewritten.` : "") +
        ` Bus factor: ${F[x].bus}.`,
      agent: `get_context(targets=["${x}"], include=["ownership"])`,
      fact: { owner: o, top_committer: topCommitter, bus_factor: F[x].bus, contributors: F[x].contributors },
    };
  },
  churn() {
    for (let i = 0; i < 30; i++) {
      const opts = sample(SRC, 4), n = opts.map((f) => F[f].commits || 0), mx = Math.max(...n);
      if (n.filter((v) => v === mx).length === 1 && mx >= 20) {
        const best = opts[n.indexOf(mx)];
        return {
          type: "churn", label: "Busiest file",
          prompt: "Which of these files has been changed in the most commits?",
          sub: "Files that change a lot are where new bugs usually come from.",
          kind: "single", options: opts, correct: [best],
          evidence: () => opts.map((f) => `${fileTag(f)} ${F[f].commits}`).join(" · ") + " commits in the git history Repowise indexed.",
          agent: `get_risk(targets=[...])  # hotspot flag, churn percentile`,
          fact: Object.fromEntries(opts.map((f) => [short(f), { commits: F[f].commits, churn_percentile: F[f].churnPct }])),
        };
      }
    }
    return null;
  },
  estimate() {
    const cands = SRC.filter((f) => F[f].importers.length >= 5 && F[f].importers.length <= 34);
    if (!cands.length) return null;
    const x = pick(cands), n = F[x].importers.length;
    return {
      type: "estimate", label: "Gut check",
      prompt: `Roughly how many files import ${fileTag(x)} directly?`,
      sub: "Drag to your estimate. Within 25% (or 2 files) counts.",
      kind: "slider", max: 40, correct: n, x,
      evidence: (a) => `The index counts ${n} direct importers. You said ${a}.`,
      agent: `get_context(targets=["${x}"], include=["callers"])`,
      fact: { file: short(x), direct_importers: n },
    };
  },
};
const ORDER = ["center", "blast", "partner", "tests", "fixfirst", "owner", "churn", "estimate"];

function buildRounds(seed) {
  rnd = mulberry32(seed);
  const rounds = [];
  for (const t of ORDER) {
    const r = BUILDERS[t]() || BUILDERS.blast();
    if (r) rounds.push(r);
  }
  rnd = Math.random;
  return rounds;
}

function isRight(r, ans) {
  if (r.kind === "slider") return Math.abs(ans - r.correct) <= Math.max(2, r.correct * 0.25);
  const a = new Set(ans);
  return a.size === r.correct.length && r.correct.every((c) => a.has(c));
}

/* ------------------------------------------------------------------ quest UI */
const Q = { seed: 0, rounds: [], i: 0, sel: [], results: [], touched: false, revealed: false };

function startQuest(seed) {
  Q.seed = seed; Q.rounds = buildRounds(seed); Q.i = 0; Q.results = []; resetRound();
  try { history.replaceState(null, "", `?seed=${seed}${location.hash}`); } catch (e) {}
  renderQuest();
}
function resetRound() { Q.sel = []; Q.touched = false; Q.revealed = false; Q.sliderVal = 10; }

function renderQuest() {
  const el = $("#tab-quest");
  if (Q.i >= Q.rounds.length) return renderSummary(el);
  const r = Q.rounds[Q.i], res = Q.results[Q.i];
  const dots = Q.rounds.map((_, k) => `<i class="${k < Q.results.length ? (Q.results[k].right ? "right" : "wrong") : k === Q.i ? "now" : ""}"></i>`).join("");
  let body = "";
  if (r.kind === "slider") {
    const v = res ? res.answer : Q.sliderVal;
    body = `<div class="slider"><div class="val">${Q.touched || res ? v : "?"}<span class="sub"> files</span></div>
      <input type="range" min="0" max="${r.max}" value="${v}" id="sl" class="${Q.touched || res ? "" : "untouched"}" ${res ? "disabled" : ""} aria-label="Your estimate">
      <div class="ticks"><span>0</span><span>10</span><span>20</span><span>30</span><span>40</span></div></div>`;
  } else {
    body = `<div class="opts">${r.options.map((o, k) => {
      let cls = "opt" + (r.kind === "single" ? " radio" : ""), tag = "";
      const chosen = (res ? res.answer : Q.sel).includes(o);
      if (chosen) cls += " on";
      if (res) {
        const ok = r.correct.includes(o);
        if (chosen && ok) { cls += " right"; tag = "✓ correct"; }
        else if (chosen && !ok) { cls += " wrong"; tag = "✕ no"; }
        else if (ok) { cls += " missed"; tag = r.kind === "multi" ? "✓ you missed this" : "✓ answer"; }
      }
      const label = r.names ? esc(o) : esc(short(o));
      return `<button class="${cls}" data-k="${k}" ${res ? "disabled" : ""}><span class="box">${chosen ? "✓" : ""}</span><span>${label}</span><span class="tag">${tag}</span></button>`;
    }).join("")}</div>`;
  }
  const can = r.kind === "slider" ? Q.touched : Q.sel.length > 0;
  const lock = res ? "" : `<div class="lock"><button class="btn" data-lock="sure" ${can ? "" : "disabled"}>I'm sure</button><button class="btn ghost" data-lock="guess" ${can ? "" : "disabled"}>Best guess</button></div>
    <div class="lockhint">Saying how sure you are is part of the score. Being confidently wrong is the expensive mistake.</div>`;
  const reveal = res ? `<div class="reveal">
      <div class="verdict ${res.right ? "ok" : "bad"}">${res.right ? "✓ Right" : "✕ Not quite"}<span class="status ${res.sure ? (res.right ? "ok" : "bad") : "warn"}">${res.sure ? "you were sure" : "you guessed"}</span></div>
      <p>${r.evidence(res.answer)}</p>
      <pre class="agent"><span class="c"># the same answer, as your coding agent would ask for it</span>
<span class="k">${esc(r.agent)}</span>
<span class="c"># → from the index:</span>
<span class="s">${esc(JSON.stringify(r.fact))}</span></pre>
      <div class="row-btns"><button class="btn" id="next">${Q.i + 1 < Q.rounds.length ? "Next question →" : "See my results →"}</button></div>
    </div>` : "";
  el.innerHTML = `<div class="grid2"><div class="card">
      <div class="qtop"><span class="rtype">${Q.i + 1}/${Q.rounds.length} · ${esc(r.label)}</span><div class="dots">${dots}</div></div>
      <div class="prompt">${r.prompt}</div><p class="sub">${r.sub}</p>
      ${body}${lock}${reveal}
    </div>
    <aside class="card side">
      <h3>Why this exists</h3>
      <p>Onboarding docs go stale. A Repowise index doesn't: it's rebuilt from the code and git history on every commit. So the quiz can't ask a question whose answer has drifted.</p>
      <p>Each round is generated from the index, so every play is different. Each answer shows the agent tool call that returns the same fact, so the new hire learns the codebase and the tool at the same time.</p>
      <p class="sub" style="margin-top:12px">Round set <span class="mono">#${Q.seed}</span> · <a href="#" id="newset">new set</a> · <a href="#" id="copyset">share this set</a></p>
    </aside></div>`;
  wireQuest(r);
}

function wireQuest(r) {
  const el = $("#tab-quest");
  el.querySelectorAll(".opt[data-k]").forEach((b) => b.addEventListener("click", () => {
    const o = r.options[+b.dataset.k];
    if (r.kind === "single") Q.sel = [o];
    else Q.sel = Q.sel.includes(o) ? Q.sel.filter((x) => x !== o) : Q.sel.concat(o);
    renderQuest();
  }));
  const sl = $("#sl");
  if (sl && !sl.disabled) sl.addEventListener("input", () => {
    Q.sliderVal = +sl.value;
    if (!Q.touched) { Q.touched = true; renderQuest(); $("#sl").focus(); return; }
    el.querySelector(".val").firstChild.textContent = sl.value;
  });
  el.querySelectorAll("[data-lock]").forEach((b) => b.addEventListener("click", () => {
    const answer = r.kind === "slider" ? Q.sliderVal : Q.sel.slice();
    Q.results.push({ answer, sure: b.dataset.lock === "sure", right: isRight(r, answer), type: r.type, label: r.label, x: r.x });
    renderQuest();
  }));
  const nx = $("#next"); if (nx) nx.addEventListener("click", () => { Q.i++; resetRound(); renderQuest(); window.scrollTo({ top: $("nav.tabs").offsetTop - 8, behavior: "smooth" }); });
  const ns = $("#newset"); if (ns) ns.addEventListener("click", (e) => { e.preventDefault(); startQuest(Math.floor(Math.random() * 1e6)); });
  const cs = $("#copyset"); if (cs) cs.addEventListener("click", (e) => { e.preventDefault(); copy(location.href, "Link copied"); });
}

function renderSummary(el) {
  const R = Q.results, right = R.filter((x) => x.right).length;
  const sureRight = R.filter((x) => x.sure && x.right).length, sureWrong = R.filter((x) => x.sure && !x.right).length;
  const guessRight = R.filter((x) => !x.sure && x.right).length, guessWrong = R.filter((x) => !x.sure && !x.right).length;
  const sure = sureRight + sureWrong;
  const calib = sure ? Math.round((sureRight / sure) * 100) : null;
  let read;
  if (sureWrong >= 2) read = { cls: "bad", t: "Confidently wrong twice or more. These are the spots where a new hire (or an agent) ships a bug without asking anyone." };
  else if (sure === 0) read = { cls: "warn", t: "You guessed everything. Honest, but you'd be asking a teammate about every change. The index can answer those questions instead." };
  else if (calib >= 80) read = { cls: "ok", t: "Well calibrated: when you said you were sure, you were usually right." };
  else read = { cls: "warn", t: "Partly calibrated. Check the blind spots below before touching those files." };
  const blind = R.map((x, k) => ({ ...x, r: Q.rounds[k] })).filter((x) => !x.right);
  el.innerHTML = `<div class="grid2"><div class="card">
      <div class="rtype">Your first day, scored</div>
      <div style="display:flex;align-items:baseline;gap:12px;margin:8px 0 4px"><span class="score">${right}/${R.length}</span><span class="sub">right</span></div>
      <p><span class="status ${read.cls}">${read.cls === "ok" ? "✓" : read.cls === "bad" ? "✕" : "!"} ${read.cls === "ok" ? "Calibrated" : read.cls === "bad" ? "Overconfident" : "Check this"}</span> ${read.t}</p>
      <div class="cal">
        <div><b>${sureRight}</b><small>Sure and right</small></div>
        <div class="${sureWrong ? "danger" : ""}"><b>${sureWrong}</b><small>Sure and wrong: the costly kind</small></div>
        <div><b>${guessRight}</b><small>Guessed right: luck you can't count on</small></div>
        <div><b>${guessWrong}</b><small>Guessed wrong: at least you knew to ask</small></div>
      </div>
      <h3 style="margin-top:18px;font-size:16px">Blind spots</h3>
      ${blind.length ? `<ul class="blind">${blind.map((b) => `<li><b>${esc(b.label)}</b>${b.x ? ` · ${fileTag(b.x)}` : ""} <span class="status ${b.sure ? "bad" : "warn"}">${b.sure ? "was sure" : "guessed"}</span></li>`).join("")}</ul>` : `<p class="sub">None. You got every round.</p>`}
      <div class="row-btns"><button class="btn" id="again">Play a new set</button><button class="btn ghost" id="toprev">Try the change preview →</button></div>
    </div>
    <aside class="card side">
      <h3>What a team lead would see</h3>
      <p>Run the same set across a cohort of new hires and the "sure and wrong" answers cluster. That shows which parts of the codebase are misleading, not just which person needs help.</p>
      <p>It's the same idea as a survey quality check: don't only score answers, score how much to trust them.</p>
      <h3 style="margin-top:16px">Where this could go</h3>
      <p>A <span class="mono">/first-day</span> page on any hosted Repowise repo, generated from the index the team already has. No one has to write or maintain onboarding questions.</p>
    </aside></div>`;
  $("#again").addEventListener("click", () => startQuest(Math.floor(Math.random() * 1e6)));
  $("#toprev").addEventListener("click", () => showTab("preview"));
}

/* ------------------------------------------------------------------ change preview */
const P = { sel: new Set(), filter: "" };

function analyse(changed) {
  const set = new Set(changed);
  const direct = new Set();
  changed.forEach((f) => F[f].importers.forEach((i) => !set.has(i) && direct.add(i)));
  const second = new Set();
  direct.forEach((d) => (F[d] ? F[d].importers : []).forEach((i) => !set.has(i) && !direct.has(i) && second.add(i)));
  const partners = new Map();
  changed.forEach((f) => partnersIn(f).forEach((p) => {
    if (set.has(p.file) || p.together < 3) return;
    const cur = partners.get(p.file);
    // tests reach code through calls, not imports, so only source files can be "hidden" partners
    if (!cur || cur.together < p.together) partners.set(p.file, { ...p, with: f, hidden: !F[p.file].test && !linked(f, p.file) });
  }));
  const tests = new Map();
  changed.forEach((f) => F[f].tests.forEach((t) => tests.set(t.file, (tests.get(t.file) || 0) + t.calls)));
  const owners = new Map();
  changed.forEach((f) => F[f].owner && owners.set(F[f].owner, (owners.get(F[f].owner) || []).concat(f)));
  const weak = changed.filter((f) => F[f].health && F[f].health.score != null && F[f].health.score < 6);
  const lowBus = changed.filter((f) => F[f].bus === 1);
  const srcDirect = [...direct].filter((d) => !F[d] || !F[d].test).length;
  let pts = 0;
  pts += srcDirect >= 8 ? 2 : srcDirect >= 3 ? 1 : 0;
  pts += weak.length ? 2 : 0;
  pts += [...partners.values()].some((p) => p.hidden) ? 1 : 0;
  pts += changed.some((f) => F[f].hotspot) ? 1 : 0;
  pts += tests.size === 0 ? 1 : 0;
  const level = pts >= 4 ? "High" : pts >= 2 ? "Medium" : "Low";
  return { direct: [...direct], second: [...second], partners: [...partners.values()].sort((a, b) => b.together - a.together),
    tests: [...tests.entries()].sort((a, b) => b[1] - a[1]), owners: [...owners.entries()], weak, lowBus, level, srcDirect };
}

function headline(a, changed) {
  const n = changed.length;
  const bits = [`This change touches ${plural(n, "file")}`];
  if (a.direct.length) bits.push(`${plural(a.direct.length, "other file")} depend${a.direct.length === 1 ? "s" : ""} on ${n === 1 ? "it" : "them"} directly`);
  const np = a.partners.length, hp = a.partners.filter((p) => p.hidden).length;
  if (np) bits.push(`${plural(np, "file")} usually change${np === 1 ? "s" : ""} with ${n === 1 ? "it" : "them"} but ${np === 1 ? "isn't" : "aren't"} included${hp ? ` (${hp} with no import link, so easy to miss)` : ""}`);
  return bits.join(", ") + ".";
}

function prComment(a, changed) {
  const L = [];
  L.push(`**Change preview: ${a.level} risk**`, "", headline(a, changed), "");
  if (a.weak.length) L.push(`**Fragile code:** ${a.weak.map((f) => `\`${short(f)}\` (health ${F[f].health.score}/10)`).join(", ")}`);
  if (a.partners.length) L.push(`**Usually changes with this, not in the diff:** ${a.partners.slice(0, 4).map((p) => `\`${short(p.file)}\` (${p.together}×)`).join(", ")}`);
  L.push(`**Run first:** ${a.tests.length ? a.tests.slice(0, 4).map(([t]) => `\`${t}\``).join(", ") : "no test calls into these files directly"}`);
  L.push(`**Ask:** ${a.owners.map(([o, fs]) => `${o} (${fs.map(short).join(", ")})`).join("; ")}`);
  L.push("", "_From the Repowise index of pallets/flask._");
  return L.join("\n");
}

function renderPreview() {
  const el = $("#tab-preview");
  const changed = [...P.sel];
  const list = SRC.filter((f) => short(f).includes(P.filter.toLowerCase()))
    .map((f) => `<label><input type="checkbox" value="${esc(f)}" ${P.sel.has(f) ? "checked" : ""}> ${esc(short(f))}<small>${F[f].importers.length} dependents</small></label>`).join("");
  let right;
  if (!changed.length) {
    right = `<div class="empty"><p><b>Pick the files you plan to change.</b></p><p>You'll get a plain-English risk card, the kind a product manager or a new reviewer can read, plus a PR comment you can paste.</p><div class="row-btns" style="justify-content:center"><button class="btn ghost" data-ex="src/flask/app.py">Try flask/app.py</button><button class="btn ghost" data-ex="src/flask/ctx.py">Try flask/ctx.py</button></div></div>`;
  } else {
    const a = analyse(changed);
    const cls = a.level === "High" ? "bad" : a.level === "Medium" ? "warn" : "ok";
    const icon = a.level === "High" ? "✕" : a.level === "Medium" ? "!" : "✓";
    right = `<div class="risk-head"><h2>Change preview</h2><span class="status ${cls}">${icon} ${a.level} risk</span></div>
      <p>${headline(a, changed)}</p>
      <div class="sec"><h4>Who this touches</h4>
        <p>${a.direct.length ? `${[a.srcDirect && plural(a.srcDirect, "source file"), a.direct.length - a.srcDirect && plural(a.direct.length - a.srcDirect, "test file")].filter(Boolean).join(" and ")} import what you changed${a.second.length ? `, and ${a.second.length} more import those` : ""}.` : "Nothing imports these files directly."}</p>
        ${a.direct.length ? `<p>${a.direct.slice(0, 10).map(fileTag).join(" ")}${a.direct.length > 10 ? ` +${a.direct.length - 10} more` : ""}</p>` : ""}</div>
      <div class="sec"><h4>Usually changes with this, but isn't in your change</h4>
        ${a.partners.length ? `<ul>${a.partners.slice(0, 5).map((p) => `<li>${fileTag(p.file)} changed with ${fileTag(p.with)} ${p.together}× ${p.hidden ? `<span class="status warn">! no import link</span>` : ""}</li>`).join("")}</ul>` : `<p>No strong co-change partners left out.</p>`}</div>
      <div class="sec"><h4>Run these tests first</h4>
        ${a.tests.length ? `<ul>${a.tests.slice(0, 5).map(([t, n]) => `<li>${fileTag(t)} <span class="sub">${plural(n, "call")} into your files</span></li>`).join("")}</ul>` : `<p><span class="status warn">! No direct test calls</span> Nothing in <span class="mono">tests/</span> calls into these files directly. Add a test or run the full suite.</p>`}</div>
      <div class="sec"><h4>Who to ask</h4><ul>${a.owners.map(([o, fs]) => `<li><b>${esc(o)}</b> owns most of the lines in ${fs.map(fileTag).join(" ")}</li>`).join("")}</ul>
        ${a.lowBus.length ? `<p><span class="status warn">! Bus factor 1</span> ${a.lowBus.map(fileTag).join(" ")}: only one person really knows this.</p>` : ""}</div>
      ${a.weak.length ? `<div class="sec"><h4>Fragile code</h4><ul>${a.weak.map((f) => { const h = F[f].health; return `<li>${fileTag(f)} <span class="status bad">✕ ${h.score}/10</span> ${h.nloc} lines, the most complex function has ${h.maxCcn} branches</li>`; }).join("")}</ul></div>` : ""}
      <pre class="agent"><span class="c"># what an agent calls to get this</span>
<span class="k">${esc(`get_risk(changed_files=${JSON.stringify(changed)})`)}</span></pre>
      <div class="row-btns"><button class="btn" id="copypr">Copy as PR comment</button><button class="btn ghost" id="clear">Clear</button></div>`;
  }
  el.innerHTML = `<div class="grid2" style="grid-template-columns:minmax(0,1fr) minmax(0,1.5fr)">
    <div class="card"><h3 style="font-size:16px">Files in your change</h3>
      <input class="pfilter" id="pf" placeholder="Filter files…" value="${esc(P.filter)}" aria-label="Filter files">
      <div class="picker">${list || `<p class="sub" style="padding:12px">No match.</p>`}</div></div>
    <div class="card">${right}</div></div>`;
  el.querySelectorAll(".picker input").forEach((c) => c.addEventListener("change", () => { c.checked ? P.sel.add(c.value) : P.sel.delete(c.value); renderPreview(); }));
  const pf = $("#pf"); pf.addEventListener("input", () => { P.filter = pf.value; const pos = pf.selectionStart; renderPreview(); const n = $("#pf"); n.focus(); n.setSelectionRange(pos, pos); });
  el.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { P.sel = new Set([b.dataset.ex]); renderPreview(); }));
  const cp = $("#copypr"); if (cp) cp.addEventListener("click", () => copy(prComment(analyse(changed), changed), "PR comment copied"));
  const cl = $("#clear"); if (cl) cl.addEventListener("click", () => { P.sel.clear(); renderPreview(); });
}

/* ------------------------------------------------------------------ how */
function renderHow() {
  const src = SRC.length, tests = TESTS.length;
  $("#tab-how").innerHTML = `<div class="card how">
    <h2>How it's built</h2>
    <p>Everything here comes from Repowise's open-source engine running on my laptop. No model, no API key, no server. The page is static HTML that reads one JSON file.</p>
    <pre class="agent"><span class="c"># 1. index Flask (40 seconds, zero LLM calls)</span>
<span class="k">uv tool install repowise</span>
<span class="k">git clone https://github.com/pallets/flask && cd flask</span>
<span class="k">repowise init --yes --no-prose --no-editor-setup --no-hook</span>
<span class="c"># 2. export file-level facts from .repowise/wiki.db</span>
<span class="k">python3 scripts/export.py flask data.json</span></pre>
    <h3>What the index gave me</h3>
    <div class="tablewrap"><table><tr><th>Table in wiki.db</th><th>Used for</th></tr>
      <tr><td class="mono">graph_edges · imports</td><td>What breaks, start reading here, gut check, who this touches</td></tr>
      <tr><td class="mono">graph_edges · calls (test → source)</td><td>Test first, run these tests first</td></tr>
      <tr><td class="mono">git_metadata · co_change_partners</td><td>Hidden partner, usually changes with this</td></tr>
      <tr><td class="mono">git_metadata · owner, bus factor, commits</td><td>Who to ask, busiest file</td></tr>
      <tr><td class="mono">health_file_metrics</td><td>Fix first, fragile code</td></tr></table></div>
    <h3>Numbers</h3>
    <p>Flask at commit <span class="mono">${esc(D.commit)}</span> (${esc(D.commitDate)}): ${D.index.files} files, ${D.index.symbols} symbols and ${D.index.edges} graph edges indexed. This demo uses ${src} source files and ${tests} test files.</p>
    <h3>Honest caveats</h3>
    <ul>
      <li>Commit counts come from Repowise's default git scan (last 5,000 commits, no <span class="mono">--follow-renames</span>). Files that were moved or split, like <span class="mono">app.py</span> into <span class="mono">sansio/app.py</span>, can have their history attributed unevenly.</li>
      <li>"Tests that exercise a file" come from test-to-source call edges in the graph, not from a coverage report. Many Flask tests call through the <span class="mono">flask</span> package, so some links are missing. With a coverage report loaded (<span class="mono">repowise coverage</span>), this would be exact.</li>
      <li>The risk level in Change preview is my simple rule (dependents, health, missing partners, hotspot, test gaps). It is not Repowise's own score. In a real build it would call <span class="mono">get_risk</span>.</li>
      <li>Names are git authors from Flask's public history.</li>
    </ul>
    <h3>If I built this for real</h3>
    <ul>
      <li>Generate the quest from the hosted index, so every repo on repowise.dev gets a first-day page for free.</li>
      <li>Track "sure and wrong" answers across new hires to find the parts of a codebase that mislead people. Feed those into the docs and the CLAUDE.md that Repowise already generates.</li>
      <li>Run the same rounds against a coding agent with and without Repowise's MCP tools. That gives a simple, public benchmark of whether the agent "knows" the repo.</li>
    </ul></div>`;
}

/* ------------------------------------------------------------------ shell */
function copy(text, msg) {
  (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
    .then(() => toast(msg)).catch(() => { prompt("Copy this:", text); });
}
function showTab(t) {
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
  ["quest", "preview", "how"].forEach((k) => ($(`#tab-${k}`).hidden = k !== t));
  try { history.replaceState(null, "", `${location.search}#${t}`); } catch (e) {}
}

fetch("data.json").then((r) => r.json()).then((data) => {
  D = data; F = data.files;
  SRC = Object.keys(F).filter((f) => !F[f].test);
  TESTS = Object.keys(F).filter((f) => F[f].test);
  $("#facts").innerHTML = [`pallets/flask @ ${D.commit}`, `${D.index.files} files`, `${D.index.symbols} symbols`, `${D.index.edges} graph edges`, "0 LLM calls"]
    .map((s) => `<span>${esc(s)}</span>`).join("");
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  const seed = +(new URLSearchParams(location.search).get("seed")) || Math.floor(Math.random() * 1e6);
  startQuest(seed); renderPreview(); renderHow();
  const h = location.hash.slice(1); if (["quest", "preview", "how"].includes(h)) showTab(h);
}).catch((e) => { $("#tab-quest").innerHTML = `<div class="card">Couldn't load data.json (${esc(e.message)}).</div>`; });
