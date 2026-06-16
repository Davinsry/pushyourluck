import { useCallback, useRef, useState } from "react";

/**
 * Tiny synth-based SFX so the build ships with zero audio assets.
 * Each cue is a couple of oscillator beeps. Honours a mute toggle.
 */
export type Cue = "bite" | "bank" | "bust" | "milk" | "sabotage" | "win" | "click";

const CUES: Record<Cue, { freq: number; dur: number; type: OscillatorType; slideTo?: number }[]> = {
  click: [{ freq: 440, dur: 0.05, type: "triangle" }],
  bite: [{ freq: 660, dur: 0.07, type: "square" }],
  bank: [
    { freq: 523, dur: 0.09, type: "triangle" },
    { freq: 784, dur: 0.12, type: "triangle" },
  ],
  milk: [{ freq: 392, dur: 0.18, type: "sine", slideTo: 261 }],
  sabotage: [{ freq: 220, dur: 0.14, type: "sawtooth", slideTo: 140 }],
  bust: [
    { freq: 200, dur: 0.18, type: "sawtooth", slideTo: 80 },
    { freq: 120, dur: 0.22, type: "sawtooth", slideTo: 60 },
  ],
  win: [
    { freq: 523, dur: 0.12, type: "triangle" },
    { freq: 659, dur: 0.12, type: "triangle" },
    { freq: 784, dur: 0.12, type: "triangle" },
    { freq: 1046, dur: 0.2, type: "triangle" },
  ],
};

export function useSound() {
  const [muted, setMuted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (cue: Cue) => {
      if (muted) return;
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = ctxRef.current ?? (ctxRef.current = new Ctx());
        if (ctx.state === "suspended") void ctx.resume();
        let t = ctx.currentTime;
        for (const note of CUES[cue]) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = note.type;
          osc.frequency.setValueAtTime(note.freq, t);
          if (note.slideTo) osc.frequency.exponentialRampToValueAtTime(note.slideTo, t + note.dur);
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + note.dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(t);
          osc.stop(t + note.dur);
          t += note.dur * 0.85;
        }
      } catch {
        /* audio not available — silently ignore */
      }
    },
    [muted]
  );

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  return { play, muted, toggleMute };
}
