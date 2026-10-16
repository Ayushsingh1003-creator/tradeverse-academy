"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { LibraryCourseCard } from "@/components/library/LibraryCourseCard";
import { LibraryVideoCard } from "@/components/library/LibraryVideoCard";
import { YouTubePlayerModal } from "@/components/library/YouTubePlayerModal";
import type { LibraryCourse, LibraryResumeItem, LibraryVideo } from "@/lib/data/library";
import {
  computeLibraryCourseCardProgress,
  type LibraryCourseCardProgress,
} from "@/lib/libraryCourseProgress";
import { buildLibraryCoursePracticeSummary } from "@/lib/libraryProgress";
import { readLocalLibraryProgress } from "@/lib/libraryProgressLocal";

type FilterMode = "all" | "courses" | "videos";

const slideClass = "!w-[min(300px,88vw)] shrink-0";

function resumeHref(course: LibraryCourse, lastVideoId: string | null) {
  if (lastVideoId && course.videos.some((v) => v.id === lastVideoId)) {
    return `/library/${course.slug}?v=${encodeURIComponent(lastVideoId)}`;
  }
  return `/library/${course.slug}`;
}

export function LibraryPageClient({
  courses,
  standaloneVideos,
  tags,
  resumeItems,
  courseProgressBySlug: initialCourseProgressBySlug,
}: {
  courses: LibraryCourse[];
  standaloneVideos: LibraryVideo[];
  tags: string[];
  resumeItems: LibraryResumeItem[];
  courseProgressBySlug: Record<string, LibraryCourseCardProgress>;
}) {
  const router = useRouter();
  const [courseProgressBySlug, setCourseProgressBySlug] = useState(initialCourseProgressBySlug);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<FilterMode>("all");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [playingVideo, setPlayingVideo] = useState<LibraryVideo | null>(null);

  useEffect(() => {
    setCourseProgressBySlug(initialCourseProgressBySlug);
  }, [initialCourseProgressBySlug]);

  useEffect(() => {
    const merged = { ...initialCourseProgressBySlug };
    let changed = false;
    for (const course of courses) {
      const localRows = readLocalLibraryProgress(course.slug);
      if (!localRows.length) continue;
      const summary = buildLibraryCoursePracticeSummary(course, localRows);
      const localProgress = computeLibraryCourseCardProgress(course, {
        lastVideoId: null,
        practiceSummary: summary,
      });
      const current = merged[course.slug];
      if (!current || localProgress.completedCount > current.completedCount) {
        merged[course.slug] = localProgress;
        changed = true;
      }
    }
    if (changed) setCourseProgressBySlug(merged);
  }, [courses, initialCourseProgressBySlug]);

  useEffect(() => {
    const refresh = () => router.refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("tv-library-progress", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("tv-library-progress", refresh);
    };
  }, [router]);

  const allTags = useMemo(() => ["All", ...tags], [tags]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (mode === "videos") return false;
      const text = `${course.title} ${course.description} ${course.tags.join(" ")}`.toLowerCase();
      const queryOk = !query.trim() || text.includes(query.toLowerCase());
      const tagOk =
        selectedTag === "All" ||
        course.tags.includes(selectedTag) ||
        course.videos.some((video) => video.tags.includes(selectedTag));
      return queryOk && tagOk;
    });
  }, [courses, mode, query, selectedTag]);

  const filteredVideos = useMemo(() => {
    return standaloneVideos.filter((video) => {
      if (mode === "courses") return false;
      const text = `${video.title} ${video.description} ${video.tags.join(" ")}`.toLowerCase();
      const queryOk = !query.trim() || text.includes(query.toLowerCase());
      const tagOk = selectedTag === "All" || video.tags.includes(selectedTag);
      return queryOk && tagOk;
    });
  }, [standaloneVideos, mode, query, selectedTag]);

  function playStandaloneVideo(video: LibraryVideo) {
    setPlayingVideo(video);
  }

  const swiperCommon = {
    modules: [FreeMode],
    freeMode: true,
    slidesPerView: "auto" as const,
    spaceBetween: 16,
    className: "library-media-swiper !overflow-visible pb-1",
  };

  return (
    <ThemeScope>
      <AppShell>
        {resumeItems.length > 0 ? (
          <section className="mb-10">
            <div className="tvd-srule" style={{ marginTop: 0 }}>
              <h2>Resume learning</h2>
              <i />
            </div>
            <p className="tvd-secsub">Pick up where you left off in courses you have started.</p>
            <Swiper {...swiperCommon}>
              {resumeItems.map(({ course, lastVideoId }) => {
                const href = resumeHref(course, lastVideoId);
                return (
                  <SwiperSlide key={`${course.id}-resume`} className={slideClass}>
                    <Link
                      href={href}
                      className="tvd-ccard group"
                      style={{ padding: 0, overflow: "hidden", borderColor: "var(--tv-acc-line)" }}
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="tvd-chipsm" style={{ position: "absolute", bottom: 12, left: 12, background: "var(--tv-up)", borderColor: "var(--tv-up-sh)", color: "var(--tv-up-ink)" }}>
                          Continue
                        </span>
                      </div>
                      <div className="p-4">
                        <p style={{ fontSize: 14.5, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>{course.title}</p>
                        <p className="tvd-cdesc" style={{ marginTop: 5, fontSize: 12 }}>{course.description}</p>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </section>
        ) : null}

        <div className="mb-6 space-y-3">
          <div className="tvd-pagehead">
            <h1>Library</h1>
            <p>Watch full recorded courses and independent YouTube lessons directly on Tradeverse.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses and videos"
              className="tvd-input md:max-w-md"
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "courses", "videos"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className="tvd-btn"
                  data-tone={mode === item ? "primary" : undefined}
                  onClick={() => setMode(item)}
                >
                  {item === "all" ? "All" : item === "courses" ? "Courses" : "Videos"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className="tvd-tag"
                data-tone={selectedTag === tag ? "acc" : undefined}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {(mode === "all" || mode === "courses") && filteredCourses.length ? (
          <section className="mb-10">
            <div className="tvd-srule">
              <h2>Courses</h2>
              <i />
            </div>
            <Swiper {...swiperCommon}>
              {filteredCourses.map((course, index) => (
                <SwiperSlide key={course.id} className={slideClass}>
                  <LibraryCourseCard
                    course={course}
                    index={index}
                    progress={courseProgressBySlug[course.slug]}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : null}

        {(mode === "all" || mode === "videos") && filteredVideos.length ? (
          <section>
            <div className="tvd-srule">
              <h2>Independent videos</h2>
              <i />
            </div>
            <Swiper {...swiperCommon}>
              {filteredVideos.map((video) => (
                <SwiperSlide key={video.id} className={slideClass}>
                  <LibraryVideoCard video={video} onWatch={playStandaloneVideo} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : null}

        {!filteredCourses.length && !filteredVideos.length ? (
          <div className="tvd-card" style={{ marginTop: 28 }}>
            <p className="tvd-empty">No content matched your filters. Try a different search or tag.</p>
          </div>
        ) : null}
        <YouTubePlayerModal
          open={Boolean(playingVideo)}
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
        />
      </AppShell>
    </ThemeScope>
  );
}
