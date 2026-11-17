import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import durations from './her-durations.json';

export const FPS = 30;
const LEAD = 8; // frames before the first line
const GAP = 10; // frames of silence between lines
const OUTRO = 75; // end card hold after the last line

export const PINK = '#ff4f93';
export const PURPLE = '#9b5de5';
export const PLUM = '#12081a';
export const CREAM = '#fff4f8';
export const GOLD = '#ffd166';
export const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "Menlo, 'SF Mono', monospace";

type Line = { caption: string; hud: string };

const LINES: Line[] = [
  { caption: "Hi, I'm Unnati. I'm an AI engineer, and I'm open to work. Which, respectfully, is a hiring opportunity for you.", hud: 'ENTRANCE' },
  { caption: "I'm looking for a full-time role. AI plus backend, with a product brain attached.", hud: 'THE ASK' },
  { caption: 'Quick lore. At Zomato, I built Parchi Orders for HyperPure. It handled about 70% of company GMV. No pressure.', hud: 'LORE · ZOMATO' },
  { caption: 'Then at Paysecure, I shipped a Shopify payment plugin for 40 merchants, plus BigCommerce and WooCommerce. In just 5 months.', hud: 'LORE · PAYSECURE' },
  { caption: 'Most recently at Grid Dynamics, I built gen AI agents for VISA. And a dev tool that saves the team about 40 hours. Every. Single. Week.', hud: 'LORE · GRID DYNAMICS' },
  { caption: 'My product rule: working is not the same as wanted.', hud: 'PRODUCT' },
  { caption: "Architecture-wise: evals before vibes. If you can't measure an agent, you can't improve it.", hud: 'ARCHITECTURE' },
  { caption: 'And I ship. Fast. Shipping beats perfect, every time.', hud: 'SHIPPING' },
  { caption: "So if you're building in AI and need someone who codes the backend, thinks like a PM, and ships like it's a sport, hire me. Link's below. I run on RAG and lip gloss. Okay, bye.", hud: 'HIRE ME' },
];

const clipFrames = (durations as number[]).map((d) => Math.ceil(d * FPS));
const starts: number[] = [];
clipFrames.reduce((at, len) => {
  starts.push(at);
  return at + len + GAP;
}, LEAD);
export const TOTAL_FRAMES = starts[starts.length - 1] + clipFrames[clipFrames.length - 1] + OUTRO;

// ---------- small animation helpers ----------

export const usePop = (delay = 0, stiffness = 180) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 12, stiffness } });
};

export const Pop: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const s = usePop(delay);
  return (
    <div style={{ transform: `scale(${interpolate(s, [0, 1], [0.4, 1])})`, opacity: Math.min(1, s * 2), ...style }}>
      {children}
    </div>
  );
};

export const Stamp: React.FC<{ text: string; delay?: number; color?: string; rotate?: number; size?: number }> = ({
  text,
  delay = 0,
  color = PINK,
  rotate = -6,
  size = 44,
}) => {
  const s = usePop(delay, 260);
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `rotate(${rotate}deg) scale(${interpolate(s, [0, 1], [2.4, 1])})`,
        opacity: Math.min(1, s * 3),
        border: `5px solid ${color}`,
        color,
        borderRadius: 14,
        padding: '10px 26px',
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 4,
        textTransform: 'uppercase',
        background: 'rgba(18, 8, 26, 0.55)',
      }}
    >
      {text}
    </div>
  );
};

export const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  size = 150,
  color = CREAM,
  style,
}) => (
  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: -3, color, ...style }}>
    {children}
  </div>
);

export const Small: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 3, color: 'rgba(255,244,248,0.7)', textTransform: 'uppercase', ...style }}>
    {children}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = PINK }) => (
  <div
    style={{
      fontFamily: SANS,
      fontWeight: 700,
      fontSize: 52,
      padding: '14px 34px',
      borderRadius: 999,
      background: color,
      color: PLUM,
    }}
  >
    {children}
  </div>
);

