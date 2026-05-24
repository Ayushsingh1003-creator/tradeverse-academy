"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useId, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { CourseProgressPanel } from "@/components/gamification/CourseProgressPanel";
import { LESSON_ICON_BY_SLUG } from "@/lib/data/courseIcons";
import { useUserStore } from "@/lib/store";
import type { Course, CourseLevel } from "@/lib/data/courses";
import type { Lesson } from "@/lib/data/lessons";

const NODE_SIZE = 80;

interface Props {
  course: Course;
  allLessons: Lesson[];
}

export function CourseDetailPage({ course, allLessons }: Props) {
  const hydrate = useUserStore((s) => s.hydrate);
  const hydrated = useUserStore((s) => s.hydrated);
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  const totalLessons = course.lessonSlugs.length;
  const completedCount = course.lessonSlugs.filter((s) => lessonsCompleted.includes(s)).length;

  const activeSlug =
    course.lessonSlugs.find((s) => !lessonsCompleted.includes(s)) ?? course.lessonSlugs[0] ?? "";

  // User-selected lesson (null = use the auto-active one as default)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const effectiveSelectedSlug = selectedSlug ?? activeSlug;
  const selectedLesson = allLessons.find((lesson) => lesson.slug === effectiveSelectedSlug);

  // Compute which slugs are unlocked (sequential gating per course-level)
  const unlockedSlugs = computeUnlockedSlugs(course, lessonsCompleted);

  const handleSelect = (slug: string) => {
    if (!unlockedSlugs.has(slug)) return; // locked → ignore
    setSelectedSlug(slug);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <AppNav />

      <div className="mx-auto flex max-w-[1240px] flex-col items-stretch gap-8 px-5 py-8 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:sticky lg:top-20 lg:w-[360px]">
          <CourseProgressPanel course={course} totalLessons={totalLessons} completedCount={completedCount} />
        </div>

        <div
          className="min-w-0 flex-1 overflow-hidden rounded-[20px] border border-white/10 bg-[#171717]"
          style={{ height: "calc(100vh - 120px)" }}
        >
          <div className="sticky top-0 z-20 border-b border-white/10 bg-[#171717]/95 px-5 py-4 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8B9DFF]">Course Checklist</p>
            <h2 className="mt-1 text-lg font-bold text-white">Pick a lesson — or continue where you left off</h2>
          </div>
          <div className="h-[calc(100%-74px)] overflow-y-auto px-4 pb-32 pt-3 md:px-5">
            {course.levels.map((level) => {
              const levelLessons = level.lessonSlugs
                .map((slug) => allLessons.find((l) => l.slug === slug))
                .filter(Boolean) as Lesson[];

              return (
                <LevelSection
                  key={level.id}
                  level={level}
                  lessons={levelLessons}
                  completedSlugs={lessonsCompleted}
                  activeSlug={activeSlug}
                  selectedSlug={effectiveSelectedSlug}
                  unlockedSlugs={unlockedSlugs}
                  onSelect={handleSelect}
                />
              );
            })}
          </div>
        </div>
      </div>

      {selectedLesson ? (
        <NodePopupCard
          lesson={selectedLesson}
          done={lessonsCompleted.includes(selectedLesson.slug)}
          unlocked={unlockedSlugs.has(selectedLesson.slug)}
          isActive={selectedLesson.slug === activeSlug}
        />
      ) : null}
    </div>
  );
}

/** A lesson is unlocked if it's the first in any level, or the previous lesson in its level is completed. */
function computeUnlockedSlugs(course: Course, completed: string[]): Set<string> {
  const unlocked = new Set<string>();
  for (const level of course.levels) {
    for (let i = 0; i < level.lessonSlugs.length; i++) {
      const slug = level.lessonSlugs[i]!;
      const prev = i > 0 ? level.lessonSlugs[i - 1]! : null;
      if (i === 0 || (prev && completed.includes(prev))) {
        unlocked.add(slug);
      }
      // Also allow re-selecting completed lessons for review
      if (completed.includes(slug)) unlocked.add(slug);
    }
  }
  return unlocked;
}

