import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const orderTypesExplainedPages: LessonPage[] = [
  {
    id: "ot-p1",
    type: "pretest",
    question: "You urgently want to exit a position before market close. Which order type fits?",
    options: ["Limit order at yesterday's close", "Market order", "GTT", "No order — wait for next day"],
    correctIndex: 1,
    explanation: "Speed > price → market order. You accept some slippage in exchange for guaranteed fill.",
  },
  {
    id: "ot-p2",
    type: "text",
    title: "The 5 order types you need to know",
    body: "Indian brokers offer 5 common order types:\n1. **Market** — buy/sell now at best available price\n2. **Limit** — only at your set price or better\n3. **Stop-Loss (SL)** — trigger + limit\n4. **Stop-Loss Market (SL-M)** — trigger + market fill\n5. **GTT** — order lives until your trigger fires (good for swing/investing)",
  },
  {
    id: "ot-p3",
    type: "visual",
    visualId: "OrderTypesSimulator",
    caption: "Tap each order type to learn when it fits and how it executes.",
  },
  {
    id: "ot-p4",
    type: "callout",
    variant: "rule",
    title: "Beginner rule",
    content:
      "When precision matters → LIMIT. When speed matters → MARKET. When you need a guaranteed exit (e.g. exit on SL) → SL-M.",
  },
  {
    id: "ot-p5",
    type: "drag_label",
    instruction: "Match each scenario to the best order type.",
    labels: ["Market", "Limit", "SL-M", "GTT"],
    zones: [
      { id: "ot-z1", title: "Urgent exit, price not critical", correctLabel: "Market" },
      { id: "ot-z2", title: "Want to buy only if price drops to ₹240", correctLabel: "Limit" },
      { id: "ot-z3", title: "Need guaranteed exit on stop-loss", correctLabel: "SL-M" },
      { id: "ot-z4", title: "Set & forget for next 6 months", correctLabel: "GTT" },
    ],
    explanation: "Matching tool to job is half the battle.",
  },
  {
    id: "ot-p6",
    type: "multiple_choice",
    question: "Limit order vs Market order — which guarantees execution?",
    options: ["Limit always", "Market always (price not guaranteed)", "Both always", "Neither"],
    correctIndex: 1,
    explanation: "Market fills almost always (immediately). Limit may not fill if price never reaches.",
  },
  {
    id: "ot-p7",
    type: "true_false",
    statement: "A GTT order can live for months waiting for its trigger.",
    correct: true,
    explanation: "True. Most brokers allow up to 365 days.",
  },
  {
    id: "ot-p8",
    type: "fill_blank",
    sentence: "A stop-loss order that converts to a market order on trigger is called [___].",
    correctAnswer: "sl-m",
    explanation: "SL-M = Stop-Loss Market.",
  },
];

export const orderTypesExplainedPractice: PracticeQuestion[] = [
  {
    id: "ot-pr1",
    type: "multiple_choice",
    question: "Which order risks slippage the most?",
    options: ["Limit", "Market", "GTT", "Bracket"],
    correctIndex: 1,
    explanation: "Market orders accept whatever price is available.",
  },
  {
    id: "ot-pr2",
    type: "true_false",
    statement: "Limit orders may not fill if price doesn't reach the level.",
    correct: true,
    explanation: "Yes — no fill is a real outcome.",
  },
  {
    id: "ot-pr3",
    type: "fill_blank",
    sentence: "GTT stands for Good Till [___].",
    correctAnswer: "triggered",
    explanation: "Good Till Triggered.",
  },
  {
    id: "ot-pr4",
    type: "multiple_choice",
    question: "Best order to set entry at a specific price?",
    options: ["Market", "Limit", "SL", "Random"],
    correctIndex: 1,
    explanation: "Limit gives you price precision.",
  },
  {
    id: "ot-pr5",
    type: "true_false",
    statement: "SL-M almost always fills but possibly with slippage.",
    correct: true,
    explanation: "Trade-off: guaranteed fill vs price control.",
  },
];
