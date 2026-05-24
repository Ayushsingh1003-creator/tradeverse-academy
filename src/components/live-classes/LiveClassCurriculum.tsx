"use client";

import { useState } from "react";
import type { LiveClassCurriculumModule } from "@/lib/data/liveClasses";

export function LiveClassCurriculum({
  curriculum,
}: {
  curriculum: LiveClassCurriculumModule[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {curriculum.map((module, index) => {
        const open = openIndex === index;
        return (
          <div key={module.moduleTitle} className="overflow-hidden rounded-xl border border-border bg-surface">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
            >
              <span className="text-sm font-semibold text-white">
                Module {index + 1}: {module.moduleTitle}
              </span>
              <span className="text-xs text-text-muted">{open ? "Hide" : "Show"}</span>
            </button>
            {open ? (
              <ul className="border-t border-border px-4 py-3 text-sm text-text-muted">
                {module.lessons.map((lesson) => (
                  <li key={lesson} className="py-1">
                    • {lesson}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
