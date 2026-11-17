import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import durations from './v209-durations.json';
import { LOGOS, LogoMark } from './Final';

// ---------- timeline (must match score.py) ----------
const FPS = 30;
const LEAD = 15;
const GAP = 36;
const OUTRO = 150;
const s = (sec: number) => Math.round(sec * FPS);

const clipFrames = (durations as number[]).map((d) => Math.ceil(d * FPS));
const starts: number[] = [];
clipFrames.reduce((at, len) => {
  starts.push(at);
  return at + len + GAP;
}, LEAD);
export const CINEMA_FRAMES = starts[starts.length - 1] + clipFrames[clipFrames.length - 1] + OUTRO;

// ---------- look ----------
const INK = '#0b0a0d';
const WHITE = '#f4ede4';
const DIM = 'rgba(244,237,228,0.55)';
const AMBER = '#ffb35c';
const ROSE = '#ff6b8b';
const TEAL = '#7fdcff';
const SERIF = "Didot, 'Bodoni 72', 'Playfair Display', Georgia, serif";
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "Menlo, 'SF Mono', monospace";
const HAND = "'Bradley Hand', Noteworthy, 'Marker Felt', cursive";
const PIC_W = 1920;
const PIC_H = 804; // 2.39:1 picture area

// ---------- motion helpers ----------
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Shows children between `from` and `to` (seconds within the act) with a slow fade + drift.
const Phase: React.FC<{ from: number; to?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ from, to, children, style }) => {
  const f = useCurrentFrame();
  const a = s(from);
  const b = to === undefined ? Infinity : s(to);
  const fadeIn = interpolate(f, [a, a + 18], [0, 1], clamp);
  const fadeOut = b === Infinity ? 1 : interpolate(f, [b - 12, b], [1, 0], clamp);
  if (f < a || f > b) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: Math.min(fadeIn, fadeOut), ...style }}>
      {children}
    </AbsoluteFill>
  );
};

// Fades/rises an element in at `at` seconds.
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number }> = ({ at, children, style, dist = 30 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [s(at), s(at) + 22], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dist}px)`, filter: `blur(${(1 - p) * 6}px)`, ...style }}>{children}</div>;
};

const Title: React.FC<{ size?: number; italic?: boolean; color?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  size = 110,
  italic,
  color = WHITE,
  children,
  style,
}) => (
  <div style={{ fontFamily: SERIF, fontSize: size, fontStyle: italic ? 'italic' : 'normal', color, lineHeight: 1.08, textAlign: 'center', letterSpacing: -1, ...style }}>
    {children}
  </div>
);

const Caps: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 26, color = DIM, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, letterSpacing: size * 0.35, textTransform: 'uppercase', color, ...style }}>{children}</div>
);

const Counter: React.FC<{ from: number; to: number; value: number; prefix?: string; suffix?: string; size?: number; color?: string }> = ({
  from,
  to,
  value,
  prefix = '',
  suffix = '',
  size = 150,
  color = WHITE,
}) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [s(from), s(to)], [0, value], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <div style={{ fontFamily: SERIF, fontSize: size, color, lineHeight: 1, fontVariantNumeric: 'lining-nums tabular-nums' }}>
      {prefix}
      {v}
      {suffix}
    </div>
  );
};

const LogoBadge: React.FC<{ id: keyof typeof LOGOS; at: number; size?: number; label?: string; wide?: boolean }> = ({ id, at, size = 130, label, wide }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 20, stiffness: 60 } });
  const kind = LOGOS[id];
  const w = wide || 'word' in kind ? size * 2.3 : size;
  const shine = interpolate(f - s(at), [10, 40], [-60, 160], clamp);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})` }}>
      <div
        style={{
          position: 'relative',
          width: w,
          height: size,
          borderRadius: size * 0.22,
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 60px ${AMBER}33`,
        }}
      >
        <LogoMark kind={kind} size={size * 0.62} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${shine}%`, width: '30%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.9), transparent)', transform: 'skewX(-18deg)' }} />
      </div>
      {label && <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size * 0.2, color: WHITE, letterSpacing: 1, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
};

