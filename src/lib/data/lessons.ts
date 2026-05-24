import { CANDLESTICK_LESSONS, type Lesson } from "@/lib/data/lessons/candlestickBundle";
import { FINANCIAL_MARKETS_101_LESSONS } from "@/lib/data/lessons/financialMarkets101Bundle";
import { HOW_TO_ACTUALLY_TRADE_LESSONS } from "@/lib/data/lessons/howToActuallyTradeBundle";
import { RISK_AND_TRADER_MINDSET_LESSONS } from "@/lib/data/lessons/riskAndTraderMindsetBundle";
import { STUB_OTHER_LESSONS } from "@/lib/data/lessons/stubOtherLessons";

export type { Lesson };

export const LESSONS: Lesson[] = [
  ...FINANCIAL_MARKETS_101_LESSONS,
  ...HOW_TO_ACTUALLY_TRADE_LESSONS,
  ...RISK_AND_TRADER_MINDSET_LESSONS,
  ...CANDLESTICK_LESSONS,
  ...STUB_OTHER_LESSONS,
];
