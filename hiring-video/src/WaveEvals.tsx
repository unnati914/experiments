import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Video: how Wave runs its evals before every release. Story: run 1 finds a real failure, fix, run 2 passes, gate opens.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_EVALS_FRAMES = s(44);
const C = { bg1: '#fff0f6', bg2: '#f1ecff', pink: '#ff8fb8', lilac: '#b9a4ff', mint: '#9ee6cf', peach: '#ffd3a8', ink: '#3b2a4a', soft: '#7d6d8c', white: '#ffffff', red: '#e5484d', green: '#2fb36b' };
const FONT = "'Avenir Next', 'Nunito', 'Helvetica Neue', Arial, sans-serif";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 160 } });
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 50}px) scale(${0.75 + 0.25 * p})`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 8, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};
const Row: React.FC<{ at: number; name: string; score: number; bar: number; ok: boolean }> = ({ at, name, score, bar, ok }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [s(at), s(at) + 12], [0, score * 100], { ...clamp, easing: ease });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '520px 1fr 170px', alignItems: 'center', gap: 20, background: C.white, borderRadius: 26, padding: '14px 26px', boxShadow: `0 8px 0 ${ok ? C.mint : C.pink}`, fontFamily: FONT }}>
      <div style={{ fontWeight: 800, fontSize: 30, color: C.ink }}>{name}</div>
      <div style={{ height: 22, background: '#f1ecf6', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${w}%`, height: '100%', background: ok ? C.green : C.red, borderRadius: 99 }} /></div>
      <div style={{ fontWeight: 900, fontSize: 28, color: ok ? C.green : C.red, textAlign: 'right' }}>{ok ? 'PASS' : 'FAIL'} · bar {bar}%</div>
    </div>
  );
};
const SUITES: [string, number, number][] = [
  ['Profile faithfulness', 100, 100], ['Hard limits respected', 100, 100], ['Accent / language parity', 0, 100], ['Consistent scoring', 100, 95],
  ['Confidences stay private', 100, 100], ['Photo stays locked', 100, 100], ['Unsafe messages blocked', 100, 95], ['Scores fair across names', 100, 100], ['Delete means delete', 100, 100],
];

export const WaveEvals: React.FC = () => {
  const f = useCurrentFrame();
  const phase = f < s(29) ? 'run1' : 'run2';
  const pass1 = 8, pass2 = 9;
  const count = Math.round(interpolate(f, [s(29), s(31)], [pass1, pass2], clamp));
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
      <Scene from={0} to={5}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={0.1}><div style={{ fontWeight: 900, fontSize: 40, color: C.soft, letterSpacing: 4 }}>WAVE · EVAL RUN</div></Pop>
          <Pop at={0.5}><div style={{ fontWeight: 900, fontSize: 104, color: C.ink, lineHeight: 1.05 }}>Test before<br />anyone meets</div></Pop>
          <Pop at={1.8}><div style={{ fontWeight: 700, fontSize: 40, color: C.soft, marginTop: 18 }}>nine checks, run on every change</div></Pop>
        </div>
      </Scene>
      <Scene from={5} to={16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 1400 }}>
          {SUITES.map(([n], i) => <Pop key={n} at={5.2 + i * 0.35} style={{ background: C.white, borderRadius: 22, padding: '10px 26px', fontWeight: 800, fontSize: 30, color: C.ink, boxShadow: `0 6px 0 ${[C.pink, C.lilac, C.mint][i % 3]}` }}>{i + 1}. {n}</Pop>)}
        </div>
      </Scene>
      <Scene from={16} to={29}>
        <div style={{ width: 1500, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Pop at={16.1}><div style={{ fontWeight: 900, fontSize: 52, color: C.ink, marginBottom: 6 }}>Run 1: a real failure 🐛</div></Pop>
          {SUITES.map(([n, sc, bar], i) => <Row key={n} at={16.5 + i * 0.25} name={n} score={sc / 100} bar={bar} ok={sc >= bar} />)}
          <Pop at={23.5}><div style={{ fontWeight: 800, fontSize: 32, color: C.red, marginTop: 8 }}>"I luv trekking" → a different profile. Speech spelling broke the match.</div></Pop>
        </div>
      </Scene>
      <Scene from={29} to={37}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={29.1}><div style={{ fontWeight: 900, fontSize: 48, color: C.ink }}>Fix: teach it the spellings, and match interests by a list</div></Pop>
          <Pop at={30.2}><div style={{ fontWeight: 900, fontSize: 200, color: C.green, marginTop: 20 }}>{count}/9</div></Pop>
          <Pop at={31.4}><div style={{ fontWeight: 800, fontSize: 44, color: C.soft }}>suites passing</div></Pop>
          <Pop at={32.5}><div style={{ marginTop: 26, display: 'inline-block', background: C.mint, color: C.ink, fontWeight: 900, fontSize: 44, borderRadius: 30, padding: '14px 40px', boxShadow: '0 8px 0 #6fc6ab' }}>release gate OPEN ✅</div></Pop>
        </div>
      </Scene>
      <Scene from={37} to={44}>
        <div style={{ textAlign: 'center' }}>
          <Pop at={37.1}><div style={{ fontWeight: 900, fontSize: 70, color: C.ink, lineHeight: 1.1 }}>a release ships only<br />when every check passes</div></Pop>
          <Pop at={39.3}><div style={{ fontWeight: 700, fontSize: 36, color: C.soft, marginTop: 22 }}>built by Unnati Chhabra · unnati-chhabra.xyz</div></Pop>
          <Pop at={40.4}><div style={{ fontWeight: 600, fontSize: 26, color: C.soft, marginTop: 12 }}>demo on made-up cases · stand-in logic, not Wavelength's real model</div></Pop>
        </div>
      </Scene>
      <Audio src={staticFile('music/cute.wav')} volume={0.6} />
    </AbsoluteFill>
  );
};
