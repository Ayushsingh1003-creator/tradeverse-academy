"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useUserStore } from "@/lib/store";
import { LEARNING_PATHS, type Course } from "@/lib/data/courses";
import type { Lesson } from "@/lib/data/lessons";

const FREE_COURSE_SLUG = "candlestick-essentials";

interface Props {
  course: Course;
  allLessons: Lesson[];
}

type NodeState = "done" | "active" | "upcoming";
type IconKey =
  | "candle"
  | "bars"
  | "hammer"
  | "sr"
  | "trend"
  | "building"
  | "people"
  | "pin"
  | "clock"
  | "grid"
  | "priceTag"
  | "arrows"
  | "flag"
  | "card"
  | "briefcase"
  | "sliders"
  | "receipt"
  | "coin"
  | "bolt"
  | "rocket"
  | "warning"
  | "ruler"
  | "shieldCheck"
  | "scale"
  | "notebook"
  | "brain"
  | "guardrail"
  | "oscillator"
  | "maLine"
  | "peaks";

/** Line-art glyph per lesson slug — every course renders bespoke SVGs, never emoji. */
const SVG_ICON_BY_SLUG: Record<string, IconKey> = {
  // Candlestick Essentials
  "what-is-a-candlestick": "candle",
  "timeframes-explained": "clock",
  "support-resistance": "sr",
  "trend-lines": "trend",
  "chart-patterns": "peaks",

  // Financial Markets 101
  "what-is-the-market": "building",
  "market-participants": "people",
  "indian-markets-101": "pin",
  "market-hours-india": "clock",
  "asset-classes-india": "grid",
  "how-prices-form": "priceTag",
  "bid-ask-spread-cost": "arrows",
  "financial-markets-101-review": "flag",

  // How to Actually Trade
  "demat-and-trading-account": "card",
  "picking-a-broker": "briefcase",
  "order-types-explained": "sliders",
  "anatomy-of-trade": "receipt",
  "brokerage-and-taxes-india": "coin",
  "execution-and-slippage": "bolt",
  "first-trade-walkthrough": "rocket",
  "how-to-trade-review": "flag",

  // Risk & Trader Mindset
  "why-traders-lose": "warning",
  "position-sizing-rule": "ruler",
  "stop-loss-discipline": "shieldCheck",
  "risk-reward-ratio": "scale",
  "journaling-your-trades": "notebook",
  "emotional-traps": "brain",
  "beginner-guardrails": "guardrail",
  "risk-mindset-review": "flag",

  // Indicator Starter Kit
  "rsi-basics": "oscillator",
  "moving-averages": "maLine",
};

/** Hero tile glyph per course slug. */
const HERO_ICON_BY_COURSE_SLUG: Record<string, IconKey> = {
  "candlestick-essentials": "bars",
  "financial-markets-101": "building",
  "how-to-actually-trade": "rocket",
  "risk-and-trader-mindset": "shieldCheck",
  "indicator-starter-kit": "oscillator",
};

/** Horizontal sway per lesson node, in course-lesson order — gives the path its wavy Duolingo feel. */
const BASE_OFFSETS = [-190, 210, -70, -220, 190];

const RING_CIRCUMFERENCE = 339.29;

