import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import WORDS from './craft-words.json';

// "Hire me: I already started". A job pitch built with the simcraft method:
//  - video-script: one question, one story, one lesson; stakes in line 1.
//  - vox-explainer "style C": navy/red colour blocks, torn cream cards, condensed uppercase heads,
//    serif quotes, one yellow highlight per beat, black mono label strips, light grain,
//    motion on twos, slow push-in on every beat, no caption bar.
//  - voice first: every beat, highlight, list item and tag is keyed to a WORD in the voiceover
//    (src/craft-words.json from whisper). Re-record, re-transcribe, and the picture follows.

const FPS = 30;
const C = { navy: '#1E2B3A', red: '#C7302B', cream: '#F2EAD8', ink: '#151515', yellow: '#F5C518', white: '#fbf7ee' };
const HEAD = "'DIN Condensed', 'DIN Alternate', 'Avenir Next Condensed', sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = 'Menlo, monospace';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// ---------- word timing ----------
type W = { t: number; e: number; w: string };
const words = WORDS as W[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// First word at or after `from` matching any alternative ("a|b"). Short alternatives must match exactly.
// An alternative can be a phrase ("you get"): its words must follow each other.
const same = (w: string, a: string) => w === a || (a.length >= 4 && w.startsWith(a));
const find = (at: string, from: number) => {
  const alts = at.split('|').map((a) => a.split(' ').map(norm).filter(Boolean)).filter((a) => a.length);
  for (let i = Math.max(0, from); i < words.length; i++) {
    if (alts.some((a) => a.every((tok, k) => i + k < words.length && same(norm(words[i + k].w), tok)))) return i;
  }
  return -1;
};

type Tag = { text: string; at?: string; x: number; y: number; yellow?: boolean };
type Beat = {
  at: string; device: 'big' | 'card' | 'stat' | 'photo' | 'list' | 'phones' | 'pair' | 'duo' | 'end';
  bg: 'navy' | 'red' | 'paper'; flat?: boolean;
  text?: string; sub?: string; label?: string; head?: string; quote?: boolean;
  mark?: string; markAt?: string; submark?: string; submarkAt?: string;
  value?: number; prefix?: string; suffix?: string;
  img?: string; imgs?: string[]; caption?: string; names?: string[]; namesAt?: string[];
  items?: string[]; itemsAt?: string[]; tags?: Tag[]; tilt?: number; v2At?: string; keepCase?: boolean;
};

const BEATS: Beat[] = [
  { at: '4|four', device: 'big', bg: 'red', text: '4', sub: 'startups got a working product from me.', submark: 'working product', submarkAt: 'working' },
  { at: 'none', device: 'big', bg: 'navy', text: '0', sub: 'of them had hired me yet.', submark: 'hired me', submarkAt: 'hired' },
  { at: "i'm|im", device: 'card', bg: 'paper', label: 'Who is she', head: 'Unnati Chhabra', text: 'AI engineer.', mark: 'AI engineer', markAt: 'ai|engineer', tilt: -1.5 },
  { at: '2|two|years', device: 'list', bg: 'navy', label: 'So far', items: ['Zomato · 2 years', 'phidata · AI agents', 'Paysecure', 'Grid Dynamics'], itemsAt: ['zomato', 'agents|phidata', 'then|paysecure', 'grid'] },
  { at: 'when', device: 'card', bg: 'red', label: 'The habit', quote: true, text: "I don't wait for the interview.", mark: "don't wait", markAt: 'dont|wait', tilt: 1.2 },
  { at: 'learn', device: 'list', bg: 'navy', label: 'Overnight', items: ['Learn the product', 'Find the gap', 'Build it'], itemsAt: ['learn', 'find', 'build'] },
  { at: 'prodigal', device: 'photo', bg: 'paper', img: 'craft/prodigal.png', caption: 'prodigal-demo-sand.vercel.app', tilt: -1.2,
    tags: [{ text: 'Call Guard', at: 'call|guard', x: 66, y: 22 }, { text: '12 hard calls', at: '12|twelve', x: 62, y: 76, yellow: true }] },
  { at: 'alone', device: 'stat', bg: 'red', value: 4, suffix: ' / 12', sub: 'calls passed by the agent alone.', submark: 'agent alone', submarkAt: 'agent' },
  { at: 'for|agnost', device: 'photo', bg: 'paper', img: 'craft/agnost.png', caption: 'agnost-demo.vercel.app', tilt: 1.2,
    tags: [{ text: 'Every chat → a saved test', at: 'every', x: 52, y: 78, yellow: true }] },
  { at: 'wavelength', device: 'pair', bg: 'navy', imgs: ['craft/wave-pitch.png', 'craft/emergent.png'], names: ['Wavelength', 'Emergent'], namesAt: ['wavelength', 'emergent'] },
  { at: 'build', device: 'big', bg: 'red', text: 'The whole thing', mark: 'whole', markAt: 'whole', sub: 'not just the model call.' },
  { at: 'this|month', device: 'phones', bg: 'paper', imgs: ['craft/visa-slots.png', 'craft/visa-alerts.png'], label: 'US visa slots',
    tags: [{ text: 'Written in Go', at: 'go', x: 64, y: 30, yellow: true }] },
  { at: '4000|four', device: 'stat', bg: 'navy', value: 4000, sub: 'users in one load test.', submark: 'load test', submarkAt: 'load' },
  { at: 'every', device: 'big', bg: 'red', text: '<1 ms', keepCase: true, sub: 'for every reply, server side.', submark: 'every reply', submarkAt: 'reply' },
  { at: 'then', device: 'list', bg: 'navy', label: 'And then', items: ['Telegram bot', 'Phone app', 'Push alerts'], itemsAt: ['telegram', 'phone', 'push'] },
  { at: 'can|explain', device: 'card', bg: 'paper', label: 'The other half', quote: true, text: 'And I can explain it.', mark: 'explain it', markAt: 'explain', tilt: -1 },
  { at: '60000|sixty', device: 'duo', bg: 'navy', v2At: 'linkedin|21000|twenty' },
  { at: 'so', device: 'card', bg: 'red', label: 'So', text: "You don't get someone who will start in a month.", mark: 'in a month', markAt: 'month', tilt: 1 },
  { at: 'you get|already', device: 'big', bg: 'navy', text: 'Already started.', mark: 'started', markAt: 'started', sub: 'you get someone who' },
  { at: 'send', device: 'end', bg: 'paper', flat: true, head: 'Send me your product.', text: "I'll send you the demo.", mark: 'the demo', markAt: 'demo',
    tags: [{ text: '@Unnati_twts', x: 0, y: 0, at: 'demo' }, { text: 'unnati-chhabra.xyz', x: 0, y: 0, at: 'demo', yellow: true }] },
];

// Resolve every `at` to seconds, each search continuing after the previous beat.
type Resolved = Beat & { i: number; start: number; end: number; idx: number; when: (at: string | undefined, fallback?: number) => number };
const END = words.length ? words[words.length - 1].e + 1.8 : 10;
export const CRAFT_FRAMES = Math.ceil(END * FPS);
const resolved: Resolved[] = (() => {
  let cursor = 0;
  const out: Resolved[] = [];
  BEATS.forEach((b, i) => {
    let idx = find(b.at, cursor);
    if (idx < 0) { console.warn('beat word not found:', b.at); idx = Math.min(words.length - 1, cursor + 1); }
    cursor = idx + 1;
    const start = i === 0 ? 0 : Math.max(0, words[idx].t - 0.08);
    const when = (at: string | undefined, fallback = 0.5) => {
      if (!at) return start + fallback;
      const j = find(at, idx);
      return j < 0 ? start + fallback : words[j].t;
    };
    out.push({ ...b, i, start, end: END, idx, when });
  });
  out.forEach((b, i) => { if (i < out.length - 1) b.end = out[i + 1].start; });
  return out;
})();

// ---------- helpers ----------
const useT = () => useCurrentFrame() / FPS;
const useTq = () => Math.floor(useT() * 12) / 12; // motion on twos (12 drawings a second)
const useV = () => { const { width, height } = useVideoConfig(); return height > width; };
const U = 20; // 1 unit = 20 px (1080 short side / 54)

const torn = (seed: number) => {
  let r = (seed * 7919 + 13) % 233280;
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const top: string[] = []; const bot: string[] = [];
  for (let x = 0; x <= 100; x += 2.5) top.push(`${x}% ${(rnd() * 2.4).toFixed(2)}%`);
  for (let x = 100; x >= 0; x -= 2.5) bot.push(`${x}% ${(100 - rnd() * 2.4).toFixed(2)}%`);
  return `polygon(${[...top, ...bot].join(',')})`;
};

// Snappy stepped entrance at time `at` (no blur, no glide).
const Enter: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dy?: number }> = ({ at, children, style, dy = 40 }) => {
  const t = useTq();
  if (t < at) return <div style={{ ...style, opacity: 0 }}>{children}</div>;
  const p = interpolate(t - at, [0, 0.25], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return <div style={{ ...style, transform: `${style?.transform ?? ''} translateY(${(1 - p) * dy}px) scale(${0.96 + 0.04 * p})` }}>{children}</div>;
};

// Yellow highlighter sweep on one phrase; marked text turns ink as the marker passes.
const Hl: React.FC<{ text: string; mark?: string; at: number; dark?: boolean }> = ({ text, mark, at, dark }) => {
  const t = useTq();
  if (!mark || !text.includes(mark)) return <>{text}</>;
  const a = text.indexOf(mark);
  const w = interpolate(t, [at, at + 0.4], [0, 1], clamp);
  return (
    <>
      {text.slice(0, a)}
      <span style={{ position: 'relative', display: 'inline-block' }}>
        <span style={{ position: 'absolute', left: '-0.1em', right: '-0.1em', top: '6%', bottom: '2%', background: C.yellow, transformOrigin: 'left', transform: `scaleX(${w})` }} />
        <span style={{ position: 'relative', color: dark && w > 0.45 ? C.ink : undefined }}>{mark}</span>
      </span>
      {text.slice(a + mark.length)}
    </>
  );
};

const Strip: React.FC<{ children: React.ReactNode; yellow?: boolean; style?: React.CSSProperties }> = ({ children, yellow, style }) => (
  <span style={{ display: 'inline-block', background: yellow ? C.yellow : C.ink, color: yellow ? C.ink : C.cream, fontFamily: MONO, fontWeight: 700, fontSize: 1.55 * U, letterSpacing: 3, textTransform: 'uppercase', padding: `${0.45 * U}px ${0.9 * U}px`, ...style }}>{children}</span>
);

const Count: React.FC<{ to: number; at: number; dur?: number }> = ({ to, at, dur = 0.8 }) => {
  const t = useTq();
  const p = interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return <>{Math.round(to * p).toLocaleString('en-US')}</>;
};

// ---------- background: colour blocks with a diagonal split that changes each beat ----------
const Blocks: React.FC<{ b: Resolved }> = ({ b }) => {
  const t = useTq();
  const base = b.bg === 'paper' ? C.cream : b.bg === 'navy' ? C.navy : C.red;
  const other = b.bg === 'navy' ? C.red : C.navy;
  const side = b.i % 2;
  const a = 14 + ((b.i * 37) % 18);
  const drift = (t - b.start) * 8;
  const poly = side ? `polygon(${100 - a - 9}% -5%, 110% -5%, 110% 105%, ${100 - a + 7}% 105%)` : `polygon(-10% -5%, ${a + 9}% -5%, ${a - 7}% 105%, -10% 105%)`;
  return (
    <AbsoluteFill style={{ background: base }}>
      {!b.flat && <AbsoluteFill style={{ background: other, clipPath: poly, transform: `translateX(${side ? -drift : drift}px)` }} />}
    </AbsoluteFill>
  );
};

// ---------- devices ----------
const Big: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  const dark = b.bg !== 'paper';
  const fg = dark ? C.cream : C.ink;
  const long = (b.text ?? '').length > 6;
  return (
    <div style={{ textAlign: 'center', padding: `0 ${3 * U}px` }}>
      {b.sub && b.device === 'big' && b.text === 'Already started.' && (
        <Enter at={b.start}><div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 3.2 * U, color: fg, opacity: 0.85, marginBottom: U }}>{b.sub}</div></Enter>
      )}
      <Enter at={b.start}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, textTransform: b.keepCase ? 'none' : 'uppercase', color: fg, lineHeight: 0.9, letterSpacing: 2, fontSize: (long ? (V ? 9 : 11) : V ? 22 : 24) * U }}>
          <Hl text={b.text ?? ''} mark={b.mark} at={b.when(b.markAt)} dark={dark} />
        </div>
      </Enter>
      {b.sub && b.text !== 'Already started.' && (
        <Enter at={b.start + 0.25}>
          <div style={{ fontFamily: SERIF, fontSize: (V ? 3.4 : 3.6) * U, color: fg, marginTop: 1.6 * U, lineHeight: 1.25 }}>
            <Hl text={b.sub} mark={b.submark} at={b.when(b.submarkAt)} dark={dark} />
          </div>
        </Enter>
      )}
    </div>
  );
};

