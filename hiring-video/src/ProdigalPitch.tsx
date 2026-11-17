import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import CASES from './prodigal-cases.json';

// Demo + features pitch for Prodigal (FDE role): ledger paper, ink blue and amber, a ruled-line background.
// Scene times are written on the silent 78 s timeline (script-prodigal.md); WARP maps them onto the
// recording-225 voiceover (public/voice/rec225clear.wav, 1.45x) by the start of each spoken line: [video second, voice second].
const FPS = 30;
const WARP: [number, number][] = [
  [0, 0], [5, 2.21], [11, 7.28], [16, 15.05], [20.5, 20.33], [25, 25.06], [29.5, 28.59], [34, 33.44], [37, 35.64],
  [41.5, 39.21], [46, 41.34], [50.5, 44.2], [54, 48.43], [55.4, 50.15], [57.4, 52.28], [59.4, 54.48], [61.4, 56.5],
  [63.4, 59.77], [66, 62.94], [66.8, 63.88], [67.8, 65.54], [68.8, 68.51], [72, 70.07], [78, 77.6],
];
const warp = (sec: number) => {
  for (let i = 0; i < WARP.length - 1; i++) {
    const [o0, n0] = WARP[i]; const [o1, n1] = WARP[i + 1];
    if (sec <= o1) return n0 + ((sec - o0) * (n1 - n0)) / (o1 - o0);
  }
  return sec - WARP[WARP.length - 1][0] + WARP[WARP.length - 1][1];
};
const s = (sec: number) => Math.round(warp(sec) * FPS);
export const PRODIGAL_PITCH_FRAMES = s(78);
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
  const op = Math.min(interpolate(f, [s(from), s(from) + 10], [0, 1], clamp), interpolate(f, [s(to) - 10, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 90 }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ at: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, size = 96, children, style }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: C.ink, textAlign: 'center', lineHeight: 1.12, ...style }}>{children}</Rise>
);
const Sub: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Rise at={at} style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: C.soft, textAlign: 'center', marginTop: 22 }}>{children}</Rise>
);
const Tag: React.FC<{ at: number; children: React.ReactNode; bg?: string; color?: string }> = ({ at, children, bg = C.blueBg, color = C.blue }) => (
  <Rise at={at} style={{ display: 'inline-block', background: bg, color, borderRadius: 999, padding: '10px 26px', fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: 2 }}>{children}</Rise>
);