export const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 28 }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 200, gap, textAlign: 'center' }}>
    {children}
  </AbsoluteFill>
);

export const gradText: React.CSSProperties = {
  background: `linear-gradient(90deg, ${PINK}, ${PURPLE})`,
  WebkitBackgroundClip: 'text',
  color: 'transparent',
};

// ---------- scenes ----------

const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const glitch = frame < 10 ? Math.sin(frame * 7) * 18 : 0;
  return (
    <Center gap={22}>
      <Pop>
        <Small>📍 subject located</Small>
      </Pop>
      <Pop delay={10}>
        <Big size={210} style={{ transform: `translateX(${glitch}px)` }}>
          <span style={gradText}>Unnati</span> Chhabra
        </Big>
      </Pop>
      <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
        <Pop delay={40}>
          <Chip color={CREAM}>AI engineer</Chip>
        </Pop>
        <Pop delay={80}>
          <Chip>open to work 🟢</Chip>
        </Pop>
      </div>
      <div style={{ position: 'absolute', right: 170, top: 730 }}>
        <Stamp text="hiring opportunity 💅" delay={120} color={GOLD} rotate={6} size={30} />
      </div>
    </Center>
  );
};

const SceneAsk: React.FC = () => (
  <Center gap={36}>
    <Pop>
      <Small>looking for</Small>
    </Pop>
    <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Pop delay={25}>
        <Chip color={CREAM}>full-time</Chip>
      </Pop>
      <Pop delay={48}>
        <Chip>AI</Chip>
      </Pop>
      <Pop delay={60}>
        <Chip color={PURPLE}>backend</Chip>
      </Pop>
      <Pop delay={82}>
        <Chip color={GOLD}>product brain 🧠</Chip>
      </Pop>
    </div>
    <Pop delay={96}>
      <Big size={72}>seed-stage chaos 🌪️ or mid-size 🏢</Big>
    </Pop>
  </Center>
);

const CompanyTag: React.FC<{ name: string; sub: string }> = ({ name, sub }) => (
  <Pop>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, justifyContent: 'center' }}>
      <Big size={64} color={CREAM}>
        {name}
      </Big>
      <Small style={{ fontSize: 26 }}>{sub}</Small>
    </div>
  </Pop>
);

const SceneZomato: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [95, 135], [0, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Center gap={18}>
      <div style={{ position: 'absolute', left: 150, top: 110 }}>
        <Stamp text="lore drop 📜" rotate={-8} />
      </div>
      <CompanyTag name="Zomato" sub="· Parchi Orders for HyperPure" />
      <Pop delay={90}>
        <Big size={300} style={gradText}>
          ~{n}%
        </Big>
      </Pop>
      <Pop delay={130}>
        <Small>of company GMV · no pressure</Small>
      </Pop>
    </Center>
  );
};

const SceneOcr: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [30, 45], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Center gap={18}>
      <CompanyTag name="Zomato" sub="· in-house OCR" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
        <Pop delay={20}>
          <div style={{ position: 'relative' }}>
            <Big size={220} color="rgba(255,244,248,0.55)">
              ₹35
            </Big>
            <div style={{ position: 'absolute', left: 0, top: '48%', height: 14, width: `${strike}%`, background: PINK, borderRadius: 7 }} />
          </div>
        </Pop>
        <Pop delay={50}>
          <Big size={140} color={PINK}>
            →
          </Big>
        </Pop>
        <Pop delay={62}>
          <Big size={260} style={gradText}>
            ₹5
          </Big>
        </Pop>
      </div>
      <Pop delay={70}>
        <Small>per invoice · −80% cost</Small>
      </Pop>
      <div style={{ position: 'absolute', right: 260, top: 230 }}>
        <Stamp text="no way 😭" delay={72} color={GOLD} rotate={10} size={40} />
      </div>
    </Center>
  );
};

