import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Three portrait shorts with different themes and original runner-style tracks:
//  FixShort   "Send a fix, not a resume"            (early-career; company in the example is not named, no numbers)
//  QuizShort  "5 questions that expose fake AI experience"  (recruiters)
//  FlipShort  "1 eval trick a day #1: flip rate"     (engineers; the 5-phrasing run is an illustrative example)
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const FIX_FRAMES = s(42);
export const QUIZ_FRAMES = s(40);
export const FLIP_FRAMES = s(38);

const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

type Theme = { bg1: string; bg2: string; ink: string; a: string; b: string; c: string; card: string; cardInk: string; bpm: number };
const FIX: Theme = { bg1: '#04071a', bg2: '#0f1a44', ink: '#ffffff', a: '#a3ff12', b: '#ff2bd6', c: '#22e4ff', card: 'rgba(8,14,40,0.9)', cardInk: '#ffffff', bpm: 112 };
const QUIZ: Theme = { bg1: '#12001a', bg2: '#33074a', ink: '#ffffff', a: '#ffd400', b: '#ff2bd6', c: '#4dff88', card: 'rgba(26,4,40,0.9)', cardInk: '#ffffff', bpm: 116 };
const FLIP: Theme = { bg1: '#001417', bg2: '#00384a', ink: '#ffffff', a: '#22e4ff', b: '#ff6b3d', c: '#ffe14d', card: 'rgba(0,26,34,0.9)', cardInk: '#ffffff', bpm: 108 };
const Land = React.createContext(false);
const useLand = () => React.useContext(Land);

