import type { Lesson } from "@/lib/data/lessons/candlestickBundle";
import { anatomyOfTradeC2Pages, anatomyOfTradeC2Practice } from "@/lib/data/lessons/lessonAnatomyOfTradeC2";
import { brokerageAndTaxesIndiaPages, brokerageAndTaxesIndiaPractice } from "@/lib/data/lessons/lessonBrokerageAndTaxesIndia";
import { dematAndTradingAccountPages, dematAndTradingAccountPractice } from "@/lib/data/lessons/lessonDematAndTradingAccount";
import { executionAndSlippagePages, executionAndSlippagePractice } from "@/lib/data/lessons/lessonExecutionAndSlippage";
import { firstTradeWalkthroughPages, firstTradeWalkthroughPractice } from "@/lib/data/lessons/lessonFirstTradeWalkthrough";
import { howToTradeReviewPages, howToTradeReviewPractice } from "@/lib/data/lessons/lessonHowToTradeReview";
import { orderTypesExplainedPages, orderTypesExplainedPractice } from "@/lib/data/lessons/lessonOrderTypesExplained";
import { pickingABrokerPages, pickingABrokerPractice } from "@/lib/data/lessons/lessonPickingABroker";

export const HOW_TO_ACTUALLY_TRADE_LESSONS: Lesson[] = [
  {
    id: "fm2-l1",
    slug: "demat-and-trading-account",
    title: "Demat & Trading Account — How They Work",
    courseId: "fm2",
    xpReward: 55,
    isFree: true,
    pages: dematAndTradingAccountPages,
    practice: dematAndTradingAccountPractice,
  },
  {
    id: "fm2-l2",
    slug: "picking-a-broker",
    title: "Picking the Right Broker",
    courseId: "fm2",
    xpReward: 55,
    isFree: true,
    pages: pickingABrokerPages,
    practice: pickingABrokerPractice,
  },
  {
    id: "fm2-l3",
    slug: "order-types-explained",
    title: "Order Types Explained",
    courseId: "fm2",
    xpReward: 65,
    isFree: true,
    pages: orderTypesExplainedPages,
    practice: orderTypesExplainedPractice,
  },
  {
    id: "fm2-l4",
    slug: "anatomy-of-trade",
    title: "Anatomy of a Trade",
    courseId: "fm2",
    xpReward: 65,
    isFree: true,
    pages: anatomyOfTradeC2Pages,
    practice: anatomyOfTradeC2Practice,
  },
  {
    id: "fm2-l5",
    slug: "brokerage-and-taxes-india",
    title: "Brokerage & Taxes in India",
    courseId: "fm2",
    xpReward: 65,
    isFree: true,
    pages: brokerageAndTaxesIndiaPages,
    practice: brokerageAndTaxesIndiaPractice,
  },
  {
    id: "fm2-l6",
    slug: "execution-and-slippage",
    title: "Execution Quality & Slippage",
    courseId: "fm2",
    xpReward: 60,
    isFree: true,
    pages: executionAndSlippagePages,
    practice: executionAndSlippagePractice,
  },
  {
    id: "fm2-l7",
    slug: "first-trade-walkthrough",
    title: "Walkthrough: Your First Trade",
    courseId: "fm2",
    xpReward: 70,
    isFree: true,
    pages: firstTradeWalkthroughPages,
    practice: firstTradeWalkthroughPractice,
  },
  {
    id: "fm2-l8",
    slug: "how-to-trade-review",
    title: "How to Trade — Final Review",
    courseId: "fm2",
    xpReward: 90,
    isFree: true,
    pages: howToTradeReviewPages,
    practice: howToTradeReviewPractice,
  },
];
