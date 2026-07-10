import type { PracticeQuestion } from "@/types/lessonPage";
import { howToReadAChartPages, howToReadAChartPractice } from "@/lib/data/lessons/lessonBullishVsBearish";
import { meaningOfPatternsPages, meaningOfPatternsPractice } from "@/lib/data/lessons/lessonMeaningOfPatterns";
import { supportResistancePages, supportResistancePractice } from "@/lib/data/lessons/lessonSupportResistance";
import { trendLinesPages, trendLinesPractice } from "@/lib/data/lessons/lessonTrendAnalysis";
import { whatIsCandlestickPages, whatIsCandlestickPractice } from "@/lib/data/lessons/lessonWhatIsCandlestick";
import type { LessonPage } from "@/types/lessonPage";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  courseId: string;
  xpReward: number;
  isFree: boolean;
  pages: LessonPage[];
  practice?: PracticeQuestion[];
};

const stubPractice = (topic: string): PracticeQuestion[] => [
  {
    id: `${topic}-pr1`,
    type: "true_false",
    statement: "This lesson will be expanded with full interactive content in a future release.",
    correct: true,
    explanation: "This topic is part of the Candlestick Essentials roadmap — full drills are coming soon.",
  },
];

const introPages: LessonPage[] = [
  {
    id: "ci0",
    type: "intro",
    title: "Candlestick Essentials",
    subtitle: "Your roadmap to reading price action like a trader.",
    image: { alt: "Stylized candlestick chart on a glowing trading grid" },
    startLabel: "Start",
  },
  {
    id: "ci1",
    type: "text",
    badge: "Overview",
    title: "What you'll learn",
    body: "This course takes you from **zero to confident** with candlesticks — starting with how price charts work, then the anatomy of a single candle, and finally how to combine candles into patterns, trends, and key price levels.",
  },
  {
    id: "ci2",
    type: "callout",
    variant: "tip",
    title: "How the course is structured",
    content: "**Level 1 – Foundations** covers charts and candle anatomy.\n**Level 2 – Reading Price** covers psychology, timeframes, and trend structure.\n**Level 3 – Key Price Levels** covers support, resistance, and trendlines.",
  },
];

const candlePsychologyPages: LessonPage[] = [
  {
    id: "cp1",
    type: "text",
    badge: "Psychology",
    title: "The battle behind every candle",
    body: "Every candlestick is a record of a **fight between buyers and sellers**. A long green body means buyers won decisively; a long upper wick means sellers pushed price back down after buyers tried to rally.",
  },
  {
    id: "cp2",
    type: "callout",
    variant: "tip",
    title: "Read the emotion, not just the shape",
    content: "Ask: who was in control at the **open**, during the session, and at the **close**? That story is candle psychology.",
  },
];

const timeframesPages: LessonPage[] = [
  {
    id: "tf1",
    type: "text",
    badge: "Timeframes",
    title: "Same chart, different zoom levels",
    body: "A single candle can represent **1 minute, 1 hour, 1 day, or 1 week** of price action. Shorter timeframes show noise and short-term moves; longer timeframes show the bigger trend.",
  },
  {
    id: "tf2",
    type: "callout",
    variant: "tip",
    title: "Match your timeframe to your plan",
    content: "Swing traders often look at **daily** charts; intraday traders zoom into **5-15 minute** charts.",
  },
];

const understandingTrendsPages: LessonPage[] = [
  {
    id: "ut1",
    type: "text",
    badge: "Trends",
    title: "Higher highs or lower lows?",
    body: "A trend is simply the **general direction** price is moving. An **uptrend** prints higher highs and higher lows; a **downtrend** prints lower highs and lower lows.",
  },
  {
    id: "ut2",
    type: "callout",
    variant: "rule",
    title: "No trend? It's a range",
    content: "When price bounces between a ceiling and a floor without making new highs or lows, it's **ranging**, not trending.",
  },
];

