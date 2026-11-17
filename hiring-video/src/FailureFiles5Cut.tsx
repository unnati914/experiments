import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import EDL from './f5-edl.json';
import { LiveCtx, R, Scene, find, words } from './FailureFiles5';
import { PhotoCues } from './FailurePhotos';

// Case #005 with Unnati's real recording: stumbles cut (src/f5-edl.json), voice through mic.py, Funny.mp3 under it.
// Face shows full-screen only in [FACE] parts; in [VOICE] parts graphics take over and her face sits in a small bubble.
const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const pieces = EDL.pieces as { in: number; out: number; at: number }[];
const TOTAL = EDL.total;
const SPEED = (EDL as { speed?: number }).speed ?? 1; // whole edit sped up (voice pre-stretched, footage via playbackRate)
export const FILES5CUT_FRAMES = fr(TOTAL + 0.4);

// time (output seconds) of a word, searching from a word index
const T = (w: string, from = 0, fb = 0) => { const i = find(w, from); return i < 0 ? fb : words[i].t; };
const iYes = find('"yes"|yes', find('are', 0));
const tYes = iYes < 0 ? 0 : words[iYes].e;
const tMade = T('made', find('real', find('none', 0)));
const tEither = T('either');
const tLastEvery = T('every', find('tip', 0));
const tClosed = T('closed');

// Her face only appears in a small circle, and only during the [FACE] moments (fades in/out). Never full-screen.
const Footage: React.FC<{ box?: React.CSSProperties }> = ({ box }) => {
  const f = useCurrentFrame(); const t = f / FPS;
  const b = [...R].reverse().find((x) => t >= x.start) ?? R[0];
  const vis = b.face ? Math.min(interpolate(t, [b.start, b.start + 0.3], [0, 1], clamp), interpolate(t, [b.end - 0.3, b.end], [1, 0], clamp)) : 0;
  if (vis <= 0) return null; // don't decode footage while the circle is hidden
  return (
    <div style={{ position: 'absolute', right: 50, bottom: 140, width: 300, height: 300, borderRadius: '50%', overflow: 'hidden', border: '8px solid #fffdf6',
      boxShadow: '0 14px 40px rgba(0,0,0,0.35)', zIndex: 5, opacity: vis, transform: `scale(${0.85 + 0.15 * vis})`, ...box }}>
      {pieces.map((p, i) => (
        <Sequence key={i} from={fr(p.at)} durationInFrames={Math.max(1, fr((p.out - p.in) / SPEED))} layout="none">
          <>
            <OffthreadVideo src={staticFile('f5/raw.mp4')} startFrom={fr(p.in)} playbackRate={SPEED} muted style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.14) contrast(0.86) saturate(1.18) sepia(0.06)' }} />
            <OffthreadVideo src={staticFile('f5/raw_soft.mp4')} startFrom={fr(p.in)} playbackRate={SPEED} muted style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(1.2) saturate(1.1)', opacity: 0.5 }} />
          </>
        </Sequence>
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 38%, rgba(255,236,214,0.6), rgba(255,220,190,0.15) 55%, transparent 75%)', mixBlendMode: 'soft-light' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 45%, rgba(255,150,175,0.28), rgba(255,170,190,0.1) 60%, transparent 80%)', mixBlendMode: 'soft-light' }} />
    </div>
  );
};

// one continuous, pre-cut voice track already sped up with ffmpeg atempo (pitch kept)
const Voice: React.FC = () => <Audio src={staticFile('f5/voice_fast.wav')} />;

// word-timed captions, 4 words at a time, current word highlighted
const CHUNKS = (() => {
  const out: { t: number; e: number; ws: typeof words }[] = [];
  let cur: typeof words = [];
  words.forEach((w, i) => {
    cur.push(w);
    const nxt = words[i + 1];
    if (cur.length >= 4 || !nxt || nxt.t - w.e > 0.45 || /[.?!,]"?$/.test(w.w)) { out.push({ t: cur[0].t, e: cur[cur.length - 1].e + 0.15, ws: cur }); cur = []; }
  });
  return out;
})();
const Captions: React.FC<{ vertical?: boolean }> = ({ vertical }) => {
  const t = useCurrentFrame() / FPS;
  const c = CHUNKS.find((x) => t >= x.t && t < x.e);
  if (!c) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, ...(vertical ? { top: 1150 } : { bottom: 56 }), display: 'flex', justifyContent: 'center', zIndex: 8 }}>
      <div style={{ background: 'rgba(20,22,31,0.86)', borderRadius: 18, padding: vertical ? '16px 30px' : '10px 22px', fontFamily: "'Avenir Next', Arial, sans-serif", fontWeight: 800, fontSize: vertical ? 70 : 46, maxWidth: vertical ? 960 : 1300, lineHeight: 1.2, textAlign: 'center' }}>
        {c.ws.map((w, i) => <span key={i} style={{ color: t >= w.t ? '#ffe066' : '#ffffff', marginRight: 12 }}>{w.w}</span>)}
      </div>
    </div>
  );
};

