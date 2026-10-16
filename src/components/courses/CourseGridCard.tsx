"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CandlestickChart,
  Check,
  Landmark,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import type { Course } from "@/lib/data/courses";

/** One Lucide glyph per course — never emoji. */
const COURSE_ICON: Record<string, typeof BookOpen> = {
  "financial-markets-101": Landmark,
  "how-to-actually-trade": Receipt,
  "risk-and-trader-mindset": ShieldCheck,
  "candlestick-essentials": CandlestickChart,
  "indicator-starter-kit": Activity,
};

function ctaLabel(total: number, completed: number) {
  if (completed === 0) return "Start course";
  if (completed >= total) return "Review course";
  const left = total - completed;
  return left === 1 ? "1 lesson left" : `${left} lessons left`;
}

export function CourseGridCard({
  course,
  completedCount = 0,
}: {
  course: Course;
  completedCount?: number;
}) {
  const Icon = COURSE_ICON[course.slug] ?? BookOpen;
  const total = course.lessonSlugs.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const done = total > 0 && completedCount >= total;

  return (
    <Link href={`/courses/${course.slug}`} className="tvd-ccard" data-done={done ? "" : undefined}>
      <div className="tvd-ccard-top">
        <span className="tvd-ctile" aria-hidden>
          {done ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
        </span>
        {course.premium ? <span className="tvd-chipsm">Premium</span> : null}
      </div>

      <h3>{course.title}</h3>
      <p className="tvd-cdesc">{course.description}</p>

      <div className="tvd-cmeta">
        <span>{total} lessons</span>
        <span>+{course.xpReward} XP</span>
      </div>

      <div className="tvd-prog">
        <div className="tvd-track">
          <i style={{ width: `${pct}%` }} />
        </div>
        <span className="tvd-progval">{pct}%</span>
      </div>

      <span className="tvd-ccta">
        {ctaLabel(total, completedCount)}
        <ArrowRight size={15} aria-hidden />
      </span>
    </Link>
  );
}
