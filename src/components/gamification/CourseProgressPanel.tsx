"use client";

import { CircularProgressCard } from "@/components/circular-progress-card";
import type { Course } from "@/lib/data/courses";

interface Props {
  course: Course;
  totalLessons: number;
  completedCount: number;
}

export function CourseProgressPanel({ course, totalLessons, completedCount }: Props) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#1E1E1E] p-4">
      <div
        className="mb-4 flex items-center justify-center rounded-[14px] text-[56px]"
        style={{
          height: 120,
          background: "linear-gradient(135deg, #0D1830, #1A2A5A)",
        }}
      >
        {course.illustrationEmoji}
      </div>

      <CircularProgressCard
        title={course.title}
        description={course.description}
        currentValue={completedCount}
        goalValue={totalLessons}
        countLabel="lessons"
        progressColor="#456DFF"
        className="mx-auto max-w-none border-0 bg-transparent text-left shadow-none [&_h3]:text-left [&_h3]:text-[20px] [&_p]:text-left"
      />

      <div className="mt-2 flex flex-wrap gap-3 border-t border-white/10 px-2 pt-4 text-[13px] text-[#666]">
        <div className="flex items-center gap-1.5">
          <span>📖</span>
          <span>{totalLessons} Lessons</span>
        </div>
        {course.totalExercises != null ? (
          <div className="flex items-center gap-1.5">
            <span>🧩</span>
            <span>{course.totalExercises} Exercises</span>
          </div>
        ) : null}
      </div>

      {course.premium ? (
        <div className="mx-2 mt-4 rounded-[10px] border border-[#F7C325]/25 bg-[#F7C325]/10 px-3 py-2 text-xs font-semibold text-[#F7C325]">
          🔒 Premium course — unlock with subscription
        </div>
      ) : null}
    </div>
  );
}
