import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// "Eval Lab" case studies, v2: light lab-notebook theme, house track, each case worked through with an example.
// Industry cases are example scenarios: numbers are the example's own values, test-set sizes and ship targets, not results.
// No companies named in the cases. Receipts are from Unnati's resume. Scene cuts line up with hits in evallab2.wav.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const EVALLAB_FRAMES = s(70);
export const CASE_STARTS = [6, 16, 26, 36, 46];

const C = {
  paper: '#f6f1e7', ink: '#141414', soft: '#5d5a54', line: '#d9d1c1', card: '#ffffff',
  blue: '#2b59ff', orange: '#ff6b2b', green: '#14a058', red: '#e5383b', yellow: '#ffd23f', pink: '#ff5fa2',
};
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'up' | 'left' }> = ({ at, children, style, from = 'up' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 12, stiffness: 200 } });
  const move = from === 'up' ? `translateY(${(1 - p) * 40}px)` : `translateX(${(1 - p) * -70}px)`;
  return <div style={{ opacity: Math.min(1, p * 1.6), transform: `${move} scale(${0.9 + 0.1 * p})`, ...style }}>{children}</div>;
};
const Big: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 96, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: -2, color: C.ink, ...style }}>{children}</div>
);
const Tag: React.FC<{ children: React.ReactNode; bg?: string; fg?: string }> = ({ children, bg = C.yellow, fg = C.ink }) => (
  <span style={{ display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 24, color: fg, background: bg, border: `3px solid ${C.ink}`, borderRadius: 999, padding: '6px 20px' }}>{children}</span>
);
const Hl: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = C.yellow }) => (
  <span style={{ background: bg, padding: '0 12px', borderRadius: 10, boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>{children}</span>
);
const Box: React.FC<{ children: React.ReactNode; accent?: string; style?: React.CSSProperties }> = ({ children, accent = C.ink, style }) => (
  <div style={{ background: C.card, border: `4px solid ${C.ink}`, borderRadius: 24, boxShadow: `9px 9px 0 ${accent}`, padding: '22px 26px', ...style }}>{children}</div>
);
const Head: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 2, color, textTransform: 'uppercase', marginBottom: 12 }}>{children}</div>
);
const Stamp: React.FC<{ at: number; text: string; color: string; rotate?: number; style?: React.CSSProperties }> = ({ at, text, color, rotate = -8, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 260 } });
  return (
    <div style={{ position: 'absolute', transform: `rotate(${rotate}deg) scale(${2 - p})`, opacity: Math.min(1, p * 2), fontFamily: SANS, fontWeight: 900, fontSize: 34, color, border: `5px solid ${color}`, borderRadius: 14, padding: '4px 16px', background: C.paper, whiteSpace: 'nowrap', ...style }}>{text}</div>
  );
};
// a scene: quick punch-in, fade out
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const local = f - s(from);
  const op = interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp);
  const sc = interpolate(local, [0, 8], [1.04, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: op, transform: `scale(${sc})` }}>{children}</AbsoluteFill>;
};

type Case = {
  sector: string; accent: string; icon: string; title: React.ReactNode;
  user: string; bot: string; why: string;
  check: React.ReactNode; fix: string; gate: [string, string][];
};

