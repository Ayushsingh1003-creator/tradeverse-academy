import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

/** Terms that indicate a trading / markets learning question. */
export const TRADING_KEYWORDS = [
  "trade",
  "trading",
  "trader",
  "market",
  "stock",
  "stocks",
  "share",
  "equity",
  "candle",
  "candlestick",
  "chart",
  "price",
  "bullish",
  "bearish",
  "bull",
  "bear",
  "support",
  "resistance",
  "trend",
  "volume",
  "rsi",
  "macd",
  "indicator",
  "moving average",
  "momentum",
  "risk",
  "reward",
  "position",
  "stop loss",
  "stop-loss",
  "broker",
  "brokerage",
  "nse",
  "bse",
  "nifty",
  "sensex",
  "demat",
  "leverage",
  "forex",
  "crypto",
  "futures",
  "options",
  "intraday",
  "swing",
  "scalp",
  "hammer",
  "doji",
  "marubozu",
  "wick",
  "spread",
  "bid",
  "ask",
  "portfolio",
  "invest",
  "investment",
  "profit",
  "loss",
  "psychology",
  "mindset",
  "journal",
  "order",
  "execution",
  "slippage",
  "volatility",
  "dividend",
  "asset class",
  "derivative",
  "commodity",
  "learn",
  "lesson",
  "course",
  "explain",
  "meaning",
  "mean",
  "what is",
  "what does",
  "how to",
  "poker",
  "odds",
  "probability",
];

function catalogTerms(): string[] {
  const terms = new Set<string>();
  for (const course of COURSES) {
    terms.add(course.slug.replace(/-/g, " "));
    for (const word of course.title.toLowerCase().split(/\W+/)) {
      if (word.length > 3) terms.add(word);
    }
    for (const level of course.levels) {
      for (const word of level.title.toLowerCase().split(/\W+/)) {
        if (word.length > 3) terms.add(word);
      }
    }
  }
  for (const lesson of LESSONS) {
    terms.add(lesson.slug.replace(/-/g, " "));
    for (const word of lesson.title.toLowerCase().split(/\W+/)) {
      if (word.length > 3) terms.add(word);
    }
  }
  return [...terms];
}

let cachedCatalogTerms: string[] | null = null;

function getCatalogTerms() {
  cachedCatalogTerms ??= catalogTerms();
  return cachedCatalogTerms;
}

/** True when the query is about trading / academy catalog topics. */
export function isTradingRelatedQuery(text: string): boolean {
  const q = text.toLowerCase().trim();
  if (!q) return true;

  if (TRADING_KEYWORDS.some((kw) => q.includes(kw))) return true;

  for (const term of getCatalogTerms()) {
    if (term.length > 3 && q.includes(term)) return true;
  }

  return false;
}
