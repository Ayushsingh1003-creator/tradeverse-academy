/** Time-to-first-audio instrumentation for one coach reply (Cerebras/Gemini stream → Fish Audio → playback). */
export type CoachTimingMark =
  | "requestStart"
  | "llmFirstToken"
  | "firstSentenceDetected"
  | "fishStart"
  | "fishFirstByte"
  | "firstAudioReady"
  | "playbackStarted"
  | "llmCompleted"
  | "allAudioCompleted";

export class CoachTiming {
  private marks: Partial<Record<CoachTimingMark, number>> = {};
  private t0 = typeof performance !== "undefined" ? performance.now() : Date.now();

  mark(name: CoachTimingMark) {
    if (this.marks[name] !== undefined) return;
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    this.marks[name] = Math.round(now - this.t0);
  }

  /** Logs a one-line summary once the full pipeline (LLM + all audio) has completed. */
  logSummary() {
    if (typeof console === "undefined") return;
    const ttfa = this.marks.playbackStarted;
    console.debug(
      `[coach-tts] time to first audio: ${ttfa ?? "n/a"}ms`,
      this.marks,
    );
  }
}