// ---------- atmosphere ----------
const LightLeak: React.FC<{ tint: string; tint2?: string }> = ({ tint, tint2 = TEAL }) => {
  const f = useCurrentFrame();
  const x = 30 + Math.sin(f / 90) * 12;
  const y = 25 + Math.cos(f / 110) * 10;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 60% at ${x}% ${y}%, ${tint}33, transparent 70%), radial-gradient(ellipse 50% 55% at ${100 - x}% ${100 - y}%, ${tint2}1f, transparent 70%)`,
      }}
    />
  );
};

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.16, mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%">
        <filter id="cgrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 8} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cgrain)" />
      </svg>
    </AbsoluteFill>
  );
};

const Flicker: React.FC = () => {
  const f = useCurrentFrame();
  const v = 0.03 + 0.02 * Math.sin(f * 1.7) * Math.sin(f * 0.37);
  return <AbsoluteFill style={{ background: '#000', opacity: v }} />;
};

const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 70% at center, transparent 45%, rgba(0,0,0,0.75) 100%)' }} />
);

// ---------- scenes (drawn in a 1920x804 picture, content kept in the central ~1350px) ----------

const ColdOpen: React.FC = () => {
  const f = useCurrentFrame();
  const line = (txt: string, at: number) => txt.slice(0, Math.max(0, Math.floor((f - s(at)) / 2.2)));
  const cursor = Math.floor(f / 15) % 2 === 0;
  const mono: React.CSSProperties = { fontFamily: MONO, fontSize: 54, color: WHITE };
  return (
    <>
      <Phase from={0.0} to={3.7}>
        <div style={mono}>
          {line('Every engineer has a resume.', 0.3)}
          <span style={{ opacity: cursor ? 1 : 0 }}>▍</span>
        </div>
      </Phase>
      <Phase from={3.8} to={5.4}>
        <div style={mono}>
          {line("This isn't mine.", 3.8)}
          <span style={{ opacity: cursor ? 1 : 0 }}>▍</span>
        </div>
      </Phase>
      <Phase from={5.5} to={6.5}>
        <div style={{ ...mono, color: AMBER }}>{line('This is what I build.', 5.5)}</div>
      </Phase>
      <Phase from={6.6}>
        <Caps size={24}>a builder's story</Caps>
        <Rise at={6.7}>
          <Title size={128} style={{ letterSpacing: 14, marginTop: 20 }}>
            UNNATI CHHABRA
          </Title>
        </Rise>
      </Phase>
    </>
  );
};

const Beginning: React.FC = () => {
  const f = useCurrentFrame();
  const sec = Math.floor(f / FPS) % 60;
  return (
    <>
      <Phase from={0.2} to={7.8}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 110 }}>
          <Rise at={1.6}>
            <div style={{ fontFamily: MONO, fontSize: 150, color: AMBER, textShadow: `0 0 60px ${AMBER}88` }}>
              2:07<span style={{ fontSize: 60, color: DIM }}>:{String(sec).padStart(2, '0')}</span>
            </div>
            <Caps style={{ marginTop: 10 }}>AM · college</Caps>
          </Rise>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left' }}>
            <Rise at={4.2}>
              <Title size={84} style={{ textAlign: 'left' }}>a hackathon.</Title>
            </Rise>
            <Rise at={5.6}>
              <Title size={84} italic color={DIM} style={{ textAlign: 'left' }}>
                then another.
              </Title>
            </Rise>
            <Rise at={6.8}>
              <Title size={84} italic color="rgba(244,237,228,0.3)" style={{ textAlign: 'left' }}>
                then another.
              </Title>
            </Rise>
          </div>
        </div>
      </Phase>
      <Phase from={7.9} to={14.9}>
        <Rise at={8.0}>
          <Caps>not just learning to code</Caps>
        </Rise>
        <Rise at={11.0}>
          <Title size={104} italic style={{ marginTop: 26 }}>
            build things people
            <br />
            actually <span style={{ color: AMBER }}>use.</span>
          </Title>
        </Rise>
      </Phase>
      <Phase from={15.0}>
        <Rise at={15.3}>
          <div style={{ fontFamily: MONO, fontSize: 130, color: AMBER, textShadow: `0 0 50px ${AMBER}66` }}>{'</CodXCrypt>'}</div>
        </Rise>
        <Rise at={16.9}>
          <Title size={58} italic color={DIM} style={{ marginTop: 26 }}>
            a community of people who felt the same way
          </Title>
        </Rise>
      </Phase>
    </>
  );
};

const RepoTiles: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const lit = Math.round(interpolate(f, [s(from), s(to)], [0, 171], clamp));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(19, 26px)', gap: 7 }}>
      {Array.from({ length: 171 }).map((_, i) => {
        const on = i < lit;
        const shade = [0.35, 0.55, 0.75, 1].at((i * 7) % 4)!;
        return <div key={i} style={{ width: 26, height: 26, borderRadius: 5, background: on ? `rgba(87, 211, 140, ${shade})` : 'rgba(244,237,228,0.07)' }} />;
      })}
    </div>
  );
};

const OpenSource: React.FC = () => (
  <>
    <Phase from={0.0} to={3.1}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <LogoBadge id="github" at={0.2} size={140} />
        <Title size={130} italic>
          open source.
        </Title>
      </div>
    </Phase>
    <Phase from={3.2} to={14.9}>
      <Rise at={3.3}>
        <div style={{ width: 1100, borderRadius: 22, padding: '40px 50px', background: 'rgba(244,237,228,0.05)', border: '1.5px solid rgba(244,237,228,0.18)', textAlign: 'left' }}>
          <div style={{ fontFamily: MONO, fontSize: 40, color: TEAL }}>unnati914 / Care4ther</div>
          <div style={{ fontFamily: SANS, fontSize: 32, color: DIM, marginTop: 12 }}>an app for knowing about accidents before they happen</div>
          <div style={{ display: 'flex', gap: 90, marginTop: 40, alignItems: 'flex-end' }}>
            <div>
              <Counter from={7.3} to={8.4} value={68} prefix="★ " size={110} color={AMBER} />
              <Caps size={20} style={{ marginTop: 8 }}>stars</Caps>
            </div>
            <div>
              <Counter from={8.9} to={9.8} value={20} prefix="⑂ " size={110} />
              <Caps size={20} style={{ marginTop: 8 }}>forks</Caps>
            </div>
            <Rise at={12.0}>
              <Counter from={12.1} to={13.4} value={50} prefix="~" size={110} color={ROSE} />
              <Caps size={20} style={{ marginTop: 8 }}>students mentored</Caps>
            </Rise>
          </div>
        </div>
      </Rise>
    </Phase>
    <Phase from={15.0} to={25.7}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        <RepoTiles from={15.5} to={17.6} />
        <div style={{ textAlign: 'left' }}>
          <Rise at={15.5}>
            <Counter from={15.5} to={17.6} value={171} size={130} />
            <Caps size={20}>repositories</Caps>
          </Rise>
          <Rise at={18.0} style={{ marginTop: 40 }}>
            <Counter from={18.1} to={21.0} value={115} size={130} color={AMBER} />
            <Caps size={20}>merged PRs into other people's projects</Caps>
          </Rise>
        </div>
      </div>
    </Phase>
    <Phase from={25.8}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Rise at={25.9}>
          <Title size={96}>Meshery</Title>
        </Rise>
        <div style={{ display: 'flex', gap: 60 }}>
          <Rise at={27.5}>
            <Title size={80} italic color={DIM}>
              Layer5
            </Title>
          </Rise>
          <Rise at={28.1}>
            <Title size={80} italic color={DIM}>
              Keploy
            </Title>
          </Rise>
        </div>
        <Rise at={29.0}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <LogoBadge id="lfx" at={29.0} size={80} />
            <Title size={74}>Open Horizon</Title>
          </div>
        </Rise>
        <Rise at={30.6}>
          <Title size={96} color={AMBER}>
            Agno
          </Title>
          <Caps size={18}>AI agent framework</Caps>
        </Rise>
      </div>
    </Phase>
  </>
);

const Spotlight: React.FC = () => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 70) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `conic-gradient(from ${180 + sway}deg at 50% -10%, transparent 160deg, rgba(255,214,160,0.16) 175deg, rgba(255,214,160,0.24) 180deg, rgba(255,214,160,0.16) 185deg, transparent 200deg)`,
      }}
    />
  );
};

const Stage: React.FC = () => (
  <>
    <Spotlight />
    <Phase from={0.0} to={9.9}>
      <Rise at={0.3}>
        <Caps>before zomato</Caps>
      </Rise>
      <Rise at={3.0}>
        <Title size={190} style={{ marginTop: 10 }}>
          DevRel.
        </Title>
      </Rise>
      <div style={{ display: 'flex', gap: 50, marginTop: 30 }}>
        <Rise at={4.4}>
          <Title size={50} italic color={DIM}>
            on stages
          </Title>
        </Rise>
        <Rise at={6.2}>
          <Title size={50} italic color={DIM}>
            running workshops
          </Title>
        </Rise>
        <Rise at={8.0}>
          <Title size={50} italic color={DIM}>
            teaching developers
          </Title>
        </Rise>
      </div>
    </Phase>
    <Phase from={10.0} to={16.3}>
      <div style={{ display: 'flex', gap: 90 }}>
        <LogoBadge id="github" at={10.4} size={150} label="GitHub Campus Expert" />
        <LogoBadge id="microsoft" at={12.6} size={150} label="Microsoft Student Ambassador" />
        <LogoBadge id="lfx" at={15.0} size={150} label="LFX Mentee" />
      </div>
    </Phase>
    <Phase from={16.4}>
      <Rise at={16.5}>
        <Title size={72} italic color={DIM}>
          the other half of building
        </Title>
      </Rise>
      <Rise at={20.5}>
        <Title size={150} color={AMBER} style={{ marginTop: 16 }}>
          explaining it.
        </Title>
      </Rise>
    </Phase>
  </>
);

const Break: React.FC = () => {
  const f = useCurrentFrame();
  const glow = interpolate(f, [s(2.6), s(3.4)], [0, 1], clamp);
  return (
    <>
      <Phase from={0.2} to={2.5}>
        <Title size={96} italic color={DIM}>
          then zomato ran a hackathon.
        </Title>
      </Phase>
      <Phase from={2.6} to={6.4}>
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${AMBER}${Math.round(glow * 60).toString(16).padStart(2, '0')}, transparent 55%)` }} />
        <Title size={300} style={{ textShadow: `0 0 80px ${AMBER}aa` }}>
          I won.
        </Title>
        <div style={{ marginTop: 20 }}>
          <LogoBadge id="zomato" at={4.8} size={150} label="and walked into Zomato" />
        </div>
      </Phase>
      <Phase from={6.5} to={14.0}>
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start' }}>
          <LogoBadge id="zomato" at={7.0} size={140} label="orders" />
          <LogoBadge id="paysecure" at={8.0} size={140} label="payments" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ display: 'flex', gap: 24 }}>
              <LogoBadge id="griddynamics" at={10.1} size={140} />
              <LogoBadge id="visa" at={11.6} size={140} wide />
            </div>
            <Rise at={11.8}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: WHITE }}>gen AI for VISA</div>
            </Rise>
          </div>
        </div>
      </Phase>
      <Phase from={14.1}>
        <Rise at={14.1}>
          <Title size={90} italic color={DIM}>
            different problems.
          </Title>
        </Rise>
        <Rise at={16.1}>
          <Title size={120} style={{ marginTop: 16 }}>
            same question.
          </Title>
        </Rise>
      </Phase>
    </>
  );
};

