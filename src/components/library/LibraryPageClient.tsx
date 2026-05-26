"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import { AppNav } from "@/components/layout/AppNav";
import { Button } from "@/components/ui/Button";
import { LibraryCourseCard } from "@/components/library/LibraryCourseCard";
import { LibraryVideoCard } from "@/components/library/LibraryVideoCard";
import { YouTubePlayerModal } from "@/components/library/YouTubePlayerModal";
import type { LibraryCourse, LibraryResumeItem, LibraryVideo } from "@/lib/data/library";

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
}: {
  courses: LibraryCourse[];
  standaloneVideos: LibraryVideo[];
  tags: string[];
  resumeItems: LibraryResumeItem[];
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<FilterMode>("all");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [playingVideo, setPlayingVideo] = useState<LibraryVideo | null>(null);

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
    <main className="min-h-screen bg-[#141414]">
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-8">
        {resumeItems.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-1 text-xl font-bold text-white">Resume learning</h2>
            <p className="mb-4 text-xs text-text-muted">Pick up where you left off in courses you have started.</p>
            <Swiper {...swiperCommon}>
              {resumeItems.map(({ course, lastVideoId }) => {
                const href = resumeHref(course, lastVideoId);
                return (
                  <SwiperSlide key={`${course.id}-resume`} className={slideClass}>
                    <Link
                      href={href}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#456DFF]/30 bg-gradient-to-b from-[#456DFF]/12 to-[#1a1a1a] p-0 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition hover:border-[#456DFF]/55 hover:shadow-[0_16px_48px_rgba(69,109,255,0.18)]"
                    >
                      <div className="relative aspect-video w-full overflow-hidden">
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <span className="absolute bottom-3 left-3 rounded-full bg-[#456DFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Continue
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-bold leading-snug text-white">{course.title}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-text-muted">{course.description}</p>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </section>
        ) : null}

        <div className="mb-6 space-y-3">
          <h1 className="text-3xl font-extrabold text-white">Library</h1>
          <p className="text-sm text-text-muted">
            Watch full recorded courses and independent YouTube lessons directly on Tradeverse.
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses and videos"
              className="w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white outline-none md:max-w-md"
            />
            <div className="flex flex-wrap gap-2">
              {(["all", "courses", "videos"] as const).map((item) => (
                <Button
                  key={item}
                  variant={mode === item ? "default" : "secondary"}
                  onClick={() => setMode(item)}
                >
                  {item === "all" ? "All" : item === "courses" ? "Courses" : "Videos"}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs ${
                  selectedTag === tag
                    ? "border-[#456DFF] bg-[#456DFF]/20 text-white"
                    : "border-border text-text-muted hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {(mode === "all" || mode === "courses") && filteredCourses.length ? (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-bold text-white">Courses</h2>
            <Swiper {...swiperCommon}>
              {filteredCourses.map((course) => (
                <SwiperSlide key={course.id} className={slideClass}>
                  <LibraryCourseCard course={course} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        ) : null}

        {(mode === "all" || mode === "videos") && filteredVideos.length ? (
          <section>
            <h2 className="mb-3 text-xl font-bold text-white">Independent Videos</h2>
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
          <p className="mt-8 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            No content matched your filters. Try a different search or tag.
          </p>
        ) : null}
      </section>

      <YouTubePlayerModal
        open={Boolean(playingVideo)}
        video={playingVideo}
        onClose={() => setPlayingVideo(null)}
      />
    </main>
  );
}
