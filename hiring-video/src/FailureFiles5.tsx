import React, { createContext, useContext } from 'react';
import { AbsoluteFill, Audio, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import WORDS from './f5-words.json';
import { PhotoCues } from './FailurePhotos';

// AI Failure Files #005: the lawyers who used fake court cases (Mata v. Avianca, S.D.N.Y., June 2023).
// Theme: a lawyer's yellow legal pad, typewriter text, court stamps.
// Voice first: every beat is keyed to a WORD in src/f5-words.json (placeholder TTS now; re-transcribe her recording and it re-times).
// [FACE] sections show her camera clip when FACE_VIDEO is set; until then a placeholder frame marks where it goes.
const FPS = 30;
export const FACE_VIDEO: string | null = null; // e.g. 'f5/face.mp4' (same timeline as the voice)
const VOICE = 'f5/voice.wav';

const C = { pad: '#fdf3b4', pad2: '#f7e98e', line: '#9ec3e6', margin: '#e57373', ink: '#1d2a44', red: '#c62828', green: '#2e7d32', paper: '#fffdf6', dark: '#14161f' };
const TYPE = "'Courier New', Courier, monospace";
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const HAND = "'Marker Felt', 'Chalkboard SE', 'Comic Sans MS', cursive";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// When LIVE, FACE scenes are transparent (her real footage shows underneath) and lower-thirds sit at the top.
export const LiveCtx = createContext(false);

// ---------- word timing ----------
type W = { t: number; e: number; w: string };
export const words = WORDS as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
export const find = (at: string, from: number) => {
  const alts = at.split('|').map((a) => a.split(' ').map(norm));
  for (let i = Math.max(0, from); i < words.length; i++)
    if (alts.some((a) => a.every((tok, k) => i + k < words.length && norm(words[i + k].w) === tok))) return i;
  return -1;
};
export const END = words[words.length - 1].e + 2.2;
export const FILES5_FRAMES = Math.ceil(END * FPS);

type Beat = { at: string; face?: boolean };
const BEATS: Beat[] = [
  { at: 'this', face: true }, { at: 'happened' }, { at: 'man' }, { at: 'food' }, { at: 'lawyers' }, { at: 'save' },
  { at: 'gave' }, { at: 'looked' }, { at: 'none' }, { at: 'made' }, { at: 'its a crazy|here', face: true }, { at: 'other' },
  { at: 'judge' }, { at: 'june' }, { at: 'so', face: true }, { at: 'simple' }, { at: 'every' }, { at: 'never' },
  { at: 'check with' }, { at: 'tip', face: true }, { at: 'case closed' },
];
export const R = (() => {
  let cur = 0;
  return BEATS.map((b, i) => {
    let idx = find(b.at, cur); if (idx < 0) idx = Math.min(words.length - 1, cur);
    cur = idx + 1;
    return { ...b, i, idx, start: i === 0 ? 0 : words[idx].t - 0.1 };
  }).map((b, i, arr) => ({ ...b, end: i < arr.length - 1 ? arr[i + 1].start : END }));
})();
const when = (word: string, beat: number, fb = 0.4) => { const j = find(word, R[beat].idx); return j < 0 ? R[beat].start + fb : words[j].t; };

// ---------- helpers ----------
const useT = () => useCurrentFrame() / FPS;
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ at, children, style, rot = 0 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - Math.round(at * FPS), fps, config: { damping: 12, stiffness: 180 } });
  return <div style={{ opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 30}px) scale(${0.9 + 0.1 * p}) rotate(${rot}deg)`, ...style }}>{children}</div>;
};
const Stamp: React.FC<{ at: number; text: string; color?: string; rot?: number; size?: number; style?: React.CSSProperties }> = ({ at, text, color = C.red, rot = -12, size = 64, style }) => {
  const t = useT(); if (t < at) return null;
  const p = interpolate(t, [at, at + 0.18], [2.2, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return <div style={{ position: 'absolute', transform: `rotate(${rot}deg) scale(${p})`, fontFamily: SANS, fontWeight: 900, fontSize: size, color, border: `7px solid ${color}`, borderRadius: 12, padding: '2px 22px', letterSpacing: 4, opacity: 0.88, mixBlendMode: 'multiply', whiteSpace: 'nowrap', ...style }}>{text}</div>;
};
const Type: React.FC<{ at: number; text: string; cps?: number; style?: React.CSSProperties }> = ({ at, text, cps = 28, style }) => {
  const t = useT(); const n = Math.max(0, Math.floor((t - at) * cps));
  return <span style={{ fontFamily: TYPE, ...style }}>{text.slice(0, n)}{n < text.length && t >= at && Math.floor(t * 3) % 2 ? '▌' : ''}</span>;
};

// ---------- backgrounds ----------
const Pad: React.FC = () => (
  <AbsoluteFill style={{ background: C.pad }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent 0 58px, ${C.line} 58px 61px)`, opacity: 0.8, top: 140 }} />
    <div style={{ position: 'absolute', left: 170, top: 0, bottom: 0, width: 3, background: C.margin, opacity: 0.8 }} />
    <div style={{ position: 'absolute', left: 178, top: 0, bottom: 0, width: 3, background: C.margin, opacity: 0.8 }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(120,90,20,0.18))' }} />
  </AbsoluteFill>
);
const Header: React.FC = () => (
  <div style={{ position: 'absolute', top: 40, left: 230, right: 80, display: 'flex', justifyContent: 'space-between', fontFamily: TYPE, fontSize: 26, color: C.ink, opacity: 0.75 }}>
    <span>AI FAILURE FILES · CASE #005</span><span>Mata v. Avianca · S.D.N.Y. · 2023</span>
  </div>
);

