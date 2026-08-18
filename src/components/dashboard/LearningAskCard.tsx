"use client";

import Link from "next/link";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { getLearningAskRecommendation } from "@/lib/learningAsk";
import type { LearningAskPayload } from "@/lib/courseCatalog";

type ExperienceChoice = "beginner" | "basic" | null;

type AskTurn = {
  id: string;
  query: string;
  result: LearningAskPayload | null;
  experienceChoice: ExperienceChoice;
  experienceAnswerLabel: string | null;
  error: string | null;
  status: "loading" | "done" | "error";
};

function AiChatText({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-[14px] leading-relaxed text-[#ccc]">{children}</p>
  );
}

function UserChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <p className="m-0 max-w-[88%] rounded-2xl rounded-br-sm bg-[rgba(69,109,255,0.22)] px-4 py-2.5 text-[14px] leading-relaxed text-white">
        {children}
      </p>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <p className="m-0 animate-fade-in-soft text-[14px] text-[#888]">
      Thinking<span className="animate-pulse">…</span>
    </p>
  );
}

function RecommendationCard({
  emoji,
  title,
  description,
  meta,
  href,
  variant = "primary",
}: {
  emoji: string;
  title: string;
  description: string;
  meta: string;
  href: string;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Link
      href={href}
      className={`block no-underline transition-transform hover:scale-[1.01] ${
        isPrimary
          ? "rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] p-4"
          : "rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3.5"
      }`}
    >
      <div className="flex gap-3">
        <span className={`shrink-0 ${isPrimary ? "text-4xl" : "text-2xl"}`}>{emoji}</span>
        <div className="min-w-0 flex-1">
          <h3
            className={`m-0 font-bold text-white ${isPrimary ? "text-[17px]" : "text-[15px]"}`}
          >
            {title}
          </h3>
          <p
            className={`mt-1.5 mb-0 leading-relaxed text-[#aaa] ${
              isPrimary ? "text-[14px]" : "text-[13px] line-clamp-2"
            }`}
          >
            {description}
          </p>
          {isPrimary ? (
            <p className="mt-3 mb-0 flex items-center gap-1.5 text-[12px] text-[#666]">
              <span aria-hidden>📄</span>
              {meta}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

type ScrollAnchor = "user" | "experienceUser";

function AskTurnBlock({
  turn,
  onRelatedQuestion,
  onExperienceChoice,
  userMessageRef,
  experienceUserRef,
}: {
  turn: AskTurn;
  onRelatedQuestion: (question: string) => void;
  onExperienceChoice: (turnId: string, choice: "beginner" | "basic", label: string) => void;
  userMessageRef?: (el: HTMLDivElement | null) => void;
  experienceUserRef?: (el: HTMLDivElement | null) => void;
}) {
  const result = turn.result;
  if (!result && turn.status === "loading") {
    return (
      <div className="space-y-4">
        <div ref={userMessageRef}>
          <UserChatBubble>{turn.query}</UserChatBubble>
        </div>
        <ThinkingIndicator />
      </div>
    );
  }

  if (turn.error) {
    return (
      <div className="space-y-4">
        <div ref={userMessageRef}>
          <UserChatBubble>{turn.query}</UserChatBubble>
        </div>
        <p className="m-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {turn.error}
        </p>
      </div>
    );
  }

  if (!result) return null;

  const courseMeta = `${result.courseTitle} — Level ${result.levelNumber}`;

  return (
    <div className="animate-slide-up-fade space-y-4">
      <div ref={userMessageRef}>
        <UserChatBubble>{turn.query}</UserChatBubble>
      </div>

      <div className="space-y-4">
        <AiChatText>{result.shortAnswer}</AiChatText>
        <AiChatText>{result.intro}</AiChatText>

      <RecommendationCard
        variant="primary"
        emoji={result.courseEmoji}
        title={result.courseTitle}
        description={result.courseDescription}
        meta={courseMeta}
        href={`/courses/${result.courseSlug}`}
      />

      <p className="m-0 text-[13px] text-[#888]">You could also start with this:</p>
      <RecommendationCard
        variant="secondary"
        emoji="📘"
        title={result.lessonTitle}
        description={result.lessonDescription}
        meta={`${result.courseTitle} — ${result.levelTitle}`}
        href={`/learn/${result.lessonSlug}`}
      />

      <div className="space-y-2 pt-1">
        {result.relatedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onRelatedQuestion(q)}
            className="flex w-full cursor-pointer items-start gap-2 rounded-lg border-0 bg-transparent px-0 py-1 text-left text-[13px] text-[#888] transition-colors hover:text-[#ccc]"
          >
            <span className="shrink-0 text-[#666]" aria-hidden>
              ↳
            </span>
            <span>{q}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3 border-t border-[rgba(255,255,255,0.08)] pt-4">
        <AiChatText>{result.experienceQuestion}</AiChatText>
        {!turn.experienceChoice ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                onExperienceChoice(turn.id, "beginner", result.experienceOptions.beginner)
              }
              className="cursor-pointer rounded-full border border-[rgba(255,255,255,0.2)] bg-transparent px-4 py-2 text-[13px] font-medium text-[#ccc] transition-colors hover:border-[rgba(255,255,255,0.35)] hover:text-white"
            >
              {result.experienceOptions.beginner}
            </button>
            <button
              type="button"
              onClick={() =>
                onExperienceChoice(turn.id, "basic", result.experienceOptions.basic)
              }
              className="cursor-pointer rounded-full border border-[rgba(255,255,255,0.2)] bg-transparent px-4 py-2 text-[13px] font-medium text-[#ccc] transition-colors hover:border-[rgba(255,255,255,0.35)] hover:text-white"
            >
              {result.experienceOptions.basic}
            </button>
          </div>
        ) : null}
      </div>
      </div>

      {turn.experienceChoice && turn.experienceAnswerLabel ? (
        <div className="animate-slide-up-fade space-y-4 border-t border-[rgba(255,255,255,0.08)] pt-4">
          <div ref={experienceUserRef}>
            <UserChatBubble>{turn.experienceAnswerLabel}</UserChatBubble>
          </div>

          <div className="space-y-4">
          {turn.experienceChoice === "beginner" ? (
            <>
              <AiChatText>
                Great — start with the full course to build a solid foundation.
              </AiChatText>
              <RecommendationCard
                variant="primary"
                emoji={result.courseEmoji}
                title={result.courseTitle}
                description={result.courseDescription}
                meta={courseMeta}
                href={`/courses/${result.courseSlug}`}
              />
            </>
          ) : (
            <>
              <AiChatText>
                Since you know the basics, jump straight into this focused lesson.
              </AiChatText>
              <RecommendationCard
                variant="primary"
                emoji="📘"
                title={result.lessonTitle}
                description={result.lessonDescription}
                meta={`${result.courseTitle} — ${result.levelTitle}`}
                href={`/learn/${result.lessonSlug}`}
              />
            </>
          )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function newTurnId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function LearningAskCard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userElsRef = useRef(new Map<string, HTMLDivElement>());
  const experienceUserElsRef = useRef(new Map<string, HTMLDivElement>());
  const pendingScrollRef = useRef<{ turnId: string; anchor: ScrollAnchor } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [asking, setAsking] = useState(false);
  const [scrollToken, setScrollToken] = useState(0);

  const close = useCallback(() => {
    setExpanded(false);
  }, []);

  const queueScroll = useCallback((turnId: string, anchor: ScrollAnchor) => {
    pendingScrollRef.current = { turnId, anchor };
    setScrollToken((n) => n + 1);
  }, []);

  const scrollToAnchor = useCallback(() => {
    const pending = pendingScrollRef.current;
    if (!pending) return;

    const container = scrollRef.current;
    const target =
      pending.anchor === "user"
        ? userElsRef.current.get(pending.turnId)
        : experienceUserElsRef.current.get(pending.turnId);

    if (!container || !target) return;

    const offset = target.getBoundingClientRect().top - container.getBoundingClientRect().top - 8;
    container.scrollTo({
      top: container.scrollTop + offset,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded, close]);

  useEffect(() => {
    if (expanded && turns.length === 0) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(t);
    }
  }, [expanded, turns.length]);

  useEffect(() => {
    if (scrollToken === 0) return;
    const t1 = window.setTimeout(scrollToAnchor, 50);
    const t2 = window.setTimeout(scrollToAnchor, 280);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [scrollToken, scrollToAnchor]);

  async function runAsk(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || asking) return;

    const turnId = newTurnId();
    setAsking(true);
    setQuery("");
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        query: trimmed,
        result: null,
        experienceChoice: null,
        experienceAnswerLabel: null,
        error: null,
        status: "loading",
      },
    ]);
    queueScroll(turnId, "user");
    try {
      const data = await getLearningAskRecommendation(trimmed);
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId ? { ...t, result: data, status: "done" as const } : t,
        ),
      );
      queueScroll(turnId, "user");
    } catch {
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turnId
            ? {
                ...t,
                error: "Could not get recommendations. Please try again.",
                status: "error" as const,
              }
            : t,
        ),
      );
    } finally {
      setAsking(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void runAsk(query);
  }

  function handleRelatedQuestion(question: string) {
    void runAsk(question);
  }

  function handleExperienceChoice(
    turnId: string,
    choice: "beginner" | "basic",
    label: string,
  ) {
    setTurns((prev) =>
      prev.map((t) =>
        t.id === turnId
          ? { ...t, experienceChoice: choice, experienceAnswerLabel: label }
          : t,
      ),
    );
    queueScroll(turnId, "experienceUser");
  }

  function openCard() {
    setExpanded(true);
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      void runAsk(query);
    }
  }

  const lastQuery = turns.at(-1)?.query ?? "";
  const collapsedLabel = lastQuery.trim() || "What do you want to learn?";

  function setUserEl(turnId: string, el: HTMLDivElement | null) {
    if (el) userElsRef.current.set(turnId, el);
    else userElsRef.current.delete(turnId);
  }

  function setExperienceUserEl(turnId: string, el: HTMLDivElement | null) {
    if (el) experienceUserElsRef.current.set(turnId, el);
    else experienceUserElsRef.current.delete(turnId);
  }

  const collapsedTrigger = (
    <button
      type="button"
      onClick={openCard}
      className="flex w-full cursor-pointer items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-left transition-all duration-300 hover:border-[rgba(255,255,255,0.18)] hover:bg-[rgba(255,255,255,0.08)]"
    >
      <span className="text-[15px] text-[#666]">🔍</span>
      <span
        className={`min-w-0 flex-1 truncate text-[15px] ${
          lastQuery ? "text-[#ccc]" : "text-[#666]"
        }`}
      >
        {collapsedLabel}
      </span>
      <span className="rounded-full bg-[rgba(255,255,255,0.12)] px-3.5 py-1 text-[13px] font-semibold text-white">
        Ask
      </span>
    </button>
  );

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      {!expanded ? collapsedTrigger : <div className="h-[42px]" aria-hidden />}

      {expanded ? (
        <div className="animate-ask-card-expand absolute -left-1.5 -right-1.5 top-0 z-50 flex max-h-[min(560px,calc(100dvh-8rem))] flex-col overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#1E1E1E] shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:-left-2 sm:-right-2">
          <div className="shrink-0 p-5 pb-0">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="m-0 text-[17px] font-bold text-white">What do you want to learn?</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#888] transition-colors hover:bg-[rgba(255,255,255,0.08)] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="pb-5">
              <div className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(0,0,0,0.25)] px-3 py-2">
                <span className="pl-1 text-[15px] text-[#666]">🔍</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Reply here..."
                  className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-white outline-none ring-0 placeholder:text-[#555] focus:outline-none focus:ring-0"
                />
                <button
                  type="submit"
                  disabled={asking || !query.trim()}
                  className="cursor-pointer rounded-full border-0 bg-[rgba(255,255,255,0.14)] px-3.5 py-1.5 text-[13px] font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? "Thinking…" : "Ask"}
                </button>
              </div>
            </form>
          </div>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin]"
          >
            <div className="space-y-8">
              {turns.map((turn) => (
                <AskTurnBlock
                  key={turn.id}
                  turn={turn}
                  onRelatedQuestion={handleRelatedQuestion}
                  onExperienceChoice={handleExperienceChoice}
                  userMessageRef={(el) => setUserEl(turn.id, el)}
                  experienceUserRef={(el) => setExperienceUserEl(turn.id, el)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
