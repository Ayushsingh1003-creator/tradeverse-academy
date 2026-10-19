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
    <div className="tvd-cardstack" style={{ gap: 10 }}>
      {curriculum.map((module, index) => {
        const open = openIndex === index;
        return (
          <div key={module.moduleTitle} style={{ overflow: "hidden", borderRadius: 14, border: "1px solid var(--tv-line)", background: "var(--tv-sunk)" }}>
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
            >
              <span style={{ fontSize: 14, fontWeight: 800 }}>
                Module {index + 1}: {module.moduleTitle}
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "var(--tv-acc-chip)" }}>{open ? "Hide" : "Show"}</span>
            </button>
            {open ? (
              <ul style={{ borderTop: "1px solid var(--tv-line)", padding: "12px 16px", fontSize: 13.5, fontWeight: 700, color: "var(--tv-mute)", listStyle: "none", margin: 0 }}>
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
