import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Video: the seven date-money and safety features. Matches the voiceover script timing.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_DATE_FRAMES = s(66);
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
const CARDS: [string, string, string, string, string][] = [
  ['🚫', 'No-show policy', 'The credit is kept, not lost. Both get the same message.', 'No-show rate', C.pink],
  ['💌', 'Post-date pulse', 'Two quick questions. Feeds matching and safety, never shown.', 'Second-date rate', C.lilac],
  ['⚖️', 'Sponsorship fairness audit', 'Same sponsored value for everyone. Gap under ₹100.', 'Gap per group', C.mint],
  ['🧾', 'Date receipt', 'Where the money went, with a total. No hidden fees.', 'Refund disputes', C.peach],
  ['⏳', '48-hour decide window', 'Decide within 48 hours. Silence closes it kindly.', 'Open-limbo count', C.pink],
  ['🎙️', 'Two-minute voice check', 'Mismatch stops the booking. Nothing spent.', 'Spend on mismatched dates', C.lilac],
  ['⭐', 'Member-rated venues', 'Only people who dated there can rate it.', 'Rating coverage', C.mint],
];
export const WaveDate: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [s(3), s(10)], [0, -900], clamp);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
      <Scene from={0} to={6}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={0.1}><div style={{ fontWeight: 900, fontSize: 40, color: C.soft, letterSpacing: 4 }}>WAVE · FIRST DATE, DONE FAIRLY</div></Pop>
          <Pop at={0.5}><div style={{ fontWeight: 900, fontSize: 100, color: C.ink, lineHeight: 1.05 }}>Wave already<br />pays for first dates</div></Pop>
          <Pop at={2.2}><div style={{ fontWeight: 700, fontSize: 38, color: C.soft, marginTop: 16 }}>so make that money fair, safe and measurable</div></Pop>
        </div>
      </Scene>
      <Scene from={6} to={12}>
        <div style={{ width: 1500, height: 820, overflow: 'hidden', borderRadius: 30, border: `6px solid ${C.white}`, boxShadow: `0 16px 0 ${C.pink}`, background: C.white }}>
          <Img src={staticFile('pitch/date-features.png')} style={{ width: '100%', transform: `translateY(${pan}px)` }} />
        </div>
      </Scene>
      {CARDS.map(([emoji, title, body, metric, color], i) => {
        const at = 12 + i * 6.5;
        return (
          <Scene key={title} from={at} to={at + 6.5}>
            <Pop at={at + 0.1} style={{ background: C.white, borderRadius: 44, padding: '46px 60px', width: 1300, boxShadow: `0 16px 0 ${color}`, border: `6px solid ${color}`, display: 'flex', gap: 40, alignItems: 'center' }}>
              <div style={{ fontSize: 140 }}>{emoji}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 28, color: C.soft }}>{i + 1} / 7</div>
                <div style={{ fontWeight: 900, fontSize: 62, color: C.ink, lineHeight: 1.1 }}>{title}</div>
                <div style={{ fontWeight: 600, fontSize: 32, color: C.soft, marginTop: 12, lineHeight: 1.35 }}>{body}</div>
                <div style={{ fontWeight: 800, fontSize: 26, color: C.ink, marginTop: 14, background: C.bg2, display: 'inline-block', padding: '6px 16px', borderRadius: 14 }}>metric: {metric}</div>
              </div>
            </Pop>
          </Scene>
        );
      })}
      <Scene from={58} to={66}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={58.1}><div style={{ fontWeight: 900, fontSize: 84, color: C.ink, lineHeight: 1.1 }}>Every feature has<br />a number I'd track 💞</div></Pop>
          <Pop at={60.5}><div style={{ fontWeight: 700, fontSize: 36, color: C.soft, marginTop: 20 }}>Unnati Chhabra · unnati-chhabra.xyz</div></Pop>
          <Pop at={61.8}><div style={{ fontWeight: 600, fontSize: 24, color: C.soft, marginTop: 10 }}>sample data · stand-in logic, not Wavelength's real model</div></Pop>
        </div>
      </Scene>
      <Audio src={staticFile('music/datefeat.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
