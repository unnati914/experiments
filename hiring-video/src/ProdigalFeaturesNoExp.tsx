import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Five features I'd build for Prodigal (FDE pitch v2): same ledger look as ProdigalPitch.
// Scene times are written on the raw recording-226 timeline (script-prodigal-features.md); WARP maps them onto
// the voiceover at the start of each spoken phrase: [raw second, voice second]. This cut leaves out the lines about
// past work (the five "I've built this" proofs, "each one I've already built" and "what I do for VISA today"):
// rec226noexp.wav is rec226clear2.wav with those spans removed, and the WARP voice seconds are shifted to match.
const FPS = 30;
const WARP: [number, number][] = [
  [0, 0], [12.04, 4.4], [14.56, 5.62], [19.18, 8.28], [21.04, 9.44], [27.22, 12.32], [33.58, 15.9], [38.48, 18.45], [45.8, 18.51], [51.94, 21.95], [61.66, 26.11], [73.48, 26.16], [78.86, 29.03], [85.92, 32.67], [95.08, 33.15], [103.08, 37.22], [112.16, 37.31], [118.14, 39.78], [124.08, 42.7], [130.7, 45.23], [141.16, 45.31], [146, 48.33], [148.58, 48.53], [152.8, 51.17], [155, 52.63],
];
const warp = (sec: number) => {
  for (let i = 0; i < WARP.length - 1; i++) {
    const [o0, n0] = WARP[i]; const [o1, n1] = WARP[i + 1];
    if (sec <= o1) return n0 + ((sec - o0) * (n1 - n0)) / (o1 - o0);
  }
  return sec - WARP[WARP.length - 1][0] + WARP[WARP.length - 1][1];
};
const s = (sec: number) => Math.round(warp(sec) * FPS);
export const PRODIGAL_FEATURES_NOEXP_FRAMES = s(155);
const C = { bg: '#f4f1e8', card: '#fffdf7', ink: '#1f2a44', soft: '#66708a', line: '#dcd6c6', blue: '#2f5bd3', blueBg: '#e4ebfb', amber: '#d9921c', amberBg: '#fbefd9', red: '#c4553f', redBg: '#f8e3de', green: '#2f8a5f', greenBg: '#e0f1e8' };
const FONT = "'Nunito', 'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'IBM Plex Mono', 'SF Mono', Menlo, monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 24, stiffness: 70 } });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)`, ...style }}>{children}</div>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 9], [0, 1], clamp), interpolate(f, [s(to) - 9, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 90 }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ at: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, size = 96, children, style }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, textAlign: 'center', lineHeight: 1.12, ...style }}>{children}</Rise>
);
const Sub: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.soft, textAlign: 'center', marginTop: 22 }}>{children}</Rise>
);
const Pill: React.FC<{ at: number; children: React.ReactNode; bg?: string; color?: string; size?: number }> = ({ at, children, bg = C.blueBg, color = C.blue, size = 26 }) => (
  <Rise at={at} style={{ display: 'inline-block', background: bg, color, borderRadius: 999, padding: '10px 26px', fontFamily: MONO, fontWeight: 500, fontSize: size, letterSpacing: 2 }}>{children}</Rise>
);