const Card: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  return (
    <Enter at={b.start} style={{ width: V ? '86%' : '72%', transform: `rotate(${b.tilt ?? 0}deg)` }}>
      <div style={{ position: 'relative', background: C.white, clipPath: torn(b.i + 3), padding: `${3.4 * U}px ${3.4 * U}px ${3.6 * U}px`, boxShadow: '0 0 0 rgba(0,0,0,0)' }}>
        {b.label && <Strip style={{ marginBottom: 1.6 * U }}>{b.label}</Strip>}
        {b.head && <div style={{ fontFamily: HEAD, fontWeight: 700, textTransform: 'uppercase', fontSize: (V ? 7 : 8) * U, color: C.ink, lineHeight: 0.95, letterSpacing: 1 }}>{b.head}</div>}
        {b.text && (
          <div style={{ fontFamily: SERIF, fontSize: (V ? 4.2 : 4.6) * U, color: C.ink, lineHeight: 1.22, marginTop: b.head ? U : 0 }}>
            {b.quote && <span style={{ color: C.red }}>“</span>}
            <Hl text={b.text} mark={b.mark} at={b.when(b.markAt)} />
            {b.quote && <span style={{ color: C.red }}>”</span>}
          </div>
        )}
      </div>
    </Enter>
  );
};

