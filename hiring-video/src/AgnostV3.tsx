import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Agnost AI pitch v3: introduction, five gap features (evals first), then the live demo. Same light theme as v1.
// Scene times are written on the raw recording-237 timeline (script-agnost-v3.md; "close" at 126.75-127.55 is cut);
// WARP maps them onto the cleaned 1.4x voiceover (public/voice/rec237clear14.wav) at the start of each spoken phrase: [raw second, voice second].
const FPS = 30;
const WARP: [number, number][] = [
  [0, 0], [4.5, 3.21], [10.9, 7.37], [14.6, 10.01], [21.16, 12.74], [28.16, 17.41], [32.53, 20.21], [39.46, 24.07], [46.95, 28.38], [52.62, 31.64], [55.97, 33.82], [59.02, 35.71], [67.29, 39.8], [68.21, 40.29], [74.13, 44.06], [79.58, 47.06], [83.17, 49.05], [94.82, 55.26], [97.23, 56.47], [100.76, 58.54], [105.64, 60.93], [112.04, 64.46], [116.85, 67.56], [124.56, 72.27], [129.26, 73.71], [132.69, 75.74], [136.2, 78.24], [137.6, 78.91],
];
const warp = (sec: number) => {
  for (let i = 0; i < WARP.length - 1; i++) {
    const [o0, n0] = WARP[i]; const [o1, n1] = WARP[i + 1];
    if (sec <= o1) return n0 + ((sec - o0) * (n1 - n0)) / (o1 - o0);
  }
  return sec - WARP[WARP.length - 1][0] + WARP[WARP.length - 1][1];
};
const s = (sec: number) => Math.round(warp(sec) * FPS);
const END = 139.6; // ~1.2 s of music tail after "Thank you"
export const AGNOST_V3_FRAMES = s(END);
const C = { bg: '#fbfcff', card: '#ffffff', ink: '#1e2a3b', soft: '#6b7a90', line: '#e3e8f0', sky: '#3d8fd6', skyBg: '#e6f2fd', mint: '#23a07c', mintBg: '#e2f6ee', lav: '#7d62d3', lavBg: '#efeafc', red: '#d4675b', redBg: '#fdeceb' };
const FONT = "'Nunito', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SF Mono', Menlo, monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 24, stiffness: 70 } });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 8, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 90 }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ at: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, size = 96, children, style }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, textAlign: 'center', lineHeight: 1.12, ...style }}>{children}</Rise>
);
const Sub: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.soft, textAlign: 'center', marginTop: 22 }}>{children}</Rise>
);
const Pill: React.FC<{ at: number; children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ at, children, bg = C.skyBg, color = C.sky, size = 26 }) => (
  <Rise at={at} style={{ display: 'inline-block', background: bg, color, borderRadius: 999, padding: '10px 26px', fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: 2 }}>{children}</Rise>
);

// Soft pastel blobs drifting behind everything.
const Sky: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, color: string, k: number) => (
    <div style={{ position: 'absolute', left: x + Math.sin(f / 90 + k) * 40, top: y + Math.cos(f / 110 + k) * 30, width: r, height: r, background: `radial-gradient(circle, ${color} 0%, ${color} 35%, transparent 70%)`, opacity: 0.9 }} />
  );
  return (
    <AbsoluteFill>
      {blob(-180, -160, 720, C.skyBg, 0)}
      {blob(1350, -120, 640, C.lavBg, 2)}
      {blob(1250, 620, 700, C.mintBg, 4)}
      {blob(-120, 640, 560, C.lavBg, 6)}
    </AbsoluteFill>
  );
};

// Feature progress dots, top right: which of the five we're on.
const Progress: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: 'absolute', top: 56, right: 80, display: 'flex', gap: 12 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ width: i === n ? 46 : 16, height: 16, borderRadius: 999, background: i <= n ? C.lav : C.line }} />
    ))}
  </div>
);

const Step: React.FC<{ at: number; icon: string; children: React.ReactNode; tint?: string }> = ({ at, icon, children, tint = C.card }) => (
  <Rise at={at} style={{ display: 'flex', alignItems: 'center', gap: 22, background: tint, border: `1px solid ${C.line}`, borderRadius: 22, padding: '20px 28px', boxShadow: '0 12px 34px rgba(61,143,214,.08)' }}>
    <div style={{ fontSize: 40, width: 52, textAlign: 'center' }}>{icon}</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 38, color: C.ink, lineHeight: 1.25 }}>{children}</div>
  </Rise>
);

// Small "built before" tag: where, and what from the resume.
const Built: React.FC<{ at: number; where: string; what: string }> = ({ at, where, what }) => (
  <Rise at={at} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 16, background: C.lavBg, borderRadius: 999, padding: '12px 26px', marginTop: 10 }}>
    <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: C.lav }}>BUILT BEFORE</div>
    <div style={{ fontFamily: FONT, fontSize: 30, color: C.ink }}><b>{where}</b> · {what}</div>
  </Rise>
);

