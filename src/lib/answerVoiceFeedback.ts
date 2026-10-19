/**
 * Formats the pre-generated hint/wrong/correct feedback shown in the AI coach
 * chat and played as audio after a lesson question is answered. Pure/no I/O —
 * the caller fetches voicePrefixes/voiceConfigByQuestion server-side and
 * passes them in. Used identically by the 5 bespoke Candlestick Essentials
 * lessons and by LessonPlayer.tsx.
 */

export type AnswerStage = "hint" | "explain" | "correct";

export type VoicePrefixEntry = { text: string; audioUrl: string };
export type VoicePrefixMap = Partial<Record<"hint" | "wrong" | "correct", VoicePrefixEntry>>;

export type QuestionVoiceEntry = { text: string; audioUrl: string };
/** questionKey -> stage ("hint" | "explain") -> pre-generated entry. */
export type QuestionVoiceMap = Record<string, Partial<Record<"hint" | "explain", QuestionVoiceEntry>>>;

const PREFIX_KIND_FOR_STAGE: Record<AnswerStage, "hint" | "wrong" | "correct"> = {
  hint: "hint",
  explain: "wrong",
  correct: "correct",
};

/**
 * Hardcoded text fallback so a bubble is never blank even before
 * scripts/voice-responses/generate.ts has ever populated the VoicePrefix
 * table (e.g. right after this feature ships to a fresh environment). No
 * audio plays in that case — just the text — until the script runs.
 */
const FALLBACK_PREFIX_TEXT: Record<"hint" | "wrong" | "correct", string> = {
  hint: "Wrong, try again",
  wrong: "Wrong answer",
  correct: "Correct",
};

export type AnswerFeedback = { text: string; prefixUrl: string | null; responseUrl?: string };

/**
 * Builds the display text + audio URLs for one answer outcome. If no
 * pre-generated response exists for this question/stage (e.g. the question
 * hasn't been through the generation script, or this isn't Candlestick
 * Essentials), falls back to the shared prefix alone with no appended text.
 */
export function buildAnswerFeedback(
  stage: AnswerStage,
  questionKey: string | undefined,
  voicePrefixes: VoicePrefixMap,
  voiceConfigByQuestion: QuestionVoiceMap,
): AnswerFeedback {
  const kind = PREFIX_KIND_FOR_STAGE[stage];
  const prefix = voicePrefixes[kind];
  const entry = stage === "correct" || !questionKey ? undefined : voiceConfigByQuestion[questionKey]?.[stage];

  if (!prefix) {
    return {
      text: entry ? `${FALLBACK_PREFIX_TEXT[kind]} - ${entry.text}` : FALLBACK_PREFIX_TEXT[kind],
      prefixUrl: null,
      responseUrl: entry?.audioUrl,
    };
  }

  return {
    text: entry ? `${prefix.text} - ${entry.text}` : prefix.text,
    prefixUrl: prefix.audioUrl,
    responseUrl: entry?.audioUrl,
  };
}