const Stat: React.FC<{ value: string; label: string; delay: number; color?: string }> = ({ value, label, delay, color = CREAM }) => (
  <Pop delay={delay}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 420 }}>
      <Big size={190} color={color}>
        {value}
      </Big>
      <Small>{label}</Small>
    </div>
  </Pop>
);

const ScenePaysecure: React.FC = () => (
  <Center gap={40}>
    <CompanyTag name="Paysecure" sub="· payment plugins" />
    <div style={{ display: 'flex', gap: 30 }}>
      <Stat value="40" label="merchants" delay={85} />
      <Stat value="3" label="platforms" delay={135} color={PINK} />
      <Stat value="5" label="months" delay={180} color={GOLD} />
    </div>
    <Pop delay={135}>
      <Small style={{ fontSize: 26 }}>Shopify · BigCommerce · WooCommerce</Small>
    </Pop>
  </Center>
);

const SceneGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ['every.', 'single.', 'week.'];
  return (
    <Center gap={30}>
      <CompanyTag name="Grid Dynamics" sub="· gen AI" />
      <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
        <Pop delay={80}>
          <Chip>AI agents for VISA 💳</Chip>
        </Pop>
        <Pop delay={130}>
          <Chip color={CREAM}>internal dev tool 🛠️</Chip>
        </Pop>
      </div>
      <Pop delay={170}>
        <Big size={220} style={gradText}>
          40 hrs saved
        </Big>
      </Pop>
      <div style={{ display: 'flex', gap: 30 }}>
        {words.map((w, i) => {
          const at = 200 + i * 14;
          const on = frame >= at;
          return (
            <div
              key={w}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 70,
                color: GOLD,
                opacity: on ? 1 : 0,
                transform: `scale(${on ? interpolate(frame - at, [0, 6], [1.6, 1], { extrapolateRight: 'clamp' }) : 1})`,
              }}
            >
              {w.toUpperCase()}
            </div>
          );
        })}
      </div>
    </Center>
  );
};

const SceneProduct: React.FC = () => (
  <Center gap={20}>
    <Pop>
      <Small>product rule</Small>
    </Pop>
    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
      <Pop delay={25}>
        <Big size={190}>working</Big>
      </Pop>
      <Pop delay={42}>
        <Big size={220} color={PINK}>
          ≠
        </Big>
      </Pop>
      <Pop delay={60}>
        <Big size={190} style={gradText}>
          wanted
        </Big>
      </Pop>
    </div>
  </Center>
);

const SceneArch: React.FC = () => (
  <Center gap={30}>
    <Pop>
      <Small>architecture rule</Small>
    </Pop>
    <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
      <Pop delay={30}>
        <Big size={180} style={gradText}>
          evals
        </Big>
      </Pop>
      <Pop delay={42}>
        <Big size={180} color={PINK}>
          &gt;
        </Big>
      </Pop>
      <Pop delay={52}>
        <Big size={180}>vibes ✨</Big>
      </Pop>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 10 }}>
      <Pop delay={85}>
        <Chip color={CREAM}>can't measure it 📏</Chip>
      </Pop>
      <Pop delay={110}>
        <Big size={60} color={PINK}>
          =
        </Big>
      </Pop>
      <Pop delay={120}>
        <Chip color={PURPLE}>can't improve it 📉</Chip>
      </Pop>
    </div>
  </Center>
);

const SceneShip: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 100], [-500, 2400]);
  return (
    <Center gap={30}>
      <div style={{ position: 'absolute', left: x, top: 100, fontSize: 110 }}>🚢💨</div>
      <Stamp text="certified shipper" delay={8} rotate={-5} size={56} />
      <Pop delay={40}>
        <Big size={150}>
          shipping <span style={{ color: PINK }}>&gt;</span> <span style={gradText}>perfect</span>
        </Big>
      </Pop>
      <Pop delay={70}>
        <Small>every. time.</Small>
      </Pop>
    </Center>
  );
};