const Stat: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  const dark = b.bg !== 'paper';
  const fg = dark ? C.cream : C.ink;
  return (
    <div style={{ textAlign: 'center' }}>
      <Enter at={b.start}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: (V ? 17 : 21) * U, color: fg, lineHeight: 0.9 }}>
          {b.prefix}<Count to={b.value ?? 0} at={b.start} />
          <span style={{ fontSize: (V ? 9 : 11) * U, opacity: 0.8 }}>{b.suffix}</span>
        </div>
      </Enter>
      <Enter at={b.start + 0.3}>
        <div style={{ fontFamily: SERIF, fontSize: 3.6 * U, color: fg, marginTop: 1.4 * U, padding: `0 ${3 * U}px` }}>
          <Hl text={b.sub ?? ''} mark={b.submark} at={b.when(b.submarkAt)} dark={dark} />
        </div>
      </Enter>
    </div>
  );
};

// A pinned print of a real screenshot: white border, slight tilt, slow push-in, anchored top.
const Print: React.FC<{ src: string; w: number; ratio: number; tilt?: number; start: number; label?: string; labelAt?: number; dur: number }> = ({ src, w, ratio, tilt = 0, start, label, labelAt, dur }) => {
  const t = useTq();
  const s = interpolate(t, [start, start + Math.max(dur, 1)], [1, 1.08], clamp);
  return (
    <div style={{ transform: `rotate(${tilt}deg)`, position: 'relative' }}>
      <div style={{ background: C.white, padding: 0.8 * U, paddingBottom: 0.8 * U, boxShadow: '0.6em 0.8em 0 rgba(21,21,21,.18)' }}>
        <div style={{ width: w, height: w / ratio, overflow: 'hidden' }}>
          <Img src={staticFile(src)} style={{ width: '100%', transform: `scale(${s})`, transformOrigin: 'top center' }} />
        </div>
      </div>
      {label && (
        <Enter at={labelAt ?? start} style={{ position: 'absolute', left: -U, bottom: -1.4 * U }}>
          <Strip yellow>{label}</Strip>
        </Enter>
      )}
    </div>
  );
};

