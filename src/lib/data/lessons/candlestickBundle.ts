import type { PracticeQuestion } from "@/types/lessonPage";
import { bullishVsBearishPages, bullishVsBearishPractice } from "@/lib/data/lessons/lessonBullishVsBearish";
import { hammerShootingStarPages, hammerShootingStarPractice } from "@/lib/data/lessons/lessonHammerShootingStar";
import { supportResistancePages, supportResistancePractice } from "@/lib/data/lessons/lessonSupportResistance";
import { trendAnalysisPages, trendAnalysisPractice } from "@/lib/data/lessons/lessonTrendAnalysis";
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

export const CANDLESTICK_LESSONS: Lesson[] = [
  {
    id: "l1",
    slug: "what-is-a-candlestick",
    title: "What is a Candlestick?",
    courseId: "c1",
    xpReward: 60,
    isFree: true,
    pages: whatIsCandlestickPages,
    practice: whatIsCandlestickPractice,
  },
  {
    id: "l2",
    slug: "bullish-vs-bearish-candles",
    title: "Bullish vs Bearish Candles — Reading the Story",
    courseId: "c1",
    xpReward: 70,
    isFree: true,
    pages: bullishVsBearishPages,
    practice: bullishVsBearishPractice,
  },
  {
    id: "l3",
    slug: "hammer-shooting-star",
    title: "Hammer & Shooting Star — Reversal Signals",
    courseId: "c1",
    xpReward: 80,
    isFree: true,
    pages: hammerShootingStarPages,
    practice: hammerShootingStarPractice,
  },
  {
    id: "l4",
    slug: "support-and-resistance",
    title: "Support & Resistance — The Market's Memory",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: supportResistancePages,
    practice: supportResistancePractice,
  },
  {
    id: "l5",
    slug: "trend-analysis",
    title: "Trend Analysis — Trade With the Market",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: trendAnalysisPages,
    practice: trendAnalysisPractice,
  },
];