// FACE section: her camera clip (when provided) or a clear placeholder frame.
const Face: React.FC<{ b: (typeof R)[number] }> = ({ b }) => {
  if (useContext(LiveCtx)) return null;
  const line = words.slice(b.idx, words.findIndex((w) => w.t >= b.end) + 0 || undefined).map((w) => w.w).join(' ');
  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {FACE_VIDEO ? <OffthreadVideo src={staticFile(FACE_VIDEO)} startFrom={0} muted /> : (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 1500, height: 840, border: '4px dashed rgba(255,255,255,0.35)', borderRadius: 30, display: 'grid', placeItems: 'center', textAlign: 'center', color: '#fff', fontFamily: SANS }}>
            <div><div style={{ fontSize: 90 }}>🎥</div><div style={{ fontSize: 46, fontWeight: 800, marginTop: 10 }}>YOUR FACE HERE</div>
              <div style={{ fontSize: 30, opacity: 0.75, marginTop: 18, maxWidth: 1200 }}>“{line}”</div></div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// small typewritten case card (the six citations ChatGPT invented, as named in the court's ruling)
const FAKE = ['Varghese v. China Southern Airlines', 'Shaboon v. EgyptAir', 'Petersen v. Iran Air', 'Martinez v. Delta Air Lines', 'Estate of Durden v. KLM', 'Miller v. United Airlines'];
const Card: React.FC<{ name: string; i: number; at: number; hl: { names: number; quotes: number; dates: number }; real?: number; none?: number; gone?: number }> = ({ name, i, at, hl, real, none, gone }) => {
  const t = useT();
  const fall = gone ? interpolate(t, [gone + i * 0.08, gone + i * 0.08 + 0.7], [0, 1], clamp) : 0;
  const mark = (k: keyof typeof hl) => (t >= hl[k] ? { background: 'rgba(255,214,0,0.65)' } : {});
  return (
    <Pop at={at} rot={(i % 2 ? 1.5 : -1.5)} style={{ width: 470, transform: `translateY(${fall * 900}px) rotate(${fall * (i % 2 ? 40 : -40)}deg)`, opacity: 1 - fall * 0.8 }}>
      <div style={{ position: 'relative', background: C.paper, padding: '18px 22px', boxShadow: '6px 8px 0 rgba(29,42,68,0.15)', borderTop: `6px solid ${C.margin}` }}>
        <div style={{ fontFamily: TYPE, fontWeight: 700, fontSize: 25, color: C.ink, ...mark('names') }}>{name}</div>
        <div style={{ fontFamily: TYPE, fontSize: 19, color: '#555', marginTop: 8, ...mark('quotes') }}>“…the carrier is liable for…”</div>
        <div style={{ fontFamily: TYPE, fontSize: 19, color: '#555', marginTop: 4, display: 'inline-block', ...mark('dates') }}>F.3d · 20{10 + i}</div>
        {real && t >= real + i * 0.06 && !(none && t >= none) ? <div style={{ position: 'absolute', right: 14, top: 10, fontSize: 40, color: C.green }}>✓</div> : null}
        {none ? <Stamp at={none + i * 0.12} text="NOT REAL" size={34} rot={-10} style={{ right: 10, top: 30 }} /> : null}
      </div>
    </Pop>
  );
};

const Chat: React.FC<{ msgs: { at: number; who: 'me' | 'ai'; text: string }[]; w?: number; style?: React.CSSProperties }> = ({ msgs, w = 760, style }) => {
  const t = useT();
  return (
    <div style={{ width: w, background: '#fff', borderRadius: 22, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden', ...style }}>
      <div style={{ background: '#f1f3f6', padding: '14px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: '#333' }}>🤖 AI chatbot</div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, minHeight: 120 }}>
        {msgs.filter((m) => t >= m.at).map((m, i) => (
          <Pop key={i} at={m.at} style={{ alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
            <div style={{ background: m.who === 'me' ? '#2b6cff' : '#eef0f4', color: m.who === 'me' ? '#fff' : '#111', padding: '12px 18px', borderRadius: 18, fontFamily: SANS, fontSize: 28, fontWeight: 600 }}>{m.text}</div>
          </Pop>
        ))}
      </div>
    </div>
  );
};

const Lower: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Pop at={at} style={{ position: 'absolute', left: 90, ...(useContext(LiveCtx) ? { top: 70 } : { bottom: 90 }) }}>
    <div style={{ background: C.pad, color: C.ink, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '16px 28px', borderLeft: `10px solid ${C.red}`, boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}>{children}</div>
  </Pop>
);

// ---------- scenes ----------
// LIVE mode: the [FACE] moments become animated graphics too (her face only shows in a small bubble).
const LiveFace: React.FC<{ b: (typeof R)[number] }> = ({ b }) => {
  const t = useT();
  const W = (word: string, fb?: number) => when(word, b.i, fb);
  const big = (txt: React.ReactNode, color = C.ink, size = 64): React.ReactNode => <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, color, letterSpacing: -1 }}>{txt}</div>;
  if (b.i === 0) return (<><Pad /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <Pop at={0.1}>{big('AI FAILURE FILES', C.ink, 130)}</Pop>
    <div style={{ position: 'relative', height: 170, width: 900 }}><Stamp at={W('case', 1.2)} text="CASE #005" size={96} rot={-6} style={{ left: 200, top: 30 }} /></div>
    <div style={{ fontFamily: TYPE, fontSize: 48, color: C.ink, minHeight: 60, marginTop: 40 }}><Type at={W('lawyers', 2.6)} text="The lawyers who used fake court cases" cps={26} /></div>
    <Pop at={W('fake', 3.5)} style={{ fontSize: 90, marginTop: 20 }}>⚖️🤖❓</Pop>
  </AbsoluteFill></>);
  if (b.i === 10) return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Pop at={b.start + 0.05} style={{ fontFamily: HAND, fontSize: 70, color: C.red, marginBottom: 30 }}>and here is the crazy part…</Pop>
    <Chat w={1000} msgs={[{ at: W('are'), who: 'me', text: 'Are these cases real?' }, { at: W('yes'), who: 'ai', text: 'Yes. ✅' }]} />
    {t >= W('yes') && <Pop at={W('yes') + 0.2} style={{ position: 'absolute', right: 200, top: 210, fontSize: 150 }}>🤯</Pop>}
  </AbsoluteFill></>);
  if (b.i === 14) return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40 }}>
    <Pop at={b.start + 0.05}>{big('So what went wrong?', C.ink, 100)}</Pop>
    <Pop at={W('made')}><div style={{ background: C.paper, padding: '22px 40px', borderLeft: `14px solid ${C.red}`, boxShadow: '8px 10px 0 rgba(29,42,68,0.15)' }}>{big('❌  The AI made up sources', C.ink, 60)}</div></Pop>
    <Pop at={W('nobody')}><div style={{ background: C.paper, padding: '22px 40px', borderLeft: `14px solid ${C.red}`, boxShadow: '8px 10px 0 rgba(29,42,68,0.15)' }}>{big('❌  Nobody checked them', C.ink, 60)}</div></Pop>
  </AbsoluteFill></>);
  if (b.i === 19) {
    const click = W('open');
    const p = interpolate(t, [click - 0.6, click], [0, 1], clamp);
    return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.05}>{big('💡 TIP OF THE DAY', C.red, 90)}</Pop>
      <Pop at={W('link')} style={{ marginTop: 50, position: 'relative' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: '22px 34px', fontFamily: SANS, fontSize: 46, color: '#1a56db', textDecoration: 'underline', boxShadow: '0 14px 34px rgba(0,0,0,0.18)', transform: `scale(${t >= click && t < click + 0.15 ? 0.95 : 1})` }}>🔗 the source the AI gave you</div>
        <div style={{ position: 'absolute', fontSize: 70, left: 520 - 260 * (1 - p), top: 60 + 120 * (1 - p) }}>👆</div>
      </Pop>
      <div style={{ position: 'relative', height: 200, width: 900 }}><Stamp at={W('every', 0.8)} text="OPEN IT. EVERY TIME." size={70} rot={-5} style={{ left: 110, top: 60 }} /></div>
    </AbsoluteFill></>);
  }
  return null;
};

