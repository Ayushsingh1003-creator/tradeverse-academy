"use client";

import { useDrag } from "@use-gesture/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { ChartTapCandles } from "@/components/lesson/ChartTapCandles";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";
import { DragLabelQuestion } from "@/components/lesson/DragLabelQuestion";
import { LessonVisual } from "@/components/lesson/visuals/LessonVisual";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Confetti } from "@/components/ui/Confetti";
import { useToast } from "@/components/ui/Toast";
import { useXPFloat } from "@/components/ui/XPFloatManager";
import { getCoachReply } from "@/lib/aiCoach";
import { isSoundEnabled, persistSoundPreference, resumeAudioContext, sound } from "@/lib/sounds";
import type { Lesson } from "@/lib/data/lessons";
import { COURSES } from "@/lib/data/courses";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { MENTOR_NAME, MENTOR_TAGLINE } from "@/lib/mentorPersona";
import { suggestedChipsForPage } from "@/lib/lessonAiResponses";
import { useUserStore } from "@/lib/store";
import type {
  ChartTapPage,
  DragLabelPage,
  FillBlankPage,
  LessonPage,
  MultipleChoicePage,
  PracticeQuestion,
  PretestPage,
  TrueFalsePage,
} from "@/types/lessonPage";
import { CoachVoiceInput } from "@/components/lesson/CoachVoiceInput";
import { prepareCoachTts, speakCoachText, stopVoiceCoach } from "@/lib/voiceCoach";
import { textForSpeech } from "@/lib/speechText";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react").then((m) => m.default), { ssr: false });

function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-accent">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function BearishCandleSvg() {
  return (
    <svg viewBox="0 0 120 160" className="mx-auto mb-4 h-40 w-28" aria-label="Bearish candlestick">
      <CandlestickSvg cx={60} bodyWidth={32} ohlc={TEACHING_CANDLES.practiceBearish} wickWidth={2} bodyRx={3} />
    </svg>
  );
}

const CALLOUT_STYLES = {
  tip: { border: "border-blue-500/40 bg-blue-500/10", icon: "💡", label: "Pro Tip:" },
  warning: { border: "border-amber-500/40 bg-amber-500/10", icon: "⚠️", label: "Watch out:" },
  concept: { border: "border-accent/40 bg-accent/10", icon: "🎯", label: "Key Concept:" },
  rule: { border: "border-purple-500/40 bg-purple-500/10", icon: "📌", label: "Trading Rule:" },
} as const;

