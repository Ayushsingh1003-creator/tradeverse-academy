import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const howPricesFormPages: LessonPage[] = [
  {
    id: "hp-p1",
    type: "pretest",
    question: "Reliance jumps from ₹1,250 to ₹1,275 in 5 minutes. The MOST likely reason is:",
    options: [
      "The company manually raised the share price",
      "Suddenly more buyers willing to pay higher than sellers willing to take",
      "SEBI ordered the price up",
      "Random noise — no reason",
    ],
    correctIndex: 1,
    explanation: "Demand spiked vs available supply at lower prices. To get filled, buyers had to lift offers higher.",
  },
  {
    id: "hp-p2",
    type: "text",
    title: "Price = Demand vs Supply",
    body: "Forget complicated jargon. The whole game is this:\n- More aggressive **buyers** than sellers → price **rises**\n- More aggressive **sellers** than buyers → price **falls**\n- Balanced → price **stalls**\n\nNews, earnings, FII flows, sentiment — all of these eventually express themselves as **buyer or seller pressure**.",
  },
  {
    id: "hp-p3",
    type: "visual",
    visualId: "PriceFormationDemo",
    caption: "Drag the demand and supply sliders to see how the imbalance moves price.",
  },
  {
    id: "hp-p4",
    type: "callout",
    variant: "concept",
    title: "Aggressive vs Passive",
    content:
      "Aggressive buyers 'lift the offer' (buy at ask) — they're impatient. Aggressive sellers 'hit the bid' (sell at bid). Passive orders just sit on the book waiting. Aggressive flow is what actually moves price.",
  },
  {
    id: "hp-p5",
    type: "multiple_choice",
    question: "TCS reports great results after market close. Next morning open is likely:",
    options: ["Lower — sellers respond first", "Roughly flat — news doesn't matter", "Higher — buyer interest spikes overnight", "Halted forever"],
    correctIndex: 2,
    explanation: "Good news increases demand. Many buyers want shares at open, pushing the open price up.",
  },
  {
    id: "hp-p6",
    type: "true_false",
    statement: "Volume going up doesn't guarantee price will rise.",
    correct: true,
    explanation: "True. High volume means high participation — but if sellers are aggressive, price still falls.",
  },
  {
    id: "hp-p7",
    type: "fill_blank",
    sentence: "Price tends to fall when [___] are more aggressive than buyers.",
    correctAnswer: "sellers",
    explanation: "Aggressive sellers hit bids, pushing price down.",
  },
  {
    id: "hp-p8",
    type: "multiple_choice",
    question: "Best beginner takeaway about price moves:",
    options: [
      "Every move has a single cause you can know",
      "Reading buyer/seller pressure is more useful than predicting news",
      "Price moves randomly — ignore it",
      "Only news headlines matter",
    ],
    correctIndex: 1,
    explanation: "Understanding pressure shifts gives you context. Don't try to be a news prophet.",
  },
];

export const howPricesFormPractice: PracticeQuestion[] = [
  {
    id: "hp-pr1",
    type: "multiple_choice",
    question: "Price rises when:",
    options: ["More aggressive sellers", "More aggressive buyers", "No participants", "SEBI says so"],
    correctIndex: 1,
    explanation: "Aggressive buying drives price up.",
  },
  {
    id: "hp-pr2",
    type: "true_false",
    statement: "News only matters when it changes buyer/seller pressure.",
    correct: true,
    explanation: "Right — news is just one cause of pressure shifts.",
  },
  {
    id: "hp-pr3",
    type: "fill_blank",
    sentence: "An 'aggressive buyer' is one who buys at the [___].",
    correctAnswer: "ask",
    explanation: "Lifting the ask = aggressive buying.",
  },
  {
    id: "hp-pr4",
    type: "multiple_choice",
    question: "If demand jumps but supply also jumps equally:",
    options: ["Price rallies", "Price crashes", "Price barely moves", "Stock is delisted"],
    correctIndex: 2,
    explanation: "Equal imbalance = balanced trade, low net direction.",
  },
  {
    id: "hp-pr5",
    type: "true_false",
    statement: "You can predict every price tick if you study hard.",
    correct: false,
    explanation: "False. Markets are probabilistic, not deterministic.",
  },
];
