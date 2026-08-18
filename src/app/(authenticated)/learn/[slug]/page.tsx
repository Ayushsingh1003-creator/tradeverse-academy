import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
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
  const lesson = getLessonBySlug(params.slug);
  if (!lesson) return <main className="mx-auto max-w-3xl p-8">Lesson not found.</main>;

  const libraryCourseSlug =
    typeof searchParams.library === "string" ? searchParams.library.trim() : undefined;

  let playbackId: string | null = null;
  try {
    const video = await db.lessonVideo.findUnique({ where: { lessonSlug: params.slug } });
    playbackId = video?.muxPlaybackId ?? null;
  } catch {
    playbackId = null;
  }

  return (
    <LessonPlayer
      lesson={lesson}
      muxPlaybackId={playbackId}
      libraryCourseSlug={libraryCourseSlug || undefined}
    />
  );
}
