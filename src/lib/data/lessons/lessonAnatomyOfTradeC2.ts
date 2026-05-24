import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const anatomyOfTradeC2Pages: LessonPage[] = [
  {
    id: "at-p1",
    type: "pretest",
    question: "A complete trade plan has 4 parts. Which is NOT one of them?",
    options: ["Entry", "Stop loss", "Target", "WhatsApp tip"],
    correctIndex: 3,
    explanation: "Right. A real trade plan = Entry, Stop, Target, and Invalidation rules. No tips required.",
  },
  {
    id: "at-p2",
    type: "text",
    title: "Every trade has 4 anchors",
    body: "Before any trade, you must define:\n1. **Entry** — the price/condition that activates the trade\n2. **Stop Loss** — the price at which your idea is wrong\n3. **Target** — your planned exit on the profitable side\n4. **Invalidation** — the reason the entire setup loses meaning",
  },
  {
    id: "at-p3",
    type: "visual",
    visualId: "TradeAnatomy",
    caption: "Tap each anchor to understand its role in the trade.",
  },
  {
    id: "at-p4",
    type: "callout",
    variant: "warning",
    title: "No stop loss = no trade",
    content:
      "If you can't define where you'll exit when wrong, you don't have a trade — you have unbounded exposure. Always define SL BEFORE you enter.",
  },
  {
    id: "at-p5",
    type: "multiple_choice",
    question: "You enter Reliance at ₹1,250, SL at ₹1,240. Risk per share is:",
    options: ["₹2", "₹10", "₹40", "₹250"],
    correctIndex: 1,
    explanation: "₹1,250 − ₹1,240 = ₹10 per share.",
  },
  {
    id: "at-p6",
    type: "drag_label",
    instruction: "Label the trade plan parts.",
    labels: ["Entry", "Stop Loss", "Target", "Invalidation"],
    zones: [
      { id: "at-z1", title: "Activates the trade", correctLabel: "Entry" },
      { id: "at-z2", title: "Exit if wrong", correctLabel: "Stop Loss" },
      { id: "at-z3", title: "Planned profit exit", correctLabel: "Target" },
      { id: "at-z4", title: "Setup no longer makes sense", correctLabel: "Invalidation" },
    ],
    explanation: "Clear anchors = disciplined execution.",
  },
  {
    id: "at-p7",
    type: "true_false",
    statement: "Moving your stop loss farther after entry is a common beginner mistake.",
    correct: true,
    explanation: "True. It turns a small loss into a big one.",
  },
  {
    id: "at-p8",
    type: "fill_blank",
    sentence: "Risk per share = |Entry − Stop [___]|.",
    correctAnswer: "loss",
    explanation: "Distance from entry to stop loss.",
  },
];

export const anatomyOfTradeC2Practice: PracticeQuestion[] = [
  {
    id: "at-pr1",
    type: "multiple_choice",
    question: "Entry ₹500, SL ₹495, Target ₹510. Reward-to-risk ratio is:",
    options: ["1:2", "1:5", "2:1", "1:1"],
    correctIndex: 0,
    explanation: "Risk = 5, Reward = 10 → 1:2.",
  },
  {
    id: "at-pr2",
    type: "true_false",
    statement: "Invalidation can be price-based or condition-based.",
    correct: true,
    explanation: "Both are valid.",
  },
  {
    id: "at-pr3",
    type: "fill_blank",
    sentence: "Predefined exit when wrong is called [___] loss.",
    correctAnswer: "stop",
    explanation: "Stop loss.",
  },
  {
    id: "at-pr4",
    type: "multiple_choice",
    question: "Best beginner sequence is:",
    options: ["Enter, then plan", "Plan entry/SL/target, then enter", "Enter on emotion", "Don't plan, react"],
    correctIndex: 1,
    explanation: "Plan → Execute.",
  },
  {
    id: "at-pr5",
    type: "true_false",
    statement: "Moving SL closer to entry to reduce loss is generally fine.",
    correct: false,
    explanation: "False. Tightening SL is OK; widening it is not.",
  },
];
