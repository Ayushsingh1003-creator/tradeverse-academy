import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const marketParticipantsPages: LessonPage[] = [
  {
    id: "mp-p1",
    type: "pretest",
    question: "Who actually moves the most money in Indian markets on a typical day?",
    options: ["Retail traders", "FIIs and DIIs", "Just the brokers", "Government employees"],
    correctIndex: 1,
    explanation: "FIIs (foreign funds) and DIIs (Indian funds like LIC, mutual funds) move the biggest size — they often set the market's direction.",
  },
  {
    id: "mp-p2",
    type: "text",
    title: "Who is in the market with you?",
    body: "You are not trading alone. Every order you place is matched against someone else. Knowing **who** is on the other side helps you make sense of price moves.",
  },
  {
    id: "mp-p3",
    type: "visual",
    visualId: "ParticipantsIndia",
    caption: "Tap each participant type to see what they do and how they impact price.",
  },
  {
    id: "mp-p4",
    type: "drag_label",
    instruction: "Match each role to its main job.",
    labels: ["Retail Trader", "FII", "DII", "Market Maker", "Broker"],
    zones: [
      { id: "mp-z1", title: "Individual trading personal money", correctLabel: "Retail Trader" },
      { id: "mp-z2", title: "Foreign fund investing in Indian stocks", correctLabel: "FII" },
      { id: "mp-z3", title: "Indian mutual fund / insurer like LIC", correctLabel: "DII" },
      { id: "mp-z4", title: "Posts both buy & sell quotes for liquidity", correctLabel: "Market Maker" },
      { id: "mp-z5", title: "Routes your order to NSE/BSE", correctLabel: "Broker" },
    ],
    explanation: "Each role has a different incentive — knowing them helps you interpret market behavior.",
  },
  {
    id: "mp-p5",
    type: "callout",
    variant: "tip",
    title: "FII selling = market under pressure",
    content:
      "When you read 'FIIs net sold ₹3,000 cr today' on news — that's a clue that foreign money is leaving. Indian DIIs sometimes absorb the selling, which is why Nifty doesn't always crash.",
  },
  {
    id: "mp-p6",
    type: "multiple_choice",
    question: "Your broker Zerodha is a:",
    options: ["Market maker", "FII", "Broker — routes your orders", "Regulator"],
    correctIndex: 2,
    explanation: "Brokers like Zerodha, Groww, Upstox connect your account to the exchange and hold your shares in your demat.",
  },
  {
    id: "mp-p7",
    type: "true_false",
    statement: "A retail trader and an institution can buy the same stock at the same time at the same price.",
    correct: true,
    explanation: "True. The exchange matches orders by price-time priority — no special pricing for size.",
  },
  {
    id: "mp-p8",
    type: "fill_blank",
    sentence: "[___] makers earn the spread by always quoting both bid and ask.",
    correctAnswer: "market",
    explanation: "Market makers provide continuous liquidity in exchange for the bid-ask spread.",
  },
];

export const marketParticipantsPractice: PracticeQuestion[] = [
  {
    id: "mp-pr1",
    type: "multiple_choice",
    question: "DII stands for:",
    options: ["Direct Indian Investor", "Domestic Institutional Investor", "Daily Index Investor", "Derivative Investment Institution"],
    correctIndex: 1,
    explanation: "Domestic Institutional Investor — Indian mutual funds, insurers, pension funds.",
  },
  {
    id: "mp-pr2",
    type: "true_false",
    statement: "FII flows can significantly influence Nifty 50.",
    correct: true,
    explanation: "FIIs hold a large chunk of free-float; their buying or selling moves the index.",
  },
  {
    id: "mp-pr3",
    type: "fill_blank",
    sentence: "Zerodha, Groww and Upstox are examples of [___].",
    correctAnswer: "brokers",
    explanation: "These are stockbrokers — your gateway to the exchange.",
  },
  {
    id: "mp-pr4",
    type: "multiple_choice",
    question: "Which participant primarily provides liquidity?",
    options: ["Retail trader", "Market maker", "SEBI", "FII"],
    correctIndex: 1,
    explanation: "Market makers continuously quote both sides, improving tradability.",
  },
  {
    id: "mp-pr5",
    type: "true_false",
    statement: "Knowing who is on the other side of your trade can improve your reading of price.",
    correct: true,
    explanation: "Context (FII heavy selling, DII buying, etc.) helps interpret price action.",
  },
];