const SceneOutro: React.FC = () => (
  <Center gap={26}>
    <Pop delay={20}>
      <Big size={220}>
        hire <span style={gradText}>Unnati</span>
      </Big>
    </Pop>
    <Pop delay={44}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 58,
          color: PLUM,
          background: CREAM,
          padding: '14px 36px',
          borderRadius: 16,
          fontWeight: 700,
        }}
      >
        unnati-chhabra.xyz ↗
      </div>
    </Pop>
    <Pop delay={70}>
      <Small>full-time · AI × backend × product · seed to mid-size</Small>
    </Pop>
    <div style={{ position: 'absolute', right: 200, bottom: 300 }}>
      <Stamp text="runs on RAG + lip gloss 💄" delay={205} color={GOLD} rotate={7} size={34} />
    </div>
    <div style={{ position: 'absolute', left: 220, bottom: 300 }}>
      <Stamp text="okay bye 👋" delay={255} color={PINK} rotate={-9} size={34} />
    </div>
  </Center>
);

const SCENES: React.FC[] = [
  SceneIntro,
  SceneAsk,
  SceneZomato,
  ScenePaysecure,
  SceneGrid,
  SceneProduct,
  SceneArch,
  SceneShip,
  SceneOutro,
];

// ---------- captions (karaoke style, timed by word length) ----------

const Captions: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const weight = (w: string) => w.length + 2 + (/[.?]$/.test(w) ? 7 : /,$/.test(w) ? 4 : 0);
  const total = words.reduce((a, w) => a + weight(w), 0);
  let acc = 0;
  const timed = words.map((w) => {
    const at = (acc / total) * frames;
    acc += weight(w);
    return { w, at };
  });

  // chunks of up to 4 words, breaking after punctuation
  const chunks: { w: string; at: number }[][] = [[]];
  timed.forEach((t) => {
    const cur = chunks[chunks.length - 1];
    cur.push(t);
    if (cur.length >= 4 || /[.?,]$/.test(t.w)) chunks.push([]);
  });
  const live = chunks.filter((c) => c.length);
  const idx = Math.max(0, live.findIndex((c, i) => frame >= c[0].at && (i === live.length - 1 || frame < live[i + 1][0].at)));
  const chunk = live[idx];
  const chunkStart = chunk[0].at;
  const bump = interpolate(frame - chunkStart, [0, 5], [1.12, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120, paddingLeft: CONTENT_SHIFT * 2 }}>
      <div style={{ display: 'flex', gap: 20, transform: `scale(${bump})` }}>
        {chunk.map((t, i) => {
          const spoken = frame >= t.at;
          const current = spoken && (i === chunk.length - 1 || frame < chunk[i + 1].at);
          return (
            <span
              key={`${t.w}-${i}`}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 64,
                textTransform: 'uppercase',
                color: current ? GOLD : spoken ? CREAM : 'rgba(255,244,248,0.35)',
                textShadow: '0 4px 0 rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.6)',
                WebkitTextStroke: '2px rgba(0,0,0,0.5)',
              }}
            >
              {t.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- backdrop + HUD ----------

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const a = Math.sin(frame / 50) * 120;
  const b = Math.cos(frame / 70) * 140;
  return (
    <AbsoluteFill style={{ background: PLUM }}>
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          borderRadius: '50%',
          left: 200 + a,
          top: -300 + b,
          background: `radial-gradient(circle, ${PINK}55, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          right: 100 - b,
          bottom: -500 + a,
          background: `radial-gradient(circle, ${PURPLE}55, transparent 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.13, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 6} stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 75% 65% at center, transparent 45%, rgba(0,0,0,0.35) 82%, rgba(0,0,0,0.7) 100%)',
    }}
  />
);

