import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import durations from './v208-durations.json';
import { AnchoredCaptions, Place, Row, Rule, Sent, StatCard } from './Hinglish';
import {
  Backdrop,
  Big,
  CONTENT_SCALE,
  CONTENT_SHIFT,
  CREAM,
  CYAN,
  Center,
  Chip,
  CodeRain,
  Diagram,
  GOLD,
  Grain,
  GridFloor,
  MINT,
  MONO,
  Notification,
  PINK,
  PLUM,
  PURPLE,
  Pop,
  Punch,
  SANS,
  Small,
  Stamp,
  Sticker,
  Tech,
  Terminal,
  Vignette,
  gradText,
  usePop,
} from './Video';

const FPS = 30;
const LEAD = 8;
const GAP = 10;
const OUTRO = 75;
const s = (sec: number) => Math.round(sec * FPS);

const clipFrames = (durations as number[]).map((d) => Math.ceil(d * FPS));
const starts: number[] = [];
clipFrames.reduce((at, len) => {
  starts.push(at);
  return at + len + GAP;
}, LEAD);
export const FINAL_FRAMES = starts[starts.length - 1] + clipFrames[clipFrames.length - 1] + OUTRO;

// ---------- logos ----------

export type LogoKind = { svg: string; color: string } | { img: string } | { microsoft: true } | { word: string; color: string };

export const LOGOS: Record<string, LogoKind> = {
  zomato: { svg: 'si-zomato.svg', color: '#E23744' },
  visa: { svg: 'si-visa.svg', color: '#1A1F71' },
  github: { svg: 'si-github.svg', color: '#181717' },
  shopify: { svg: 'si-shopify.svg', color: '#7AB55C' },
  bigcommerce: { svg: 'si-bigcommerce.svg', color: '#121118' },
  woocommerce: { word: 'WooCommerce', color: '#7f54b3' },
  linkedin: { svg: 'si-linkedin.svg', color: '#0A66C2' },
  x: { svg: 'si-x.svg', color: '#000000' },
  lfx: { svg: 'si-linuxfoundation.svg', color: '#003778' },
  griddynamics: { img: 'fav-griddynamics.com.png' },
  anitab: { img: 'fav-anitab.org.png' },
  microsoft: { microsoft: true },
  paysecure: { word: 'Paysecure', color: '#4b2bd6' },
  girlscript: { word: 'GirlScript', color: '#e85d75' },
  codxcrypt: { word: '</CodXCrypt>', color: '#12081a' },
};

