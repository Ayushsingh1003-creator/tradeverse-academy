import { COURSES, type Course } from "@/lib/data/courses";
import { LESSONS, type Lesson } from "@/lib/data/lessons";

export type CatalogLesson = {
  slug: string;
  title: string;
  courseSlug: string;
  courseTitle: string;
  levelTitle: string;
  levelNumber: number;
};

export type LearningAskPayload = {
  shortAnswer: string;
  intro: string;
  courseSlug: string;
  courseTitle: string;
  courseDescription: string;
  courseEmoji: string;
  lessonSlug: string;
  lessonTitle: string;
  lessonDescription: string;
  levelTitle: string;
  levelNumber: number;
  relatedQuestions: [string, string];
  experienceQuestion: string;
  experienceOptions: {
    beginner: string;
    basic: string;
  };
  fallback?: boolean;
};

const LESSON_BY_SLUG = new Map(LESSONS.map((l) => [l.slug, l]));
const COURSE_BY_SLUG = new Map(COURSES.map((c) => [c.slug, c]));

function levelForLesson(course: Course, lessonSlug: string) {
  return (
    course.levels.find((l) => l.lessonSlugs.includes(lessonSlug)) ??
    course.levels[0]
  );
}

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSE_BY_SLUG.get(slug);
}

export function getLessonBySlug(slug: string): Lesson | undefined {
  return LESSON_BY_SLUG.get(slug);
}

export function buildCatalogLessons(): CatalogLesson[] {
  const rows: CatalogLesson[] = [];
  for (const course of COURSES) {
    for (const lessonSlug of course.lessonSlugs) {
      const lesson = LESSON_BY_SLUG.get(lessonSlug);
      if (!lesson) continue;
      const level = levelForLesson(course, lessonSlug);
      rows.push({
        slug: lesson.slug,
        title: lesson.title,
        courseSlug: course.slug,
        courseTitle: course.title,
        levelTitle: level.title,
        levelNumber: level.number,
      });
    }
  }
  return rows;
}