const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const sceneIdx = Math.max(0, starts.filter((s) => frame >= s - GAP).length - 1);
  const secs = Math.floor(frame / FPS);
  const tc = `00:00:${String(secs).padStart(2, '0')}:${String(frame % FPS).padStart(2, '0')}`;
  const corner = (pos: React.CSSProperties, widths: string): React.CSSProperties => ({
    position: 'absolute',
    width: 46,
    height: 46,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,0.55)',
    borderWidth: widths,
    ...pos,
  });
  const text: React.CSSProperties = { fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: 'rgba(255,255,255,0.8)' };
  return (
    <AbsoluteFill>
      <div style={corner({ top: 36, left: 36 }, '2px 0 0 2px')} />
      <div style={corner({ top: 36, right: 36 }, '2px 2px 0 0')} />
      <div style={corner({ bottom: 36, left: 36 }, '0 0 2px 2px')} />
      <div style={corner({ bottom: 36, right: 36 }, '0 2px 2px 0')} />
      <div style={{ position: 'absolute', top: 52, left: 100, display: 'flex', alignItems: 'center', gap: 14, ...text }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: '#ff3b30', opacity: Math.floor(frame / 20) % 2 ? 0.2 : 1 }} />
        UNNATI-CHHABRA.XYZ · CAM 01 / LIVE
      </div>
      <div style={{ position: 'absolute', top: 52, right: 100, ...text }}>REC {tc}</div>
      <div style={{ position: 'absolute', bottom: 52, left: 100, ...text, color: 'rgba(255,255,255,0.5)' }}>
        {String(sceneIdx + 1).padStart(2, '0')} / {String(LINES.length).padStart(2, '0')} · {LINES[sceneIdx].hud}
      </div>
    </AbsoluteFill>
  );
};

// ---------- tech rail: terminal + system diagram per scene ----------

export const CYAN = '#5ef2ff';
export const MINT = '#7dffb3';
const RAIL_X = 80;
const RAIL_W = 520;

export type Tech = {
  cmd: string;
  out: string[];
  diagTitle: string;
  nodes: string[];
  loop?: boolean;
  sticker?: string;
};

const TECH: Tech[] = [
  {
    cmd: 'whoami',
    out: ['unnati chhabra · ai engineer', 'open_to_work = true 🟢'],
    diagTitle: 'boot sequence',
    nodes: ['load ai_engineer', 'mount backend', 'attach product_brain', 'status: ready'],
    sticker: 'main character energy ✨',
  },
  {
    cmd: 'cat looking_for.yaml',
    out: ['type: full-time', 'stack: [ai, backend]', 'bonus: product_brain'],
    diagTitle: 'role.match()',
    nodes: ['full-time', 'AI × backend', 'product brain', 'seed → mid-size'],
    sticker: "it's giving full-stack 💅",
  },
  {
    cmd: 'git log --author=unnati zomato',
    out: ['feat: parchi orders (hyperpure)', 'feat: in-house ocr ₹35 → ₹5', 'feat: genai bot evals'],
    diagTitle: 'parchi orders · hyperpure',
    nodes: ['order placed', 'parchi orders', 'dispatch', 'fulfillment', '~70% of GMV'],
    sticker: 'ate. no crumbs 🍽️',
  },
  {
    cmd: 'git log --author=unnati paysecure',
    out: ['feat: shopify gateway plugin', 'feat: bigcommerce + woocommerce', 'feat: pgvector support bot'],
    diagTitle: 'payment flow',
    nodes: ['Shopify · BigComm · Woo', 'Node.js App Proxy', 'secure redirect', 'payment gateway'],
    sticker: 'no cap 🧢',
  },
  {
    cmd: 'python agent.py --client visa',
    out: ['retriever: pgvector ✓', 'retrieval accuracy: 80%', 'dev hours saved: ~40/wk'],
    diagTitle: 'RAG agent · VISA',
    nodes: ['user query', 'pgvector retrieval', 'LLM', 'agent action', '200–300 users'],
    sticker: 'W 🏆',
  },
  {
    cmd: 'python -c "assert works == wanted"',
    out: ['AssertionError:', '  talk to users first'],
    diagTitle: 'product loop',
    nodes: ['it works', 'do people want it?', 'ship · kill · iterate'],
    sticker: 'real. 💯',
  },
  {
    cmd: 'make evals',
    out: ['measuring agent...', '✓ measurable → improvable', 'vibes: deprecated'],
    diagTitle: 'eval loop',
    nodes: ['agent', 'evals', 'metrics', 'improve'],
    loop: true,
    sticker: 'nerd alert 🤓',
  },
  {
    cmd: 'git push origin main',
    out: ['deploying...', '✓ shipped. next.'],
    diagTitle: 'deploy pipeline',
    nodes: ['idea', 'v1', 'prod 🚀'],
    sticker: 'speedrun any% 💨',
  },
  {
    cmd: 'open unnati-chhabra.xyz',
    out: ['opening portfolio... 💖', 'DMs: open'],
    diagTitle: 'contact',
    nodes: ['unnati-chhabra.xyz', 'full-time', 'DMs open 📩'],
  },
];