export function LessonPlayer({ lesson, muxPlaybackId }: { lesson: Lesson; muxPlaybackId?: string | null }) {
  const router = useRouter();
  const { push } = useToast();
  const { trigger } = useXPFloat();
  const { isPremium } = useSubscription();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);

  const pages = lesson.pages;
  const [pageIndex, setPageIndex] = useState(0);
  const [pretestReveal, setPretestReveal] = useState(false);
  const [pretestPick, setPretestPick] = useState<number | null>(null);
  const [phase, setPhase] = useState<"lesson" | "splash" | "practice" | "practiceSummary">("lesson");
  const [videoSkip, setVideoSkip] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<"thinking" | "voice" | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [coachSpeaking, setCoachSpeaking] = useState(false);
  const [practiceIx, setPracticeIx] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [lessonPersisted, setLessonPersisted] = useState(false);

  const [mcPick, setMcPick] = useState<number | null>(null);
  const [mcChecked, setMcChecked] = useState(false);
  const [tfPick, setTfPick] = useState<boolean | null>(null);
  const [tfShow, setTfShow] = useState(false);
  const [fill, setFill] = useState("");
  const [fillChecked, setFillChecked] = useState(false);
  const [dragChecked, setDragChecked] = useState(false);
  const [dragCheckCorrect, setDragCheckCorrect] = useState<boolean | null>(null);
  const [tapPick, setTapPick] = useState<number | null>(null);
  const [tapChecked, setTapChecked] = useState(false);
  const [blockedPremium, setBlockedPremium] = useState(false);

  const [prMc, setPrMc] = useState<number | null>(null);
  const [prMcOk, setPrMcOk] = useState(false);
  const [prTfOk, setPrTfOk] = useState(false);
  const [prFill, setPrFill] = useState("");
  const [prFillOk, setPrFillOk] = useState(false);
  const [prTap, setPrTap] = useState<number | null>(null);
  const [prTapOk, setPrTapOk] = useState(false);
  const [prDragOk, setPrDragOk] = useState(false);

  const [hammerPlaybackActive, setHammerPlaybackActive] = useState(false);
  const [soundsOn, setSoundsOn] = useState(true);
  const [lessonConfetti, setLessonConfetti] = useState(false);
  const [splashConfetti, setSplashConfetti] = useState(false);
  const aiHistoryRef = useRef(aiHistory);

  const page = pages[pageIndex]!;
  const course = COURSES.find((c) => c.id === lesson.courseId);
  const backToCourseHref = course ? `/courses/${course.slug}` : "/courses";
  // Final review = the last lesson of the course (or any level-review slug).
  const isFinalReview = course
    ? course.lessonSlugs[course.lessonSlugs.length - 1] === lesson.slug ||
      course.levels.some((l) => l.reviewSlug === lesson.slug)
    : false;
  // Where to send the user AFTER they fully complete the lesson (and any practice).
  const postCompletionHref = isFinalReview ? "/courses" : backToCourseHref;
  const firstIsPretest = pages[0]?.type === "pretest";
  const showPretestOverlay = phase === "lesson" && pageIndex === 0 && firstIsPretest;
  const showMainContent = phase === "lesson" && (pageIndex > 0 || !firstIsPretest);
  const hideLessonFooter = pageIndex === 0 && firstIsPretest;

  const isPremiumLocked = !lesson.isFree && !isPremium && blockedPremium;

  useEffect(() => {
    aiHistoryRef.current = aiHistory;
  }, [aiHistory]);

  useEffect(() => {
    const last = aiHistory[aiHistory.length - 1];
    if (!last || last.role !== "coach" || !voiceOn) {
      setCoachSpeaking(false);
      stopVoiceCoach();
    }
  }, [aiHistory, voiceOn]);

  useEffect(() => {
    if (!voiceOn) {
      stopVoiceCoach();
      setCoachSpeaking(false);
    }
  }, [voiceOn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSoundsOn(isSoundEnabled());
  }, []);

  useEffect(() => {
    return () => stopVoiceCoach();
  }, []);

  useEffect(() => {
    if (phase !== "splash") return;
    sound.lessonComplete();
    setSplashConfetti(true);
    const t = window.setTimeout(() => setSplashConfetti(false), 2000);
    return () => window.clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    setMcPick(null);
    setMcChecked(false);
    setTfPick(null);
    setTfShow(false);
    setFill("");
    setFillChecked(false);
    setDragChecked(false);
    setDragCheckCorrect(null);
    setTapPick(null);
    setTapChecked(false);
    setHammerPlaybackActive(false);
  }, [pageIndex]);

  useEffect(() => {
    setPrMc(null);
    setPrMcOk(false);
    setPrTfOk(false);
    setPrFill("");
    setPrFillOk(false);
    setPrTap(null);
    setPrTapOk(false);
    setPrDragOk(false);
  }, [practiceIx, phase]);

  const awardXp = (n: number) => {
    trigger(n);
    push(`⚡ +${n} XP`, "xp");
  };

  const currentLessonTopic = page.type === "visual" ? page.visualId ?? page.type : page.type;

  const submitCoachPrompt = async ({
    text,
    isWrongAttempt = false,
    appendUser = true,
  }: {
    text: string;
    isWrongAttempt?: boolean;
    appendUser?: boolean;
  }) => {
    const prompt = text.trim();
    if (!prompt || aiLoading) return;
    if (appendUser) setAiInput("");

    const userTurn = { role: "user" as const, text: prompt };
    const historyForRequest = appendUser
      ? [...aiHistoryRef.current, userTurn]
      : [...aiHistoryRef.current];

    if (appendUser) {
      setAiHistory(historyForRequest);
    }

    setAiLoading(true);
    setAiLoadingPhase("thinking");
    const result = await getCoachReply({
      prompt,
      lessonTitle: lesson.title,
      lessonTopic: String(currentLessonTopic),
      history: historyForRequest,
      isWrongAttempt,
    });
    const coachText = result.text;

    if (voiceOn && textForSpeech(coachText)) {
      setAiLoadingPhase("voice");
      await prepareCoachTts(coachText);
    }

    setAiHistory((prev) => [...prev, { role: "coach", text: coachText }]);
    setAiLoading(false);
    setAiLoadingPhase(null);

    if (voiceOn && textForSpeech(coachText)) {
      setCoachSpeaking(true);
      void speakCoachText(coachText, true, () => setCoachSpeaking(false));
    }
  };

  const handleWrongAttemptCoach = () => {
    void submitCoachPrompt({
      text: "I got this wrong. Give me a short hint so I can retry.",
      isWrongAttempt: true,
      appendUser: false,
    });
  };

  const persistLessonIfNeeded = () => {
    if (lessonPersisted) return;
    setLessonPersisted(true);
    const result = completeLesson({ lessonSlug: lesson.slug, score: 100, xpEarned: lesson.xpReward });
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tv_first_lesson_done", "1");
      window.dispatchEvent(new Event("tv-lesson-complete"));
    }
    if (result.streakIncremented && !result.streakBroken) {
      sound.streak();
      if (result.milestone) {
        push(`${result.milestone} +${result.streakXpAwarded} XP`, "xp");
      } else {
        push(`🔥 Day ${result.streak} streak! +${result.streakXpAwarded} XP`, "success");
      }
    }
    if (result.streakBroken) {
      push("📅 Streak reset — but you're back! Day 1.", "info");
    }
    if (result.freezeEarned) {
      push("🛡️ Streak freeze earned! (max 2)", "success");
    }
    const u = unlockAchievement("a4");
    if (u) push(`🏆 ${u.title}`, "success");
  };

  const goNextPage = () => {
    if (!lesson.isFree && !isPremium && pageIndex >= 1) {
      setBlockedPremium(true);
      return;
    }
    if (pageIndex >= pages.length - 1) {
      persistLessonIfNeeded();
      setPhase("splash");
      return;
    }
    sound.pageTurn();
    setPageIndex((i) => i + 1);
  };

  const bottomClass =
    page.type === "multiple_choice" && mcChecked
      ? mcPick === (page as MultipleChoicePage).correctIndex
        ? "bg-[rgba(69,109,255,0.15)]"
        : "bg-amber-500/10"
      : page.type === "fill_blank" && fillChecked
        ? fill.trim().toLowerCase() === (page as FillBlankPage).correctAnswer.trim().toLowerCase()
          ? "bg-[rgba(69,109,255,0.15)]"
          : "bg-amber-500/10"
        : page.type === "drag_label" && dragChecked
          ? dragCheckCorrect
            ? "bg-[rgba(69,109,255,0.15)]"
            : "bg-amber-500/10"
          : page.type === "chart_tap" && tapChecked
            ? tapPick === (page as ChartTapPage).correctCandleIndex
              ? "bg-[rgba(69,109,255,0.15)]"
              : "bg-amber-500/10"
            : "bg-[#1E1E1E]";

  const renderPage = (p: LessonPage) => {
    switch (p.type) {
      case "text":
        return (
          <div className="transition-all duration-300">
            {p.title ? <h2 className="text-2xl font-bold text-text-primary">{p.title}</h2> : null}
            <div className="mt-4 space-y-4 text-lg leading-relaxed text-text-muted">
              {p.body.split("\n\n").map((para, i) => (
                <p key={i}>
                  <RichText text={para} />
                </p>
              ))}
            </div>
          </div>
        );
      case "visual":
        return (
          <div className="flex min-h-0 flex-col gap-5 transition-all duration-300">
            <div
              className={`flex w-full flex-1 flex-col justify-center ${p.visualId === "HammerCandle" ? "min-h-[min(68vh,480px)]" : "min-h-[240px]"}`}
            >
              <LessonVisual
                visualId={p.visualId}
                onHammerPlaybackActiveChange={p.visualId === "HammerCandle" ? setHammerPlaybackActive : undefined}
              />
            </div>
            {p.caption ? (
              <p className="text-center text-base leading-relaxed text-text-muted">
                <RichText text={p.caption} />
              </p>
            ) : null}
          </div>
        );
      case "callout": {
        const st = CALLOUT_STYLES[p.variant];
        return (
          <div className={`rounded-2xl border p-6 transition-all duration-300 ${st.border}`}>
            <p className="text-sm font-semibold text-text-muted">
              {st.icon} {st.label}
            </p>
            <h3 className="mt-2 text-xl font-bold text-text-primary">{p.title}</h3>
            <p className="mt-3 whitespace-pre-wrap text-text-muted">{p.content}</p>
          </div>
        );
      }
      case "multiple_choice": {
        const pp = p as MultipleChoicePage;
        const show = mcChecked;
        const pickedCorrect = mcPick === pp.correctIndex;
        return (
          <div>
            <p className="text-xl font-semibold leading-snug">{pp.question}</p>
            {pp.showBearishCandle ? <BearishCandleSvg /> : null}
            <div className="mt-6 grid gap-3">
              {pp.options.map((opt, i) => {
                const sel = mcPick === i;
                const correct = i === pp.correctIndex;
                const wrongOpt = show && sel && !correct;
                const correctChosen = show && correct && sel && pickedCorrect;
                const correctReveal = show && correct && !pickedCorrect;
                const dim = show && i !== pp.correctIndex && (pickedCorrect || i !== mcPick);
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={mcChecked}
                    onMouseEnter={() => sound.tick()}
                    onClick={() => {
                      if (!mcChecked) sound.tick();
                      setMcPick(i);
                    }}
                    className={`relative min-h-[56px] rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition-all duration-150 active:scale-[0.99] md:min-h-[52px] ${
                      sel && !show
                        ? "scale-[1.005] border-[#456DFF] bg-[rgba(69,109,255,0.15)] ring-2 ring-[#456DFF]/35"
                        : "border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.20)] hover:bg-[rgba(255,255,255,0.08)]"
                    } ${correctChosen ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.20)] text-[#88C9F7]" : ""} ${
                      wrongOpt ? "animate-wrong-shake border-red-400 bg-red-500/20 text-red-100" : ""
                    } ${correctReveal ? "border-[#456DFF]/60 bg-[rgba(69,109,255,0.15)] text-[#88C9F7]" : ""} ${dim ? "opacity-[0.28]" : ""}`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.08)] text-xs font-bold text-[#999999]">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {correctChosen ? (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-[#88C9F7] animate-pop-in" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                    {wrongOpt ? (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-red-300 animate-pop-in" aria-hidden>
                        ✗
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {mcChecked ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface2/90 p-4 text-sm text-text-muted animate-slide-up-fade">
                <RichText text={pp.explanation} />
              </div>
            ) : null}
          </div>
        );
      }
      case "true_false": {
        const pp = p as TrueFalsePage;
        return (
          <div>
            <p className="text-xl font-semibold">{pp.statement}</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {([true, false] as const).map((v) => {
                const picked = tfPick === v;
                const show = tfShow;
                const ok = show && v === pp.correct;
                const bad = show && picked && v !== pp.correct;
                return (
                  <button
                    key={String(v)}
                    type="button"
                    disabled={tfShow}
                    onClick={() => {
                      setTfPick(v);
                      setTfShow(true);
                      if (v === pp.correct) {
                        sound.correct();
                        awardXp(15);
                      } else {
                        sound.wrong();
                        handleWrongAttemptCoach();
                      }
                    }}
                    className={`flex min-h-[72px] flex-col items-center justify-center rounded-2xl border-2 px-4 py-6 text-lg font-bold transition-all ${
                      v ? "border-[#456DFF]/50 text-[#456DFF]" : "border-red-500/50 text-red-400"
                    } ${picked && !show ? "ring-2 ring-[#456DFF]" : ""} ${ok ? "bg-[rgba(69,109,255,0.15)]" : ""} ${bad ? "animate-shake bg-red-500/10" : ""}`}
                  >
                    {v ? "TRUE" : "FALSE"}
                  </button>
                );
              })}
            </div>
            {tfShow ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface2/80 p-4 text-sm text-text-muted">
                <RichText text={pp.explanation} />
              </div>
            ) : null}
          </div>
        );
      }
      case "fill_blank": {
        const pp = p as FillBlankPage;
        const parts = pp.sentence.split("[___]");
        return (
          <div>
            <p className="text-xl leading-relaxed">
              {parts[0]}
              <input
                value={fill}
                disabled={fillChecked}
                onChange={(e) => setFill(e.target.value)}
                className="mx-1 inline-block w-44 rounded-xl border-2 border-border bg-background px-3 py-2 text-center font-semibold text-text-primary outline-none focus:border-accent"
              />
              {parts[1] ?? ""}
            </p>
            {fillChecked ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface2/80 p-4 text-sm text-text-muted">
                <RichText text={pp.explanation} />
              </div>
            ) : null}
          </div>
        );
      }
      case "drag_label": {
        const pp = p as DragLabelPage;
        return (
          <DragLabelQuestion
            key={pp.id}
            instruction={pp.instruction}
            labels={pp.labels}
            zones={pp.zones}
            explanation={pp.explanation}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(30);
                push("💪 Nice work! Labels placed perfectly.", "success");
              } else {
                sound.wrong();
                handleWrongAttemptCoach();
              }
            }}
            onTryAgain={() => {
              setDragChecked(false);
              setDragCheckCorrect(null);
            }}
          />
        );
      }
      case "chart_tap": {
        const pp = p as ChartTapPage;
        return (
          <div>
            <p className="mb-4 text-xl font-semibold">{pp.question}</p>
            <ChartTapCandles
              count={pp.candleCount ?? 6}
              correctIndex={pp.correctCandleIndex}
              selectedIndex={tapPick}
              onSelect={(i) => !tapChecked && setTapPick(i)}
              highlightStyle={pp.highlightStyle}
              showSupportZone={/support/i.test(pp.question)}
            />
            {tapChecked ? (
              <div className="mt-6 rounded-2xl border border-border bg-surface2/80 p-4 text-sm text-text-muted">
                <RichText text={pp.explanation} />
              </div>
            ) : null}
          </div>
        );
      }
      default:
        return null;
    }
  };

  const practiceQ = lesson.practice?.[practiceIx];

  const advancePractice = () => {
    sound.pageTurn();
    if (!lesson.practice) return;
    if (practiceIx >= lesson.practice.length - 1) {
      setPhase("practiceSummary");
      return;
    }
    setPracticeIx((i) => i + 1);
  };

  const renderPracticeQuestion = (q: PracticeQuestion) => {
    if (q.type === "multiple_choice") {
      return (
        <div>
          <p className="text-lg font-semibold">{q.question}</p>
          <div className="mt-4 grid gap-2">
            {q.options.map((o, i) => (
              <button
                key={i}
                type="button"
                disabled={prMcOk}
                onClick={() => setPrMc(i)}
                className={`min-h-[52px] rounded-xl border px-3 py-3 text-left text-sm ${prMc === i ? "border-accent ring-1 ring-accent" : "border-border bg-surface2"}`}
              >
                {o}
              </button>
            ))}
          </div>
          {!prMcOk ? (
            <button
              type="button"
              disabled={prMc == null}
              className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
              onClick={() => {
                setPrMcOk(true);
                if (prMc === q.correctIndex) {
                  sound.correct();
                  setPracticeCorrect((c) => c + 1);
                  awardXp(10);
                } else {
                  sound.wrong();
                  handleWrongAttemptCoach();
                }
              }}
            >
              Check
            </button>
          ) : (
            <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
              Next →
            </button>
          )}
          {prMcOk ? <p className="mt-4 text-sm text-text-muted">{q.explanation}</p> : null}
        </div>
      );
    }
    if (q.type === "true_false") {
      return (
        <div>
          <p className="text-lg font-semibold">{q.statement}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {([true, false] as const).map((v) => (
              <button
                key={String(v)}
                type="button"
                disabled={prTfOk}
                onClick={() => {
                  setPrTfOk(true);
                  if (v === q.correct) {
                    sound.correct();
                    setPracticeCorrect((c) => c + 1);
                    awardXp(8);
                  } else {
                    sound.wrong();
                    handleWrongAttemptCoach();
                  }
                }}
                className={`rounded-2xl border-2 py-6 text-lg font-bold ${v ? "border-[#456DFF]/40 text-[#456DFF]" : "border-red-500/40 text-red-400"}`}
              >
                {v ? "TRUE" : "FALSE"}
              </button>
            ))}
          </div>
          {prTfOk ? (
            <>
              <p className="mt-4 text-sm text-text-muted">{q.explanation}</p>
              <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
                Next →
              </button>
            </>
          ) : null}
        </div>
      );
    }
    if (q.type === "fill_blank") {
      const parts = q.sentence.split("[___]");
      return (
        <div>
          <p className="text-lg">
            {parts[0]}
            <input
              value={prFill}
              disabled={prFillOk}
              onChange={(e) => setPrFill(e.target.value)}
              className="mx-1 w-36 rounded-lg border border-border bg-background px-2 py-1"
            />
            {parts[1]}
          </p>
          {!prFillOk ? (
            <button
              type="button"
              className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white"
              onClick={() => {
                setPrFillOk(true);
                if (prFill.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                  sound.correct();
                  setPracticeCorrect((c) => c + 1);
                  awardXp(10);
                } else {
                  sound.wrong();
                  handleWrongAttemptCoach();
                }
              }}
            >
              Check
            </button>
          ) : (
            <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
              Next →
            </button>
          )}
        </div>
      );
    }
    if (q.type === "chart_tap") {
      return (
        <div>
          <p className="text-lg font-semibold">{q.question}</p>
          <ChartTapCandles
            count={q.candleCount ?? 6}
            correctIndex={q.correctCandleIndex}
            selectedIndex={prTap}
            onSelect={(i) => !prTapOk && setPrTap(i)}
            highlightStyle={q.highlightStyle}
            showSupportZone={/support/i.test(q.question)}
          />
          {!prTapOk ? (
            <button
              type="button"
              disabled={prTap == null}
              className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
              onClick={() => {
                setPrTapOk(true);
                if (prTap === q.correctCandleIndex) {
                  sound.correct();
                  setPracticeCorrect((c) => c + 1);
                  awardXp(12);
                } else {
                  sound.wrong();
                  handleWrongAttemptCoach();
                }
              }}
            >
              Check
            </button>
          ) : (
            <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
              Next →
            </button>
          )}
        </div>
      );
    }
    if (q.type === "drag_label") {
      return (
        <div className="w-full max-w-xl">
          <DragLabelQuestion
            key={q.id}
            instruction={q.instruction}
            labels={q.labels}
            zones={q.zones}
            explanation={q.explanation}
            onCheckResult={(ok) => {
              setPrDragOk(true);
              if (ok) {
                sound.correct();
                setPracticeCorrect((c) => c + 1);
                awardXp(12);
              } else {
                sound.wrong();
                handleWrongAttemptCoach();
              }
            }}
            onTryAgain={() => setPrDragOk(false)}
          />
          {prDragOk ? (
            <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
              Next →
            </button>
          ) : null}
        </div>
      );
    }
    return null;
  };

  const bindSwipe = useDrag(
    ({ last, velocity: [vx], direction: [dx] }) => {
      if (!last || phase !== "lesson" || showPretestOverlay) return;
      if (vx > 0.2 && dx > 0 && pageIndex > 0) setPageIndex((p) => p - 1);
    },
    { axis: "x", filterTaps: true },
  );

  const progress = ((pageIndex + 1) / pages.length) * 100;
  const progressWidth = showPretestOverlay && !pretestReveal ? 5 : Math.min(100, progress);

  if (phase === "splash") {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141414] px-6 text-center">
        <Confetti active={splashConfetti} count={isFinalReview ? 96 : 48} />
        <div className="text-7xl animate-pop-in">{isFinalReview ? "🎉" : "🏆"}</div>
        <h2 className="mt-6 text-3xl font-black tracking-tight">
          {isFinalReview ? "Course complete!" : "Lesson complete!"}
        </h2>
        <p className="mt-2 text-text-muted">{isFinalReview && course ? course.title : lesson.title}</p>
        <div className="mt-8 rounded-2xl border border-accent/30 bg-slate-800/80 px-10 py-6 shadow-lg shadow-accent/10">
          <AnimatedCounter from={0} to={lesson.xpReward} duration={1000} className="text-5xl font-black text-accent" />
          <p className="mt-2 text-center text-sm font-semibold text-accent">XP earned ⚡</p>
        </div>
        {course ? (
          <p className="mt-4 text-sm text-text-muted">
            {course.title}: {course.lessonSlugs.filter((s) => lessonsCompleted.includes(s)).length}/{course.lessonSlugs.length} lessons in path
          </p>
        ) : null}
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
          {lesson.practice?.length ? (
            <button
              type="button"
              className="rounded-2xl bg-[#456DFF] px-8 py-4 text-lg font-black text-white shadow-md transition hover:brightness-110"
              onClick={() => {
                sound.pageTurn();
                setPhase("practice");
              }}
            >
              Practice now ⚡
            </button>
          ) : null}
          <Link
            href={postCompletionHref}
            className="rounded-2xl border border-border px-8 py-4 font-bold transition hover:bg-surface2"
          >
            {isFinalReview ? "Continue to all paths →" : lesson.practice?.length ? "I'll practice later" : "Back to course"}
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "practiceSummary") {
    const total = lesson.practice?.length ?? 0;
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141414] px-6 text-center">
        <h2 className="text-2xl font-bold">
          {isFinalReview ? "Course finished 🎉" : "Practice complete"}
        </h2>
        <p className="mt-4 text-4xl font-bold text-accent">
          {practiceCorrect}/{total}
        </p>
        <p className="mt-2 text-text-muted">{practiceCorrect >= total * 0.7 ? "Well done!" : "Keep practicing!"}</p>
        <Link
          href={postCompletionHref}
          className="mt-10 rounded-2xl bg-accent px-8 py-4 font-semibold text-slate-900"
        >
          {isFinalReview ? "Continue to all paths →" : "Next Lesson →"}
        </Link>
      </div>
    );
  }

  if (phase === "practice" && practiceQ) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-[#141414] text-text-primary">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-purple-300">PRACTICE MODE</span>
          <button type="button" className="text-text-muted" onClick={() => router.push(backToCourseHref)}>
            Exit
          </button>
        </header>
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-8">
          <div className="mb-4 flex gap-1">
            {lesson.practice!.map((_, i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i < practiceIx ? "bg-accent" : i === practiceIx ? "bg-white" : "bg-slate-600"}`} />
            ))}
          </div>
          <div className="w-full max-w-xl">{renderPracticeQuestion(practiceQ)}</div>
        </div>
      </div>
    );
  }

  const pre0 = pages[0] as PretestPage | undefined;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#141414] text-text-primary">
      <Confetti active={lessonConfetti} count={28} />
      {isPremiumLocked ? (
        <div className="absolute inset-0 z-[300] flex items-center justify-center bg-slate-950/90 p-6">
          <div className="max-w-md rounded-2xl border border-accent/50 bg-surface p-6 text-center">
            <p className="text-accent">🔒 Premium lesson</p>
            <h3 className="mt-3 text-2xl font-bold">Unlock on Premium</h3>
            <Link href="/pricing" className="mt-6 inline-block rounded-2xl bg-[#456DFF] px-6 py-3 font-semibold text-white">
              View plans
            </Link>
          </div>
        </div>
      ) : null}

      {showPretestOverlay && pre0 ? (
        <div className="absolute inset-0 z-[160] flex flex-col items-center justify-center bg-slate-950/95 px-6">
          <p className="text-sm text-accent">🤔 Before we explain…</p>
          <h2 className="mt-4 max-w-lg text-center text-2xl font-bold">{pre0.question}</h2>
          <div className="mt-8 w-full max-w-md space-y-3">
            {pre0.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                disabled={pretestReveal}
                onClick={() => setPretestPick(i)}
                className={`w-full rounded-2xl border px-4 py-4 text-left ${pretestPick === i ? "border-accent ring-2 ring-accent/30" : "border-border bg-surface2"}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {!pretestReveal ? (
            <button
              type="button"
              disabled={pretestPick == null}
              className="mt-8 rounded-2xl bg-[#456DFF] px-10 py-4 font-semibold text-white disabled:opacity-40"
              onClick={() => setPretestReveal(true)}
            >
              Check
            </button>
          ) : (
            <>
              <p className="mt-8 max-w-lg text-center text-text-muted">{pre0.explanation}</p>
              <button
                type="button"
                className="mt-6 rounded-2xl bg-[#456DFF] px-10 py-4 font-semibold text-white"
                onClick={() => {
                  setPageIndex(1);
                  setPretestReveal(false);
                  setPretestPick(null);
                }}
              >
                Let&apos;s learn →
              </button>
            </>
          )}
        </div>
      ) : null}

      <header style={{ background: "#141414", borderBottom: "1px solid rgba(255,255,255,0.10)" }} className="flex h-14 shrink-0 items-center gap-3 px-3 md:px-4">
        <button type="button" className="rounded-xl border border-border px-3 py-2 text-lg" aria-label="Close" onClick={() => router.push(backToCourseHref)}>
          ✕
        </button>
        <div className="h-[3px] flex-1 rounded-full bg-[rgba(255,255,255,0.10)]">
          <div className="h-[3px] rounded-full bg-[linear-gradient(90deg,#456DFF,#88C9F7)] transition-all duration-500" style={{ width: `${progressWidth}%` }} />
        </div>
        <div className="hidden gap-1 sm:flex">
          {pages.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i < pageIndex ? "bg-[#456DFF]" : i === pageIndex ? "bg-white" : "bg-[rgba(255,255,255,0.20)]"}`} />
          ))}
        </div>
        <button
          type="button"
          title={soundsOn ? "Mute sounds" : "Enable sounds"}
          aria-label={soundsOn ? "Mute sounds" : "Enable sounds"}
          onClick={() => {
            const next = !soundsOn;
            persistSoundPreference(next);
            setSoundsOn(next);
            if (next) {
              resumeAudioContext();
              sound.tick();
            }
          }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface2 text-lg text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          {soundsOn ? "🔊" : "🔇"}
        </button>
        <span className="text-sm font-semibold text-accent">⚡ {lesson.xpReward}</span>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-border bg-[#1E1E1E] md:flex">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold">{MENTOR_NAME}</p>
            <p className="mt-0.5 text-xs text-slate-400">{MENTOR_TAGLINE}</p>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">No direct quiz answers — hints only.</p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {aiHistory.map((m, i) => (
              <div key={i} className={`rounded-xl px-3 py-2 ${m.role === "coach" ? "bg-slate-700/80" : "bg-accent/15"}`}>
                {m.text}
              </div>
            ))}
            {aiLoading ? (
              <div className="rounded-xl bg-slate-700/50 px-3 py-2 text-slate-400">
                {aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-border p-3">
            {suggestedChipsForPage(page.type, page.type === "visual" ? page.visualId : undefined).map((c) => (
              <button
                key={c}
                type="button"
                disabled={aiLoading}
                className="rounded-full border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-[#456DFF]/50 hover:bg-[#456DFF]/10 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void submitCoachPrompt({ text: c, appendUser: true })}
              >
                💡 {c}
              </button>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <CoachVoiceInput
              aiInput={aiInput}
              aiLoading={aiLoading}
              aiLoadingLabel={aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
              voiceOn={voiceOn}
              onInputChange={setAiInput}
              onToggleVoice={() => setVoiceOn((v) => !v)}
              onSubmit={() => submitCoachPrompt({ text: aiInput, appendUser: true })}
              onTranscript={(text) => submitCoachPrompt({ text, appendUser: true })}
            />
          </div>
        </aside>

        <main {...bindSwipe()} className="relative flex min-h-0 flex-1 flex-col">
          {muxPlaybackId && !videoSkip ? (
            <div className="border-b border-border p-4">
              <MuxPlayer playbackId={muxPlaybackId} accentColor="#F7C325" onEnded={() => setVideoSkip(true)} style={{ width: "100%", maxHeight: 220, borderRadius: 12 }} />
              <button type="button" className="mt-2 text-sm text-accent underline" onClick={() => setVideoSkip(true)}>
                Skip to lesson
              </button>
            </div>
          ) : null}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 md:px-10">
            <div className="mx-auto flex min-h-0 w-full max-w-[680px] flex-1 flex-col">
              {showMainContent ? renderPage(page) : null}
            </div>
          </div>
        </main>
      </div>

      <footer className={`shrink-0 border-t border-border px-4 py-4 transition-colors ${bottomClass}`}>
        <div className="mx-auto flex max-w-[680px] flex-col gap-3">
          {phase === "lesson" && !hideLessonFooter ? (
            <>
              {page.type === "text" || page.type === "callout" ? (
                <button
                  type="button"
                  className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                  onClick={() => {
                    if (!lesson.isFree && !isPremium && pageIndex >= 1) {
                      setBlockedPremium(true);
                      return;
                    }
                    goNextPage();
                  }}
                >
                  Continue →
                </button>
              ) : null}
              {page.type === "visual" ? (
                page.visualId === "HammerCandle" && hammerPlaybackActive ? null : (
                  <button
                    type="button"
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                    onClick={() => {
                      if (!lesson.isFree && !isPremium && pageIndex >= 1) {
                        setBlockedPremium(true);
                        return;
                      }
                      goNextPage();
                    }}
                  >
                    Continue →
                  </button>
                )
              ) : null}
              {page.type === "multiple_choice" ? (
                !mcChecked ? (
                  <button
                    type="button"
                    disabled={mcPick == null}
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white disabled:opacity-40"
                    onClick={() => {
                      const pp = page as MultipleChoicePage;
                      const ok = mcPick === pp.correctIndex;
                      setMcChecked(true);
                      if (ok) {
                        sound.correct();
                        awardXp(25);
                        setLessonConfetti(true);
                        window.setTimeout(() => setLessonConfetti(false), 1500);
                      } else {
                        sound.wrong();
                        handleWrongAttemptCoach();
                      }
                    }}
                  >
                    Check Answer
                  </button>
                ) : mcPick === (page as MultipleChoicePage).correctIndex ? (
                  <button
                    type="button"
                    className="animate-continue-pulse h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                    onClick={goNextPage}
                  >
                    Continue →
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="h-14 flex-1 rounded-2xl border border-border text-base font-semibold"
                      onClick={() => {
                        setMcChecked(false);
                        setMcPick(null);
                      }}
                    >
                      Try again
                    </button>
                    <button type="button" className="h-14 flex-1 rounded-2xl bg-accent text-base font-semibold text-slate-900" onClick={goNextPage}>
                      Continue anyway →
                    </button>
                  </div>
                )
              ) : null}
              {page.type === "true_false" && tfShow ? (
                <button type="button" className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white" onClick={goNextPage}>
                  Continue →
                </button>
              ) : null}
              {page.type === "fill_blank" ? (
                !fillChecked ? (
                  <button
                    type="button"
                    disabled={!fill.trim()}
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white disabled:opacity-40"
                    onClick={() => {
                      setFillChecked(true);
                      const ok = fill.trim().toLowerCase() === (page as FillBlankPage).correctAnswer.trim().toLowerCase();
                      if (ok) {
                        sound.correct();
                        awardXp(20);
                        push("✓ Exactly right!", "success");
                      } else {
                        sound.wrong();
                        handleWrongAttemptCoach();
                      }
                    }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" className="h-14 flex-1 rounded-2xl border border-border" onClick={() => setFillChecked(false)}>
                      Try again
                    </button>
                    <button type="button" className="h-14 flex-1 rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={goNextPage}>
                      Continue →
                    </button>
                  </div>
                )
              ) : null}
              {page.type === "drag_label" && dragChecked ? (
                <button type="button" className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white" onClick={goNextPage}>
                  Continue →
                </button>
              ) : null}
              {page.type === "chart_tap" ? (
                !tapChecked ? (
                  <button
                    type="button"
                    disabled={tapPick == null}
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white disabled:opacity-40"
                    onClick={() => {
                      setTapChecked(true);
                      if (tapPick === (page as ChartTapPage).correctCandleIndex) {
                        sound.correct();
                        awardXp(25);
                      } else {
                        sound.wrong();
                        handleWrongAttemptCoach();
                      }
                    }}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button type="button" className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white" onClick={goNextPage}>
                    Continue →
                  </button>
                )
              ) : null}
            </>
          ) : null}
        </div>
      </footer>

      <button type="button" className="fixed bottom-24 right-4 z-[130] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl shadow-lg md:hidden" onClick={() => setAiOpen(true)}>
        💬
      </button>
      {aiOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[170] max-h-[70vh] rounded-t-2xl border border-border bg-[#1E1E1E] p-4 md:hidden">
          <div className="mb-2 flex justify-between">
            <span className="font-semibold">{MENTOR_NAME}</span>
            <button type="button" onClick={() => setAiOpen(false)}>
              ✕
            </button>
          </div>
          <CoachVoiceInput
            aiInput={aiInput}
            aiLoading={aiLoading}
            aiLoadingLabel={aiLoadingPhase === "voice" ? "Preparing voice…" : "Thinking…"}
            voiceOn={voiceOn}
            onInputChange={setAiInput}
            onToggleVoice={() => setVoiceOn((v) => !v)}
            onSubmit={() => submitCoachPrompt({ text: aiInput, appendUser: true })}
            onTranscript={(text) => submitCoachPrompt({ text, appendUser: true })}
          />
        </div>
      ) : null}
    </div>
  );
}