const Tags: React.FC<{ b: Resolved }> = ({ b }) => (
  <>
    {(b.tags ?? []).map((tg) => (
      <Enter key={tg.text} at={b.when(tg.at)} style={{ position: 'absolute', left: `${tg.x}%`, top: `${tg.y}%` }}>
        <Strip yellow={tg.yellow} style={{ fontSize: 2 * U }}>{tg.text}</Strip>
      </Enter>
    ))}
  </>
);

const Photo: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  return (
    <>
      <Enter at={b.start}>
        <Print src={b.img!} w={V ? 940 : 1240} ratio={V ? 0.95 : 1.6} tilt={b.tilt} start={b.start} dur={b.end - b.start} />
        {b.caption && <div style={{ marginTop: 1.4 * U }}><Strip>{b.caption}</Strip></div>}
      </Enter>
      <Tags b={b} />
    </>
  );
};

const Pair: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  return (
    <div style={{ display: 'flex', flexDirection: V ? 'column' : 'row', gap: (V ? 4 : 3) * U, alignItems: 'center' }}>
      {b.imgs!.map((src, k) => (
        <Enter key={src} at={b.when(b.namesAt?.[k])}>
          <Print src={src} w={V ? 820 : 760} ratio={1.5} tilt={k ? 2 : -2} start={b.start} dur={b.end - b.start} label={`${b.names?.[k]} ✓`} labelAt={b.when(b.namesAt?.[k])} />
        </Enter>
      ))}
    </div>
  );
};

