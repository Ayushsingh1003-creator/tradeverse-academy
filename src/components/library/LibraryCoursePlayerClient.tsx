"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/Button";
import { LibraryVideoLanguageBar } from "@/components/library/LibraryVideoLanguageBar";
import type { LibraryCourse, LibraryVideo } from "@/lib/data/library";
import { isAuthConfigured } from "@/lib/auth/enabled";
import {
  hasLibraryVideoHindi,
  resolveLibraryVideoYoutubeId,
  type LibraryVideoLang,
} from "@/lib/libraryVideoLanguage";
import { getYoutubeEmbedUrl } from "@/lib/youtubeEmbed";

async function postLibraryEnroll(slug: string, lastVideoId?: string | null) {
  if (!isAuthConfigured()) return;
  try {
    await fetch("/api/library/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        lastVideoId !== undefined ? { slug, lastVideoId } : { slug },
      ),
    });
  } catch {
    /* ignore */
  }
}

function resolveInitialVideoId(course: LibraryCourse, initialVideoId: string | null): string {
  if (initialVideoId && course.videos.some((v) => v.id === initialVideoId)) {
    return initialVideoId;
  }
  return course.videos[0]?.id ?? "";
}

export function LibraryCoursePlayerClient({
  course,
  initialVideoId,
}: {
  course: LibraryCourse;
  initialVideoId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerAnchorRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState(() => resolveInitialVideoId(course, initialVideoId));
  const [lang, setLang] = useState<LibraryVideoLang>("en");

  const activeIndex = useMemo(
    () => course.videos.findIndex((v) => v.id === activeVideoId),
    [course.videos, activeVideoId],
  );
  const activeVideo = useMemo<LibraryVideo | null>(
    () => (activeIndex >= 0 ? course.videos[activeIndex]! : null),
    [course.videos, activeIndex],
  );

  useEffect(() => {
    void postLibraryEnroll(course.slug);
  }, [course.slug]);

  useEffect(() => {
    if (!activeVideoId) return;
    const t = window.setTimeout(() => {
      void postLibraryEnroll(course.slug, activeVideoId);
    }, 500);
    return () => window.clearTimeout(t);
  }, [activeVideoId, course.slug]);

  useEffect(() => {
    const v = searchParams.get("v");
    if (!v) return;
    if (!course.videos.some((x) => x.id === v)) return;
    if (v !== activeVideoId) setActiveVideoId(v);
  }, [searchParams, course.videos, activeVideoId]);

  const selectLesson = useCallback(
    (id: string) => {
      setActiveVideoId(id);
      router.replace(`/library/${course.slug}?v=${encodeURIComponent(id)}`, { scroll: false });
      requestAnimationFrame(() => {
        playerAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [course.slug, router],
  );

  const hasNext = activeIndex >= 0 && activeIndex < course.videos.length - 1;
  const hasPrev = activeIndex > 0;

  const goNext = useCallback(() => {
    if (!hasNext) return;
    const next = course.videos[activeIndex + 1];
    if (next) selectLesson(next.id);
  }, [activeIndex, course.videos, hasNext, selectLesson]);

  const goPrev = useCallback(() => {
    if (!hasPrev) return;
    const prev = course.videos[activeIndex - 1];
    if (prev) selectLesson(prev.id);
  }, [activeIndex, course.videos, hasPrev, selectLesson]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" && hasNext) goNext();
      if (event.key === "ArrowLeft" && hasPrev) goPrev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, hasNext, hasPrev]);

  useEffect(() => {
    setLang("en");
  }, [activeVideoId]);

  useEffect(() => {
    if (lang === "hi" && activeVideo && !hasLibraryVideoHindi(activeVideo)) {
      setLang("en");
    }
  }, [lang, activeVideo]);

  const activeYoutubeId = activeVideo ? resolveLibraryVideoYoutubeId(activeVideo, lang) : null;
  const embedUrl = activeYoutubeId ? getYoutubeEmbedUrl(activeYoutubeId, { autoplay: false }) : null;

  return (
    <main className="min-h-screen bg-[#141414]">
      <AppNav />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/library"
            className="text-sm font-medium text-[#88C9F7] transition hover:text-white"
          >
            Back to Library
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <span className="rounded-full border border-border px-2 py-0.5">{course.level}</span>
            <span>{course.videos.length} lessons</span>
            <span>· {course.estimatedDurationMin} min total</span>
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-extrabold text-white md:text-3xl">{course.title}</h1>
        <p className="mb-8 max-w-3xl text-sm text-text-muted">{course.description}</p>

        {!course.videos.length ? (
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            This course has no lessons yet.
          </p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-start">
            <div ref={playerAnchorRef} className="min-w-0 space-y-4">
              {activeVideo ? (
                <LibraryVideoLanguageBar
                  lang={lang}
                  onLangChange={setLang}
                  hindiAvailable={hasLibraryVideoHindi(activeVideo)}
                />
              ) : null}
              <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black pb-[56.25%] shadow-lg">
                {embedUrl ? (
                  <iframe
                    key={`${activeVideo?.id}-${lang}`}
                    className="absolute inset-0 h-full w-full"
                    src={embedUrl}
                    title={activeVideo?.title ?? "Lesson"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
                    Invalid YouTube video id.
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="secondary" type="button" onClick={goPrev} disabled={!hasPrev}>
                  Previous
                </Button>
                <Button variant="secondary" type="button" onClick={goNext} disabled={!hasNext}>
                  Next
                </Button>
              </div>

              {activeVideo ? (
                <div className="rounded-xl border border-border bg-surface2/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Lesson {activeIndex + 1} of {course.videos.length}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-white">{activeVideo.title}</h2>
                  <p className="mt-1 text-xs text-text-muted">
                    {activeVideo.duration} · Published {activeVideo.publishedAt}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#ccc]">
                    {activeVideo.description}
                  </p>
                </div>
              ) : null}
            </div>

            <aside className="min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-muted">Course content</h3>
              <ol className="space-y-2 border border-border rounded-xl bg-[#1a1a1a] p-2">
                {course.videos.map((video, index) => {
                  const isActive = video.id === activeVideoId;
                  return (
                    <li key={video.id}>
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => selectLesson(video.id)}
                        className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2.5 text-left transition ${
                          isActive
                            ? "border border-[#456DFF]/50 bg-[#456DFF]/15"
                            : "border border-transparent hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {index + 1}. {video.title}
                          </span>
                          <span className="shrink-0 text-[10px] text-text-muted">{video.duration}</span>
                        </div>
                        <span className="text-[10px] text-text-muted">{video.publishedAt}</span>
                        <p className="line-clamp-2 text-[11px] leading-snug text-[#aaa]">{video.description}</p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
