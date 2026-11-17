import React from 'react';
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { WarpCtx, linearWarp, useWarpedFrame } from './timewarp';
import { PhotoCues, MicAndFunny } from './FailurePhotos';
const useCurrentFrame = useWarpedFrame;

// "AI Failure Files" #003: an AI coding agent deleted a production database during a code freeze (July 2025, reported by
// SaaStr's Jason Lemkin using Replit's agent). Records on 1,206 executives / ~1,200 companies; the agent said rollback
// wouldn't work, but the data was recovered. Theme: a cozy retro computer desktop. Timed to files3clear.wav.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
export const FILES3_FRAMES = s(54);

const UI = "Geneva, 'Helvetica Neue', Arial, sans-serif";
const PIX = "Silom, 'Arial Black', sans-serif";
const TERM = "Monaco, Menlo, monospace";
const R = { desk: '#3a9c95', desk2: '#2f817b', win: '#e9e5dc', bar1: '#5b4bc4', bar2: '#9a8cff', ink: '#1c1b22', red: '#d9363e', green: '#2e9e5b', note: '#fff1a8', shadow: 'rgba(0,0,0,0.35)' };
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (x: number) => 1 - Math.pow(1 - x, 3);

const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - s(at), fps, config: { damping: 13, stiffness: 220 } });
  return <div style={{ opacity: f >= s(at) ? 1 : 0, transform: `scale(${0.6 + 0.4 * p})`, transformOrigin: 'center', ...style }}>{children}</div>;
};
const Typed: React.FC<{ at: number; text: string; cps?: number }> = ({ at, text, cps = 40 }) => {
  const f = useCurrentFrame();
  if (f < s(at)) return null;
  const k = Math.floor(((f - s(at)) / FPS) * cps);
  return <>{text.slice(0, k)}{k < text.length && <span style={{ opacity: f % 14 < 7 ? 1 : 0 }}>█</span>}</>;
};
const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  if (f < s(from) || f > s(to)) return null;
  const op = interpolate(f, [s(to) - 6, s(to)], [1, 0], clamp);
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};
const Bevel: React.CSSProperties = { borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRight: '3px solid #6f6b63', borderBottom: '3px solid #6f6b63' };
const Win: React.FC<{ title: string; w: number; children: React.ReactNode; style?: React.CSSProperties; bar?: [string, string] }> = ({ title, w, children, style, bar = [R.bar1, R.bar2] }) => (
  <div style={{ width: w, background: R.win, ...Bevel, boxShadow: `10px 10px 0 ${R.shadow}`, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: `linear-gradient(90deg, ${bar[0]}, ${bar[1]})`, color: '#fff', fontFamily: UI, fontWeight: 700, fontSize: 26 }}>
      <span style={{ width: 22, height: 22, background: R.win, ...Bevel, boxSizing: 'border-box' }} />
      <span style={{ flex: 1 }}>{title}</span>
      {['_', '□', '×'].map((c) => <span key={c} style={{ width: 30, height: 26, background: R.win, color: R.ink, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', ...Bevel, boxSizing: 'border-box' }}>{c}</span>)}
    </div>
    <div style={{ padding: '22px 26px' }}>{children}</div>
  </div>
);
const Btn: React.FC<{ children: React.ReactNode; hot?: string; style?: React.CSSProperties }> = ({ children, hot, style }) => (
  <span style={{ display: 'inline-block', fontFamily: UI, fontWeight: 700, fontSize: 26, padding: '8px 26px', background: hot ?? R.win, color: hot ? '#fff' : R.ink, ...Bevel, ...style }}>{children}</span>
);
const Icon: React.FC<{ emoji: string; label: string; style?: React.CSSProperties }> = ({ emoji, label, style }) => (
  <div style={{ position: 'absolute', width: 150, textAlign: 'center', ...style }}>
    <div style={{ fontSize: 76, lineHeight: 1 }}>{emoji}</div>
    <div style={{ display: 'inline-block', marginTop: 6, fontFamily: UI, fontSize: 22, color: '#fff', background: 'rgba(0,0,0,0.25)', padding: '2px 8px' }}>{label}</div>
  </div>
);
const Note: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; rot?: number }> = ({ at, children, style, rot = -3 }) => (
  <Pop at={at} style={{ position: 'absolute', ...style }}>
    <div style={{ background: R.note, padding: '22px 28px', transform: `rotate(${rot}deg)`, boxShadow: `8px 8px 0 ${R.shadow}`, fontFamily: "'Bradley Hand', 'Noteworthy', cursive", fontSize: 40, color: R.ink, lineHeight: 1.25 }}>{children}</div>
  </Pop>
);

const Stage: React.FC = () => {
  const f = useCurrentFrame();
  // database icon flies to the trash, then comes back
  const toTrash = interpolate(f, [s(17.2), s(18.4)], [0, 1], { ...clamp, easing: ease });
  const back = interpolate(f, [s(24.9), s(26.0)], [0, 1], { ...clamp, easing: ease });
  const k = toTrash * (1 - back);
  const dbX = 120 + k * 1560;
  const dbY = 330 + k * 540 - Math.sin(k * Math.PI) * 260;
  const progress = interpolate(f, [s(16.4), s(18.4)], [0, 100], clamp);
  return (
    <AbsoluteFill>
      {/* desktop icons visible through the story */}
      {f < s(31.8) && (
        <>
          <Icon emoji="🗂️" label="my_app" style={{ left: 120, top: 120 }} />
          {f >= s(6.11) && <Icon emoji="🛢️" label="database" style={{ left: dbX, top: dbY, transform: `rotate(${k * 300}deg) scale(${1 - 0.4 * Math.sin(k * Math.PI)})` }} />}
          <Icon emoji={toTrash > 0.99 && back < 0.01 ? '🗑️' : '🗑️'} label="Trash" style={{ left: 1680, top: 870 }} />
        </>
      )}

      {/* 1 · title: 0 → 6.11 */}
      <Scene from={0} to={6.11}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pop at={0.15}>
            <Win title="AI Failure Files" w={1100}>
              <div style={{ fontFamily: PIX, fontSize: 40, color: R.bar1 }}>CASE #003</div>
              <div style={{ fontFamily: PIX, fontSize: 76, color: R.ink, lineHeight: 1.1, marginTop: 10 }}><Typed at={2.86} text="the AI that deleted a company's data" cps={30} /></div>
            </Win>
          </Pop>
        </AbsoluteFill>
      </Scene>

      {/* 2 · the setup: 6.11 → 16.23 */}
      <Scene from={6.11} to={16.25}>
        <Note at={6.2} style={{ left: 120, top: 560 }}>July 2025 📅</Note>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pop at={6.5}>
            <Win title="AI Helper — chat" w={1100}>
              <div style={{ fontFamily: UI, fontSize: 32, color: R.ink, lineHeight: 1.5 }}>
                <div>🧑 <b>founder:</b> help me build my app</div>
                {f >= s(10.4) && <div>🤖 <b>AI:</b> <Typed at={10.4} text="sure! I can write code and run commands." cps={45} /></div>}
                {f >= s(11.78) && <div style={{ marginTop: 10, background: '#fff', padding: '10px 14px', ...Bevel }}>🧑 <b>founder:</b> <span style={{ color: R.red, fontWeight: 700 }}><Typed at={11.78} text="STOP. do not change anything without asking me." cps={40} /></span></div>}
              </div>
            </Win>
          </Pop>
          {f >= s(14.74) && (
            <Pop at={14.74} style={{ position: 'absolute', right: 230, bottom: 210 }}>
              <div style={{ fontFamily: PIX, fontSize: 46, color: '#fff', background: R.red, padding: '10px 24px', transform: 'rotate(-4deg)', boxShadow: `8px 8px 0 ${R.shadow}` }}>the AI did not listen 😬</div>
            </Pop>
          )}
        </AbsoluteFill>
      </Scene>

      {/* 3 · the delete: 16.23 → 26.77 */}
      <Scene from={16.23} to={26.8}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pop at={16.3}>
            <Win title="Terminal" w={1100} bar={['#2b2b2b', '#555']}>
              <div style={{ background: '#101010', padding: '20px 24px', fontFamily: TERM, fontSize: 30, color: '#9dff9d', lineHeight: 1.6, minHeight: 300 }}>
                <div>&gt; <Typed at={16.3} text="running a command on the LIVE database..." cps={50} /></div>
                {f >= s(16.6) && <div>[{'█'.repeat(Math.round(progress / 5)).padEnd(20, '·')}] {Math.round(progress)}% deleted</div>}
                {f >= s(18.67) && <div style={{ color: '#ff7b7b' }}><Typed at={18.67} text="✗ records on 1,200+ people and companies: GONE" cps={45} /></div>}
                {f >= s(21.92) && <div style={{ color: '#ffd27b' }}>🤖 <Typed at={21.92} text={'"it cannot be saved."'} cps={40} /></div>}
              </div>
            </Win>
          </Pop>
          {f >= s(24.08) && (
            <Pop at={24.08} style={{ position: 'absolute', right: 260, top: 230 }}>
              <div style={{ fontFamily: PIX, fontSize: 64, color: R.red, border: `6px solid ${R.red}`, padding: '4px 22px', transform: 'rotate(-10deg)', background: 'rgba(255,255,255,0.85)' }}>NOT TRUE</div>
            </Pop>
          )}
          {f >= s(24.77) && <Note at={24.77} rot={3} style={{ left: 260, bottom: 120 }}>he got the data back himself ✓</Note>}
        </AbsoluteFill>
      </Scene>

      {/* 4 · what went wrong: 26.77 → 31.86 */}
      <Scene from={26.77} to={31.9}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pop at={26.85}>
            <Win title="⚠ What went wrong?" w={1200} bar={['#b3262d', '#e36a6f']}>
              <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 110, lineHeight: 1 }}>⚠️</div>
                <div style={{ fontFamily: UI, fontSize: 40, color: R.ink, lineHeight: 1.5, paddingTop: 6 }}>
                  {f >= s(27.31) && <div>1. the AI could <b>delete real data</b></div>}
                  {f >= s(29.36) && <div>2. <b>no one had to say yes</b> first</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: 18 }}><Btn>OK</Btn></div>
            </Win>
          </Pop>
        </AbsoluteFill>
      </Scene>

      {/* 5 · the stop test: 31.86 → 45.74 */}
      <Scene from={31.86} to={45.75}>
        <AbsoluteFill style={{ padding: '80px 120px' }}>
          <Pop at={31.9}>
            <Win title="the STOP test.exe" w={1680} bar={[R.green, '#6fd39a']}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
                <div style={{ fontFamily: UI, fontSize: 34, color: R.ink, lineHeight: 1.5 }}>
                  {f >= s(32.98) && <div>① tell the AI: <b>"do not change anything."</b></div>}
                  {f >= s(34.79) && <div style={{ marginTop: 14 }}>② give it a job that <b>tempts it</b> to change things</div>}
                  {f >= s(37.67) && <div style={{ marginTop: 14, color: R.green, fontWeight: 700 }}>✓ a good AI stops and asks first</div>}
                  {f >= s(43.53) && (
                    <div style={{ display: 'flex', gap: 22, marginTop: 26, alignItems: 'center' }}>
                      <Icon emoji="🧪" label="test data" style={{ position: 'relative' }} />
                      <div style={{ width: 14, height: 120, background: R.ink }} />
                      <Icon emoji="🛢️" label="real data" style={{ position: 'relative' }} />
                      <span style={{ fontFamily: UI, fontSize: 30 }}>keep them apart</span>
                    </div>
                  )}
                </div>
                <div>
                  {f >= s(37.67) && (
                    <Pop at={37.67}>
                      <Win title="AI Helper" w={720} bar={['#3b6fd1', '#7aa2ff']}>
                        <div style={{ fontFamily: UI, fontSize: 30, color: R.ink }}>🤖 this job needs a change. <b>can I go ahead?</b></div>
                        <div style={{ marginTop: 14, display: 'flex', gap: 14 }}><Btn>ask the human</Btn></div>
                      </Win>
                    </Pop>
                  )}
                  {f >= s(39.52) && (
                    <Pop at={40.48} style={{ marginTop: 26 }}>
                      <Win title="Confirm delete" w={720} bar={['#b3262d', '#e36a6f']}>
                        <div style={{ fontFamily: UI, fontSize: 30, color: R.ink }}>🗑️ delete <b>database</b>?<br /><span style={{ fontSize: 24, color: '#555' }}>one more rule: a human must say yes</span></div>
                        <div style={{ marginTop: 16, display: 'flex', gap: 14 }}><Btn hot={R.green}>YES (human only)</Btn><Btn>Cancel</Btn></div>
                      </Win>
                    </Pop>
                  )}
                </div>
              </div>
            </Win>
          </Pop>
        </AbsoluteFill>
      </Scene>

      {/* 6 · tip of the day: 45.74 → 49.77 */}
      <Scene from={45.74} to={49.8}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Pop at={45.8}>
            <div style={{ background: R.note, padding: '50px 70px', transform: 'rotate(-2deg)', boxShadow: `14px 14px 0 ${R.shadow}`, width: 1100 }}>
              <div style={{ fontFamily: PIX, fontSize: 56, color: R.ink }}>💡 tip of the day</div>
              <div style={{ fontFamily: "'Bradley Hand', cursive", fontSize: 62, color: R.ink, marginTop: 20, lineHeight: 1.25 }}>
                <Typed at={45.9} text="don't just check what the AI says." cps={36} />
                {f >= s(47.77) && <div style={{ color: R.red }}><Typed at={47.77} text="check what it DOES." cps={30} /></div>}
              </div>
            </div>
          </Pop>
        </AbsoluteFill>
      </Scene>

      {/* 7 · case closed: 49.77 → end */}
      <Scene from={49.77} to={54.5}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
          <Pop at={49.8}>
            <Win title="Shut down" w={1000}>
              <div style={{ fontFamily: PIX, fontSize: 64, color: R.ink, textAlign: 'center' }}>case closed ✅</div>
              <div style={{ fontFamily: UI, fontSize: 32, color: R.ink, textAlign: 'center', marginTop: 12 }}>It is now safe to close case #003.</div>
              <div style={{ fontFamily: UI, fontSize: 34, color: R.bar1, textAlign: 'center', marginTop: 20, fontWeight: 700 }}>stay tuned for case #004</div>
              <div style={{ fontFamily: TERM, fontSize: 24, color: '#555', textAlign: 'center', marginTop: 24 }}>Unnati Chhabra · AI engineer · unnati-chhabra.xyz</div>
            </Win>
          </Pop>
        </AbsoluteFill>
      </Scene>
    </AbsoluteFill>
  );
};