const Product: React.FC = () => (
  <>
    <Phase from={0.1} to={1.9}>
      <Title size={160}>Who is this for?</Title>
    </Phase>
    <Phase from={2.0} to={4.5}>
      <Title size={130} italic>
        Do they actually <span style={{ color: AMBER }}>want</span> it?
      </Title>
    </Phase>
    <Phase from={4.6}>
      <Title size={160}>
        working <span style={{ color: ROSE, fontStyle: 'italic' }}>≠</span> wanted
      </Title>
    </Phase>
  </>
);

const EvalLoop: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const nodes = ['agent', 'evals', 'metrics', 'improve'];
  const r = 230;
  const cx = 300;
  const cy = 280;
  const pos = nodes.map((_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / nodes.length;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  const trace = ((f - s(at)) / 90) % 1;
  const ang = -Math.PI / 2 + trace * Math.PI * 2;
  return (
    <svg width={600} height={560} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(244,237,228,0.18)" strokeWidth={2} strokeDasharray="6 10" />
      <circle cx={cx + r * Math.cos(ang)} cy={cy + r * Math.sin(ang)} r={10} fill={AMBER} style={{ filter: `drop-shadow(0 0 14px ${AMBER})` }} />
      {nodes.map((label, i) => {
        const [x, y] = pos.at(i)!;
        const shown = f >= s(at) + i * 8;
        return (
          <g key={label} opacity={shown ? 1 : 0}>
            <rect x={x - 100} y={y - 34} width={200} height={68} rx={34} fill={INK} stroke={i === 1 ? AMBER : 'rgba(244,237,228,0.5)'} strokeWidth={2} />
            <text x={x} y={y + 10} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={28} fill={WHITE}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const OnAI: React.FC = () => (
  <>
    <Phase from={0.1} to={6.1}>
      <Title size={110}>Everyone can demo AI now.</Title>
      <Rise at={3.5}>
        <Title size={88} italic color={AMBER} style={{ marginTop: 30 }}>
          very few can make you trust it.
        </Title>
      </Rise>
    </Phase>
    <Phase from={6.2} to={10.9}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
        <EvalLoop at={6.3} />
        <div style={{ textAlign: 'left' }}>
          <Rise at={6.4}>
            <Caps>so I measure everything</Caps>
          </Rise>
          <Rise at={8.5}>
            <Title size={120} style={{ textAlign: 'left', marginTop: 20 }}>
              evals
              <br />
              <span style={{ fontStyle: 'italic', color: DIM }}>before</span> vibes.
            </Title>
          </Rise>
        </div>
      </div>
    </Phase>
    <Phase from={11.0}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        {['retrieval', 'context', 'model'].map((w, i) => (
          <React.Fragment key={w}>
            {i > 0 && <div style={{ fontFamily: SANS, fontSize: 50, color: DIM }}>→</div>}
            <Rise at={11.1 + i * 0.5}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 40,
                  padding: '18px 36px',
                  borderRadius: 50,
                  color: i === 0 ? INK : WHITE,
                  background: i === 0 ? AMBER : 'transparent',
                  border: `2px solid ${i === 0 ? AMBER : 'rgba(244,237,228,0.4)'}`,
                }}
              >
                {w}
              </div>
            </Rise>
          </React.Fragment>
        ))}
      </div>
      <Rise at={13.7}>
        <Title size={84} italic style={{ marginTop: 50 }}>
          check what we gave it, first.
        </Title>
      </Rise>
    </Phase>
  </>
);

const Stars: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 70 }).map((_, i) => {
        const x = (i * 137.5) % 100;
        const y = (i * 61.8) % 100;
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / 30 + i));
        return <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: 3, height: 3, borderRadius: 2, background: WHITE, opacity: tw * 0.5 }} />;
      })}
    </AbsoluteFill>
  );
};