// Ledger paper: faint ruled lines and a red margin rule, drifting slowly.
const Ledger: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 63px, ${C.line} 63px 64px)`,
      backgroundPositionY: -(f * 0.25) % 64, opacity: 0.7,
    }}>
      <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 2, background: C.redBg }} />
    </AbsoluteFill>
  );
};

// One feature: a checkbox that ticks itself, then the line.
const Feature: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const tick = spring({ frame: f - s(at + 0.5), fps, config: { damping: 14, stiffness: 160 } });
  return (
    <Rise at={at} style={{ display: 'flex', alignItems: 'center', gap: 28, width: 1300 }}>
      <div style={{ width: 62, height: 62, borderRadius: 16, border: `4px solid ${C.blue}`, background: tick > 0.5 ? C.blue : C.card, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 40, fontWeight: 900, transform: `scale(${tick})` }}>✓</span>
      </div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 46, color: C.ink, lineHeight: 1.2 }}>{children}</div>
    </Rise>
  );
};

// One demo call from the Call Guard page: rule, borrower line, agent reply, verdict.
type Case = (typeof CASES)[number];
const DemoCall: React.FC<{ from: number; to: number; c: Case; guard: boolean }> = ({ from, to, c, guard }) => {
  const ok = guard || c.alonePass;
  return (
    <Scene from={from} to={to}>
      <div style={{ width: 1500, background: C.card, border: `1px solid ${C.line}`, borderRadius: 30, padding: '36px 44px', boxShadow: '0 20px 60px rgba(31,42,68,.10)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: MONO, fontSize: 30, color: C.amber }}>{String(c.id).padStart(2, '0')}</div>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: C.ink, flex: 1 }}>{c.title}</div>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: guard ? C.blue : C.soft, background: guard ? C.blueBg : C.bg, borderRadius: 999, padding: '8px 20px' }}>{guard ? 'AGENT + CALL GUARD' : 'AGENT ALONE'}</div>
        </div>
        <div style={{ background: C.amberBg, borderRadius: 16, padding: '14px 22px', fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.ink }}>
          <span style={{ fontFamily: MONO, fontSize: 20, color: C.amber, letterSpacing: 2, marginRight: 14 }}>RULE</span>{c.rule}
        </div>
        <Rise at={from + 0.4} style={{ alignSelf: 'flex-start', background: C.blueBg, borderRadius: 20, padding: '18px 26px', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink, maxWidth: 1150 }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.soft, marginBottom: 6 }}>BORROWER</div>{c.borrower}
        </Rise>
        <Rise at={from + 1.2} style={{ alignSelf: 'flex-end', background: ok ? C.greenBg : C.redBg, borderRadius: 20, padding: '18px 26px', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: C.ink, maxWidth: 1150 }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: C.soft, marginBottom: 6 }}>AGENT</div>{guard ? c.guard : c.alone}
        </Rise>
        <Rise at={from + 2} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 28, letterSpacing: 2, borderRadius: 999, padding: '8px 22px', background: ok ? C.greenBg : C.redBg, color: ok ? C.green : C.red }}>{ok ? 'PASS' : 'FAIL'}</div>
          {guard && <div style={{ fontFamily: MONO, fontSize: 24, color: C.green }}>✓ {c.guardNote}</div>}
        </Rise>
      </div>
    </Scene>
  );
};

// Score card: counts up to the pass count.
const Score: React.FC<{ from: number; to: number; n: number; label: string; good: boolean }> = ({ from, to, n, label, good }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [s(from + 0.3), s(from + 1.5)], [0, n], { ...clamp, easing: (x) => 1 - (1 - x) ** 3 }));
  return (
    <Scene from={from} to={to}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 220, color: good ? C.green : C.red, lineHeight: 1 }}>{v}<span style={{ fontSize: 110, color: C.soft }}> / 12</span></div>
        <Sub at={from + 0.6}>{label}</Sub>
      </div>
    </Scene>
  );
};

const byId = (id: number) => CASES.find((c) => c.id === id)!;

const Role: React.FC<{ at: number; name: string; what: string; tint: string }> = ({ at, name, what, tint }) => (
  <Rise at={at} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 26, padding: '30px 34px', width: 500, boxShadow: '0 12px 36px rgba(31,42,68,.08)', borderTop: `8px solid ${tint}` }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.ink }}>{name}</div>
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, color: C.soft, marginTop: 10, lineHeight: 1.35 }}>{what}</div>
  </Rise>
);

export const ProdigalPitch: React.FC = () => {
  const f = useCurrentFrame();
  const musicVol = interpolate(f, [0, s(1), s(76), s(78)], [0, 0.14, 0.14, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: 'hidden' }}>
      <Ledger />

      {/* Hi, I am Unnati. I am an AI engineer. I made this for Prodigal. */}
      <Scene from={0} to={5}>
        <div>
          <Big at={0.1} size={124}>Hi, I'm <span style={{ color: C.blue }}>Unnati</span></Big>
          <Sub at={0.8}>AI engineer · evals and agent reliability</Sub>
          <Big at={1.8} size={60} style={{ marginTop: 44, fontWeight: 700 }}>I made this for <span style={{ color: C.amber }}>Prodigal</span>.</Big>
        </div>
      </Scene>

      {/* Prodigal puts AI agents on collection calls. One wrong sentence can become a compliance problem. */}
      <Scene from={5} to={11}>
        <div style={{ textAlign: 'center' }}>
          <Tag at={5.1}>PRODIGAL · AI AGENTS ON COLLECTION CALLS</Tag>
          <Big at={5.9} size={84} style={{ marginTop: 40 }}>In collections, <span style={{ color: C.red }}>one wrong sentence</span><br />can become a compliance problem.</Big>
        </div>
      </Scene>

      {/* So I built Call Guard: a thin layer of simple rules that checks every reply. */}
      <Scene from={11} to={16}>
        <div style={{ textAlign: 'center' }}>
          <Big at={11.1} size={112}>So I built <span style={{ color: C.blue }}>Call Guard</span></Big>
          <Sub at={11.9}>Simple rules that check every reply, before the borrower hears it.</Sub>
          <Rise at={13} style={{ marginTop: 34 }}><Tag at={13}>DEMO · 12 TEST CALLS · SAMPLE DATA</Tag></Rise>
        </div>
      </Scene>

      {/* Agent alone: four fails */}
      <DemoCall from={16} to={20.5} c={byId(1)} guard={false} />
      <DemoCall from={20.5} to={25} c={byId(3)} guard={false} />
      <DemoCall from={25} to={29.5} c={byId(4)} guard={false} />
      <DemoCall from={29.5} to={34} c={byId(11)} guard={false} />
      <Score from={34} to={37} n={CASES.filter((c) => c.alonePass).length} label="Agent alone" good={false} />

      {/* With Call Guard: the same calls, fixed */}
      <DemoCall from={37} to={41.5} c={byId(1)} guard />
      <DemoCall from={41.5} to={46} c={byId(3)} guard />
      <DemoCall from={46} to={50.5} c={byId(4)} guard />
      <Score from={50.5} to={54} n={12} label="With Call Guard · simple rules, no extra AI cost" good />

      {/* What you get, free */}
      <Scene from={54} to={66}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 26 }}>
          <Rise at={54.1} style={{ alignSelf: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, color: C.ink }}>What you get, </span>
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, color: C.amber }}>free</span>
          </Rise>
          <Feature at={55.4}>10–12 test cases for your agent</Feature>
          <Feature at={57.4}>A clear pass / fail rule for every case</Feature>
          <Feature at={59.4}>A run on your agent in <b>48 hours</b></Feature>
          <Feature at={61.4}>A short report: what failed, why, how to fix it</Feature>
          <Feature at={63.4}>A script to re-run every test after each change</Feature>
        </div>
      </Scene>

      {/* Before this: Zomato, Paysecure, Grid Dynamics */}
      <Scene from={66} to={72}>
        <div>
          <Big at={66.1} size={60}>Before this</Big>
          <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
            <Role at={66.8} name="Zomato" what="Eval framework for GenAI bots used by every app user" tint={C.red} />
            <Role at={67.8} name="Paysecure" what="Payment integrations for 40 merchants" tint={C.amber} />
            <Role at={68.8} name="Grid Dynamics" what="GenAI agents for VISA, built with the client" tint={C.blue} />
          </div>
        </div>
      </Scene>

      {/* I would love to join Prodigal as a Forward Deployed Engineer. Thank you! */}
      <Scene from={72} to={78}>
        <div style={{ textAlign: 'center' }}>
          <Tag at={72.1} bg={C.amberBg} color={C.amber}>FORWARD DEPLOYED ENGINEER</Tag>
          <Big at={72.7} size={84} style={{ marginTop: 36 }}>Let's put your agents live,<br /><span style={{ color: C.blue }}>and keep them right</span>.</Big>
          <Rise at={73.9} style={{ marginTop: 44, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: C.ink }}>Unnati Chhabra</div>
            <div style={{ background: C.blueBg, borderRadius: 999, padding: '14px 30px', fontFamily: FONT, fontWeight: 700, fontSize: 34, color: C.ink }}>unnati-chhabra.xyz</div>
          </Rise>
          <Sub at={75}>Thank you!</Sub>
        </div>
      </Scene>

      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        A pitch I made on my own · sample data · not a run on Prodigal's agents · not affiliated with Prodigal
      </div>

      <Audio src={staticFile('voice/rec225clear.wav')} />
      <Audio src={staticFile('music/prodigal.wav')} volume={musicVol} />
    </AbsoluteFill>
  );
};
