import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

export type DeckIconKey = "candle" | "clock" | "levels" | "trend" | "trophy";

export type DeckCard = {
  slug: string;
  title: string;
  badge: string;
  eyebrow: string;
  blurb: string;
  icon: DeckIconKey;
  /** Key into MINI_SERIES / MINI_OVERLAY for the card artwork. */
  art: "a" | "b" | "c" | "d" | "e";
  /** Last card of the unit — rendered in the "boss" (unit test) treatment. */
  boss?: boolean;
  minutes: number;
  note?: string;
};

/** The unit the dashboard deck walks through. */
export const DECK_COURSE = COURSES.find((c) => c.slug === "candlestick-essentials")!;

export const DECK_CARDS: DeckCard[] = [
  {
    slug: "what-is-a-candlestick",
    title: "Anatomy of a Candlestick",
    badge: "LESSON 01",
    eyebrow: "Candlestick Essentials",
    blurb:
      "Open, high, low, close — and the body between two of them is where the argument was settled. Read the wick as evidence.",
    icon: "candle",
    art: "a",
    minutes: 5,
    note: "12 real NIFTY bars",
  },
  {
    slug: "timeframes-explained",
    title: "Timeframes Explained",
    badge: "LESSON 02",
    eyebrow: "Candlestick Essentials",
    blurb:
      "Why the 5-minute and the daily disagree about the same stock — and which one your trade should listen to.",
    icon: "clock",
    art: "b",
    minutes: 5,
  },
  {
    slug: "support-resistance",
    title: "Support & Resistance",
    badge: "LESSON 03",
    eyebrow: "Chart drill",
    blurb:
      "Draw the levels that actually hold. You mark them on a live NIFTY chart and get scored against what the market did next.",
    icon: "levels",
    art: "c",
    minutes: 8,
    note: "chart drill",
  },
  {
    slug: "trend-lines",
    title: "Trendlines",
    badge: "LESSON 04",
    eyebrow: "Chart drill",
    blurb: "Two touches is a guess, three is a line. Learn where to anchor it and when to abandon it.",
    icon: "trend",
    art: "d",
    minutes: 8,
    note: "chart drill",
  },
  {
    slug: "chart-patterns",
    title: "Chart Patterns",
    badge: "UNIT TEST",
    eyebrow: "Market replay",
    blurb: "Bar-by-bar replay of a real session. Name the pattern, place the stop, survive to the close.",
    icon: "trophy",
    art: "e",
    boss: true,
    minutes: 12,
    note: "unlocks the next unit",
  },
];

/** XP for a deck card, read from the real lesson record. */
export function deckCardXp(slug: string): number {
  return LESSONS.find((l) => l.slug === slug)?.xpReward ?? 0;
}

export const DECK_TOTAL_XP = DECK_CARDS.reduce((sum, card) => sum + deckCardXp(card.slug), 0);

/** OHLC rows (0-100 scale) behind each card's candle sketch. */
export const MINI_SERIES: Record<DeckCard["art"], number[][]> = {
  a: [
    [40, 58, 34, 54],
    [54, 62, 48, 50],
    [50, 70, 46, 66],
    [66, 72, 58, 62],
    [62, 84, 58, 80],
    [80, 88, 72, 84],
  ],
  b: [
    [30, 44, 26, 40],
    [40, 56, 36, 52],
    [52, 58, 40, 44],
    [44, 66, 42, 62],
    [62, 70, 54, 58],
    [58, 78, 54, 74],
  ],
  c: [
    [68, 74, 60, 62],
    [62, 66, 40, 44],
    [44, 48, 36, 42],
    [42, 64, 40, 60],
    [60, 72, 56, 64],
    [64, 70, 44, 48],
  ],
  d: [
    [28, 40, 24, 36],
    [36, 50, 32, 46],
    [46, 52, 38, 42],
    [42, 62, 40, 58],
    [58, 72, 54, 68],
    [68, 82, 64, 78],
  ],
  e: [
    [46, 78, 42, 74],
    [74, 80, 62, 66],
    [66, 72, 50, 54],
    [54, 78, 52, 76],
    [76, 80, 60, 64],
    [64, 68, 44, 48],
  ],
};
