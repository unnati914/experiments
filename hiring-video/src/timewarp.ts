import React from 'react';
import { useCurrentFrame } from 'remotion';

// Re-time a finished scene timeline to a new (faster) voiceover without rewriting every `at` value:
// components read the frame through useWarpedFrame(), and a provider maps real frames -> original-timeline frames.
type Warp = (frame: number) => number;
export const WarpCtx = React.createContext<Warp>((f) => f);
export const useWarpedFrame = () => React.useContext(WarpCtx)(useCurrentFrame());

// pairs: [originalSecond, newSecond], piecewise-linear between them (pairs that don't strictly increase are dropped)
export const linearWarp = (pairs: [number, number][], fps: number): Warp => {
  const pts: [number, number][] = [];
  for (const p of pairs) {
    const last = pts[pts.length - 1];
    if (!last || (p[0] > last[0] && p[1] > last[1])) pts.push(p);
  }
  return (frame) => {
    const t = frame / fps;
    for (let i = 0; i < pts.length - 1; i++) {
      const [o0, n0] = pts[i];
      const [o1, n1] = pts[i + 1];
      if (t <= n1) return (o0 + ((t - n0) * (o1 - o0)) / (n1 - n0)) * fps;
    }
    const [oL, nL] = pts[pts.length - 1];
    return (oL + (t - nL)) * fps;
  };
};
