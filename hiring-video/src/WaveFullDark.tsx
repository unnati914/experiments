import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Full video pitch: intro, what was built, evals, new features, date money, challenges, how we work, close.
// Follows wave-full-pitch-video-script.md. No hosting links are shown.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_FULL_DARK_FRAMES = s(170);
const C = { bg1: '#12051f', bg2: '#22093d', pink: '#ff3d8b', lilac: '#7b2cff', mint: '#3dffb0', peach: '#ffd23f', ink: '#ffffff', soft: '#cdbde8', white: '#1d0b30' };
const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const glow = (c: string) => `0 0 24px ${c}`;
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
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 60 }}>{children}</AbsoluteFill>;
};
const Head: React.FC<{ at: number; children: React.ReactNode; size?: number; color?: string }> = ({ at, children, size = 92, color = C.ink }) => (
  <Pop at={at} style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, textAlign: 'center', lineHeight: 1.1 }}>{children}</Pop>
);
const Line: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at, children, color = C.soft }) => (
  <Pop at={at} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 38, color, textAlign: 'center', marginTop: 18, lineHeight: 1.35, maxWidth: 1500 }}>{children}</Pop>
);
const Card: React.FC<{ at: number; text: string; color: string; emoji: string }> = ({ at, text, color, emoji }) => (
  <Pop at={at} style={{ background: C.white, borderRadius: 30, padding: '24px 36px', boxShadow: `0 10px 0 ${color}`, border: `5px solid ${color}`, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink, display: 'flex', gap: 22, alignItems: 'center', width: 1200 }}><span style={{ fontSize: 56 }}>{emoji}</span>{text}</Pop>
);
const Shot: React.FC<{ from: number; to: number; src: string; caption: string; color: string }> = ({ from, to, src, caption, color }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(from), s(to)], [1.0, 1.05], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ width: 1400, height: 720, borderRadius: 30, overflow: 'hidden', border: `6px solid ${C.white}`, boxShadow: `0 14px 0 ${color}`, background: C.white }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', transform: `scale(${z})`, transformOrigin: 'top left' }} />
      </div>
      <Pop at={from + 0.4} style={{ marginTop: 24, background: color, borderRadius: 24, padding: '12px 28px', fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.ink }}>{caption}</Pop>
    </Scene>
  );
};
export const WaveFullDark: React.FC = () => {
  const f = useCurrentFrame(  );
};
