import Link from "next/link";
import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { COURSES } from "@/lib/data/courses";
import { fetchLessonImageConfigMap } from "@/lib/lessonImageOverrides.server";
import { fetchQuestionVoiceMap, fetchVoicePrefixes } from "@/lib/answerVoiceFeedback.server";
import { FREE_COURSE_SLUG, requestorIsPremium } from "@/lib/premium/lessonAccess";
import { PageLoader } from "@/components/ui/Loader";
import { ANATOMY_LESSON_SLUG } from "@/components/lesson/anatomy-of-a-candle/constants";
import { CHART_PATTERNS_LESSON_SLUG } from "@/components/lesson/chart-patterns/constants";
import { SUPPORT_RESISTANCE_LESSON_SLUG } from "@/components/lesson/support-resistance/constants";
import { TIME_FRAMES_LESSON_SLUG } from "@/components/lesson/timeframes/constants";
import { TREND_LINES_LESSON_SLUG } from "@/components/lesson/trend-lines/constants";

const LessonPlayer = dynamic(
  () => import("@/components/lesson/LessonPlayer").then((m) => m.LessonPlayer),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const AnatomyOfACandleLesson = dynamic(
  () => import("@/components/lesson/anatomy-of-a-candle").then((m) => m.AnatomyOfACandleLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const SupportResistanceLesson = dynamic(
  () => import("@/components/lesson/support-resistance").then((m) => m.SupportResistanceLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const TrendLinesLesson = dynamic(
  () => import("@/components/lesson/trend-lines").then((m) => m.TrendLinesLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const TimeFramesLesson = dynamic(
  () => import("@/components/lesson/timeframes").then((m) => m.TimeFramesLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const ChartPatternsLesson = dynamic(
  () => import("@/components/lesson/chart-patterns").then((m) => m.ChartPatternsLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

type PageProps = {
  params: { slug: string };
  searchParams: { library?: string };
};

const BESPOKE_LESSON_SLUGS = new Set([
  ANATOMY_LESSON_SLUG,
  SUPPORT_RESISTANCE_LESSON_SLUG,
  TREND_LINES_LESSON_SLUG,
  TIME_FRAMES_LESSON_SLUG,
  CHART_PATTERNS_LESSON_SLUG,
]);

export default async function LearnPage({ params, searchParams }: PageProps) {
  if (BESPOKE_LESSON_SLUGS.has(params.slug)) {
    const [voiceConfigByQuestion, voicePrefixes] = await Promise.all([
      fetchQuestionVoiceMap(params.slug),
      fetchVoicePrefixes(),
    ]);
    const voiceProps = { voiceConfigByQuestion, voicePrefixes };

    if (params.slug === ANATOMY_LESSON_SLUG) return <AnatomyOfACandleLesson {...voiceProps} />;
    if (params.slug === SUPPORT_RESISTANCE_LESSON_SLUG) return <SupportResistanceLesson {...voiceProps} />;
    if (params.slug === TREND_LINES_LESSON_SLUG) return <TrendLinesLesson {...voiceProps} />;
    if (params.slug === TIME_FRAMES_LESSON_SLUG) return <TimeFramesLesson {...voiceProps} />;
    return <ChartPatternsLesson {...voiceProps} />;
  }

  const baseLesson = getLessonBySlug(params.slug);
  if (!baseLesson) return <main className="mx-auto max-w-3xl p-8">Lesson not found.</main>;

  const lessonCourse = COURSES.find((c) => c.id === baseLesson.courseId);
  if (lessonCourse && lessonCourse.slug !== FREE_COURSE_SLUG && !(await requestorIsPremium())) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 p-8 text-center text-white">
        <h1 className="text-2xl font-bold">This is a Premium lesson</h1>
        <p className="text-[#999]">
          &ldquo;{baseLesson.title}&rdquo; is part of {lessonCourse.title}, which requires Premium to unlock.
        </p>
        <Link
          href="/settings"
          className="rounded-full bg-[#456dff] px-6 py-3 text-sm font-bold text-white hover:bg-[#2a4ae8]"
        >
          Upgrade to Premium
        </Link>
      </main>
    );
  }

  const libraryCourseSlug =
    typeof searchParams.library === "string" ? searchParams.library.trim() : undefined;

  let playbackId: string | null = null;
  let imageConfigByPageId = {};
  let voiceConfigByQuestion = {};
  let voicePrefixes = {};
  try {
    const [video, imageConfigs, questionVoiceMap, prefixes] = await Promise.all([
      db.lessonVideo.findUnique({ where: { lessonSlug: params.slug } }),
      fetchLessonImageConfigMap(params.slug),
      fetchQuestionVoiceMap(params.slug),
      fetchVoicePrefixes(),
    ]);
    playbackId = video?.muxPlaybackId ?? null;
    imageConfigByPageId = imageConfigs;
    voiceConfigByQuestion = questionVoiceMap;
    voicePrefixes = prefixes;
  } catch {
    playbackId = null;
    imageConfigByPageId = {};
    voiceConfigByQuestion = {};
    voicePrefixes = {};
  }

  return (
    <LessonPlayer
      lesson={baseLesson}
      imageConfigByPageId={imageConfigByPageId}
      muxPlaybackId={playbackId}
      libraryCourseSlug={libraryCourseSlug || undefined}
      voiceConfigByQuestion={voiceConfigByQuestion}
      voicePrefixes={voicePrefixes}
    />
  );
}
