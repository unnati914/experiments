import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Soft pitch + intro for Emergent: cream, sage and lavender, gentle motion, the Agent Watch demo screens.
// Scene times below are written on the recording-219 timeline; WARP maps them onto the recording-224 voiceover
// (public/voice/rec224clear.wav, 1.45x) by matching the start of each spoken line: [219 second, 224 second].
const FPS = 30;
const WARP: [number, number][] = [
  [0, 0.0], [2.1, 1.98], [3.58, 4.17], [9.84, 11.36], [14.14, 15.55], [17.18, 18.56], [20.02, 21.54], [22.5, 24.0],
  [23.69, 25.04], [25.58, 26.89], [27.22, 28.3], [31.12, 32.87], [38.16, 39.63], [41.8, 42.96], [45.68, 47.05],
  [50.2, 51.94], [54.22, 56.79], [56.78, 59.31], [64.66, 66.85], [70.34, 73.46], [73.22, 77.02], [76.86, 80.26],
  [80.46, 85.45], [82.6, 87.14],
];
const warp = (sec: number) => {
  for (let i = 0; i < WARP.length - 1; i++) {
    const [o0, n0] = WARP[i]; const [o1, n1] = WARP[i + 1];
    if (sec <= o1) return n0 + ((sec - o0) * (n1 - n0)) / (o1 - o0);
  }
  return sec - WARP[WARP.length - 1][0] + WARP[WARP.length - 1][1];
};
const s = (sec: number) => Math.round(warp(sec) * FPS);
export const EMERGENT_PITCH_FRAMES = s(82.6);
const C = { bg: '#f7f3ec', card: '#fffdf9', ink: '#3b3833', soft: '#7a746b', line: '#e8e1d5', sage: '#8fb09a', sageBg: '#e7f0e9', lav: '#a99fd6', lavBg: '#eeebf8', peach: '#e9a98b', peachBg: '#fbebe2', rose: '#d98b8b', roseBg: '#f8e6e6', sky: '#8fb5cf', skyBg: '#e5eff6' };
const FONT = "'Nunito', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// Fades and drifts up softly, no bounce.
const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 26, stiffness: 60 } });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 12], [0, 1], clamp), interpolate(f, [s(to) - 12, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 80 }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ at: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, size = 96, children, style }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, textAlign: 'center', lineHeight: 1.12, ...style }}>{children}</Rise>
);
const Sub: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.soft, textAlign: 'center', marginTop: 22 }}>{children}</Rise>
);
// Soft floating blobs in the background.
const Blobs: React.FC = () => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, c: string, k: number) => (
    <div style={{ position: 'absolute', left: x + Math.sin(f / 90 + k) * 30, top: y + Math.cos(f / 110 + k) * 24, width: r, height: r, borderRadius: '50%', background: c, filter: 'blur(60px)', opacity: 0.55 }} />
  );
  return <AbsoluteFill>{blob(-120, -100, 520, C.lavBg, 0)}{blob(1450, 640, 560, C.sageBg, 2)}{blob(1300, -160, 380, C.peachBg, 4)}{blob(80, 760, 420, C.skyBg, 6)}</AbsoluteFill>;
};
// A demo screenshot in a soft frame, panning down slowly.
const Shot: React.FC<{ from: number; to: number; src: string; pan: number; caption: React.ReactNode; tint: string }> = ({ from, to, src, pan, caption, tint }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [s(from + 1.2), s(to - 1.5)], [0, pan], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <Scene from={from} to={to}>
      <div style={{ width: 1400, height: 720, borderRadius: 28, overflow: 'hidden', background: C.card, border: `1px solid ${C.line}`, boxShadow: '0 20px 60px rgba(80,60,30,.12)' }}>
        <Img src={staticFile(src)} style={{ width: '100%', transform: `translateY(${-y}px)` }} />
      </div>
      <Rise at={from + 0.6} style={{ marginTop: 26, background: tint, borderRadius: 999, padding: '14px 34px', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink }}>{caption}</Rise>
    </Scene>
  );
};
const Card: React.FC<{ at: number; icon: string; bg: string; title: string; body: string }> = ({ at, icon, bg, title, body }) => (
  <Rise at={at} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 28, padding: 32, width: 390, boxShadow: '0 12px 40px rgba(80,60,30,.08)' }}>
    <div style={{ width: 70, height: 70, borderRadius: 20, background: bg, display: 'grid', placeItems: 'center', fontSize: 36, marginBottom: 18 }}>{icon}</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink, lineHeight: 1.15 }}>{title}</div>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 25, color: C.soft, marginTop: 10, lineHeight: 1.35 }}>{body}</div>
  </Rise>
);
const Role: React.FC<{ at: number; name: string; what: string; tint: string }> = ({ at, name, what, tint }) => (
  <Rise at={at} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 28, padding: '30px 34px', width: 500, boxShadow: '0 12px 40px rgba(80,60,30,.08)', borderTop: `8px solid ${tint}` }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 42, color: C.ink }}>{name}</div>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 27, color: C.soft, marginTop: 10, lineHeight: 1.35 }}>{what}</div>
  </Rise>
);
const Counter: React.FC<{ from: number; to: number; at: number; dur: number }> = ({ from, to, at, dur }) => {
  const f = useCurrentFrame();
  return <>{Math.round(interpolate(f, [s(at), s(at + dur)], [from, to], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 }))}</>;
};

