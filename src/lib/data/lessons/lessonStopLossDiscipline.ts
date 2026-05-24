import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const stopLossDisciplinePages: LessonPage[] = [
  {
    id: "sd-p1",
    type: "pretest",
    question: "You entered a trade with no stop loss. The trade goes against you ₹30/share over 200 shares. Your loss is:",
    options: ["₹0 — you'll wait it out", "₹6,000 already", "Doesn't matter without SL", "₹30"],
    correctIndex: 1,
    explanation: "₹30 × 200 = ₹6,000 already lost. Without SL, this can keep growing.",
  },
  {
    id: "sd-p2",
    type: "text",
    title: "No stop loss = no trade",
    body: "A trade without a stop loss isn't a trade — it's a hope. Stop loss is the ONLY tool that mechanically caps your downside. Set it BEFORE you enter, place it on the broker, and DON'T move it further away.",
  },
  {
    id: "sd-p3",
    type: "visual",
    visualId: "StopLossDrill",
    caption: "Compare the two scenarios — same setup, very different outcomes.",
  },
  {
    id: "sd-p4",
    type: "callout",
    variant: "warning",
    title: "The 'I'll watch it' trap",
    content:
      "Mental stops fail. You stare at red P&L, hope it reverses, and end up taking 5x your planned loss. Use ORDER-BASED stops (SL or SL-M) so the broker exits for you.",
  },
  {
    id: "sd-p5",
    type: "multiple_choice",
    question: "Best practice: set your stop loss based on:",
    options: [
      "How much money you're willing to lose",
      "Where the chart structure says the idea is wrong",
      "A random round number like ₹100",
      "Whatever the WhatsApp tipster says",
    ],
    correctIndex: 1,
    explanation: "Structure-based stops align loss with idea invalidation, not arbitrary tolerance.",
  },
  {
    id: "sd-p6",
    type: "true_false",
    statement: "Tightening a stop loss closer to entry as the trade goes in your favour (trailing) is generally OK.",
    correct: true,
    explanation: "Yes — trailing SL locks in profits as the trade works.",
  },
  {
    id: "sd-p7",
    type: "fill_blank",
    sentence: "Widening your stop loss after entry to avoid a small loss is a [___] mistake.",
    correctAnswer: "discipline",
    explanation: "Discipline failure — turns a planned small loss into an unplanned big one.",
  },
  {
    id: "sd-p8",
    type: "multiple_choice",
    question: "If you can't place a stop loss for a trade (e.g. illiquid stock with wild gaps), the right action is:",
    options: ["Trade anyway", "Avoid the trade", "Use no SL", "Increase position size"],
    correctIndex: 1,
    explanation: "If risk can't be controlled, skip the trade. Cash is a position.",
  },
];

export const stopLossDisciplinePractice: PracticeQuestion[] = [
  {
    id: "sd-pr1",
    type: "multiple_choice",
    question: "Mental stops (just remembering the SL price) generally:",
    options: ["Work well under emotion", "Fail under emotion", "Are recommended for beginners", "Are the safest method"],
    correctIndex: 1,
    explanation: "Use real broker-side stops.",
  },
  {
    id: "sd-pr2",
    type: "true_false",
    statement: "A stop loss should be placed BEFORE entering the trade.",
    correct: true,
    explanation: "Plan first, then execute.",
  },
  {
    id: "sd-pr3",
    type: "fill_blank",
    sentence: "Trade without a stop loss = trade with [___] risk.",
    correctAnswer: "undefined",
    explanation: "No exit plan = unbounded downside.",
  },
  {
    id: "sd-pr4",
    type: "multiple_choice",
    question: "Trailing stop loss does what?",
    options: ["Widens SL", "Tightens SL as trade moves in your favour", "Cancels SL", "Adds shares"],
    correctIndex: 1,
    explanation: "Trailing locks in gains.",
  },
  {
    id: "sd-pr5",
    type: "true_false",
    statement: "Skipping a trade when you can't define risk is the right call.",
    correct: true,
    explanation: "Cash is a position.",
  },
];