function LevelSection({
  level,
  lessons,
  completedSlugs,
  activeSlug,
  selectedSlug,
  unlockedSlugs,
  onSelect,
}: {
  level: CourseLevel;
  lessons: Lesson[];
  completedSlugs: string[];
  activeSlug: string;
  selectedSlug: string;
  unlockedSlugs: Set<string>;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-[#1D1D1D] p-3 md:p-4">
      <LevelHeader number={level.number} title={level.title} />

      <div>
        {lessons.map((lesson, idx) => {
          const done = completedSlugs.includes(lesson.slug);
          const unlocked = unlockedSlugs.has(lesson.slug);
          const isActive = lesson.slug === activeSlug;
          const isSelected = lesson.slug === selectedSlug;
          const direction: "left" | "right" = idx % 2 === 0 ? "left" : "right";

          return (
            <LessonNode
              key={lesson.slug}
              lesson={lesson}
              done={done}
              unlocked={unlocked}
              isActive={isActive}
              isSelected={isSelected}
              isFirst={idx === 0}
              isLast={idx === lessons.length - 1}
              direction={direction}
              onSelect={() => onSelect(lesson.slug)}
            />
          );
        })}

        {level.reviewSlug ? <LevelReviewNode slug={level.reviewSlug} /> : null}
      </div>
    </div>
  );
}

function LevelHeader({ number, title }: { number: number; title: string }) {
  return (
    <div
      className="z-20 mb-3 rounded-[14px] px-4 py-3 backdrop-blur-md"
      style={{
        background: "#181818",
        border: "1.5px solid #456DFF",
      }}
    >
      <div
        className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8B9DFF]"
      >
        LEVEL {number}
      </div>
      <div className="text-[17px] font-bold text-white">{title}</div>
    </div>
  );
}