const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 10, stiffness: 210 } });
  return <div style={{ opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`, ...style }}>{children}</div>;
};
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 110, color = '#fff', style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size * (useLand() ? 0.9 : 1), lineHeight: 1.0, letterSpacing: -3, color, textTransform: 'uppercase', WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', textShadow: '0 10px 0 rgba(0,0,0,0.35)', ...style }}>{children}</div>
);
const Sticker: React.FC<{ at: number; text: string; bg: string; rotate?: number; size?: number; color?: string; style?: React.CSSProperties }> = ({ at, text, bg, rotate = -8, size = 46, color = '#000', style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 7, stiffness: 240 } });
  return (
    <div style={{ position: 'absolute', zIndex: 5, transform: `rotate(${rotate}deg) scale(${p})`, fontFamily: SANS, fontWeight: 900, fontSize: size, color, background: bg, border: '6px solid #000', borderRadius: 20, padding: '6px 22px', boxShadow: '8px 8px 0 #000', whiteSpace: 'nowrap', ...style }}>{text}</div>
  );
};
const Card: React.FC<{ t: Theme; children: React.ReactNode; accent?: string; style?: React.CSSProperties }> = ({ t, children, accent, style }) => (
  <div style={{ background: t.card, color: t.cardInk, border: `3px solid ${accent ?? t.c}`, borderRadius: 28, boxShadow: `0 0 0 2px rgba(0,0,0,0.5), 0 0 44px ${accent ?? t.c}55, inset 0 0 30px ${accent ?? t.c}22`, padding: '28px 34px', ...style }}>{children}</div>
);
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const local = f - s(from);
  const op = interpolate(f, [s(to) - 5, s(to)], [1, 0], clamp);
  const sc = interpolate(local, [0, 7], [1.12, 1], { ...clamp, easing: ease });
  const rot = interpolate(local, [0, 7], [-2, 0], clamp);
  const l = useLand();
  const g = local < 5 ? (5 - local) * 7 * (local % 2 ? 1 : -1) : 0;
  return <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: op, transform: `translateX(${g}px) scale(${sc * (l ? 1.12 : 1)}) rotate(${rot}deg)`, padding: l ? '50px 230px 120px' : '0 70px', textAlign: l ? 'center' : undefined }}>{children}</AbsoluteFill>;
};
const Caption: React.FC<{ from: number; to: number; text: string; hot: string }> = ({ from, to, text, hot }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const words = text.split(' ');
  const l = useLand();
  return (
    <div style={{ position: 'absolute', bottom: l ? 34 : 250, left: l ? 200 : 60, right: l ? 200 : 60, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 18px' }}>
      {words.map((w, j) => {
        const p = interpolate(f - s(from) - j * 2, [0, 5], [0, 1], { ...clamp, easing: ease });
        const isHot = j === words.length - 1 || /\d|!|\?/.test(w);
        return <span key={j} style={{ fontFamily: SANS, fontWeight: 900, fontSize: l ? 46 : 58, color: isHot ? hot : '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', opacity: p, transform: `scale(${0.6 + 0.4 * p})`, display: 'inline-block' }}>{w}</span>;
      })}
    </div>
  );
};
const Backdrop: React.FC<{ t: Theme; shapes: string[] }> = ({ t, shapes }) => {
  const f = useCurrentFrame();
  const beat = (60 / t.bpm) * FPS;
  const ph = (f % beat) / beat;
  const flash = Math.exp(-ph * 5);
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${t.bg1}, ${t.bg2})` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${t.a}${Math.round(26 + 40 * flash).toString(16).padStart(2, '0')}, transparent 55%)` }} />
      {shapes.map((e, i) => {
        const x = (i * 263 + f * (1.2 + (i % 3) * 0.5)) % (width + 160) - 80;
        const y = height * 0.08 + ((i * 397) % (height * 0.84));
        return <div key={i} style={{ position: 'absolute', left: x, top: y + Math.sin(f / 20 + i) * 20, fontSize: 70, opacity: 0.18, transform: `rotate(${f * (i % 2 ? 1 : -1)}deg)` }}>{e}</div>;
      })}
    </AbsoluteFill>
  );
};
const Pulse: React.FC<{ bpm: number; children: React.ReactNode }> = ({ bpm, children }) => {
  const f = useCurrentFrame();
  const beat = (60 / bpm) * FPS;
  const sc = 1 + 0.015 * Math.exp(-((f % beat) / beat) * 6);
  return <AbsoluteFill style={{ transform: `scale(${sc})` }}>{children}</AbsoluteFill>;
};
const Handle: React.FC<{ t: Theme }> = ({ t }) => {
  const l = useLand();
  return <div style={{ position: 'absolute', ...(l ? { top: 34 } : { bottom: 120 }), left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: l ? 26 : 30, color: t.ink, opacity: 0.85, textShadow: '0 2px 0 rgba(0,0,0,0.4)' }}>@ unnati-chhabra.xyz</div>;
};


/* ───────────── shared tech layer: circuits w/ traveling pulses, neural net on the beat, HUD, code columns, scanlines ───────────── */
const CODE = ['const run = await eval(suite)', 'if (score < gate) block()', 'for (const c of cases) {', '  judge(bot(c.input))', '}', 'assert answer.cites(src)', 'p95_latency_ms: 412', 'flip_rate = flips / n', 'await sandbox.exec(cmd)', 'retry(withBackoff, 3)', 'tokens.stream().pipe(ui)', 'vec = embed(chunk)', 'top_k = 8', 'cache.hit ? 0 : cost'];
const TechLayer: React.FC<{ t: Theme }> = ({ t }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const beat = (60 / t.bpm) * FPS;
  const bi = Math.floor(f / beat);
  const flash = Math.exp(-((f % beat) / beat) * 4);
  // deterministic manhattan circuit traces
  const paths = Array.from({ length: 9 }, (_, i) => {
    const y0 = ((i * 137) % 100) / 100 * H;
    const x1 = ((i * 271) % 100) / 100 * W * 0.6 + W * 0.1;
    const y1 = (((i * 353) % 100) / 100) * H;
    const x2 = x1 + W * 0.25;
    return i % 2 ? `M 0 ${y0} H ${x1} V ${y1} H ${x2} V ${H}` : `M ${W} ${y0} H ${W - x1} V ${y1} H ${W - x2} V 0`;
  });
  // small neural net, bottom-right
  const layers = [4, 5, 3];
  const nx = W - 330, ny = H - 300;
  const nodes = layers.map((c, li) => Array.from({ length: c }, (_, j) => [nx + li * 110, ny + (j - (c - 1) / 2) * 48]));
  const edges: [number[], number[], number][] = [];
  nodes.slice(0, -1).forEach((L, li) => L.forEach((a, ai) => nodes[li + 1].forEach((b, bj) => edges.push([a, b, (li * 31 + ai * 7 + bj * 13) % 17]))));
  const hot = (k: number) => (k + bi) % 5 === 0;
  const stats = [
    ['eval', `${(bi * 3) % 50 + 1}/50 cases`],
    ['p95', `${380 + ((bi * 37) % 90)} ms`],
    ['tok/s', `${88 + ((bi * 13) % 24)}`],
  ];
  const corner = (st: React.CSSProperties) => <div style={{ position: 'absolute', width: 70, height: 70, borderColor: t.c, borderStyle: 'solid', opacity: 0.8, ...st }} />;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        {paths.map((d, i) => (
          <g key={i}>
            <path d={d} stroke={t.c} strokeOpacity={0.14} strokeWidth={3} fill="none" />
            <path d={d} stroke={i % 3 ? t.c : t.a} strokeOpacity={0.9} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="60 3000" strokeDashoffset={-((f * (9 + (i % 4) * 3) + i * 400) % 3060)} />
          </g>
        ))}
        {edges.map(([a, b, k], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={hot(k) ? t.a : t.c} strokeOpacity={hot(k) ? 0.35 + 0.5 * flash : 0.14} strokeWidth={hot(k) ? 3 : 2} />
        ))}
        {nodes.flat().map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill={t.bg1} stroke={(i + bi) % 4 === 0 ? t.a : t.c} strokeWidth={3} strokeOpacity={0.7} />
        ))}
      </svg>
      {[0, 1].map((side) => (
        <div key={side} style={{ position: 'absolute', top: 0, bottom: 0, [side ? 'right' : 'left']: 24, width: 300, overflow: 'hidden', opacity: 0.16, fontFamily: MONO, fontSize: 18, lineHeight: '30px', color: side ? t.a : t.c, textAlign: side ? 'right' : 'left' }}>
          <div style={{ transform: `translateY(${-((f * 1.6 + side * 200) % (CODE.length * 30))}px)` }}>
            {[...CODE, ...CODE, ...CODE, ...CODE, ...CODE].map((c, i) => <div key={i}>{c}</div>)}
          </div>
        </div>
      ))}
      {corner({ top: 24, left: 24, borderWidth: '4px 0 0 4px' })}
      {corner({ top: 24, right: 24, borderWidth: '4px 4px 0 0' })}
      {corner({ bottom: 24, left: 24, borderWidth: '0 0 4px 4px' })}
      {corner({ bottom: 24, right: 24, borderWidth: '0 4px 4px 0' })}
      <div style={{ position: 'absolute', left: 50, bottom: H > W ? 330 : 120, fontFamily: MONO, fontSize: 20, color: t.c, opacity: 0.75, lineHeight: 1.6, background: 'rgba(0,0,0,0.35)', border: `1px solid ${t.c}55`, borderRadius: 10, padding: '8px 14px' }}>
        {stats.map(([k, v]) => <div key={k}><span style={{ color: t.a }}>●</span> {k.padEnd(6, ' ')} {v}</div>)}
      </div>
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0 2px, transparent 2px 5px)' }} />
    </AbsoluteFill>
  );
};

/* ───────────────────────── 1 · Send a fix, not a resume ───────────────────────── */
const STEPS: [string, string, string[]][] = [
  ['pick ONE company', 'one you actually like. not 200. one.', []],
  ['find ONE real problem', 'dig where nobody looks:', ['use the product for a week', 'read the 1-star reviews', 'read their job posts + KPIs']],
  ['build a tiny fix', 'small, real, shippable:', ['a 1-page plan', 'a weekend POC with a demo link']],
  ['send it to a HUMAN', 'the founder or the hiring manager. not the portal.', []],
];
const Hud: React.FC<{ t: Theme }> = ({ t }) => {
  const f = useCurrentFrame();
  const sec = f / FPS;
  const lvl = sec < 8 ? 0 : Math.min(4, Math.floor((sec - 8) / 5.5) + 1);
  const coins = Math.round(interpolate(sec, [8, 30], [0, 400], clamp));
  return (
    <div style={{ position: 'absolute', top: useLand() ? 26 : 110, left: 60, right: 60, display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 900, fontSize: 40 }}>
      <span style={{ background: '#000', color: t.a, borderRadius: 16, padding: '6px 20px', border: `4px solid ${t.a}` }}>LVL {lvl}/4</span>
      <span style={{ background: '#000', color: t.c, borderRadius: 16, padding: '6px 20px', border: `4px solid ${t.c}` }}>🪙 {coins} XP</span>
    </div>
  );
};
const FixStage: React.FC = () => {
  const t = FIX;
  const starts = [8, 13.5, 19, 24.5];
  return (
    <AbsoluteFill>
      <Scene from={0} to={3}>
        <Pop at={0.05}><Big size={130}>I stopped sending resumes.</Big></Pop>
        <Sticker at={1.2} text="📄 → 🗑️" bg={t.b} rotate={-10} size={70} style={useLand() ? { right: 260, bottom: 170 } : { right: 110, top: 520 }} />
      </Scene>
      <Scene from={3} to={8}>
        <div style={{ display: 'grid', gap: 40, textAlign: 'center' }}>
          <Pop at={3.05}><Big size={120}>I started sending</Big></Pop>
          <Pop at={3.6}><Big size={190} color={t.a}>FIXES 🔧</Big></Pop>
        </div>
      </Scene>
      {STEPS.map(([h, sub, items], i) => (
        <Scene key={h} from={starts[i]} to={starts[i] + 5.5}>
          <div style={{ display: 'grid', gap: 34, width: '100%' }}>
            <Pop at={starts[i] + 0.05}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, background: t.a, color: '#000', border: '5px solid #000', borderRadius: 999, padding: '8px 28px' }}>STEP {i + 1}</span></Pop>
            <Pop at={starts[i] + 0.25}><Big size={112}>{h}</Big></Pop>
            <Pop at={starts[i] + 1.1}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, color: t.ink, lineHeight: 1.2 }}>{sub}</div></Pop>
            {i === 3 ? (
              <Pop at={starts[i] + 1.8}>
                <Card t={t} accent={t.a}>
                  <div style={{ fontFamily: MONO, fontSize: 26, color: t.c, marginBottom: 10 }}>DM · template</div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.35 }}>Hi! I noticed <b style={{ background: t.a, color: '#000' }}>___</b>. I built <b style={{ background: t.a, color: '#000' }}>___</b> to fix it. 2-min demo: <span style={{ color: t.c, textDecoration: 'underline' }}>link</span>. Happy to walk you through it.</div>
                </Card>
              </Pop>
            ) : (
              items.map((it, j) => (
                <Pop key={it} at={starts[i] + 1.7 + j * 0.6}>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: t.cardInk, background: t.card, border: `3px solid ${t.b}`, borderRadius: 22, padding: '14px 26px', boxShadow: `0 0 30px ${t.b}55` }}>✓ {it}</div>
                </Pop>
              ))
            )}
          </div>
          <Sticker at={starts[i] + 0.9} text="+100 XP" bg={t.c} rotate={10} size={44} style={useLand() ? { right: 150, top: 200 } : { right: 70, top: 300 }} />
        </Scene>
      ))}
      <Scene from={30} to={36}>
        <div style={{ display: 'grid', gap: 30, width: '100%' }}>
          <Pop at={30.05}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, background: t.b, color: '#000', border: '5px solid #000', borderRadius: 999, padding: '8px 28px' }}>MY EXAMPLE</span></Pop>
          <Pop at={30.3}><Big size={84}>a growth plan for a bootstrapped food startup</Big></Pop>
          {['🚃 office group orders', '🏋️ trainers prescribe meals', '💬 WhatsApp AI nutrition assistant'].map((x, j) => (
            <Pop key={x} at={31.3 + j * 0.6}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, background: t.card, color: t.cardInk, border: `3px solid ${t.a}`, borderRadius: 22, padding: '14px 26px', boxShadow: `0 0 30px ${t.a}55` }}>{x}</div></Pop>
          ))}
          <Pop at={33.4}><div style={{ fontFamily: MONO, fontSize: 30, color: t.ink, opacity: 0.8 }}>(company not named)</div></Pop>
        </div>
      </Scene>
      <Scene from={36} to={42.5}>
        <div style={{ display: 'grid', gap: 40, textAlign: 'center' }}>
          <Pop at={36.05}><Big size={84} color={t.ink}>worst case:</Big><Big size={84} color={t.c}>a portfolio piece</Big></Pop>
          <Pop at={37.4}><Big size={84} color={t.ink}>best case:</Big><Big size={96} color={t.a}>you skip the queue</Big></Pop>
          <Pop at={39}><div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#000', background: t.a, border: '5px solid #000', borderRadius: 999, padding: '12px 30px', display: 'inline-block' }}>follow for part 2: the DM that gets replies</div></Pop>
        </div>
      </Scene>
      <Caption from={0.2} to={2.9} text="POV: you applied everywhere. heard nothing?" hot={t.a} />
      <Caption from={3.3} to={7.9} text="resumes get skimmed. fixes get read." hot={t.a} />
      <Caption from={30.4} to={35.9} text="I did this for a real startup." hot={t.a} />
    </AbsoluteFill>
  );
};
const Streaks: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = ((f * (30 + i * 9) + i * 700) % (width + 900)) - 600;
        return <div key={i} style={{ position: 'absolute', left: x, top: height * (0.12 + i * 0.15), width: 420, height: 6, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${i % 2 ? FIX.a : FIX.c})`, opacity: 0.55 }} />;
      })}
    </AbsoluteFill>
  );
};
export const FixShort: React.FC = () => (
  <AbsoluteFill>
    <Backdrop t={FIX} shapes={['{ }', '</>', '⚡', '01', '🔧', '{ }', '</>', '⚙️']} />
    <TechLayer t={FIX} />
    <Streaks />
    <Audio src={staticFile('music/fix4.wav')} volume={0.55} />
    <Pulse bpm={FIX.bpm}><FixStage /></Pulse>
    <Hud t={FIX} />
    <Handle t={FIX} />
  </AbsoluteFill>
);

