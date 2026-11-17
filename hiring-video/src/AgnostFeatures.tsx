import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Agnost AI pitch: introduction first, then five features I'd build. Light theme (white, sky, mint, lavender).
// Scene times are written on the raw recording-229 timeline (script-agnost-features.md); WARP maps them onto
// the cleaned 1.6x voiceover (public/voice/rec229clear.wav) at the start of each spoken phrase: [raw second, voice second].
const FPS = 30;
const WARP: [number, number][] = [
  [0, 0], [0.4, 0.25], [4, 2.5], [10.86, 6.44], [15.01, 8.82], [20.28, 11.33], [28.36, 15.81], [33.2, 18.43], [34.39, 18.96], [36.5, 19.6], [45.85, 24.49], [49.17, 26.29], [56.63, 30.46], [57.67, 30.85], [59.2, 31.67], [63.06, 33.94], [67.52, 36.46], [68.65, 36.78], [74.23, 40.01], [77.53, 41.93], [78.27, 42.27], [82.4, 44.58], [90.79, 48.41], [93.53, 49.94], [98.26, 52.9], [99.3, 53.32],
];
const warp = (sec: number) => {
  for (let i = 0; i < WARP.length - 1; i++) {
    const [o0, n0] = WARP[i]; const [o1, n1] = WARP[i + 1];
    if (sec <= o1) return n0 + ((sec - o0) * (n1 - n0)) / (o1 - o0);
  }
  return sec - WARP[WARP.length - 1][0] + WARP[WARP.length - 1][1];
};
const s = (sec: number) => Math.round(warp(sec) * FPS);
const END = 101; // ~1.2 s of music tail after "Thank you"
export const AGNOST_FEATURES_FRAMES = s(END);
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

export const AgnostFeatures: React.FC = () => {
  const f = useCurrentFrame();
  const musicVol = interpolate(f, [0, s(1.5), s(98.5), s(END)], [0, 0.13, 0.13, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <Sky />

      {/* Hi, I am Unnati. AI engineer, three years. Zomato, Paysecure, and Grid Dynamics for VISA. */}
      <Scene from={0} to={20.28}>
        <div style={{ width: 1600 }}>
          <Big at={0.3} size={116}>Hi, I'm <span style={{ color: C.sky }}>Unnati</span></Big>
          <Sub at={1.4}>AI engineer · 3 years of experience</Sub>
          <div style={{ display: 'flex', gap: 26, marginTop: 56 }}>
            <Job at={4.1} name="Zomato" what="Eval framework for GenAI bots used by every app user" bg={C.redBg} color={C.red} />
            <Job at={10.9} name="Paysecure" what="Payment systems for 40 merchants" bg={C.mintBg} color={C.mint} />
            <Job at={15.1} name="Grid Dynamics" what="GenAI agents for VISA, today" bg={C.skyBg} color={C.sky} />
          </div>
        </div>
      </Scene>

      {/* Agnost reads every conversation, finds where the agent fails, and opens a pull request to fix it. I love this idea. */}
      <Scene from={20.28} to={33.2}>
        <div style={{ textAlign: 'center' }}>
          <Pill at={20.3} bg={C.lavBg} color={C.lav}>AGNOST AI</Pill>
          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', marginTop: 40 }}>
            <Loop at={20.6} icon="💬" text="Reads every conversation" arrow />
            <Loop at={22.6} icon="🔍" text="Finds where the agent fails" arrow />
            <Loop at={24.6} icon="🔧" text="Opens a pull request to fix it" />
          </div>
          <Big at={28.4} size={64} style={{ marginTop: 56 }}>I love this idea. So here are <span style={{ color: C.lav }}>5 features</span> I'd build for you.</Big>
        </div>
      </Scene>

      <Feature from={33.2} to={45.85} n={1} title="Prove the fix">
        <Step at={36.5} icon="🧪">Failed conversations become test cases</Step>
        <Step at={39.3} icon="⚖️" tint={C.mintBg}>Replay them on the old and the new agent, before the PR is merged</Step>
        <Built at={41.8} where="Zomato" what="eval framework for GenAI bots" />
      </Feature>

      <Feature from={45.85} to={56.63} n={2} title="Don't break what works">
        <Step at={49.2} icon="🔁">Every test runs on every pull request</Step>
        <Step at={52.4} icon="⛔" tint={C.redBg}>Something that passed before now fails → PR blocked</Step>
      </Feature>

      <Feature from={56.63} to={67.52} n={3} title="Every language">
        <div style={{ display: 'flex', gap: 18 }}>
          <Pill at={59.3} size={32}>ENGLISH</Pill>
          <Pill at={59.9} size={32} bg={C.mintBg} color={C.mint}>HINDI</Pill>
          <Pill at={60.5} size={32} bg={C.lavBg} color={C.lav}>HINGLISH</Pill>
        </div>
        <Step at={63.1} icon="🗂">Group the failures by language, and fix each one</Step>
      </Feature>

      <Feature from={67.52} to={77.53} n={4} title="Find the missing knowledge">
        <Step at={68.7} icon="📄">The answer isn't in the agent's documents</Step>
        <Step at={74.3} icon="➕" tint={C.mintBg}>The PR adds the missing document, or fixes the search</Step>
        <Built at={75.3} where="Grid Dynamics" what="RAG pipelines, 80% retrieval accuracy" />
      </Feature>

      <Feature from={77.53} to={90.79} n={5} title="A dashboard for the whole team">
        <Step at={78.4} icon="📊">Product managers see the top failures</Step>
        <Step at={82.5} icon="👆" tint={C.mintBg}>One click: any conversation → a new test</Step>
        <Built at={85.5} where="Grid Dynamics" what="scenario builder used by 300–400 developers" />
      </Feature>

      {/* I have built each of these pieces before. I would love to join Agnost early, and build them with you. Thank you! */}
      <Scene from={90.79} to={END}>
        <div style={{ textAlign: 'center' }}>
          <Sub at={90.9}>I've built each of these pieces before.</Sub>
          <Big at={93.6} size={80} style={{ marginTop: 30 }}>I'd love to join <span style={{ color: C.lav }}>Agnost</span> early,<br />and build them with you.</Big>
          <Rise at={95.5} style={{ marginTop: 48, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Unnati Chhabra</div>
            <div style={{ background: C.skyBg, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink }}>unnati-chhabra.xyz</div>
          </Rise>
          <Big at={98.3} size={56} style={{ marginTop: 40, color: C.mint }}>Thank you!</Big>
        </div>
      </Scene>

      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        Feature ideas from the outside · not affiliated with Agnost AI
      </div>

      <Audio src={staticFile('voice/rec229clear.wav')} />
      <Audio src={staticFile('music/agnost-features.wav')} volume={musicVol} />
    </AbsoluteFill>
  );
};