function LessonNode({
  lesson,
  done,
  unlocked,
  isActive,
  isSelected,
  isFirst,
  isLast,
  direction,
  onSelect,
}: {
  lesson: Lesson;
  done: boolean;
  unlocked: boolean;
  isActive: boolean;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  direction: "left" | "right";
  onSelect: () => void;
}) {
  const lineColor = done ? "#456DFF" : "rgba(255,255,255,0.08)";
  const lessonIcon = LESSON_ICON_BY_SLUG[lesson.slug] ?? "📘";
  const connectorX = direction === "left" ? "28%" : "72%";
  const rowSideClass = direction === "left" ? "justify-start" : "justify-end";
  const contentFlowClass = direction === "left" ? "flex-row text-left" : "flex-row-reverse text-right";

  const clickable = unlocked || done;
  const cardBorder = isSelected
    ? "border-[#F7C325]/60 bg-[rgba(247,195,37,0.08)] shadow-[0_0_0_2px_rgba(247,195,37,0.35)]"
    : done
      ? "border-[#456DFF]/40 bg-[#456DFF]/10 hover:border-[#456DFF]/60"
      : unlocked || isActive
        ? "border-white/15 bg-white/[0.03] hover:border-white/30 hover:-translate-y-0.5"
        : "border-white/8 bg-white/[0.02] opacity-60";

  return (
    <div className="relative">
      {!isFirst ? (
        <div
          className="h-[30px] w-0.5"
          style={{
            background: lineColor,
            marginLeft: connectorX,
          }}
        />
      ) : null}

      <div
        role="button"
        aria-pressed={isSelected}
        tabIndex={clickable ? 0 : -1}
        className={`relative flex ${rowSideClass} pb-2`}
        style={{
          paddingTop: isFirst ? 24 : 0,
          cursor: clickable ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          if (clickable) onSelect();
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && clickable) {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div
          className={`flex w-full max-w-[360px] items-center gap-3 rounded-xl border p-2.5 transition-all duration-200 ${cardBorder} ${contentFlowClass}`}
        >
          <div className="relative h-20 w-20 shrink-0">
            {isActive ? (
              <ActiveCoinNode />
            ) : done ? (
              <CompletedCoinNode />
            ) : unlocked ? (
              <UnlockedCoinNode />
            ) : (
              <LockedCoinNode />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{lessonIcon}</span>
              <span
                className="max-w-[220px] text-sm leading-snug"
                style={{
                  fontWeight: unlocked || done ? 600 : 500,
                  color: done ? "#88C9F7" : unlocked || isActive ? "white" : "#555",
                }}
              >
                {done ? <span className="mr-1.5 text-[#456DFF]">✓</span> : null}
                {lesson.title}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45">
              <span>
                {done ? "Completed" : unlocked || isActive ? "Ready to start" : "Locked"}
              </span>
              {isSelected ? (
                <span className="rounded-full bg-[#F7C325]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#F7C325]">
                  SELECTED
                </span>
              ) : null}
            </div>
          </div>

          {unlocked && !done ? (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-[#F7C325]"
              style={{ background: "rgba(247,195,37,0.10)" }}
            >
              +{lesson.xpReward}⚡
            </span>
          ) : null}
        </div>
      </div>

      {!isLast ? (
        <div
          className="h-8 w-0.5"
          style={{
            background: lineColor,
            marginLeft: connectorX,
          }}
        />
      ) : null}
    </div>
  );
}

function ActiveCoinNode() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" width={NODE_SIZE} height={NODE_SIZE}>
      <defs>
        <radialGradient id={`activeGlow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#456DFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#456DFF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`platformGrad-${uid}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#88C9F7" />
          <stop offset="100%" stopColor="#1A3A8A" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="56" rx="34" ry="14" fill={`url(#activeGlow-${uid})`} />
      <ellipse cx="40" cy="58" rx="26" ry="9" fill="rgba(69,109,255,0.25)" />
      <ellipse cx="40" cy="54" rx="24" ry="8" fill="#2A4AE8" />
      <ellipse cx="40" cy="50" rx="24" ry="8" fill={`url(#platformGrad-${uid})`} />
      <ellipse cx="40" cy="50" rx="28" ry="10" fill="none" stroke="#456DFF" strokeWidth="2.5" opacity="0.9">
        <animate attributeName="rx" values="28;32;28" dur="2s" repeatCount="indefinite" />
        <animate attributeName="ry" values="10;12;10" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="40" cy="34" rx="10" ry="12" fill="#29CC57" />
      <circle cx="40" cy="22" r="8" fill="#29CC57" />
      <rect x="36" y="19" width="8" height="6" rx="2" fill="#1E1E1E" />
      <rect x="37" y="20" width="6" height="4" rx="1" fill="#456DFF" opacity="0.8" />
    </svg>
  );
}

function CompletedCoinNode() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" width={NODE_SIZE} height={NODE_SIZE}>
      <defs>
        <radialGradient id={`doneGrad-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#88C9F7" />
          <stop offset="100%" stopColor="#2A4AE8" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="62" rx="24" ry="7" fill="rgba(0,0,0,0.4)" />
      <ellipse cx="40" cy="58" rx="26" ry="9" fill="#1A3A8A" />
      <rect x="14" y="42" width="52" height="16" fill="#1E4ACA" rx="2" />
      <ellipse cx="40" cy="42" rx="26" ry="9" fill={`url(#doneGrad-${uid})`} />
      <text x="40" y="46" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">
        ✓
      </text>
    </svg>
  );
}

function UnlockedCoinNode() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" width={NODE_SIZE} height={NODE_SIZE}>
      <defs>
        <radialGradient id={`unlockGrad-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e0e8ff" />
          <stop offset="100%" stopColor="#8899cc" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="62" rx="24" ry="7" fill="rgba(0,0,0,0.35)" />
      <ellipse cx="40" cy="50" rx="30" ry="11" fill="none" stroke="#456DFF" strokeWidth="2.5" opacity="0.8" />
      <ellipse cx="40" cy="58" rx="24" ry="8" fill="#333" />
      <rect x="16" y="44" width="48" height="14" fill="#444" rx="2" />
      <ellipse cx="40" cy="44" rx="24" ry="8" fill={`url(#unlockGrad-${uid})`} />
      <ellipse cx="40" cy="44" rx="10" ry="4" fill="#2A2A2A" />
      <ellipse cx="40" cy="44" rx="8" ry="3" fill="#666" opacity="0.5" />
      <text x="40" y="47" fill="#456DFF" fontSize="8" fontWeight="bold" textAnchor="middle">
        →
      </text>
    </svg>
  );
}

function LockedCoinNode() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 80 80" width={NODE_SIZE} height={NODE_SIZE} opacity="0.5">
      <defs>
        <radialGradient id={`lockGrad-${uid}`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#666" />
          <stop offset="100%" stopColor="#333" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="62" rx="22" ry="6" fill="rgba(0,0,0,0.3)" />
      <ellipse cx="40" cy="58" rx="22" ry="7" fill="#222" />
      <rect x="18" y="44" width="44" height="14" fill="#2A2A2A" rx="2" />
      <ellipse cx="40" cy="44" rx="22" ry="7" fill={`url(#lockGrad-${uid})`} />
      <ellipse cx="40" cy="44" rx="9" ry="3.5" fill="#1A1A1A" />
    </svg>
  );
}

function LevelReviewNode({ slug }: { slug: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <div className="flex items-center gap-4 pl-0" aria-label={`Level review checkpoint: ${slug}`}>
      <svg viewBox="0 0 80 80" width={NODE_SIZE} height={NODE_SIZE}>
        <defs>
          <radialGradient id={`reviewGrad-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#F7C325" />
          </radialGradient>
        </defs>
        <ellipse cx="40" cy="62" rx="20" ry="6" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="40" cy="58" rx="22" ry="7" fill="#A07810" />
        <rect x="18" y="42" width="44" height="16" fill="#C49B10" rx="2" />
        <ellipse cx="40" cy="42" rx="22" ry="7" fill={`url(#reviewGrad-${uid})`} />
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = 40 + Math.cos(rad) * 10;
          const py = 42 + Math.sin(rad) * 4;
          return (
            <ellipse
              key={i}
              cx={px}
              cy={py}
              rx="5"
              ry="3"
              fill="#FFE066"
              transform={`rotate(${deg}, ${px}, ${py})`}
            />
          );
        })}
        <circle cx="40" cy="42" r="5" fill="#F7C325" />
      </svg>
      <div>
        <div className="mb-0.5 text-[11px] font-bold uppercase tracking-wide text-[#F7C325]">Level Review</div>
        <div className="text-[13px] text-[#999]">Test what you&apos;ve learned</div>
      </div>
    </div>
  );
}

function NodePopupCard({
  lesson,
  done,
  unlocked,
  isActive,
}: {
  lesson: Lesson;
  done: boolean;
  unlocked: boolean;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="slide-up-fade-popup fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      style={{ width: "min(420px, calc(100vw - 32px))" }}
    >
      <Card className="border-white/12 bg-[#1E1E1E] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <CardContent className="p-0">
          <h3 className="mb-3.5 text-center text-[17px] font-bold text-white">{lesson.title}</h3>

          <div className="mb-4 flex justify-center gap-4 text-xs text-[#666]">
            <span className="rounded-full bg-[#F7C325]/10 px-2 py-0.5 font-semibold text-[#F7C325]">
              +{lesson.xpReward} XP
            </span>
            <span>{lesson.pages?.length ?? 0} steps</span>
            {lesson.isFree ? <span className="text-[#29CC57]">Free</span> : null}
          </div>

          {done ? (
            <Button asChild variant="outline" className="h-12 w-full rounded-full border-[#456DFF]/40 text-[#88C9F7]">
              <Link href={`/learn/${lesson.slug}`}>Review lesson ↺</Link>
            </Button>
          ) : isActive || unlocked ? (
            <Button asChild className="h-12 w-full rounded-full bg-[#456DFF] shadow-[0_4px_20px_rgba(69,109,255,0.35)] hover:bg-[#2A4AE8]">
              <Link href={`/learn/${lesson.slug}`}>{isActive ? "Start" : "Continue →"}</Link>
            </Button>
          ) : (
            <Button disabled variant="secondary" className="h-12 w-full rounded-full">
              Complete previous lesson first
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
