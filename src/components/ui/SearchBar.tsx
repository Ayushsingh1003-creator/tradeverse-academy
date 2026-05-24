"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

type Result = {
  id: string;
  kind: "lesson" | "course";
  title: string;
  pathName: string;
  xp: number;
  premium: boolean;
  href: string;
};

export function SearchBar({ desktopOnly = true }: { desktopOnly?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const input = query.trim().toLowerCase();
    if (!input) return [] as Result[];
    const lessonResults: Result[] = LESSONS.filter((lesson) => lesson.title.toLowerCase().includes(input)).map((lesson) => {
      const course = COURSES.find((item) => item.id === lesson.courseId);
      return {
        id: lesson.id,
        kind: "lesson",
        title: lesson.title,
        pathName: course?.pathSlug ?? "core",
        xp: lesson.xpReward,
        premium: course?.premium ?? false,
        href: `/learn/${lesson.slug}`,
      };
    });
    const courseResults: Result[] = COURSES.filter((course) => course.title.toLowerCase().includes(input)).map((course) => ({
      id: course.id,
      kind: "course",
      title: course.title,
      pathName: course.pathSlug,
      xp: course.xpReward,
      premium: course.premium,
      href: `/courses/${course.slug}`,
    }));
    return [...lessonResults, ...courseResults].slice(0, 8);
  }, [query]);

  return (
    <>
      <button className={`${desktopOnly ? "hidden md:inline" : "inline"} rounded-2xl border border-border px-3 py-2 text-sm`} onClick={() => setOpen(true)}>🔍 Search</button>
      {open ? (
        <div className="fixed inset-0 z-[140] flex items-start justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="mt-20 w-full max-w-2xl rounded-2xl border border-border bg-surface p-4"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") setOpen(false);
              if (event.key === "ArrowDown") setActive((value) => Math.min(results.length - 1, value + 1));
              if (event.key === "ArrowUp") setActive((value) => Math.max(0, value - 1));
              if (event.key === "Enter" && results[active]) {
                router.push(results[active].href);
                setOpen(false);
              }
            }}
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lessons and courses"
              className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3 outline-none"
            />
            <div className="mt-3 space-y-2">
              {results.map((result, index) => (
                <button
                  key={`${result.kind}-${result.id}`}
                  onClick={() => {
                    router.push(result.href);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left ${index === active ? "border-accent bg-accent/10" : "border-border bg-surface2"}`}
                >
                  <span>
                    <span className="font-semibold">{result.title}</span>
                    <span className="ml-2 text-xs text-text-muted">{result.pathName}</span>
                  </span>
                  <span className="text-xs">{result.xp} XP · {result.premium ? "Premium" : "Free"}</span>
                </button>
              ))}
              {!results.length && query ? <p className="px-1 py-2 text-sm text-text-muted">No results.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
