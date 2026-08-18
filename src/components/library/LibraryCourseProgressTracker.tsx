"use client";

import type { LibraryCourseCardProgress } from "@/lib/libraryCourseProgress";

const VARIANTS = ["green", "orange", "red", "blue"] as const;

const FILL_COLORS: Record<(typeof VARIANTS)[number], string> = {
  green: "#01c3a8",
  orange: "#ffb741",
  red: "#a63d2a",
  blue: "#1890ff",
};

export function LibraryCourseProgressTracker({
  progress,
  index = 0,
}: {
  progress: LibraryCourseCardProgress;
  index?: number;
}) {
  if (progress.totalItems === 0) return null;

  const variant = VARIANTS[index % VARIANTS.length]!;

  return (
    <div className="mt-3">
      <span className="block text-left text-sm font-semibold text-white">Progress</span>
      <div className="mt-1.5 h-[5px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.08)]">
        <span
          className="block h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${progress.percent}%`, backgroundColor: FILL_COLORS[variant] }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-text-muted">{progress.statusLabel}</p>
        <span className="text-sm font-semibold text-white">{progress.percent}%</span>
      </div>
    </div>
  );
}
