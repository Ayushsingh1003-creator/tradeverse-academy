import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { PageLoader } from "@/components/ui/Loader";

const LessonPlayer = dynamic(
  () => import("@/components/lesson/LessonPlayer").then((m) => m.LessonPlayer),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

export default async function LearnPage({ params }: { params: { slug: string } }) {
  const lesson = getLessonBySlug(params.slug);
  if (!lesson) return <main className="mx-auto max-w-3xl p-8">Lesson not found.</main>;

  let playbackId: string | null = null;
  try {
    const video = await db.lessonVideo.findUnique({ where: { lessonSlug: params.slug } });
    playbackId = video?.muxPlaybackId ?? null;
  } catch {
    playbackId = null;
  }

  return <LessonPlayer lesson={lesson} muxPlaybackId={playbackId} />;
}