// Ledger paper: faint ruled lines and a red margin rule, drifting slowly.
const Ledger: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 63px, ${C.line} 63px 64px)`, backgroundPositionY: -(f * 0.25) % 64, opacity: 0.7 }}>
      <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 2, background: C.redBg }} />
    </AbsoluteFill>
  );
};

// Feature progress dots, top right: which of the five we're on.
const Progress: React.FC<{ n: number }> = ({ n }) => (
  <div style={{ position: 'absolute', top: 56, right: 80, display: 'flex', gap: 12 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} style={{ width: i === n ? 46 : 16, height: 16, borderRadius: 999, background: i <= n ? C.blue : C.line }} />
    ))}
  </div>
);

// One step of what the agent does: a numbered row that slides in on its spoken line.
const Step: React.FC<{ at: number; icon: string; children: React.ReactNode; tint?: string }> = ({ at, icon, children, tint = C.card }) => (
  <Rise at={at} style={{ display: 'flex', alignItems: 'center', gap: 22, background: tint, border: `1px solid ${C.line}`, borderRadius: 20, padding: '18px 26px', boxShadow: '0 10px 30px rgba(31,42,68,.07)' }}>
    <div style={{ fontSize: 40, width: 52, textAlign: 'center' }}>{icon}</div>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: C.ink, lineHeight: 1.25 }}>{children}</div>
  </Rise>
);

// "I've built this" proof badge: where, and the number from the resume.
const Proof: React.FC<{ at: number; where: string; what: string }> = ({ at, where, what }) => (
  <Rise at={at} style={{ display: 'flex', alignItems: 'center', gap: 22, background: C.amberBg, borderRadius: 22, padding: '20px 30px', marginTop: 8 }}>
    <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: C.amber, whiteSpace: 'nowrap' }}>I'VE BUILT THIS</div>
    <div style={{ width: 2, alignSelf: 'stretch', background: C.amber, opacity: 0.4 }} />
    <div style={{ fontFamily: FONT, fontSize: 34, color: C.ink, lineHeight: 1.3 }}><b>{where}</b> · {what}</div>
  </Rise>
);

const Feature: React.FC<{ from: number; to: number; n: number; title: string; children: React.ReactNode }> = ({ from, to, n, title, children }) => (
  <Scene from={from} to={to}>
    <Progress n={n} />
    <div style={{ width: 1500, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Rise at={from + 0.1} style={{ display: 'flex', alignItems: 'baseline', gap: 24, marginBottom: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 40, color: C.amber }}>0{n}</span>
        <span style={{ fontFamily: FONT, fontWeight: 900, fontSize: 84, color: C.ink }}>{title}</span>
      </Rise>
      {children}
    </div>
  </Scene>
);

const Score: React.FC<{ at: number; n: number; label: string; good: boolean }> = ({ at, n, label, good }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [s(at + 0.3), s(at + 2.5)], [0, n], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }));
  return (
    <Rise at={at} style={{ flex: 1, background: good ? C.greenBg : C.redBg, borderRadius: 26, padding: '26px 30px', textAlign: 'center' }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 130, lineHeight: 1, color: good ? C.green : C.red }}>{v}<span style={{ fontSize: 64, color: C.soft }}> / 12</span></div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: C.ink, marginTop: 8 }}>{label}</div>
    </Rise>
  );
};

export const ProdigalFeaturesNoExp: React.FC = () => {
  const f = useCurrentFrame();
  const musicVol = interpolate(f, [0, s(2), s(152), s(155)], [0, 0.13, 0.13, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <Ledger />

      {/* Hi, I am Unnati. I studied Prodigal, and I wrote down five features I would build. */}
      <Scene from={0} to={12.04}>
        <div>
          <Big at={0.1} size={120}>Hi, I'm <span style={{ color: C.blue }}>Unnati</span></Big>
          <Sub at={0.8}>AI engineer</Sub>
          <Big at={2.3} size={66} style={{ marginTop: 44, fontWeight: 800 }}><span style={{ color: C.amber }}>5 features</span> I'd build for Prodigal</Big>
        </div>
      </Scene>

      {/* Prodigal's agents talk to borrowers every day. Next: agents that act. */}
      <Scene from={12.04} to={27.22}>
        <div style={{ textAlign: 'center' }}>
          <Big at={12.1} size={64}>Prodigal's agents talk to borrowers every day.</Big>
          <Big at={14.6} size={96} style={{ marginTop: 36 }}>Next: agents that <span style={{ color: C.blue }}>act</span>.</Big>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 44 }}>
            <Pill at={19.2} size={30}>TAKE PAYMENTS</Pill>
            <Pill at={21.1} size={30}>READ DOCUMENTS</Pill>
            <Pill at={22.6} size={30}>FOLLOW EACH LENDER'S RULES</Pill>
          </div>
        </div>
      </Scene>

      <Feature from={27.22} to={45.8} n={1} title="Pay on the call">
        <Step at={27.6} icon="📱">Secure payment link, sent while the borrower is still on the call</Step>
        <Step at={33.7} icon="✅" tint={C.greenBg}>Payment lands → balance updated → confirmed right away</Step>
      </Feature>

      <Feature from={45.8} to={73.48} n={2} title="Read the proof">
        <Step at={46.2} icon="🧾">"I already paid" + a receipt, or a hardship letter</Step>
        <Step at={52.1} icon="🔎" tint={C.greenBg}>Agent reads it, checks the ledger, moves the account to the right next step</Step>
      </Feature>

      <Feature from={73.48} to={95.08} n={3} title="Each lender's rulebook">
        <Step at={73.9} icon="📚">Every lender has its own rules for settlements and hardship plans</Step>
        <Step at={79} icon="📌" tint={C.greenBg}>Agent looks up that lender's policy and answers with the exact rule it used</Step>
      </Feature>

      <Feature from={95.08} to={112.16} n={4} title="Launch a new lender in days">
        <Step at={95.5} icon="🧩">Ops builds and tests a new call flow on one screen</Step>
        <Step at={98.6} icon="⏱" tint={C.greenBg}>No waiting for engineers</Step>
      </Feature>

      <Feature from={112.16} to={141.16} n={5} title="Call Guard">
        <Step at={112.5} icon="🛡">Simple rules check every reply before the borrower hears it</Step>
        <div style={{ display: 'flex', gap: 22 }}>
          <Score at={118.3} n={4} label="Agent alone · 12 test calls" good={false} />
          <Score at={124.2} n={12} label="With Call Guard" good />
        </div>
      </Feature>

      {/* A Forward Deployed Engineer sits with the customer and ships what they need. */}
      <Scene from={141.16} to={155}>
        <div style={{ textAlign: 'center' }}>
          <Pill at={141.3} bg={C.amberBg} color={C.amber}>FORWARD DEPLOYED ENGINEER</Pill>
          <Big at={141.6} size={76} style={{ marginTop: 34 }}>Sit with the customer.<br />Ship what they need.</Big>
          <Rise at={148.7} style={{ marginTop: 44, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Unnati Chhabra</div>
            <div style={{ background: C.blueBg, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink }}>Demo: prodigal-demo-sand.vercel.app</div>
          </Rise>
          <Sub at={152}>Thank you!</Sub>
        </div>
      </Scene>

      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        Feature ideas from the outside · demo uses sample data · not affiliated with Prodigal
      </div>

      <Audio src={staticFile('voice/rec226noexp.wav')} />
      <Audio src={staticFile('music/prodigal-features.wav')} volume={musicVol} />
    </AbsoluteFill>
  );
};
