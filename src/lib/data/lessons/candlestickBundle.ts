import type { PracticeQuestion } from "@/types/lessonPage";
import { howToReadAChartPages, howToReadAChartPractice } from "@/lib/data/lessons/lessonBullishVsBearish";
import { meaningOfPatternsPages, meaningOfPatternsPractice } from "@/lib/data/lessons/lessonHammerShootingStar";
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
    slug: "how-to-read-a-chart",
    title: "How to read a chart",
    courseId: "c1",
    xpReward: 70,
    isFree: true,
    pages: howToReadAChartPages,
    practice: howToReadAChartPractice,
  },
  {
    id: "l3",
    slug: "meaning-of-patterns",
    title: "Meaning of patterns",
    courseId: "c1",
    xpReward: 80,
    isFree: true,
    pages: meaningOfPatternsPages,
    practice: meaningOfPatternsPractice,
  },
  {
    id: "l4",
    slug: "trend-lines",
    title: "Trend Lines",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: trendLinesPages,
    practice: trendLinesPractice,
  },
  {
    id: "l5",
    slug: "support-resistance",
    title: "Support/Resistance",
    courseId: "c1",
    xpReward: 80,
    isFree: false,
    pages: supportResistancePages,
    practice: supportResistancePractice,
  },
];
