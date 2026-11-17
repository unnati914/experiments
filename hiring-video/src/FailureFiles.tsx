import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PhotoCues, MicAndFunny } from './FailurePhotos';

// "AI Failure Files" #001: Moffatt v. Air Canada (2024 BCCRT 149), told as a detective case file on a lo-fi desk.
// Facts from public reporting: chatbot told the passenger he could claim a bereavement fare within 90 days after travel;
// the airline argued the chatbot was a separate legal entity; the tribunal ordered C$812.02 (C$650.88 damages + interest + fees).
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const FILES1_FRAMES = s(46);

const TYPE = "'American Typewriter', 'Courier New', monospace";
const HAND = "'Bradley Hand', 'Noteworthy', cursive";
const MARK = "'Marker Felt', 'Noteworthy', cursive";
const MONO = "Menlo, monospace";
const C = { wood1: '#2a1d16', wood2: '#3a2a20', manila: '#e3c58c', manilaDark: '#c9a466', paper: '#f7f0e1', ink: '#2b2622', red: '#c43a31', note: '#ffe27a', pin: '#d6453b', hl: 'rgba(255,226,80,0.75)', green: '#2f7d4f' };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

// time warp: lets the same scene timeline follow a voiceover (holds between beats, never slower than real time)
type Warp = (frame: number) => number;
const WarpCtx = React.createContext<Warp>((x) => x);
const useF = () => React.useContext(WarpCtx)(useCurrentFrame());
const makeWarp = (anchors: [number, number][]): Warp => (frame) => {
  const tt = frame / FPS;
  for (let i = 0; i < anchors.length - 1; i++) {
    const [o0, n0] = anchors[i];
    const [o1, n1] = anchors[i + 1];
    if (tt < n1) {
      if (tt < n0) return o0 * FPS;
      const rate = Math.max(1, (o1 - o0) / (n1 - n0));
      return Math.min(o0 + (tt - n0) * rate, o1 - 0.07) * FPS;
    }
  }
  const [oL, nL] = anchors[anchors.length - 1];
  return (oL + (tt - nL)) * FPS;
};
const useP = (at: number, d = 18) => interpolate(useF(), [s(at), s(at) + d], [0, 1], { ...clamp, easing: ease });

const Drop: React.FC<{ at: number; rot?: number; from?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, rot = 0, from = 120, children, style }) => {
  const f = useF();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 15, stiffness: 120 } });
  return <div style={{ position: 'absolute', opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * from}px) rotate(${rot + (1 - p) * 6}deg)`, ...style }}>{children}</div>;
};
const Typed: React.FC<{ at: number; text: string; cps?: number; style?: React.CSSProperties }> = ({ at, text, cps = 38, style }) => {
  const f = useF();
  const nch = Math.max(0, Math.floor(((f - s(at)) / FPS) * cps));
  if (f < s(at)) return null;
  const done = nch >= text.length;
  return <span style={style}>{text.slice(0, nch)}{!done && <span style={{ opacity: f % 16 < 8 ? 1 : 0 }}>▍</span>}</span>;
};
const Stamp: React.FC<{ at: number; text: string; color?: string; rot?: number; size?: number; style?: React.CSSProperties }> = ({ at, text, color = C.red, rot = -12, size = 64, style }) => {
  const f = useF();
  if (f < s(at)) return null;
  const p = interpolate(f, [s(at), s(at) + 6], [2.2, 1], { ...clamp, easing: ease });
  return (
    <div style={{ position: 'absolute', transform: `rotate(${rot}deg) scale(${p})`, fontFamily: TYPE, fontWeight: 700, fontSize: size, letterSpacing: 6, color, border: `6px solid ${color}`, borderRadius: 10, padding: '6px 22px', opacity: 0.85, mixBlendMode: 'multiply', ...style }}>{text}</div>
  );
};
const Highlight: React.FC<{ at: number; children: React.ReactNode }> = ({ at, children }) => {
  const p = useP(at, 14);
  return <span style={{ backgroundImage: `linear-gradient(${C.hl}, ${C.hl})`, backgroundSize: `${p * 100}% 70%`, backgroundPosition: '0 85%', backgroundRepeat: 'no-repeat', padding: '0 4px' }}>{children}</span>;
};
const Underline: React.FC<{ at: number; width: number; color?: string }> = ({ at, width, color = C.red }) => {
  const p = useP(at, 16);
  return (
    <svg width={width} height={22} style={{ display: 'block' }}>
      <path d={`M 4 14 Q ${width * 0.3} 4 ${width * 0.55} 12 T ${width - 4} 10`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={width * 1.2} strokeDashoffset={(1 - p) * width * 1.2} />
    </svg>
  );
};
const Paper: React.FC<{ w: number; h: number; children: React.ReactNode; lined?: boolean; style?: React.CSSProperties }> = ({ w, h, children, lined, style }) => (
  <div style={{ width: w, height: h, background: C.paper, borderRadius: 4, boxShadow: '0 18px 40px rgba(0,0,0,0.45), 0 2px 0 rgba(0,0,0,0.1)', position: 'relative', padding: '46px 52px', boxSizing: 'border-box', backgroundImage: lined ? 'repeating-linear-gradient(transparent 0 45px, rgba(60,110,190,0.18) 45px 47px)' : undefined, ...style }}>{children}</div>
);
const Tape: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: 'absolute', width: 150, height: 44, background: 'rgba(255,250,230,0.55)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', ...style }} />
);
const Pin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: 'absolute', left: x - 14, top: y - 14, width: 28, height: 28, borderRadius: 14, background: `radial-gradient(circle at 35% 35%, #ff8a80, ${C.pin} 60%, #8a1f18)`, boxShadow: '0 4px 6px rgba(0,0,0,0.4)', zIndex: 6 }} />
);
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useF();
  if (f < s(from) || f > s(to)) return null;
  const op = Math.min(interpolate(f, [s(from), s(from) + 8], [0, 1], clamp), interpolate(f, [s(to) - 8, s(to)], [1, 0], clamp));
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