export const LogoMark: React.FC<{ kind: LogoKind; size: number }> = ({ kind, size }) => {
  if ('svg' in kind) {
    const url = `url(${staticFile(`logos/${kind.svg}`)})`;
    return (
      <div
        style={{
          width: size,
          height: size,
          background: kind.color,
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }
  if ('img' in kind) return <Img src={staticFile(`logos/${kind.img}`)} style={{ width: size, height: size, objectFit: 'contain' }} />;
  if ('microsoft' in kind) {
    const q = size * 0.47;
    return (
      <div style={{ width: size, height: size, display: 'grid', gridTemplateColumns: `${q}px ${q}px`, gap: size * 0.06, alignContent: 'center', justifyContent: 'center' }}>
        {['#F25022', '#7FBA00', '#00A4EF', '#FFB900'].map((c) => (
          <div key={c} style={{ width: q, height: q, background: c }} />
        ))}
      </div>
    );
  }
  return (
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: Math.min(size * 0.5, (size * 3.7 * 0.85) / (kind.word.length * 0.62)), color: kind.color, whiteSpace: 'nowrap', letterSpacing: -1 }}>{kind.word}</div>
  );
};

// White tile + brand mark, flies in with a spring and gets a one-off shine sweep.
const LogoTile: React.FC<{ id: keyof typeof LOGOS; at: number; size?: number; label?: string; wide?: boolean }> = ({ id, at, size = 150, label, wide }) => {
  const frame = useCurrentFrame();
  const p = usePop(at, 170);
  const kind = LOGOS[id];
  const isWord = 'word' in kind;
  const w = wide || isWord ? size * 2.3 : size;
  const shine = interpolate(frame - at, [6, 26], [-60, 160], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        opacity: Math.min(1, p * 2),
        transform: `translateY(${interpolate(p, [0, 1], [80, 0])}px) rotate(${interpolate(p, [0, 1], [-14, 0])}deg) scale(${interpolate(p, [0, 1], [0.3, 1])})`,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: w,
          height: size,
          borderRadius: size * 0.24,
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: `0 18px 40px rgba(0,0,0,0.45), 0 0 0 4px rgba(255,255,255,0.25), 0 0 50px ${PINK}55`,
        }}
      >
        <LogoMark kind={kind} size={size * 0.62} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${shine}%`,
            width: '35%',
            background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.85), transparent)',
            transform: 'skewX(-18deg)',
          }}
        />
      </div>
      {label && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size * 0.24, color: CREAM, whiteSpace: 'nowrap' }}>{label}</div>}
    </div>
  );
};

// ---------- sections ----------

type Section = { hud: string; sents: Sent[]; tech: Tech };

const SECTIONS: Section[] = [
  {
    hud: 'THE GHOSTING',
    sents: [
      [0.0, 'Okay, real talk.'],
      [1.2, "I've been job hunting for a while now."],
      [2.9, 'The calls are coming, the interviews are happening... and then? Ghosted.'],
      [5.6, 'And the irony? I literally run Hirvana, where I help people crack their job hunt.'],
    ],
    tech: {
      cmd: 'grep -r "next steps" ~/inbox',
      out: ['0 results 👻', 'status: ghosted'],
      diagTitle: 'interview funnel',
      nodes: ['applied', 'round 1 ✓', 'round 2 ✓', 'round 3 ✓', '...silence'],
      sticker: "it's giving ghost 👻",
    },
  },
  {
    hud: 'ENTRANCE',
    sents: [
      [0.0, 'So I figured, let me just show up in your feed instead.'],
      [2.7, "Hi, I'm Unnati. AI engineer, backend person, with a product brain."],
    ],
    tech: {
      cmd: 'whoami',
      out: ['unnati chhabra · ai engineer', 'open_to_work = true 🟢'],
      diagTitle: 'boot sequence',
      nodes: ['load ai_engineer', 'mount backend', 'attach product_brain', 'status: ready'],
      sticker: 'main character energy ✨',
    },
  },
  {
    hud: 'ORIGIN STORY',
    sents: [
      [0.0, 'My story starts with a hackathon.'],
      [1.9, 'Zomato ran one, and I won it.'],
      [4.2, "That's how I got into Zomato."],
    ],
    tech: {
      cmd: 'git log --oneline origin',
      out: ['feat: enter zomato hackathon', 'win: 1st 🏆', 'offer: zomato ✓'],
      diagTitle: 'origin story',
      nodes: ['hackathon', 'won 🏆', 'Zomato'],
      sticker: 'lore drop 📜',
    },
  },
  {
    hud: 'LORE · ZOMATO',
    sents: [
      [0.0, "There, I built Parchi Orders, which handled about 70% of HyperPure's GMV."],
      [4.8, 'And I moved invoice OCR in-house.'],
    ],
    tech: {
      cmd: 'git log --author=unnati zomato',
      out: ['feat: parchi orders (hyperpure)', 'feat: in-house ocr ₹35 → ₹5', 'feat: genai bot evals'],
      diagTitle: 'parchi orders · hyperpure',
      nodes: ['order placed', 'parchi orders', 'dispatch', 'fulfillment', '~70% of GMV'],
      sticker: 'ate. no crumbs 🍽️',
    },
  },
  {
    hud: 'LORE · PAYSECURE + GRID',
    sents: [
      [0.0, 'Then at Paysecure, payment plugins for 40 merchants, in 5 months.'],
      [4.2, 'And at Grid Dynamics, gen AI agents for VISA, plus a dev tool that saves the team 40 hours every week.'],
    ],
    tech: {
      cmd: 'python agent.py --client visa',
      out: ['retriever: pgvector ✓', 'retrieval accuracy: 80%', 'dev hours saved: ~40/wk'],
      diagTitle: 'RAG agent · VISA',
      nodes: ['user query', 'pgvector retrieval', 'LLM', 'agent action', '200–300 users'],
      sticker: 'no cap 🧢',
    },
  },
  {
    hud: 'COMMUNITY',
    sents: [
      [0.0, "But my arc isn't just code."],
      [1.8, 'I founded CodXCrypt, a coding community.'],
      [3.9, "I've been a GitHub Campus Expert, a Microsoft Learn Student Ambassador, an LFX mentee, and a mentor for GirlScript and AnitaB.org."],
    ],
    tech: {
      cmd: 'cat community.json',
      out: ['"github": "campus expert"', '"microsoft": "student ambassador"', '"lfx": "mentee"'],
      diagTitle: 'community graph',
      nodes: ['CodXCrypt', 'GitHub Campus Expert', 'MLSA · LFX', 'GirlScript · AnitaB.org'],
      sticker: 'community era 🫶',
    },
  },
  {
    hud: 'REACH',
    sents: [
      [0.0, 'I run workshops, I co-host buildathons,'],
      [2.3, 'and 21,000 people follow me on LinkedIn,'],
      [4.9, 'and 59,000 people follow me on Twitter.'],
      [7.2, "So I don't just build the system, I can explain it on stage too."],
    ],
    tech: {
      cmd: 'curl api/reach',
      out: ['linkedin: 21K', 'x: 59K', 'stage: unlocked 🎤'],
      diagTitle: 'reach',
      nodes: ['workshops', 'buildathons', 'LinkedIn 21K', 'X 59K'],
      sticker: 'public speaker era 🎤',
    },
  },
  {
    hud: 'HOW I WORK',
    sents: [
      [0.0, 'My rules are simple.'],
      [0.9, 'Shipping beats perfect. Evals before vibes.'],
      [3.3, 'And working is not the same as wanted.'],
    ],
    tech: {
      cmd: 'make evals',
      out: ['measuring agent...', '✓ measurable → improvable', 'vibes: deprecated'],
      diagTitle: 'eval loop',
      nodes: ['agent', 'evals', 'metrics', 'improve'],
      loop: true,
      sticker: 'nerd alert 🤓',
    },
  },
  {
    hud: 'HIRE ME',
    sents: [
      [0.1, "So if you're an early-stage or mid-size startup, or an MNC, building in AI and backend,"],
      [5.7, 'and if you need someone full-time, hire me.'],
      [7.6, "And if you interview me, please reply. Don't ghost me."],
      [10.6, "It's already Halloween week. Okay, bye!"],
    ],
    tech: {
      cmd: 'open unnati-chhabra.xyz',
      out: ['opening portfolio... 💖', 'DMs: open', 'ghosting: disabled'],
      diagTitle: 'contact',
      nodes: ['unnati-chhabra.xyz', 'full-time', 'DMs open 📩'],
    },
  },
];

// ---------- scenes ----------

const SceneGhost: React.FC = () => (
  <Center gap={22}>
    <Row at={s(2.9)} icon="📅" title="Interview · Round 1" status="cleared ✅" good />
    <Row at={s(3.4)} icon="📅" title="Interview · Round 2" status="cleared ✅" good />
    <Row at={s(3.9)} icon="📅" title="Interview · Round 3" status="cleared ✅" good />
    <Row at={s(4.5)} icon="✉️" title="Re: next steps?" status="seen ✓✓ ..." />
    <div style={{ position: 'absolute', left: 760, top: 470 }}>
      <Stamp text="ghosted 👻" delay={s(4.9)} rotate={-10} size={96} />
    </div>
    <div style={{ marginTop: 26 }}>
      <Pop delay={s(5.8)}>
        <Big size={86}>
          plot twist: I run <span style={gradText}>Hirvana</span> 💼
        </Big>
      </Pop>
    </div>
    <Pop delay={s(7.6)}>
      <Small style={{ fontSize: 40 }}>I literally help people get hired</Small>
    </Pop>
  </Center>
);

const SceneIntro: React.FC = () => (
  <Center gap={24}>
    <Pop>
      <Small style={{ fontSize: 40 }}>📍 recruiter not found → subject located</Small>
    </Pop>
    <Pop delay={s(2.8)}>
      <Big size={220}>
        <span style={gradText}>Unnati</span> Chhabra
      </Big>
    </Pop>
    <div style={{ display: 'flex', gap: 26, marginTop: 20 }}>
      <Pop delay={s(3.6)}>
        <Chip color={CREAM}>AI engineer</Chip>
      </Pop>
      <Pop delay={s(4.3)}>
        <Chip color={PURPLE}>backend</Chip>
      </Pop>
      <Pop delay={s(5.0)}>
        <Chip color={GOLD}>product brain 🧠</Chip>
      </Pop>
    </div>
  </Center>
);

const SceneOrigin: React.FC = () => {
  const frame = useCurrentFrame();
  const arrow = interpolate(frame, [s(3.2), s(4.3)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <Center gap={40}>
      <Stamp text="origin story 📜" rotate={-4} size={52} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 50, marginTop: 30 }}>
        <Pop delay={s(1.9)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 260,
                height: 260,
                borderRadius: '50%',
                background: GOLD,
                border: `8px solid ${CREAM}`,
                boxShadow: `0 0 80px ${GOLD}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 140,
              }}
            >
              🏆
            </div>
            <Big size={60} color={GOLD}>
              won the hackathon
            </Big>
          </div>
        </Pop>
        <div style={{ width: 300, height: 12, borderRadius: 6, background: 'rgba(255,244,248,0.15)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, width: `${arrow * 100}%`, background: `linear-gradient(90deg, ${GOLD}, ${PINK})`, boxShadow: `0 0 20px ${PINK}` }} />
        </div>
        <LogoTile id="zomato" at={s(4.3)} size={260} label="joined Zomato" />
      </div>
    </Center>
  );
};

