import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Video: the eight new features, shown in the working app tab, then one card per feature.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_NEW_FRAMES = s(66);
const C = { bg1: '#fff0f6', bg2: '#f1ecff', pink: '#ff8fb8', lilac: '#b9a4ff', mint: '#9ee6cf', peach: '#ffd3a8', ink: '#3b2a4a', soft: '#7d6d8c', white: '#ffffff' };
const FONT = "'Avenir Next', 'Nunito', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
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
const FEATURES: [string, string, string, string][] = [
  ['🕊️', 'Decline without guilt', 'A kind reason, one tap. The other person gets a gentle note, not silence.', C.pink],
  ['💬', 'Opening lines from receipts', 'The first message is built from something both people really said.', C.lilac],
  ['🔄', 'Profile refresh', 'Monthly: "still true?" Only confirmed changes update the profile.', C.mint],
  ['🧩', 'Why wasn\'t I matched?', 'Plain reasons, like "your age range". Never a hidden score.', C.peach],
  ['🗺️', 'Date planner with budget', 'Ideas in your city that fit your budget and shared interests.', C.pink],
  ['🛡️', 'Safety circle', 'A trusted contact sees the date plan and check-in times, never the chat.', C.lilac],
  ['🔍', 'Fake-account check', 'Near-identical profiles get flagged for a human to review.', C.mint],
  ['💸', 'Cost per match', 'AI cost per conversation, divided by matches, so growth stays affordable.', C.peach],
];
export const WaveNew: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [s(4), s(14)], [0, -420], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
      <Scene from={0} to={5}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={0.1}><div style={{ fontWeight: 900, fontSize: 40, color: C.soft, letterSpacing: 4 }}>WAVE · NEW FEATURES</div></Pop>
          <Pop at={0.5}><div style={{ fontWeight: 900, fontSize: 104, color: C.ink, lineHeight: 1.05 }}>Eight features,<br />all working</div></Pop>
          <Pop at={1.8}><div style={{ fontWeight: 700, fontSize: 38, color: C.soft, marginTop: 16 }}>from the pitch, built into the demo</div></Pop>
        </div>
      </Scene>
      <Scene from={5} to={15}>
        <div style={{ width: 1500, height: 820, overflow: 'hidden', borderRadius: 30, border: `6px solid ${C.white}`, boxShadow: `0 16px 0 ${C.pink}`, background: C.white }}>
          <Img src={staticFile('pitch/new-features.png')} style={{ width: '100%', transform: `translateY(${pan}px)` }} />
        </div>
      </Scene>
      {FEATURES.map(([emoji, title, body, color], i) => {
        const at = 15 + i * 6;
        return (
          <Scene key={title} from={at} to={at + 6}>
            <Pop at={at + 0.1} style={{ background: C.white, borderRadius: 44, padding: '48px 60px', width: 1300, boxShadow: `0 16px 0 ${color}`, border: `6px solid ${color}`, display: 'flex', gap: 40, alignItems: 'center' }}>
              <div style={{ fontSize: 150 }}>{emoji}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 30, color: C.soft }}>{i + 1} / 8</div>
                <div style={{ fontWeight: 900, fontSize: 64, color: C.ink, lineHeight: 1.1 }}>{title}</div>
                <div style={{ fontWeight: 600, fontSize: 34, color: C.soft, marginTop: 14, lineHeight: 1.35 }}>{body}</div>
              </div>
            </Pop>
          </Scene>
        );
      })}
      <Scene from={63} to={66}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={63.1}><div style={{ fontWeight: 900, fontSize: 80, color: C.ink }}>Built, tested, measured 💞</div></Pop>
          <Pop at={64.2}><div style={{ fontWeight: 700, fontSize: 32, color: C.soft, marginTop: 14 }}>demo on made-up data · Unnati Chhabra</div></Pop>
        </div>
      </Scene>
      <Audio src={staticFile('music/newfeat.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