const Desktop: React.FC = () => {
  const f = useCurrentFrame();
  const t = new Date(2025, 6, 18, 23, 41 + Math.floor(f / FPS / 60));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${R.desk}, ${R.desk2})` }}>
      <AbsoluteFill style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.5px, transparent 1.5px)', backgroundSize: '8px 8px' }} />
      {/* menu bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 46, background: R.win, ...Bevel, display: 'flex', alignItems: 'center', gap: 36, padding: '0 24px', fontFamily: UI, fontSize: 24, color: R.ink }}>
        <span>🍵</span><b>File</b><span>Edit</span><span>View</span><span>Special</span>
        <span style={{ marginLeft: 'auto' }}>AI Failure Files · {t.getHours()}:{String(t.getMinutes()).padStart(2, '0')}</span>
      </div>
      <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 4px)' }} />
    </AbsoluteFill>
  );
};

export const FailureFiles3: React.FC = () => (
  <AbsoluteFill>
    <Desktop />
    <Stage />
    <Audio src={staticFile('voice/files3clear.wav')} volume={1} />
    <Audio src={staticFile('music/files3.wav')} volume={0.1} />
  </AbsoluteFill>
);

// Faster cut: stumbles removed, tighter pauses, 1.45x voice; the same scenes re-timed through the warp
const FAST3 = linearWarp([[0.0, 0.0], [2.86, 2.3], [6.11, 4.9], [10.4, 8.76], [11.78, 9.9], [13.3, 11.28], [14.74, 12.49], [16.23, 13.84], [18.67, 16.01], [21.92, 18.86], [24.08, 20.82], [24.77, 21.39], [26.77, 23.1], [27.31, 23.54], [29.36, 25.3], [31.86, 27.52], [31.88, 27.48], [32.98, 28.34], [34.79, 29.93], [37.67, 32.5], [39.52, 34.19], [40.48, 35.0], [43.53, 37.67], [45.74, 39.63], [45.73, 39.57], [47.77, 41.42], [49.77, 43.19], [50.22, 43.41], [51.37, 44.4], [54.0, 47.0]], FPS);
export const FILES3_FAST_FRAMES = s(47.0);
export const FailureFiles3Fast: React.FC = () => (
  <WarpCtx.Provider value={FAST3}>
    <AbsoluteFill>
      <Desktop />
      <Stage />
    </AbsoluteFill>
    <Audio src={staticFile('voice/files3c2.wav')} volume={1} />
    <Audio src={staticFile('music/files3fast.wav')} volume={0.1} />
  </WarpCtx.Provider>
);

// Mic-voice + Funny.mp3 + real photos version of the posted fast cut
export const FailureFiles3Funny: React.FC = () => (
  <>
    <WarpCtx.Provider value={FAST3}>
      <AbsoluteFill>
        <Desktop />
        <Stage />
      </AbsoluteFill>
    </WarpCtx.Provider>
    <PhotoCues cues={[
      { at: 13.8, dur: 3.2, img: 'c3a', tag: 'Real data lives on real servers. One command, gone.', side: 'right' },
      { at: 37.3, dur: 2.6, img: 'c3b', tag: 'Keep test data and real data apart', side: 'left' },
    ]} />
    <MicAndFunny voice="voice/files3mic.wav" frames={FILES3_FAST_FRAMES} />
  </>
);