const Phones: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  const h = V ? 860 : 780;
  return (
    <>
      <div style={{ display: 'flex', gap: 3 * U, alignItems: 'center' }}>
        {b.imgs!.map((src, k) => (
          <Enter key={src} at={b.start + k * 0.25} style={{ transform: `rotate(${k ? 3 : -3}deg)` }}>
            <div style={{ background: C.ink, padding: 0.7 * U, borderRadius: 3 * U }}>
              <div style={{ width: h * 0.462, height: h, borderRadius: 2.4 * U, overflow: 'hidden', background: C.white }}>
                <Img src={staticFile(src)} style={{ width: '100%' }} />
              </div>
            </div>
          </Enter>
        ))}
      </div>
      {b.label && (
        <Enter at={b.start + 0.3} style={{ position: 'absolute', left: V ? '8%' : '6%', top: V ? '7%' : '12%' }}>
          <Strip style={{ fontSize: 2.2 * U }}>{b.label}</Strip>
        </Enter>
      )}
      <Tags b={b} />
    </>
  );
};

const List: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  const dark = b.bg !== 'paper';
  let cursor = b.idx;
  const times = (b.items ?? []).map((_, k) => {
    const at = b.itemsAt?.[k];
    const j = at ? find(at, cursor) : -1;
    if (j >= 0) { cursor = j + 1; return words[j].t; }
    return b.start + 0.6 * (k + 1);
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1.6 * U, alignItems: 'flex-start', padding: `0 ${4 * U}px` }}>
      {b.label && <Enter at={b.start}><Strip yellow style={{ fontSize: 2 * U }}>{b.label}</Strip></Enter>}
      {(b.items ?? []).map((it, k) => (
        <Enter key={it} at={times[k]} dy={30}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 * U }}>
            <div style={{ width: 5.4 * U, height: 5.4 * U, background: C.red, color: C.cream, fontFamily: HEAD, fontWeight: 700, fontSize: 4.2 * U, display: 'grid', placeItems: 'center', paddingTop: 0.5 * U, border: dark ? `3px solid ${C.cream}` : 'none' }}>{k + 1}</div>
            <div style={{ fontFamily: HEAD, fontWeight: 700, textTransform: 'uppercase', fontSize: (V ? 6.4 : 7.4) * U, color: dark ? C.cream : C.ink, lineHeight: 1, paddingTop: 0.6 * U }}>{it}</div>
          </div>
        </Enter>
      ))}
    </div>
  );
};