const Folder: React.FC<{ label?: boolean }> = ({ label = true }) => (
  <div style={{ width: 1180, height: 760, position: 'relative' }}>
    <div style={{ position: 'absolute', left: 60, top: -48, width: 360, height: 70, background: C.manilaDark, borderRadius: '14px 14px 0 0' }} />
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(170deg, ${C.manila}, ${C.manilaDark})`, borderRadius: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }} />
    {label && (
      <div style={{ position: 'absolute', left: 90, top: 90, right: 90 }}>
        <div style={{ fontFamily: TYPE, fontSize: 40, letterSpacing: 8, color: C.ink, opacity: 0.85 }}>AI FAILURE FILES</div>
        <div style={{ height: 3, background: C.ink, opacity: 0.5, margin: '14px 0 30px' }} />
        <div style={{ fontFamily: TYPE, fontSize: 28, color: C.ink, opacity: 0.7 }}>SUBJECT: airline support chatbot</div>
        <div style={{ fontFamily: TYPE, fontSize: 28, color: C.ink, opacity: 0.7, marginTop: 10 }}>STATUS: it made up a refund rule</div>
      </div>
    )}
  </div>
);

const Stage: React.FC = () => (
  <AbsoluteFill>
    {/* 1 · the file lands */}
    <Scene from={0} to={4.2}>
      <Drop at={0.2} rot={-3} from={600} style={{ left: 370, top: 190 }}>
        <Folder />
        <Stamp at={1.4} text="CASE #001" rot={-10} style={{ right: 90, top: 330 }} />
        <div style={{ position: 'absolute', left: 90, bottom: 110, fontFamily: HAND, fontSize: 58, color: '#1d3d8f' }}>
          <Typed at={2.0} text="the chatbot that made up a refund" cps={30} />
        </div>
      </Drop>
    </Scene>

    {/* 2 · the evidence */}
    <Scene from={4} to={15.2}>
      <Drop at={4.1} rot={-6} style={{ left: 150, top: 170 }}>
        <div style={{ background: '#fbfaf6', padding: '26px 26px 90px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 560 }}>
          <div style={{ height: 420, background: 'linear-gradient(160deg, #1e2a3a, #0f1620)', borderRadius: 2, padding: 30, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
            <div style={{ alignSelf: 'flex-end', background: '#3a7bff', color: '#fff', fontFamily: 'Avenir Next', fontSize: 26, borderRadius: '18px 18px 4px 18px', padding: '12px 18px', maxWidth: 380 }}>can I get the bereavement fare after I fly?</div>
            <div style={{ alignSelf: 'flex-start', background: '#e9edf3', color: '#111', fontFamily: 'Avenir Next', fontSize: 26, borderRadius: '18px 18px 18px 4px', padding: '12px 18px', maxWidth: 400 }}>🤖 yes! apply within 90 days of your ticket date.</div>
          </div>
          <div style={{ fontFamily: HAND, fontSize: 40, color: C.ink, marginTop: 22, textAlign: 'center' }}>exhibit A: the bot's answer</div>
        </div>
        <Tape style={{ left: 200, top: -18, transform: 'rotate(4deg)' }} />
      </Drop>
      <Drop at={4.5} rot={2} style={{ left: 800, top: 120 }}>
        <Paper w={980} h={820}>
          <div style={{ fontFamily: TYPE, fontSize: 30, letterSpacing: 4, color: C.ink, opacity: 0.6, marginBottom: 28 }}>CASE NOTES · Moffatt v. Air Canada</div>
          {[
            ['NOV 2022', 'a grieving passenger asks the airline\'s chatbot about bereavement fares.', 5.4],
            ['THE BOT', 'says he can claim the discount after travel, within 90 days.', 7.0],
            ['THE POLICY', 'no bereavement refunds after travel.', 8.6],
            ['DEFENCE', '"the chatbot is a separate legal entity."', 9.9],
          ].map(([k, v, at]) => (
            <div key={k as string} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18, marginBottom: 26, fontFamily: TYPE, fontSize: 31, color: C.ink, lineHeight: 1.35 }}>
              <span style={{ fontWeight: 700, color: C.red }}>{s(at as number) ? <Typed at={at as number} text={k as string} cps={60} /> : null}</span>
              <Typed at={(at as number) + 0.2} text={v as string} cps={46} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18, fontFamily: TYPE, fontSize: 34, color: C.ink }}>
            <span style={{ fontWeight: 700, color: C.red }}><Typed at={11.5} text="FEB 2024" cps={60} /></span>
            <span><Typed at={11.7} text="tribunal: nope. the airline pays " cps={46} />{useF() > s(12.5) && <Highlight at={12.6}><b>C$812.02</b></Highlight>}</span>
          </div>
          <Stamp at={13.4} text="LIABLE" rot={-14} size={72} style={{ right: 70, bottom: 60 }} />
        </Paper>
        <div style={{ position: 'absolute', left: -14, top: 60, width: 34, height: 110, border: '7px solid #9aa3ad', borderRadius: 20, boxSizing: 'border-box' }} />
      </Drop>
    </Scene>

    {/* 3 · diagnosis, red string */}
    <Scene from={15} to={21.2}>
      <Drop at={15.1} rot={-5} style={{ left: 170, top: 260 }}>
        <div style={{ background: '#fbfaf6', padding: '20px 20px 70px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', width: 440 }}>
          <div style={{ height: 300, background: 'linear-gradient(160deg, #1e2a3a, #0f1620)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, boxSizing: 'border-box' }}>
            <div style={{ background: '#e9edf3', fontFamily: 'Avenir Next', fontSize: 26, borderRadius: 16, padding: '12px 16px' }}>🤖 "apply within 90 days"</div>
          </div>
          <div style={{ fontFamily: HAND, fontSize: 34, textAlign: 'center', marginTop: 16, color: C.ink }}>where did this come from?</div>
        </div>
      </Drop>
      <Pin x={400} y={290} />
      <Drop at={15.7} rot={4} style={{ left: 1040, top: 210 }}>
        <div style={{ width: 640, minHeight: 560, background: C.note, boxShadow: '0 18px 36px rgba(0,0,0,0.45)', padding: '50px 50px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: MARK, fontSize: 64, color: C.red }}>DIAGNOSIS</div>
          <Underline at={16.3} width={380} />
          <div style={{ fontFamily: HAND, fontSize: 52, color: C.ink, lineHeight: 1.3, marginTop: 20 }}>
            <Typed at={16.6} text="it didn't check the policy." cps={30} /><br />
            <Typed at={18.2} text="it just made up an answer." cps={30} />
          </div>
        </div>
      </Drop>
      <Pin x={1062} y={222} />
      <RedString at={15.9} x1={400} y1={290} x2={1062} y2={222} />
    </Scene>

    {/* 4 · the eval */}
    <Scene from={21} to={33.2}>
      <Drop at={21.1} rot={-1.5} style={{ left: 170, top: 90 }}>
        <div style={{ width: 1580, height: 900, background: '#8b6b4a', borderRadius: 30, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 690, top: -30, width: 200, height: 70, background: 'linear-gradient(#d9dde2, #9aa3ad)', borderRadius: 12, boxShadow: '0 6px 10px rgba(0,0,0,0.4)' }} />
          <Paper w={1500} h={840} lined style={{ position: 'absolute', left: 40, top: 34, padding: '70px 70px' }}>
            <div style={{ fontFamily: TYPE, fontSize: 30, letterSpacing: 6, color: C.ink, opacity: 0.6 }}>A SIMPLE TEST THAT CATCHES IT</div>
            <div style={{ fontFamily: MARK, fontSize: 76, color: C.ink, marginTop: 6 }}>the policy check</div>
            <Underline at={21.9} width={560} color="#1d3d8f" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 34, marginTop: 34 }}>
              {[
                ['ASK', 'a tricky policy question: "can I get the discount after I fly?"', 22.6],
                ['GOOD ANSWER', 'uses only what the real policy says. no policy found? pass it to a human', 23.8],
                ['THE RULE', 'every policy claim must match the real policy document', 25.0],
              ].map(([h, b, at], j) => (
                <Drop key={h as string} at={at as number} rot={[-2, 1.5, -1][j]} from={60} style={{ position: 'relative' }}>
                  <div style={{ background: '#fffdf6', border: '1px solid #ddd3bf', boxShadow: '0 10px 20px rgba(0,0,0,0.18)', padding: '26px 28px', minHeight: 230, boxSizing: 'border-box' }}>
                    <div style={{ fontFamily: TYPE, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.red }}>{h}</div>
                    <div style={{ fontFamily: HAND, fontSize: 40, color: C.ink, lineHeight: 1.25, marginTop: 12 }}>{b}</div>
                  </div>
                </Drop>
              ))}
            </div>
            <Drop at={26.6} rot={0.5} from={40} style={{ position: 'relative', marginTop: 34 }}>
              <div style={{ background: '#1f2328', borderRadius: 14, padding: '24px 30px', fontFamily: MONO, fontSize: 28, lineHeight: 1.6, color: '#e6e1d6', boxShadow: '0 12px 24px rgba(0,0,0,0.3)' }}>
                <span style={{ color: '#9ccf8f' }}>claims</span> = extract_policy_claims(answer)<br />
                <span style={{ color: '#d7a6e8' }}>for</span> c <span style={{ color: '#d7a6e8' }}>in</span> claims: <span style={{ color: '#f2c46d' }}>assert</span> supported_by(c, retrieved_docs)<br />
                <span style={{ color: '#d7a6e8' }}>if not</span> retrieved_docs: <span style={{ color: '#f2c46d' }}>assert</span> escalated(answer)
              </div>
            </Drop>
            <div style={{ position: 'absolute', right: 80, top: 80, fontFamily: HAND, fontSize: 44, color: C.green, transform: 'rotate(-6deg)' }}>
              {useF() > s(29.5) && <Typed at={29.5} text="✓ would have flagged exhibit A" cps={30} />}
            </div>
          </Paper>
        </div>
      </Drop>
    </Scene>

    {/* 5 · tip of the day */}
    <Scene from={33} to={41.2}>
      <Drop at={33.1} rot={-3} from={200} style={{ left: 460, top: 150 }}>
        <div style={{ width: 1000, height: 780, background: C.note, boxShadow: '0 26px 50px rgba(0,0,0,0.5)', padding: '70px 80px', boxSizing: 'border-box', position: 'relative' }}>
          <Tape style={{ left: 420, top: -20, transform: 'rotate(-3deg)' }} />
          <div style={{ fontFamily: MARK, fontSize: 84, color: C.ink }}>💡 tip of the day</div>
          <Underline at={33.8} width={600} color="#e0892a" />
          <div style={{ fontFamily: HAND, fontSize: 60, color: C.ink, lineHeight: 1.3, marginTop: 30 }}>
            <Typed at={34.3} text="write 20 tricky questions where the honest answer is 'no' or 'I don't know'." cps={34} />
          </div>
          <div style={{ fontFamily: HAND, fontSize: 60, color: C.red, marginTop: 30 }}>
            <Typed at={38.0} text="chatbots usually fail these first." cps={30} />
          </div>
        </div>
      </Drop>
    </Scene>

    {/* 6 · case closed */}
    <Scene from={41} to={46.5}>
      <Drop at={41.1} rot={2} from={-300} style={{ left: 370, top: 170 }}>
        <Folder label={false} />
        <div style={{ position: 'absolute', left: 90, top: 90, right: 90 }}>
          <div style={{ fontFamily: TYPE, fontSize: 40, letterSpacing: 8, color: C.ink, opacity: 0.85 }}>AI FAILURE FILES · #001</div>
          <div style={{ height: 3, background: C.ink, opacity: 0.5, margin: '14px 0 40px' }} />
          <div style={{ fontFamily: HAND, fontSize: 56, color: '#1d3d8f' }}><Typed at={42.4} text="next: the chatbot that sold a car for $1" cps={30} /></div>
          <div style={{ fontFamily: TYPE, fontSize: 30, color: C.ink, marginTop: 70, lineHeight: 1.6 }}>
            filed by Unnati Chhabra · AI engineer<br />unnati-chhabra.xyz · github.com/unnati914
          </div>
        </div>
        <Stamp at={41.8} text="CASE CLOSED" rot={-12} size={80} color={C.green} style={{ right: 70, bottom: 120 }} />
      </Drop>
    </Scene>
  </AbsoluteFill>
);

const RedString: React.FC<{ at: number; x1: number; y1: number; x2: number; y2: number }> = ({ at, x1, y1, x2, y2 }) => {
  const p = useP(at, 22);
  const mx = (x1 + x2) / 2;
  const my = Math.max(y1, y2) + 140;
  const len = Math.hypot(x2 - x1, y2 - y1) * 1.3;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} stroke={C.red} strokeWidth={5} fill="none" strokeDasharray={len} strokeDashoffset={(1 - p) * len} />
    </svg>
  );
};

const Desk: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.wood2}, ${C.wood1})` }}>
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(92deg, rgba(0,0,0,0.08) 0 3px, transparent 3px 26px, rgba(255,255,255,0.03) 26px 28px, transparent 28px 61px)' }} />
      {/* coffee ring */}
      <div style={{ position: 'absolute', right: 120, bottom: 70, width: 210, height: 210, borderRadius: 105, border: '14px solid rgba(90,50,25,0.35)', filter: 'blur(1px)' }} />
      {/* lamp light + vignette */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 55% at 30% 20%, rgba(255,200,120,0.28), transparent 70%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55))' }} />
      {/* dust in the lamp light */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = (i * 173 + f * (0.3 + (i % 5) * 0.1)) % 1920;
        const y = (i * 97 + Math.sin(f / 50 + i) * 30 + f * 0.15 * ((i % 3) - 1)) % 1080;
        return <div key={i} style={{ position: 'absolute', left: x, top: (y + 1080) % 1080, width: 4, height: 4, borderRadius: 2, background: 'rgba(255,230,180,0.5)', opacity: 0.3 + 0.4 * Math.abs(Math.sin(f / 40 + i)) }} />;
      })}
    </AbsoluteFill>
  );
};