export function CourseLessonPath({ course, allLessons }: Props) {
  const hydrate = useUserStore((s) => s.hydrate);
  const hydrated = useUserStore((s) => s.hydrated);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);

  // Not wrapped in QueryClientProvider on this public route — fetch directly rather than useSubscription().
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription/status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setIsPremium(Boolean(data.isPremium));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const requiresPremium = course.slug !== FREE_COURSE_SLUG && !isPremium;

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const lessons = course.lessonSlugs
    .map((slug) => allLessons.find((l) => l.slug === slug))
    .filter((l): l is Lesson => Boolean(l));

  const levels = course.levels?.length
    ? course.levels
    : [{ id: "all", number: 1, title: course.title, lessonSlugs: course.lessonSlugs }];

  const pathTitle = LEARNING_PATHS.find((p) => p.slug === course.pathSlug)?.title ?? "Course";

  const total = lessons.length;
  const completedCount = lessons.filter((l) => lessonsCompleted.includes(l.slug)).length;
  const activeSlug = lessons.find((l) => !lessonsCompleted.includes(l.slug))?.slug ?? null;
  const allDone = total > 0 && completedCount === total;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;
  const ringOffset = RING_CIRCUMFERENCE * (1 - (total ? completedCount / total : 0));
  const totalXp = lessons.reduce((sum, l) => sum + l.xpReward, 0);

  const stateOf = (slug: string): NodeState => {
    if (lessonsCompleted.includes(slug)) return "done";
    if (slug === activeSlug) return "active";
    return "upcoming";
  };

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedLesson = lessons.find((l) => l.slug === selectedSlug) ?? null;
  const selectedLevel = selectedLesson ? levels.find((lv) => lv.lessonSlugs.includes(selectedLesson.slug)) : undefined;

  const pathRef = useRef<HTMLDivElement>(null);
  const [curveD, setCurveD] = useState("");

  useEffect(() => {
    const measure = () => {
      const container = pathRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-node]"));
      if (!nodes.length) return;
      const points = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return [Math.round(r.left + r.width / 2 - containerRect.left), Math.round(r.top + r.height / 2 - containerRect.top)];
      });
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const midY = (a[1] + b[1]) / 2;
        d += ` C ${a[0]} ${midY}, ${b[0]} ${midY}, ${b[0]} ${b[1]}`;
      }
      setCurveD((prev) => (prev === d ? prev : d));
    };

    measure();
    const t1 = setTimeout(measure, 140);
    const t2 = setTimeout(measure, 560);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", measure);
    };
  }, [lessonsCompleted]);

  let lessonCursor = -1;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#141414] text-white">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "radial-gradient(1100px 600px at 50% -8%, rgba(69,109,255,.10), transparent 60%)" }}
      />

      <AppNav />

      <main className="relative z-[1] mx-auto max-w-[1200px] px-5 pb-40 pt-7">
        <div className="mb-4 flex items-center gap-2 text-[12.5px] text-[#666]">
          <Link href="/courses" className="text-[#999] hover:text-white">
            Courses
          </Link>
          <span>›</span>
          <span className="font-semibold text-white">{course.title}</span>
        </div>

        <section className="relative flex flex-wrap items-center gap-5 overflow-hidden rounded-[20px] border border-white/10 bg-gradient-to-b from-[#1f1f1f] to-[#191919] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(69,109,255,.16), transparent 68%)" }}
          />

          <div
            className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-2xl border border-[#88c9f7]/25"
            style={{ background: "linear-gradient(150deg,#0D1830,#20357A)" }}
          >
            <IconGlyph icon={HERO_ICON_BY_COURSE_SLUG[course.slug] ?? "grid"} size={46} />
          </div>

          <div className="min-w-[240px] flex-1">
            <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8b9dff]">
              {pathTitle} · Course
            </div>
            <h1 className="mb-2 text-[30px] font-black leading-[1.05] tracking-tight">{course.title}</h1>
            <p className="mb-3.5 max-w-[420px] text-sm leading-[1.55] text-[#999]">{course.description}</p>
            <div className="flex flex-wrap gap-2">
              <Chip>📚 {total} Lessons</Chip>
              <Chip>🧩 {course.totalExercises ?? 0} Exercises</Chip>
              <Chip gold>⚡ {totalXp} XP</Chip>
            </div>
          </div>

          <div className="relative flex min-w-[150px] flex-col items-center gap-3">
            <div className="relative h-32 w-32">
              <svg width="128" height="128" viewBox="0 0 128 128" className="block">
                <circle cx="64" cy="64" r="54" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="url(#cs-ring-grad)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 64 64)"
                  style={{ transition: "stroke-dashoffset .85s cubic-bezier(.22,1,.36,1)" }}
                />
                <defs>
                  <linearGradient id="cs-ring-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3860BE" />
                    <stop offset="55%" stopColor="#456DFF" />
                    <stop offset="100%" stopColor="#88C9F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[30px] font-black leading-none tabular-nums">{pct}%</div>
                <div className="mt-0.5 text-[11px] text-[#666]">
                  {completedCount} of {total} lessons
                </div>
              </div>
            </div>
            <Button
              className="h-11 w-full rounded-full bg-[#456dff] font-semibold hover:bg-[#2a4ae8]"
              disabled={!activeSlug}
              onClick={() => activeSlug && setSelectedSlug(activeSlug)}
            >
              {allDone ? "All lessons complete 🎉" : "Continue →"}
            </Button>
          </div>
        </section>

        <section ref={pathRef} className="relative mt-9 flex flex-col items-center gap-6">
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible">
            <path d={curveD} fill="none" stroke="rgba(136,201,247,.42)" strokeWidth="3.5" strokeDasharray="0.5 12" strokeLinecap="round" />
          </svg>

          {levels.map((level) => {
            const levelLessons = lessons.filter((l) => level.lessonSlugs.includes(l.slug));
            const doneInLevel = levelLessons.filter((l) => lessonsCompleted.includes(l.slug)).length;
            const hasActiveInLevel = levelLessons.some((l) => l.slug === activeSlug);
            const levelState: NodeState =
              levelLessons.length > 0 && doneInLevel === levelLessons.length ? "done" : hasActiveInLevel ? "active" : "upcoming";

            return (
              <div key={level.id} className="relative z-[1] flex w-full flex-col items-center gap-6">
                <LevelBanner number={level.number} title={level.title} state={levelState} doneCount={doneInLevel} totalCount={levelLessons.length} />
                {levelLessons.map((lesson) => {
                  lessonCursor += 1;
                  const offset = BASE_OFFSETS[lessonCursor % BASE_OFFSETS.length];
                  return (
                    <LessonBubble
                      key={lesson.slug}
                      lesson={lesson}
                      state={stateOf(lesson.slug)}
                      offset={offset}
                      onSelect={() => setSelectedSlug(lesson.slug)}
                    />
                  );
                })}
              </div>
            );
          })}
        </section>
      </main>

      {selectedLesson ? (
        <LessonPopup
          lesson={selectedLesson}
          levelNumber={selectedLevel?.number ?? 1}
          levelTitle={selectedLevel?.title ?? course.title}
          index={course.lessonSlugs.indexOf(selectedLesson.slug)}
          total={total}
          state={stateOf(selectedLesson.slug)}
          locked={requiresPremium}
          onClose={() => setSelectedSlug(null)}
        />
      ) : null}
    </div>
  );
}