const Polaroid: React.FC<{ at: number; icon: string; name: string; note: string; rot: number }> = ({ at, icon, name, note, rot }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 18, stiffness: 50 } });
  const drift = Math.sin((f - s(at)) / 60) * 3;
  return (
    <div
      style={{
        width: 270,
        padding: '16px 16px 22px',
        background: '#f7f3ea',
        borderRadius: 6,
        boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
        opacity: p,
        transform: `translateY(${(1 - p) * -140 + drift}px) rotate(${rot * p + (1 - p) * rot * 3}deg) scale(${0.9 + 0.1 * p})`,
      }}
    >
      <div style={{ height: 180, borderRadius: 3, background: 'linear-gradient(135deg, #1b1622, #2c1f2e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 90 }}>
        {icon}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#1a1420', marginTop: 14 }}>{name}</div>
      <div style={{ fontFamily: HAND, fontSize: 22, color: '#5b4a5f', marginTop: 4 }}>{note}</div>
    </div>
  );
};

const AfterHours: React.FC = () => (
  <>
    <Stars />
    <Phase from={0.0} to={3.4}>
      <Caps>after hours</Caps>
      <Title size={130} italic style={{ marginTop: 20 }}>
        I keep building.
      </Title>
    </Phase>
    <Phase from={3.5}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 36 }}>
          <Polaroid at={3.6} icon="🧭" name="Hirvana" note="helping people get hired" rot={-4} />
          <Polaroid at={6.6} icon="🔥" name="Resume Roaster" note="brutally honest feedback" rot={3} />
          <Polaroid at={10.6} icon="📚" name="Imlea" note="for kids learning" rot={-2} />
          <Polaroid at={26.4} icon="🙊" name="OopsBot" note="for texts you forgot" rot={5} />
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          {[
            [14.8, 'job-hunt-agent'],
            [16.3, 'ai-outreach-agent'],
            [18.4, 'resume-optimiser-agent'],
          ].map(([at, name]) => (
            <Rise key={name as string} at={at as number}>
              <div style={{ fontFamily: MONO, fontSize: 30, color: TEAL, padding: '12px 24px', borderRadius: 14, border: `1.5px solid ${TEAL}66`, background: 'rgba(127,220,255,0.06)' }}>
                ▸ {name}
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </Phase>
    <Phase from={21.6} to={26.2} style={{ justifyContent: 'flex-end', paddingBottom: 70 }}>
      <Rise at={21.7}>
        <div style={{ fontFamily: HAND, fontSize: 44, color: AMBER, transform: 'rotate(-4deg)' }}>more AI agents than hot meals 🍜</div>
      </Rise>
    </Phase>
  </>
);

const Folder: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const open = interpolate(f, [s(at), s(at) + 30], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const files = ['x-dating/', 'more-flops/', '…and counting'];
  return (
    <div style={{ position: 'relative', width: 560, height: 400 }}>
      {files.map((name, i) => (
        <div
          key={name}
          style={{
            position: 'absolute',
            left: 80 + i * 10,
            top: 60,
            width: 400,
            padding: '16px 20px',
            background: '#f7f3ea',
            borderRadius: 8,
            fontFamily: MONO,
            fontSize: 22,
            color: '#2a2030',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            transform: `translate(${open * (i - 1) * 150}px, ${-open * (120 + i * 30)}px) rotate(${open * (i - 1) * 9}deg)`,
          }}
        >
          {name}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 30, top: 100, width: 500, height: 300, borderRadius: 18, background: 'linear-gradient(180deg, #e4a64f, #c9852f)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'absolute', left: 40, top: 110, fontFamily: MONO, fontSize: 44, color: '#3a2410' }}>failed/</div>
      </div>
    </div>
  );
};

const Mindset: React.FC = () => (
  <>
    <Phase from={0.0} to={4.7}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 80 }}>
        <Folder at={0.4} />
        <Rise at={2.8}>
          <div style={{ fontFamily: HAND, fontSize: 60, color: AMBER, transform: 'rotate(-3deg)' }}>my favourite folder ♥</div>
        </Rise>
      </div>
    </Phase>
    <Phase from={4.8}>
      <Title size={170}>
        shipping <span style={{ color: AMBER }}>&gt;</span> perfect
      </Title>
      <Rise at={7.3}>
        <Title size={70} italic color={DIM} style={{ marginTop: 26 }}>
          every flop got me here faster.
        </Title>
      </Rise>
    </Phase>
  </>
);

const WhyMe: React.FC = () => {
  const lines: [number, string][] = [
    [8.7, 'talk to users'],
    [10.0, 'design the system'],
    [11.2, 'build the AI'],
    [12.5, 'ship the frontend'],
    [14.6, 'explain it on stage'],
  ];
  return (
    <>
      <Phase from={0.2} to={4.0}>
        <Title size={150} italic>
          why should you
          <br />
          hire me?
        </Title>
      </Phase>
      <Phase from={4.1} to={17.2}>
        <Rise at={4.2}>
          <Caps>because I don't just write code</Caps>
        </Rise>
        <Rise at={6.8}>
          <Title size={130} color={AMBER} style={{ marginTop: 16 }}>
            I own the problem.
          </Title>
        </Rise>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '18px 40px', marginTop: 40, maxWidth: 1300 }}>
          {lines.map(([at, txt]) => (
            <Rise key={txt} at={at}>
              <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 46, color: WHITE }}>{txt}</div>
            </Rise>
          ))}
        </div>
      </Phase>
      <Phase from={17.3}>
        <div style={{ display: 'flex', gap: 70 }}>
          <Rise at={17.4}>
            <Title size={110}>move fast.</Title>
          </Rise>
          <Rise at={18.8}>
            <Title size={110} italic color={DIM}>
              measure.
            </Title>
          </Rise>
          <Rise at={20.3}>
            <Title size={110} color={AMBER}>
              stay curious.
            </Title>
          </Rise>
        </div>
      </Phase>
    </>
  );
};