const SceneZomato: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [s(2.4), s(3.8)], [0, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Center gap={46}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
        <LogoTile id="zomato" at={0} size={130} />
        <div style={{ textAlign: 'left' }}>
          <Big size={96}>Zomato</Big>
          <Small style={{ fontSize: 34 }}>Parchi Orders · HyperPure</Small>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 40 }}>
        <StatCard at={s(1.6)} value={`~${n}%`} label="of HyperPure GMV" sub="parchi orders" />
        <StatCard at={s(4.9)} value="₹35→₹5" label="per invoice" sub="in-house OCR · −80%" />
      </div>
    </Center>
  );
};

const ScenePayGrid: React.FC = () => (
  <Center>
    <div style={{ display: 'flex', gap: 50, alignItems: 'stretch' }}>
      <Pop delay={s(0.1)}>
        <div style={{ width: 820, height: '100%', borderRadius: 28, padding: '40px 44px', background: 'rgba(255,244,248,0.05)', border: '2px solid rgba(255,244,248,0.16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <LogoTile id="paysecure" at={s(0.2)} size={110} />
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 34 }}>
            <LogoTile id="shopify" at={s(1.0)} size={110} />
            <LogoTile id="bigcommerce" at={s(1.3)} size={110} />
            <LogoTile id="woocommerce" at={s(1.6)} size={110} wide />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 34 }}>
            <Pop delay={s(2.3)}>
              <Big size={110}>40</Big>
            </Pop>
            <Pop delay={s(2.5)}>
              <Big size={46}>merchants</Big>
            </Pop>
            <Pop delay={s(3.3)}>
              <Big size={110} color={GOLD}>
                5
              </Big>
            </Pop>
            <Pop delay={s(3.5)}>
              <Big size={46}>months</Big>
            </Pop>
          </div>
        </div>
      </Pop>
      <Pop delay={s(4.2)}>
        <div style={{ width: 820, height: '100%', borderRadius: 28, padding: '40px 44px', background: 'rgba(255,244,248,0.05)', border: '2px solid rgba(255,244,248,0.16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <LogoTile id="griddynamics" at={s(4.3)} size={110} />
            <Big size={72}>Grid Dynamics</Big>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 34 }}>
            <LogoTile id="visa" at={s(5.4)} size={110} wide />
            <Pop delay={s(5.6)}>
              <Big size={52} color={CYAN}>
                gen AI agents
              </Big>
            </Pop>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 34 }}>
            <Pop delay={s(8.2)}>
              <Big size={110} color={PINK}>
                40 hrs
              </Big>
            </Pop>
            <Pop delay={s(8.5)}>
              <Big size={46}>saved / week 🛠️</Big>
            </Pop>
          </div>
        </div>
      </Pop>
    </div>
  </Center>
);

