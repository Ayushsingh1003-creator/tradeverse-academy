"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { LibraryCourse } from "@/lib/data/library";

export function LibraryCourseCard({ course }: { course: LibraryCourse }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const hasVideos = course.videos.length > 0;
  const courseHref = `/library/${course.slug}`;

  return (
    <div
      className={cn(
        "h-full",
        hasVideos &&
          "cursor-pointer rounded-2xl transition hover:ring-2 hover:ring-[#456DFF]/40 focus-within:ring-2 focus-within:ring-[#456DFF]/50",
      )}
      role={hasVideos ? "button" : undefined}
      tabIndex={hasVideos ? 0 : undefined}
      onClick={() => {
        if (hasVideos) router.push(courseHref);
      }}
      onKeyDown={(e) => {
        if (!hasVideos) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(courseHref);
        }
      }}
    >
      <Card className="h-full overflow-hidden p-0">
        <div className="relative aspect-video w-full">
          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
              {course.level}
            </span>
            <span className="text-xs text-text-muted">{course.videos.length} videos</span>
            <span className="text-xs text-text-muted">· {course.estimatedDurationMin} min</span>
          </div>
          <p className="text-base font-semibold text-white">{course.title}</p>
          <p className="mt-1 line-clamp-2 text-xs text-text-muted">{course.description}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {course.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {hasVideos ? (
              <Link
                href={courseHref}
                className={cn(buttonVariants({ variant: "default" }), "flex-1 justify-center")}
              >
                Start Course
              </Link>
            ) : (
              <Button className="flex-1" disabled>
                Coming soon
              </Button>
            )}
            <Button variant="secondary" type="button" onClick={() => setExpanded((s) => !s)}>
              {expanded ? "Hide Lessons" : "View Lessons"}
            </Button>
          </div>

          {expanded ? (
            <div className="mt-4 space-y-2 border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
              {course.videos.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/library/${course.slug}?v=${encodeURIComponent(video.id)}`}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-[rgba(255,255,255,0.02)] px-3 py-2 text-left transition hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <span className="text-xs text-white">
                    {index + 1}. {video.title}
                  </span>
                  <span className="text-[10px] text-text-muted">{video.duration}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