const Finale: React.FC<{ clipLen: number }> = ({ clipLen }) => {
  const endAt = clipLen / FPS + 0.3;
  return (
    <>
      <Phase from={0.2} to={5.6}>
        <Title size={150}>So here I am.</Title>
        <Rise at={1.9}>
          <Title size={100} italic color={AMBER} style={{ marginTop: 16 }}>
            still building.
          </Title>
        </Rise>
      </Phase>
      <Phase from={5.7} to={10.5}>
        <Rise at={5.8}>
          <Caps>looking for the next team to build with</Caps>
        </Rise>
        <div style={{ display: 'flex', gap: 30, marginTop: 40 }}>
          {[
            [5.9, 'early-stage'],
            [6.8, 'mid-size'],
            [8.4, 'MNC'],
            [10.0, 'full-time'],
          ].map(([at, txt]) => (
            <Rise key={txt as string} at={at as number}>
              <div style={{ fontFamily: SERIF, fontSize: 60, color: WHITE, padding: '14px 40px', border: '1.5px solid rgba(244,237,228,0.45)', borderRadius: 60 }}>{txt}</div>
            </Rise>
          ))}
        </div>
      </Phase>
      <Phase from={10.6} to={endAt}>
        <Title size={140}>let's build something.</Title>
        <Rise at={13.8}>
          <div style={{ fontFamily: HAND, fontSize: 56, color: ROSE, marginTop: 30 }}>and please… don't ghost me 👻</div>
        </Rise>
      </Phase>
      <Phase from={endAt}>
        <Caps size={24}>open to work</Caps>
        <Rise at={endAt + 0.2}>
          <Title size={124} style={{ letterSpacing: 13, marginTop: 18 }}>
            UNNATI CHHABRA
          </Title>
        </Rise>
        <Rise at={endAt + 0.9}>
          <div style={{ display: 'flex', gap: 50, marginTop: 30, fontFamily: MONO, fontSize: 36, color: AMBER }}>
            <span>unnati-chhabra.xyz</span>
            <span style={{ color: DIM }}>·</span>
            <span>github.com/unnati914</span>
          </div>
        </Rise>
      </Phase>
    </>
  );
};

