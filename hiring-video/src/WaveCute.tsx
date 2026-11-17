import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Cute explainer for the Wave matchmaker demo. Pastel, soft, bouncy. Numbers come from a sample run (illustrative).
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_CUTE_FRAMES = s(48);
const C = { bg1: '#fff0f6', bg2: '#f1ecff', pink: '#ff8fb8', lilac: '#b9a4ff', mint: '#9ee6cf', peach: '#ffd3a8', ink: '#3b2a4a', soft: '#7d6d8c', white: '#ffffff' };
const FONT = "'Avenir Next', 'Nunito', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

const Bounce: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 8, stiffness: 150 } });
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 60}px) scale(${0.7 + 0.3 * p})`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 8, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};
const Bubble: React.FC<{ at: number; side: 'l' | 'r'; color: string; children: React.ReactNode }> = ({ at, side, color, children }) => (
  <Bounce at={at} style={{ alignSelf: side === 'l' ? 'flex-start' : 'flex-end', background: color, color: C.ink, borderRadius: 30, padding: '18px 28px', fontFamily: FONT, fontWeight: 700, fontSize: 40, boxShadow: '0 10px 0 rgba(59,42,74,0.12)' }}>{children}</Bounce>
);
const Card: React.FC<{ at: number; color: string; title: string; body: string; emoji: string }> = ({ at, color, title, body, emoji }) => (
  <Bounce at={at} style={{ background: C.white, borderRadius: 40, padding: '34px 44px', width: 1100, boxShadow: `0 14px 0 ${color}`, border: `6px solid ${color}`, display: 'flex', gap: 30, alignItems: 'center' }}>
    <div style={{ fontSize: 110 }}>{emoji}</div>
    <div>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.ink }}>{title}</div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, color: C.soft, marginTop: 8, lineHeight: 1.35 }}>{body}</div>
    </div>
  </Bounce>
);
const Counter: React.FC<{ at: number; to: number; suffix?: string; label: string; color: string }> = ({ at, to, suffix = '%', label, color }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [s(at), s(at) + 1.4 * FPS], [0, to], { ...clamp, easing: ease }));
  return (
    <div style={{ background: C.white, borderRadius: 36, padding: '26px 30px', width: 380, textAlign: 'center', boxShadow: `0 12px 0 ${color}`, border: `5px solid ${color}` }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 88, color: C.ink }}>{v}{suffix}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.soft, marginTop: 6 }}>{label}</div>
    </div>
  );
};
const Sparkles: React.FC = () => {
  const f = useCurrentFrame();
  return <>{Array.from({ length: 22 }, (_, i) => {
    const x = (i * 197 + f * (0.6 + (i % 4) * 0.3)) % 1980 - 30;
    const y = (i * 131 + Math.sin(f / 22 + i) * 40) % 1100;
    const e = ['✨', '💗', '🌸', '⭐', '🫧'][i % 5];
    return <div key={i} style={{ position: 'absolute', left: x, top: y, fontSize: 34 + (i % 3) * 10, opacity: 0.5 + 0.3 * Math.sin(f / 15 + i) }}>{e}</div>;
  })}</>;
};

export const WaveCute: React.FC = () => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 20) * 6;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
      <Sparkles />
      {/* 1 · title */}
      <Scene from={0} to={5}>
        <div style={{ textAlign: 'center' }}>
          <Bounce at={0.1}><div style={{ fontSize: 150, transform: `translateY(${bob}px)` }}>💞</div></Bounce>
          <Bounce at={0.5}><div style={{ fontWeight: 900, fontSize: 120, color: C.ink }}>Wave</div></Bounce>
          <Bounce at={1.4}><div style={{ fontWeight: 700, fontSize: 46, color: C.soft }}>a matchmaker that talks to you, not at you</div></Bounce>
        </div>
      </Scene>
      {/* 2 · no swiping */}
      <Scene from={5} to={13}>
        <div style={{ width: 1200, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Bubble at={5.2} side="l" color={C.mint}>hi! tell me about your weekend 🌿</Bubble>
          <Bubble at={7.0} side="r" color={C.peach}>trekking, then chai with friends</Bubble>
          <Bubble at={8.8} side="l" color={C.lilac}>ooh, which trail? I love the hills too</Bubble>
          <Bounce at={10.5} style={{ alignSelf: 'center', fontWeight: 900, fontSize: 52, color: C.pink, marginTop: 10 }}>no swiping. just a chat 💕</Bounce>
        </div>
      </Scene>
      {/* 3 · explained matches */}
      <Scene from={13} to={21}>
        <Card at={13.2} color={C.pink} emoji="🧩" title="Every match explains itself" body="You both love trekking, and you both want kids. Real reasons, shown to you." />
      </Scene>
      {/* 4 · photo lock */}
      <Scene from={21} to={29}>
        <Card at={21.2} color={C.lilac} emoji="🔒" title="Photos wait for a yes from both" body="Nobody sees a face until you both agree to connect. Calm, and fair." />
      </Scene>
      {/* 5 · close kindly */}
      <Scene from={29} to={37}>
        <Card at={29.2} color={C.mint} emoji="🕊️" title="Close it kindly, not with silence" body="After 3 quiet days, you choose: keep talking, or close with a kind note." />
      </Scene>
      {/* 6 · metrics */}
      <Scene from={37} to={44}>
        <div style={{ textAlign: 'center' }}>
          <Bounce at={37.1}><div style={{ fontWeight: 900, fontSize: 60, color: C.ink, marginBottom: 26 }}>what we track, gently</div></Bounce>
          <div style={{ display: 'flex', gap: 30, justifyContent: 'center' }}>
            <Counter at={37.6} to={100} label="intros that got a yes" color={C.pink} />
            <Counter at={38.6} to={100} label="yes → first message" color={C.lilac} />
            <Counter at={39.6} to={75} label="yes → a date" color={C.mint} />
          </div>
          <Bounce at={41}><div style={{ fontWeight: 600, fontSize: 24, color: C.soft, marginTop: 22 }}>sample numbers from the demo run, not real results</div></Bounce>
        </div>
      </Scene>
      {/* 7 · end card */}
      <Scene from={44} to={48}>
        <div style={{ textAlign: 'center' }}>
          <Bounce at={44.1}><div style={{ fontWeight: 900, fontSize: 96, color: C.ink }}>say hi to Wave 💞</div></Bounce>
          <Bounce at={45}><div style={{ fontWeight: 700, fontSize: 40, color: C.soft, marginTop: 20 }}>built by Unnati Chhabra · unnati-chhabra.xyz</div></Bounce>
        </div>
      </Scene>
      <Audio src={staticFile('music/cute.wav')} volume={0.7} />
    </AbsoluteFill>
  );
};
