"use client";

import { useEffect, useRef, useState } from "react";
import { getCoachReply } from "@/lib/aiCoach";
import { prepareCoachTts, speakCoachText, stopVoiceCoach } from "@/lib/voiceCoach";
import { textForSpeech } from "@/lib/speechText";
import type { CoachMessage } from "@/components/lesson/LessonCoachPanel";

type UseLessonCoachParams = {
  lessonTitle: string;
  lessonTopic: string;
  suggestedChips?: string[];
};

/**
 * Standalone version of the coach state/request logic in LessonPlayer.tsx, for
 * lesson components that render outside LessonPlayer (e.g. the bespoke
 * candlestick-essentials lessons) and so can't share its state directly.
 */
export function useLessonCoach({ lessonTitle, lessonTopic, suggestedChips = [] }: UseLessonCoachParams) {
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

    const result = await getCoachReply({
      prompt,
      lessonTitle,
      lessonTopic,
      history: historyForRequest,
      isWrongAttempt,
    });
    const coachText = result.text;

    if (voiceOn && textForSpeech(coachText)) {
      setAiLoadingPhase("voice");
      await prepareCoachTts(coachText);
    }

    setAiHistory((prev) => [...prev, { role: "coach", text: coachText, sectionLabel }]);
    setAiLoading(false);
    setAiLoadingPhase(null);

    // Only the AI's own reply is spoken — sectionLabel is display-only and never reaches TTS.
    if (voiceOn && textForSpeech(coachText)) {
      void speakCoachText(coachText, true);
    }
  };

  /**
   * Auto-triggered on a wrong answer — feeds the actual question, options, and
   * (on a repeat miss) the correct answer to the coach, so the reply is specific
   * to what the learner got wrong instead of a generic "try again".
   */
  const notifyWrongAttempt = ({
    question,
    options,
    correctAnswer,
    userAnswer,
    stage,
    sectionLabel,
  }: {
    question: string;
    options?: string[];
    correctAnswer?: string;
    userAnswer?: string;
    /** "hint" = first miss, don't reveal the answer. "explain" = repeat miss, answer is already shown on screen. */
    stage: "hint" | "explain";
    /** e.g. "Section - 3" — shown on the reply bubble, never spoken. */
    sectionLabel?: string;
  }) => {
    const optionsText = options?.length ? ` Options were: ${options.join(", ")}.` : "";
    const pickedText = userAnswer ? ` I picked "${userAnswer}".` : "";
    const text =
      stage === "hint"
        ? `I got this question wrong on my first try: "${question}".${optionsText}${pickedText} Give me one short hint — don't tell me the answer — so I can retry.`
        : `I got this question wrong again: "${question}".${optionsText}${pickedText} The correct answer is "${correctAnswer ?? ""}". Briefly explain why.`;

    setCollapsed(false);
    void submitCoachPrompt({ text, isWrongAttempt: true, appendUser: false, sectionLabel });
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

  return { aiOpen, setAiOpen, collapsed, setCollapsed, coachPanelProps, notifyWrongAttempt };
}