/** Compact catalog string injected into the learning-ask AI prompt. */
export function buildCourseCatalogForAI(): string {
  const lines: string[] = [];
  for (const course of COURSES) {
    lines.push(`COURSE slug="${course.slug}" title="${course.title}"`);
    lines.push(`  description: ${course.description}`);
    for (const level of course.levels) {
      lines.push(`  LEVEL ${level.number}: "${level.title}"`);
      for (const slug of level.lessonSlugs) {
        const lesson = LESSON_BY_SLUG.get(slug);
        if (lesson) {
          lines.push(`    LESSON slug="${lesson.slug}" title="${lesson.title}"`);
        }
      }
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function enrichRecommendation(raw: {
  shortAnswer?: string;
  intro?: string;
  courseSlug?: string;
  lessonSlug?: string;
  courseDescription?: string;
  lessonDescription?: string;
  relatedQuestions?: string[];
  experienceQuestion?: string;
  experienceOptions?: { beginner?: string; basic?: string };
}): LearningAskPayload | null {
  const course = raw.courseSlug ? COURSE_BY_SLUG.get(raw.courseSlug) : undefined;
  const lesson = raw.lessonSlug ? LESSON_BY_SLUG.get(raw.lessonSlug) : undefined;
  if (!course || !lesson) return null;
  if (lesson.courseId !== course.id) {
    const lessonCourse = COURSES.find((c) => c.id === lesson.courseId);
    if (!lessonCourse || lessonCourse.slug !== course.slug) return null;
  }

  const level = levelForLesson(course, lesson.slug);
  const related = (raw.relatedQuestions ?? [])
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 2);
  while (related.length < 2) {
    related.push(
      related.length === 0
        ? `What will I learn in ${course.title}?`
        : `Is ${lesson.title} right for my level?`,
    );
  }

  const introText = raw.intro?.trim();
  const firstSentence =
    introText?.match(/^[^.!?]+[.!?]/)?.[0]?.trim() ??
    introText?.split(/[.!?]/)[0]?.trim();

  return {
    shortAnswer:
      raw.shortAnswer?.trim() ||
      (firstSentence ? `${firstSentence}${firstSentence.endsWith(".") ? "" : "."}` : null) ||
      `Here's a concise starting point for your question.`,
    intro:
      introText ||
      `I've picked a course and lesson to help you go deeper.`,
    courseSlug: course.slug,
    courseTitle: course.title,
    courseDescription: raw.courseDescription?.trim() || course.description,
    courseEmoji: course.illustrationEmoji,
    lessonSlug: lesson.slug,
    lessonTitle: lesson.title,
    lessonDescription:
      raw.lessonDescription?.trim() ||
      `Dive deeper with "${lesson.title}" — a focused lesson inside ${course.title}.`,
    levelTitle: level.title,
    levelNumber: level.number,
    relatedQuestions: [related[0], related[1]],
    experienceQuestion:
      raw.experienceQuestion?.trim() ||
      `How much experience do you already have with ${course.title.toLowerCase()}?`,
    experienceOptions: {
      beginner: raw.experienceOptions?.beginner?.trim() || "Starting from scratch",
      basic: raw.experienceOptions?.basic?.trim() || "I know the basics",
    },
  };
}

const KEYWORD_HINTS: Array<{
  terms: string[];
  courseSlug: string;
  lessonSlug: string;
  shortAnswer?: string;
}> = [
  {
    terms: ["market hour", "session", "pre-market", "opening bell", "when does nse"],
    courseSlug: "financial-markets-101",
    lessonSlug: "market-hours-india",
    shortAnswer:
      "Indian markets mainly trade 9:15 AM–3:30 PM IST on NSE/BSE, with pre-open and post-close sessions around those hours.",
  },
  {
    terms: ["nse", "bse", "nifty", "sensex", "indian market"],
    courseSlug: "financial-markets-101",
    lessonSlug: "indian-markets-101",
  },
  {
    terms: ["bid", "ask", "spread", "how price", "price form"],
    courseSlug: "financial-markets-101",
    lessonSlug: "how-prices-form",
  },
  {
    terms: ["broker", "demat", "account", "open account"],
    courseSlug: "how-to-actually-trade",
    lessonSlug: "demat-and-trading-account",
  },
  {
    terms: ["order type", "limit order", "market order", "stop loss order", "place trade"],
    courseSlug: "how-to-actually-trade",
    lessonSlug: "order-types-explained",
  },
  {
    terms: ["brokerage", "tax", "stt", "cost of trade"],
    courseSlug: "how-to-actually-trade",
    lessonSlug: "brokerage-and-taxes-india",
  },
  {
    terms: ["position size", "position sizing", "how much to risk"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "position-sizing-rule",
  },
  {
    terms: ["stop loss", "stop-loss", "cut loss"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "stop-loss-discipline",
  },
  {
    terms: ["psychology", "emotion", "fomo", "revenge trade", "mindset"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "emotional-traps",
  },
  {
    terms: ["journal", "journaling", "track trades"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "journaling-your-trades",
  },
  {
    terms: ["candlestick", "candle", "hammer", "doji", "wick"],
    courseSlug: "candlestick-essentials",
    lessonSlug: "what-is-a-candlestick",
  },
  {
    terms: ["bullish", "bearish", "green candle", "red candle", "marubozu"],
    courseSlug: "candlestick-essentials",
    lessonSlug: "bullish-vs-bearish-candles",
    shortAnswer:
      "Bullish means you expect prices to rise — buyers are in control. Bearish means you expect prices to fall — sellers are in control.",
  },
  {
    terms: ["support", "resistance", "sr level"],
    courseSlug: "candlestick-essentials",
    lessonSlug: "support-and-resistance",
  },
  {
    terms: ["trend", "uptrend", "downtrend"],
    courseSlug: "candlestick-essentials",
    lessonSlug: "trend-analysis",
  },
  {
    terms: ["rsi", "overbought", "oversold", "momentum"],
    courseSlug: "indicator-starter-kit",
    lessonSlug: "rsi-basics",
  },
  {
    terms: ["moving average", "sma", "ema", "ma crossover"],
    courseSlug: "indicator-starter-kit",
    lessonSlug: "moving-averages",
  },
  {
    terms: ["poker", "probability", "odds", "chance", "win rate"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "risk-reward-ratio",
  },
  {
    terms: ["lose", "losing", "why traders fail"],
    courseSlug: "risk-and-trader-mindset",
    lessonSlug: "why-traders-lose",
  },
  {
    terms: ["participant", "who trades", "institutional", "retail"],
    courseSlug: "financial-markets-101",
    lessonSlug: "market-participants",
  },
  {
    terms: ["asset class", "equity", "derivative", "commodity"],
    courseSlug: "financial-markets-101",
    lessonSlug: "asset-classes-india",
  },
];

function scoreLesson(query: string, lesson: Lesson, course: Course): number {
  const q = query.toLowerCase();
  let score = 0;
  if (q.includes(lesson.slug.replace(/-/g, " "))) score += 8;
  if (q.includes(lesson.title.toLowerCase())) score += 10;
  for (const word of lesson.title.toLowerCase().split(/\s+/)) {
    if (word.length > 3 && q.includes(word)) score += 2;
  }
  if (q.includes(course.title.toLowerCase())) score += 3;
  if (q.includes(course.slug.replace(/-/g, " "))) score += 4;
  return score;
}

export function fallbackLearningAsk(query: string): LearningAskPayload {
  const q = query.toLowerCase().trim();

  for (const hint of KEYWORD_HINTS) {
    if (hint.terms.some((t) => q.includes(t))) {
      const enriched = enrichRecommendation({
        courseSlug: hint.courseSlug,
        lessonSlug: hint.lessonSlug,
        shortAnswer: hint.shortAnswer,
        intro: `Here's where to learn this properly in Tradeverse Academy.`,
        relatedQuestions: [
          `What is covered in ${getLessonBySlug(hint.lessonSlug)?.title ?? "this lesson"}?`,
          `Should I take the full ${getCourseBySlug(hint.courseSlug)?.title ?? "course"} first?`,
        ],
      });
      if (enriched) return { ...enriched, fallback: true };
    }
  }

  let bestLesson = LESSONS[0];
  let bestScore = -1;
  for (const lesson of LESSONS) {
    const course = COURSES.find((c) => c.id === lesson.courseId);
    if (!course) continue;
    const score = scoreLesson(q, lesson, course);
    if (score > bestScore) {
      bestScore = score;
      bestLesson = lesson;
    }
  }

  const course = COURSES.find((c) => c.id === bestLesson.courseId) ?? COURSES[0];
  const enriched = enrichRecommendation({
    courseSlug: course.slug,
    lessonSlug: bestLesson.slug,
    shortAnswer:
      q.length > 0
        ? `This connects to "${bestLesson.title}" — the lesson below breaks it down clearly.`
        : "Tradeverse Academy teaches Indian markets, trading mechanics, and risk step by step.",
    intro:
      q.length > 0
        ? `I've mapped this to our ${course.title} path.`
        : `Here's a popular starting point for new traders.`,
    relatedQuestions: [
      `What's the first step in ${course.title}?`,
      `How long does ${bestLesson.title} take?`,
    ],
  });

  return enriched ? { ...enriched, fallback: true } : defaultPayload();
}

function defaultPayload(): LearningAskPayload {
  const course = COURSES[0];
  const lesson = LESSONS.find((l) => l.courseId === course.id) ?? LESSONS[0];
  const enriched = enrichRecommendation({
    courseSlug: course.slug,
    lessonSlug: lesson.slug,
  });
  return enriched ? { ...enriched, fallback: true } : {
    shortAnswer: "Markets are where buyers and sellers meet to set prices for stocks and other assets.",
    intro: "Start with Financial Markets 101.",
    courseSlug: "financial-markets-101",
    courseTitle: "Financial Markets 101",
    courseDescription: COURSES[0].description,
    courseEmoji: "🏛️",
    lessonSlug: "what-is-the-market",
    lessonTitle: "What is the Market?",
    lessonDescription: "Learn what markets are and why they exist.",
    levelTitle: "The Market Game",
    levelNumber: 1,
    relatedQuestions: ["What is a stock market?", "Who trades in Indian markets?"],
    experienceQuestion: "How much experience do you already have with markets?",
    experienceOptions: { beginner: "Starting from scratch", basic: "I know the basics" },
    fallback: true,
  };
}