const CASES: Case[] = [
  {
    sector: 'fintech · payments', accent: C.blue, icon: '💳',
    title: <>dispute bots that <Hl>refund the wrong amount</Hl></>,
    user: 'I was charged ₹2,499 twice for one order. Refund the extra one?',
    bot: 'Done! I\'ve refunded ₹4,998 to your card 💸',
    why: 'it refunded both charges, including the valid one',
    check: <>refund = ledger.duplicate(order)<br />assert bot.amount == refund <span style={{ color: C.soft }}># ₹2,499</span><br />assert bot.cites(policy_id)</>,
    fix: 'the amount comes from the ledger tool, never from the model. the model only explains it.',
    gate: [['300', 'test disputes'], ['0', 'wrong amounts allowed'], ['> ₹10,000', 'goes to a human']],
  },
  {
    sector: 'consumer · food delivery', accent: C.orange, icon: '🍛',
    title: <>support bots that <Hl>break their refund policy</Hl></>,
    user: 'My biryani came 52 min late and cold. Order was ₹380.',
    bot: 'So sorry for the inconvenience 🙏 We\'ll do better next time!',
    why: 'policy says late by 30+ min = 50% back. owed ₹190, gave ₹0',
    check: <>late_min = 52 <span style={{ color: C.soft }}># &gt; 30</span><br />owed = 0.5 × 380 = <b style={{ color: C.green }}>190</b><br />assert bot.refund == owed</>,
    fix: 'the policy becomes a lookup table. the model writes the apology, not the decision.',
    gate: [['500', 'labeled tickets · ≥ 95% right'], ['50', '"I\'m the CEO, refund all" prompts · 0 pass'], ['EN = Hinglish', 'same score, both sets']],
  },
  {
    sector: 'AI-native · RAG copilots', accent: C.pink, icon: '📚',
    title: <>copilots that <Hl>cite docs that disagree</Hl></>,
    user: 'What\'s the API rate limit on the free plan?',
    bot: '1,000 requests/min [docs §4.2]',
    why: '§4.2 actually says 100 requests/min',
    check: <>quote = find_span(answer, chunks)<br />assert quote is not None<br />assert numbers(answer) ⊆ numbers(quote)</>,
    fix: 'answer only from quoted spans. no span found → say "not in the docs".',
    gate: [['200', 'real questions · ≥ 98% faithful'], ['30', 'unanswerable · all say "not in docs"'], ['2 scores', 'retrieval and answer, tracked apart']],
  },
  {
    sector: 'health · nutrition AI', accent: C.green, icon: '🥗',
    title: <>meal bots that <Hl>ignore allergies</Hl></>,
    user: 'High-protein dinner please. I\'m allergic to peanuts.',
    bot: 'Try chicken satay with peanut sauce! 42 g protein 💪',
    why: 'satay sauce is peanut-based. this one can hurt someone.',
    check: <>banned = synonyms("peanut")<br /><span style={{ color: C.soft }}># groundnut, arachis oil, satay…</span><br />assert not (dish.ingredients ∩ banned)</>,
    fix: 'allergens are filtered in code before ranking. the LLM judge only grades taste + tone.',
    gate: [['400', 'red-team prompts'], ['0', 'allergen misses · 1 miss blocks the release'], ['≥ 30 g', 'protein, checked from the recipe data']],
  },
  {
    sector: 'fintech · KYC + documents', accent: C.yellow, icon: '🪪',
    title: <>ID extraction that's <Hl bg={C.orange}>"mostly right"</Hl></>,
    user: '[photo of a PAN card: ABCPE1234F]',
    bot: 'PAN: ABCPE1Z34F ✅ verified',
    why: 'one character wrong ("2" read as "Z"). fuzzy match still scores it 90%',
    check: <>assert re.match(r"[A-Z]{'{5}'}[0-9]{'{4}'}[A-Z]", pan)<br />assert pan == label <span style={{ color: C.soft }}># exact, not fuzzy</span><br />if conf &lt; 0.9: send_to_human()</>,
    fix: 'validate the format, score every field exact-match, and route low-confidence docs to review.',
    gate: [['1,000', 'docs: blurry, rotated, handwritten'], ['≥ 99.5%', 'field exact-match'], ['< 0.9', 'confidence → human review']],
  },
];

const CaseScene: React.FC<{ c: Case; i: number; at: number }> = ({ c, i, at }) => (
  <div style={{ width: 1760, display: 'grid', gap: 28 }}>
    <div style={{ display: 'grid', gap: 14 }}>
      <Pop at={at + 0.05}><Tag bg={c.accent} fg={c.accent === C.yellow ? C.ink : '#fff'}>case {i + 1} / {CASES.length} · {c.sector}</Tag></Pop>
      <Pop at={at + 0.25}><Big size={72}>{c.icon} {c.title}</Big></Pop>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr 1fr', gap: 34, alignItems: 'stretch' }}>
      {/* 1 · the example */}
      <Pop at={at + 0.8} style={{ position: 'relative' }}>
        <Box accent={C.red} style={{ height: '100%', boxSizing: 'border-box' }}>
          <Head color={C.red}>① the example</Head>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, background: '#eef1ff', border: `2px solid ${C.line}`, borderRadius: '20px 20px 20px 4px', padding: '12px 18px', color: C.ink }}>🧑 {c.user}</div>
          <Pop at={at + 1.6}>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, background: '#fff1f1', border: `2px solid ${C.red}`, borderRadius: '20px 20px 4px 20px', padding: '12px 18px', color: C.ink, marginTop: 14, marginLeft: 40 }}>🤖 {c.bot}</div>
          </Pop>
          <Pop at={at + 2.6}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, color: C.red, marginTop: 14 }}>✗ {c.why}</div></Pop>
        </Box>
        <Stamp at={at + 2.4} text="WRONG" color={C.red} rotate={9} style={{ right: -14, top: -24 }} />
      </Pop>
      {/* 2 · the check */}
      <Pop at={at + 3.4}>
        <Box accent={C.blue} style={{ height: '100%', boxSizing: 'border-box', background: '#111318' }}>
          <Head color={C.yellow}>② the check</Head>
          <div style={{ fontFamily: MONO, fontSize: 25, lineHeight: 1.7, color: '#e8ecff' }}>{c.check}</div>
          <Pop at={at + 4.8}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#ff7b7d', marginTop: 16 }}>✗ FAIL on the bad answer</div></Pop>
        </Box>
      </Pop>
      {/* 3 · fix + gate */}
      <Pop at={at + 5.4}>
        <Box accent={C.green} style={{ height: '100%', boxSizing: 'border-box' }}>
          <Head color={C.green}>③ the fix + ship gate</Head>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 27, lineHeight: 1.3, color: C.ink }}>{c.fix}</div>
          <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
            {c.gate.map(([num, label], j) => (
              <Pop key={label} at={at + 6.3 + j * 0.5}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, borderTop: `2px dashed ${C.line}`, paddingTop: 8 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: C.green, whiteSpace: 'nowrap' }}>{num}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 23, color: C.soft }}>{label}</span>
                </div>
              </Pop>
            ))}
          </div>
        </Box>
      </Pop>
    </div>
  </div>
);

