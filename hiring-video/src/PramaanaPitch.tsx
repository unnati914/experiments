import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Pitch for Pramaana Labs: "Proof Check" on Indian tax rules. Dark proof-paper theme: navy ink, amber, teal stamps.
// Every scene hangs off LINE[i], the second each script line (script-pramaana.md) starts in the voiceover.
// Until the recording exists these are estimates from word counts; swap in the transcript times and set VOICE.
const FPS = 30;
const LINE = [0.3, 5.84, 11.74, 18.02, 23.18, 27.98, 34.25, 40.16, 46.06, 50.49, 60.47, 81.19, 93.02, 101.52];
const END = 112.2;
const VOICE: string | null = null; // e.g. 'voice/rec2XXclear.wav'
const MUSIC = 'music/pramaana-synth.wav';

const s = (sec: number) => Math.round(sec * FPS);
export const PRAMAANA_PITCH_FRAMES = s(END);
const C = { bg: '#141a26', card: '#1c2433', ink: '#e9ecf3', soft: '#a3abbd', line: '#2d3747', amber: '#e3a94d', amberBg: '#3a2f1c', teal: '#5cc0aa', tealBg: '#1d3631', red: '#e5847a', redBg: '#3d2422', blue: '#8fb0ee', blueBg: '#22304a' };
const SERIF = "'Iowan Old Style', 'Palatino', Georgia, serif";
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = "'Menlo', 'SF Mono', monospace";
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Rise: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 24, stiffness: 70 } });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 22}px)`, ...style }}>{children}</div>;
};
// A rubber-stamp: drops in slightly big and rotated, settles.
const Stamp: React.FC<{ at: number; color: string; children: React.ReactNode; size?: number; style?: React.CSSProperties }> = ({ at, color, children, size = 40, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div style={{ display: 'inline-block', opacity: Math.min(p * 2, 1), transform: `scale(${2 - p}) rotate(${-6 + p * 2}deg)`, border: `4px solid ${color}`, color, borderRadius: 12,
      padding: '8px 22px', fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 6, ...style }}>{children}</div>
  );
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 10], [0, 1], clamp), interpolate(f, [s(to) - 10, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center', padding: 80 }}>{children}</AbsoluteFill>;
};
const Big: React.FC<{ at: number; size?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, size = 96, children, style }) => (
  <Rise at={at} style={{ fontFamily: SERIF, fontWeight: 700, fontSize: size, color: C.ink, textAlign: 'center', lineHeight: 1.12, ...style }}>{children}</Rise>
);
const Sub: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => (
  <Rise at={at} style={{ fontFamily: SANS, fontWeight: 500, fontSize: 40, color: C.soft, textAlign: 'center', marginTop: 22 }}>{children}</Rise>
);
// Faint graph-paper grid that drifts, plus two soft glows.
const Paper: React.FC = () => {
  const f = useCurrentFrame();
  const o = (f * 0.25) % 48;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)`, backgroundSize: '48px 48px', backgroundPosition: `${o}px ${o}px` }} />
      {/* soft glows as radial gradients (CSS blur is very slow to render) */}
      <div style={{ position: 'absolute', left: -500 + Math.sin(f / 120) * 40, top: -520, width: 1400, height: 1400, background: `radial-gradient(closest-side, ${C.tealBg}, transparent)`, opacity: 0.9 }} />
      <div style={{ position: 'absolute', right: -560, bottom: -580 + Math.cos(f / 140) * 40, width: 1500, height: 1500, background: `radial-gradient(closest-side, ${C.amberBg}, transparent)`, opacity: 0.85 }} />
    </AbsoluteFill>
  );
};
const Shot: React.FC<{ from: number; to: number; src: string; w: number; h: number; pan: number; caption: React.ReactNode; tint: string }> = ({ from, to, src, w, h, pan, caption, tint }) => {
  const f = useCurrentFrame();
  const y = interpolate(f, [s(from + 1), s(to - 1)], [0, pan], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const zoom = interpolate(f, [s(from), s(to)], [1, 1.03], clamp);
  return (
    <Scene from={from} to={to}>
      <div style={{ width: w, height: h, borderRadius: 22, overflow: 'hidden', border: `1px solid ${C.line}`, boxShadow: '0 30px 80px rgba(0,0,0,.45)', transform: `scale(${zoom})` }}>
        <Img src={staticFile(src)} style={{ width: '100%', transform: `translateY(${-y}px)` }} />
      </div>
      <Rise at={from + 0.5} style={{ marginTop: 26, background: tint, borderRadius: 999, padding: '14px 34px', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink }}>{caption}</Rise>
    </Scene>
  );
};
const Bubble: React.FC<{ at: number; who: string; color: string; bg: string; right?: boolean; children: React.ReactNode }> = ({ at, who, color, bg, right, children }) => (
  <Rise at={at} style={{ alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: 1050, background: bg, borderRadius: 26, padding: '22px 32px', marginTop: 20 }}>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 3, color }}>{who}</div>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 46, color: C.ink, marginTop: 6 }}>{children}</div>
  </Rise>
);
const Card: React.FC<{ at: number; tag: string; title: string; body: string; color: string }> = ({ at, tag, title, body, color }) => (
  <Rise at={at} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, padding: 34, width: 560, borderTop: `6px solid ${color}` }}>
    <div style={{ fontFamily: MONO, fontSize: 22, color, fontWeight: 700, letterSpacing: 2 }}>{tag}</div>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 10, lineHeight: 1.15 }}>{title}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 27, color: C.soft, marginTop: 12, lineHeight: 1.4 }}>{body}</div>
  </Rise>
);
const Role: React.FC<{ at: number; name: string; what: string; tint: string }> = ({ at, name, what, tint }) => (
  <Rise at={at} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, padding: '30px 34px', width: 500, borderTop: `6px solid ${tint}` }}>
    <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 44, color: C.ink }}>{name}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 27, color: C.soft, marginTop: 10, lineHeight: 1.35 }}>{what}</div>
  </Rise>
);
const Chip: React.FC<{ at: number; children: React.ReactNode; color?: string }> = ({ at, children, color = C.amber }) => (
  <Rise at={at} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color, background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: '10px 22px' }}>{children}</Rise>
);
const Counter: React.FC<{ from: number; to: number; at: number; dur: number }> = ({ from, to, at, dur }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [s(at), s(at + dur)], [from, to], { ...clamp, easing: (t) => 1 - (1 - t) ** 3 }));
  return <>{v.toLocaleString('en-IN')}</>;
};