const SceneCommunity: React.FC = () => (
  <Center gap={40}>
    <Pop>
      <Small style={{ fontSize: 40 }}>not just code 🫶</Small>
    </Pop>
    <div style={{ display: 'flex', gap: 34, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', width: 1700 }}>
      <LogoTile id="codxcrypt" at={s(1.9)} size={150} label="founder" />
      <LogoTile id="github" at={s(4.2)} size={150} label="Campus Expert" />
      <LogoTile id="microsoft" at={s(5.4)} size={150} label="Student Ambassador" />
    </div>
    <div style={{ display: 'flex', gap: 34, alignItems: 'flex-start', justifyContent: 'center' }}>
      <LogoTile id="lfx" at={s(7.0)} size={150} label="LFX mentee" />
      <LogoTile id="girlscript" at={s(8.3)} size={150} label="mentor" />
      <LogoTile id="anitab" at={s(9.4)} size={150} label="AnitaB.org mentor" />
    </div>
  </Center>
);

const Counter: React.FC<{ id: keyof typeof LOGOS; at: number; to: number; label: string; color: string }> = ({ id, at, to, label, color }) => {
  const frame = useCurrentFrame();
  const k = Math.round(interpolate(frame, [at + 6, at + 30], [0, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
      <LogoTile id={id} at={at} size={150} />
      <Pop delay={at + 4}>
        <div style={{ textAlign: 'left' }}>
          <Big size={170} color={color}>
            {k}K
          </Big>
          <Small style={{ fontSize: 34 }}>{label}</Small>
        </div>
      </Pop>
    </div>
  );
};

const SceneReach: React.FC = () => (
  <Center gap={44}>
    <div style={{ display: 'flex', gap: 24 }}>
      <Pop delay={s(0.3)}>
        <Chip color={PINK}>🎤 workshops</Chip>
      </Pop>
      <Pop delay={s(1.2)}>
        <Chip color={PURPLE}>🛠️ buildathons co-host</Chip>
      </Pop>
    </div>
    <div style={{ display: 'flex', gap: 110 }}>
      <Counter id="linkedin" at={s(2.4)} to={21} label="LinkedIn followers" color={CYAN} />
      <Counter id="x" at={s(5.0)} to={59} label="Twitter / X followers" color={GOLD} />
    </div>
    <Pop delay={s(7.4)}>
      <Big size={70}>
        builds the system <span style={{ color: PINK }}>+</span> explains it on stage
      </Big>
    </Pop>
  </Center>
);

const SceneRules: React.FC = () => (
  <Center gap={30}>
    <Pop>
      <Small style={{ fontSize: 40 }}>the rules (simple)</Small>
    </Pop>
    <div style={{ display: 'flex', gap: 30 }}>
      <Rule at={s(1.0)} left="shipping" op=">" right="perfect" color={PINK} />
      <Rule at={s(2.1)} left="evals" op=">" right="vibes ✨" color={CYAN} />
    </div>
    <Rule at={s(3.5)} left="working" op="≠" right="wanted" color={MINT} />
  </Center>
);

const SceneHire: React.FC = () => (
  <Center gap={30}>
    <div style={{ display: 'flex', gap: 20 }}>
      <Pop delay={s(1.0)}>
        <Chip color={CREAM}>early-stage 🌱</Chip>
      </Pop>
      <Pop delay={s(2.0)}>
        <Chip color={PURPLE}>mid-size 🏢</Chip>
      </Pop>
      <Pop delay={s(3.0)}>
        <Chip color={CYAN}>MNC 🌍</Chip>
      </Pop>
      <Pop delay={s(4.2)}>
        <Chip color={GOLD}>AI × backend</Chip>
      </Pop>
    </div>
    <Pop delay={s(6.0)}>
      <Small style={{ fontSize: 42 }}>full-time · codes · thinks product · ships</Small>
    </Pop>
    <Pop delay={s(7.2)}>
      <Big size={250}>
        hire <span style={gradText}>me</span>
      </Big>
    </Pop>
    <Pop delay={s(7.7)}>
      <div style={{ fontFamily: MONO, fontSize: 62, color: PLUM, background: CREAM, padding: '14px 40px', borderRadius: 18, fontWeight: 700 }}>
        unnati-chhabra.xyz ↗
      </div>
    </Pop>
    <div style={{ position: 'absolute', left: 260, bottom: 120 }}>
      <Stamp text="please don't ghost 👻" delay={s(9.3)} color={PINK} rotate={-8} size={44} />
    </div>
    <div style={{ position: 'absolute', right: 280, bottom: 130 }}>
      <Stamp text="🎃 halloween week" delay={s(11.0)} color={GOLD} rotate={7} size={40} />
    </div>
    <div style={{ position: 'absolute', right: 380, top: 120 }}>
      <Stamp text="okay bye 👋" delay={s(12.2)} color={MINT} rotate={-6} size={40} />
    </div>
  </Center>
);

const SCENES: React.FC[] = [SceneGhost, SceneIntro, SceneOrigin, SceneZomato, ScenePayGrid, SceneCommunity, SceneReach, SceneRules, SceneHire];

// ---------- frame ----------

const musicVolume = (f: number) => {
  const underVoice = Math.max(
    ...starts.map((st, i) =>
      interpolate(f, [st - 8, st, st + clipFrames[i], st + clipFrames[i] + 8], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }),
    ),
  );
  return 0.2 - 0.12 * underVoice;
};

const Hud: React.FC<{ portrait: boolean }> = ({ portrait }) => {
  const frame = useCurrentFrame();
  const sceneIdx = Math.max(0, starts.filter((st) => frame >= st - GAP).length - 1);
  const secs = Math.floor(frame / FPS);
  const tc = `00:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}:${String(frame % FPS).padStart(2, '0')}`;
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
        {portrait ? 'CAM 01 / LIVE' : 'UNNATI-CHHABRA.XYZ · CAM 01 / LIVE'}
      </div>
      <div style={{ position: 'absolute', top: 52, right: 100, ...text }}>REC {tc}</div>
      <div style={{ position: 'absolute', bottom: 52, left: 100, ...text, color: 'rgba(255,255,255,0.5)' }}>
        {String(sceneIdx + 1).padStart(2, '0')} / {String(SECTIONS.length).padStart(2, '0')} · {SECTIONS[sceneIdx].hud}
      </div>
    </AbsoluteFill>
  );
};

const Video: React.FC<{ portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill style={{ background: PLUM }}>
    <Backdrop />
    <GridFloor />
    <CodeRain />
    <Audio src={staticFile('music/lofi-final.wav')} volume={musicVolume} />
    {SECTIONS.map((sec, i) => {
      const Scene = SCENES[i];
      const isLast = i === SECTIONS.length - 1;
      const from = i === 0 ? 0 : starts[i] - Math.floor(GAP / 2);
      const until = isLast ? FINAL_FRAMES : starts[i + 1] - Math.floor(GAP / 2);
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={until - from}>
            <Punch>
              <Sequence from={starts[i] - from}>
                {portrait ? (
                  <>
                    <Place x={-4} y={-22} scale={1.6}>
                      <Terminal tech={sec.tech} frames={clipFrames[i]} />
                    </Place>
                    <Place x={(1080 - 1920 * 0.55) / 2} y={610} scale={0.55}>
                      <AbsoluteFill style={{ width: 1920, height: 1080 }}>
                        <Scene />
                      </AbsoluteFill>
                    </Place>
                    <Place x={(1080 - 520 * 0.9) / 2 - 80 * 0.9} y={1385 - 392 * 0.9} scale={0.9}>
                      <Diagram tech={sec.tech} frames={clipFrames[i]} />
                    </Place>
                    {sec.tech.sticker && (
                      <Place x={0} y={30} scale={1}>
                        <Sticker text={sec.tech.sticker} index={i} />
                      </Place>
                    )}
                    {isLast && (
                      <Place x={0} y={40} scale={1}>
                        <Notification delay={s(8.0)} />
                      </Place>
                    )}
                  </>
                ) : (
                  <>
                    <AbsoluteFill style={{ transform: `translateX(${CONTENT_SHIFT}px) scale(${CONTENT_SCALE})` }}>
                      <Scene />
                    </AbsoluteFill>
                    <Terminal tech={sec.tech} frames={clipFrames[i]} />
                    <Diagram tech={sec.tech} frames={clipFrames[i]} />
                    {sec.tech.sticker && <Sticker text={sec.tech.sticker} index={i} />}
                    {isLast && <Notification delay={s(8.0)} />}
                  </>
                )}
              </Sequence>
            </Punch>
          </Sequence>
          <Sequence from={starts[i]} durationInFrames={clipFrames[i]}>
            <Audio src={staticFile(`v208/${String(i + 1).padStart(2, '0')}.wav`)} />
            <AnchoredCaptions
              sents={sec.sents}
              frames={clipFrames[i]}
              padBottom={portrait ? 560 : 120}
              padLeft={portrait ? 0 : CONTENT_SHIFT * 2}
            />
          </Sequence>
        </React.Fragment>
      );
    })}
    <Vignette />
    <Grain />
    <Hud portrait={portrait} />
  </AbsoluteFill>
);

export const FinalLandscape: React.FC = () => <Video portrait={false} />;
export const FinalPortrait: React.FC = () => <Video portrait />;
