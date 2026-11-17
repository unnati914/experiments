import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import durations from './hin-durations.json';
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
} from './Video';

const FPS = 30;
const LEAD = 8;
const GAP = 10;
const OUTRO = 75;
const s = (sec: number) => Math.round(sec * FPS); // seconds within a clip -> frames

const clipFrames = (durations as number[]).map((d) => Math.ceil(d * FPS));
const starts: number[] = [];
clipFrames.reduce((at, len) => {
  starts.push(at);
  return at + len + GAP;
}, LEAD);
export const HINGLISH_FRAMES = starts[starts.length - 1] + clipFrames[clipFrames.length - 1] + OUTRO;

// Captions follow what was actually said; each sentence is anchored to when it starts in the clip (seconds).
export type Sent = [number, string];
type Section = { hud: string; sents: Sent[]; tech: Tech };

const SECTIONS: Section[] = [
  {
    hud: 'THE GHOSTING',
    sents: [
      [0.0, 'Okay, real talk.'],
      [1.1, 'Main kaafi time se job dhoondh rahi hoon.'],
      [2.6, 'Calls aa rahe hain, interviews ho rahe hain, round three tak pahunch jaati hoon... aur phir? Ghosted.'],
      [6.8, 'Aur irony dekho, main khud Hirvana chalati hoon, jahan main logon ki job hunt crack karwaati hoon.'],
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
      [0.0, 'Toh maine socha, recruiters ko main khud dhoondh leti hoon.'],
      [2.0, 'Hi, main Unnati hoon.'],
      [3.1, 'AI engineer, backend wali, product brain ke saath.'],
      [6.5, 'Teen saal se zyada se production mein cheezein ship kar rahi hoon.'],
    ],
    tech: {
      cmd: 'whoami',
      out: ['unnati chhabra · ai engineer', 'yoe: 3+ · open_to_work = true 🟢'],
      diagTitle: 'boot sequence',
      nodes: ['load ai_engineer', 'mount backend', 'attach product_brain', 'status: ready'],
      sticker: 'main character energy ✨',
    },
  },
  {
    hud: 'ORIGIN STORY',
    sents: [
      [0.0, 'Meri story college se shuru hoti hai.'],
      [1.7, 'Hackathons, open source, communities.'],
      [4.0, 'Maine CodXCrypt start kiya, ek coding community.'],
      [6.2, 'Aur phir Zomato ka hackathon aaya, aur main jeet gayi.'],
      [8.5, 'Wahin se Zomato mein entry mili.'],
    ],
    tech: {
      cmd: 'git log --reverse --oneline',
      out: ['init: igdtuw', 'feat: codxcrypt community', 'win: zomato hackathon 🏆'],
      diagTitle: 'origin story',
      nodes: ['college', 'hackathons + OSS', 'CodXCrypt', 'Zomato hackathon 🏆', 'Zomato'],
      sticker: 'lore drop 📜',
    },
  },
  {
    hud: 'LORE · ZOMATO',
    sents: [
      [0.0, 'Zomato mein maine Parchi Orders banaya, HyperPure ke liye.'],
      [3.0, 'Woh company ka lagbhag 70% GMV handle karta tha.'],
      [6.2, 'Invoice OCR in-house kiya, cost ₹35 se ₹5 per invoice.'],
      [11.3, 'Aur GenAI bots ke liye evaluation framework banaya, jo 100% app users tak live tha.'],
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
      [0.0, 'Phir Paysecure pe, Shopify payment plugin, 40 merchants ke liye, plus BigCommerce aur WooCommerce, sirf 5 months mein.'],
      [6.5, 'Aur Grid Dynamics mein, VISA ke liye gen AI agents, 200 se 300 users.'],
      [11.4, 'Plus ek internal dev tool, jo team ke har hafte 40 ghante bachata hai.'],
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
      [0.0, 'Lekin mera arc sirf code nahi hai.'],
      [2.3, 'Main GitHub Campus Expert rahi, Microsoft Learn Student Ambassador, LFX mentee.'],
      [6.5, 'GirlScript Summer of Code mein mentor rahi, buildathons host kiye.'],
      [10.8, 'Aur LinkedIn pe 21 thousand log mujhe follow karte hain.'],
      [13.7, 'Matlab system banana bhi aata hai, aur stage pe samjhana bhi.'],
    ],
    tech: {
      cmd: 'cat community.json',
      out: ['"github": "campus expert"', '"microsoft": "student ambassador"', '"linkedin": "21K followers"'],
      diagTitle: 'community graph',
      nodes: ['CodXCrypt', 'GitHub Campus Expert', 'MLSA · LFX', 'GirlScript SoC', '21K followers'],
      sticker: 'public speaker era 🎤',
    },
  },
  {
    hud: 'HOW I WORK',
    sents: [
      [0.0, 'Mere rules simple hain.'],
      [0.9, 'Shipping beats perfect. Evals before vibes.'],
      [3.1, 'Agar agent ko measure nahi kar sakte, toh improve bhi nahi kar sakte.'],
      [6.4, 'Aur working is not the same as wanted.'],
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
      [0.0, 'Toh agar aap early-stage, mid-size startup, ya MNC ho, AI aur backend build kar rahe ho,'],
      [5.8, 'aur full-time ke liye koi chahiye jo code bhi kare, product bhi soche, aur ship bhi kare:'],
      [9.8, 'mujhe hire karo.'],
      [11.1, 'Aur haan, interview le lo toh reply bhi kar dena.'],
      [13.6, 'Ghost mat karna, Halloween already chal raha hai. Okay, bye!'],
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

export const Row: React.FC<{ at: number; icon: string; title: string; status: string; good?: boolean }> = ({ at, icon, title, status, good }) => (
  <Pop delay={at}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        width: 1300,
        padding: '24px 34px',
        borderRadius: 20,
        background: 'rgba(255,244,248,0.06)',
        border: '2px solid rgba(255,244,248,0.14)',
      }}
    >
      <div style={{ fontSize: 52 }}>{icon}</div>
      <div style={{ flex: 1, textAlign: 'left', fontFamily: SANS, fontWeight: 700, fontSize: 50, color: CREAM }}>{title}</div>
      <div style={{ fontFamily: MONO, fontSize: 36, color: good ? MINT : 'rgba(255,244,248,0.5)' }}>{status}</div>
    </div>
  </Pop>
);

export const SceneGhost: React.FC = () => (
  <Center gap={22}>
    <Row at={s(1.6)} icon="📅" title="Interview · Round 1" status="cleared ✅" good />
    <Row at={s(3.4)} icon="📅" title="Interview · Round 2" status="cleared ✅" good />
    <Row at={s(5.2)} icon="📅" title="Interview · Round 3" status="cleared ✅" good />
    <Row at={s(6.1)} icon="✉️" title="Re: next steps?" status="seen ✓✓ ..." />
    <div style={{ position: 'absolute', left: 760, top: 470 }}>
      <Stamp text="ghosted 👻" delay={s(6.3)} rotate={-10} size={96} />
    </div>
    <div style={{ marginTop: 26 }}>
      <Pop delay={s(7.2)}>
        <Big size={86}>
          plot twist: I run <span style={gradText}>Hirvana</span> 💼
        </Big>
      </Pop>
    </div>
    <Pop delay={s(9.6)}>
      <Small style={{ fontSize: 40 }}>I literally help people get hired</Small>
    </Pop>
  </Center>
);

export const SceneIntro: React.FC = () => (
  <Center gap={24}>
    <Pop>
      <Small style={{ fontSize: 40 }}>📍 recruiter not found → subject located</Small>
    </Pop>
    <Pop delay={s(2.1)}>
      <Big size={220}>
        <span style={gradText}>Unnati</span> Chhabra
      </Big>
    </Pop>
    <div style={{ display: 'flex', gap: 26, marginTop: 20 }}>
      <Pop delay={s(3.3)}>
        <Chip color={CREAM}>AI engineer</Chip>
      </Pop>
      <Pop delay={s(4.1)}>
        <Chip color={PURPLE}>backend</Chip>
      </Pop>
      <Pop delay={s(5.0)}>
        <Chip color={GOLD}>product brain 🧠</Chip>
      </Pop>
    </div>
    <Pop delay={s(6.6)}>
      <Big size={78} style={{ marginTop: 20 }}>
        3+ yrs shipping to <span style={{ color: MINT }}>prod</span> 🚀
      </Big>
    </Pop>
  </Center>
);

const SceneOrigin: React.FC = () => {
  const frame = useCurrentFrame();
  const nodes = [
    { at: 0.2, icon: '🎓', a: 'college', b: 'IGDTUW' },
    { at: 1.8, icon: '⚡', a: 'hackathons', b: '+ open source' },
    { at: 4.1, icon: '👩‍💻', a: 'founded', b: 'CodXCrypt' },
    { at: 6.6, icon: '🏆', a: 'won the', b: 'Zomato hackathon' },
    { at: 8.6, icon: '🍅', a: 'joined', b: 'Zomato' },
  ];
  const x0 = 180;
  const span = 1560;
  const xs = nodes.map((_, i) => x0 + (span * i) / (nodes.length - 1));
  const progress = interpolate(frame, [s(0.2), s(8.8)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', top: 200, width: '100%', textAlign: 'center' }}>
        <Stamp text="origin story 📜" rotate={-4} size={52} />
      </div>
      <div style={{ position: 'absolute', left: x0, top: 470, width: span, height: 8, borderRadius: 4, background: 'rgba(255,244,248,0.15)' }} />
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: 470,
          width: span * progress,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(90deg, ${PINK}, ${PURPLE}, ${GOLD})`,
          boxShadow: `0 0 20px ${PINK}`,
        }}
      />
      {nodes.map((n, i) => {
        const win = i === 3;
        return (
          <div key={n.b} style={{ position: 'absolute', left: xs.at(i)! - 160, top: 380, width: 320, textAlign: 'center' }}>
            <Pop delay={s(n.at)}>
              <div
                style={{
                  width: win ? 190 : 180,
                  height: win ? 190 : 180,
                  margin: '0 auto',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: win ? 96 : 84,
                  background: win ? GOLD : PLUM,
                  border: `6px solid ${win ? CREAM : PINK}`,
                  boxShadow: win ? `0 0 60px ${GOLD}` : 'none',
                  marginTop: win ? -5 : 0,
                }}
              >
                {n.icon}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 34, color: 'rgba(255,244,248,0.6)', marginTop: 24 }}>{n.a}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, color: win ? GOLD : CREAM, lineHeight: 1.1 }}>{n.b}</div>
            </Pop>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: xs.at(3)! - 40, top: 290 }}>
        <Stamp text="WON 🏆" delay={s(8.0)} color={GOLD} rotate={12} size={48} />
      </div>
    </AbsoluteFill>
  );
};

export const StatCard: React.FC<{ at: number; value: React.ReactNode; label: string; sub: string }> = ({ at, value, label, sub }) => (
  <Pop delay={at}>
    <div
      style={{
        width: 540,
        height: 440,
        borderRadius: 28,
        padding: '40px 34px',
        background: 'rgba(255,244,248,0.05)',
        border: '2px solid rgba(255,244,248,0.16)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
      }}
    >
      <Big size={112} style={{ ...gradText, whiteSpace: 'nowrap' }}>
        {value}
      </Big>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: CREAM }}>{label}</div>
      <Small style={{ fontSize: 28 }}>{sub}</Small>
    </div>
  </Pop>
);

const SceneZomato: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(interpolate(frame, [s(3.4), s(5.0)], [0, 70], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  return (
    <Center gap={50}>
      <Pop>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <Big size={110}>Zomato</Big>
          <Small style={{ fontSize: 40 }}>· Parchi Orders for HyperPure</Small>
        </div>
      </Pop>
      <div style={{ display: 'flex', gap: 40 }}>
        <StatCard at={s(3.2)} value={`~${n}%`} label="of company GMV" sub="parchi orders" />
        <StatCard at={s(6.6)} value="₹35→₹5" label="per invoice" sub="in-house OCR · −80%" />
        <StatCard at={s(11.6)} value="100%" label="of app users" sub="genai bots, with evals" />
      </div>
    </Center>
  );
};

const CompanyCard: React.FC<{ at: number; name: string; tag: string; lines: { at: number; big: string; small: string; color: string }[] }> = ({
  at,
  name,
  tag,
  lines,
}) => (
  <Pop delay={at}>
    <div
      style={{
        width: 820,
        borderRadius: 28,
        padding: '40px 44px',
        background: 'rgba(255,244,248,0.05)',
        border: '2px solid rgba(255,244,248,0.16)',
        textAlign: 'left',
      }}
    >
      <Big size={84} style={{ whiteSpace: 'nowrap' }}>
        {name}
      </Big>
      <Small style={{ fontSize: 30, marginTop: 8 }}>{tag}</Small>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 30 }}>
        {lines.map((l) => (
          <Pop key={l.small} delay={l.at}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <Big size={96} color={l.color}>
                {l.big}
              </Big>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, color: CREAM }}>{l.small}</div>
            </div>
          </Pop>
        ))}
      </div>
    </div>
  </Pop>
);

const ScenePayGrid: React.FC = () => (
  <Center>
    <div style={{ display: 'flex', gap: 50, alignItems: 'flex-start' }}>
      <CompanyCard
        at={s(0.2)}
        name="Paysecure"
        tag="· payments"
        lines={[
          { at: s(2.5), big: '40', small: 'merchants · Shopify plugin', color: CREAM },
          { at: s(3.8), big: '3', small: 'platforms · + BigComm + Woo', color: PINK },
          { at: s(5.6), big: '5', small: 'months. that’s it.', color: GOLD },
        ]}
      />
      <CompanyCard
        at={s(6.4)}
        name="Grid Dynamics"
        tag="· gen AI"
        lines={[
          { at: s(7.6), big: 'VISA', small: 'gen AI agents 💳', color: CYAN },
          { at: s(9.6), big: '200–300', small: 'users', color: PINK },
          { at: s(12.6), big: '40 hrs', small: 'saved / week 🛠️', color: GOLD },
        ]}
      />
    </div>
  </Center>
);

const SceneCommunity: React.FC = () => {
  const frame = useCurrentFrame();
  const k = Math.round(interpolate(frame, [s(11.2), s(12.6)], [0, 21], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const badges: { at: number; text: string; color: string }[] = [
    { at: 0.6, text: '👩‍💻 CodXCrypt founder', color: CREAM },
    { at: 2.8, text: '🐙 GitHub Campus Expert', color: PINK },
    { at: 4.2, text: '🪟 Microsoft Learn Student Ambassador', color: CYAN },
    { at: 5.4, text: '🐧 LFX Mentee', color: MINT },
    { at: 6.9, text: '🌸 GirlScript SoC mentor', color: GOLD },
    { at: 8.6, text: '🛠️ buildathon host', color: PURPLE },
    { at: 9.4, text: '🎤 workshops', color: PINK },
  ];
  return (
    <Center gap={44}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, justifyContent: 'center', width: 1500 }}>
        {badges.map((b) => (
          <Pop key={b.text} delay={s(b.at)}>
            <Chip color={b.color}>{b.text}</Chip>
          </Pop>
        ))}
      </div>
      <Pop delay={s(10.9)}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
          <Big size={200} style={gradText}>
            {k}K
          </Big>
          <Big size={64}>LinkedIn followers</Big>
        </div>
      </Pop>
      <Pop delay={s(13.9)}>
        <Small style={{ fontSize: 40 }}>builds the system · explains it on stage 🎤</Small>
      </Pop>
    </Center>
  );
};

export const Rule: React.FC<{ at: number; left: string; op: string; right: string; color: string }> = ({ at, left, op, right, color }) => (
  <Pop delay={at}>
    <div
      style={{
        width: 760,
        padding: '40px 30px',
        borderRadius: 26,
        background: 'rgba(255,244,248,0.05)',
        border: `3px solid ${color}`,
        boxShadow: `0 0 40px ${color}33`,
      }}
    >
      <Big size={64} style={{ whiteSpace: 'nowrap' }}>
        {left} <span style={{ color }}>{op}</span> {right}
      </Big>
    </div>
  </Pop>
);

const SceneRules: React.FC = () => (
  <Center gap={30}>
    <Pop>
      <Small style={{ fontSize: 40 }}>the rules (simple hain)</Small>
    </Pop>
    <div style={{ display: 'grid', gridTemplateColumns: '760px 760px', gap: 30 }}>
      <Rule at={s(1.0)} left="shipping" op=">" right="perfect" color={PINK} />
      <Rule at={s(2.0)} left="evals" op=">" right="vibes ✨" color={CYAN} />
      <Rule at={s(3.4)} left="measure" op="→" right="improve" color={GOLD} />
      <Rule at={s(6.6)} left="working" op="≠" right="wanted" color={MINT} />
    </div>
  </Center>
);

const SceneHire: React.FC = () => (
  <Center gap={30}>
    <div style={{ display: 'flex', gap: 20 }}>
      <Pop delay={s(0.9)}>
        <Chip color={CREAM}>early-stage 🌱</Chip>
      </Pop>
      <Pop delay={s(1.9)}>
        <Chip color={PURPLE}>mid-size 🏢</Chip>
      </Pop>
      <Pop delay={s(3.4)}>
        <Chip color={CYAN}>MNC 🌍</Chip>
      </Pop>
      <Pop delay={s(4.6)}>
        <Chip color={GOLD}>AI × backend</Chip>
      </Pop>
    </div>
    <Pop delay={s(6.8)}>
      <Small style={{ fontSize: 42 }}>full-time · codes · thinks product · ships</Small>
    </Pop>
    <Pop delay={s(9.8)}>
      <Big size={250}>
        hire <span style={gradText}>me</span>
      </Big>
    </Pop>
    <Pop delay={s(10.4)}>
      <div style={{ fontFamily: MONO, fontSize: 62, color: PLUM, background: CREAM, padding: '14px 40px', borderRadius: 18, fontWeight: 700 }}>
        unnati-chhabra.xyz ↗
      </div>
    </Pop>
    <div style={{ position: 'absolute', left: 260, bottom: 120 }}>
      <Stamp text="please don't ghost 👻" delay={s(13.6)} color={PINK} rotate={-8} size={44} />
    </div>
    <div style={{ position: 'absolute', right: 300, bottom: 140 }}>
      <Stamp text="okay bye 👋" delay={s(15.8)} color={GOLD} rotate={7} size={44} />
    </div>
  </Center>
);

const SCENES: React.FC[] = [SceneGhost, SceneIntro, SceneOrigin, SceneZomato, ScenePayGrid, SceneCommunity, SceneRules, SceneHire];

// ---------- captions anchored per sentence ----------

export const AnchoredCaptions: React.FC<{ sents: Sent[]; frames: number; padBottom: number; padLeft: number }> = ({
  sents,
  frames,
  padBottom,
  padLeft,
}) => {
  const frame = useCurrentFrame();
  const weight = (w: string) => w.length + 2 + (/[.?!]$/.test(w) ? 6 : /[,:]$/.test(w) ? 3 : 0);
  const timed: { w: string; at: number; end: boolean }[] = [];
  sents.forEach(([t, text], i) => {
    const from = s(t);
    const to = i + 1 < sents.length ? s(sents[i + 1][0]) : frames;
    const words = text.split(' ');
    const total = words.reduce((a, w) => a + weight(w), 0);
    let acc = 0;
    words.forEach((w, j) => {
      timed.push({ w, at: from + (acc / total) * (to - from), end: j === words.length - 1 });
      acc += weight(w);
    });
  });
  const chunks: { w: string; at: number }[][] = [[]];
  timed.forEach((t) => {
    const cur = chunks[chunks.length - 1];
    cur.push(t);
    const chars = cur.reduce((a, c) => a + c.w.length + 1, 0);
    if (cur.length >= 4 || chars >= 22 || t.end || /[.?,:!]$/.test(t.w)) chunks.push([]);
  });
  const live = chunks.filter((c) => c.length);
  const idx = Math.max(0, live.findIndex((c, i) => frame >= c[0].at && (i === live.length - 1 || frame < live[i + 1][0].at)));
  const chunk = live[idx];
  const bump = interpolate(frame - chunk[0].at, [0, 5], [1.12, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: padBottom, paddingLeft: padLeft }}>
      <div style={{ display: 'flex', gap: 18, transform: `scale(${bump})` }}>
        {chunk.map((t, i) => {
          const spoken = frame >= t.at;
          const current = spoken && (i === chunk.length - 1 || frame < chunk[i + 1].at);
          return (
            <span
              key={`${t.w}-${i}`}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 56,
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

// Music sits low under the voice and lifts in the gaps and the outro.
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

// Places a component that was laid out for the 1920x1080 frame somewhere else in the frame.
export const Place: React.FC<{ x: number; y: number; scale: number; children: React.ReactNode }> = ({ x, y, scale, children }) => (
  <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: '0 0' }}>{children}</AbsoluteFill>
);

const Video: React.FC<{ portrait: boolean }> = ({ portrait }) => (
  <AbsoluteFill style={{ background: PLUM }}>
    <Backdrop />
    <GridFloor />
    <CodeRain />
    <Audio src={staticFile('music/lofi.wav')} volume={musicVolume} />
    {SECTIONS.map((sec, i) => {
      const Scene = SCENES[i];
      const isLast = i === SECTIONS.length - 1;
      const from = i === 0 ? 0 : starts[i] - Math.floor(GAP / 2);
      const until = isLast ? HINGLISH_FRAMES : starts[i + 1] - Math.floor(GAP / 2);
      return (
        <React.Fragment key={i}>
          <Sequence from={from} durationInFrames={until - from}>
            <Punch>
              <Sequence from={starts[i] - from}>
                {portrait ? (
                  <>
                    {/* terminal on top, scene in the middle, diagram at the bottom */}
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
                        <Notification delay={s(11.1)} />
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
                    {isLast && <Notification delay={s(11.1)} />}
                  </>
                )}
              </Sequence>
            </Punch>
          </Sequence>
          <Sequence from={starts[i]} durationInFrames={clipFrames[i]}>
            <Audio src={staticFile(`hin/${String(i + 1).padStart(2, '0')}.wav`)} />
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

export const HinglishVideo: React.FC = () => <Video portrait={false} />;
export const HinglishPortrait: React.FC = () => <Video portrait />;