const Feature: React.FC<{ from: number; to: number; n: number; title: string; children: React.ReactNode }> = ({ from, to, n, title, children }) => (
  <Scene from={from} to={to}>
    <Progress n={n} />
    <div style={{ width: 1500, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Rise at={from + 0.05} style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 40, color: C.lav }}>0{n}</span>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 80, color: C.ink, whiteSpace: 'nowrap' }}>{title}</span>
      </Rise>
      {children}
    </div>
  </Scene>
);

// One company card in the intro.
const Job: React.FC<{ at: number; name: string; what: string; bg: string; color: string }> = ({ at, name, what, bg, color }) => (
  <Rise at={at} style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 32px', boxShadow: '0 14px 40px rgba(30,42,59,.06)' }}>
    <div style={{ display: 'inline-block', background: bg, color, borderRadius: 999, padding: '8px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 34 }}>{name}</div>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink, lineHeight: 1.3, marginTop: 20 }}>{what}</div>
  </Rise>
);

// One stage of Agnost's loop, with an arrow to the next.
const Loop: React.FC<{ at: number; icon: string; text: string; arrow?: boolean }> = ({ at, icon, text, arrow }) => (
  <>
    <Rise at={at} style={{ width: 380, background: C.card, border: `1px solid ${C.line}`, borderRadius: 26, padding: '28px 24px', textAlign: 'center', boxShadow: '0 14px 40px rgba(30,42,59,.06)' }}>
      <div style={{ fontSize: 56 }}>{icon}</div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.25, marginTop: 10 }}>{text}</div>
    </Rise>
    {arrow && <Rise at={at + 0.6} style={{ fontSize: 48, color: C.sky, alignSelf: 'center' }}>→</Rise>}
  </>
);

// A browser-window frame around a real screenshot of the demo page.
const Shot: React.FC<{ from: number; to: number; src: string; w?: number }> = ({ from, to, src, w = 1500 }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center', opacity: op }}>
      <Rise at={from} style={{ width: w, background: C.card, borderRadius: 22, border: `1px solid ${C.line}`, boxShadow: '0 24px 60px rgba(30,42,59,.12)', overflow: 'hidden' }}>
        <div style={{ height: 40, background: C.bg, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px' }}>
          {[C.red, '#e8b04a', C.mint].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 999, background: c, opacity: 0.7 }} />)}
          <div style={{ marginLeft: 16, fontFamily: MONO, fontSize: 18, color: C.soft }}>agnost-demo.vercel.app</div>
        </div>
        <Img src={staticFile(`agnost/${src}.png`)} style={{ width: '100%', display: 'block' }} />
      </Rise>
    </div>
  );
};

