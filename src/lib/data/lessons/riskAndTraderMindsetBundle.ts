import type { Lesson } from "@/lib/data/lessons/candlestickBundle";
import { beginnerGuardrailsPages, beginnerGuardrailsPractice } from "@/lib/data/lessons/lessonBeginnerGuardrails";
import { emotionalTrapsPages, emotionalTrapsPractice } from "@/lib/data/lessons/lessonEmotionalTraps";
import { journalingYourTradesPages, journalingYourTradesPractice } from "@/lib/data/lessons/lessonJournalingYourTrades";
import { positionSizingRulePages, positionSizingRulePractice } from "@/lib/data/lessons/lessonPositionSizingRule";
import { riskMindsetReviewPages, riskMindsetReviewPractice } from "@/lib/data/lessons/lessonRiskMindsetReview";
import { riskRewardRatioPages, riskRewardRatioPractice } from "@/lib/data/lessons/lessonRiskRewardRatio";
import { stopLossDisciplinePages, stopLossDisciplinePractice } from "@/lib/data/lessons/lessonStopLossDiscipline";
import { whyTradersLosePages, whyTradersLosePractice } from "@/lib/data/lessons/lessonWhyTradersLose";

export const RISK_AND_TRADER_MINDSET_LESSONS: Lesson[] = [
  {
    id: "fm3-l1",
    slug: "why-traders-lose",
    title: "Why Most Traders Lose Money",
    courseId: "fm3",
    xpReward: 55,
    isFree: true,
    pages: whyTradersLosePages,
    practice: whyTradersLosePractice,
  },
  {
    id: "fm3-l2",
    slug: "position-sizing-rule",
    title: "The 1% Position-Sizing Rule",
    courseId: "fm3",
    xpReward: 70,
    isFree: true,
    pages: positionSizingRulePages,
    practice: positionSizingRulePractice,
  },
  {
    id: "fm3-l3",
    slug: "stop-loss-discipline",
    title: "Stop-Loss Discipline",
    courseId: "fm3",
    xpReward: 70,
    isFree: true,
    pages: stopLossDisciplinePages,
    practice: stopLossDisciplinePractice,
  },
  {
    id: "fm3-l4",
    slug: "risk-reward-ratio",
    title: "Risk-to-Reward Ratio (R:R)",
    courseId: "fm3",
    xpReward: 70,
    isFree: true,
    pages: riskRewardRatioPages,
    practice: riskRewardRatioPractice,
  },
  {
    id: "fm3-l5",
    slug: "journaling-your-trades",
    title: "Journaling Your Trades",
    courseId: "fm3",
    xpReward: 60,
    isFree: true,
    pages: journalingYourTradesPages,
    practice: journalingYourTradesPractice,
  },
  {
    id: "fm3-l6",
    slug: "emotional-traps",
    title: "The 5 Emotional Traps",
    courseId: "fm3",
    xpReward: 60,
    isFree: true,
    pages: emotionalTrapsPages,
    practice: emotionalTrapsPractice,
  },
  {
    id: "fm3-l7",
    slug: "beginner-guardrails",
    title: "Beginner Guardrails — Your Rules",
    courseId: "fm3",
    xpReward: 65,
    isFree: true,
    pages: beginnerGuardrailsPages,
    practice: beginnerGuardrailsPractice,
  },
  {
    id: "fm3-l8",
    slug: "risk-mindset-review",
    title: "Risk & Mindset — Final Review",
    courseId: "fm3",
    xpReward: 100,
    isFree: true,
    pages: riskMindsetReviewPages,
    practice: riskMindsetReviewPractice,
  },
];