// imlea's mascot (transparent ProRes) popping in for a reaction
const Mascot: React.FC<{ src: string; at: number; dur: number; side: 'left' | 'right'; size?: number }> = ({ src, at, dur, side, size = 520 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - fr(at), fps, config: { damping: 11, stiffness: 190 } });
  const out = interpolate(f / FPS, [at + dur - 0.25, at + dur], [1, 0], clamp);
  return (
    <Sequence from={fr(at)} durationInFrames={fr(dur)} layout="none">
      <div style={{ position: 'absolute', bottom: 120, [side]: 60, width: size, height: size, zIndex: 7, transform: `scale(${p}) rotate(${(1 - p) * (side === 'left' ? -20 : 20)}deg)`, opacity: out }}>
        <OffthreadVideo src={staticFile(src)} transparent muted style={{ width: '100%', height: '100%' }} />
      </div>
    </Sequence>
  );
};

const Visuals: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const b = [...R].reverse().find((x) => t >= x.start) ?? R[0];
  return (
    <>
      <AbsoluteFill style={{ zIndex: 1 }}><Scene key={b.i} b={b} /></AbsoluteFill>
      <AbsoluteFill style={{ zIndex: 6, pointerEvents: 'none' }}>
        <PhotoCues cues={[
          { at: tMade + 0.1, dur: Math.max(1.0, Math.min(2.2, R[10].start - tMade - 0.25)), img: 'f4', tag: 'the lawyers, probably', side: 'left' },
          { at: tYes + 0.15, dur: 2.0, img: 'f2', tag: 'everyone reading that “Yes.”', side: 'right' },
          { at: tLastEvery + 0.2, dur: Math.max(0.7, tClosed - tLastEvery - 0.75), img: 'f3', tag: 'you, after checking every source 😎', side: 'right' },
        ]} />
      </AbsoluteFill>
    </>
  );
};

const Sound: React.FC = () => (
  <>
    <Voice />
    {/* sound effects (user-supplied): "wow" on the shock moments, applause on "Case closed" */}
    {[R[9].start + 0.2, tYes - 0.05].map((at, i) => (
      <Sequence key={'wow' + i} from={fr(at)} durationInFrames={fr(1.9)} layout="none"><Audio src={staticFile('f5/wow.mp3')} volume={0.7} /></Sequence>
    ))}
    <Sequence from={fr(tClosed - 0.05)} durationInFrames={fr(3.2)} layout="none">
      <Audio src={staticFile('f5/applause_real.mp3')} volume={(x) => interpolate(x, [0, fr(2.4), fr(3.2)], [0.6, 0.6, 0], clamp)} />
    </Sequence>
    <Audio src={staticFile('music/funny.wav')} volume={(x) => interpolate(x / FPS, [0, 0.8, TOTAL - 1.5, TOTAL + 0.4], [0.28, 0.12, 0.12, 0], clamp)} />
  </>
);

export const FailureFiles5Cut: React.FC = () => (
  <LiveCtx.Provider value>
    <AbsoluteFill style={{ background: '#14161f', overflow: 'hidden' }}>
      <Footage />
      <Visuals />
      <Captions />
      <Sound />
    </AbsoluteFill>
  </LiveCtx.Provider>
);

// 9:16: title on top, the full landscape scene scaled into the middle, big captions, face circle at the bottom.
export const FailureFiles5Vertical: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <LiveCtx.Provider value>
      <AbsoluteFill style={{ background: '#fdf3b4', overflow: 'hidden' }}>
        <AbsoluteFill style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 58px, #9ec3e6 58px 61px)', opacity: 0.6 }} />
        <div style={{ position: 'absolute', left: 120, top: 0, bottom: 0, width: 3, background: '#e57373', opacity: 0.8 }} />
        <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: "'Avenir Next', Arial, sans-serif" }}>
          <div style={{ fontWeight: 900, fontSize: 92, color: '#1d2a44', letterSpacing: -1 }}>AI FAILURE FILES</div>
          <div style={{ display: 'inline-block', marginTop: 18, fontWeight: 900, fontSize: 52, color: '#c62828', border: '6px solid #c62828', borderRadius: 12, padding: '2px 22px', transform: 'rotate(-3deg)' }}>CASE #005</div>
          <div style={{ marginTop: 22, fontFamily: "'Courier New', monospace", fontSize: 38, color: '#1d2a44' }}>the lawyers who used fake court cases</div>
        </div>
        {/* the landscape stage, scaled to fit the width */}
        <div style={{ position: 'absolute', top: 500, left: 0, width: 1920, height: 1080, transform: 'scale(0.5625)', transformOrigin: 'top left', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
          <Visuals />
        </div>
        <Captions vertical />
        <Footage box={{ right: 'auto', left: 330, bottom: 150, width: 420, height: 420, border: '10px solid #fffdf6' }} />
        <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontFamily: "'Courier New', monospace", fontSize: 30, color: '#1d2a44', opacity: t > 1 ? 0.75 : 0 }}>Unnati Chhabra · AI engineer</div>
        <Sound />
      </AbsoluteFill>
    </LiveCtx.Provider>
  );
};
