import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const firstTradeWalkthroughPages: LessonPage[] = [
  {
    id: "ft-p1",
    type: "pretest",
    question: "What should you do BEFORE clicking buy on your first trade?",
    options: ["Just buy and figure it out", "Define entry, SL, target, and size", "Ask a Telegram group", "Wait for a news anchor"],
    correctIndex: 1,
    explanation: "Pre-defined plan = no panic decisions in the moment.",
  },
  {
    id: "ft-p2",
    type: "text",
    title: "Your first real trade — end to end",
    body: "Let's simulate the full lifecycle of one trade — from idea to journal entry. This is the template you'll repeat thousands of times.",
  },
  {
    id: "ft-p3",
    type: "visual",
    visualId: "FirstTradeWalkthrough",
    caption: "Step through the six stages of a complete trade.",
  },
  {
    id: "ft-p4",
    type: "callout",
    variant: "tip",
    title: "Boring is beautiful",
    content:
      "A boring, by-the-book trade with controlled risk is a SUCCESS regardless of P&L. Exciting impulsive trades are dangerous even when they win — they reinforce bad habits.",
  },
  {
    id: "ft-p5",
    type: "multiple_choice",
    question: "Mid-trade, price moves against you. You're tempted to move SL further down. You should:",
    options: ["Move it — give the trade room", "Hold the original SL and accept the loss if hit", "Add 2x more shares to average down", "Close on a different stock"],
    correctIndex: 1,
    explanation: "The SL was set when you were thinking clearly. Stick to it. Bend the rule once = bend it forever.",
  },
  {
    id: "ft-p6",
    type: "drag_label",
    instruction: "Order these steps of a trade.",
    labels: ["Pick setup", "Define risk", "Place order", "Wait", "Outcome hits", "Journal it"],
    zones: [
      { id: "ft-z1", title: "Step 1", correctLabel: "Pick setup" },
      { id: "ft-z2", title: "Step 2", correctLabel: "Define risk" },
      { id: "ft-z3", title: "Step 3", correctLabel: "Place order" },
      { id: "ft-z4", title: "Step 4", correctLabel: "Wait" },
      { id: "ft-z5", title: "Step 5", correctLabel: "Outcome hits" },
      { id: "ft-z6", title: "Step 6", correctLabel: "Journal it" },
    ],
    explanation: "This is the repeatable workflow.",
  },
  {
    id: "ft-p7",
    type: "true_false",
    statement: "Journaling a losing trade is just as valuable as journaling a winning one.",
    correct: true,
    explanation: "Maybe more so — losses are where lessons live.",
  },
  {
    id: "ft-p8",
    type: "fill_blank",
    sentence: "Most failures come from skipping the [___] step before entry.",
    correctAnswer: "risk",
    explanation: "Risk planning protects everything else.",
  },
];

export const firstTradeWalkthroughPractice: PracticeQuestion[] = [
  {
    id: "ft-pr1",
    type: "multiple_choice",
    question: "First thing you should do before placing a trade:",
    options: ["Click buy", "Plan setup + SL + size", "Tell a friend", "Watch news"],
    correctIndex: 1,
    explanation: "Always plan first.",
  },
  {
    id: "ft-pr2",
    type: "true_false",
    statement: "Moving SL further away mid-trade is a discipline failure.",
    correct: true,
    explanation: "Yes — common emotional mistake.",
  },
  {
    id: "ft-pr3",
    type: "fill_blank",
    sentence: "Win or lose, every trade should be added to your trade [___].",
    correctAnswer: "journal",
    explanation: "Journal = learning engine.",
  },
  {
    id: "ft-pr4",
    type: "multiple_choice",
    question: "A boring planned trade with controlled risk that lost is:",
    options: ["A failure", "A success — process was followed", "Embarrassing", "Reason to size up next time"],
    correctIndex: 1,
    explanation: "Process success ≠ outcome.",
  },
  {
    id: "ft-pr5",
    type: "true_false",
    statement: "Skipping the journal once is harmless.",
    correct: false,
    explanation: "Skipping creates the habit of skipping. Don't.",
  },
];