export const FailureFiles1: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <Stage />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <Audio src={staticFile('music/files1.wav')} volume={0.7} />
    </AbsoluteFill>
  );
};

// Voiceover cut: scene beats follow "New Recording 215" (old timeline second -> voice second)
const VO_WARP = makeWarp([
  [0, 0], [2.0, 3.2], [4, 5.6], [5.4, 6.0], [7.0, 15.6], [8.6, 23.8], [9.9, 30.8], [11.5, 39.3], [13.4, 44.6],
  [15, 47.2], [16.6, 49.0], [18.2, 52.4], [21, 57.6], [22.6, 63.4], [23.8, 67.1], [25.0, 75.7], [26.6, 79.1], [29.5, 81.6],
  [33, 84.5], [34.3, 86.1], [38.0, 91.2], [41, 95.2], [42.4, 100.0], [46, 107.6],
]);
export const FILES1_VO_FRAMES = s(108);
export const FailureFiles1VO: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_VO_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <WarpCtx.Provider value={VO_WARP}><Stage /></WarpCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <Audio src={staticFile('voice/files1.wav')} volume={1} />
      <Audio src={staticFile('music/files1vo.wav')} volume={0.16} />
    </AbsoluteFill>
  );
};

// Faster voiceover cut (pauses shortened + 1.15x tempo via speedvo.py)
const FAST_WARP = makeWarp([
  [0, 0], [2.0, 2.78], [4, 4.87], [5.4, 5.22], [7.0, 12.03], [8.6, 17.42], [9.9, 22.33], [11.5, 28.42], [13.4, 30.9],
  [15, 33.17], [16.6, 34.73], [18.2, 35.21], [21, 39.73], [22.6, 43.1], [23.8, 45.44], [25.0, 52.31], [26.6, 53.56], [29.5, 55.73],
  [33, 58.25], [34.3, 58.37], [38.0, 62.81], [41, 65.66], [42.4, 67.45], [46, 72.6],
]);
export const FILES1_FAST_FRAMES = s(73);
export const FailureFiles1Fast: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_FAST_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <WarpCtx.Provider value={FAST_WARP}><Stage /></WarpCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <Audio src={staticFile('voice/files1clear.wav')} volume={1} />
      <Audio src={staticFile('music/files1fast.wav')} volume={0.1} />
    </AbsoluteFill>
  );
};

