import React from 'react';
import { AbsoluteFill, Audio, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import credits from '../public/photos/credits.json';

// Real "evidence" photos for AI Failure Files, pinned over the scene at the moment the voice mentions them.
// All photos are from Wikimedia Commons under free licences; each one shows its credit on screen.
// Times are REAL seconds in the output video (not the warped scene timeline).
export type Cue = { at: number; dur: number; img: keyof typeof credits; tag: string; tilt?: number; side?: 'left' | 'right' };

const FPS = 30;
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const SANS = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
const MONO = 'Menlo, monospace';

const Photo: React.FC<{ c: Cue }> = ({ c }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / FPS;
  if (t < c.at - 0.05 || t > c.at + c.dur + 0.3) return null;
  const p = spring({ frame: f - Math.round(c.at * FPS), fps, config: { damping: 13, stiffness: 170 } });
  const out = interpolate(t, [c.at + c.dur, c.at + c.dur + 0.25], [1, 0], clamp);
  const zoom = interpolate(t, [c.at, c.at + c.dur], [1.04, 1.12], clamp); // slow push-in
  const cr = credits[c.img];
  const right = (c.side ?? 'right') === 'right';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* dim the scene behind so the photo reads as a cut-in */}
      <AbsoluteFill style={{ background: 'rgba(8,6,12,0.55)', opacity: Math.min(1, p * 1.4) * out }} />
      <div style={{
        position: 'absolute', top: 120, [right ? 'right' : 'left']: 150, width: 1080,
        transform: `translateY(${(1 - p) * 60}px) rotate(${(c.tilt ?? (right ? 2.5 : -2.5)) * p}deg) scale(${0.9 + 0.1 * p})`,
        opacity: Math.min(1, p * 1.6) * out,
      }}>
        <div style={{ background: '#fbfaf6', padding: '18px 18px 70px', boxShadow: '0 30px 70px rgba(0,0,0,0.55)', position: 'relative' }}>
          <div style={{ width: '100%', height: 610, overflow: 'hidden', background: '#111' }}>
            <Img src={staticFile(`photos/${c.img}.jpg`)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
          </div>
          <div style={{ position: 'absolute', left: 26, bottom: 18, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#1b1b1f' }}>{c.tag}</div>
          {/* tape */}
          <div style={{ position: 'absolute', top: -18, left: '42%', width: 150, height: 40, background: 'rgba(255,236,170,0.75)', transform: 'rotate(-4deg)' }} />
        </div>
        <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 17, color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
          Photo: {cr.artist} · {cr.license} · Wikimedia Commons
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const PhotoCues: React.FC<{ cues: Cue[] }> = ({ cues }) => <>{cues.map((c) => <Photo key={c.img + c.at} c={c} />)}</>;

// Voice with the broadcast-mic treatment + Funny.mp3 bed sitting under it, fading out at the end.
export const MicAndFunny: React.FC<{ voice: string; frames: number }> = ({ voice, frames }) => {
  const end = frames / FPS;
  return (
    <>
      <Audio src={staticFile(voice)} volume={1} />
      <Audio src={staticFile('music/funny.wav')} volume={(fr) => interpolate(fr / FPS, [0, 0.8, end - 1.8, end], [0.3, 0.13, 0.13, 0], clamp)} />
    </>
  );
};
