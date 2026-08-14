import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { getLessonBySlug } from "@/lib/data/lessonLookup";
import { fetchLessonImageConfigMap } from "@/lib/lessonImageOverrides.server";
import { PageLoader } from "@/components/ui/Loader";
import { ANATOMY_LESSON_SLUG } from "@/components/lesson/anatomy-of-a-candle/constants";
import { INTRO_LESSON_SLUG } from "@/components/lesson/candlestick-intro-essentials/constants";
import { PRICE_CHARTS_LESSON_SLUG } from "@/components/lesson/understanding-price-charts/constants";
import { MEANING_LESSON_SLUG } from "@/components/lesson/what-candles-tell-you/constants";
import { SUPPORT_RESISTANCE_LESSON_SLUG } from "@/components/lesson/support-resistance/constants";
import { TREND_LINES_LESSON_SLUG } from "@/components/lesson/trend-lines/constants";

const LessonPlayer = dynamic(
  () => import("@/components/lesson/LessonPlayer").then((m) => m.LessonPlayer),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const AnatomyOfACandleLesson = dynamic(
  () => import("@/components/lesson/anatomy-of-a-candle").then((m) => m.AnatomyOfACandleLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const IntroductionToCandlestickEssentialsLesson = dynamic(
  () => import("@/components/lesson/candlestick-intro-essentials").then((m) => m.IntroductionToCandlestickEssentialsLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const UnderstandingPriceChartsLesson = dynamic(
  () => import("@/components/lesson/understanding-price-charts").then((m) => m.UnderstandingPriceChartsLesson),
  { loading: () => <PageLoader className="min-h-screen" label="Loading lesson…" /> },
);

const WhatCandlesTellYouLesson = dynamic(
  () => import("@/components/lesson/what-candles-tell-you").then((m) => m.WhatCandlesTellYouLesson),
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

type PageProps = {
  params: { slug: string };
  searchParams: { library?: string };
};

export default async function LearnPage({ params, searchParams }: PageProps) {
  if (params.slug === ANATOMY_LESSON_SLUG) {
    return <AnatomyOfACandleLesson />;
  }
  if (params.slug === INTRO_LESSON_SLUG) {
    return <IntroductionToCandlestickEssentialsLesson />;
  }
  if (params.slug === PRICE_CHARTS_LESSON_SLUG) {
    return <UnderstandingPriceChartsLesson />;
  }
  if (params.slug === MEANING_LESSON_SLUG) {
    return <WhatCandlesTellYouLesson />;
  }
  if (params.slug === SUPPORT_RESISTANCE_LESSON_SLUG) {
    return <SupportResistanceLesson />;
  }
  if (params.slug === TREND_LINES_LESSON_SLUG) {
    return <TrendLinesLesson />;
  }

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
