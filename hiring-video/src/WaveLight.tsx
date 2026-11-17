import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Light, pastel version of the high-energy pitch: cute music, the demo screens, the script's lines as captions.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_LIGHT_FRAMES = s(92);
const C = { bg1: '#fff7fb', bg2: '#f3f0ff', pink: '#ff8fb8', lilac: '#b9a4ff', mint: '#9ee6cf', peach: '#ffd3a8', ink: '#3b2a4a', soft: '#7d6d8c', white: '#ffffff' };
const FONT = "'Avenir Next', 'Nunito', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 170 } });
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p})`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 6], [0, 1], clamp), interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};
const Title: React.FC<{ at: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ at, children, size = 110, color = C.ink, style }) => (
  <Pop at={at} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, textAlign: 'center', lineHeight: 1.1, ...style }}>{children}</Pop>
);
const Shot: React.FC<{ from: number; to: number; src: string; caption: string; color: string }> = ({ from, to, src, caption, color }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(from), s(to)], [1.0, 1.05], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ width: 1480, height: 740, borderRadius: 30, overflow: 'hidden', border: `6px solid ${C.white}`, boxShadow: `0 16px 0 ${color}`, background: C.white }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', transform: `scale(${z})`, transformOrigin: 'top left' }} />
      </div>
      <Pop at={from + 0.4} style={{ marginTop: 26, background: color, borderRadius: 24, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink }}>{caption}</Pop>
    </Scene>
  );
};
export const WaveLight: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
    <Scene from={0} to={8}>
      <div style={{ textAlign: 'center' }}>
        <Title at={0.1} size={150}>Wave 💞<br /><span style={{ color: C.pink }}>swipeless</span>, iconic</Title>
        <Pop at={2} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.soft, marginTop: 14 }}>a pitch, made to be trusted</Pop>
      </div>
    </Scene>
    <Scene from={8} to={18}>
      <div style={{ textAlign: 'center' }}>
        <Title at={8.1} size={100}>Hi, I'm Unnati ✨<br /><span style={{ color: C.lilac }}>AI engineer</span></Title>
        <Pop at={11} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color: C.soft, marginTop: 18 }}>I ask: "but what if it's wrong?"</Pop>
      </div>
    </Scene>
    <Shot from={18} to={30} src="pitch/app-matches.png" caption="You already have the good stuff 🌸" color={C.mint} />
    <Shot from={30} to={42} src="pitch/app-intros.png" caption="Show me the receipts 🔒 photos wait for a yes" color={C.peach} />
    <Shot from={42} to={54} src="pitch/wave-evals.png" caption="Twelve checks, before every release 🧪" color={C.pink} />
    <Scene from={54} to={66}>
      <div style={{ textAlign: 'center' }}>
        <Title at={54.1} size={120}>First run: <span style={{ color: '#e5484d' }}>not green</span> 🟥</Title>
        <Pop at={58} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.soft, marginTop: 16 }}>a spoken spelling changed a profile</Pop>
      </div>
    </Scene>
    <Scene from={66} to={78}>
      <div style={{ textAlign: 'center' }}>
        <Title at={66.1} size={120} color="#1f8a4c">Fixed. Green ✅</Title>
        <Pop at={70} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.soft, marginTop: 16 }}>that's the whole job</Pop>
      </div>
    </Scene>
    <Shot from={78} to={86} src="pitch/date-features.png" caption="No-shows, a voice check, fair splits, no hidden fees 💸" color={C.lilac} />
    <Scene from={86} to={92}>
      <div style={{ textAlign: 'center' }}>
        <Title at={86.1} size={100}>Can we talk<br /><span style={{ color: C.pink }}>this week?</span> 💞</Title>
        <Pop at={88.5} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.soft, marginTop: 18 }}>Unnati Chhabra · unnati-chhabra.xyz · sample data</Pop>
      </div>
    </Scene>
    <Audio src={staticFile('music/cutelight.wav')} volume={0.6} />
  </AbsoluteFill>
);
