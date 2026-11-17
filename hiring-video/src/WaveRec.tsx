import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Fast video for the recording (New Recording 218). Scenes are timed to the processed audio (rec218clear.wav, 99s).
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_REC_FRAMES = s(99.07);
const C = { bg1: '#12051f', bg2: '#22093d', pink: '#ff3d8b', lilac: '#7b2cff', mint: '#3dffb0', hot: '#ffd23f', white: '#ffffff', soft: '#cdbde8' };
const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 7, stiffness: 240 } });
  return <div style={{ opacity: Math.min(1, p * 2), transform: `scale(${0.7 + 0.3 * p})`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 3], [0, 1], clamp), interpolate(f, [s(to) - 3, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 80, textAlign: 'center' }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string }> = ({ children, size = 96, color = C.white }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1.08, textShadow: `0 8px 0 ${C.lilac}` }}>{children}</div>
);
const Shot: React.FC<{ from: number; to: number; src: string; caption: string; color: string }> = ({ from, to, src, caption, color }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(from), s(to)], [1.0, 1.08], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.3 }}><Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} /></div>
      <Pop at={from + 0.2} style={{ position: 'absolute', left: 90, right: 90, bottom: 110, background: color, borderRadius: 24, padding: '20px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: C.bg1, transform: 'rotate(-2deg)', boxShadow: `10px 10px 0 ${C.white}` }}>{caption}</Pop>
    </Scene>
  );
};
export const WaveRec: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f % 15 < 3 ? 0.1 : 0;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.pink}${Math.round(flash * 255).toString(16).padStart(2, '0')}, transparent 60%)` }} />
      <Scene from={0} to={6.1}>
        <Big size={120}>Hi, I'm Unnati.<br /><span style={{ color: C.mint }}>AI engineer.</span></Big>
        <Pop at={3} style={{ marginTop: 40, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.hot }}>Previously: Zomato · Paysecure · Grid Dynamics (GenAI agents for VISA)</Pop>
      </Scene>
      <Shot from={6.1} to={17.4} src="pitch/app-matches.png" caption="Wave already has the core. I wanted to make it trustworthy." color={C.hot} />
      <Scene from={17.4} to={26}>
        <Big size={80}>My demo.<br /><span style={{ color: C.pink }}>Not your product.</span><br />Made-up data. 🧪</Big>
      </Scene>
      <Scene from={26} to={30.9}>
        <Big size={70}>Matches that explain themselves.<br />Three a week. Photos locked.</Big>
      </Scene>
      <Shot from={30.9} to={38} src="pitch/wave-evals.png" caption="12 test checks, before EVERY release 🧪" color={C.pink} />
      <Scene from={38} to={44}>
        <Big size={64}>A voice lab checks every line<br />against what the person said. ✅</Big>
      </Scene>
      <Scene from={44} to={52}>
        <Big size={60}>Does a speech mistake change a profile?<br />Can a spoken instruction sneak in? 🎙️</Big>
      </Scene>
      <Scene from={52} to={59}>
        <Big size={70}>Does a private line ever<br />show up in an intro? 🤐</Big>
      </Scene>
      <Scene from={59} to={65}>
        <Big size={70} color={C.hot}>First run: one failed.</Big>
        <Pop at={61} style={{ marginTop: 30, fontFamily: FONT, fontWeight: 800, fontSize: 48, color: C.white }}>A spelling changed a profile. I fixed it. It passed. 🟩</Pop>
      </Scene>
      <Shot from={65} to={70} src="pitch/date-features.png" caption="Dates: you ask for feedback after. 📝" color={C.mint} />
      <Scene from={70} to={78}>
        <Big size={70}>No-show? It goes in feedback.<br />Profile stays locked. 🔒</Big>
      </Scene>
      <Scene from={78} to={84}>
        <Big size={70}>Feedback within 48 hours.<br />No answer? It closes kindly.</Big>
      </Scene>
      <Scene from={84} to={88}>
        <Big size={64}>Short voice check before a date.<br />These are my ideas. 💡</Big>
      </Scene>
      <Shot from={88} to={92} src="pitch/wave-pitch.png" caption="I've reached out a few times. So I built this. 💌" color={C.lilac} />
      <Scene from={92} to={98.3}>
        <Big size={84}>Could we talk<br /><span style={{ color: C.pink }}>for 30 minutes this week?</span> 💞</Big>
      </Scene>
      <Scene from={98.3} to={99.1}>
        <Big size={70}>Thanks. Unnati · unnati-chhabra.xyz</Big>
      </Scene>
      <Audio src={staticFile('voice/rec218clear.wav')} volume={1} />
      <Audio src={staticFile('music/rec218lofi.wav')} volume={0.12} />
    </AbsoluteFill>
  );
};