/* ─────────────────── 2 · 5 questions that expose fake AI experience ─────────────────── */
const QS: [string, string, string][] = [
  ['What was in your eval set?', '"we tested it manually, it looked good"', 'real user queries, labeled, re-run on every change'],
  ['What did it fail on?', '"it worked pretty well actually"', 'names a specific failure, and how they fixed it'],
  ['What did one request cost?', '"no idea, the company paid"', 'knows cost + latency per request, and how they cut it'],
  ['Why that model?', '"it\'s the best one"', 'compared 2–3 models on their own test set'],
  ['What would you cut to ship tomorrow?', '"nothing, it\'s all important"', 'a clear trade-off, and the reason'],
];
const QuizStage: React.FC = () => {
  const t = QUIZ;
  return (
    <AbsoluteFill>
      <Scene from={0} to={4}>
        <div style={{ display: 'grid', gap: 30, textAlign: 'center' }}>
          <Pop at={0.05}><Big size={110}>5 questions that expose</Big></Pop>
          <Pop at={0.8}><Big size={150} color={t.a}>FAKE AI</Big></Pop>
          <Pop at={1.3}><Big size={110}>experience 🕵️</Big></Pop>
          <Pop at={2.2}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, background: t.b, color: '#fff', border: '5px solid #000', borderRadius: 999, padding: '8px 26px' }}>for recruiters + hiring managers</span></Pop>
        </div>
      </Scene>
      {QS.map(([q, red, green], i) => {
        const a = 4 + i * 6;
        return (
          <Scene key={q} from={a} to={a + 6}>
            <div style={{ display: 'grid', gap: 34, width: '100%' }}>
              <Pop at={a + 0.05}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: useLand() ? 'center' : undefined }}>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 64, background: t.a, color: '#000', border: '6px solid #000', borderRadius: 24, padding: '4px 26px', boxShadow: '8px 8px 0 #000' }}>Q{i + 1}</span>
                  <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 40, color: t.ink }}>🔔 ask this:</span>
                </div>
              </Pop>
              <Pop at={a + 0.3}><Big size={96}>{q}</Big></Pop>
              <Pop at={a + 1.6} style={{ position: 'relative' }}>
                <Sticker at={a + 1.8} text="BZZT ❌" bg="#ff3b3b" color="#fff" rotate={9} size={40} style={{ right: -10, top: -34 }} />
                <Card t={t} accent="#ff3b3b">
                  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#ff3b3b' }}>🚩 RED FLAG</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, marginTop: 8, lineHeight: 1.25 }}>{red}</div>
                </Card>
              </Pop>
              <Pop at={a + 3.2} style={{ position: 'relative' }}>
                <Sticker at={a + 3.4} text="DING ✅" bg={t.c} rotate={-8} size={40} style={{ right: -10, top: -34 }} />
                <Card t={t} accent={t.c}>
                  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: '#4dff88' }}>✅ GREEN FLAG</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, marginTop: 8, lineHeight: 1.25 }}>{green}</div>
                </Card>
              </Pop>
            </div>
          </Scene>
        );
      })}
      <Scene from={34} to={40.5}>
        <div style={{ display: 'grid', gap: 36, textAlign: 'center' }}>
          <Pop at={34.05}><Big size={100}>real experience sounds like</Big></Pop>
          <Pop at={34.9}><Big size={150} color={t.a}>trade-offs.</Big></Pop>
          <Pop at={36.3}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, background: t.c, color: '#000', border: '5px solid #000', borderRadius: 999, padding: '12px 30px' }}>📤 send this to a recruiter</span></Pop>
        </div>
      </Scene>
      <Caption from={0.3} to={3.9} text="save this before your next AI interview!" hot={t.a} />
      <Caption from={34.4} to={40} text="vague answers = vibes. specifics = shipped it." hot={t.a} />
    </AbsoluteFill>
  );
};
const Spotlights: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.35 }}>
      {[0, 1].map((i) => (
        <div key={i} style={{ position: 'absolute', top: -200, left: i ? 620 : -100, width: 560, height: 2400, background: 'linear-gradient(180deg, rgba(255,255,255,0.9), transparent 70%)', transform: `rotate(${(i ? -1 : 1) * (14 + Math.sin(f / 25 + i) * 8)}deg)`, transformOrigin: 'top center', filter: 'blur(20px)' }} />
      ))}
    </AbsoluteFill>
  );
};
const Halftone: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: 'radial-gradient(circle, rgba(255,230,0,0.22) 3px, transparent 4px)', backgroundSize: '26px 26px', backgroundPosition: `${f % 26}px ${f % 26}px`, maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, black 75%)', WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, black 75%)' }} />
  );
};
export const QuizShort: React.FC = () => (
  <AbsoluteFill>
    <Backdrop t={QUIZ} shapes={['🚩', '✅', '❓', '</>', '🤖', '✅', '🚩', '{ }']} />
    <TechLayer t={QUIZ} />
    <Audio src={staticFile('music/quiz4.wav')} volume={0.55} />
    <Pulse bpm={QUIZ.bpm}><QuizStage /></Pulse>
    <Handle t={QUIZ} />
  </AbsoluteFill>
);