// Even faster: the clear voice at another 1.15x
const FASTER_WARP = makeWarp([[0, 0.0], [2.0, 2.42], [4, 4.23], [5.4, 4.54], [7.0, 10.46], [8.6, 15.15], [9.9, 19.42], [11.5, 24.71], [13.4, 26.87], [15, 28.84], [16.6, 30.2], [18.2, 30.62], [21, 34.55], [22.6, 37.48], [23.8, 39.51], [25.0, 45.49], [26.6, 46.57], [29.5, 48.46], [33, 50.65], [34.3, 50.76], [38.0, 54.62], [41, 57.1], [42.4, 58.65], [46, 63.13]]);
export const FILES1_FASTER_FRAMES = s(64);
export const FailureFiles1Faster: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_FASTER_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <WarpCtx.Provider value={FASTER_WARP}><Stage /></WarpCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <Audio src={staticFile('voice/files1faster.wav')} volume={1} />
      <Audio src={staticFile('music/files1faster.wav')} volume={0.1} />
    </AbsoluteFill>
  );
};

// Same pace as cases 3/4: 1.45x voice with tight pauses
const FAST2_WARP = makeWarp([[0, 0.0], [2.0, 1.88], [4, 3.35], [5.4, 3.63], [7.0, 8.92], [8.6, 13.08], [9.9, 16.92], [11.5, 21.52], [13.4, 23.38], [15, 25.17], [16.6, 26.41], [18.2, 26.68], [21, 30.1], [22.6, 32.51], [23.8, 34.32], [25.0, 39.6], [26.6, 40.53], [29.5, 42.1], [33, 44.1], [34.3, 44.14], [38.0, 47.66], [41, 49.52], [42.4, 50.88], [46, 54.6]]);
export const FILES1_FAST2_FRAMES = s(55.4);
export const FailureFiles1Fast2: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_FAST2_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <WarpCtx.Provider value={FAST2_WARP}><Stage /></WarpCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <Audio src={staticFile('voice/files1c2.wav')} volume={1} />
      <Audio src={staticFile('music/files1f2.wav')} volume={0.1} />
    </AbsoluteFill>
  );
};

// Mic-voice + Funny.mp3 + real photos version of the posted fast cut
export const FailureFiles1Funny: React.FC = () => {
  const f = useCurrentFrame();
  const drift = 1 + 0.03 * (f / FILES1_FAST2_FRAMES);
  return (
    <AbsoluteFill style={{ background: '#1a120d' }}>
      <AbsoluteFill style={{ transform: `scale(${drift}) translate(${Math.sin(f / 90) * 6}px, ${Math.cos(f / 110) * 4}px)` }}>
        <Desk />
        <WarpCtx.Provider value={FAST2_WARP}><Stage /></WarpCtx.Provider>
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '4px 4px' }} />
      <PhotoCues cues={[
        { at: 4.3, dur: 3.4, img: 'c1b', tag: 'Real case: Air Canada’s chatbot, 2022', side: 'right' },
        { at: 21.8, dur: 3.4, img: 'c1a', tag: 'Tribunal ruling, Feb 2024: Air Canada pays $812 CAD', side: 'left' },
      ]} />
      <MicAndFunny voice="voice/files1mic.wav" frames={FILES1_FAST2_FRAMES} />
    </AbsoluteFill>
  );
};
