import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Proof-of-work video about a growth plan pitched to a bootstrapped healthy-food startup.
// Company not named and no numbers shown, by request. Scene cuts line up with the hits in funk.wav.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const GROWTH_FRAMES = s(47);

export const C = {
  bg: '#12081a', surface: '#1f1029', fg: '#fff4f8', muted: '#c9b3d6', rule: '#3a2148',
  pink: '#ff4f93', purple: '#9b5de5', mint: '#7dffb3', gold: '#ffd166', cyan: '#5ef2ff',
};
export const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "Menlo, 'SF Mono', monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
export const grad: React.CSSProperties = {
  background: `linear-gradient(90deg, ${C.pink}, ${C.gold}, ${C.mint})`,
  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
};

export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'up' | 'left' }> = ({ at, children, style, from = 'up' }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 11, stiffness: 190 } });
  const move = from === 'up' ? `translateY(${(1 - p) * 50}px)` : `translateX(${(1 - p) * 90}px)`;
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `${move} scale(${0.85 + 0.15 * p})`, ...style }}>{children}</div>;
};
export const Big: React.FC<{ children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ children, size = 96, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: size, lineHeight: 1.02, letterSpacing: -2, color: C.fg, textTransform: 'uppercase', ...style }}>{children}</div>
);
export const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.pink }) => (
  <span style={{ display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.bg, background: color, borderRadius: 999, padding: '10px 24px', letterSpacing: 1 }}>{children}</span>
);
export const Stamp: React.FC<{ at: number; text: string; color?: string; rotate?: number; style?: React.CSSProperties }> = ({ at, text, color = C.gold, rotate = -8, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 260 } });
  return (
    <div style={{ position: 'absolute', transform: `rotate(${rotate}deg) scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 2), fontFamily: SANS, fontWeight: 900, fontSize: 40, color, border: `5px solid ${color}`, borderRadius: 18, padding: '8px 22px', background: `${C.bg}cc`, whiteSpace: 'nowrap', ...style }}>{text}</div>
  );
};
// a scene: glitch-punch in, fade out
export const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const local = f - s(from);
  const op = interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp);
  const glitch = local < 6 ? (6 - local) * 3 : 0;
  const shake = local < 6 ? Math.sin(local * 3) * glitch : 0;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: op, transform: `translateX(${shake}px)`, filter: glitch ? `drop-shadow(${glitch}px 0 0 ${C.pink}) drop-shadow(${-glitch}px 0 0 ${C.cyan})` : undefined }}>
      {children}
    </AbsoluteFill>
  );
};
const Card: React.FC<{ at: number; icon: string; title: string; body: string; color: string }> = ({ at, icon, title, body, color }) => (
  <Pop at={at} from="left">
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', background: C.surface, border: `3px solid ${color}`, borderRadius: 28, padding: '22px 28px', boxShadow: `8px 8px 0 ${color}` }}>
      <div style={{ fontSize: 60, lineHeight: 1 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.fg }}>{title}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.muted, marginTop: 4, lineHeight: 1.3 }}>{body}</div>
      </div>
    </div>
  </Pop>
);

const Stage: React.FC = () => (
  <AbsoluteFill>
    {/* hook */}
    <Scene from={0} to={4}>
      <div style={{ width: 940, textAlign: 'center', display: 'grid', gap: 26, justifyItems: 'center' }}>
        <Pop at={0.1}><Chip>growth plan · proof of work</Chip></Pop>
        <Pop at={0.4}><Big size={90}>a bootstrapped food startup had <span style={{ color: C.pink }}>barely any orders</span></Big></Pop>
        <Pop at={2.0}><Big size={62} style={{ color: C.muted }}>they asked me to <span style={grad}>fix it</span> 👀</Big></Pop>
      </div>
    </Scene>

    {/* reframe */}
    <Scene from={4} to={8}>
      <div style={{ width: 940, textAlign: 'center', display: 'grid', gap: 30, justifyItems: 'center', position: 'relative' }}>
        <Pop at={4.1}><Big size={70} style={{ color: C.muted, textDecoration: 'line-through', textDecorationColor: C.pink, textDecorationThickness: 8 }}>"just run more ads"</Big></Pop>
        <Pop at={5.3}><Big size={94}>build the product that makes orders <span style={grad}>compound</span></Big></Pop>
        <Stamp at={6.4} text="no cap 🧢" rotate={-10} style={{ right: -10, bottom: -90 }} />
      </div>
    </Scene>

    {/* KPI bug */}
    <Scene from={8} to={14}>
      <div style={{ width: 940, display: 'grid', gap: 28, justifyItems: 'center', textAlign: 'center', position: 'relative' }}>
        <Pop at={8.1}><Chip color={C.gold}>plot twist</Chip></Pop>
        <Pop at={8.5}><Big size={92}>i found a <span style={{ color: C.gold }}>bug</span> in their KPIs 🐛</Big></Pop>
        <Pop at={10.0}>
          <div style={{ fontFamily: MONO, fontSize: 34, color: C.fg, lineHeight: 1.6, background: C.surface, border: `3px solid ${C.rule}`, borderRadius: 24, padding: '22px 30px', textAlign: 'left' }}>
            <span style={{ color: C.muted }}>{'// '}two targets, one funnel</span><br />
            if (conversion_goal <span style={{ color: C.pink }}>!=</span> customer_goal)<br />
            {'  '}<span style={{ color: C.mint }}>report_floor_and_stretch()</span>
          </div>
        </Pop>
        <Pop at={12.0}><Big size={46} style={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontWeight: 700 }}>the targets contradicted each other, so I set a floor + a stretch</Big></Pop>
      </div>
    </Scene>

    {/* ideas */}
    <Scene from={14} to={30}>
      <div style={{ width: 940, display: 'grid', gap: 22, position: 'relative' }}>
        <Pop at={14.1}><Big size={76}>underrated <span style={grad}>ideas</span> ✨</Big></Pop>
        <Card at={15.0} color={C.pink} icon="🚃" title='the office "lunch train"' body="one person opens a group order, the whole team hops on" />
        <Card at={17.6} color={C.gold} icon="🏋️" title="trainers prescribe meals" body="client orders in one tap, trainer earns per order" />
        <Card at={20.2} color={C.mint} icon="🪞" title="QR on the gym mirror" body="protein bowl at the exact moment of intent" />
        <Card at={22.8} color={C.cyan} icon="🧾" title="macro receipts + a monthly Wrapped" body="shareable cards = free reach from real customers" />
        <Card at={25.4} color={C.purple} icon="💬" title="WhatsApp AI nutrition assistant" body={'"more protein, no peanuts" → it recommends and orders in chat'} />
        <Stamp at={27.6} text="ate 🍽️" color={C.mint} rotate={8} style={{ right: -10, bottom: -80 }} />
      </div>
    </Scene>

    {/* build list */}
    <Scene from={30} to={37}>
      <div style={{ width: 940, display: 'grid', gap: 18 }}>
        <Pop at={30.1}><Big size={76}>and i'd <span style={grad}>build it</span> myself</Big></Pop>
        {[
          ['tracking + a funnel dashboard', C.pink],
          ['one-screen onboarding', C.gold],
          ['referrals', C.mint],
          ['habit-timed reorder nudges', C.cyan],
          ['group orders for offices', C.purple],
          ['the WhatsApp AI assistant', C.pink],
        ].map(([t, col], i) => (
          <Pop key={t} at={30.8 + i * 0.6} from="left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, borderBottom: `2px solid ${C.rule}`, paddingBottom: 12 }}>
              <span style={{ fontFamily: MONO, fontSize: 30, color: col, fontWeight: 700 }}>{'>'}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.fg }}>{t}</span>
            </div>
          </Pop>
        ))}
        <Pop at={34.6}><Chip color={C.mint}>each one shipped with a before → after metric</Chip></Pop>
      </div>
    </Scene>

    {/* lean */}
    <Scene from={37} to={41}>
      <div style={{ width: 940, textAlign: 'center', display: 'grid', gap: 26, justifyItems: 'center', position: 'relative' }}>
        <Pop at={37.1}><Big size={104}>no paid ads <span style={{ color: C.pink }}>first</span></Big></Pop>
        <Pop at={38.2}><Big size={50} style={{ color: C.muted, textTransform: 'none', letterSpacing: 0, fontWeight: 700 }}>partnerships, referrals and product do the work. spend follows proof.</Big></Pop>
        <Stamp at={39.3} text="lean era 💅" color={C.pink} rotate={-6} style={{ left: 40, bottom: -150 }} />
      </div>
    </Scene>

    {/* CTA */}
    <Scene from={41} to={47.5}>
      <div style={{ width: 940, display: 'grid', gap: 30, justifyItems: 'center', textAlign: 'center' }}>
        <Pop at={41.1}><Big size={84}>engineering. product. growth.</Big></Pop>
        <Pop at={42.0}><Big size={104}><span style={grad}>one person.</span></Big></Pop>
        <Pop at={43.2}><Chip color={C.mint}>Unnati Chhabra · AI engineer · open to roles</Chip></Pop>
        <Pop at={44.0}><div style={{ fontFamily: MONO, fontSize: 34, color: C.gold, lineHeight: 1.7 }}>unnati-chhabra.xyz<br />github.com/unnati914</div></Pop>
      </div>
    </Scene>
  </AbsoluteFill>
);

export const Backdrop: React.FC = () => {
  const f = useCurrentFrame();
  const gx = 50 + Math.sin(f / 50) * 25;
  const beat = (f % s(60 / 108)) / s(60 / 108);
  const pulse = 1 - beat;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 45% at ${gx}% 20%, ${C.pink}${Math.round(40 + 30 * pulse).toString(16)}, transparent 70%), radial-gradient(ellipse 55% 45% at ${100 - gx}% 85%, ${C.purple}55, transparent 70%)` }} />
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(${C.rule}55 2px, transparent 2px), linear-gradient(90deg, ${C.rule}55 2px, transparent 2px)`, backgroundSize: '80px 80px', backgroundPosition: `0 ${(f * 2) % 80}px`, opacity: 0.5 }} />
    </AbsoluteFill>
  );
};
export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.08, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%">
        <filter id="ggrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 6} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#ggrain)" />
      </svg>
    </AbsoluteFill>
  );
};

const GrowthVideo: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const W = portrait ? 1080 : 1920;
  const H = portrait ? 1920 : 1080;
  const scale = portrait ? 1 : 0.98;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Backdrop />
      <Audio src={staticFile('music/funk.wav')} volume={0.6} />
      <div style={{ position: 'absolute', left: (W - 1000 * scale) / 2, top: (H - 1000 * scale) / 2, width: 1000, height: 1000, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
        <Stage />
      </div>
      {portrait && (
        <>
          <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center' }}><Chip color={C.purple}>POV: you hired a growth engineer</Chip></div>
          <div style={{ position: 'absolute', bottom: 170, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 26, color: C.muted }}>from a plan I pitched · company not named</div>
        </>
      )}
      <Grain />
    </AbsoluteFill>
  );
};

export const GrowthPortrait: React.FC = () => <GrowthVideo portrait />;
export const GrowthLandscape: React.FC = () => <GrowthVideo portrait={false} />;