/* ─────────────────────── 3 · 1 eval trick a day #1: flip rate ─────────────────────── */
const PHRASES: [string, boolean, string][] = [
  ['Can I get a refund?', true, 'Yes, within 7 days'],
  ['refund pls', true, 'Yes, within 7 days'],
  ['i want my money back', false, "I can't help with that"],
  ['is this refundable?', true, 'Yes, within 7 days'],
  ['kya refund milega?', false, "Sorry, I didn't understand"],
];
const FlipStage: React.FC = () => {
  const t = FLIP;
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Scene from={0} to={3}>
        <div style={{ display: 'grid', gap: 30, textAlign: 'center' }}>
          <Pop at={0.05}><span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#000', background: t.c, border: '5px solid #000', borderRadius: 14, padding: '8px 22px' }}>1 EVAL TRICK A DAY · #1</span></Pop>
          <Pop at={0.4}><Big size={190} color={t.a}>FLIP RATE</Big></Pop>
          <Pop at={1.0}><Big size={140}>🔁</Big></Pop>
        </div>
      </Scene>
      <Scene from={3} to={8}>
        <div style={{ display: 'grid', gap: 36, textAlign: 'center' }}>
          <Pop at={3.05}><Big size={104}>your bot passed the test.</Big></Pop>
          <Pop at={4.4}><Big size={104} color={t.b}>now ask it again. differently.</Big></Pop>
        </div>
      </Scene>
      <Scene from={8} to={15}>
        <div style={{ display: 'grid', gap: 18, width: '100%' }}>
          <Pop at={8.05}><Big size={72} color={t.a}>same question, 5 ways:</Big></Pop>
          <div style={{ display: 'grid', gridTemplateColumns: useLand() ? '1fr 1fr' : '1fr', gap: 18 }}>
          {PHRASES.map(([q, ok, ans], j) => (
            <Pop key={q} at={8.6 + j * 0.8}>
              <div style={{ background: t.card, border: `5px solid ${ok ? t.a : t.b}`, borderRadius: 24, padding: '16px 24px', boxShadow: `8px 8px 0 ${ok ? t.a : t.b}` }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: '#fff' }}>🧑 {q}</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: ok ? t.a : t.b, marginTop: 4 }}>{ok ? '✅' : '❌'} 🤖 {ans}</div>
              </div>
            </Pop>
          ))}
          </div>
          <Pop at={13}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, justifyContent: 'center' }}>
              <Big size={110} color={t.c}>{Math.round(interpolate(f, [s(13), s(13.8)], [0, 40], clamp))}% flip</Big>
              <span style={{ fontFamily: MONO, fontSize: 28, color: '#fff', opacity: 0.8 }}>(2 of 5 · example)</span>
            </div>
          </Pop>
        </div>
      </Scene>
      <Scene from={15} to={22}>
        <div style={{ display: 'grid', gap: 26, width: '100%' }}>
          <Pop at={15.05}><Big size={96}>how to run it</Big></Pop>
          {['write 5 paraphrases per question', 'run all of them', 'label each answer: yes / no / refused', 'flip = groups where the labels disagree'].map((x, j) => (
            <Pop key={x} at={15.7 + j * 0.7}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 44, color: '#fff' }}>
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#000', background: t.a, border: '4px solid #000', borderRadius: 14, padding: '2px 16px' }}>{j + 1}</span>{x}
              </div>
            </Pop>
          ))}
          <Pop at={18.8}>
            <div style={{ background: '#000', border: `4px solid ${t.a}`, borderRadius: 22, padding: '20px 24px', fontFamily: MONO, fontSize: 30, color: '#e8ecff', lineHeight: 1.6 }}>
              labels = [judge(bot(p)) for p in variants]<br />flipped = len(set(labels)) &gt; 1
            </div>
          </Pop>
        </div>
      </Scene>
      <Scene from={22} to={28}>
        <div style={{ display: 'grid', gap: 34, textAlign: 'center' }}>
          <Pop at={22.05}><Big size={96}>aim for</Big></Pop>
          <Pop at={22.6}><Big size={170} color={t.a}>&lt; 5%</Big></Pop>
          <Pop at={23.4}><Big size={70}>on your top intents</Big></Pop>
          <Pop at={24.6}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: '#fff', lineHeight: 1.3 }}>fix it with a clearer policy in the prompt, or move the decision into code</div></Pop>
        </div>
      </Scene>
      <Scene from={28} to={33}>
        <div style={{ display: 'grid', gap: 34, textAlign: 'center' }}>
          <Pop at={28.05}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 48, background: t.b, color: '#000', border: '5px solid #000', borderRadius: 999, padding: '10px 28px' }}>PRO TIP</span></Pop>
          <Pop at={28.4}><Big size={100}>add Hinglish + typos</Big></Pop>
          <Pop at={29.6}><Big size={100} color={t.c}>that's where it breaks</Big></Pop>
        </div>
        <Sticker at={30.4} text="kya scene hai 😭" bg={t.c} rotate={-9} size={46} style={useLand() ? { left: 260, bottom: 190 } : { left: 90, bottom: 470 }} />
      </Scene>
      <Scene from={33} to={38.5}>
        <div style={{ display: 'grid', gap: 36, textAlign: 'center' }}>
          <Pop at={33.05}><Big size={90}>tomorrow:</Big></Pop>
          <Pop at={33.7}><Big size={130} color={t.a}>the turn-10 test</Big></Pop>
          <Pop at={35}><span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 44, background: t.c, color: '#000', border: '5px solid #000', borderRadius: 999, padding: '12px 30px' }}>follow so you don't miss it</span></Pop>
        </div>
      </Scene>
      <Caption from={3.3} to={7.9} text="most bots fail this in 30 seconds!" hot={t.c} />
      <Caption from={22.3} to={27.9} text="same intent should get the same answer." hot={t.c} />
    </AbsoluteFill>
  );
};
const ArcadeGrid: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ perspective: 600, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: -600, right: -600, bottom: -300, height: 1100, transform: 'rotateX(62deg)', backgroundImage: `linear-gradient(${FLIP.b}66 3px, transparent 3px), linear-gradient(90deg, ${FLIP.b}66 3px, transparent 3px)`, backgroundSize: '90px 90px', backgroundPosition: `0 ${(f * 6) % 90}px` }} />
    </AbsoluteFill>
  );
};
export const FlipShort: React.FC = () => (
  <AbsoluteFill>
    <Backdrop t={FLIP} shapes={['🔁', '</>', '01', '🤖', '🔁', '{ }', '01', '⚙️']} />
    <ArcadeGrid />
    <TechLayer t={FLIP} />
    <Audio src={staticFile('music/flip4.wav')} volume={0.55} />
    <Pulse bpm={FLIP.bpm}><FlipStage /></Pulse>
    <Handle t={FLIP} />
  </AbsoluteFill>
);

export const FixLand: React.FC = () => <Land.Provider value><FixShort /></Land.Provider>;
export const QuizLand: React.FC = () => <Land.Provider value><QuizShort /></Land.Provider>;
export const FlipLand: React.FC = () => <Land.Provider value><FlipShort /></Land.Provider>;
