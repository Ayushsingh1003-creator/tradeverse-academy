/**
 * Web Audio API — no asset files. Respects `localStorage.tv_sounds`.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (typeof window === "undefined") throw new Error("no window");
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) throw new Error("no AudioContext");
    audioCtx = new Ctx();
  }
  return audioCtx;
}

export function resumeAudioContext(): void {
  if (typeof window === "undefined") return;
  try {
    void getCtx().resume();
  } catch {
    /* ignore */
  }
}

export function playCorrect(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.08);
      gain.gain.setValueAtTime(0, t + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.16, t + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.35);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.4);
    });
    const sparkle = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkle.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);
    sparkle.type = "triangle";
    sparkle.frequency.setValueAtTime(1200, t + 0.15);
    sparkle.frequency.exponentialRampToValueAtTime(1600, t + 0.3);
    sparkleGain.gain.setValueAtTime(0.06, t + 0.15);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    sparkle.start(t + 0.15);
    sparkle.stop(t + 0.5);
  } catch {
    /* ignore */
  }
}

export function playWrong(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.2);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.32);
  } catch {
    /* ignore */
  }
}

export function playPageTurn(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.08);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.linearRampToValueAtTime(800, t + 0.08);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    source.start(t);
    source.stop(t + 0.12);
  } catch {
    /* ignore */
  }
}

export function playLevelUp(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const melody = [392, 523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = i === 4 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0.16, t + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + (i === 4 ? 0.75 : 0.22));
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.9);
    });
  } catch {
    /* ignore */
  }
}

export function playLessonComplete(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.35);
      osc.start(t + i * 0.05);
      osc.stop(t + 1.8);
    });
  } catch {
    /* ignore */
  }
}

export function playStreak(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    [880, 1100, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.12, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.14);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.18);
    });
  } catch {
    /* ignore */
  }
}

export function playTick(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.start(t);
    osc.stop(t + 0.05);
  } catch {
    /* ignore */
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("tv_sounds") !== "false";
}

export function persistSoundPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("tv_sounds", enabled ? "true" : "false");
}

export const sound = {
  correct: () => isSoundEnabled() && playCorrect(),
  wrong: () => isSoundEnabled() && playWrong(),
  pageTurn: () => isSoundEnabled() && playPageTurn(),
  levelUp: () => isSoundEnabled() && playLevelUp(),
  lessonComplete: () => isSoundEnabled() && playLessonComplete(),
  streak: () => isSoundEnabled() && playStreak(),
  tick: () => isSoundEnabled() && playTick(),
};
