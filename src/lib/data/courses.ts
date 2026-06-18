export type LearningPath = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export type CourseLevel = {
  id: string;
  number: number;
  title: string;
  lessonSlugs: string[];
  reviewSlug?: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  pathSlug: string;
  xpReward: number;
  premium: boolean;
  lessonSlugs: string[];
  /** Optional grouping for admin/AI; UI shows a flat lesson checklist from lessonSlugs. */
  levels?: CourseLevel[];
  totalExercises?: number;
  illustrationEmoji: string;
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "p0",
    slug: "financial-market-trading-foundation",
    title: "Financial Market and Trading Foundation",
    description: "Build strong fundamentals before strategy and execution.",
  },
  { id: "p2", slug: "technical-analysis", title: "Technical Analysis", description: "Use indicators and structure in context." },
  { id: "p3", slug: "risk-management", title: "Risk Management", description: "Protect capital and control risk." },
  { id: "p4", slug: "trading-psychology", title: "Trading Psychology", description: "Build emotional discipline and process." },
  { id: "p5", slug: "strategy-labs", title: "Strategy Labs", description: "Practice complete trading systems." },
];

export const COURSES: Course[] = [
  {
    id: "fm1",
    slug: "financial-markets-101",
    title: "Financial Markets 101",
    description:
      "Understand the Indian financial markets from zero — what's traded, who participates, when sessions run, and how prices form.",
    pathSlug: "financial-market-trading-foundation",
    xpReward: 480,
    premium: false,
    illustrationEmoji: "🏛️",
    totalExercises: 64,
    lessonSlugs: [
      "what-is-the-market",
      "market-participants",
      "indian-markets-101",
      "market-hours-india",
      "asset-classes-india",
      "how-prices-form",
      "bid-ask-spread-cost",
      "financial-markets-101-review",
    ],
  },
  {
    id: "fm2",
    slug: "how-to-actually-trade",
    title: "How to Actually Trade",
    description:
      "Go from theory to action: open an account, pick a broker, place orders, and understand the real cost of every trade in India.",
    pathSlug: "financial-market-trading-foundation",
    xpReward: 520,
    premium: false,
    illustrationEmoji: "📝",
    totalExercises: 68,
    lessonSlugs: [
      "demat-and-trading-account",
      "picking-a-broker",
      "order-types-explained",
      "anatomy-of-trade",
      "brokerage-and-taxes-india",
      "execution-and-slippage",
      "first-trade-walkthrough",
      "how-to-trade-review",
    ],
  },
  {
    id: "fm3",
    slug: "risk-and-trader-mindset",
    title: "Risk & Trader Mindset",
    description:
      "Survive long enough to learn strategy. Master position sizing, stop-loss discipline, journaling, and the psychology that protects your capital.",
    pathSlug: "financial-market-trading-foundation",
    xpReward: 560,
    premium: false,
    illustrationEmoji: "🛡️",
    totalExercises: 72,
    lessonSlugs: [
      "why-traders-lose",
      "position-sizing-rule",
      "stop-loss-discipline",
      "risk-reward-ratio",
      "journaling-your-trades",
      "emotional-traps",
      "beginner-guardrails",
      "risk-mindset-review",
    ],
  },
  {
    id: "c1",
    slug: "candlestick-essentials",
    title: "Candlestick Essentials",
    description:
      "Learn to read price action with confidence. Understand what every candle tells you about buyer and seller battles.",
    pathSlug: "technical-analysis",
    xpReward: 400,
    premium: false,
    illustrationEmoji: "🕯️",
    totalExercises: 85,
    lessonSlugs: [
      "what-is-a-candlestick",
      "how-to-read-a-chart",
      "meaning-of-patterns",
      "trend-lines",
      "support-resistance",
    ],
  },
  {
    id: "c2",
    slug: "indicator-starter-kit",
    title: "Indicator Starter Kit",
    description: "Master the most powerful technical indicators. RSI, moving averages, and momentum tools explained clearly.",
    pathSlug: "technical-analysis",
    xpReward: 550,
    premium: true,
    illustrationEmoji: "📊",
    totalExercises: 120,
    lessonSlugs: ["rsi-basics", "moving-averages"],
  },
];
