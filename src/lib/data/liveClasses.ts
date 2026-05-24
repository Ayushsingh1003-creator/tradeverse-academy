export type LiveClassCurriculumModule = {
  moduleTitle: string;
  lessons: string[];
};

export type LiveClassCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  instructorName: string;
  instructorBio: string;
  startDate: string;
  durationWeeks: number;
  schedule: string;
  priceLabel: string;
  priceAmount: number;
  currency: "INR" | "USD";
  stripePriceId: string;
  sampleYoutubeVideoId: string;
  heroImageUrl: string;
  curriculum: LiveClassCurriculumModule[];
  seats: number;
  seatsLeft: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
};

const LIVE_CLASSES: LiveClassCourse[] = [
  {
    id: "lc-1",
    slug: "price-action-live-bootcamp",
    title: "Price Action Live Bootcamp",
    subtitle: "Read structure, entries, and exits in live markets",
    description:
      "A cohort-based live class focused on practical chart reading and high-probability setups with instructor walkthroughs.",
    instructorName: "Arjun Mehta",
    instructorBio:
      "Arjun is a full-time trader and mentor with 9+ years of market experience in intraday and swing systems.",
    startDate: "2026-05-20",
    durationWeeks: 6,
    schedule: "Mon/Wed/Fri · 8:00 PM IST",
    priceLabel: "INR 5,999",
    priceAmount: 5999,
    currency: "INR",
    stripePriceId: "price_live_price_action_bootcamp",
    sampleYoutubeVideoId: "dQw4w9WgXcQ",
    heroImageUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    curriculum: [
      {
        moduleTitle: "Market Structure Foundations",
        lessons: [
          "How to map key zones quickly",
          "Trend and regime detection",
          "Session bias framework",
        ],
      },
      {
        moduleTitle: "Entry and Risk Framework",
        lessons: [
          "Entry triggers with confluence",
          "Stop placement and invalidation",
          "Position sizing in volatile sessions",
        ],
      },
      {
        moduleTitle: "Live Execution Labs",
        lessons: [
          "Instructor live chart walkthrough",
          "Replay and journaling process",
          "Performance review checklist",
        ],
      },
    ],
    seats: 120,
    seatsLeft: 37,
    level: "Beginner",
    tags: ["Price Action", "Live Trading", "Risk"],
  },
  {
    id: "lc-2",
    slug: "indicator-confluence-masterclass",
    title: "Indicator Confluence Masterclass",
    subtitle: "RSI, MA, and momentum in one practical playbook",
    description:
      "Build a repeatable setup engine combining indicators with price action to avoid low-quality entries.",
    instructorName: "Sana Verma",
    instructorBio:
      "Sana specializes in technical systems and has coached over 2,000 learners in rule-based execution.",
    startDate: "2026-06-03",
    durationWeeks: 8,
    schedule: "Tue/Thu/Sat · 7:30 PM IST",
    priceLabel: "INR 8,499",
    priceAmount: 8499,
    currency: "INR",
    stripePriceId: "price_live_indicator_masterclass",
    sampleYoutubeVideoId: "3JZ_D3ELwOQ",
    heroImageUrl: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    curriculum: [
      {
        moduleTitle: "Momentum Intelligence",
        lessons: [
          "RSI context and signal quality",
          "Momentum divergence use-cases",
          "Avoiding indicator traps",
        ],
      },
      {
        moduleTitle: "Confluence Engine",
        lessons: [
          "MA stack and trend bias",
          "Multi-timeframe confirmation",
          "Decision tree for entries",
        ],
      },
      {
        moduleTitle: "Execution and Review",
        lessons: [
          "Trade execution scorecard",
          "Weekly review dashboards",
          "Iteration and edge refinement",
        ],
      },
    ],
    seats: 90,
    seatsLeft: 22,
    level: "Intermediate",
    tags: ["RSI", "Confluence", "Execution"],
  },
  {
    id: "lc-3",
    slug: "professional-risk-psychology-lab",
    title: "Professional Risk & Psychology Lab",
    subtitle: "Build consistency under pressure with institutional discipline",
    description:
      "Advanced live program for traders who want stable risk management, emotional control, and professional routines.",
    instructorName: "Kunal Rao",
    instructorBio:
      "Kunal is a former prop-desk risk coach who now trains discretionary traders in consistency systems.",
    startDate: "2026-06-18",
    durationWeeks: 10,
    schedule: "Mon/Thu · 9:00 PM IST",
    priceLabel: "INR 12,999",
    priceAmount: 12999,
    currency: "INR",
    stripePriceId: "price_live_risk_psychology_lab",
    sampleYoutubeVideoId: "fLexgOxsZu0",
    heroImageUrl: "https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg",
    curriculum: [
      {
        moduleTitle: "Capital Preservation Systems",
        lessons: [
          "Max drawdown architecture",
          "Risk caps by session type",
          "Emergency circuit-breakers",
        ],
      },
      {
        moduleTitle: "Psychology Operating Model",
        lessons: [
          "Pre-trade emotional calibration",
          "Impulse control in volatility",
          "Post-loss recovery protocol",
        ],
      },
      {
        moduleTitle: "Professional Process Layer",
        lessons: [
          "A-grade vs B-grade setup filtering",
          "Weekly accountability loops",
          "Long-term system scaling",
        ],
      },
    ],
    seats: 60,
    seatsLeft: 11,
    level: "Advanced",
    tags: ["Risk", "Psychology", "Professional Systems"],
  },
];

export function getLiveClasses() {
  return LIVE_CLASSES;
}

export function getLiveClassBySlug(slug: string) {
  return LIVE_CLASSES.find((course) => course.slug === slug) ?? null;
}
