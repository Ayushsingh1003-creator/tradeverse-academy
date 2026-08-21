import Link from "next/link";
import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getAuthUserId } from "@/lib/auth/session";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { COURSES } from "@/lib/data/courses";
import { fetchLessonImageConfigMap } from "@/lib/lessonImageOverrides.server";
import { PageLoader } from "@/components/ui/Loader";
import { ANATOMY_LESSON_SLUG } from "@/components/lesson/anatomy-of-a-candle/constants";
import { CHART_PATTERNS_LESSON_SLUG } from "@/components/lesson/chart-patterns/constants";
import { SUPPORT_RESISTANCE_LESSON_SLUG } from "@/components/lesson/support-resistance/constants";
import { TIME_FRAMES_LESSON_SLUG } from "@/components/lesson/timeframes/constants";
import { TREND_LINES_LESSON_SLUG } from "@/components/lesson/trend-lines/constants";

const FREE_COURSE_SLUG = "candlestick-essentials";

async function requestorIsPremium(): Promise<boolean> {
  const userId = await getAuthUserId();
  if (!userId) return false;
  const subscription = await db.subscription.findUnique({ where: { authUserId: userId } });
  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "inactive";
  return plan !== "free" && ["active", "trialing"].includes(status);
}

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

export default async function LearnPage({ params, searchParams }: PageProps) {
  if (params.slug === ANATOMY_LESSON_SLUG) {
    return <AnatomyOfACandleLesson />;
  }
  if (params.slug === SUPPORT_RESISTANCE_LESSON_SLUG) {
    return <SupportResistanceLesson />;
  }
  if (params.slug === TREND_LINES_LESSON_SLUG) {
    return <TrendLinesLesson />;
  }
  if (params.slug === TIME_FRAMES_LESSON_SLUG) {
    return <TimeFramesLesson />;
  }
  if (params.slug === CHART_PATTERNS_LESSON_SLUG) {
    return <ChartPatternsLesson />;
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