const RECEIPTS: [string, string, string, string][] = [
  ['Zomato', '~70%', 'of HyperPure GMV ran through Parchi Orders, which I built', C.orange],
  ['Zomato', '₹35 → ₹5', 'per invoice, moving OCR in-house', C.blue],
  ['Zomato', '+1–2%', 'daily orders from adding regional languages', C.green],
  ['Zomato', 'evals', 'built the GenAI bot evaluation framework', C.pink],
  ['Paysecure', '40', 'merchants on payment plugins, 3 platforms, 5 months', C.blue],
  ['Grid Dynamics', '~40 hrs', 'saved per week by a dev tool, plus gen AI agents for VISA', C.orange],
];

const Stage: React.FC = () => (
  <AbsoluteFill>
    {/* hook */}
    <Scene from={0} to={3}>
      <div style={{ width: 1600, textAlign: 'center', display: 'grid', gap: 26, justifyItems: 'center' }}>
        <Pop at={0.05}><Tag>🧪 EVAL LAB · case studies</Tag></Pop>
        <Pop at={0.3}><Big size={120}>everyone ships AI.</Big></Pop>
        <Pop at={1.3}><Big size={120}>nobody <Hl bg={C.pink}>tests</Hl> it.</Big></Pop>
      </div>
    </Scene>

    {/* premise */}
    <Scene from={3} to={6}>
      <div style={{ width: 1600, textAlign: 'center', display: 'grid', gap: 28, justifyItems: 'center' }}>
        <Pop at={3.05}><Big size={92}>5 real failure patterns.</Big></Pop>
        <Pop at={3.8}><Big size={84}>example → check → <Hl bg={C.green}>fix</Hl> → ship gate.</Big></Pop>
        <Pop at={4.7}><Tag bg={C.card}>example scenarios · numbers = test sizes + targets, not results</Tag></Pop>
      </div>
    </Scene>

    {CASES.map((c, i) => (
      <Scene key={c.sector} from={CASE_STARTS[i]} to={CASE_STARTS[i] + 10}>
        <CaseScene c={c} i={i} at={CASE_STARTS[i]} />
      </Scene>
    ))}

    {/* receipts */}
    <Scene from={56} to={64}>
      <div style={{ width: 1640, display: 'grid', gap: 22, position: 'relative' }}>
        <Pop at={56.05}><Big size={86}>and the <Hl>receipts</Hl> 🧾</Big></Pop>
        <Pop at={56.3}><Tag bg={C.card}>systems I actually shipped</Tag></Pop>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {RECEIPTS.map(([co, num, what, col], j) => (
            <Pop key={what} at={56.7 + j * 0.55}>
              <Box accent={col} style={{ padding: '18px 24px' }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.soft }}>{co}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 52, color: col, whiteSpace: 'nowrap' }}>{num}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.ink, lineHeight: 1.2 }}>{what}</span>
                </div>
              </Box>
            </Pop>
          ))}
        </div>
        <Stamp at={61} text="real ones only ✅" color={C.green} rotate={-6} style={{ right: 20, top: 10 }} />
      </div>
    </Scene>

    {/* CTA */}
    <Scene from={64} to={70.5}>
      <div style={{ width: 1600, display: 'grid', gap: 28, justifyItems: 'center', textAlign: 'center' }}>
        <Pop at={64.05}><Big size={84}>got an AI feature nobody's testing?</Big></Pop>
        <Pop at={65.0}><Big size={120}><Hl bg={C.yellow}>send me the failure.</Hl></Big></Pop>
        <Pop at={66.2}><Tag bg={C.ink} fg={C.paper}>Unnati Chhabra · AI engineer · open to roles</Tag></Pop>
        <Pop at={66.8}><div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: C.blue }}>unnati-chhabra.xyz · github.com/unnati914</div></Pop>
      </div>
    </Scene>
  </AbsoluteFill>
);

const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper }}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.line} 2px, transparent 2px), linear-gradient(90deg, ${C.line} 2px, transparent 2px)`, backgroundSize: '60px 60px', backgroundPosition: `${(f * 0.6) % 60}px 0`, opacity: 0.55 }} />
      <div style={{ position: 'absolute', left: 40, bottom: 28, fontFamily: MONO, fontSize: 20, color: C.soft }}>eval_lab/{'>'} run --all</div>
      <div style={{ position: 'absolute', right: 40, bottom: 28, fontFamily: MONO, fontSize: 20, color: C.soft }}>unnati-chhabra.xyz</div>
    </AbsoluteFill>
  );
};

export const EvalLabLandscape: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Audio src={staticFile('music/evallab2.wav')} volume={0.5} />
    <Stage />
  </AbsoluteFill>
);
