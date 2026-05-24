import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const howToTradeReviewPages: LessonPage[] = [
  {
    id: "htr-p1",
    type: "pretest",
    question: "Final check: which one is NOT required for an Indian trade?",
    options: ["A demat account", "A trading account", "A SEBI-registered broker", "A premium subscription tip service"],
    correctIndex: 3,
    explanation: "Tip services have zero connection to actually executing trades. Skip them.",
  },
  {
    id: "htr-p2",
    type: "callout",
    variant: "concept",
    title: "Course 2 recap",
    content:
      "You now know how the Indian trade lifecycle works: bank → trading account → exchange → demat. You can pick a broker, choose an order type, plan a trade's anchors, estimate real cost (brokerage + taxes), manage execution quality, and run the full lifecycle from idea to journal.",
  },
  {
    id: "htr-p3",
    type: "multiple_choice",
    question: "An ideal first-trade workflow is:",
    options: [
      "Buy → think → maybe SL",
      "Plan setup → define SL & size → place limit order → wait → journal",
      "Watch CNBC → react → don't journal",
      "Copy a stranger's tweet",
    ],
    correctIndex: 1,
    explanation: "This is the disciplined order to follow.",
  },
  {
    id: "htr-p4",
    type: "drag_label",
    instruction: "Match each item to where it belongs.",
    labels: ["Bank account", "Trading account", "Demat account", "Exchange"],
    zones: [
      { id: "htr-z1", title: "Holds your money", correctLabel: "Bank account" },
      { id: "htr-z2", title: "Places orders", correctLabel: "Trading account" },
      { id: "htr-z3", title: "Stores your shares", correctLabel: "Demat account" },
      { id: "htr-z4", title: "Matches buyers & sellers", correctLabel: "Exchange" },
    ],
    explanation: "Know the role of each — confusion here = expensive mistakes later.",
  },
  {
    id: "htr-p5",
    type: "true_false",
    statement: "Brokerage + STT + GST + stamp duty all add up — even small trades aren't free.",
    correct: true,
    explanation: "Always factor real cost into your plan.",
  },
  {
    id: "htr-p6",
    type: "multiple_choice",
    question: "Best order type when price precision is more important than speed:",
    options: ["Market", "Limit", "SL-M with no SL", "Random"],
    correctIndex: 1,
    explanation: "Limit = price you set or better.",
  },
  {
    id: "htr-p7",
    type: "fill_blank",
    sentence: "Long-term capital gains on equity are taxed under [___]CG.",
    correctAnswer: "lt",
    explanation: "LTCG.",
  },
  {
    id: "htr-p8",
    type: "callout",
    variant: "tip",
    title: "Course 3 next",
    content:
      "You know HOW to trade. Course 3 teaches you how to SURVIVE — position sizing, stop-loss discipline, journaling, and emotional traps. This is the difference between a trader and a gambler.",
  },
];

export const howToTradeReviewPractice: PracticeQuestion[] = [
  {
    id: "htr-pr1",
    type: "multiple_choice",
    question: "Demat is needed because:",
    options: ["It pays you interest", "Shares are held electronically in India", "It's optional", "Only foreigners need it"],
    correctIndex: 1,
    explanation: "Demat = electronic holding.",
  },
  {
    id: "htr-pr2",
    type: "true_false",
    statement: "Slippage is a real component of trading cost.",
    correct: true,
    explanation: "Yes — often hidden but real.",
  },
  {
    id: "htr-pr3",
    type: "fill_blank",
    sentence: "Choose [___] orders when you want a specific price.",
    correctAnswer: "limit",
    explanation: "Limit.",
  },
  {
    id: "htr-pr4",
    type: "multiple_choice",
    question: "What turns a trade into a complete plan?",
    options: ["Just an entry", "Entry + SL + target + invalidation", "Entry + tip source", "Entry + emotion"],
    correctIndex: 1,
    explanation: "All four anchors.",
  },
  {
    id: "htr-pr5",
    type: "true_false",
    statement: "A discount broker is usually enough for a beginner DIY trader.",
    correct: true,
    explanation: "Yes — low cost + clean app.",
  },
  {
    id: "htr-pr6",
    type: "multiple_choice",
    question: "Most overlooked step in beginner workflow?",
    options: ["Buying", "Journaling", "Selling", "Logging in"],
    correctIndex: 1,
    explanation: "Journaling separates learners from gamblers.",
  },
];
