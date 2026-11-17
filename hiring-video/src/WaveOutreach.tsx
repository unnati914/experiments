import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Outreach edition: the story of reaching out, no reply, and building anyway. Matches the outreach script.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_OUTREACH_FRAMES = s(100);
const C = { bg: '#14061f', pink: '#ff3d8b', hot: '#ffd23f', mint: '#3dffb0', white: '#ffffff', purple: '#7b2cff', grey: '#8a8198' };
const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const Hit: React.FC<{ at: number; children: React.ReactNode; size?: number; color?: string }> = ({ at, children, size = 120, color = C.white }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 6, stiffness: 260 } });
  const shake = f - s(at) < 6 ? Math.sin((f - s(at)) * 3) * 10 : 0;
  return <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: `translateY(-50%) translateX(${shake}px) scale(${0.5 + 0.5 * p})`, opacity: Math.min(1, p * 2), textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: size, color, lineHeight: 1.08, textShadow: `0 8px 0 ${C.purple}` }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 3], [0, 1], clamp), interpolate(f, [s(to) - 3, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};
const Bubble: React.FC<{ at: number; text: string; left?: boolean; x: number; y: number }> = ({ at, text, left, x, y }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < s(at)) return null;
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 200 } });
  return <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${p})`, background: left ? C.white : C.pink, color: C.bg, fontFamily: FONT, fontWeight: 800, fontSize: 44, borderRadius: 26, padding: '14px 26px', boxShadow: `8px 8px 0 ${C.purple}` }}>{text}</div>;
};
const Shot: React.FC<{ from: number; to: number; src: string; caption: string; color: string }> = ({ from, to, src, caption, color }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(from), s(to)], [1.0, 1.1], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.3 }}><Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${z})` }} /></div>
      <div style={{ position: 'absolute', left: 80, right: 80, bottom: 90, background: color, borderRadius: 24, padding: '20px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 56, color: C.bg, transform: 'rotate(-2deg)', boxShadow: `10px 10px 0 ${C.white}` }}>{caption}</div>
    </Scene>
  );
};
const Recap: React.FC<{ at: number; text: string; y: number; color: string }> = ({ at, text, y, color }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 10, stiffness: 180 } });
  return <div style={{ position: 'absolute', left: 200, right: 200, top: y, transform: `translateX(${(1 - p) * -200}px)`, opacity: Math.min(1, p * 2), background: color, borderRadius: 26, padding: '18px 34px', fontFamily: FONT, fontWeight: 900, fontSize: 52, color: C.bg }}>{text}</div>;
};
export const WaveOutreach: React.FC = () => {
  const f = useCurrentFrame();
  const flash = f % 15 < 3 ? 0.12 : 0;
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${C.pink}${Math.round(flash * 255).toString(16).padStart(2, '0')}, transparent 60%)` }} />
      <Scene from={0} to={6}><Hit at={0.1} size={130}>I'm not a spammer.<br /><span style={{ color: C.hot }}>I'm a builder.</span> 🫠</Hit></Scene>
      <Scene from={6} to={16}>
        <Bubble at={6.2} text="hi! 👋" x={180} y={260} />
        <Bubble at={7.6} text="hello??" x={1080} y={380} />
        <Bubble at={9} text="just checking in" x={260} y={520} />
        <Bubble at={10.5} text="🙃 following up" x={1100} y={660} />
        <Hit at={12} size={110} color={C.mint}>No reply. 🦗🦗🦗</Hit>
      </Scene>
      <Scene from={16} to={26}>
        <Hit at={16.1} size={100}>So I stopped waiting.<br /><span style={{ color: C.hot }}>I started building.</span> 🛠️</Hit>
      </Scene>
      <Scene from={26} to={36}>
        <Recap at={26.2} text="✅ working demo: matches, intros, dates" y={200} color={C.mint} />
        <Recap at={28} text="✅ 15 features, date money included" y={400} color={C.hot} />
        <Recap at={29.8} text="✅ 12 eval checks before release" y={600} color={C.pink} />
        <Recap at={31.6} text="✅ pitch page + scripts + videos" y={800} color={C.mint} />
      </Scene>
      <Shot from={36} to={46} src="pitch/app-matches.png" caption="Matches that explain themselves 🧩" color={C.hot} />
      <Shot from={46} to={56} src="pitch/app-intros.png" caption="Photos wait for a yes from both 🔒" color={C.mint} />
      <Shot from={56} to={66} src="pitch/wave-evals.png" caption="Twelve checks, before EVERY release 🧪" color={C.pink} />
      <Scene from={66} to={76}><Hit at={66.1} size={130} color={C.white}>First run: <span style={{ color: '#ff3b3b' }}>FULL RED</span> 🟥<br /><span style={{ color: C.mint }}>Fixed. GREEN. ✅</span></Hit></Scene>
      <Shot from={76} to={86} src="pitch/date-features.png" caption="No-shows, voice check, fair splits, zero hidden fees 💸" color={C.hot} />
      <Scene from={86} to={100}>
        <Hit at={86.1} size={100}>Still reaching out.<br /><span style={{ color: C.grey }}>Still crickets. 🦗</span><br /><span style={{ color: C.pink }}>Can we talk this week?</span> 💞</Hit>
        <div style={{ position: 'absolute', bottom: 60, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.white }}>Unnati Chhabra · unnati-chhabra.xyz · sample data</div>
      </Scene>
      <Audio src={staticFile('music/outreach.wav')} volume={0.7} />
    </AbsoluteFill>
  );
};
