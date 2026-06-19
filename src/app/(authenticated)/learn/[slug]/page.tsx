import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { fetchLessonImageConfigMap } from "@/lib/lessonImageOverrides.server";
import { PageLoader } from "@/components/ui/Loader";

const LessonPlayer = dynamic(
  () => import("@/components/lesson/LessonPlayer").then((m) => m.LessonPlayer),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

type PageProps = {
  params: { slug: string };
  searchParams: { library?: string };
};

export default async function LearnPage({ params, searchParams }: PageProps) {
  const baseLesson = getLessonBySlug(params.slug);
  if (!baseLesson) return <main className="mx-auto max-w-3xl p-8">Lesson not found.</main>;

  const libraryCourseSlug =
    typeof searchParams.library === "string" ? searchParams.library.trim() : undefined;

  let playbackId: string | null = null;
  let imageConfigByPageId = {};
  try {
    const [video, imageConfigs] = await Promise.all([
      db.lessonVideo.findUnique({ where: { lessonSlug: params.slug } }),
      fetchLessonImageConfigMap(params.slug),
    ]);
    playbackId = video?.muxPlaybackId ?? null;
    imageConfigByPageId = imageConfigs;
  } catch {
    playbackId = null;
    imageConfigByPageId = {};
  }

  return (
    <LessonPlayer
      lesson={baseLesson}
      imageConfigByPageId={imageConfigByPageId}
      muxPlaybackId={playbackId}
      libraryCourseSlug={libraryCourseSlug || undefined}
    />
  );
}
