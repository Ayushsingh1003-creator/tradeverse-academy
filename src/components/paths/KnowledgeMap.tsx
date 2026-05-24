"use client";

import Link from "next/link";
import { useEffect } from "react";
import { COURSES, LEARNING_PATHS } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";
import { useUserStore } from "@/lib/store";

export function KnowledgeMap() {
  const hydrate = useUserStore((state) => state.hydrate);
  const hydrated = useUserStore((state) => state.hydrated);
  const completed = useUserStore((state) => state.lessonsCompleted);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrated, hydrate]);

  return (
    <div className="overflow-auto rounded-2xl border border-border bg-surface p-4">
      <svg width={1200} height={700} className="min-w-[1100px]">
        {LEARNING_PATHS.map((path, pathIdx) => {
          const x = 120 + pathIdx * 220;
          const pathCourses = COURSES.filter((course) => course.pathSlug === path.slug);
          const pathLessons = pathCourses.flatMap((course) => course.lessonSlugs);
          return (
            <g key={path.id}>
              <text x={x - 60} y={40} fill="#F7C325" fontSize="14" fontWeight="700">{path.title}</text>
              {pathLessons.map((slug, idx) => {
                const y = 100 + idx * 120;
                const lesson = LESSONS.find((item) => item.slug === slug);
                const done = completed.includes(slug);
                const unlocked = idx === 0 || completed.includes(pathLessons[idx - 1]);
                if (idx > 0) {
                  const prevY = 100 + (idx - 1) * 120;
                  return (
                    <g key={`${slug}-edge`}>
                      <line
                        x1={x}
                        y1={prevY + 26}
                        x2={x}
                        y2={y - 26}
                        stroke={completed.includes(pathLessons[idx - 1]!) ? "#456DFF" : "rgba(255,255,255,0.15)"}
                        strokeWidth={completed.includes(pathLessons[idx - 1]!) ? 2 : 1.5}
                        strokeDasharray={completed.includes(pathLessons[idx - 1]!) ? undefined : "4,4"}
                      />
                      <Node x={x} y={y} done={done} unlocked={unlocked} title={lesson?.title ?? slug} slug={slug} />
                    </g>
                  );
                }
                return <Node key={slug} x={x} y={y} done={done} unlocked={unlocked} title={lesson?.title ?? slug} slug={slug} />;
              })}
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-xs text-text-muted">Scroll to explore the map. Blue = completed/next, gray = locked.</p>
    </div>
  );
}

function Node({ x, y, done, unlocked, title, slug }: { x: number; y: number; done: boolean; unlocked: boolean; title: string; slug: string }) {
  const fill = done ? "#456DFF" : unlocked ? "none" : "rgba(255,255,255,0.05)";
  return (
    <g>
      <circle cx={x} cy={y} r={24} fill={fill} opacity={1} stroke={done || unlocked ? "#456DFF" : "rgba(255,255,255,0.15)"} strokeWidth={done || unlocked ? 2 : 1.5} />
      <foreignObject x={x - 16} y={y - 10} width={32} height={20}>
        <div className="text-center text-xs text-white">{done ? "✓" : unlocked ? "→" : "🔒"}</div>
      </foreignObject>
      <foreignObject x={x - 90} y={y + 32} width={180} height={80}>
        <div className="text-center text-xs text-slate-300">
          {unlocked ? <Link href={`/learn/${slug}`} className="hover:text-accent">{title}</Link> : `Complete previous lesson first`}
        </div>
      </foreignObject>
    </g>
  );
}
