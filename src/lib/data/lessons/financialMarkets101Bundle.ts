import type { Lesson } from "@/lib/data/lessons/candlestickBundle";
import { assetClassesIndiaPages, assetClassesIndiaPractice } from "@/lib/data/lessons/lessonAssetClassesIndia";
import { bidAskSpreadCostPages, bidAskSpreadCostPractice } from "@/lib/data/lessons/lessonBidAskSpreadCost";
import {
  financialMarkets101ReviewPages,
  financialMarkets101ReviewPractice,
} from "@/lib/data/lessons/lessonFinancialMarkets101Review";
import { howPricesFormPages, howPricesFormPractice } from "@/lib/data/lessons/lessonHowPricesForm";
import { indianMarkets101Pages, indianMarkets101Practice } from "@/lib/data/lessons/lessonIndianMarkets101";
import { marketHoursIndiaPages, marketHoursIndiaPractice } from "@/lib/data/lessons/lessonMarketHoursIndia";
import { marketParticipantsPages, marketParticipantsPractice } from "@/lib/data/lessons/lessonMarketParticipants";
import { whatIsTheMarketPages, whatIsTheMarketPractice } from "@/lib/data/lessons/lessonWhatIsTheMarket";

export const FINANCIAL_MARKETS_101_LESSONS: Lesson[] = [
  {
    id: "fm1-l1",
    slug: "what-is-the-market",
    title: "What is the Market?",
    courseId: "fm1",
    xpReward: 50,
    isFree: true,
    pages: whatIsTheMarketPages,
    practice: whatIsTheMarketPractice,
  },
  {
    id: "fm1-l2",
    slug: "market-participants",
    title: "Who's in the Market with You?",
    courseId: "fm1",
    xpReward: 55,
    isFree: true,
    pages: marketParticipantsPages,
    practice: marketParticipantsPractice,
  },
  {
    id: "fm1-l3",
    slug: "indian-markets-101",
    title: "Indian Markets 101 — NSE, BSE, Nifty, Sensex",
    courseId: "fm1",
    xpReward: 55,
    isFree: true,
    pages: indianMarkets101Pages,
    practice: indianMarkets101Practice,
  },
  {
    id: "fm1-l4",
    slug: "market-hours-india",
    title: "Market Hours & Sessions in India",
    courseId: "fm1",
    xpReward: 50,
    isFree: true,
    pages: marketHoursIndiaPages,
    practice: marketHoursIndiaPractice,
  },
  {
    id: "fm1-l5",
    slug: "asset-classes-india",
    title: "Asset Classes in Indian Markets",
    courseId: "fm1",
    xpReward: 60,
    isFree: true,
    pages: assetClassesIndiaPages,
    practice: assetClassesIndiaPractice,
  },
  {
    id: "fm1-l6",
    slug: "how-prices-form",
    title: "How Prices Actually Form",
    courseId: "fm1",
    xpReward: 60,
    isFree: true,
    pages: howPricesFormPages,
    practice: howPricesFormPractice,
  },
  {
    id: "fm1-l7",
    slug: "bid-ask-spread-cost",
    title: "Bid, Ask, Spread & the Real Cost of a Trade",
    courseId: "fm1",
    xpReward: 60,
    isFree: true,
    pages: bidAskSpreadCostPages,
    practice: bidAskSpreadCostPractice,
  },
  {
    id: "fm1-l8",
    slug: "financial-markets-101-review",
    title: "Financial Markets 101 — Final Review",
    courseId: "fm1",
    xpReward: 90,
    isFree: true,
    pages: financialMarkets101ReviewPages,
    practice: financialMarkets101ReviewPractice,
  },
];
