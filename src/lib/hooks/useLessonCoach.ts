"use client";

import { useEffect, useRef, useState } from "react";
import { streamCoachReply } from "@/lib/aiCoach";
import { startStreamingCoachSession, playStaticCoachAudio, stopVoiceCoach } from "@/lib/voiceCoach";
import { CoachTiming } from "@/lib/coachTiming";
import { buildAnswerFeedback, type AnswerStage, type QuestionVoiceMap, type VoicePrefixMap } from "@/lib/answerVoiceFeedback";
import type { CoachMessage } from "@/components/lesson/LessonCoachPanel";

type UseLessonCoachParams = {
  lessonTitle: string;
  lessonTopic: string;
  suggestedChips?: string[];
  /** Pre-generated hint/explain text+audio per question, keyed by questionKey. Empty for lessons without generated content. */
  voiceConfigByQuestion?: QuestionVoiceMap;
  /** The 3 shared "Wrong, try again" / "Wrong answer" / "Correct" clips. */
  voicePrefixes?: VoicePrefixMap;
};

/**
 * Standalone version of the coach state/request logic in LessonPlayer.tsx, for
 * lesson components that render outside LessonPlayer (e.g. the bespoke
 * candlestick-essentials lessons) and so can't share its state directly.
 */
export function useLessonCoach({
  lessonTitle,
  lessonTopic,
  suggestedChips = [],
  voiceConfigByQuestion = {},
  voicePrefixes = {},
}: UseLessonCoachParams) {
  const [aiOpen, setAiOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState<CoachMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<"thinking" | "voice" | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const aiHistoryRef = useRef(aiHistory);

  useEffect(() => {
    aiHistoryRef.current = aiHistory;
  }, [aiHistory]);

  useEffect(() => {
    if (!voiceOn) stopVoiceCoach();
  }, [voiceOn]);

  useEffect(() => {
    return () => stopVoiceCoach();
  }, []);

  const submitCoachPrompt = async ({
    text,
    isWrongAttempt = false,
    appendUser = true,
    sectionLabel,
  }: {
    text: string;
    isWrongAttempt?: boolean;
    appendUser?: boolean;
    /** Visual-only label (e.g. "Section - 3") shown on the reply bubble — kept out of the spoken text. */
    sectionLabel?: string;
  }) => {
    const prompt = text.trim();
    if (!prompt || aiLoading) return;
    if (appendUser) setAiInput("");

    const userTurn: CoachMessage = { role: "user", text: prompt };
    const historyForRequest = appendUser ? [...aiHistoryRef.current, userTurn] : [...aiHistoryRef.current];

    if (appendUser) setAiHistory(historyForRequest);

    setAiLoading(true);
    setAiLoadingPhase("thinking");

    // Placeholder bubble filled in as text streams — sectionLabel is display-only and never reaches TTS.
    setAiHistory((prev) => [...prev, { role: "coach", text: "", sectionLabel }]);
    const setCoachBubbleText = (bubbleText: string) => {
      setAiHistory((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], text: bubbleText };
        return next;
      });
    };

    const timing = new CoachTiming();
    timing.mark("requestStart");
    const session = voiceOn ? startStreamingCoachSession(undefined, timing) : null;

    let streamedText = "";
    let firstChunk = true;
    const result = await streamCoachReply(
      { prompt, lessonTitle, lessonTopic, history: historyForRequest, isWrongAttempt },
      (delta) => {
        if (firstChunk) {
          firstChunk = false;
          setAiLoading(false);
          setAiLoadingPhase(null);
        }
        session?.feedText(delta);
        streamedText += delta;
        setCoachBubbleText(streamedText);
      },
      { timing },
    );

    // Nothing ever streamed (e.g. the request failed outright) — speak the local fallback reply instead.
    if (firstChunk && result.text) session?.feedText(result.text);
    session?.finish();
    setCoachBubbleText(result.text);
    setAiLoading(false);
    setAiLoadingPhase(null);
  };

  /**
   * Auto-triggered after a question is answered — shows/plays the
   * pre-generated hint/explain/correct feedback for this question if the
   * generation script has produced one, else falls back to the shared prefix
   * clip alone ("Wrong, try again" / "Wrong answer" / "Correct"). No live AI
   * call: these questions are fixed content, so their feedback is generated
   * once offline (see scripts/voice-responses/generate.ts).
   */
  const notifyAnswerOutcome = ({
    stage,
    questionKey,
    sectionLabel,
  }: {
    stage: AnswerStage;
    questionKey?: string;
    /** e.g. "Section - 3" — shown on the reply bubble, never spoken. */
    sectionLabel?: string;
  }) => {
    const feedback = buildAnswerFeedback(stage, questionKey, voicePrefixes, voiceConfigByQuestion);
    // "Correct" is audio-only — no chat bubble, so a stream of right answers doesn't clutter the panel.
    if (stage !== "correct") {
      setCollapsed(false);
      setAiHistory((prev) => [...prev, { role: "coach", text: feedback.text, sectionLabel }]);
    }
    if (voiceOn) {
      playStaticCoachAudio({ prefixUrl: feedback.prefixUrl, responseUrl: feedback.responseUrl });
    }
  };

  const coachPanelProps = {
    aiHistory,
    aiLoading,
    aiLoadingPhase,
    aiInput,
    voiceOn,
    suggestedChips,
    onChipClick: (text: string) => void submitCoachPrompt({ text, appendUser: true }),
    onInputChange: setAiInput,
    onToggleVoice: () => setVoiceOn((v) => !v),
    onSubmit: () => void submitCoachPrompt({ text: aiInput, appendUser: true }),
    onTranscript: (text: string) => void submitCoachPrompt({ text, appendUser: true }),
  };

  return { aiOpen, setAiOpen, collapsed, setCollapsed, coachPanelProps, notifyAnswerOutcome };
}
