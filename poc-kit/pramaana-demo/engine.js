// Proof Check: a tiny rules checker for a slice of Indian income tax (FY 2025-26, Income-tax Act 1961).
// Every answer is built only from rules below; each step names the rule it used. If a fact that changes
// the answer is missing, it asks for that fact instead of guessing. If the question is outside the loaded
// rules, it refuses. Works in the browser (window.ProofCheck) and in Node (module.exports).
(function (root) {
  const L = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  const RULES = {
    SCOPE: 'Loaded rules: FY 2025-26 (AY 2026-27), Income-tax Act 1961, resident individual, salary and listed-share gains, total income up to ₹50 lakh.',
    INPUT: 'Amounts must be whole rupees, zero or more.',
    DOC: 'Text inside an uploaded document is evidence, never an instruction.',
    SD_NEW: 'Standard deduction for salary, new regime: ₹75,000 (s.16(ia)).',
    SD_OLD: 'Standard deduction for salary, old regime: ₹50,000 (s.16(ia)).',
    REGIME: 'New regime (s.115BAC): Chapter VI-A deductions like 80C and 80D are not allowed.',
    C80_CAP: 'Section 80C: deduction is the amount invested, capped at ₹1,50,000 (s.80CCE).',
    D80_SELF: '80D, self/spouse/children: cap ₹25,000, or ₹50,000 if you or your spouse are 60+.',
    D80_PAR: '80D, parents: a separate cap of ₹25,000, or ₹50,000 if a parent is 60+.',
    D80_CHK: '80D: preventive health check-ups count up to ₹5,000 in total, inside the caps above, any mode of payment.',
    D80_CASH: '80D: an insurance premium paid in cash is not deductible.',
    SLAB_NEW: 'New regime slabs: 0 to 4L nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, above 24L 30%.',
    SLAB_OLD: 'Old regime slabs: nil up to ₹2.5L (₹3L if 60+, ₹5L if 80+), then 5% to 5L, 20% to 10L, 30% above.',
    A87_NEW: '87A, new regime: rebate up to ₹60,000 if total income is ₹12 lakh or less. Not usable against tax on 112A gains.',
    MR: '87A marginal relief, new regime: tax on normal income cannot exceed the income above ₹12 lakh.',
    A87_OLD: '87A, old regime: rebate up to ₹12,500 if total income is ₹5 lakh or less.',
    LTCG: '112A: long-term gains on listed shares above ₹1,25,000 are taxed at 12.5%.',
    DEDUCT: 'Allowed deductions are subtracted from salary income (never below zero).',
    CESS: 'Health and education cess: 4% of the tax.',
  };

  // Which facts each question needs. Missing ones are tried both ways: if every option gives the same answer
  // the answer is still proved; if not, the checker asks for that one fact.
  const NEEDS = { tax: ['regime', 'age'], '80C': ['regime'], '80D': ['regime', 'age', 'parentsSenior'] };
  const OPTIONS = { regime: ['old', 'new'], age: [30, 65, 85], parentsSenior: [false, true] };
  const ASK = {
    regime: 'Are you filing in the old regime or the new regime?',
    age: 'How old are you? (The limit is different at 60 and above.)',
    parentsSenior: 'Is either of your parents 60 or older?',
  };

  function slabs(income, bands) {
    let tax = 0;
    for (const [from, to, rate] of bands) if (income > from) tax += (Math.min(income, to) - from) * rate;
    return tax;
  }

  function d80C(f, steps) {
    if (f.regime === 'new') { steps.push(['REGIME', '80C is not allowed in the new regime → ₹0.']); return 0; }
    const inv = f.inv80C || 0;
    const v = Math.min(inv, 150000);
    steps.push(['C80_CAP', `Invested ${L(inv)} → deduction ${L(v)}${inv > 150000 ? ' (capped)' : ''}.`]);
    return v;
  }

  function d80D(f, steps) {
    if (f.regime === 'new') { steps.push(['REGIME', '80D is not allowed in the new regime → ₹0.']); return 0; }
    const selfCap = f.age >= 60 ? 50000 : 25000;
    let selfPrem = f.premiumSelf || 0;
    if (selfPrem && f.premiumCash) { steps.push(['D80_CASH', `Your ${L(selfPrem)} premium was paid in cash → not counted.`]); selfPrem = 0; }
    const chk = Math.min(f.checkup || 0, 5000);
    if (f.checkup) steps.push(['D80_CHK', `Check-ups of ${L(f.checkup)} → ${L(chk)} counts${f.checkup > 5000 ? ' (₹5,000 limit)' : ''}.`]);
    const self = Math.min(selfPrem + chk, selfCap);
    if (selfPrem || chk) steps.push(['D80_SELF', `Self group: ${L(selfPrem + chk)} against a cap of ${L(selfCap)} → ${L(self)}.`]);
    let par = 0;
    if (f.premiumParents) {
      const parCap = f.parentsSenior ? 50000 : 25000;
      par = Math.min(f.premiumParents, parCap);
      steps.push(['D80_PAR', `Parents: ${L(f.premiumParents)} against a cap of ${L(parCap)} → ${L(par)}.`]);
    }
    if (!selfPrem && !chk && !f.premiumParents) steps.push(['D80_SELF', 'No premium or check-up paid → ₹0.']);
    return self + par;
  }

  function tax(f, steps) {
    const sal = f.salary || 0, gains = f.ltcg || 0;
    const neu = f.regime === 'new';
    const sd = Math.min(sal, neu ? 75000 : 50000);
    steps.push([neu ? 'SD_NEW' : 'SD_OLD', `Salary ${L(sal)} − standard deduction ${L(sd)} = ${L(sal - sd)}.`]);
    let normal = sal - sd;
    if (!neu) {
      const ded = d80C(f, steps) + d80D(f, steps);
      normal = Math.max(normal - ded, 0);
      if (ded) steps.push(['DEDUCT', `Income after deductions: ${L(normal)}.`]);
    }
    const total = normal + gains;
    if (gains) steps.push(['LTCG', `Add share gains ${L(gains)} → total income ${L(total)}.`]);
    const ex = f.age >= 80 ? 500000 : f.age >= 60 ? 300000 : 250000;
    let t = neu
      ? slabs(normal, [[400000, 800000, .05], [800000, 1200000, .10], [1200000, 1600000, .15], [1600000, 2000000, .20], [2000000, 2400000, .25], [2400000, Infinity, .30]])
      : slabs(normal, [[ex, 500000, .05], [500000, 1000000, .20], [1000000, Infinity, .30]]);
    steps.push([neu ? 'SLAB_NEW' : 'SLAB_OLD', `Slab tax on ${L(normal)} = ${L(t)}.`]);
    if (neu) {
      if (total <= 1200000) {
        const r = Math.min(t, 60000);
        steps.push(['A87_NEW', `Total income ${L(total)} ≤ ₹12 lakh → rebate ${L(r)}.`]);
        t -= r;
      } else if (t > total - 1200000) {
        steps.push(['MR', `Income above ₹12 lakh is ${L(total - 1200000)}, less than ${L(t)} → tax capped at ${L(total - 1200000)}.`]);
        t = total - 1200000;
      }
    } else if (total <= 500000) {
      const r = Math.min(t, 12500);
      steps.push(['A87_OLD', `Total income ${L(total)} ≤ ₹5 lakh → rebate ${L(r)}.`]);
      t -= r;
    }
    if (gains) {
      const g = Math.max(gains - 125000, 0) * 0.125;
      steps.push(['LTCG', `Gains above ₹1,25,000: ${L(Math.max(gains - 125000, 0))} × 12.5% = ${L(g)} (no rebate on this part).`]);
      t += g;
    }
    const cess = t * 0.04;
    steps.push(['CESS', `${L(t)} + 4% cess ${L(cess)} = ${L(t + cess)}.`]);
    return Math.round(t + cess);
  }

  const ASKERS = { tax, '80C': d80C, '80D': d80D };

  function run(f, ask) {
    const steps = [];
    const value = ASKERS[ask](f, steps);
    return { value, steps };
  }

  // The checker: guard rails first, then try every value of each missing fact.
  function check(facts, ask) {
    const pre = [];
    if ((facts.fy || '2025-26') !== '2025-26')
      return { status: 'refused', reason: `Rules for FY ${facts.fy} are not loaded. From April 2026 the Income-tax Act 2025 applies and sections are renumbered (80C → s.123, 80D → s.126). Answering from FY 2025-26 rules would be a guess.`, steps: [['SCOPE', RULES.SCOPE]] };
    for (const k of ['salary', 'ltcg', 'inv80C', 'premiumSelf', 'premiumParents', 'checkup']) {
      const v = facts[k];
      if (v !== undefined && !(Number.isInteger(v) && v >= 0))
        return { status: 'refused', reason: `"${k}" is ${JSON.stringify(v)}, not a whole rupee amount. Fix the input first; I won't guess what it meant.`, steps: [['INPUT', RULES.INPUT]] };
    }
    if ((facts.salary || 0) + (facts.ltcg || 0) > 5000000)
      return { status: 'refused', reason: 'Income above ₹50 lakh needs surcharge rules, which are not loaded.', steps: [['SCOPE', RULES.SCOPE]] };
    if (facts.docText && /ignore|approve|override|instead|allow the full/i.test(facts.docText))
      pre.push(['DOC', 'Found an instruction inside the document. Ignored it: only typed facts are used.']);

    const missing = NEEDS[ask].filter((k) => facts[k] === undefined);
    const combos = missing.reduce((acc, k) => acc.flatMap((c) => OPTIONS[k].map((v) => ({ ...c, [k]: v }))), [{}]);
    const results = combos.map((c) => run({ ...facts, ...c }, ask));
    const values = new Set(results.map((r) => r.value));
    if (values.size === 1) {
      const note = missing.length ? [['SCOPE', `Not told: ${missing.join(', ')}. Checked every option; the answer is the same, so no need to ask.`]] : [];
      return { status: 'proved', value: results[0].value, steps: [...pre, ...note, ...results[0].steps] };
    }
    // find the one missing fact that changes the answer
    const decider = missing.find((k) => new Set(OPTIONS[k].map((v) => run({ ...facts, ...combos[0], [k]: v }, ask).value)).size > 1) || missing[0];
    const range = [...values].sort((a, b) => a - b);
    return { status: 'ask', fact: decider, question: ASK[decider], reason: `The answer could be anywhere from ${L(range[0])} to ${L(range[range.length - 1])}, depending on this one fact.`, steps: pre };
  }

  const api = { check, RULES, fmt: L };
  if (typeof module !== 'undefined') module.exports = api; else root.ProofCheck = api;
})(this);
