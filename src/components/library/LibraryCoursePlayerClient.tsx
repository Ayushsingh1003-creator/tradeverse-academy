"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getLibraryLearnHref,
  isLibraryLearnItem,
} from "@/lib/libraryItemType";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/Button";
import { LibraryVideoLanguageBar } from "@/components/library/LibraryVideoLanguageBar";
import { isAuthConfigured } from "@/lib/auth/enabled";
import type { LibraryCourse, LibraryVideo } from "@/lib/data/library";
import { shouldResumeLessonToCompletionSplash } from "@/lib/libraryLearnResume";
import { useUserStore } from "@/lib/store";
import {
  hasLibraryVideoHindi,
  resolveLibraryVideoYoutubeId,
  type LibraryVideoLang,
} from "@/lib/libraryVideoLanguage";
import { LibraryLessonPracticePie } from "@/components/library/LibraryLessonPracticePie";
import { fetchLibraryCoursePracticeSummary } from "@/lib/libraryProgressClient";
import {
  buildLibraryCoursePracticeSummary,
  type LibraryCoursePracticeSummary,
  type LibraryLearnProgressEntry,
} from "@/lib/libraryProgress";
import { getLibraryYoutubeEmbedUrl } from "@/lib/youtubeEmbed";

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
  initialPracticeSummary = null,
}: {
  course: LibraryCourse;
  initialVideoId: string | null;
  initialPracticeSummary?: LibraryCoursePracticeSummary | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);
  const playerAnchorRef = useRef<HTMLDivElement>(null);
  const [activeVideoId, setActiveVideoId] = useState(() => resolveInitialVideoId(course, initialVideoId));
  const [lang, setLang] = useState<LibraryVideoLang>("en");
  const [practiceSummary, setPracticeSummary] = useState<LibraryCoursePracticeSummary | null>(
    initialPracticeSummary,
  );
  const [progressLoading, setProgressLoading] = useState(!initialPracticeSummary);

  const displayPracticeSummary = useMemo(
    () => practiceSummary ?? buildLibraryCoursePracticeSummary(course, []),
    [practiceSummary, course],
  );

  const learnProgressBySlug = useMemo(() => {
    const map = new Map<string, LibraryLearnProgressEntry>();
    for (const e of displayPracticeSummary.entries) {
      map.set(e.learnSlug, e);
    }
    return map;
  }, [displayPracticeSummary]);

  const activeIndex = useMemo(
    () => course.videos.findIndex((v) => v.id === activeVideoId),
    [course.videos, activeVideoId],
  );
  const activeVideo = useMemo<LibraryVideo | null>(
    () => (activeIndex >= 0 ? course.videos[activeIndex]! : null),
    [course.videos, activeIndex],
  );

  const loadPracticeProgress = useCallback(async () => {
    setProgressLoading(true);
    const summary = await fetchLibraryCoursePracticeSummary(course);
    setPracticeSummary(summary);
    setProgressLoading(false);
  }, [course]);

  useEffect(() => {
    void postLibraryEnroll(course.slug);
  }, [course.slug]);

  useEffect(() => {
    void loadPracticeProgress();
  }, [loadPracticeProgress]);

  useEffect(() => {
    const onFocus = () => void loadPracticeProgress();
    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ courseSlug?: string }>).detail;
      if (detail?.courseSlug === course.slug) void loadPracticeProgress();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void loadPracticeProgress();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("tv-library-progress", onProgress);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("tv-library-progress", onProgress);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [course.slug, loadPracticeProgress]);

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

  const openLearnLesson = useCallback(
    (video: LibraryVideo) => {
      const learnSlug = video.learnSlug?.trim();
      const progress = learnSlug ? learnProgressBySlug.get(learnSlug) : undefined;
      const href = getLibraryLearnHref(video, course.slug, {
        resumeToCompletion: shouldResumeLessonToCompletionSplash(
          progress,
          learnSlug,
          lessonsCompleted,
        ),
      });
      if (href) router.push(href);
    },
    [course.slug, learnProgressBySlug, lessonsCompleted, router],
  );

  const selectLesson = useCallback(
    (id: string) => {
      const video = course.videos.find((v) => v.id === id);
      if (video && isLibraryLearnItem(video)) {
        openLearnLesson(video);
        return;
      }
      setActiveVideoId(id);
      router.replace(`/library/${course.slug}?v=${encodeURIComponent(id)}`, { scroll: false });
      requestAnimationFrame(() => {
        playerAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [course.slug, course.videos, openLearnLesson, router],
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

  const activeIsLearn = activeVideo ? isLibraryLearnItem(activeVideo) : false;
  const activeLearnProgress =
    activeVideo?.learnSlug?.trim()
      ? learnProgressBySlug.get(activeVideo.learnSlug.trim())
      : undefined;
  const activeLearnHref = activeVideo
    ? getLibraryLearnHref(activeVideo, course.slug, {
        resumeToCompletion: shouldResumeLessonToCompletionSplash(
          activeLearnProgress,
          activeVideo.learnSlug?.trim(),
          lessonsCompleted,
        ),
      })
    : null;
  const activeYoutubeId =
    activeVideo && !activeIsLearn ? resolveLibraryVideoYoutubeId(activeVideo, lang) : null;
  const embedUrl =
    activeYoutubeId && !activeIsLearn
      ? getLibraryYoutubeEmbedUrl(activeYoutubeId, { autoplay: false })
      : null;

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
              {activeVideo && !activeIsLearn ? (
                <LibraryVideoLanguageBar
                  lang={lang}
                  onLangChange={setLang}
                  hindiAvailable={hasLibraryVideoHindi(activeVideo)}
                />
              ) : null}
              <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black pb-[56.25%] shadow-lg">
                {activeIsLearn && activeLearnHref ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#1a2a4a] to-[#141414] p-6 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#88C9F7]">
                      Interactive lesson
                    </p>
                    <p className="max-w-md text-lg font-bold text-white">{activeVideo?.title}</p>
                    <p className="max-w-md text-sm text-text-muted">{activeVideo?.description}</p>
                    <Link
                      href={activeLearnHref}
                      className="rounded-xl bg-[#456DFF] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5a7dff]"
                    >
                      {shouldResumeLessonToCompletionSplash(
                        activeLearnProgress,
                        activeVideo.learnSlug?.trim(),
                        lessonsCompleted,
                      )
                        ? "Practice or review"
                        : "Open lesson"}
                    </Link>
                  </div>
                ) : embedUrl ? (
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
                  const isLearn = isLibraryLearnItem(video);
                  const progress =
                    isLearn && video.learnSlug ? learnProgressBySlug.get(video.learnSlug) : undefined;
                  return (
                    <li
                      key={video.id}
                      className={`relative rounded-lg transition ${
                        isActive ? "bg-[#456DFF]/10" : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <button
                        type="button"
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => selectLesson(video.id)}
                        className={`w-full flex-col gap-1 rounded-lg px-2 py-2 text-left ${
                          isActive ? "border border-[#456DFF]/50 bg-[#456DFF]/15" : "border border-transparent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {index + 1}. {video.title}
                          </span>
                          {!isLearn ? (
                            <span className="shrink-0 text-[10px] text-text-muted">{video.duration}</span>
                          ) : null}
                        </div>
                        {isLearn ? (
                          <span className="text-[10px] font-medium text-[#88C9F7]">Interactive lesson</span>
                        ) : (
                          <span className="text-[10px] text-text-muted">{video.publishedAt}</span>
                        )}
                        <p className="line-clamp-2 text-[11px] leading-snug text-[#aaa]">{video.description}</p>
                      </button>
                      {isLearn ? (
                        <div className="pointer-events-auto absolute bottom-4 right-4">
                          <LibraryLessonPracticePie
                            title={video.title}
                            entry={progress}
                            loading={progressLoading}
                          />
                        </div>
                      ) : null}
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
