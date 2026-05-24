import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const bidAskSpreadCostPages: LessonPage[] = [
  {
    id: "ba-p1",
    type: "pretest",
    question: "On your broker app, Reliance shows Bid ₹1,248.50 and Ask ₹1,249.00. The spread is:",
    options: ["₹0.50", "₹1,248.50", "₹1,249.00", "₹2,497.50"],
    correctIndex: 0,
    explanation: "Spread = Ask − Bid = ₹0.50 per share.",
  },
  {
    id: "ba-p2",
    type: "text",
    title: "Bid, Ask & Spread",
    body: "Every tradable instrument has two live prices:\n- **Bid:** what buyers are currently willing to pay\n- **Ask (Offer):** what sellers are currently willing to accept\n\nThe gap = **Spread**. It's an instant cost you pay whenever you cross it.",
  },
  {
    id: "ba-p3",
    type: "visual",
    visualId: "BidAskSpreadCostDemo",
    caption: "Adjust bid, ask, and quantity to see how spread becomes a real ₹ cost.",
  },
  {
    id: "ba-p4",
    type: "callout",
    variant: "rule",
    title: "Liquidity = tight spread",
    content:
      "Liquid stocks like Reliance, HDFC Bank, Nifty futures usually have a tight spread (paise). Illiquid penny stocks can have ₹1+ spread on a ₹50 stock — huge friction. Trade liquid, especially as a beginner.",
  },
  {
    id: "ba-p5",
    type: "multiple_choice",
    question: "If you buy at ask ₹1,249 and immediately sell at bid ₹1,248.50, you lose:",
    options: ["₹0", "₹0.50 per share (the spread)", "₹1,249", "Nothing — the broker pays"],
    correctIndex: 1,
    explanation: "You crossed the spread twice (sort of). The instant round-trip loss is the spread per share.",
  },
  {
    id: "ba-p6",
    type: "true_false",
    statement: "Wider spreads hurt frequent intraday traders more than long-term investors.",
    correct: true,
    explanation: "True. The more you trade, the more you pay the spread. Investors who buy & hold pay it once.",
  },
  {
    id: "ba-p7",
    type: "fill_blank",
    sentence: "When your fill price is worse than expected due to thin liquidity, it's called [___].",
    correctAnswer: "slippage",
    explanation: "Slippage = unfavourable difference between expected and actual fill.",
  },
  {
    id: "ba-p8",
    type: "multiple_choice",
    question: "Which stock likely has the tightest spread on NSE?",
    options: ["A penny stock at ₹3", "A small-cap at ₹250", "Reliance at ₹1,250", "A delisted name"],
    correctIndex: 2,
    explanation: "Reliance has massive volume and many market makers — usually paise-wide spread.",
  },
];

export const bidAskSpreadCostPractice: PracticeQuestion[] = [
  {
    id: "ba-pr1",
    type: "multiple_choice",
    question: "Bid ₹540.20, Ask ₹540.85. Spread is:",
    options: ["₹0.45", "₹0.65", "₹540.20", "₹1,081"],
    correctIndex: 1,
    explanation: "Ask − Bid = ₹0.65.",
  },
  {
    id: "ba-pr2",
    type: "true_false",
    statement: "Liquid instruments usually have tighter spreads.",
    correct: true,
    explanation: "High volume + many makers tighten the spread.",
  },
  {
    id: "ba-pr3",
    type: "fill_blank",
    sentence: "The [___] is the price buyers are willing to pay.",
    correctAnswer: "bid",
    explanation: "Bid = buyers' price.",
  },
  {
    id: "ba-pr4",
    type: "multiple_choice",
    question: "For a beginner, which is preferable?",
    options: ["Wide spread, thin volume", "Tight spread, high volume", "No spread at all", "Spreads don't matter"],
    correctIndex: 1,
    explanation: "Tight spread + high volume = best execution conditions.",
  },
  {
    id: "ba-pr5",
    type: "true_false",
    statement: "Spread is one part of your trading cost.",
    correct: true,
    explanation: "Yes — alongside brokerage and taxes.",
  },
];