type Sub = [number, string];
type Act = { title: string; tint: string; Scene: React.FC; subs: Sub[] };

const ACTS: Act[] = [
  { title: '', tint: '#000000', Scene: ColdOpen, subs: [[0.3, 'Every engineer has a resume.'], [3.8, "This isn't mine."], [5.5, 'This is what I build.']] },
  {
    title: 'I · the beginning',
    tint: AMBER,
    Scene: Beginning,
    subs: [
      [0.2, 'It started in college. At two in the morning.'],
      [4.1, 'A hackathon. Then another. Then another.'],
      [7.9, "I didn't just want to learn to code."],
      [10.9, 'I wanted to build things people actually use.'],
      [15.0, 'So I started CodXCrypt,'],
      [16.8, 'a community of people who felt the same way.'],
    ],
  },
  {
    title: 'II · open source',
    tint: '#57d38c',
    Scene: OpenSource,
    subs: [
      [0.0, 'Then I found open source.'],
      [3.2, 'I built Care4ther, an accident-awareness app.'],
      [7.3, 'Sixty-eight stars, twenty forks,'],
      [10.8, 'and I mentored around fifty students on it.'],
      [15.0, 'Since then… a hundred and seventy-one repos.'],
      [17.7, "And over a hundred merged pull requests into other people's projects."],
      [25.8, 'Meshery. Layer5. Keploy.'],
      [29.0, 'Open Horizon at the Linux Foundation. And Agno, an AI agent framework.'],
    ],
  },
  {
    title: 'III · the stage',
    tint: '#ffd6a0',
    Scene: Stage,
    subs: [
      [0.2, 'Before Zomato… I was in DevRel.'],
      [4.3, 'On stages, running workshops,'],
      [8.0, 'teaching developers how to build.'],
      [10.0, 'GitHub Campus Expert. Microsoft Student Ambassador.'],
      [15.1, 'LFX mentee.'],
      [16.4, "That's where I learned the other half of building…"],
      [20.0, 'explaining it.'],
    ],
  },
  {
    title: 'IV · the break',
    tint: ROSE,
    Scene: Break,
    subs: [
      [0.3, 'Then Zomato ran a hackathon.'],
      [2.6, 'I won.'],
      [3.7, "And that's how I walked into Zomato."],
      [6.5, 'Orders at Zomato. Payments at Paysecure.'],
      [10.2, 'Gen AI for VISA at Grid Dynamics.'],
      [14.1, 'Different problems.'],
      [16.1, 'Same question, every single time.'],
    ],
  },
  {
    title: 'V · the product person',
    tint: AMBER,
    Scene: Product,
    subs: [
      [0.2, 'Who is this for?'],
      [2.0, 'And do they actually want it?'],
      [4.6, 'Because working… is not the same as wanted.'],
    ],
  },
  {
    title: 'VI · on AI',
    tint: TEAL,
    Scene: OnAI,
    subs: [
      [0.2, 'Everyone can demo AI now.'],
      [3.5, 'Very few can make you trust it.'],
      [6.2, 'So I measure everything.'],
      [8.5, 'Evals before vibes.'],
      [11.0, 'And when the model gets it wrong,'],
      [13.6, 'I check what we gave it first.'],
    ],
  },
  {
    title: 'VII · after hours',
    tint: '#8f7bff',
    Scene: AfterHours,
    subs: [
      [0.0, 'After hours… I keep building.'],
      [3.6, 'Hirvana, to help people get hired.'],
      [6.6, 'Resume Roaster, for brutally honest feedback.'],
      [10.6, 'Imlea, for kids learning their curriculum.'],
      [14.8, 'A job-hunt agent. An outreach agent.'],
      [18.3, 'A resume-optimiser agent.'],
      [21.5, "I've built more AI agents than I've had hot meals."],
      [26.0, 'And OopsBot… for the texts you forgot to reply to.'],
    ],
  },
  {
    title: 'VIII · the mindset',
    tint: AMBER,
    Scene: Mindset,
    subs: [
      [0.0, 'I keep a folder of everything that failed.'],
      [2.7, "It's my favourite folder."],
      [4.8, 'Because shipping beats perfect.'],
      [7.3, 'And every flop got me here faster.'],
    ],
  },
  {
    title: 'IX · why me',
    tint: ROSE,
    Scene: WhyMe,
    subs: [
      [0.2, 'So… why should you hire me?'],
      [4.1, "Because I don't just write code."],
      [6.8, 'I own the problem.'],
      [8.4, 'I can talk to users, design the system, build the AI,'],
      [12.5, 'ship the frontend…'],
      [13.3, 'and then stand on a stage and explain why it matters.'],
      [17.3, 'I move fast. I measure what I ship.'],
      [19.8, 'And I stay curious when things break.'],
    ],
  },
  {
    title: 'finale',
    tint: AMBER,
    Scene: () => null,
    subs: [
      [0.3, 'So here I am… still building.'],
      [3.3, 'Looking for the next team to build with.'],
      [5.8, 'Early-stage, mid-size, or an MNC. Full-time.'],
      [10.6, "If that's you… let's build something."],
      [13.8, "And please… don't ghost me."],
    ],
  },
];

