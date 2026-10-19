"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, Crown, Layers, RotateCcw, X, Zap } from "lucide-react";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { useUserStore } from "@/lib/store";
import { LEARNING_PATHS, type Course } from "@/lib/data/courses";
import type { Lesson } from "@/lib/data/lessons";
import { IconKeyLucide, LessonLucideIcon } from "@/components/icons/LessonLucideIcon";
import { SVG_ICON_BY_SLUG, type IconKey } from "@/components/icons/LessonIconGlyph";
import { PRICING_URL } from "@/lib/pricingUrl";

const FREE_COURSE_SLUG = "candlestick-essentials";

interface Props {
  course: Course;
  allLessons: Lesson[];
}

type NodeState = "done" | "active" | "upcoming";

/** Hero tile glyph per course slug. */
const HERO_ICON_BY_COURSE_SLUG: Record<string, IconKey> = {
  "candlestick-essentials": "bars",
  "financial-markets-101": "building",
  "how-to-actually-trade": "rocket",
  "risk-and-trader-mindset": "shieldCheck",
  "indicator-starter-kit": "oscillator",
};

/** Horizontal sway per lesson node, in course-lesson order — gives the path its wavy feel. */
const BASE_OFFSETS = [-0.5, 0.5, -0.3, -0.95, 0.82];

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
  const selectedLevel = selectedLesson
    ? levels.find((lv) => lv.lessonSlugs.includes(selectedLesson.slug))
    : undefined;

  const pathRef = useRef<HTMLDivElement>(null);
  const [curveD, setCurveD] = useState("");
  /** Sway is scaled to the column so the nodes never overflow it. */
  const [sway, setSway] = useState(0);

  useEffect(() => {
    const measure = () => {
      const container = pathRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      // Reserve half the 158px label width — the label, not the 90px node, is
      // the widest part of a step, and it is what was getting cut off.
      setSway(Math.max(0, containerRect.width / 2 - 88));
      const nodes = Array.from(container.querySelectorAll<HTMLElement>("[data-node]"));
      if (!nodes.length) return;
      const points = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return [
          Math.round(r.left + r.width / 2 - containerRect.left),
          Math.round(r.top + r.height / 2 - containerRect.top),
        ];
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
    // `sway` re-runs the pass once the nodes have moved, so the curve follows them.
  }, [lessonsCompleted, sway]);

  let lessonCursor = -1;

  return (
    <ThemeScope>
      <AppShell>
        <div className="tvd-crumb">
          <Link href="/courses">Courses</Link>
          <span aria-hidden>›</span>
          <b>{course.title}</b>
        </div>

        <div className="tvd-hero">
          <span className="tvd-herotile" aria-hidden>
            <IconKeyLucide icon={HERO_ICON_BY_COURSE_SLUG[course.slug] ?? "grid"} size={36} />
          </span>

          <div className="tvd-herobody">
            <div className="tvd-eyebrow">{pathTitle} · Course</div>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="tvd-chips">
              <span className="tvd-tag">
                <BookOpen size={14} aria-hidden />
                {total} lessons
              </span>
              <span className="tvd-tag">
                <Layers size={14} aria-hidden />
                {course.totalExercises ?? 0} exercises
              </span>
              <span className="tvd-tag" data-tone="gold">
                <Zap size={14} aria-hidden />
                {totalXp} XP
              </span>
            </div>
          </div>

          <div className="tvd-heroring">
            <div className="tvd-ringwrap">
              <svg width="128" height="128" viewBox="0 0 128 128" className="block" aria-hidden>
                <circle cx="64" cy="64" r="54" fill="none" stroke="var(--tv-sunk)" strokeWidth="12" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="var(--tv-acc)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 64 64)"
                  style={{ transition: "stroke-dashoffset .85s cubic-bezier(.22,1,.36,1)" }}
                />
              </svg>
              <div className="tvd-ringmid">
                <div className="tvd-ringpct">{pct}%</div>
                <div className="tvd-ringsub">
                  {completedCount} of {total}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="tvd-gobtn"
              disabled={!activeSlug}
              onClick={() => activeSlug && setSelectedSlug(activeSlug)}
            >
              {allDone ? "All lessons complete" : "Continue"}
            </button>
          </div>
        </div>

        <section ref={pathRef} className="tvd-path mt-9 flex flex-col items-center gap-6">
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden>
            <path
              d={curveD}
              fill="none"
              stroke="var(--tv-line-hi)"
              strokeWidth="3.5"
              strokeDasharray="0.5 12"
              strokeLinecap="round"
            />
          </svg>

          {levels.map((level) => {
            const levelLessons = lessons.filter((l) => level.lessonSlugs.includes(l.slug));
            const doneInLevel = levelLessons.filter((l) => lessonsCompleted.includes(l.slug)).length;
            const hasActiveInLevel = levelLessons.some((l) => l.slug === activeSlug);
            const levelState: NodeState =
              levelLessons.length > 0 && doneInLevel === levelLessons.length
                ? "done"
                : hasActiveInLevel
                  ? "active"
                  : "upcoming";

            return (
              <div key={level.id} className="relative z-[1] flex w-full flex-col items-center gap-6">
                <LevelBanner
                  number={level.number}
                  title={level.title}
                  state={levelState}
                  doneCount={doneInLevel}
                  totalCount={levelLessons.length}
                />
                {levelLessons.map((lesson) => {
                  lessonCursor += 1;
                  const offset = BASE_OFFSETS[lessonCursor % BASE_OFFSETS.length] * sway;
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
      </AppShell>
    </ThemeScope>
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
  const status =
    state === "done" ? "Completed" : state === "active" ? `${doneCount}/${totalCount} done` : "Up next";

  return (
    <div className="flex w-full justify-center">
      <div className="tvd-level" data-s={state}>
        <span className="tvd-levelbadge" aria-hidden>
          {state === "done" ? <Check size={18} strokeWidth={3} /> : number}
        </span>
        <div className="tvd-levelbody">
          <div className="tvd-eyebrow">Level {number}</div>
          <b>{title}</b>
        </div>
        <div className="tvd-levelstatus">{status}</div>
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

  return (
    <div className="relative z-[1] flex w-full justify-center">
      <div
        className="tvd-nodewrap flex flex-col items-center gap-2.5"
        data-s={state}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {isActive ? <div className="tvd-startflag">START</div> : null}

        <button type="button" data-node onClick={onSelect} className="tvd-node" data-s={state}>
          <LessonLucideIcon slug={lesson.slug} size={38} strokeWidth={2.2} />

          {isDone ? (
            <span className="tvd-nodecheck" aria-hidden>
              <Check size={16} strokeWidth={3} />
            </span>
          ) : null}

          {!lesson.isFree && state !== "upcoming" ? <span className="tvd-nodepro">PRO</span> : null}
        </button>

        <div className="tvd-nodelabel">
          <b>{lesson.title}</b>
          <small>{isDone ? "Completed" : isActive ? `+${lesson.xpReward} XP · Start now` : "Up next"}</small>
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
    <div onClick={onClose} className="tvd-scrim">
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="tvd-modal"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="tvd-modalclose">
          <X size={16} />
        </button>

        <div className="tvd-modalhead">
          <span className="tvd-herotile" style={{ width: 60, height: 60, borderRadius: 16 }} aria-hidden>
            <LessonLucideIcon slug={lesson.slug} size={28} />
          </span>
          <div className="min-w-0">
            <div className="tvd-eyebrow">
              Level {levelNumber} · {levelTitle}
            </div>
            <h3>{lesson.title}</h3>
          </div>
        </div>

        <div className="tvd-chips" style={{ marginBottom: 16 }}>
          <span className="tvd-tag" data-tone="gold">
            <Zap size={14} aria-hidden />+{lesson.xpReward} XP
          </span>
          <span className="tvd-tag">
            Lesson {index + 1} of {total}
          </span>
          <span className="tvd-tag" data-tone={lesson.isFree ? "acc" : "gold"}>
            {lesson.isFree ? "Free" : "Premium"}
          </span>
        </div>

        {done ? (
          <Link href={`/learn/${lesson.slug}`} className="tvd-gobtn" style={{ display: "block", textAlign: "center" }}>
            <span className="inline-flex items-center gap-2">
              <RotateCcw size={16} aria-hidden />
              Review lesson
            </span>
          </Link>
        ) : locked ? (
          <a
            href={PRICING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="tvd-gobtn"
            style={{ display: "block", textAlign: "center" }}
          >
            <span className="inline-flex items-center gap-2">
              <Crown size={16} aria-hidden />
              Upgrade to Premium
            </span>
          </a>
        ) : (
          <Link href={`/learn/${lesson.slug}`} className="tvd-gobtn" style={{ display: "block", textAlign: "center" }}>
            <span className="inline-flex items-center gap-2">
              {isActive ? "Start lesson" : "Continue"}
              <ArrowRight size={16} aria-hidden />
            </span>
          </Link>
        )}
      </motion.div>
    </div>
  );
}

/** Kept for callers that still reference the icon map by slug. */
export function lessonIconKey(slug: string): IconKey {
  return SVG_ICON_BY_SLUG[slug] ?? "grid";
}