export const Scene: React.FC<{ b: (typeof R)[number] }> = ({ b }) => {
  const live = useContext(LiveCtx);
  if (live && b.face) return <LiveFace b={b} />;
  const t = useT();
  const W = (word: string, fb?: number) => when(word, b.i, fb);
  switch (b.i) {
    case 0: return (<><Face b={b} /><Lower at={1.6}>CASE #005 · <span style={{ color: C.red }}>The lawyers who used fake court cases</span></Lower></>);
    case 1: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><Stamp at={W('2023')} text="2023 · NEW YORK" size={110} rot={-6} color={C.ink} /></AbsoluteFill></>);
    case 2: return (<><Pad /><Header /><Pop at={b.start + 0.1} style={{ position: 'absolute', left: 230, top: 880, fontFamily: HAND, fontSize: 64, color: C.ink, width: 900 }}>a man sued an airline ✈️</Pop>
      <PhotoCues cues={[{ at: b.start + 0.15, dur: Math.max(1.2, b.end - b.start - 0.45), img: 'c5a', tag: 'Real case: Mata v. Avianca, 2023', side: 'right' }]} /></>);
    case 3: return (
      <><Pad /><Header />
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 900, height: 420 }}>
            {/* original drawing: a serving cart rolling into a knee */}
            <svg width={900} height={420} viewBox="0 0 900 420">
              <g transform={`translate(${interpolate(t, [b.start, W('hit')], [-200, 330], clamp)},0)`}>
                <rect x={0} y={150} width={220} height={190} rx={14} fill="#cfd8dc" stroke={C.ink} strokeWidth={6} />
                <rect x={20} y={175} width={180} height={50} rx={6} fill="#fff" stroke={C.ink} strokeWidth={4} />
                <rect x={20} y={245} width={180} height={50} rx={6} fill="#fff" stroke={C.ink} strokeWidth={4} />
                <circle cx={45} cy={355} r={18} fill={C.ink} /><circle cx={175} cy={355} r={18} fill={C.ink} />
              </g>
              <path d="M720 60 L700 230 L760 360" stroke={C.ink} strokeWidth={34} fill="none" strokeLinecap="round" />
              <circle cx={700} cy={230} r={30} fill="#f2c29b" stroke={C.ink} strokeWidth={6} />
            </svg>
            {t >= W('hit') && <Stamp at={W('hit')} text="OUCH!" size={70} rot={8} style={{ left: 560, top: 30 }} />}
            <Pop at={W('flight')} style={{ position: 'absolute', left: 0, bottom: -60, fontFamily: TYPE, fontSize: 32, color: C.ink }}>“a food cart hit his knee on a flight”</Pop>
          </div>
        </AbsoluteFill>
      </>);
    case 4: return (<><Pad /><Header /><div style={{ position: 'absolute', left: 260, top: 230, width: 1300 }}>
      <Pop at={b.start + 0.1}><div style={{ fontFamily: HAND, fontSize: 56, color: C.ink }}>His lawyers had to write a document for the judge:</div></Pop>
      <div style={{ marginTop: 50, fontSize: 40, lineHeight: '61px', color: C.ink }}><Type at={W('write') + 0.2} text="MOTION. Past court cases that support our client: ..." /></div></div></>);
    case 5: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.1} style={{ fontFamily: HAND, fontSize: 52, color: C.ink, marginBottom: 30 }}>to save time…</Pop>
      <Chat msgs={[{ at: W('find'), who: 'me', text: 'Find old court cases like this one.' }]} /></AbsoluteFill></>);
    case 6: case 7: case 8: case 9: {
      const s6 = R[6].start;
      return (<><Pad /><Header /><div style={{ position: 'absolute', left: 230, top: 150, right: 90, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
        {FAKE.map((n, i) => <Card key={n} name={n} i={i} at={when('six', 6) + i * 0.15}
          hl={{ names: when('names', 6), quotes: when('quotes', 6), dates: when('dates', 6) }}
          real={b.i >= 7 ? R[7].start + 0.3 : undefined} none={b.i >= 8 ? R[8].start + 0.2 : undefined} gone={b.i >= 9 ? R[9].start + 0.6 : undefined} />)}
      </div>
        {b.i === 6 && t < s6 + 1.4 && <Pop at={s6} style={{ position: 'absolute', right: 120, bottom: 90, fontFamily: HAND, fontSize: 60, color: C.red }}>6 cases!</Pop>}
        {b.i === 7 && <Pop at={R[7].start + 0.2} style={{ position: 'absolute', left: 260, bottom: 80, fontFamily: HAND, fontSize: 64, color: C.green }}>they looked real…</Pop>}
        {b.i === 9 && <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}><Stamp at={R[9].start + 0.2} text="MADE UP" size={160} rot={-8} /></AbsoluteFill>}
      </>);
    }
    case 10: return (<><Face b={b} /><Chat style={{ position: 'absolute', right: 80, top: 120 }} w={640} msgs={[{ at: when('are', 10), who: 'me', text: 'Are these cases real?' }, { at: when('yes', 10), who: 'ai', text: 'Yes.' }]} /></>);
    case 11: case 12: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <div style={{ width: 1200, background: '#fff', borderRadius: 60, padding: '26px 40px', boxShadow: '0 16px 40px rgba(0,0,0,0.18)', fontFamily: SANS, fontSize: 38, color: '#333' }}>🔍 <Type at={R[11].start + 0.3} text="Varghese v. China Southern Airlines" cps={22} /></div>
      <Pop at={when('anywhere', 11)} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.red }}>0 results</Pop>
      {b.i === 12 && <Pop at={R[12].start + 0.2} style={{ fontFamily: HAND, fontSize: 60, color: C.ink }}>the judge couldn’t find them either 🧑‍⚖️</Pop>}
    </AbsoluteFill>
      {b.i === 12 && <PhotoCues cues={[{ at: R[12].start + 0.5, dur: Math.max(0.9, R[12].end - R[12].start - 0.8), img: 'c5c', tag: 'Not in any court record', side: 'right' }]} />}</>);
    case 13: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.1} style={{ fontFamily: TYPE, fontSize: 44, color: C.ink }}>June 2023 · the judge ruled</Pop>
      <Stamp at={when('5000|5|five', 13, 2.6)} text="$5,000 FINE" size={140} rot={-7} style={{ position: 'relative', marginTop: 40 }} />
    </AbsoluteFill>
      <PhotoCues cues={[{ at: b.start + 0.1, dur: Math.max(1.2, when('5000|5|five', 13, 2.6) - b.start - 0.5), img: 'c5b', tag: 'Manhattan federal courthouse (S.D.N.Y.)', side: 'left' }]} /></>);
    case 14: return (<><Face b={b} /><div style={{ position: 'absolute', left: 90, top: 70, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Pop at={when('made', 14)}><div style={{ background: C.pad, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '12px 24px', borderLeft: `10px solid ${C.red}` }}>❌ The AI made up sources</div></Pop>
      <Pop at={when('nobody', 14)}><div style={{ background: C.pad, fontFamily: SANS, fontWeight: 800, fontSize: 40, padding: '12px 24px', borderLeft: `10px solid ${C.red}` }}>❌ Nobody checked them</div></Pop></div></>);
    case 15: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.1} style={{ fontFamily: HAND, fontSize: 56, color: C.ink }}>a simple test:</Pop>
      <Pop at={when('source', 15)}><div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 150, color: C.ink, letterSpacing: -2, marginTop: 10 }}>THE <span style={{ color: C.red }}>SOURCE</span> CHECK</div></Pop>
    </AbsoluteFill></>);
    case 16: {
      const items: [string, number, boolean][] = [['Does the case really exist?', when('exist', 16), true], ['Is the quote really in it?', when('quote', 16), true], ['Source not real → the answer FAILS', when('fails', 16), false]];
      return (<><Pad /><Header /><div style={{ position: 'absolute', left: 260, top: 240, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <Pop at={b.start + 0.1} style={{ fontFamily: HAND, fontSize: 54, color: C.ink }}>every time the AI gives a source:</Pop>
        {items.map(([txt, at, ok]) => <Pop key={txt} at={at}><div style={{ display: 'flex', alignItems: 'center', gap: 24, fontFamily: SANS, fontWeight: 800, fontSize: 56, color: C.ink }}>
          <span style={{ width: 70, height: 70, border: `5px solid ${C.ink}`, borderRadius: 10, display: 'grid', placeItems: 'center', color: ok ? C.green : C.red, fontSize: 52 }}>{ok ? '✓' : '✗'}</span>{txt}</div></Pop>)}
      </div></>);
    }
    case 17: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.1} style={{ fontSize: 200 }}>🤖🪞🤖</Pop>
      <Pop at={when('itself', 17)} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 80, color: C.ink, marginTop: 20 }}>Never ask the AI to check <span style={{ color: C.red, textDecoration: 'underline' }}>itself</span></Pop>
      <Stamp at={when('itself', 17) + 0.3} text="NO" size={120} rot={-14} style={{ top: 260 }} />
    </AbsoluteFill></>);
    case 18: return (<><Pad /><Header /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pop at={b.start + 0.1} style={{ fontSize: 190 }}>🗄️</Pop>
      <Pop at={when('database', 18)} style={{ fontFamily: SANS, fontWeight: 900, fontSize: 78, color: C.ink }}>Check with a <span style={{ color: C.green }}>real database ✓</span></Pop>
    </AbsoluteFill></>);
    case 19: return (<><Face b={b} /><Lower at={when('open', 19)}>💡 TIP: if the AI gives a link or source, <span style={{ color: C.red }}>open it. Every time.</span></Lower></>);
    case 20: return (<><Pad /><AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Stamp at={b.start + 0.1} text="CASE CLOSED" size={170} rot={-6} style={{ position: 'relative' }} />
      <Pop at={when('tuned', 20)} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 48, color: C.ink, marginTop: 70 }}>stay tuned for case <span style={{ color: C.red }}>#006</span></Pop>
      <Pop at={when('tuned', 20) + 0.6} style={{ fontFamily: TYPE, fontSize: 30, color: C.ink, marginTop: 30 }}>Unnati Chhabra · AI engineer · unnati-chhabra.xyz</Pop>
    </AbsoluteFill></>);
  }
  return null;
};

export const FailureFiles5: React.FC = () => {
  const t = useT();
  const b = [...R].reverse().find((x) => t >= x.start) ?? R[0];
  const drift = 1 + 0.02 * ((t - b.start) / Math.max(1, b.end - b.start)); // slow push-in per scene
  return (
    <AbsoluteFill style={{ background: C.pad, overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: b.face ? undefined : `scale(${drift})` }}><Scene key={b.i} b={b} /></AbsoluteFill>
      <Audio src={staticFile(VOICE)} />
      <Audio src={staticFile('music/funny.wav')} volume={(fr) => interpolate(fr / FPS, [0, 0.8, END - 1.8, END], [0.3, 0.13, 0.13, 0], clamp)} />
    </AbsoluteFill>
  );
};
