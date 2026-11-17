import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Pitch video: Unnati's work + a walk through the Wave demos. Cute pastel style, same music family as the Wave videos.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_PITCH_FRAMES = s(62);
const C = { bg1: '#fff0f6', bg2: '#f1ecff', pink: '#ff8fb8', lilac: '#b9a4ff', mint: '#9ee6cf', peach: '#ffd3a8', ink: '#3b2a4a', soft: '#7d6d8c', white: '#ffffff' };
const FONT = "'Avenir Next', 'Nunito', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 160 } });
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px) scale(${0.8 + 0.2 * p})`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 8, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};
// screenshot with a slow zoom, framed like a card
const Shot: React.FC<{ at: number; to: number; src: string; caption: string }> = ({ at, to, src, caption }) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [s(at), s(to)], [1.0, 1.06], clamp);
  return (
    <Scene from={at} to={to}>
      <div style={{ position: 'relative', width: 1400, height: 800, borderRadius: 30, overflow: 'hidden', boxShadow: `0 16px 0 ${C.pink}`, border: `6px solid ${C.white}`, background: C.white }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left', transform: `scale(${z})`, transformOrigin: 'top left' }} />
      </div>
      <Pop at={at + 0.3} style={{ marginTop: 26, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.ink, textAlign: 'center' }}>{caption}</Pop>
    </Scene>
  );
};
const Work: React.FC<{ at: number; title: string; body: string; color: string; emoji: string }> = ({ at, title, body, color, emoji }) => (
  <Pop at={at} style={{ background: C.white, borderRadius: 36, padding: '28px 40px', width: 1200, boxShadow: `0 12px 0 ${color}`, border: `5px solid ${color}`, display: 'flex', gap: 28, alignItems: 'center', fontFamily: FONT }}>
    <div style={{ fontSize: 90 }}>{emoji}</div>
    <div>
      <div style={{ fontWeight: 900, fontSize: 44, color: C.ink }}>{title}</div>
      <div style={{ fontWeight: 600, fontSize: 28, color: C.soft, marginTop: 6, lineHeight: 1.35 }}>{body}</div>
    </div>
  </Pop>
);

export const WavePitch: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
      <Scene from={0} to={6}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={0.1}><div style={{ fontWeight: 900, fontSize: 40, color: C.soft, letterSpacing: 4 }}>UNNATI CHHABRA · AI ENGINEER</div></Pop>
          <Pop at={0.5}><div style={{ fontWeight: 900, fontSize: 110, color: C.ink, lineHeight: 1.05 }}>Making AI<br />safe to trust</div></Pop>
          <Pop at={2}><div style={{ fontWeight: 700, fontSize: 40, color: C.soft, marginTop: 16 }}>a pitch for Wave, built as a working demo</div></Pop>
        </div>
      </Scene>
      <Scene from={6} to={16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Work at={6.2} emoji="🛵" color={C.pink} title="Zomato" body="Parchi Orders, about 70% of HyperPure GMV · GenAI bot eval framework" />
          <Work at={8.6} emoji="💳" color={C.lilac} title="Paysecure" body="Payment plugins for 40 merchants across three platforms" />
          <Work at={11} emoji="🤖" color={C.mint} title="Grid Dynamics" body="GenAI agents for VISA · a dev tool that saves about 40 hours a week" />
          <Work at={13.4} emoji="🧪" color={C.peach} title="Eval POCs" body="103 company pages, each with a working test suite" />
        </div>
      </Scene>
      <Shot at={16} to={24} src="pitch/app-matches.png" caption="Matches explain themselves, three a week" />
      <Shot at={24} to={32} src="pitch/app-intros.png" caption="Photos unlock only when both agree" />
      <Shot at={32} to={40} src="pitch/app-metrics.png" caption="Metrics that matter, with sample numbers" />
      <Shot at={40} to={48} src="pitch/wave-evals.png" caption="Twelve checks before every release" />
      <Scene from={48} to={56}>
        <div style={{ textAlign: 'center', width: 1500 }}>
          <Pop at={48.2}><div style={{ fontWeight: 900, fontSize: 60, color: C.ink, lineHeight: 1.15 }}>Features are built.<br />I make them trustworthy.</div></Pop>
          <Pop at={50}><div style={{ fontWeight: 700, fontSize: 36, color: C.soft, marginTop: 22 }}>evals · security tests · safety operations · the voice pipeline</div></Pop>
        </div>
      </Scene>
      <Scene from={56} to={62}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={56.2}><div style={{ fontWeight: 900, fontSize: 96, color: C.ink }}>Can we talk this week? 💞</div></Pop>
          <Pop at={58}><div style={{ fontWeight: 700, fontSize: 38, color: C.soft, marginTop: 20 }}>Unnati Chhabra · unnati-chhabra.xyz · github.com/unnati914</div></Pop>
          <Pop at={59.4}><div style={{ fontWeight: 600, fontSize: 26, color: C.soft, marginTop: 12 }}>demo on made-up data · stand-in logic, not Wavelength's real model</div></Pop>
        </div>
      </Scene>
      <Audio src={staticFile('music/pitch.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
