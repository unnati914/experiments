import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { WarpCtx, linearWarp, useWarpedFrame } from './timewarp';
import { PhotoCues, MicAndFunny } from './FailurePhotos';
const useCurrentFrame = useWarpedFrame;

// "AI Failure Files" #004: an AI hiring chatbot platform whose team login was 123456 / 123456 (July 2025).
// Researchers also found a bug that exposed other applicants' chats: up to 64 million chat records, not all with personal
// details. Fixed quickly; the company said there was no sign a bad actor used it. Company left unnamed on screen (as in the VO).
// Theme: paper craft / cut-outs. Timed to files4clear.wav.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const FILES4_FRAMES = s(63);

const HAND = "'Bradley Hand', 'Noteworthy', cursive";
const MARK = "'Marker Felt', 'Noteworthy', cursive";
const TYPE = "'American Typewriter', 'Courier New', monospace";
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const P = { kraft: '#c9a77a', kraft2: '#b38d5e', cream: '#fbf6ea', ink: '#2a2420', red: '#d64545', green: '#3f8f5a', blue: '#3f6fb3', yellow: '#f5cf4b', pink: '#f2a7b5', mint: '#a9dcc4' };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const shadow = '0 10px 0 rgba(60,40,20,0.25), 0 16px 30px rgba(60,40,20,0.25)';

// paper cut-outs land with a little wobble, like stop-motion
const Cut: React.FC<{ at: number; children: React.ReactNode; rot?: number; style?: React.CSSProperties }> = ({ at, children, rot = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < s(at)) return null;
  const p = spring({ frame: f - s(at), fps, config: { damping: 9, stiffness: 180 } });
  const jitter = Math.floor(f / 4) % 2 ? 0.4 : -0.4; // stop-motion boil
  return <div style={{ transform: `translateY(${(1 - p) * -50}px) rotate(${rot + jitter + (1 - p) * 8}deg) scale(${0.85 + 0.15 * p})`, ...style }}>{children}</div>;
};
const Paper: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties; torn?: boolean }> = ({ children, bg = P.cream, style, torn }) => (
  <div style={{ background: bg, boxShadow: shadow, padding: '26px 32px', position: 'relative', clipPath: torn ? 'polygon(0 3%, 6% 0, 14% 2%, 25% 0, 37% 3%, 50% 0, 62% 2%, 75% 0, 88% 3%, 100% 0, 100% 97%, 92% 100%, 80% 98%, 66% 100%, 52% 97%, 38% 100%, 24% 98%, 10% 100%, 0 98%)' : undefined, ...style }}>{children}</div>
);
const Washi: React.FC<{ color?: string; style: React.CSSProperties }> = ({ color = P.pink, style }) => (
  <div style={{ position: 'absolute', width: 150, height: 40, background: `repeating-linear-gradient(45deg, ${color} 0 12px, rgba(255,255,255,0.45) 12px 20px)`, opacity: 0.85, zIndex: 3, ...style }} />
);
const Stamp: React.FC<{ at: number; text: string; color: string; rot?: number; size?: number; style?: React.CSSProperties }> = ({ at, text, color, rot = -10, size = 64, style }) => {
  const f = useCurrentFrame();
  if (f < s(at)) return null;
  const p = interpolate(f, [s(at), s(at) + 6], [2, 1], { ...clamp, easing: ease });
  return <div style={{ position: 'absolute', transform: `rotate(${rot}deg) scale(${p})`, fontFamily: TYPE, fontWeight: 700, fontSize: size, color, border: `6px solid ${color}`, borderRadius: 10, padding: '4px 20px', mixBlendMode: 'multiply', whiteSpace: 'nowrap', zIndex: 4, ...style }}>{text}</div>;
};
const Typed: React.FC<{ at: number; text: string; cps?: number }> = ({ at, text, cps = 14 }) => {
  const f = useCurrentFrame();
  if (f < s(at)) return null;
  return <>{text.slice(0, Math.floor(((f - s(at)) / FPS) * cps))}</>;
};
// ransom-note letters cut from different papers
const LETTER_STYLES: React.CSSProperties[] = [
  { background: P.red, color: '#fff', fontFamily: SANS, fontWeight: 900 },
  { background: '#fff', color: P.ink, fontFamily: TYPE },
  { background: P.yellow, color: P.ink, fontFamily: MARK },
  { background: P.ink, color: P.yellow, fontFamily: SANS, fontWeight: 900 },
  { background: P.mint, color: P.ink, fontFamily: 'Georgia, serif', fontStyle: 'italic' },
  { background: P.blue, color: '#fff', fontFamily: MARK },
];
const Ransom: React.FC<{ at: number; text: string; size: number }> = ({ at, text, size }) => (
  <div style={{ display: 'flex', gap: size * 0.12, justifyContent: 'center' }}>
    {text.split('').map((c, i) => (
      <Cut key={i} at={at + i * 0.12} rot={[-6, 4, -3, 7, -5, 3][i % 6]}>
        <span style={{ display: 'inline-block', fontSize: size, lineHeight: 1, padding: `${size * 0.08}px ${size * 0.16}px`, boxShadow: shadow, ...LETTER_STYLES[i % LETTER_STYLES.length] }}>{c}</span>
      </Cut>
    ))}
  </div>
);
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: op, alignItems: 'center', justifyContent: 'center' }}>{children}</AbsoluteFill>;
};
const Label: React.FC<{ children: React.ReactNode; bg?: string; size?: number }> = ({ children, bg = P.cream, size = 40 }) => (
  <span style={{ display: 'inline-block', background: bg, boxShadow: shadow, padding: '10px 22px', fontFamily: HAND, fontSize: size, color: P.ink }}>{children}</span>
);