export const Panel: React.FC<{ title: string; top: number; height: number; children: React.ReactNode }> = ({ title, top, height, children }) => (
  <div
    style={{
      position: 'absolute',
      left: RAIL_X,
      top,
      width: RAIL_W,
      height,
      borderRadius: 14,
      background: 'rgba(12, 5, 18, 0.95)',
      border: '1.5px solid rgba(255,255,255,0.14)',
      boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.45), 0 0 40px ${PURPLE}22`,
      overflow: 'hidden',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
      ))}
      <div style={{ marginLeft: 10, fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.5)' }}>{title}</div>
    </div>
    <div style={{ padding: '14px 18px' }}>{children}</div>
  </div>
);

export const Terminal: React.FC<{ tech: Tech; frames: number }> = ({ tech, frames }) => {
  const frame = useCurrentFrame();
  const typeEnd = Math.min(28, frames * 0.25);
  const typed = Math.floor(interpolate(frame, [2, typeEnd], [0, tech.cmd.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const outAt = (i: number) => typeEnd + 6 + i * Math.max(8, (frames * 0.45) / tech.out.length);
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  const line: React.CSSProperties = { fontFamily: MONO, fontSize: 21, lineHeight: '34px', whiteSpace: 'nowrap' };
  return (
    <Panel title="~/unnati — zsh" top={120} height={250}>
      <div style={line}>
        <span style={{ color: MINT }}>➜</span> <span style={{ color: CYAN }}>~</span>{' '}
        <span style={{ color: CREAM }}>{tech.cmd.slice(0, typed)}</span>
        {typed < tech.cmd.length && cursorOn && <span style={{ background: CREAM, color: CREAM }}>_</span>}
      </div>
      {tech.out.map((o, i) =>
        frame >= outAt(i) ? (
          <div key={o} style={{ ...line, color: o.startsWith('✓') || o.includes('true') ? MINT : o.startsWith('Assertion') ? PINK : 'rgba(255,244,248,0.8)' }}>
            {o}
          </div>
        ) : null,
      )}
    </Panel>
  );
};

export const Diagram: React.FC<{ tech: Tech; frames: number }> = ({ tech, frames }) => {
  const frame = useCurrentFrame();
  const n = tech.nodes.length;
  const boxW = 360;
  const boxH = 50;
  const gap = n > 4 ? 26 : 38;
  const x0 = 34;
  const y0 = 8;
  const height = n * boxH + (n - 1) * gap + y0 * 2;
  const step = Math.max(10, (frames * 0.55) / n);
  const shown = (i: number) => frame >= 10 + i * step;
  const packetT = (frame % 45) / 45;
  return (
    <Panel title={`system.diagram — ${tech.diagTitle}`} top={392} height={height + 70}>
      <svg width={RAIL_W - 36} height={height} style={{ overflow: 'visible' }}>
        {tech.nodes.slice(0, -1).map((_, i) => {
          const yA = y0 + i * (boxH + gap) + boxH;
          const yB = yA + gap;
          const on = shown(i + 1);
          const py = yA + (yB - yA) * packetT;
          return (
            <g key={`edge-${i}`} opacity={on ? 1 : 0}>
              <line x1={x0 + boxW / 2} y1={yA} x2={x0 + boxW / 2} y2={yB - 4} stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="5 5" />
              <path d={`M${x0 + boxW / 2 - 6} ${yB - 9} L${x0 + boxW / 2} ${yB - 2} L${x0 + boxW / 2 + 6} ${yB - 9}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
              <circle cx={x0 + boxW / 2} cy={py} r={5} fill={CYAN} style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }} />
            </g>
          );
        })}
        {tech.loop && shown(n - 1) && (
          <g>
            <path
              d={`M${x0 + boxW} ${y0 + (n - 1) * (boxH + gap) + boxH / 2} H${x0 + boxW + 40} V${y0 + boxH / 2} H${x0 + boxW + 8}`}
              fill="none"
              stroke={PINK}
              strokeWidth={2}
              strokeDasharray="6 5"
              strokeDashoffset={-frame}
            />
            <path d={`M${x0 + boxW + 16} ${y0 + boxH / 2 - 6} L${x0 + boxW + 6} ${y0 + boxH / 2} L${x0 + boxW + 16} ${y0 + boxH / 2 + 6}`} fill="none" stroke={PINK} strokeWidth={2} />
          </g>
        )}
        {tech.nodes.map((label, i) => {
          const y = y0 + i * (boxH + gap);
          const on = shown(i);
          const last = i === n - 1;
          const pulse = on ? interpolate(frame - (10 + i * step), [0, 8], [1.15, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
          return (
            <g key={label} opacity={on ? 1 : 0.12} transform={`translate(${x0 + boxW / 2} ${y + boxH / 2}) scale(${pulse}) translate(${-(x0 + boxW / 2)} ${-(y + boxH / 2)})`}>
              <rect
                x={x0}
                y={y}
                width={boxW}
                height={boxH}
                rx={10}
                fill={last ? `${PINK}2e` : 'rgba(255,255,255,0.04)'}
                stroke={last ? PINK : on ? CYAN : 'rgba(255,255,255,0.3)'}
                strokeWidth={last ? 2 : 1.5}
              />
              <text x={x0 + boxW / 2} y={y + boxH / 2 + 7} textAnchor="middle" fontFamily={MONO} fontSize={20} fill={CREAM}>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </Panel>
  );
};

export const Sticker: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const s = usePop(14, 220);
  const rot = index % 2 ? 7 : -6;
  return (
    <div
      style={{
        position: 'absolute',
        right: 110,
        top: 112,
        transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [0, 1])})`,
        background: index % 3 === 0 ? GOLD : index % 3 === 1 ? CYAN : MINT,
        color: PLUM,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 34,
        padding: '10px 22px',
        borderRadius: 14,
        border: `4px solid ${CREAM}`,
        boxShadow: '6px 6px 0 rgba(0,0,0,0.55)',
      }}
    >
      {text}
    </div>
  );
};

export const Notification: React.FC<{ delay: number }> = ({ delay }) => {
  const s = usePop(delay, 160);
  return (
    <div
      style={{
        position: 'absolute',
        right: 100,
        top: 108,
        width: 470,
        transform: `translateX(${interpolate(s, [0, 1], [560, 0])}px)`,
        background: 'rgba(255,244,248,0.96)',
        borderRadius: 22,
        padding: '16px 20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        fontFamily: SANS,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#6b5a70', fontWeight: 600 }}>
        <span>📩 MESSAGES</span>
        <span>now</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: PLUM, marginTop: 6 }}>you, probably</div>
      <div style={{ fontSize: 24, color: PLUM, marginTop: 2 }}>hey, are you free to chat this week? 👀</div>
    </div>
  );
};

export const CodeRain: React.FC = () => {
  const frame = useCurrentFrame();
  const words = ['pgvector', 'redis', 'node.js', 'next.js', 'postgres', 'rag', 'evals', 'k8s', 'docker', 'llm', 'agents', 'java', 'python', 'sql', 'ci/cd', 'react'];
  const cols = 14;
  return (
    <AbsoluteFill style={{ opacity: 0.045 }}>
      {Array.from({ length: cols }).map((_, c) => {
        const speed = 0.6 + ((c * 37) % 10) / 10;
        const offset = ((frame * speed + c * 173) % 1400) - 300;
        return (
          <div key={c} style={{ position: 'absolute', left: 40 + c * 138, top: -offset, display: 'flex', flexDirection: 'column', gap: 26 }}>
            {Array.from({ length: 22 }).map((__, r) => (
              <span key={r} style={{ fontFamily: MONO, fontSize: 20, color: r % 4 === 0 ? CYAN : CREAM }}>
                {words.at((c * 5 + r * 3) % words.length)}
              </span>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

export const GridFloor: React.FC = () => {
  const frame = useCurrentFrame();
  const shift = (frame * 2) % 60;
  return (
    <AbsoluteFill style={{ perspective: 600, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: -600,
          right: -600,
          bottom: -200,
          height: 700,
          transform: 'rotateX(68deg)',
          transformOrigin: 'bottom',
          backgroundImage: `linear-gradient(${PINK}40 2px, transparent 2px), linear-gradient(90deg, ${PURPLE}40 2px, transparent 2px)`,
          backgroundSize: '60px 60px',
          backgroundPosition: `0 ${shift}px`,
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- main ----------

export const CONTENT_SHIFT = 290; // scene content sits right of the tech rail
export const CONTENT_SCALE = 0.66;

export const Punch: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, 8], [1.06, 1], { extrapolateRight: 'clamp' });
  const flash = interpolate(frame, [0, 4], [0.3, 0], { extrapolateRight: 'clamp' });
  const glitch = interpolate(frame, [0, 7], [9, 0], { extrapolateRight: 'clamp' });
  const jitter = frame < 7 ? Math.sin(frame * 9) * glitch : 0;
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${jitter}px) scale(${s})`,
        filter: glitch > 0.5 ? `drop-shadow(${glitch}px 0 0 rgba(255,40,120,0.75)) drop-shadow(${-glitch}px 0 0 rgba(60,240,255,0.75))` : undefined,
      }}
    >
      {children}
      <AbsoluteFill style={{ background: CREAM, opacity: flash }} />
    </AbsoluteFill>
  );
};

