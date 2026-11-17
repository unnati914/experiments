import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// High-energy pitch video. Captions follow the "unhinged" script; screenshots are the real demo screens.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_UNHINGED_FRAMES = s(92);
const C = { bg: '#12051f', pink: '#ff3d8b', hot: '#ffd23f', mint: '#3dffb0', white: '#ffffff', purple: '#7b2cff' };
const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Hit: React.FC<{ at: number; children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ at, children, size = 120, color = C.white, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 6, stiffness: 260 } });
  const shake = f - s(at) < 6 ? Math.sin((f - s(at)) * 3) * 10 : 0;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) translateX(${shake}px) scale(${0.5 + 0.5 * p})`, opacity: Math.min(1, p * 2), textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1.05, textShadow: `0 8px 0 ${C.purple}` , ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 3], [0, 1], clamp), interpolate(f, [s(to) - 3, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};
const Shot: React.FC<{ from: number; to: number; src: string; caption: string; color: string }> = ({ from, to, src, caption, color }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(from), s(to)], [1.0, 1.1], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.35 }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} />
      </div>
      <div style={{ position: 'absolute', left: 80, right: 80, bottom: 90, background: color, borderRadius: 24, padding: '20px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 58, color: C.bg, transform: 'rotate(-2deg)', boxShadow: `10px 10px 0 ${C.white}` }}>{caption}</div>
    </Scene>
  );
};
export const WaveUnhinged: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f % 15 < 3 ? 0.15 : 0;
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.pink}${Math.round(flash * 255).toString(16).padStart(2, '0')}, transparent 60%)` }} />
      <Scene from={0} to={8}>
        <Hit at={0.1} size={170}>WAVE.<br /><span style={{ color: C.hot }}>SWIPELESS.</span><br />ICONIC.</Hit>
      </Scene>
      <Scene from={8} to={18}>
        <Hit at={8.1} size={110}>I'm Unnati.<br /><span style={{ color: C.mint }}>AI engineer.</span><br />I ask "but what if it's wrong?" 😤</Hit>
      </Scene>
      <Shot from={18} to={30} src="pitch/app-matches.png" caption="You already have the good stuff. Fifty-minute voice chat. Chef's kiss. 👨‍🍳" color={C.hot} />
      <Shot from={30} to={42} src="pitch/app-intros.png" caption="Show me the receipts. Photos locked until both say yes. 🔒" color={C.mint} />
      <Shot from={42} to={54} src="pitch/wave-evals.png" caption="Twelve checks. Before EVERY release. 🧪" color={C.pink} />
      <Scene from={54} to={66}>
        <Hit at={54.1} size={150} color={C.hot}>First run:<br /><span style={{ color: '#ff3b3b' }}>FULL RED</span> 🟥</Hit>
      </Scene>
      <Scene from={66} to={78}>
        <Hit at={66.1} size={130} color={C.mint}>Fixed.<br />GREEN. ✅<br /><span style={{ fontSize: 60 }}>that's the whole job</span></Hit>
      </Scene>
      <Shot from={78} to={86} src="pitch/date-features.png" caption="No-shows. Voice check. Fair splits. Zero hidden fees. 💸" color={C.hot} />
      <Scene from={86} to={92}>
        <Hit at={86.1} size={110}>Can we talk<br /><span style={{ color: C.pink }}>this week?</span> 💞<br /><span style={{ fontSize: 48, color: C.white }}>Unnati Chhabra · unnati-chhabra.xyz · sample data</span></Hit>
      </Scene>
      <Audio src={staticFile('music/unhinged.wav')} volume={0.7} />
    </AbsoluteFill>
  );
};