const Duo: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  const t2 = b.when(b.v2At, 1.2);
  return (
    <div style={{ display: 'flex', flexDirection: V ? 'column' : 'row', gap: 3 * U }}>
      {([[60, 'on X', 'logos/si-x.svg', b.start], [21, 'on LinkedIn', 'logos/si-linkedin.svg', t2]] as const).map(([n, label, logo, at], k) => (
        <Enter key={label} at={at} style={{ transform: `rotate(${k ? 1.5 : -1.5}deg)` }}>
          <div style={{ background: C.white, clipPath: torn(40 + k), padding: `${2.6 * U}px ${4 * U}px ${3 * U}px`, width: 30 * U, textAlign: 'center' }}>
            <Img src={staticFile(logo)} style={{ height: 3.4 * U }} />
            <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 15 * U, color: C.ink, lineHeight: 1, marginTop: U }}><Count to={n} at={at} />K</div>
            <div style={{ fontFamily: SERIF, fontSize: 3 * U, color: C.ink }}>follow me {label}</div>
          </div>
        </Enter>
      ))}
    </div>
  );
};

const End: React.FC<{ b: Resolved }> = ({ b }) => {
  const V = useV();
  return (
    <div style={{ textAlign: 'center', padding: `0 ${3 * U}px` }}>
      <Enter at={b.start}>
        <div style={{ fontFamily: HEAD, fontWeight: 700, textTransform: 'uppercase', fontSize: (V ? 7.4 : 9) * U, color: C.ink, lineHeight: 0.92 }}>{b.head}</div>
      </Enter>
      <Enter at={b.when('ill|send', 0.8)}>
        <div style={{ fontFamily: SERIF, fontSize: (V ? 4.2 : 4.6) * U, color: C.ink, marginTop: 2 * U }}>
          <Hl text={b.text ?? ''} mark={b.mark} at={b.when(b.markAt)} />
        </div>
      </Enter>
      <div style={{ display: 'flex', gap: 1.4 * U, justifyContent: 'center', marginTop: 4 * U, flexWrap: 'wrap' }}>
        {(b.tags ?? []).map((tg, k) => (
          <Enter key={tg.text} at={b.when(tg.at) + 0.4 + k * 0.25}><Strip yellow={tg.yellow} style={{ fontSize: 2.4 * U }}>{tg.text}</Strip></Enter>
        ))}
      </div>
    </div>
  );
};

const DEVICES = { big: Big, card: Card, stat: Stat, photo: Photo, list: List, phones: Phones, pair: Pair, duo: Duo, end: End } as const;

// Every beat slowly pushes in about the centre, so no frame ever holds still.
const BeatView: React.FC<{ b: Resolved }> = ({ b }) => {
  const t = useTq();
  const D = DEVICES[b.device];
  const s = interpolate(t, [b.start, b.start + 3], [1, 1.07], { extrapolateLeft: 'clamp', extrapolateRight: 'extend' });
  return (
    <AbsoluteFill>
      <Blocks b={b} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', transform: `scale(${Math.min(s, 1.12)})` }}>
        <D b={b} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const k = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ backgroundImage: `url(${staticFile('craft/grain.png')})`, backgroundSize: '512px 512px', backgroundPosition: `${(k * 137) % 512}px ${(k * 251) % 512}px`, opacity: 0.1, mixBlendMode: 'overlay', pointerEvents: 'none' }} />
  );
};

export const CraftPitch: React.FC = () => {
  const t = useT();
  const b = [...resolved].reverse().find((x) => t >= x.start) ?? resolved[0];
  return (
    <AbsoluteFill style={{ background: C.cream, overflow: 'hidden' }}>
      <BeatView key={b.i} b={b} />
      <Grain />
      <Audio src={staticFile('craft/vo.wav')} />
      {/* user-supplied track (subway_surfers_ring.mp3), looped under the voice */}
      <Audio src={staticFile('craft/subway.mp3')} loop volume={(fr) => interpolate(fr / FPS, [0, 0.6, END - 1.5, END], [0.3, 0.11, 0.11, 0], clamp)} />
      {resolved.slice(1).map((x) => (
        <Sequence key={x.i} from={Math.round(x.start * FPS)} durationInFrames={8}>
          <Audio src={staticFile('craft/paper.wav')} volume={0.22} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
