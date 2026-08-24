"use client";

import { useDrag } from "@use-gesture/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { ChartTapCandles } from "@/components/lesson/ChartTapCandles";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";
import { CandleFuseQuestion } from "@/components/lesson/CandleFuseQuestion";
import { ChartCompareQuestion } from "@/components/lesson/ChartCompareQuestion";
import { ChartReadingChoiceGrid } from "@/components/lesson/ChartReadingChoiceGrid";
import { ChartReadingTapQuestion } from "@/components/lesson/ChartReadingTapQuestion";
import { DragLabelQuestion } from "@/components/lesson/DragLabelQuestion";
import { FoldConnectQuestion } from "@/components/lesson/FoldConnectQuestion";
import { FoldOhlcDragQuestion } from "@/components/lesson/FoldOhlcDragQuestion";
import { TimeBracketDragQuestion } from "@/components/lesson/TimeBracketDragQuestion";
import { TimeframeOrderDrag } from "@/components/lesson/TimeframeOrderDrag";
import { LessonImageFrame } from "@/components/lesson/LessonImageFrame";
import { LessonVisual } from "@/components/lesson/visuals/LessonVisual";
import { VisualChoiceGrid } from "@/components/lesson/VisualChoiceGrid";
import { FifteenMinChoiceGrid } from "@/components/lesson/visuals/ChartReadingVisuals";
import { FourHourFoldChoiceGrid } from "@/components/lesson/FourHourFoldChoiceGrid";
import { TextOptionChoiceGrid } from "@/components/lesson/TextOptionChoiceGrid";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Confetti } from "@/components/ui/Confetti";
import { useToast } from "@/components/ui/Toast";
import { useXPFloat } from "@/components/ui/XPFloatManager";
import { streamCoachReply } from "@/lib/aiCoach";
import { isSoundEnabled, persistSoundPreference, resumeAudioContext, sound } from "@/lib/sounds";
import type { Lesson } from "@/lib/data/lessons";
import { COURSES } from "@/lib/data/courses";
import { applyLessonImageConfigMap } from "@/lib/lessonImageOverrides";
import type { LessonImageAdminConfig } from "@/lib/lessonImageOverrides";
import { buildLibraryCourseHref } from "@/lib/libraryReturn";
import {
  readInitialLessonResumeState,
  shouldResumeLessonToCompletionSplash,
} from "@/lib/libraryLearnResume";
import { postLibraryLearnProgress } from "@/lib/libraryProgressClient";
import { readLocalLibraryProgress } from "@/lib/libraryProgressLocal";
import { suggestedChipsForPage } from "@/lib/lessonAiResponses";
import { useUserStore } from "@/lib/store";
import type {
  CandleFusePage,
  ChartComparePage,
  ChartTapPage,
  DragLabelPage,
  DragOrderPage,
  FillBlankPage,
  FoldConnectPage,
  FoldChartChoicePage,
  FoldOhlcDragPage,
  LessonImageRef,
  LessonPage,
  MultipleChoicePage,
  PracticeQuestion,
  PretestPage,
  TapChoicePage,
  TimeBracketDragPage,
  TrueFalsePage,
  UiChoicePage,
  VisualChoicePage,
} from "@/types/lessonPage";
import { LessonCoachAside, LessonCoachMobile } from "@/components/lesson/LessonCoachPanel";
import { startStreamingCoachSession, stopVoiceCoach } from "@/lib/voiceCoach";
import { CoachTiming } from "@/lib/coachTiming";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RichText } from "@/components/ui/RichText";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react").then((m) => m.default), { ssr: false });

function BearishCandleSvg() {
  return (
    <svg viewBox="0 0 120 160" className="mx-auto mb-4 h-40 w-28" aria-label="Bearish candlestick">
      <CandlestickSvg cx={60} bodyWidth={32} ohlc={TEACHING_CANDLES.practiceBearish} wickWidth={2} bodyRx={3} />
    </svg>
  );
}

function GamifiedBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-accent">
      <span aria-hidden>⚡</span>
      {label}
    </div>
  );
}

function LessonImageSlot({ image }: { image?: LessonImageRef }) {
  if (!image) return null;
  return (
    <LessonImageFrame
      alt={image.alt}
      src={image.src}
      widthPercent={image.widthPercent}
      align={image.align}
    />
  );
}