export const EmergentPitch: React.FC = () => {
  const f = useCurrentFrame();
  const musicVol = interpolate(f, [0, s(1), s(80.5), s(82.6)], [0, 0.16, 0.16, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <Blobs />

      {/* "Hi, I'm Unnati. I'm an AI engineer. I built something small for Emergent." */}
      <Scene from={0} to={3.7}>
        <div>
          <Big at={0.1} size={120}>Hi, I'm <span style={{ color: C.lav }}>Unnati</span> 👋</Big>
          <Sub at={0.9}>AI engineer</Sub>
          <Big at={1.9} size={58} style={{ marginTop: 40, fontWeight: 700 }}>I built something small for <span style={{ color: C.sage }}>Emergent</span>.</Big>
        </div>
      </Scene>

      {/* The four problems, each card as it's named */}
      <Scene from={3.7} to={22.8}>
        <div>
          <Big at={3.8} size={58}>What 2026 reviews keep saying</Big>
          <div style={{ display: 'flex', gap: 22, marginTop: 40 }}>
            <Card at={9.5} icon="🔁" bg={C.peachBg} title="Credits burn in loops" body="The agent loops on its own bug. Every try costs credits." />
            <Card at={14.1} icon="💔" bg={C.roseBg} title="Fixes break old features" body="One fix quietly breaks something that worked." />
            <Card at={17.1} icon="🪄" bg={C.lavBg} title={'"Done!" isn\'t done'} body="It says it built a feature that isn't there." />
            <Card at={20.4} icon="🧾" bg={C.skyBg} title="No credits back" body="Credits spent on failed work don't return." />
          </div>
        </div>
      </Scene>

      {/* "So I built Agent Watch. It watches the build agent while it works." */}
      <Scene from={22.8} to={25.7}>
        <div>
          <Big at={22.85} size={116}>So I built <span style={{ color: C.sage }}>Agent Watch</span> 👁</Big>
          <Sub at={23.6}>It watches the build agent while it works.</Sub>
        </div>
      </Scene>

      {/* "Here's a demo, with sample data. The user asks for a habit tracker..." */}
      <Scene from={25.7} to={31.3}>
        <div style={{ textAlign: 'center' }}>
          <Rise at={25.75} style={{ display: 'inline-block', background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '10px 26px', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.soft }}>Demo · sample data</Rise>
          <Rise at={26.9} style={{ marginTop: 36, background: C.lavBg, borderRadius: 32, padding: '36px 54px', maxWidth: 1350 }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 3, color: C.lav }}>USER ASKS</div>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 62, color: C.ink, lineHeight: 1.2, marginTop: 10 }}>"Build me a habit tracker with login, dark mode and a weekly chart."</div>
          </Rise>
        </div>
      </Scene>

      <Shot from={31.3} to={41.6} src="emergent/alone-crop.png" pan={860} tint={C.roseBg}
        caption={<>Agent alone: <b>12 credits</b> · chart missing · 6 credits on its own mistakes</>} />
      <Shot from={41.6} to={54.2} src="emergent/guard-crop.png" pan={1100} tint={C.sageBg}
        caption={<>With Agent Watch: rolled back · loop stopped · chart checked</>} />

      {/* "Eight credits. And every feature is really there." */}
      <Scene from={54.2} to={57.3}>
        <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>
          <Rise at={54.25} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 200, color: C.rose }}>12</div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.soft }}>credits, agent alone</div>
          </Rise>
          <Rise at={54.5} style={{ fontSize: 90, color: C.soft }}>→</Rise>
          <Rise at={54.6} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 200, color: C.sage }}><Counter from={12} to={8} at={54.7} dur={1.2} /></div>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.soft }}>credits, every feature built</div>
          </Rise>
        </div>
      </Scene>

      <Shot from={57.3} to={70.8} src="emergent/evals-crop.png" pan={770} tint={C.lavBg}
        caption={<>12 test cases · alone <b>2/12</b> · with guard <b>12/12</b> · no extra AI cost</>} />

      {/* "Before this, I built evals for GenAI bots at Zomato, payment systems at Paysecure, and GenAI agents for VISA at Grid Dynamics." */}
      <Scene from={70.8} to={77}>
        <div>
          <Big at={70.85} size={60}>Before this</Big>
          <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
            <Role at={72.7} name="Zomato" what="Eval framework for GenAI bots · Parchi Orders for HyperPure (~70% of GMV)" tint={C.peach} />
            <Role at={73.2} name="Paysecure" what="Payment integrations for 40 merchants" tint={C.sky} />
            <Role at={75.3} name="Grid Dynamics" what="GenAI agents for VISA" tint={C.lav} />
          </div>
        </div>
      </Scene>

      {/* "I'd love to help Emergent make every credit worth it. The link is below. Thank you!" */}
      <Scene from={77} to={82.6}>
        <div>
          <Big at={77.05} size={90}>Let's make every credit<br /><span style={{ color: C.sage }}>worth it</span>.</Big>
          <Rise at={78.2} style={{ marginTop: 44, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Unnati Chhabra · AI engineer</div>
            <div style={{ background: C.lavBg, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink }}>unnati-chhabra.xyz</div>
          </Rise>
          <Sub at={79.3}>Demo link below 💌 · Thank you!</Sub>
        </div>
      </Scene>

      {/* Honesty label, always on */}
      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        A demo I built on my own · sample data · not affiliated with Emergent
      </div>

      <Audio src={staticFile('voice/rec224clear.wav')} />
      <Audio src={staticFile('music/emergent-soft-long.wav')} volume={musicVol} />
    </AbsoluteFill>
  );
};