export const HiringVideo: React.FC = () => (
  <AbsoluteFill style={{ background: PLUM }}>
    <Backdrop />
    <GridFloor />
    <CodeRain />
    {LINES.map((line, i) => {
      const Scene = SCENES[i];
      const tech = TECH[i];
      const isLast = i === LINES.length - 1;
      const from = i === 0 ? 0 : starts[i] - Math.floor(GAP / 2);
      const until = isLast ? TOTAL_FRAMES : starts[i + 1] - Math.floor(GAP / 2);
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={until - from}>
            <Punch>
              <Sequence from={starts[i] - from}>
                <AbsoluteFill style={{ transform: `translateX(${CONTENT_SHIFT}px) scale(${CONTENT_SCALE})` }}>
                  <Scene />
                </AbsoluteFill>
                <Terminal tech={tech} frames={clipFrames[i]} />
                <Diagram tech={tech} frames={clipFrames[i]} />
                {tech.sticker && <Sticker text={tech.sticker} index={i} />}
                {isLast && <Notification delay={150} />}
              </Sequence>
            </Punch>
          </Sequence>
          <Sequence from={starts[i]} durationInFrames={clipFrames[i]}>
            <Audio src={staticFile(`her/${String(i + 1).padStart(2, '0')}.wav`)} />
            <Captions text={line.caption} frames={clipFrames[i]} />
          </Sequence>
        </React.Fragment>
      );
    })}
    <Vignette />
    <Grain />
    <Hud />
  </AbsoluteFill>
);