function Chip({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-[11px] py-[5px] text-[12.5px] font-bold ${
        gold ? "border-[#f7c325]/35 bg-[#f7c325]/15 text-[#ffd85c]" : "border-white/8 bg-white/5 font-semibold text-[#999]"
      }`}
    >
      {children}
    </span>
  );
}

function LevelBanner({
  number,
  title,
  state,
  doneCount,
  totalCount,
}: {
  number: number;
  title: string;
  state: NodeState;
  doneCount: number;
  totalCount: number;
}) {
  const cfg =
    state === "done"
      ? {
          tint: "rgba(69,109,255,.08)",
          border: "rgba(69,109,255,.4)",
          badgeBg: "linear-gradient(150deg,#5C7CFF,#456DFF)",
          badgeColor: "#fff",
          badgeText: "✓",
          eyebrow: "#8b9dff",
          title: "#fff",
          statusColor: "#88c9f7",
          statusText: "Completed",
          glow: "none",
        }
      : state === "active"
        ? {
            tint: "linear-gradient(180deg,#1B2144,#181818)",
            border: "#456dff",
            badgeBg: "linear-gradient(150deg,#5C7CFF,#456DFF)",
            badgeColor: "#fff",
            badgeText: String(number),
            eyebrow: "#8b9dff",
            title: "#fff",
            statusColor: "#ffd85c",
            statusText: `${doneCount}/${totalCount} done`,
            glow: "0 0 22px rgba(69,109,255,.28)",
          }
        : {
            tint: "rgba(255,255,255,.02)",
            border: "rgba(255,255,255,.08)",
            badgeBg: "#242424",
            badgeColor: "#666",
            badgeText: String(number),
            eyebrow: "#4a4a4a",
            title: "#666",
            statusColor: "#4a4a4a",
            statusText: "Up next",
            glow: "none",
          };

  return (
    <div className="flex w-full justify-center">
      <div
        className="flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] px-[18px] py-[14px]"
        style={{ background: cfg.tint, borderColor: cfg.border, boxShadow: cfg.glow }}
      >
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] text-[15px] font-black"
          style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
        >
          {cfg.badgeText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em]" style={{ color: cfg.eyebrow }}>
            Level {number}
          </div>
          <div className="text-[16px] font-extrabold leading-tight" style={{ color: cfg.title }}>
            {title}
          </div>
        </div>
        <div className="whitespace-nowrap text-xs font-bold" style={{ color: cfg.statusColor }}>
          {cfg.statusText}
        </div>
      </div>
    </div>
  );
}

function LessonBubble({
  lesson,
  state,
  offset,
  onSelect,
}: {
  lesson: Lesson;
  state: NodeState;
  offset: number;
  onSelect: () => void;
}) {
  const isDone = state === "done";
  const isActive = state === "active";

  const faceBg = isDone
    ? "radial-gradient(120% 120% at 50% 18%, #7E99FF, #456DFF 72%)"
    : isActive
      ? "radial-gradient(120% 120% at 50% 18%, #A0B4FF, #4A6DFF 72%)"
      : "#262626";
  const baseColor = isDone ? "#2540C8" : isActive ? "#2A4AE8" : "#141414";
  const boxShadow = `0 8px 0 0 ${baseColor}${isActive ? ", 0 0 28px rgba(69,109,255,.6)" : ""}`;

  return (
    <div className="relative z-[1] flex w-full justify-center">
      <div className="flex flex-col items-center gap-2.5" style={{ transform: `translateX(${offset}px)` }}>
        {isActive ? (
          <div className="relative animate-float rounded-xl bg-white px-3.5 py-1.5 text-xs font-black tracking-wide text-[#141414] shadow-[0_6px_18px_rgba(0,0,0,0.5)]">
            START
            <span className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[7px] border-t-[7px] border-x-transparent border-t-white" />
          </div>
        ) : null}

        <button
          type="button"
          data-node
          onClick={onSelect}
          className="relative flex h-[90px] w-[90px] items-center justify-center rounded-full border-none transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1"
          style={{ background: faceBg, boxShadow, opacity: state === "upcoming" ? 0.55 : 1 }}
        >
          {isActive ? <span className="absolute -inset-[5px] animate-pulse-blue rounded-full border-[3px] border-[#456dff]/70" /> : null}

          <LessonIcon slug={lesson.slug} size={44} muted={state === "upcoming"} />

          {isDone ? (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-[#141414] bg-white text-base font-black text-[#456dff] shadow-[0_3px_8px_rgba(0,0,0,0.5)]">
              ✓
            </span>
          ) : null}

          {!lesson.isFree && state !== "upcoming" ? (
            <span className="absolute -left-1 -top-1 rounded-full bg-[#f7c325] px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#141414] shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              PRO
            </span>
          ) : null}
        </button>

        <div className="max-w-[158px] text-center">
          <div className="text-[12.5px] font-bold leading-snug" style={{ color: isDone ? "#88c9f7" : isActive ? "#fff" : "#5a5a5a" }}>
            {lesson.title}
          </div>
          <div className="mt-1 text-[11px] font-semibold" style={{ color: isDone ? "#5f7fb0" : isActive ? "#ffd85c" : "#4a4a4a" }}>
            {isDone ? "Completed" : isActive ? `+${lesson.xpReward} XP · Start now` : "Up next"}
          </div>
        </div>
      </div>
    </div>
  );
}

function LessonPopup({
  lesson,
  levelNumber,
  levelTitle,
  index,
  total,
  state,
  locked,
  onClose,
}: {
  lesson: Lesson;
  levelNumber: number;
  levelTitle: string;
  index: number;
  total: number;
  state: NodeState;
  locked: boolean;
  onClose: () => void;
}) {
  const done = state === "done";
  const isActive = state === "active";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(8,10,16,0.6)] px-4 pb-6 backdrop-blur-sm sm:items-center"
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[430px]"
      >
        <Card className="relative border-white/12 bg-gradient-to-b from-[#232323] to-[#1b1b1b] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.65)]">
          <CardContent className="p-0">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3.5 top-3.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/6 text-[15px] text-[#999] hover:bg-white/10"
            >
              ✕
            </button>

            <div className="mb-4 flex items-center gap-3.5">
              <div
                className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border"
                style={{
                  background: done || isActive ? "linear-gradient(150deg,#0D1830,#20357A)" : "#2a2a2a",
                  borderColor: done || isActive ? "rgba(136,201,247,.25)" : "rgba(255,255,255,.08)",
                }}
              >
                <LessonIcon slug={lesson.slug} size={34} muted={!done && !isActive} />
              </div>
              <div className="min-w-0">
                <div className="mb-0.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8b9dff]">
                  Level {levelNumber} · {levelTitle}
                </div>
                <h3 className="text-[18px] font-extrabold leading-tight">{lesson.title}</h3>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <Chip gold>+{lesson.xpReward} XP</Chip>
              <Chip>
                Lesson {index + 1} of {total}
              </Chip>
              <span
                className="rounded-full border px-[11px] py-[5px] text-xs font-bold"
                style={
                  lesson.isFree
                    ? { borderColor: "rgba(69,109,255,.35)", background: "rgba(69,109,255,.12)", color: "#88c9f7" }
                    : { borderColor: "rgba(247,195,37,.35)", background: "rgba(247,195,37,.15)", color: "#ffd85c" }
                }
              >
                {lesson.isFree ? "Free" : "Premium"}
              </span>
            </div>

            {done ? (
              <Button asChild variant="outline" className="h-12 w-full rounded-full border-[#456dff]/40 text-[#88c9f7]">
                <Link href={`/learn/${lesson.slug}`}>Review lesson ↺</Link>
              </Button>
            ) : locked ? (
              <Button
                asChild
                className="h-12 w-full rounded-full bg-[#f7c325] text-[#141414] shadow-[0_4px_20px_rgba(247,195,37,0.3)] hover:bg-[#e0af12]"
              >
                <Link href="/settings">Upgrade to Premium →</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="h-12 w-full rounded-full bg-[#456dff] shadow-[0_4px_20px_rgba(69,109,255,0.35)] hover:bg-[#2a4ae8]"
              >
                <Link href={`/learn/${lesson.slug}`}>{isActive ? "Start lesson →" : "Continue →"}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function LessonIcon({ slug, size, muted }: { slug: string; size: number; muted?: boolean }) {
  return <IconGlyph icon={SVG_ICON_BY_SLUG[slug] ?? "grid"} size={size} muted={muted} />;
}

function IconGlyph({ icon, size, muted }: { icon: IconKey; size: number; muted?: boolean }) {
  const g = muted ? "#6f6f6f" : "#22C55E";
  const r = muted ? "#8a8a8a" : "#EF4444";
  const w = muted ? "#9a9a9a" : "#ffffff";
  const b = muted ? "#7a7a7a" : "#88C9F7";
  const gold = muted ? "#8a8a8a" : "#F7C325";

  switch (icon) {
    case "candle":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="5" x2="20" y2="35" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <rect x="13" y="13" width="14" height="15" rx="2.5" fill={g} stroke={w} strokeWidth="1.4" />
        </svg>
      );
    case "bars":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="14" y1="6" x2="14" y2="34" stroke={g} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="9" y="12" width="10" height="15" rx="1.6" fill={g} />
          <line x1="27" y1="8" x2="27" y2="36" stroke={r} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="22" y="16" width="10" height="13" rx="1.6" fill={r} />
        </svg>
      );
    case "hammer":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="5" x2="20" y2="12" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <rect x="13" y="12" width="14" height="8" rx="2" fill={g} stroke={w} strokeWidth="1.2" />
          <line x1="20" y1="20" x2="20" y2="36" stroke={w} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "sr":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="5" y1="10" x2="35" y2="10" stroke={b} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
          <line x1="5" y1="31" x2="35" y2="31" stroke={b} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
          <polyline points="7,27 15,14 22,25 30,13 34,22" fill="none" stroke={w} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "trend":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polyline points="5,31 15,22 22,27 34,9" fill="none" stroke={g} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points="26,9 34,9 34,17" fill="none" stroke={g} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "peaks":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polyline points="5,28 12,18 16,24 20,8 24,24 28,16 35,28" fill="none" stroke={w} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="5" y1="28" x2="35" y2="28" stroke={b} strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" />
        </svg>
      );
    case "building":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polygon points="6,15 20,6 34,15" fill={w} />
          <rect x="8" y="16" width="3.5" height="16" fill={w} />
          <rect x="18.25" y="16" width="3.5" height="16" fill={w} />
          <rect x="28.5" y="16" width="3.5" height="16" fill={w} />
          <rect x="5" y="32" width="30" height="3" rx="1" fill={w} />
        </svg>
      );
    case "people":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="25" cy="15" r="5" fill={w} opacity=".75" />
          <path d="M18 33 a7 7 0 0 1 14 0" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" opacity=".75" />
          <circle cx="15" cy="13" r="6.5" fill={b} />
          <path d="M5 33 a10 10 0 0 1 20 0" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "pin":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 5 a10 10 0 0 1 10 10 c0 8 -10 20 -10 20 s-10 -12 -10 -20 a10 10 0 0 1 10 -10 z" fill={b} />
          <circle cx="20" cy="15" r="4" fill="#141414" />
        </svg>
      );
    case "clock":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="20" r="14" fill="none" stroke={w} strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="11" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="20" x2="26" y2="24" stroke={w} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="6" y="6" width="12" height="12" rx="2" fill={g} />
          <rect x="22" y="6" width="12" height="12" rx="2" fill={r} />
          <rect x="6" y="22" width="12" height="12" rx="2" fill={b} />
          <rect x="22" y="22" width="12" height="12" rx="2" fill={gold} />
        </svg>
      );
    case "priceTag":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M8 6 h14 l12 12 -12 12 h-14 a2 2 0 0 1 -2 -2 v-20 a2 2 0 0 1 2 -2 z"
            fill="none"
            stroke={w}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="13" cy="13" r="2.2" fill={g} />
        </svg>
      );
    case "arrows":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="6" y1="20" x2="34" y2="20" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <polyline points="12,13 6,20 12,27" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="28,13 34,20 28,27" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "flag":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="10" y1="6" x2="10" y2="34" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <path d="M10 8 h18 l-5 6 5 6 h-18 z" fill={gold} />
        </svg>
      );
    case "card":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="5" y="10" width="30" height="20" rx="3" fill="none" stroke={b} strokeWidth="2" />
          <rect x="5" y="15" width="30" height="4" fill={b} />
          <rect x="9" y="23" width="10" height="3" rx="1" fill={b} opacity=".7" />
        </svg>
      );
    case "briefcase":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="6" y="14" width="28" height="18" rx="2" fill="none" stroke={w} strokeWidth="2" />
          <path d="M15 14 v-4 a2 2 0 0 1 2 -2 h6 a2 2 0 0 1 2 2 v4" fill="none" stroke={w} strokeWidth="2" />
          <line x1="6" y1="22" x2="34" y2="22" stroke={w} strokeWidth="2" />
        </svg>
      );
    case "sliders":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="7" y1="10" x2="33" y2="10" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="10" r="3" fill={g} />
          <line x1="7" y1="20" x2="33" y2="20" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="20" r="3" fill={r} />
          <line x1="7" y1="30" x2="33" y2="30" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="30" r="3" fill={b} />
        </svg>
      );
    case "receipt":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M10 5 h20 v28 l-3 -3 -3 3 -3 -3 -3 3 -3 -3 -3 3 -2 -2 z"
            fill="none"
            stroke={w}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1="14" y1="13" x2="26" y2="13" stroke={w} strokeWidth="1.6" />
          <line x1="14" y1="19" x2="26" y2="19" stroke={w} strokeWidth="1.6" />
          <line x1="14" y1="25" x2="22" y2="25" stroke={w} strokeWidth="1.6" />
        </svg>
      );
    case "coin":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="15" cy="23" r="10" fill={gold} opacity=".9" />
          <circle cx="24" cy="14" r="10" fill="none" stroke={gold} strokeWidth="2" />
        </svg>
      );
    case "bolt":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polygon points="21,4 9,22 18,22 15,36 31,16 21,16" fill={gold} />
        </svg>
      );
    case "rocket":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 4 c6 4 8 12 8 18 l-8 8 -8 -8 c0 -6 2 -14 8 -18 z" fill={b} />
          <circle cx="20" cy="16" r="3" fill="#141414" />
          <path d="M12 22 l-5 8 8 -3 z" fill={r} />
          <path d="M28 22 l5 8 -8 -3 z" fill={r} />
          <path d="M17 30 l-3 6 M23 30 l3 6" stroke={gold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "warning":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 5 L36 33 H4 Z" fill="none" stroke={r} strokeWidth="2" strokeLinejoin="round" />
          <line x1="20" y1="15" x2="20" y2="23" stroke={r} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="27.5" r="1.6" fill={r} />
        </svg>
      );
    case "ruler":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="4" y="16" width="32" height="8" rx="1" fill="none" stroke={w} strokeWidth="1.8" />
          <line x1="10" y1="16" x2="10" y2="20" stroke={w} strokeWidth="1.6" />
          <line x1="16" y1="16" x2="16" y2="22" stroke={w} strokeWidth="1.6" />
          <line x1="22" y1="16" x2="22" y2="20" stroke={w} strokeWidth="1.6" />
          <line x1="28" y1="16" x2="28" y2="22" stroke={w} strokeWidth="1.6" />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M20 4 L34 9 V19 C34 28 28 34 20 37 C12 34 6 28 6 19 V9 Z"
            fill="none"
            stroke={b}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polyline points="14,20 18,24 27,14" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scale":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="6" x2="20" y2="30" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12" x2="32" y2="12" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12 l-4 10 h8 z" fill="none" stroke={g} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M32 12 l-4 10 h8 z" fill="none" stroke={r} strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="12" y1="32" x2="28" y2="32" stroke={w} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "notebook":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="8" y="5" width="24" height="30" rx="2" fill="none" stroke={w} strokeWidth="1.8" />
          <line x1="8" y1="12" x2="32" y2="12" stroke={w} strokeWidth="1.4" />
          <line x1="13" y1="19" x2="27" y2="19" stroke={w} strokeWidth="1.4" opacity=".7" />
          <line x1="13" y1="24" x2="27" y2="24" stroke={w} strokeWidth="1.4" opacity=".7" />
          <line x1="13" y1="29" x2="22" y2="29" stroke={w} strokeWidth="1.4" opacity=".7" />
        </svg>
      );
    case "brain":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="19" r="13" fill="none" stroke={r} strokeWidth="2" />
          <path d="M12 19 q4 -6 8 0 q4 -6 8 0" fill="none" stroke={r} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "guardrail":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 6 L28 30 H12 Z" fill={gold} />
          <rect x="9" y="30" width="22" height="4" rx="1" fill={gold} opacity=".85" />
          <rect x="14" y="17" width="12" height="3" fill="#141414" opacity=".5" />
        </svg>
      );
    case "oscillator":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="4" y="8" width="32" height="24" rx="2" fill="none" stroke={w} strokeWidth="1.6" />
          <line x1="4" y1="15" x2="36" y2="15" stroke={w} strokeWidth="1" strokeDasharray="2 2" opacity=".5" />
          <line x1="4" y1="25" x2="36" y2="25" stroke={w} strokeWidth="1" strokeDasharray="2 2" opacity=".5" />
          <polyline
            points="6,22 12,10 18,26 24,14 30,20 34,12"
            fill="none"
            stroke={r}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "maLine":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M4 24 Q12 8 20 20 T36 14" fill="none" stroke={g} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M4 28 Q12 18 20 26 T36 22" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="20" r="12" fill="none" stroke={w} strokeWidth="2" />
        </svg>
      );
  }
}

