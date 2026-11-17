import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Full video pitch: intro, what was built, evals, new features, date money, challenges, how we work, close.
// Follows wave-full-pitch-video-script.md. No hosting links are shown.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const WAVE_FULL_FRAMES = s(170);
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
export const WaveFull: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg1}, ${C.bg2})`, fontFamily: FONT, overflow: 'hidden' }}>
    <Scene from={0} to={6}>
      <Head at={0.1} size={120}>Hi, I'm Unnati 👋<br /><span style={{ color: C.pink }}>AI engineer</span></Head>
      <Line at={2.5}>I make AI safe to trust. This is my pitch for Wave.</Line>
    </Scene>
    <Scene from={6} to={16}>
      <Head at={6.1} size={70}>About me, in numbers</Head>
      <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
        <Card at={7.5} emoji="🛵" color={C.pink} text="Zomato: Parchi Orders, ~70% of HyperPure GMV" />
        <Card at={9} emoji="🧾" color={C.lilac} text="Invoice OCR: ₹35 → ₹5 per invoice" />
        <Card at={10.5} emoji="💳" color={C.mint} text="Paysecure: payments for 40 merchants, 5 months" />
        <Card at={12} emoji="🤖" color={C.peach} text="Grid Dynamics: GenAI agents for VISA" />
        <Card at={13.5} emoji="📣" color={C.pink} text="21K LinkedIn followers, built from zero" />
      </div>
    </Scene>
    <Scene from={16} to={26}>
      <Head at={16.1} size={70}>What I built for Wave</Head>
      <div style={{ display: 'grid', gap: 14, marginTop: 24 }}>
        <Card at={17.5} emoji="💞" color={C.pink} text="Working demo: matches, intros, dates" />
        <Card at={19} emoji="✨" color={C.lilac} text="15 features, date money included" />
        <Card at={20.5} emoji="🧪" color={C.mint} text="12 eval checks, 34 test cases" />
        <Card at={22} emoji="🎙️" color={C.peach} text="Voice lab: every line quotes what was said" />
      </div>
    </Scene>
    <Shot from={26} to={34} src="pitch/app-matches.png" caption="Matches that explain themselves 🧩" color={C.mint} />
    <Shot from={34} to={42} src="pitch/app-intros.png" caption="Photos wait for a yes from both 🔒" color={C.peach} />
    <Shot from={42} to={52} src="pitch/app-metrics.png" caption="Every rate has a count. Sample data. 📊" color={C.lilac} />
    <Shot from={52} to={62} src="pitch/wave-evals.png" caption="Twelve checks before every release 🧪" color={C.pink} />
    <Scene from={62} to={72}>
      <Head at={62.1} size={64}>The 12 checks</Head>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, width: 1500 }}>
        {['Profile faithfulness', 'Hard limits', 'Accent parity', 'Consistent scoring', 'Confidences private', 'Photo locked', 'Unsafe messages blocked', 'Fair scores', 'Delete means delete', 'Transcript injection', 'Location buckets', 'Logs redacted'].map((t, i) => (
          <Pop key={t} at={63 + i * 0.4} style={{ background: C.white, borderRadius: 18, padding: '12px 18px', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink, boxShadow: `0 6px 0 ${[C.pink, C.lilac, C.mint][i % 3]}` }}>{i + 1}. {t}</Pop>
        ))}
      </div>
    </Scene>
    <Scene from={72} to={82}>
      <Head at={72.1} size={86} color="#c0392b">First run: not green 🟥</Head>
      <Line at={74.5}>A spoken spelling ("I luv trekking") changed a profile.</Line>
      <Head at={77} size={86} color="#1f8a4c">Fixed. Green ✅</Head>
      <Line at={79}>A later check caught a spoken instruction. Fixed too. That's the job.</Line>
    </Scene>
    <Scene from={82} to={92}>
      <Head at={82.1} size={64}>New features, on top of Wave</Head>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, width: 1500 }}>
        {['Decline without guilt', 'Opening lines that quote both people', 'Monthly profile refresh', 'Why wasn\'t I matched?', 'Safety circle', 'Fake-account check', 'Cost per match', 'Date planner with budget'].map((t, i) => (
          <Pop key={t} at={83 + i * 0.5} style={{ background: C.white, borderRadius: 18, padding: '12px 18px', fontFamily: FONT, fontWeight: 800, fontSize: 30, color: C.ink, boxShadow: `0 6px 0 ${[C.mint, C.peach, C.pink][i % 3]}` }}>✨ {t}</Pop>
        ))}
      </div>
    </Scene>
    <Shot from={92} to={102} src="pitch/date-features.png" caption="Date money: no-shows, voice check, fair splits, no hidden fees 💸" color={C.peach} />
    <Scene from={102} to={112}>
      <Head at={102.1} size={70}>Seven challenges, each mapped</Head>
      <Line at={104}>Small user base · voice-built trust · accents and fairness · date costs and safety · quiet conversations · voice cost per user · proof for investors</Line>
      <Line at={108} color={C.ink}>Each one has a check or a metric in the demo.</Line>
    </Scene>
    <Scene from={112} to={122}>
      <Head at={112.1} size={70}>How I'd work with you</Head>
      <Card at={114} emoji="📅" color={C.pink} text="Days 1–30: review flows, build the eval suite" />
      <Card at={116.5} emoji="🛡️" color={C.lilac} text="Days 31–60: security checks, first features, measure" />
      <Card at={119} emoji="🎙️" color={C.mint} text="Days 61–90: voice check, fairness audit, monthly report" />
    </Scene>
    <Scene from={122} to={130}>
      <Head at={122.1} size={70}>What I need</Head>
      <Line at={124}>Anonymised, consented data or a synthetic sandbox · access to the AI flows · your quality bars · one person to sign off releases</Line>
    </Scene>
    <Shot from={130} to={140} src="pitch/wave-pitch.png" caption="The full pitch page: challenges, checklist, plan 📄" color={C.lilac} />
    <Scene from={140} to={152}>
      <Head at={140.1} size={80}>Still reaching out.<br /><span style={{ color: C.soft }}>Still crickets 🦗</span></Head>
      <Line at={144}>But I stopped waiting and started building. Building doesn't need a reply.</Line>
    </Scene>
    <Scene from={152} to={170}>
      <Head at={152.1} size={96}>Let's talk this week 💞</Head>
      <Line at={155}>A 30-minute call. I'll walk you through the eval run and the demo.</Line>
      <Line at={160} color={C.ink}>Unnati Chhabra · unnati-chhabra.xyz · sample data</Line>
    </Scene>
    <Audio src={staticFile('music/fullpitch.wav')} volume={0.6} />
  </AbsoluteFill>
);