const Subtitle: React.FC<{ subs: Sub[]; frames: number; size: number }> = ({ subs, frames, size }) => {
  const f = useCurrentFrame();
  const idx = subs.findIndex(([t], i) => f >= s(t) && (i === subs.length - 1 || f < s(subs[i + 1][0])));
  if (idx < 0) return null;
  const [t, text] = subs[idx];
  const end = idx === subs.length - 1 ? frames : s(subs[idx + 1][0]);
  const op = Math.min(interpolate(f, [s(t), s(t) + 8], [0, 1], clamp), interpolate(f, [end - 6, end], [1, 0], clamp));
  return (
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, color: WHITE, opacity: op, textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.8)', maxWidth: '88%' }}>
      {text}
    </div>
  );
};

// One act: fades in from black, slow Ken Burns push, fades out to black.
const ActShot: React.FC<{ act: Act; i: number; len: number; portrait: boolean }> = ({ act, i, len, portrait }) => {
  const f = useCurrentFrame();
  const isLast = i === ACTS.length - 1;
  const total = isLast ? len + OUTRO : len + GAP / 2;
  const fade = Math.min(interpolate(f, [-GAP / 2, 0], [0, 1], clamp), isLast ? 1 : interpolate(f, [total - GAP / 2, total], [1, 0], clamp));
  const push = interpolate(f, [0, total], [1.0, 1.06], clamp);
  const Scene = act.Scene;
  const titleOp = interpolate(f, [0, 20, 70, 100], [0, 1, 1, 0.5], clamp);
  const picScale = portrait ? 0.7 : 1;
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <AbsoluteFill
        style={{
          left: portrait ? (1080 - PIC_W * picScale) / 2 : 0,
          top: portrait ? 700 : (1080 - PIC_H) / 2,
          width: PIC_W,
          height: PIC_H,
          transform: `scale(${picScale})`,
          transformOrigin: '0 0',
          overflow: 'hidden',
        }}
      >
        <AbsoluteFill style={{ background: INK }} />
        <LightLeak tint={act.tint} />
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          {isLast ? <Finale clipLen={len} /> : <Scene />}
        </AbsoluteFill>
      </AbsoluteFill>
      {act.title && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: portrait ? 610 : 58,
            textAlign: 'center',
            opacity: titleOp,
          }}
        >
          <Caps size={portrait ? 26 : 22} color={AMBER}>
            {act.title}
          </Caps>
        </div>
      )}
    </AbsoluteFill>
  );
};