const Stage: React.FC = () => {
  const f = useCurrentFrame();
  const chats = Math.round(interpolate(f, [s(24.33), s(25.6)], [0, 64], { ...clamp, easing: ease }));
  return (
    <AbsoluteFill>
      {/* 1 · title 0 → 5.47 */}
      <Scene from={0} to={5.47}>
        <div style={{ display: 'grid', gap: 40, justifyItems: 'center' }}>
          <Cut at={0.1} rot={-2}><Paper torn><div style={{ fontFamily: TYPE, fontSize: 36, letterSpacing: 8, color: P.ink }}>AI FAILURE FILES · CASE #004</div></Paper></Cut>
          <Cut at={0.6} rot={1}><div style={{ fontFamily: HAND, fontSize: 70, color: P.ink }}>the password was…</div></Cut>
          <Ransom at={2.58} text="123456" size={150} />
        </div>
      </Scene>

      {/* 2 · the hiring bot 5.47 → 13.83 */}
      <Scene from={5.47} to={13.83}>
        <div style={{ position: 'relative', width: 1500, height: 760 }}>
          <Cut at={5.5} rot={-4} style={{ position: 'absolute', left: 0, top: 0 }}><Label bg={P.yellow}>📅 July 2025</Label></Cut>
          <Cut at={5.9} rot={1} style={{ position: 'absolute', left: 120, top: 120 }}>
            <Paper bg="#fff" style={{ width: 620, height: 520 }}>
              <Washi style={{ left: 230, top: -18, transform: 'rotate(-4deg)' }} />
              <div style={{ height: 70, background: `repeating-linear-gradient(90deg, ${P.red} 0 60px, #fff 60px 120px)`, margin: '-26px -32px 20px' }} />
              <div style={{ fontFamily: MARK, fontSize: 64, color: P.ink, textAlign: 'center' }}>🍔 big food co.</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 56, color: P.red, textAlign: 'center', marginTop: 30, border: `5px dashed ${P.red}`, padding: 12 }}>NOW HIRING</div>
              <div style={{ fontFamily: HAND, fontSize: 36, color: P.ink, textAlign: 'center', marginTop: 24 }}>apply with our AI chatbot</div>
            </Paper>
          </Cut>
          <Cut at={9.92} rot={3} style={{ position: 'absolute', right: 40, top: 140 }}>
            <Paper bg={P.mint} style={{ width: 600, borderRadius: 30 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: P.ink }}>🤖 Hi! Want a job? Chat with me.</div>
            </Paper>
          </Cut>
          {[0, 1, 2, 3].map((i) => (
            <Cut key={i} at={10.4 + i * 0.25} rot={[-3, 2, -2, 4][i]} style={{ position: 'absolute', right: 470 - i * 130, top: 420 }}>
              <div style={{ fontSize: 110, filter: 'drop-shadow(0 8px 0 rgba(60,40,20,0.25))' }}>{['🧑', '👩', '🧔', '👱'][i]}</div>
            </Cut>
          ))}
        </div>
      </Scene>

      {/* 3 · the login 13.83 → 21.04 */}
      <Scene from={13.83} to={21.04}>
        <div style={{ position: 'relative', width: 1500, height: 760 }}>
          <Cut at={11.39 > 13.83 ? 11.39 : 13.9} rot={-6} style={{ position: 'absolute', left: 40, top: 160 }}>
            <div style={{ fontSize: 160, filter: 'drop-shadow(0 10px 0 rgba(60,40,20,0.25))' }}>🕵️🔍</div>
            <div style={{ marginTop: 10 }}><Label>two safety experts</Label></div>
          </Cut>
          <Cut at={14.2} rot={2} style={{ position: 'absolute', right: 60, top: 60 }}>
            <Paper bg="#fff" style={{ width: 820 }}>
              <Washi color={P.mint} style={{ left: 320, top: -18, transform: 'rotate(3deg)' }} />
              <div style={{ fontFamily: TYPE, fontSize: 34, color: P.ink, letterSpacing: 4 }}>TEAM LOGIN</div>
              {[['name', 15.85], ['password', 18.25]].map(([k, at]) => (
                <div key={k as string} style={{ marginTop: 26 }}>
                  <div style={{ fontFamily: HAND, fontSize: 34, color: P.ink }}>{k}</div>
                  <div style={{ border: `4px solid ${P.ink}`, padding: '12px 18px', fontFamily: TYPE, fontSize: 56, color: P.ink, minHeight: 70, background: '#fffdf6' }}><Typed at={at as number} text="123456" /></div>
                </div>
              ))}
              <div style={{ marginTop: 26, display: 'inline-block', background: P.blue, color: '#fff', fontFamily: SANS, fontWeight: 900, fontSize: 40, padding: '10px 40px', boxShadow: shadow }}>LOG IN</div>
            </Paper>
          </Cut>
          <Stamp at={20.06} text="IT WORKED 😬" color={P.red} rot={-8} size={72} style={{ right: 140, bottom: 40 }} />
        </div>
      </Scene>

      {/* 4 · the chats 21.04 → 31.72 */}
      <Scene from={21.04} to={31.72}>
        <div style={{ position: 'relative', width: 1600, height: 800 }}>
          <Cut at={21.1} rot={-3} style={{ position: 'absolute', left: 0, top: 0 }}><Label bg={P.pink}>🐛 one more bug</Label></Cut>
          {Array.from({ length: 9 }, (_, i) => (
            <Cut key={i} at={22.13 + i * 0.18} rot={(i % 2 ? 1 : -1) * (3 + (i % 3) * 3)} style={{ position: 'absolute', left: 80 + (i % 3) * 230, top: 120 + Math.floor(i / 3) * 190 }}>
              <Paper bg={[P.cream, '#fff', P.mint][i % 3]} style={{ width: 220, padding: '16px 18px' }}>
                <div style={{ fontFamily: TYPE, fontSize: 18, color: '#7a6f63' }}>applicant chat #{1000 + i * 137}</div>
                <div style={{ height: 10, background: '#ddd2c0', marginTop: 12, width: '90%' }} />
                <div style={{ height: 10, background: '#ddd2c0', marginTop: 10, width: '70%' }} />
              </Paper>
            </Cut>
          ))}
          <Cut at={24.33} rot={2} style={{ position: 'absolute', right: 20, top: 90 }}>
            <Paper bg={P.yellow} style={{ width: 640, textAlign: 'center' }}>
              <div style={{ fontFamily: HAND, fontSize: 42, color: P.ink }}>other people's chats, up to</div>
              <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 120, color: P.red, lineHeight: 1.05 }}>{chats} million</div>
            </Paper>
          </Cut>
          <Cut at={26.01} rot={-2} style={{ position: 'absolute', right: 60, top: 480 }}><Label size={36}>not all had personal details. but many did.</Label></Cut>
          <Cut at={28.58} rot={1} style={{ position: 'absolute', right: 60, bottom: 40 }}>
            <Paper bg={P.green} style={{ color: '#fff' }}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40 }}>✓ fixed fast. "no bad person used it."</div></Paper>
          </Cut>
        </div>
      </Scene>

      {/* 5 · what went wrong 31.72 → 40.99 */}
      <Scene from={31.72} to={40.99}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 70, width: 1600, alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 30, justifyItems: 'start' }}>
            <Cut at={31.8} rot={-2}><Paper torn bg="#fff"><div style={{ fontFamily: MARK, fontSize: 76, color: P.ink }}>what went wrong?</div></Paper></Cut>
            <Cut at={32.86} rot={1}><Label bg={P.mint} size={46}>🤖 the AI was not the problem</Label></Cut>
            <Cut at={34.83} rot={-1}><Label bg={P.pink} size={46}>🏚️ the website around it was weak</Label></Cut>
          </div>
          <div style={{ display: 'grid', gap: 26 }}>
            {[['🔑 an easy password', 36.33, P.yellow], ['👻 an old account no one used', 38.29, P.cream], ['🚪 no check on who can see what', 38.93, '#fff']].map(([t, at, bg], i) => (
              <Cut key={t as string} at={at as number} rot={[3, -2, 2][i]}>
                <Paper bg={bg as string}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: P.ink }}>{t}</div></Paper>
              </Cut>
            ))}
          </div>
        </div>
      </Scene>

      {/* 6 · the stranger test 40.99 → 55.14 */}
      <Scene from={40.99} to={55.14}>
        <div style={{ position: 'relative', width: 1640, height: 860 }}>
          <Cut at={41.0} rot={-1} style={{ position: 'absolute', left: 0, top: 0 }}><Label bg={P.yellow} size={36}>a simple test</Label></Cut>
          <Cut at={42.14} rot={1} style={{ position: 'absolute', left: 0, top: 80 }}><div style={{ fontFamily: MARK, fontSize: 96, color: P.ink }}>the stranger test</div></Cut>
          <Cut at={43.86} rot={-3} style={{ position: 'absolute', left: 30, top: 270 }}>
            <Paper bg={P.mint} style={{ width: 330, textAlign: 'center' }}><div style={{ fontSize: 90 }}>🧑</div><div style={{ fontFamily: HAND, fontSize: 36 }}>log in as one person</div></Paper>
          </Cut>
          {f >= s(45.41) && (
            <svg width={460} height={200} style={{ position: 'absolute', left: 380, top: 330 }}>
              <path d="M 10 120 Q 220 -10 420 110" stroke={P.ink} strokeWidth={6} fill="none" strokeDasharray="18 14" strokeDashoffset={-f} />
              <path d="M 400 90 L 430 112 L 398 130" stroke={P.ink} strokeWidth={6} fill="none" />
            </svg>
          )}
          <Cut at={45.41} rot={3} style={{ position: 'absolute', left: 820, top: 260 }}>
            <Paper bg="#fff" style={{ width: 360, textAlign: 'center' }}><div style={{ fontSize: 90 }}>📁</div><div style={{ fontFamily: HAND, fontSize: 36 }}>someone else's chat</div></Paper>
          </Cut>
          <Stamp at={47.54} text="NO ✋ every time" color={P.red} rot={-9} size={60} style={{ left: 640, top: 600 }} />
          <Cut at={49.15} rot={-2} style={{ position: 'absolute', right: 0, top: 230 }}>
            <Paper bg={P.cream} style={{ width: 430 }}>
              <Washi color={P.yellow} style={{ left: 130, top: -18 }} />
              <div style={{ fontFamily: TYPE, fontSize: 28, color: P.ink, letterSpacing: 3 }}>SIMPLE RULES</div>
              {[['strong passwords', 50.32], ['a second step to log in', 51.56], ['turn off old accounts', 53.07]].map(([t, at]) => (
                <div key={t as string} style={{ fontFamily: HAND, fontSize: 38, color: P.ink, marginTop: 14 }}>{f >= s(at as number) ? '☑' : '☐'} {t}</div>
              ))}
            </Paper>
          </Cut>
        </div>
      </Scene>

      {/* 7 · tip 55.14 → 58.59 */}
      <Scene from={55.14} to={58.59}>
        <Cut at={55.2} rot={-2}>
          <Paper bg="#fff" style={{ width: 1100, padding: '50px 60px', backgroundImage: 'repeating-linear-gradient(transparent 0 52px, rgba(63,111,179,0.25) 52px 54px)' }}>
            <Washi style={{ left: 470, top: -18 }} />
            <div style={{ fontFamily: MARK, fontSize: 70, color: P.red }}>💡 tip of the day</div>
            <div style={{ fontFamily: HAND, fontSize: 60, color: P.ink, marginTop: 16, lineHeight: 1.3 }}>do not only test the AI.<br />{f >= s(57.27) && <b>test the whole app around it.</b>}</div>
          </Paper>
        </Cut>
      </Scene>

      {/* 8 · case closed 58.59 → end */}
      <Scene from={58.59} to={63.5}>
        <div style={{ display: 'grid', gap: 34, justifyItems: 'center', position: 'relative' }}>
          <Cut at={58.6} rot={1}><Paper torn bg="#fff" style={{ padding: '40px 70px' }}><div style={{ fontFamily: TYPE, fontSize: 40, letterSpacing: 6, color: P.ink }}>AI FAILURE FILES · #004</div></Paper></Cut>
          <Stamp at={58.9} text="CASE CLOSED" color={P.green} rot={-6} size={90} style={{ position: 'relative' }} />
          <Cut at={59.31} rot={-1}><Label bg={P.yellow} size={44}>stay tuned for case #005</Label></Cut>
          <Cut at={60.0}><div style={{ fontFamily: TYPE, fontSize: 28, color: P.ink }}>Unnati Chhabra · AI engineer · unnati-chhabra.xyz</div></Cut>
        </div>
      </Scene>
    </AbsoluteFill>
  );
};