export const PramaanaPitch: React.FC = () => {
  const f = useCurrentFrame();
  const L = LINE;
  const musicVol = interpolate(f, [0, s(1), s(END - 2), s(END)], [0, VOICE ? 0.14 : 0.3, VOICE ? 0.14 : 0.3, 0], clamp);
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: SANS, overflow: 'hidden' }}>
      <Paper />

      {/* 1. Hi, I'm Unnati. I'm an AI engineer. I built something small for Pramaana Labs. */}
      <Scene from={0} to={L[1]}>
        <div>
          <Big at={L[0]} size={120}>Hi, I'm <span style={{ color: C.teal }}>Unnati</span></Big>
          <Sub at={L[0] + 1}>AI engineer</Sub>
          <Big at={L[0] + 2.2} size={60} style={{ marginTop: 40 }}>I built something small for <span style={{ color: C.amber }}>Pramaana Labs</span>.</Big>
        </div>
      </Scene>

      {/* 2. Pramaana wants AI that does not make things up. Every answer comes with a proof. */}
      <Scene from={L[1]} to={L[2]}>
        <div style={{ textAlign: 'center' }}>
          <Big at={L[1]} size={84}>AI that doesn't make things up.</Big>
          <Rise at={L[1] + 2.4} style={{ marginTop: 50, display: 'inline-flex', alignItems: 'center', gap: 30, background: C.card, border: `1px solid ${C.line}`, borderRadius: 24, padding: '28px 40px' }}>
            <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 600, color: C.ink }}>Every answer comes with a proof</div>
            <Stamp at={L[1] + 3.2} color={C.teal}>PROVED</Stamp>
          </Rise>
        </div>
      </Scene>

      {/* 3. I love this idea. So I built a tiny version of it, on Indian tax rules. */}
      <Scene from={L[2]} to={L[3]}>
        <div style={{ textAlign: 'center' }}>
          <Big at={L[2] + 1} size={110}>Proof <span style={{ color: C.teal }}>Check</span></Big>
          <Sub at={L[2] + 1.8}>a tiny version, on Indian tax rules</Sub>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 44 }}>
            <Chip at={L[2] + 2.6}>80C</Chip><Chip at={L[2] + 2.85}>80D</Chip><Chip at={L[2] + 3.1}>87A rebate</Chip><Chip at={L[2] + 3.35}>tax slabs</Chip><Chip at={L[2] + 3.6} color={C.soft}>FY 2025-26</Chip>
          </div>
        </div>
      </Scene>

      {/* 4-6. Salary 12.85 lakh; chatbot says ~64,000; real answer 10,400 (marginal relief). */}
      <Scene from={L[3]} to={L[6]}>
        <div style={{ display: 'flex', flexDirection: 'column', width: 1300 }}>
          <Bubble at={L[3] + 1.4} who="YOU ASK" color={C.blue} bg={C.blueBg} right>My salary is ₹12,85,000. How much tax?</Bubble>
          <div style={{ display: 'flex', alignItems: 'center', gap: 40, alignSelf: 'flex-start' }}>
            <Bubble at={L[4]} who="A NORMAL CHATBOT" color={C.red} bg={C.redBg}>"About ₹64,000."</Bubble>
            <div style={{ marginTop: 20 }}><Stamp at={L[4] + 2.4} color={C.red} size={34}>WRONG</Stamp></div>
          </div>
          <Rise at={L[5]} style={{ alignSelf: 'flex-start', marginTop: 20, background: C.tealBg, borderRadius: 26, padding: '22px 32px', display: 'flex', alignItems: 'center', gap: 34 }}>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: C.teal }}>PROOF CHECK</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 80, color: C.ink }}>₹<Counter from={64000} to={10400} at={L[5] + 0.3} dur={1.4} /></div>
            </div>
            <Rise at={L[5] + 2.6} style={{ fontFamily: SANS, fontSize: 30, color: C.soft, maxWidth: 420, lineHeight: 1.35 }}>marginal relief caps the tax at the income above ₹12 lakh</Rise>
          </Rise>
        </div>
      </Scene>

      {/* 7. My demo checks every step against a written rule. */}
      <Shot from={L[6]} to={L[7]} src="pramaana/demo-mr-crop.png" w={1080} h={798} pan={0} tint={C.tealBg}
        caption={<>Every step checked against a written rule</>} />
      {/* 8. If one fact is missing, like your age, it asks you. */}
      <Shot from={L[7]} to={L[8]} src="pramaana/demo-ask-crop.png" w={1080} h={798} pan={0} tint={C.blueBg}
        caption={<>A fact is missing? It <b>asks</b>. It doesn't guess.</>} />

      {/* 9. And if the question is outside its rules, it says no. */}
      <Scene from={L[8]} to={L[9]}>
        <div style={{ textAlign: 'center' }}>
          <Rise at={L[8]} style={{ fontFamily: SANS, fontSize: 40, color: C.soft }}>"How much 80C for FY 2026-27?"</Rise>
          <div style={{ marginTop: 36 }}><Stamp at={L[8] + 1.2} color={C.amber} size={70}>REFUSED</Stamp></div>
          <Sub at={L[8] + 2}>Those rules aren't loaded. No guessing.</Sub>
        </div>
      </Scene>

      {/* 10. Sixteen test cases ... All sixteen pass. */}
      <Scene from={L[9]} to={L[10]}>
        <div style={{ textAlign: 'center' }}>
          <Big at={L[9]} size={76}><Counter from={0} to={16} at={L[9]} dur={1} /> test cases</Big>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', marginTop: 40, maxWidth: 1400 }}>
            {['limits', 'exceptions', 'rules that clash', 'missing facts', 'broken input', 'a document that tricks the AI'].map((t, i) => (
              <Chip key={t} at={L[9] + 1.6 + i * 0.85} color={i === 5 ? C.red : C.amber}>{t}</Chip>
            ))}
          </div>
          <div style={{ marginTop: 50 }}><Stamp at={L[10] - 2.4} color={C.teal} size={56}>16 / 16 PASS</Stamp></div>
        </div>
      </Scene>

      {/* 11. Four underrated features to build on top; each card lands as it's named (fractions of the line). */}
      <Scene from={L[10]} to={L[11]}>
        <div>
          <Big at={L[10]} size={64}>4 underrated features to build on top</Big>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 40 }}>
            {[
              [0.17, '01 · ASK, DON\'T REFUSE', C.blue, 'One question, not a "no"', 'If a missing fact changes the answer, ask for just that fact.'],
              [0.40, '02 · LAW-CHANGE REPORT', C.amber, 'See which answers change', 'When the Budget changes a rule, re-run saved questions on both versions.'],
              [0.63, '03 · BOUNDARY TESTS', C.red, 'Tests written from the rules', 'Every limit tested at −1, exact and +1, plus each exception.'],
              [0.79, '04 · PROOF RECEIPT', C.teal, 'A proof a CA can sign', 'Every step in plain English, linked to the exact rule text.'],
            ].map(([k, tag, color, title, body]) => (
              <Rise key={tag as string} at={L[10] + (k as number) * (L[11] - L[10])} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 22, padding: '26px 32px', width: 720, borderLeft: `8px solid ${color}` }}>
                <div style={{ fontFamily: MONO, fontSize: 21, color: color as string, fontWeight: 700, letterSpacing: 2 }}>{tag}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: C.ink, marginTop: 8 }}>{title}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 25, color: C.soft, marginTop: 8, lineHeight: 1.35 }}>{body}</div>
              </Rise>
            ))}
          </div>
        </div>
      </Scene>

      {/* 12. The hard part: a proof is only as good as the rule. */}
      <Scene from={L[11]} to={L[12]}>
        <div style={{ display: 'flex', gap: 0, borderRadius: 26, overflow: 'hidden', border: `1px solid ${C.line}` }}>
          <Rise at={L[11]} style={{ background: C.redBg, padding: 50, width: 700 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.red, letterSpacing: 3, fontWeight: 700 }}>THE HARD PART</div>
            <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 14, lineHeight: 1.15 }}>"Proved", but the rule was written wrong</div>
          </Rise>
          <Rise at={L[11] + 0.5 * (L[12] - L[11])} style={{ background: C.tealBg, padding: 50, width: 700 }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.teal, letterSpacing: 3, fontWeight: 700 }}>HOW I'D SOLVE IT</div>
            <div style={{ fontFamily: SERIF, fontSize: 56, fontWeight: 700, color: C.ink, marginTop: 14, lineHeight: 1.15 }}>Write each rule two ways. Send any mismatch to a tax expert.</div>
          </Rise>
        </div>
      </Scene>

      {/* 13. Before this ... */}
      <Scene from={L[12]} to={L[13]}>
        <div>
          <Big at={L[12]} size={60}>Before this</Big>
          <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
            <Role at={L[12] + 1.4} name="Zomato" what="Eval framework for GenAI bots · Parchi Orders for HyperPure (~70% of GMV)" tint={C.red} />
            <Role at={L[12] + 3.6} name="Paysecure" what="Payment integrations for 40 merchants" tint={C.blue} />
            <Role at={L[12] + 5.4} name="Grid Dynamics" what="GenAI agents for VISA" tint={C.amber} />
          </div>
        </div>
      </Scene>

      {/* 14. I would love to help Pramaana make AI answers you can trust. */}
      <Scene from={L[13]} to={END}>
        <div style={{ textAlign: 'center' }}>
          <Rise at={L[13]} style={{ display: 'inline-block', fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: C.amber, border: `2px solid ${C.amber}`, borderRadius: 12, padding: '10px 22px', marginBottom: 34 }}>APPLYING · SOFTWARE ENGINEER, PRODUCT</Rise>
          <Big at={L[13] + 3.2} size={88}>AI answers you can <span style={{ color: C.teal }}>trust</span>.</Big>
          <Rise at={L[13] + 4.4} style={{ marginTop: 44, display: 'flex', gap: 18, justifyContent: 'center' }}>
            <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 999, padding: '14px 30px', fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.ink }}>Unnati Chhabra · AI engineer</div>
            <div style={{ background: C.tealBg, borderRadius: 999, padding: '14px 30px', fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink }}>unnati-chhabra.xyz</div>
          </Rise>
          <Sub at={L[13] + 5.6}>Demo link below · Thank you!</Sub>
        </div>
      </Scene>

      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 22, color: C.soft, opacity: 0.85 }}>
        A demo I built on my own · FY 2025-26 rules · not tax advice · not affiliated with Pramaana Labs
      </div>

      {VOICE && <Audio src={staticFile(VOICE)} />}
      <Audio src={staticFile(MUSIC)} volume={musicVol} />
    </AbsoluteFill>
  );
};