export const AgnostV3: React.FC = () => {
  const f = useCurrentFrame();
  const musicVol = interpolate(f, [0, s(1.5), s(137), s(END)], [0, 0.13, 0.13, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <Sky />

      {/* I am Unnati, AI engineer. Zomato, Paysecure, and Grid Dynamics for VISA. */}
      <Scene from={0} to={21.16}>
        <div style={{ width: 1600 }}>
          <Big at={0.1} size={116}>Hi, I'm <span style={{ color: C.sky }}>Unnati</span></Big>
          <Sub at={1.2}>AI engineer · 3 years of experience</Sub>
          <div style={{ display: 'flex', gap: 26, marginTop: 56 }}>
            <Job at={4.5} name="Zomato" what="Eval framework for GenAI bots used by every app user" bg={C.redBg} color={C.red} />
            <Job at={10.9} name="Paysecure" what="Payment systems for 40 merchants" bg={C.mintBg} color={C.mint} />
            <Job at={14.6} name="Grid Dynamics" what="GenAI agents for VISA, today" bg={C.skyBg} color={C.sky} />
          </div>
        </div>
      </Scene>

      {/* Agnost reads every conversation... You already test each fix on past runs. Five features on top, and a demo. */}
      <Scene from={21.16} to={39.46}>
        <div style={{ textAlign: 'center' }}>
          <Pill at={21.2} bg={C.lavBg} color={C.lav}>AGNOST AI</Pill>
          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 36 }}>
            <Loop at={21.4} icon="💬" text="Reads every conversation" arrow />
            <Loop at={23.2} icon="🔍" text="Finds where the agent fails" arrow />
            <Loop at={25} icon="🔧" text="Opens a pull request to fix it" />
          </div>
          <Rise at={28.2} style={{ display: 'inline-block', marginTop: 34, background: C.mintBg, color: C.mint, borderRadius: 999, padding: '12px 28px', fontFamily: FONT, fontWeight: 800, fontSize: 34 }}>✓ Already: each fix is tested on past runs</Rise>
          <Big at={32.6} size={60} style={{ marginTop: 40 }}><span style={{ color: C.lav }}>5 features</span> I'd add on top + a small demo</Big>
        </div>
      </Scene>

      <Feature from={39.46} to={52.62} n={1} title="Evals that remember">
        <Step at={42.8} icon="💾">Every failed conversation becomes a saved test</Step>
        <Step at={46.95} icon="📈" tint={C.mintBg}>The test set grows every day, and never forgets a bug</Step>
        <Built at={48.5} where="Zomato" what="eval framework for GenAI bots" />
      </Feature>

      <Feature from={52.62} to={67.29} n={2} title="A gate on every pull request">
        <Step at={55.97} icon="🔁">Before a fix is merged, all saved tests run</Step>
        <Step at={59.02} icon="⛔" tint={C.redBg}>Something that passed before now fails → PR blocked</Step>
      </Feature>

      <Feature from={67.29} to={79.58} n={3} title="Learn from human handoffs">
        <Step at={68.6} icon="🙋">The agent gives up, and a human takes over</Step>
        <Step at={74.13} icon="✍️" tint={C.mintBg}>Read what the human said → turn that answer into the fix</Step>
      </Feature>

      <Feature from={79.58} to={94.82} n={4} title="Test with fake users">
        <Step at={83.17} icon="🧪">Before a fix goes live, try it on made-up users</Step>
        <div style={{ display: 'flex', gap: 18 }}>
          <Pill at={87} size={32} bg={C.redBg} color={C.red}>ANGRY</Pill>
          <Pill at={89.1} size={32} bg={C.skyBg} color={C.sky}>CONFUSED</Pill>
          <Pill at={91.7} size={32} bg={C.lavBg} color={C.lav}>WRITES IN HINGLISH</Pill>
        </div>
        <Built at={92.6} where="Grid Dynamics" what="scenario builder used by 300–400 developers" />
      </Feature>

      <Feature from={94.82} to={105.64} n={5} title="Every language">
        <div style={{ display: 'flex', gap: 18 }}>
          <Pill at={97.3} size={32}>ENGLISH</Pill>
          <Pill at={97.9} size={32} bg={C.mintBg} color={C.mint}>HINDI</Pill>
          <Pill at={98.5} size={32} bg={C.lavBg} color={C.lav}>HINGLISH</Pill>
        </div>
        <Step at={100.8} icon="🗂">Group the failures by language, and fix each one</Step>
      </Feature>

      {/* Demo: twelve sample chats; saved tests, grouped by language; a fix from a handoff; a bad fix blocked; the link. */}
      <Scene from={105.64} to={129.26}>
        <div style={{ position: 'absolute', top: 70, left: 0, right: 0, textAlign: 'center' }}>
          <Pill at={105.7} bg={C.lavBg} color={C.lav}>THE DEMO · 12 SAMPLE CHATS</Pill>
        </div>
      </Scene>
      <Shot from={105.64} to={112.04} src="chats" w={1240} />
      <Shot from={112.04} to={116.85} src="langs" w={1560} />
      <Shot from={116.85} to={119.8} src="prA" w={1560} />
      <Shot from={119.8} to={124.56} src="prC" w={1560} />
      <Scene from={124.56} to={129.26}>
        <div style={{ textAlign: 'center' }}>
          <Big at={124.6} size={64}>Try it yourself</Big>
          <Rise at={124.9} style={{ marginTop: 34, display: 'inline-block', background: C.skyBg, borderRadius: 999, padding: '18px 40px', fontFamily: MONO, fontSize: 46, color: C.sky }}>agnost-demo.vercel.app</Rise>
          <Sub at={125.3}>The link is in my email</Sub>
        </div>
      </Scene>

      {/* I have built each of these pieces before. I would love to join Agnost early, and build them with you. Thank you! */}
      <Scene from={129.26} to={END}>
        <div style={{ textAlign: 'center' }}>
          <Sub at={129.3}>I've built each of these pieces before.</Sub>
          <Big at={132.7} size={80} style={{ marginTop: 30 }}>I'd love to join <span style={{ color: C.lav }}>Agnost</span> early,<br />and build them with you.</Big>
          <Rise at={133.8} style={{ marginTop: 48, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Unnati Chhabra</div>
            <div style={{ background: C.skyBg, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink }}>unnati-chhabra.xyz</div>
          </Rise>
          <Big at={136.2} size={56} style={{ marginTop: 40, color: C.mint }}>Thank you!</Big>
        </div>
      </Scene>

      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        Feature ideas from the outside · demo uses sample data · not affiliated with Agnost AI
      </div>

      <Audio src={staticFile('voice/rec237clear14.wav')} />
      <Audio src={staticFile('music/agnost-v3.wav')} volume={musicVol} />
    </AbsoluteFill>
  );
};