/** Consistent vertical rhythm for every lesson screen */
function PageShell({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-5 pb-8">{children}</div>;
}

/** Renders lesson question/instruction copy with **bold** markdown. */
function LessonPrompt({
  text,
  className = "text-[1.1rem] font-semibold leading-normal text-text-primary md:text-[1.2375rem]",
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length <= 1) {
    return (
      <p className={className}>
        <RichText text={text} />
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {paragraphs.map((para, i) => (
        <p key={i} className={className}>
          <RichText text={para.trim()} />
        </p>
      ))}
    </div>
  );
}

/** Question on the left, interactive options on the right (used by candlestick lesson). */
function QuestionLayout({
  badge,
  image,
  question,
  children,
  footer,
}: {
  badge?: ReactNode;
  image?: LessonImageRef;
  question: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PageShell>
      {badge ? <div className="mb-5">{badge}</div> : null}
      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-8">
        <div className="flex flex-col gap-5 md:sticky md:top-0">
          <LessonImageSlot image={image} />
          {typeof question === "string" ? (
            <LessonPrompt
              text={question}
              className="text-[1.1rem] font-semibold leading-normal text-text-primary md:text-[1.2375rem]"
            />
          ) : (
            question
          )}
        </div>
        <div className="min-w-0 flex flex-col gap-3">{children}</div>
      </div>
      {footer}
    </PageShell>
  );
}

function LessonNavArrow({
  direction,
  disabled,
  onClick,
  label,
  placement = "absolute",
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
  placement?: "absolute" | "inline";
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const placementClass =
    placement === "inline"
      ? "relative shrink-0"
      : `absolute top-1/2 z-20 -translate-y-1/2 ${direction === "prev" ? "left-2 md:left-4" : "right-2 md:right-4"}`;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${placementClass} flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#1E1E1E]/95 text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#456DFF]/50 hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-25 sm:h-11 sm:w-11`}
    >
      <Icon size={22} strokeWidth={2.5} />
    </button>
  );
}

function FillBlankFeedback({
  userAnswer,
  correctAnswer,
  explanation,
}: {
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}) {
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
  return (
    <div className="rounded-2xl border border-border bg-surface2/80 p-4 text-sm leading-relaxed text-text-muted">
      <p className="mb-2 font-semibold text-text-primary">
        {isCorrect ? "Correct!" : "Correct answer:"}{" "}
        <span className={isCorrect ? "text-[#88C9F7]" : "text-accent"}>{correctAnswer}</span>
      </p>
      <RichText text={explanation} />
    </div>
  );
}

const CALLOUT_STYLES = {
  tip: { border: "border-blue-500/40 bg-blue-500/10", icon: "💡", label: "Pro Tip:" },
  warning: { border: "border-amber-500/40 bg-amber-500/10", icon: "⚠️", label: "Watch out:" },
  concept: { border: "border-accent/40 bg-accent/10", icon: "🎯", label: "Key Concept:" },
  rule: { border: "border-purple-500/40 bg-purple-500/10", icon: "📌", label: "Trading Rule:" },
} as const;

export function LessonPlayer({
  lesson,
  imageConfigByPageId = {},
  muxPlaybackId,
  libraryCourseSlug,
}: {
  lesson: Lesson;
  /** Admin-configured image URL, width, and alignment keyed by page / question id. */
  imageConfigByPageId?: Record<string, LessonImageAdminConfig>;
  muxPlaybackId?: string | null;
  /** Library course slug from `?library=` when opened from `/library/[slug]`. */
  libraryCourseSlug?: string;
}) {
  const router = useRouter();
  const { push } = useToast();
  const { trigger } = useXPFloat();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);
  const resolvedLesson = useMemo(
    () => applyLessonImageConfigMap(lesson, imageConfigByPageId),
    [lesson, imageConfigByPageId],
  );
  const initialResume = readInitialLessonResumeState(
    libraryCourseSlug,
    resolvedLesson.slug,
    useUserStore.getState().lessonsCompleted,
  );

  const pages = resolvedLesson.pages;
  const [pageIndex, setPageIndex] = useState(0);
  const [pretestReveal, setPretestReveal] = useState(false);
  const [pretestPick, setPretestPick] = useState<number | null>(null);
  const [phase, setPhase] = useState<"lesson" | "splash" | "practice" | "practiceSummary">(
    initialResume.phase,
  );
  const [videoSkip, setVideoSkip] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiHistory, setAiHistory] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingPhase, setAiLoadingPhase] = useState<"thinking" | "voice" | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [, setCoachSpeaking] = useState(false);
  const [practiceIx, setPracticeIx] = useState(0);
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [lessonPersisted, setLessonPersisted] = useState(initialResume.lessonPersisted);
  const [splashFromResume, setSplashFromResume] = useState(initialResume.splashFromResume);

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

  const splitQuestionLayout = lesson.courseId === "c1";
  const page = pages[pageIndex]!;
  const isQuestionPage =
    page.type === "visual_choice" ||
    page.type === "fold_chart_choice" ||
    page.type === "ui_choice" ||
    page.type === "tap_choice" ||
    page.type === "chart_compare" ||
    page.type === "multiple_choice" ||
    page.type === "true_false" ||
    page.type === "fill_blank" ||
    page.type === "drag_label" ||
    page.type === "chart_tap";
  const contentMaxWidth = splitQuestionLayout && isQuestionPage ? "" : "";
  const footerMaxWidth = splitQuestionLayout ? "max-w-[780px]" : "max-w-[640px]";
  const course = COURSES.find((c) => c.id === lesson.courseId);
  const fromLibrary = Boolean(libraryCourseSlug?.trim());
  const libraryBackHref = fromLibrary ? buildLibraryCourseHref(libraryCourseSlug!) : null;
  const backToCourseHref = libraryBackHref ?? (course ? `/courses/${course.slug}` : "/courses");
  // Final review = the last lesson of the course (or any level-review slug).
  const isFinalReview = course
    ? course.lessonSlugs[course.lessonSlugs.length - 1] === lesson.slug ||
      (course.levels?.some((l) => l.reviewSlug === lesson.slug) ?? false)
    : false;
  // Where to send the user AFTER they fully complete the lesson (and any practice).
  const postCompletionHref = fromLibrary
    ? libraryBackHref!
    : isFinalReview
      ? "/courses"
      : backToCourseHref;
  const completionExitLabel = fromLibrary
    ? "Back to course"
    : isFinalReview
      ? "Continue to all paths →"
      : resolvedLesson.practice?.length
        ? "I'll practice later"
        : "Back to course";
  const practiceSummaryExitLabel = fromLibrary
    ? "Back to course"
    : isFinalReview
      ? "Continue to all paths →"
      : "Next Lesson →";
  const firstIsPretest = pages[0]?.type === "pretest";
  const showPretestOverlay = phase === "lesson" && pageIndex === 0 && firstIsPretest;
  const showMainContent = phase === "lesson" && (pageIndex > 0 || !firstIsPretest);
  const hideLessonFooter = pageIndex === 0 && firstIsPretest;

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
    if (phase !== "splash" || splashFromResume) return;
    sound.lessonComplete();
    setSplashConfetti(true);
    const t = window.setTimeout(() => setSplashConfetti(false), 2000);
    return () => window.clearTimeout(t);
  }, [phase, splashFromResume]);

  useEffect(() => {
    if (!libraryCourseSlug?.trim()) return;

    const localEntry = readLocalLibraryProgress(libraryCourseSlug.trim()).find(
      (row) => row.learnSlug === lesson.slug,
    );

    const applyResume = (entry?: { lessonCompleted: boolean }) => {
      if (!shouldResumeLessonToCompletionSplash(entry, lesson.slug, lessonsCompleted)) return;
      setSplashFromResume(true);
      setLessonPersisted(true);
      setPhase("splash");
    };

    if (localEntry) {
      applyResume(localEntry);
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/library/progress?slug=${encodeURIComponent(libraryCourseSlug.trim())}`,
          { credentials: "include", cache: "no-store" },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as {
          summary?: { entries: { learnSlug: string; lessonCompleted: boolean; practiceTotal: number }[] };
        };
        const serverEntry = data.summary?.entries.find((e) => e.learnSlug === lesson.slug);
        if (serverEntry) applyResume(serverEntry);
      } catch {
        /* keep local resume */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [libraryCourseSlug, lesson.slug, lessonsCompleted]);

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
    const lessonTopic =
      phase === "practice"
        ? `practice-${resolvedLesson.practice?.[practiceIx]?.type ?? "question"}`
        : String(currentLessonTopic);

    // Placeholder bubble filled in as text streams.
    setAiHistory((prev) => [...prev, { role: "coach", text: "" }]);
    const setCoachBubbleText = (bubbleText: string) => {
      setAiHistory((prev) => {
        const next = [...prev];
        next[next.length - 1] = { ...next[next.length - 1], text: bubbleText };
        return next;
      });
    };

    const timing = new CoachTiming();
    timing.mark("requestStart");
    const session = voiceOn ? startStreamingCoachSession(() => setCoachSpeaking(false), timing) : null;
    if (session) setCoachSpeaking(true);

    let streamedText = "";
    let firstChunk = true;
    const result = await streamCoachReply(
      { prompt, lessonTitle: lesson.title, lessonTopic, history: historyForRequest, isWrongAttempt },
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

  const handleWrongAttemptCoach = () => {
    void submitCoachPrompt({
      text: "I got this wrong. Give me a short hint so I can retry.",
      isWrongAttempt: true,
      appendUser: false,
    });
  };

  const saveLibraryLearnProgress = (opts: {
    practiceCorrect?: number;
    practiceTotal?: number;
    lessonCompleted?: boolean;
  }) => {
    if (!libraryCourseSlug?.trim()) return;
    void postLibraryLearnProgress({
      courseSlug: libraryCourseSlug.trim(),
      learnSlug: lesson.slug,
      practiceCorrect: opts.practiceCorrect ?? 0,
      practiceTotal: opts.practiceTotal ?? 0,
      lessonCompleted: opts.lessonCompleted ?? true,
    });
  };

  useEffect(() => {
    if (!libraryCourseSlug?.trim() || phase !== "practiceSummary") return;
    const total = resolvedLesson.practice?.length ?? 0;
    if (total === 0) return;
    saveLibraryLearnProgress({
      practiceCorrect,
      practiceTotal: total,
      lessonCompleted: true,
    });
  }, [phase, libraryCourseSlug, practiceCorrect, resolvedLesson.practice?.length, lesson.slug]);

  const persistLessonIfNeeded = () => {
    if (lessonPersisted) return;
    setLessonPersisted(true);
    if (libraryCourseSlug?.trim()) {
      saveLibraryLearnProgress({ lessonCompleted: true });
    }
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

  const restartLesson = () => {
    setSplashFromResume(false);
    setSplashConfetti(false);
    setPhase("lesson");
    setPageIndex(0);
    setPretestReveal(false);
    setPretestPick(null);
    setPracticeIx(0);
    setPracticeCorrect(0);
    setVideoSkip(false);
  };

  const isCurrentStepComplete = (): boolean => {
    if (phase === "practice") {
      const q = resolvedLesson.practice?.[practiceIx];
      if (!q) return true;
      switch (q.type) {
        case "visual_choice":
        case "fold_chart_choice":
        case "ui_choice":
        case "multiple_choice":
          return prMcOk;
        case "tap_choice":
        case "chart_compare":
        case "chart_tap":
          return prTapOk;
        case "true_false":
          return prTfOk;
        case "fill_blank":
          return prFillOk;
        case "time_bracket_drag":
        case "candle_fuse":
        case "fold_connect":
        case "time_bracket_drag":
        case "fold_ohlc_drag":
        case "drag_order":
        case "drag_label":
          return prDragOk;
        default:
          return true;
      }
    }

    switch (page.type) {
      case "intro":
      case "text":
      case "callout":
      case "image":
        return true;
      case "visual":
        return !(page.visualId === "HammerCandle" && hammerPlaybackActive);
      case "fold_chart_choice":
      case "ui_choice":
      case "multiple_choice":
      case "visual_choice":
        return mcChecked;
      case "true_false":
        return tfShow;
      case "fill_blank":
        return fillChecked;
      case "candle_fuse":
      case "fold_connect":
      case "time_bracket_drag":
      case "fold_ohlc_drag":
      case "drag_order":
      case "drag_label":
        return dragChecked;
      case "chart_compare":
      case "tap_choice":
      case "chart_tap":
        return tapChecked;
      default:
        return true;
    }
  };

  const goNextPage = () => {
    if (!isCurrentStepComplete()) return;
    if (pageIndex >= pages.length - 1) {
      persistLessonIfNeeded();
      setSplashFromResume(false);
      setPhase("splash");
      return;
    }
    sound.pageTurn();
    setPageIndex((i) => i + 1);
  };

  const goPrevPage = () => {
    if (pageIndex <= 0) return;
    sound.pageTurn();
    setPageIndex((i) => i - 1);
  };

  const goPrevPractice = () => {
    if (practiceIx <= 0) return;
    sound.pageTurn();
    setPracticeIx((i) => i - 1);
  };

  const bottomClass =
    (page.type === "multiple_choice" || page.type === "visual_choice" || page.type === "fold_chart_choice" || page.type === "ui_choice") && mcChecked
      ? mcPick === (page as MultipleChoicePage | VisualChoicePage | FoldChartChoicePage | UiChoicePage).correctIndex
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
          : page.type === "chart_compare" && tapChecked
            ? tapPick === (page as ChartComparePage).correctIndex
              ? "bg-[rgba(69,109,255,0.15)]"
              : "bg-amber-500/10"
            : page.type === "tap_choice" && tapChecked
            ? tapPick === (page as TapChoicePage).correctIndex
              ? "bg-[rgba(69,109,255,0.15)]"
              : "bg-amber-500/10"
            : page.type === "chart_tap" && tapChecked
            ? tapPick === (page as ChartTapPage).correctCandleIndex
              ? "bg-[rgba(69,109,255,0.15)]"
              : "bg-amber-500/10"
            : "bg-[#1E1E1E]";

  const renderPage = (p: LessonPage) => {
    switch (p.type) {
      case "intro":
        return (
          <PageShell>
            <div className="flex flex-col items-center text-center">
              <LessonImageSlot image={p.image} />
              <h2 className="mt-4 text-[1.65rem] font-bold leading-tight text-text-primary md:text-[2rem]">{p.title}</h2>
              {p.subtitle ? (
                <p className="mt-3 max-w-md text-[1.1rem] leading-relaxed text-text-muted md:text-[1.2375rem]">
                  <RichText text={p.subtitle} />
                </p>
              ) : null}
            </div>
          </PageShell>
        );
      case "text":
        return (
          <PageShell>
            {p.badge ? <GamifiedBadge label={p.badge} /> : null}
            <LessonImageSlot image={p.image} />
            {p.title ? <h2 className="text-[1.375rem] font-bold leading-tight text-text-primary md:text-[1.65rem]">{p.title}</h2> : null}
            <div className="space-y-4 text-[1.1rem] leading-relaxed text-text-muted md:text-[1.2375rem]">
              {p.body.split("\n\n").map((para, i) => (
                <p key={i}>
                  <RichText text={para} />
                </p>
              ))}
            </div>
          </PageShell>
        );
      case "image":
        return (
          <PageShell>
            {p.badge ? <GamifiedBadge label={p.badge} /> : null}
            <LessonImageFrame alt={p.alt} src={p.src} widthPercent={p.widthPercent} align={p.align} />
            {p.title ? <h2 className="text-[1.375rem] font-bold leading-tight text-text-primary md:text-[1.65rem]">{p.title}</h2> : null}
            {p.caption ? (
              <p className="text-[1.1rem] leading-relaxed text-text-muted md:text-[1.2375rem]">
                <RichText text={p.caption} />
              </p>
            ) : null}
          </PageShell>
        );
      case "visual":
        return (
          <PageShell>
            <div
              className={`flex w-full flex-col justify-center ${p.visualId === "HammerCandle" ? "min-h-[min(60vh,420px)]" : "min-h-[220px]"}`}
            >
              <LessonVisual
                visualId={p.visualId}
                onHammerPlaybackActiveChange={p.visualId === "HammerCandle" ? setHammerPlaybackActive : undefined}
              />
            </div>
            {p.caption ? (
              <p className="text-center text-[1.1rem] leading-relaxed text-text-muted md:text-[1.2375rem]">
                <RichText text={p.caption} />
              </p>
            ) : null}
          </PageShell>
        );
      case "callout": {
        const st = CALLOUT_STYLES[p.variant];
        return (
          <PageShell>
            <div className={`rounded-2xl border p-6 md:p-8 ${st.border}`}>
              {p.badge ? <div className="mb-4"><GamifiedBadge label={p.badge} /></div> : null}
              <p className="text-sm font-semibold text-text-muted">
                {st.icon} {st.label}
              </p>
              <LessonImageSlot image={p.image} />
              <h3 className="mt-3 text-[1.2375rem] font-bold leading-snug text-text-primary md:text-[1.375rem]">{p.title}</h3>
              <div className="mt-5 space-y-3.5 text-[1.05rem] leading-relaxed text-text-muted md:space-y-4 md:text-[1.1rem] md:leading-loose">
                {p.content.split("\n").map((line, i) => (
                  <p key={i}>
                    <RichText text={line} />
                  </p>
                ))}
              </div>
            </div>
          </PageShell>
        );
      }
      case "visual_choice": {
        const pp = p as VisualChoicePage;
        const grid = (
          <VisualChoiceGrid
            options={pp.options}
            selectedIndex={mcPick}
            checked={mcChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => {
              if (!mcChecked) {
                sound.tick();
                setMcPick(i);
              }
            }}
          />
        );
        const explanationBlock = mcChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.question}
              footer={explanationBlock}
            >
              {grid}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-snug text-text-primary" />
            {grid}
            {explanationBlock}
          </PageShell>
        );
      }
      case "chart_compare": {
        const pp = p as ChartComparePage;
        const grid = (
          <ChartCompareQuestion
            variants={pp.variants}
            selectedIndex={tapPick}
            checked={tapChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => !tapChecked && setTapPick(i)}
            disabled={tapChecked}
          />
        );
        const explanationBlock = tapChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;
        if (splitQuestionLayout) {
          return (
            <QuestionLayout badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null} image={pp.image} question={pp.question} footer={explanationBlock}>
              {grid}
            </QuestionLayout>
          );
        }
        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-normal text-text-primary" />
            {grid}
            {explanationBlock}
          </PageShell>
        );
      }
      case "time_bracket_drag": {
        const pp = p as TimeBracketDragPage;
        const dragUi = (
          <TimeBracketDragQuestion
            key={pp.id}
            correctCandleIndex={pp.correctCandleIndex}
            explanation={pp.explanation}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(30);
              } else {
                sound.wrong();
                handleWrongAttemptCoach();
              }
            }}
          />
        );
        if (splitQuestionLayout) {
          return (
            <QuestionLayout badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null} image={pp.image} question={pp.instruction}>
              {dragUi}
            </QuestionLayout>
          );
        }
        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonPrompt text={pp.instruction} className="text-lg font-semibold text-text-primary" />
            {dragUi}
          </PageShell>
        );
      }
      case "fold_connect": {
        const pp = p as FoldConnectPage;
        const dragUi = (
          <FoldConnectQuestion
            key={pp.id}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(35);
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
        if (splitQuestionLayout) {
          return (
            <QuestionLayout badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null} image={pp.image} question={pp.instruction}>
              {dragUi}
              {dragChecked && pp.explanation ? (
                <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm text-text-muted">
                  <RichText text={pp.explanation} />
                </div>
              ) : null}
            </QuestionLayout>
          );
        }
        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonPrompt text={pp.instruction} className="text-lg font-semibold text-text-primary" />
            {dragUi}
          </PageShell>
        );
      }
      case "candle_fuse": {
        const pp = p as CandleFusePage;
        const fuseUi = (
          <CandleFuseQuestion
            key={pp.id}
            correctResultIndex={pp.correctResultIndex}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(35);
              } else {
                sound.wrong();
                handleWrongAttemptCoach();
              }
            }}
          />
        );
        if (splitQuestionLayout) {
          return (
            <QuestionLayout badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null} image={pp.image} question={pp.instruction}>
              {fuseUi}
              {dragChecked && pp.explanation ? (
                <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm text-text-muted">
                  <RichText text={pp.explanation} />
                </div>
              ) : null}
            </QuestionLayout>
          );
        }
        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonPrompt text={pp.instruction} className="text-lg font-semibold text-text-primary" />
            {fuseUi}
          </PageShell>
        );
      }
      case "tap_choice": {
        const pp = p as TapChoicePage;
        const tapUi = (
          <ChartReadingTapQuestion
            diagram={pp.diagram}
            selectedIndex={tapPick}
            checked={tapChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => !tapChecked && setTapPick(i)}
            disabled={tapChecked}
          />
        );
        const explanationBlock = tapChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.question}
              footer={explanationBlock}
            >
              {tapUi}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-snug text-text-primary" />
            {tapUi}
            {explanationBlock}
          </PageShell>
        );
      }
      case "ui_choice": {
        const pp = p as UiChoicePage;
        const grid = (
          <ChartReadingChoiceGrid
            options={pp.options}
            columns={pp.columns}
            selectedIndex={mcPick}
            checked={mcChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => {
              if (!mcChecked) {
                sound.tick();
                setMcPick(i);
              }
            }}
          />
        );
        const explanationBlock = mcChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.question}
              footer={explanationBlock}
            >
              {grid}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-snug text-text-primary" />
            {grid}
            {explanationBlock}
          </PageShell>
        );
      }
      case "fold_chart_choice": {
        const pp = p as FoldChartChoicePage;
        const variant = pp.variant ?? "15m_fuse";
        const isTextOptions = variant === "text_options";
        const is4h = variant === "4h_fold";
        const grid = isTextOptions ? (
          <TextOptionChoiceGrid
            selectedIndex={mcPick}
            checked={mcChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => {
              if (!mcChecked) {
                sound.tick();
                setMcPick(i);
              }
            }}
            disabled={mcChecked}
          />
        ) : is4h ? (
          <FourHourFoldChoiceGrid
            selectedIndex={mcPick}
            checked={mcChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => {
              if (!mcChecked) {
                sound.tick();
                setMcPick(i);
              }
            }}
            disabled={mcChecked}
          />
        ) : (
          <FifteenMinChoiceGrid
            selectedIndex={mcPick}
            checked={mcChecked}
            correctIndex={pp.correctIndex}
            onSelect={(i) => {
              if (!mcChecked) {
                sound.tick();
                setMcPick(i);
              }
            }}
            disabled={mcChecked}
          />
        );
        const explanationBlock = mcChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={
                <>
                  <RichText text={pp.question} />
                  <p className="mt-2 text-sm font-normal text-text-muted">
                    {isTextOptions
                      ? "Select the right answer:"
                      : is4h
                        ? "Pick the matching **4H** candle (A–D)."
                        : "Select the right answer:"}
                  </p>
                </>
              }
              footer={explanationBlock}
            >
              {grid}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-normal text-text-primary" />
            <p className="text-sm text-text-muted">
              {is4h ? "Pick the matching 4H candle (A–D)." : "Select the right answer:"}
            </p>
            {grid}
            {explanationBlock}
          </PageShell>
        );
      }
      case "multiple_choice": {
        const pp = p as MultipleChoicePage;
        const show = mcChecked;
        const pickedCorrect = mcPick === pp.correctIndex;
        const optionsGrid = (
          <div className="grid gap-3">
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
        );
        const explanationBlock = mcChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm leading-relaxed text-text-muted animate-slide-up-fade">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.question}
              footer={explanationBlock}
            >
              {pp.showBearishCandle ? <BearishCandleSvg /> : null}
              {optionsGrid}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold leading-snug text-text-primary" />
            {pp.showBearishCandle ? <BearishCandleSvg /> : null}
            {optionsGrid}
            {explanationBlock}
          </PageShell>
        );
      }
      case "true_false": {
        const pp = p as TrueFalsePage;
        const tfButtons = (
          <div className={pp.vertical === false ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
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
        );
        const explanationBlock = tfShow ? (
          <div className="rounded-2xl border border-border bg-surface2/80 p-4 text-sm leading-relaxed text-text-muted">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.statement}
              footer={explanationBlock}
            >
              {tfButtons}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.statement} className="text-xl font-semibold text-text-primary" />
            {tfButtons}
            {explanationBlock}
          </PageShell>
        );
      }
      case "fill_blank": {
        const pp = p as FillBlankPage;
        const parts = pp.sentence.split("[___]");
        const answerPanel = (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">Your answer</label>
            <input
              value={fill}
              disabled={fillChecked}
              onChange={(e) => setFill(e.target.value)}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-center text-lg font-semibold text-text-primary outline-none focus:border-accent"
              placeholder="Type here…"
            />
          </div>
        );
        const explanationBlock = fillChecked ? (
          <FillBlankFeedback userAnswer={fill} correctAnswer={pp.correctAnswer} explanation={pp.explanation} />
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={
                <p className="text-[1.1rem] font-semibold leading-normal text-text-primary md:text-[1.2375rem]">
                  {parts[0]}
                  <span className="mx-1 inline-block w-10 border-b-2 border-dashed border-accent/60 align-baseline" aria-hidden>
                    &nbsp;
                  </span>
                  {parts[1] ?? ""}
                </p>
              }
              footer={explanationBlock}
            >
              {answerPanel}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <p className="text-xl leading-relaxed text-text-primary">
              {parts[0]}
              <input
                value={fill}
                disabled={fillChecked}
                onChange={(e) => setFill(e.target.value)}
                className="mx-1 inline-block w-44 rounded-xl border-2 border-border bg-background px-3 py-2 text-center font-semibold text-text-primary outline-none focus:border-accent"
              />
              {parts[1] ?? ""}
            </p>
            {explanationBlock}
          </PageShell>
        );
      }
      case "drag_label": {
        const pp = p as DragLabelPage;
        const dragUi = (
          <DragLabelQuestion
            key={pp.id}
            instruction={pp.instruction}
            labels={pp.labels}
            zones={pp.zones}
            explanation={pp.explanation}
            hideInstruction={splitQuestionLayout}
            compact={splitQuestionLayout}
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

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.instruction}
            >
              {dragUi}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            {dragUi}
          </PageShell>
        );
      }
      case "fold_ohlc_drag": {
        const pp = p as FoldOhlcDragPage;
        const dragUi = (
          <FoldOhlcDragQuestion
            key={pp.id}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(35);
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

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.instruction}
            >
              {dragUi}
              {dragChecked && pp.explanation ? (
                <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm text-text-muted">
                  <RichText text={pp.explanation} />
                </div>
              ) : null}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.instruction} className="text-lg font-semibold text-text-primary" />
            {dragUi}
          </PageShell>
        );
      }
      case "drag_order": {
        const pp = p as DragOrderPage;
        const dragUi = (
          <TimeframeOrderDrag
            key={pp.id}
            items={pp.items}
            correctOrder={pp.correctOrder}
            onCheckResult={(ok) => {
              setDragChecked(true);
              setDragCheckCorrect(ok);
              if (ok) {
                sound.correct();
                awardXp(30);
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

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.instruction}
            >
              {dragUi}
              {dragChecked && pp.explanation ? (
                <div className="rounded-2xl border border-border bg-surface2/90 p-4 text-sm text-text-muted">
                  <RichText text={pp.explanation} />
                </div>
              ) : null}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.instruction} className="text-lg font-semibold text-text-primary" />
            {dragUi}
          </PageShell>
        );
      }
      case "chart_tap": {
        const pp = p as ChartTapPage;
        const chart = (
          <ChartTapCandles
            count={pp.candleCount ?? 6}
            correctIndex={pp.correctCandleIndex}
            selectedIndex={tapPick}
            onSelect={(i) => !tapChecked && setTapPick(i)}
            highlightStyle={pp.highlightStyle}
            showSupportZone={/support/i.test(pp.question)}
          />
        );
        const explanationBlock = tapChecked ? (
          <div className="rounded-2xl border border-border bg-surface2/80 p-4 text-sm leading-relaxed text-text-muted">
            <RichText text={pp.explanation} />
          </div>
        ) : null;

        if (splitQuestionLayout) {
          return (
            <QuestionLayout
              badge={pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
              image={pp.image}
              question={pp.question}
              footer={explanationBlock}
            >
              {chart}
            </QuestionLayout>
          );
        }

        return (
          <PageShell>
            {pp.challengeBadge ? <GamifiedBadge label={pp.challengeBadge} /> : null}
            <LessonImageSlot image={pp.image} />
            <LessonPrompt text={pp.question} className="text-xl font-semibold text-text-primary" />
            {chart}
            {explanationBlock}
          </PageShell>
        );
      }
      default:
        return null;
    }
  };

  const practiceQ = resolvedLesson.practice?.[practiceIx];

  const coachSuggestedChips =
    phase === "practice"
      ? suggestedChipsForPage("practice")
      : suggestedChipsForPage(page.type, page.type === "visual" ? page.visualId : undefined);

  const coachPanelProps = {
    aiHistory,
    aiLoading,
    aiLoadingPhase,
    aiInput,
    voiceOn,
    suggestedChips: coachSuggestedChips,
    onChipClick: (text: string) => void submitCoachPrompt({ text, appendUser: true }),
    onInputChange: setAiInput,
    onToggleVoice: () => setVoiceOn((v) => !v),
    onSubmit: () => void submitCoachPrompt({ text: aiInput, appendUser: true }),
    onTranscript: (text: string) => void submitCoachPrompt({ text, appendUser: true }),
  };

  const advancePractice = () => {
    sound.pageTurn();
    if (!resolvedLesson.practice) return;
    if (practiceIx >= resolvedLesson.practice.length - 1) {
      setPhase("practiceSummary");
      return;
    }
    setPracticeIx((i) => i + 1);
  };

  const goNextPractice = () => {
    if (!isCurrentStepComplete()) return;
    advancePractice();
  };

  const renderPracticeQuestion = (q: PracticeQuestion) => {
    if (q.type === "visual_choice") {
      const grid = (
        <VisualChoiceGrid
          options={q.options}
          selectedIndex={prMc}
          checked={prMcOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prMcOk && setPrMc(i)}
        />
      );
      const actions = !prMcOk ? (
        <button
          type="button"
          disabled={prMc == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          onClick={() => {
            setPrMcOk(true);
            if (prMc === q.correctIndex) {
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {grid}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold text-text-primary" />
          {grid}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "time_bracket_drag") {
      const dragUi = (
        <TimeBracketDragQuestion
          correctCandleIndex={q.correctCandleIndex}
          explanation={q.explanation}
          onCheckResult={(ok) => {
            setPrDragOk(true);
            if (ok) {
              sound.correct();
              setPracticeCorrect((c) => c + 1);
              awardXp(15);
            } else {
              sound.wrong();
              handleWrongAttemptCoach();
            }
          }}
        />
      );
      const actions = prDragOk ? (
        <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
          Next →
        </button>
      ) : null;
      return (
        <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.instruction}>
          {dragUi}
          {actions}
        </QuestionLayout>
      );
    }
    if (q.type === "chart_compare") {
      const grid = (
        <ChartCompareQuestion
          variants={q.variants}
          selectedIndex={prTap}
          checked={prTapOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prTapOk && setPrTap(i)}
          disabled={prTapOk}
        />
      );
      const actions = !prTapOk ? (
        <button
          type="button"
          disabled={prTap == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          onClick={() => {
            setPrTapOk(true);
            if (prTap === q.correctIndex) {
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );
      return (
        <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
          {grid}
          {actions}
        </QuestionLayout>
      );
    }
    if (q.type === "candle_fuse") {
      const fuseUi = (
        <CandleFuseQuestion
          correctResultIndex={q.correctResultIndex}
          onCheckResult={(ok) => {
            setPrDragOk(true);
            if (ok) {
              sound.correct();
              setPracticeCorrect((c) => c + 1);
              awardXp(15);
            } else {
              sound.wrong();
              handleWrongAttemptCoach();
            }
          }}
        />
      );
      const actions = prDragOk ? (
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      ) : null;
      return (
        <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} question={q.instruction}>
          {fuseUi}
          {actions}
        </QuestionLayout>
      );
    }
    if (q.type === "fold_connect") {
      const dragUi = (
        <FoldConnectQuestion
          onCheckResult={(ok) => {
            setPrDragOk(true);
            if (ok) {
              sound.correct();
              setPracticeCorrect((c) => c + 1);
              awardXp(15);
            } else {
              sound.wrong();
              handleWrongAttemptCoach();
            }
          }}
        />
      );
      const actions = prDragOk ? (
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      ) : null;
      return (
        <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} question={q.instruction}>
          {dragUi}
          {actions}
        </QuestionLayout>
      );
    }
    if (q.type === "tap_choice") {
      const tapUi = (
        <ChartReadingTapQuestion
          diagram={q.diagram}
          selectedIndex={prTap}
          checked={prTapOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prTapOk && setPrTap(i)}
          disabled={prTapOk}
        />
      );
      const actions = !prTapOk ? (
        <button
          type="button"
          disabled={prTap == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          onClick={() => {
            setPrTapOk(true);
            if (prTap === q.correctIndex) {
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {tapUi}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold text-text-primary" />
          {tapUi}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "fold_ohlc_drag") {
      const dragUi = (
        <FoldOhlcDragQuestion
          onCheckResult={(ok) => {
            setPrDragOk(true);
            if (ok) {
              sound.correct();
              setPracticeCorrect((c) => c + 1);
              awardXp(15);
            } else {
              sound.wrong();
              handleWrongAttemptCoach();
            }
          }}
        />
      );
      const actions = prDragOk ? (
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      ) : null;

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.instruction}>
            {dragUi}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonPrompt text={q.instruction} className="text-lg font-semibold text-text-primary" />
          {dragUi}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "drag_order") {
      const dragUi = (
        <TimeframeOrderDrag
          items={q.items}
          correctOrder={q.correctOrder}
          onCheckResult={(ok) => {
            setPrDragOk(true);
            if (ok) {
              sound.correct();
              setPracticeCorrect((c) => c + 1);
              awardXp(15);
            } else {
              sound.wrong();
              handleWrongAttemptCoach();
            }
          }}
        />
      );
      const actions = prDragOk ? (
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      ) : null;

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.instruction}>
            {dragUi}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonPrompt text={q.instruction} className="text-lg font-semibold text-text-primary" />
          {dragUi}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "ui_choice") {
      const grid = (
        <ChartReadingChoiceGrid
          options={q.options}
          columns={q.columns}
          selectedIndex={prMc}
          checked={prMcOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prMcOk && setPrMc(i)}
        />
      );
      const actions = !prMcOk ? (
        <button
          type="button"
          disabled={prMc == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          onClick={() => {
            setPrMcOk(true);
            if (prMc === q.correctIndex) {
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {grid}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold text-text-primary" />
          {grid}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "fold_chart_choice") {
      const variant = q.variant ?? "15m_fuse";
      const isTextOptions = variant === "text_options";
      const is4h = variant === "4h_fold";
      const grid = isTextOptions ? (
        <TextOptionChoiceGrid
          selectedIndex={prMc}
          checked={prMcOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prMcOk && setPrMc(i)}
          disabled={prMcOk}
        />
      ) : is4h ? (
        <FourHourFoldChoiceGrid
          selectedIndex={prMc}
          checked={prMcOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prMcOk && setPrMc(i)}
          disabled={prMcOk}
        />
      ) : (
        <FifteenMinChoiceGrid
          selectedIndex={prMc}
          checked={prMcOk}
          correctIndex={q.correctIndex}
          onSelect={(i) => !prMcOk && setPrMc(i)}
          disabled={prMcOk}
        />
      );
      const actions = !prMcOk ? (
        <button
          type="button"
          disabled={prMc == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          onClick={() => {
            setPrMcOk(true);
            if (prMc === q.correctIndex) {
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {grid}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold text-text-primary" />
          {grid}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "multiple_choice") {
      const optionsGrid = (
        <div className="grid gap-2">
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
      );
      const actions = !prMcOk ? (
        <button
          type="button"
          disabled={prMc == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
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
        <>
          <p className="text-sm leading-relaxed text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {optionsGrid}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <PageShell>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold" />
          {optionsGrid}
          {actions}
        </PageShell>
      );
    }
    if (q.type === "true_false") {
      const tfButtons = (
        <div className={q.vertical ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}>
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
      );
      const tfFooter = prTfOk ? (
        <>
          <p className="text-sm text-text-muted">
            <RichText text={q.explanation} />
          </p>
          <button type="button" className="mt-4 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
            Next →
          </button>
        </>
      ) : null;

      if (splitQuestionLayout) {
        return (
          <QuestionLayout
            badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
            image={q.image}
            question={q.statement}
            footer={tfFooter}
          >
            {tfButtons}
          </QuestionLayout>
        );
      }

      return (
        <div>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <p className="text-lg font-semibold">{q.statement}</p>
          <div className={`mt-6 ${q.vertical ? "flex flex-col gap-3" : "grid grid-cols-2 gap-3"}`}>{tfButtons}</div>
          {tfFooter}
        </div>
      );
    }
    if (q.type === "fill_blank") {
      const parts = q.sentence.split("[___]");
      const answerPanel = (
        <>
          <input
            value={prFill}
            disabled={prFillOk}
            onChange={(e) => setPrFill(e.target.value)}
            className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-center text-lg font-semibold text-text-primary outline-none focus:border-accent"
            placeholder="Type here…"
          />
          {!prFillOk ? (
            <button
              type="button"
              className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white"
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
            <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
              Next →
            </button>
          )}
        </>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout
            badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
            image={q.image}
            question={
              <p className="text-[1.1rem] font-semibold leading-normal text-text-primary md:text-[1.2375rem]">
                {parts[0]}
                <span className="mx-1 inline-block w-10 border-b-2 border-dashed border-accent/60 align-baseline" aria-hidden>
                  &nbsp;
                </span>
                {parts[1] ?? ""}
              </p>
            }
            footer={
              prFillOk ? (
                <FillBlankFeedback userAnswer={prFill} correctAnswer={q.correctAnswer} explanation={q.explanation} />
              ) : null
            }
          >
            {answerPanel}
          </QuestionLayout>
        );
      }

      return (
        <div>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
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
            <>
              <FillBlankFeedback userAnswer={prFill} correctAnswer={q.correctAnswer} explanation={q.explanation} />
              <button type="button" className="mt-6 h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
                Next →
              </button>
            </>
          )}
        </div>
      );
    }
    if (q.type === "chart_tap") {
      const chart = (
        <ChartTapCandles
          count={q.candleCount ?? 6}
          correctIndex={q.correctCandleIndex}
          selectedIndex={prTap}
          onSelect={(i) => !prTapOk && setPrTap(i)}
          highlightStyle={q.highlightStyle}
          showSupportZone={/support/i.test(q.question)}
        />
      );
      const actions = !prTapOk ? (
        <button
          type="button"
          disabled={prTap == null}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
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
        <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
          Next →
        </button>
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.question}>
            {chart}
            {actions}
          </QuestionLayout>
        );
      }

      return (
        <div>
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
          <LessonPrompt text={q.question} className="text-lg font-semibold" />
          {chart}
          {actions}
        </div>
      );
    }
    if (q.type === "drag_label") {
      const dragUi = (
        <DragLabelQuestion
          key={q.id}
          instruction={q.instruction}
          labels={q.labels}
          zones={q.zones}
          explanation={q.explanation}
          hideInstruction={splitQuestionLayout}
          compact={splitQuestionLayout}
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
      );

      if (splitQuestionLayout) {
        return (
          <QuestionLayout badge={q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null} image={q.image} question={q.instruction}>
            {dragUi}
            {prDragOk ? (
              <button type="button" className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white" onClick={advancePractice}>
                Next →
              </button>
            ) : null}
          </QuestionLayout>
        );
      }

      return (
        <div className="w-full max-w-xl">
          {q.challengeBadge ? <GamifiedBadge label={q.challengeBadge} /> : null}
          <LessonImageSlot image={q.image} />
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
        <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
          <button
            type="button"
            className="rounded-2xl border border-border px-8 py-3.5 font-semibold transition hover:bg-surface2"
            onClick={restartLesson}
          >
            Restart lesson
          </button>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {resolvedLesson.practice?.length ? (
              <button
                type="button"
                className="rounded-2xl bg-[#456DFF] px-8 py-4 text-lg font-black text-white shadow-md transition hover:brightness-110"
                onClick={() => {
                  sound.pageTurn();
                  setSplashFromResume(false);
                  setPhase("practice");
                }}
              >
                Practice now ⚡
              </button>
            ) : null}
            <Link
              href={postCompletionHref}
              onClick={() => {
                if (libraryCourseSlug?.trim() && resolvedLesson.practice?.length) {
                  saveLibraryLearnProgress({
                    practiceCorrect: 0,
                    practiceTotal: 0,
                    lessonCompleted: true,
                  });
                }
              }}
              className="rounded-2xl border border-border px-8 py-4 font-bold transition hover:bg-surface2"
            >
              {completionExitLabel}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "practiceSummary") {
    const total = resolvedLesson.practice?.length ?? 0;
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
          {practiceSummaryExitLabel}
        </Link>
      </div>
    );
  }

  if (phase === "practice" && practiceQ) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-[#141414] text-text-primary">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-purple-300">PRACTICE MODE</span>
          <button type="button" className="text-text-muted" onClick={() => router.push(backToCourseHref)}>
            Exit
          </button>
        </header>
        <div className="flex min-h-0 flex-1">
          <LessonCoachAside {...coachPanelProps} />
          <main className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 overflow-y-auto px-16 md:px-20 lg:px-24">
              <LessonNavArrow
                direction="prev"
                disabled={practiceIx <= 0}
                onClick={goPrevPractice}
                label="Previous practice question"
              />
              <LessonNavArrow
                direction="next"
                disabled={!isCurrentStepComplete()}
                onClick={goNextPractice}
                label="Next practice question"
              />
              <div className="flex min-h-0 flex-1 flex-col px-5 py-6 md:px-8 md:py-8 pb-6 md:pb-8">
                <div className="mb-8 flex justify-center gap-1.5 md:mb-10">
                  {resolvedLesson.practice!.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${i < practiceIx ? "bg-accent" : i === practiceIx ? "bg-white" : "bg-slate-600"}`}
                    />
                  ))}
                </div>
                <div className={`mx-auto w-full ${splitQuestionLayout ? "" : "max-w-xl"} [font-size:110%]`}>
                  {renderPracticeQuestion(practiceQ)}
                </div>
              </div>
            </div>
          </main>
        </div>
        <LessonCoachMobile {...coachPanelProps} aiOpen={aiOpen} onOpenChange={setAiOpen} />
      </div>
    );
  }

  const pre0 = pages[0] as PretestPage | undefined;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#141414] text-text-primary">
      <Confetti active={lessonConfetti} count={28} />

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
              <p className="mt-8 max-w-lg text-center text-text-muted">
                <RichText text={pre0.explanation} />
              </p>
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
        <LessonCoachAside {...coachPanelProps} />

        <main {...bindSwipe()} className="relative flex min-h-0 flex-1 flex-col">
          {muxPlaybackId && !videoSkip ? (
            <div className="border-b border-border p-4">
              <MuxPlayer playbackId={muxPlaybackId} accentColor="#F7C325" onEnded={() => setVideoSkip(true)} style={{ width: "100%", maxHeight: 220, borderRadius: 12 }} />
              <button type="button" className="mt-2 text-sm text-accent underline" onClick={() => setVideoSkip(true)}>
                Skip to lesson
              </button>
            </div>
          ) : null}
          <div className="relative flex min-h-0 overflow-y-auto flex-1 px-16 md:px-20 lg:px-24">
            <LessonNavArrow
              direction="prev"
              disabled={pageIndex <= 0 || showPretestOverlay}
              onClick={goPrevPage}
              label="Previous step"
            />
            <LessonNavArrow
              direction="next"
              disabled={!isCurrentStepComplete() || showPretestOverlay}
              onClick={goNextPage}
              label="Next step"
            />
            <div className="flex min-h-0 flex-1 flex-col px-5 py-6 md:px-8 md:py-8 pb-6 md:pb-8">
              <div className={`mx-auto w-full ${contentMaxWidth} [font-size:110%]`}>
                {showMainContent ? renderPage(page) : null}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className={`shrink-0 border-t border-border px-5 pb-6 pt-5 transition-colors ${bottomClass}`}>
        <div className={`mx-auto flex w-full ${footerMaxWidth} flex-col gap-3`}>
          {phase === "lesson" && !hideLessonFooter ? (
            <>
              {page.type === "intro" || page.type === "text" || page.type === "callout" || page.type === "image" ? (
                <button
                  type="button"
                  className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                  onClick={goNextPage}
                >
                  {page.type === "intro" ? (page.startLabel ?? "Start") : "Continue →"}
                </button>
              ) : null}
              {page.type === "visual" ? (
                page.visualId === "HammerCandle" && hammerPlaybackActive ? null : (
                  <button
                    type="button"
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                    onClick={goNextPage}
                  >
                    Continue →
                  </button>
                )
              ) : null}
              {page.type === "multiple_choice" || page.type === "visual_choice" || page.type === "fold_chart_choice" || page.type === "ui_choice" ? (
                !mcChecked ? (
                  <button
                    type="button"
                    disabled={mcPick == null}
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white disabled:opacity-40"
                    onClick={() => {
                      const pp = page as MultipleChoicePage | VisualChoicePage | FoldChartChoicePage | UiChoicePage;
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
                ) : mcPick === (page as MultipleChoicePage | VisualChoicePage | FoldChartChoicePage | UiChoicePage).correctIndex ? (
                  <button
                    type="button"
                    className="animate-continue-pulse h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white"
                    onClick={goNextPage}
                  >
                    Continue →
                  </button>
                ) : (
                  <div className="flex gap-3">
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
              {page.type === "drag_label" || page.type === "fold_ohlc_drag" || page.type === "drag_order" || page.type === "fold_connect" || page.type === "time_bracket_drag" || page.type === "candle_fuse" ? (
                dragChecked ? (
                  <button type="button" className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white" onClick={goNextPage}>
                    Continue →
                  </button>
                ) : null
              ) : null}
              {page.type === "chart_tap" || page.type === "tap_choice" || page.type === "chart_compare" ? (
                !tapChecked ? (
                  <button
                    type="button"
                    disabled={tapPick == null}
                    className="h-14 w-full rounded-2xl bg-[#456DFF] text-lg font-semibold text-white disabled:opacity-40"
                    onClick={() => {
                      const correctIdx =
                        page.type === "chart_tap"
                          ? (page as ChartTapPage).correctCandleIndex
                          : page.type === "chart_compare"
                            ? (page as ChartComparePage).correctIndex
                            : (page as TapChoicePage).correctIndex;
                      setTapChecked(true);
                      if (tapPick === correctIdx) {
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

      <LessonCoachMobile {...coachPanelProps} aiOpen={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}
