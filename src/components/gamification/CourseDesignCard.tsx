"use client";

import Link from "next/link";
import type { Course } from "@/lib/data/courses";

const VARIANTS = ["green", "orange", "red", "blue"] as const;
type Variant = (typeof VARIANTS)[number];

function EllipsisIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="course-design-card__menu">
      <path
        fillRule="evenodd"
        d="M10.5 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm0 6a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatMeta(totalLessons: number, completedCount: number) {
  const remaining = Math.max(totalLessons - completedCount, 0);
  if (completedCount === 0) return "Start course";
  if (remaining === 0) return "Completed";
  if (remaining === 1) return "1 lesson left";
  return `${remaining} lessons left`;
}

interface Props {
  course: Course;
  index: number;
  completedCount?: number;
  pathTitle?: string;
}

export function CourseDesignCard({ course, index, completedCount = 0, pathTitle }: Props) {
  const variant: Variant = VARIANTS[index % VARIANTS.length]!;
  const total = course.lessonSlugs.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const subtitle = pathTitle ?? course.description;
  const dateLabel = `${total} lessons · +${course.xpReward} XP`;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`course-design-card course-design-card--${variant}`}
    >
      {course.premium ? <span className="course-design-card__premium">PREMIUM</span> : null}

      <div className="course-design-card__header">
        <div className="course-design-card__date">{dateLabel}</div>
        <EllipsisIcon />
      </div>

      <div className="course-design-card__body">
        <h3 className="course-design-card__title">{course.title}</h3>
        <p className="course-design-card__subtitle">{subtitle}</p>
        <div className="course-design-card__progress">
          <span className="course-design-card__progress-label">Progress</span>
          <div className="course-design-card__progress-bar">
            <span className="course-design-card__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="course-design-card__progress-value">{pct}%</span>
        </div>
      </div>

      <div className="course-design-card__footer">
        <ul className="course-design-card__avatars" aria-hidden="true">
          <li className="course-design-card__avatar">{course.illustrationEmoji}</li>
          <li className="course-design-card__avatar">{course.levels[0]?.number ?? 1}</li>
          <li>
            <span className="course-design-card__add">
              <AddIcon />
            </span>
          </li>
        </ul>
        <span className="course-design-card__cta">{formatMeta(total, completedCount)}</span>
      </div>
    </Link>
  );
}