const Kraft: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 40% 30%, ${P.kraft}, ${P.kraft2})` }}>
    <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(90,60,30,0.18) 1px, transparent 1.5px), radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1.5px)', backgroundSize: '7px 7px, 11px 11px', backgroundPosition: '0 0, 3px 5px' }} />
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 50%, transparent 60%, rgba(60,35,15,0.35))' }} />
  </AbsoluteFill>
);

export const FailureFiles4: React.FC = () => (
  <AbsoluteFill>
    <Kraft />
    <Stage />
    <Audio src={staticFile('voice/files4clear.wav')} volume={1} />
    <Audio src={staticFile('music/files4.wav')} volume={0.1} />
  </AbsoluteFill>
);

// Faster cut: stumbles removed, tighter pauses, 1.45x voice; the same scenes re-timed through the warp
const FAST4 = linearWarp([[0.0, 0.0], [2.58, 2.18], [5.47, 4.7], [9.92, 8.76], [11.39, 10.03], [13.83, 12.1], [15.85, 13.72], [18.25, 15.91], [20.06, 17.5], [21.04, 18.28], [22.13, 19.22], [24.33, 21.17], [26.01, 22.64], [28.58, 24.93], [31.72, 27.73], [32.86, 28.71], [34.83, 30.5], [36.33, 31.76], [38.29, 33.54], [38.93, 34.02], [40.99, 35.9], [42.14, 36.71], [43.86, 38.17], [45.41, 39.52], [47.54, 41.41], [49.15, 42.77], [50.32, 43.77], [51.56, 44.85], [53.07, 46.11], [55.14, 47.94], [55.46, 48.18], [57.27, 49.77], [58.59, 50.92], [59.31, 51.57], [60.51, 52.61], [63.0, 55.1]], FPS);
export const FILES4_FAST_FRAMES = s(55.1);
export const FailureFiles4Fast: React.FC = () => (
  <WarpCtx.Provider value={FAST4}>
    <AbsoluteFill>
      <Kraft />
      <Stage />
    </AbsoluteFill>
    <Audio src={staticFile('voice/files4c2.wav')} volume={1} />
    <Audio src={staticFile('music/files4fast.wav')} volume={0.1} />
  </WarpCtx.Provider>
);

// Mic-voice + Funny.mp3 + real photos version of the posted fast cut
export const FailureFiles4Funny: React.FC = () => (
  <>
    <WarpCtx.Provider value={FAST4}>
      <AbsoluteFill>
        <Kraft />
        <Stage />
      </AbsoluteFill>
    </WarpCtx.Provider>
    <PhotoCues cues={[
      { at: 4.6, dur: 3.4, img: 'c4a', tag: 'Real case: McDonald’s AI hiring bot, July 2025', side: 'right' },
      { at: 21.1, dur: 3.2, img: 'c4b', tag: 'Up to 64 million chats could be seen', side: 'left' },
    ]} />
    <MicAndFunny voice="voice/files4mic.wav" frames={FILES4_FAST_FRAMES} />
  </>
);
