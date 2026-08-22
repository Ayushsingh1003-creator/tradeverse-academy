import type { PracticeQuestion } from "@/types/lessonPage";
import { supportResistancePages, supportResistancePractice } from "@/lib/data/lessons/lessonSupportResistance";
import { trendLinesPages, trendLinesPractice } from "@/lib/data/lessons/lessonTrendAnalysis";
import { CHART_PATTERNS_LESSON_SLUG, CHART_PATTERNS_LESSON_XP } from "@/components/lesson/chart-patterns/constants";
import { TIME_FRAMES_LESSON_XP } from "@/components/lesson/timeframes/constants";
import { TREND_LINES_LESSON_XP } from "@/components/lesson/trend-lines/constants";
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

const chartPatternsPages: LessonPage[] = [
  {
    id: "cpt1",
    type: "text",
    badge: "Chart Patterns",
    title: "Shapes buyers and sellers leave behind",
    body: "Price repeats the same **shapes** — double tops, head & shoulders, triangles, flags — because the same crowd behaviour keeps producing them. Learn the shape, wait for the confirmed break, then trade it with a defined invalidation.",
  },
  {
    id: "cpt2",
    type: "callout",
    variant: "rule",
    title: "A pattern is a probability, never a prediction",
    content: "No pattern is guaranteed. Always wait for a **confirmed close** beyond the neckline or trendline before acting, and always define the price that proves you wrong.",
  },
];

export const CANDLESTICK_LESSONS: Lesson[] = [
  {
    id: "l1",
    slug: "what-is-a-candlestick",
    title: "Anatomy of a Candlestick",
    courseId: "c1",
    // Rendered by the standalone AnatomyOfACandleLesson component (see
    // src/components/lesson/anatomy-of-a-candle), not LessonPlayer — keep this
    // in sync with that component's ANATOMY_LESSON_XP constant.
    xpReward: 300,
    isFree: true,
    pages: whatIsCandlestickPages,
    practice: whatIsCandlestickPractice,
  },
  {
    id: "l7",
    slug: "timeframes-explained",
    title: "Timeframes Explained",
    courseId: "c1",
    // Rendered by the standalone TimeFramesLesson component (see
    // src/components/lesson/timeframes), not LessonPlayer — keep this in
    // sync with that component's TIME_FRAMES_LESSON_XP constant.
    xpReward: TIME_FRAMES_LESSON_XP,
    isFree: false,
    pages: timeframesPages,
    practice: stubPractice("timeframes"),
  },
  {
    id: "l5",
    slug: "support-resistance",
    title: "Support & Resistance",
    courseId: "c1",
    // Rendered by the standalone SupportResistanceLesson component (see
    // src/components/lesson/support-resistance), not LessonPlayer — keep this
    // in sync with that component's SUPPORT_RESISTANCE_LESSON_XP.
    xpReward: 330,
    isFree: false,
    pages: supportResistancePages,
    practice: supportResistancePractice,
  },
  {
    id: "l4",
    slug: "trend-lines",
    title: "Trendlines",
    courseId: "c1",
    // Rendered by the standalone TrendLinesLesson component (see
    // src/components/lesson/trend-lines), not LessonPlayer — keep this in
    // sync with that component's TREND_LINES_LESSON_XP.
    xpReward: TREND_LINES_LESSON_XP,
    isFree: false,
    pages: trendLinesPages,
    practice: trendLinesPractice,
  },
  {
    id: "l10",
    slug: CHART_PATTERNS_LESSON_SLUG,
    title: "Chart Patterns",
    courseId: "c1",
    // Rendered by the standalone ChartPatternsLesson component (see
    // src/components/lesson/chart-patterns), not LessonPlayer — keep this
    // in sync with that component's CHART_PATTERNS_LESSON_XP.
    xpReward: CHART_PATTERNS_LESSON_XP,
    isFree: false,
    pages: chartPatternsPages,
    practice: stubPractice("chart-patterns"),
  },
];