const swingStructurePages: LessonPage[] = [
  {
    id: "ss1",
    type: "text",
    badge: "Structure",
    title: "Swing highs and swing lows",
    body: "A **swing high** is a peak with lower price on both sides; a **swing low** is a trough with higher price on both sides. Chaining these together reveals market structure.",
  },
  {
    id: "ss2",
    type: "callout",
    variant: "rule",
    title: "Break of Structure (BOS)",
    content: "When price closes beyond the most recent swing high (or low), that's a **Break of Structure** — a signal the trend may be continuing or reversing.",
  },
];

export const CANDLESTICK_LESSONS: Lesson[] = [
  {
    id: "l0",
    slug: "candlestick-intro",
    title: "Introduction to Candlestick Essentials",
    courseId: "c1",
    // Rendered by the standalone IntroductionToCandlestickEssentialsLesson
    // component (see src/components/lesson/candlestick-intro-essentials), not
    // LessonPlayer — keep this in sync with that component's INTRO_LESSON_XP.
    xpReward: 435,
    isFree: true,
    pages: introPages,
    practice: stubPractice("intro"),
  },
  {
    id: "l2",
    slug: "how-to-read-a-chart",
    title: "Understanding Price Charts",
    courseId: "c1",
    // Rendered by the standalone UnderstandingPriceChartsLesson component (see
    // src/components/lesson/understanding-price-charts), not LessonPlayer —
    // keep this in sync with that component's PRICE_CHARTS_LESSON_XP.
    xpReward: 405,
    isFree: true,
    pages: howToReadAChartPages,
    practice: howToReadAChartPractice,
  },
  {
    id: "l1",
    slug: "what-is-a-candlestick",
    title: "Anatomy of a Candlestick",
    courseId: "c1",
    // Rendered by the standalone AnatomyOfACandleLesson component (see
    // src/components/lesson/anatomy-of-a-candle), not LessonPlayer — keep this
    // in sync with that component's ANATOMY_LESSON_XP constant.
    xpReward: 120,
    isFree: true,
    pages: whatIsCandlestickPages,
    practice: whatIsCandlestickPractice,
  },
  {
    id: "l3",
    slug: "meaning-of-patterns",
    title: "What Candles Tell You",
    courseId: "c1",
    // Rendered by the standalone WhatCandlesTellYouLesson component (see
    // src/components/lesson/what-candles-tell-you), not LessonPlayer — keep
    // this in sync with that component's MEANING_LESSON_XP.
    xpReward: 400,
    isFree: true,
    pages: meaningOfPatternsPages,
    practice: meaningOfPatternsPractice,
  },
  {
    id: "l6",
    slug: "candle-psychology",
    title: "Candle Psychology",
    courseId: "c1",
    xpReward: 60,
    isFree: false,
    pages: candlePsychologyPages,
    practice: stubPractice("psych"),
  },
  {
    id: "l7",
    slug: "timeframes-explained",
    title: "Timeframes Explained",
    courseId: "c1",
    xpReward: 60,
    isFree: false,
    pages: timeframesPages,
    practice: stubPractice("timeframes"),
  },
  {
    id: "l8",
    slug: "understanding-trends",
    title: "Understanding Trends",
    courseId: "c1",
    xpReward: 60,
    isFree: false,
    pages: understandingTrendsPages,
    practice: stubPractice("trends"),
  },
  {
    id: "l9",
    slug: "swing-structure-bos",
    title: "Swing Structure & Break of Structure",
    courseId: "c1",
    xpReward: 70,
    isFree: false,
    pages: swingStructurePages,
    practice: stubPractice("swing"),
  },
  {
    id: "l5",
    slug: "support-resistance",
    title: "Support & Resistance",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: supportResistancePages,
    practice: supportResistancePractice,
  },
  {
    id: "l4",
    slug: "trend-lines",
    title: "Trendlines",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: trendLinesPages,
    practice: trendLinesPractice,
  },
];
