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
  levels: CourseLevel[];
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
    levels: [
      {
        id: "fm1-l1",
        number: 1,
        title: "The Market Game",
        lessonSlugs: ["what-is-the-market", "market-participants", "indian-markets-101"],
      },
      {
        id: "fm1-l2",
        number: 2,
        title: "When & What You Trade",
        lessonSlugs: ["market-hours-india", "asset-classes-india"],
      },
      {
        id: "fm1-l3",
        number: 3,
        title: "How Price Forms",
        lessonSlugs: ["how-prices-form", "bid-ask-spread-cost", "financial-markets-101-review"],
        reviewSlug: "financial-markets-101-review",
      },
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
    levels: [
      {
        id: "fm2-l1",
        number: 1,
        title: "Getting Set Up",
        lessonSlugs: ["demat-and-trading-account", "picking-a-broker"],
      },
      {
        id: "fm2-l2",
        number: 2,
        title: "Placing Trades",
        lessonSlugs: ["order-types-explained", "anatomy-of-trade"],
      },
      {
        id: "fm2-l3",
        number: 3,
        title: "Costs & Execution",
        lessonSlugs: [
          "brokerage-and-taxes-india",
          "execution-and-slippage",
          "first-trade-walkthrough",
          "how-to-trade-review",
        ],
        reviewSlug: "how-to-trade-review",
      },
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
    levels: [
      {
        id: "fm3-l1",
        number: 1,
        title: "Survival First",
        lessonSlugs: ["why-traders-lose", "position-sizing-rule"],
      },
      {
        id: "fm3-l2",
        number: 2,
        title: "Risk Mechanics",
        lessonSlugs: ["stop-loss-discipline", "risk-reward-ratio"],
      },
      {
        id: "fm3-l3",
        number: 3,
        title: "The Trader's Mind",
        lessonSlugs: [
          "journaling-your-trades",
          "emotional-traps",
          "beginner-guardrails",
          "risk-mindset-review",
        ],
        reviewSlug: "risk-mindset-review",
      },
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
      "bullish-vs-bearish-candles",
      "hammer-shooting-star",
      "support-and-resistance",
      "trend-analysis",
    ],
    levels: [
      {
        id: "c1-l1",
        number: 1,
        title: "Reading Candles",
        lessonSlugs: ["what-is-a-candlestick", "bullish-vs-bearish-candles"],
      },
      {
        id: "c1-l2",
        number: 2,
        title: "Reversal Signals",
        lessonSlugs: ["hammer-shooting-star"],
      },
      {
        id: "c1-l3",
        number: 3,
        title: "Price Structure",
        lessonSlugs: ["support-and-resistance", "trend-analysis"],
      },
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
    levels: [
      {
        id: "c2-l1",
        number: 1,
        title: "Momentum Indicators",
        lessonSlugs: ["rsi-basics"],
      },
      {
        id: "c2-l2",
        number: 2,
        title: "Trend Indicators",
        lessonSlugs: ["moving-averages"],
      },
    ],
  },
];
