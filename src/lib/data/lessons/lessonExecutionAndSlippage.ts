import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const executionAndSlippagePages: LessonPage[] = [
  {
    id: "es-p1",
    type: "pretest",
    question: "You sent a market order to buy 500 shares at ₹250. You got filled at ₹251. This difference is called:",
    options: ["Spread", "Slippage", "Brokerage", "STT"],
    correctIndex: 1,
    explanation: "Right. Slippage = difference between expected and actual fill price.",
  },
  {
    id: "es-p2",
    type: "text",
    title: "Slippage 101",
    body: "Slippage happens when the price moves before your order fills, OR when there isn't enough size at your expected price. It can be:\n- **Adverse** — fills worse than expected (most common)\n- **Favourable** — fills better than expected (rare, in fast-moving markets)",
  },
  {
    id: "es-p3",
    type: "visual",
    visualId: "ExecutionSlippage",
    caption: "Plug in intended vs actual fill — see the real ₹ cost of slippage.",
  },
  {
    id: "es-p4",
    type: "callout",
    variant: "rule",
    title: "Quality > Speed for beginners",
    content:
      "Use LIMIT orders when price is sensitive. Use MARKET orders only when you absolutely need the fill — and accept the slippage you may pay.",
  },
  {
    id: "es-p5",
    type: "multiple_choice",
    question: "Slippage is highest in:",
    options: ["Reliance during regular hours", "An illiquid microcap at open", "Nifty futures mid-session", "BSE Sensex ETF"],
    correctIndex: 1,
    explanation: "Thin volume + fast price = nightmare slippage.",
  },
  {
    id: "es-p6",
    type: "true_false",
    statement: "Limit orders avoid slippage by design.",
    correct: true,
    explanation: "They only fill at your price or better — no negative slippage by definition.",
  },
  {
    id: "es-p7",
    type: "fill_blank",
    sentence: "The fewer participants in a stock, the [___] the slippage tends to be.",
    correctAnswer: "higher",
    explanation: "Less liquidity = larger gaps between bids and asks.",
  },
  {
    id: "es-p8",
    type: "multiple_choice",
    question: "Best practice in news-driven volatility:",
    options: ["Spam market orders", "Use limit orders or stand aside", "Increase size to catch the move", "Trade illiquid stocks"],
    correctIndex: 1,
    explanation: "Protect execution quality during chaos.",
  },
];

export const executionAndSlippagePractice: PracticeQuestion[] = [
  {
    id: "es-pr1",
    type: "multiple_choice",
    question: "Slippage primarily depends on:",
    options: ["Time of day & liquidity", "Color of the candle", "Broker's logo", "Type of phone"],
    correctIndex: 0,
    explanation: "Liquidity & volatility dominate.",
  },
  {
    id: "es-pr2",
    type: "true_false",
    statement: "Limit orders eliminate adverse slippage at the cost of possible no-fill.",
    correct: true,
    explanation: "Yes — trade-off.",
  },
  {
    id: "es-pr3",
    type: "fill_blank",
    sentence: "Use [___] orders when speed matters more than exact price.",
    correctAnswer: "market",
    explanation: "Market.",
  },
  {
    id: "es-pr4",
    type: "multiple_choice",
    question: "Illiquid microcaps usually have:",
    options: ["Tight spreads", "Wide spreads + high slippage", "Zero slippage", "Better fills than blue chips"],
    correctIndex: 1,
    explanation: "Thin books make every trade expensive.",
  },
  {
    id: "es-pr5",
    type: "true_false",
    statement: "Frequent traders should track average slippage as a real cost.",
    correct: true,
    explanation: "Hidden costs add up.",
  },
];
