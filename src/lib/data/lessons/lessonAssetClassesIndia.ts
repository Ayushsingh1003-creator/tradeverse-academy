import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const assetClassesIndiaPages: LessonPage[] = [
  {
    id: "ac-p1",
    type: "pretest",
    question: "Which of these is generally the SAFEST asset class for an absolute beginner?",
    options: ["F&O (options/futures)", "Crypto", "Large-cap equity (e.g. Nifty 50 stocks)", "Penny stocks"],
    correctIndex: 2,
    explanation: "Large-cap equity is liquid, regulated, and less volatile. Most beginners should start here.",
  },
  {
    id: "ac-p2",
    type: "text",
    title: "The Indian beginner asset map",
    body: "There are 5 core asset classes you'll meet in India:\n1. **Stocks (equity)** — own a part of a company\n2. **F&O (derivatives)** — leveraged contracts\n3. **Commodities** — gold, silver, crude (on MCX)\n4. **Currencies** — USD/INR, EUR/INR, etc.\n5. **Crypto** — BTC, ETH (via exchanges like WazirX, CoinDCX)\n\nEach has different risk, volatility, and rules.",
  },
  {
    id: "ac-p3",
    type: "visual",
    visualId: "AssetClassesIndia",
    caption: "Tap each asset class to see Indian examples and risk level.",
  },
  {
    id: "ac-p4",
    type: "callout",
    variant: "warning",
    title: "F&O is NOT for beginners",
    content:
      "SEBI's September 2024 study showed 93% of individual F&O traders lost money between FY22 and FY24. Avoid F&O until you've mastered equity, have a written strategy, and accept the leverage risk.",
  },
  {
    id: "ac-p5",
    type: "drag_label",
    instruction: "Match each Indian asset to its class.",
    labels: ["Stocks", "Commodities", "Currency", "Crypto"],
    zones: [
      { id: "ac-z1", title: "Reliance, TCS, HDFC Bank", correctLabel: "Stocks" },
      { id: "ac-z2", title: "Gold, Silver, Crude Oil (MCX)", correctLabel: "Commodities" },
      { id: "ac-z3", title: "USD/INR, EUR/INR", correctLabel: "Currency" },
      { id: "ac-z4", title: "Bitcoin, Ethereum (WazirX)", correctLabel: "Crypto" },
    ],
    explanation: "Classification helps you choose the right starting playground.",
  },
  {
    id: "ac-p6",
    type: "multiple_choice",
    question: "A complete beginner with ₹50,000 should ideally start with:",
    options: [
      "Buying Nifty F&O options",
      "A few large-cap equity shares or a Nifty 50 ETF",
      "Crypto with 10x leverage",
      "Penny stocks under ₹10",
    ],
    correctIndex: 1,
    explanation: "Large-cap equity (or a low-cost Nifty ETF) is the safest, most boring start — exactly what a beginner needs.",
  },
  {
    id: "ac-p7",
    type: "true_false",
    statement: "All asset classes have the same trading hours.",
    correct: false,
    explanation: "False. Equity = 09:15–15:30. MCX commodities run longer. Currency segment has its own window. Crypto is 24/7.",
  },
  {
    id: "ac-p8",
    type: "fill_blank",
    sentence: "Indian commodity futures (gold, silver, crude) trade on the [___] exchange.",
    correctAnswer: "mcx",
    explanation: "MCX = Multi Commodity Exchange of India.",
  },
];

export const assetClassesIndiaPractice: PracticeQuestion[] = [
  {
    id: "ac-pr1",
    type: "multiple_choice",
    question: "USD/INR belongs to which asset class?",
    options: ["Stocks", "Currency", "Commodities", "Crypto"],
    correctIndex: 1,
    explanation: "USD/INR is a currency pair.",
  },
  {
    id: "ac-pr2",
    type: "true_false",
    statement: "Nifty 50 ETF is a beginner-friendly way to get equity exposure.",
    correct: true,
    explanation: "Yes — it tracks the index with low cost and high liquidity.",
  },
  {
    id: "ac-pr3",
    type: "fill_blank",
    sentence: "Gold and silver trade on the [___] exchange in India.",
    correctAnswer: "mcx",
    explanation: "MCX hosts commodity contracts.",
  },
  {
    id: "ac-pr4",
    type: "multiple_choice",
    question: "Which has the HIGHEST risk for beginners?",
    options: ["Nifty 50 ETF", "F&O options", "Large-cap stocks", "Bonds"],
    correctIndex: 1,
    explanation: "F&O leverage can wipe accounts quickly.",
  },
  {
    id: "ac-pr5",
    type: "true_false",
    statement: "Crypto markets are open 24/7.",
    correct: true,
    explanation: "True — they never close, which adds emotional pressure.",
  },
];