const musicVolume = (f: number) => {
  const under = Math.max(
    ...starts.map((st, i) =>
      interpolate(f, [st - 10, st, st + clipFrames[i], st + clipFrames[i] + 10], [0, 1, 1, 0], clamp),
    ),
  );
  return 0.55 - 0.32 * under;
};

const PortraitHeader: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [starts[1] - GAP / 2, starts[1] + 10], [0, 1], clamp);
  return (
    <>
      <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center', opacity: op }}>
        <Caps size={22}>a builder's story</Caps>
        <div style={{ fontFamily: SERIF, fontSize: 70, color: WHITE, letterSpacing: 8, marginTop: 14 }}>UNNATI CHHABRA</div>
      </div>
      <div style={{ position: 'absolute', bottom: 190, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 30, color: AMBER }}>
        unnati-chhabra.xyz
      </div>
    </>
  );
};

const Cinema: React.FC<{ portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Audio src={staticFile('music/score.wav')} volume={musicVolume} />
    {ACTS.map((act, i) => {
      const isLast = i === ACTS.length - 1;
      const from = Math.max(0, starts[i] - GAP / 2);
      const until = isLast ? CINEMA_FRAMES : starts[i + 1] - GAP / 2;
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={until - from}>
            <Sequence from={starts[i] - from}>
              <ActShot act={act} i={i} len={clipFrames[i]} portrait={portrait} />
            </Sequence>
          </Sequence>
          <Sequence from={starts[i]} durationInFrames={clipFrames[i]}>
            <Audio src={staticFile(`v209/${String(i + 1).padStart(2, '0')}.wav`)} />
            <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', paddingTop: portrait ? 1320 : 975 }}>
              <Subtitle subs={act.subs} frames={clipFrames[i]} size={portrait ? 44 : 36} />
            </AbsoluteFill>
          </Sequence>
        </React.Fragment>
      );
    })}
    <Grain />
    <Flicker />
    <Vignette />
    {portrait && <PortraitHeader />}
    {false && (
      <>
        <div style={{ position: 'absolute', top: 210, left: 0, right: 0, textAlign: 'center' }}>
          <Caps size={22}>a builder's story</Caps>
          <div style={{ fontFamily: SERIF, fontSize: 70, color: WHITE, letterSpacing: 8, marginTop: 14 }}>UNNATI CHHABRA</div>
        </div>
        <div style={{ position: 'absolute', bottom: 190, left: 0, right: 0, textAlign: 'center', fontFamily: MONO, fontSize: 30, color: AMBER }}>
          unnati-chhabra.xyz
        </div>
      </>
    )}
  </AbsoluteFill>
);

export const CinemaLandscape: React.FC = () => <Cinema portrait={false} />;
export const CinemaPortrait: React.FC = () => <Cinema portrait />;
