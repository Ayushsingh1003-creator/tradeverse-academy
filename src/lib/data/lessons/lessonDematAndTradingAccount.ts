import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const dematAndTradingAccountPages: LessonPage[] = [
  {
    id: "dt-p1",
    type: "pretest",
    question: "What's the difference between a trading account and a demat account?",
    options: [
      "They are the same thing",
      "Trading account places orders; demat account holds shares",
      "Demat is only for crypto",
      "Trading account holds shares; demat places orders",
    ],
    correctIndex: 1,
    explanation: "Right. Trading account = order placement. Demat = where the shares actually sit (in NSDL or CDSL depository).",
  },
  {
    id: "dt-p2",
    type: "text",
    title: "The 4 accounts you'll touch",
    body: "To trade in India you'll deal with:\n1. **Bank account** — your money\n2. **Trading account** — placing orders\n3. **Exchange** — actual matching at NSE/BSE\n4. **Demat account** — where shares are stored electronically",
  },
  {
    id: "dt-p3",
    type: "visual",
    visualId: "DematAccountFlow",
    caption: "Tap each box to see what role it plays in every trade you place.",
  },
  {
    id: "dt-p4",
    type: "callout",
    variant: "concept",
    title: "NSDL & CDSL — the two depositories",
    content:
      "All Indian demat accounts sit in either NSDL or CDSL. Brokers like Zerodha use CDSL; ICICI Direct uses NSDL. You don't usually choose — the broker does. Both are safe & SEBI-regulated.",
  },
  {
    id: "dt-p5",
    type: "multiple_choice",
    question: "You buy 10 shares of TCS. Where do they go?",
    options: ["Into your bank account", "Into your demat account", "Stored as paper certificates", "Stay with the broker forever"],
    correctIndex: 1,
    explanation: "Shares are credited to your demat account (T+1 settlement currently in India).",
  },
  {
    id: "dt-p6",
    type: "true_false",
    statement: "You need a PAN card to open a demat & trading account in India.",
    correct: true,
    explanation: "True. PAN, Aadhaar, bank proof, and signature are mandatory KYC documents.",
  },
  {
    id: "dt-p7",
    type: "fill_blank",
    sentence: "Indian shares are held electronically by depositories like NSDL or [___].",
    correctAnswer: "cdsl",
    explanation: "CDSL = Central Depository Services Limited.",
  },
  {
    id: "dt-p8",
    type: "multiple_choice",
    question: "Settlement in Indian equity is currently:",
    options: ["Same day (T+0) for everyone", "T+1 (next working day)", "T+5", "T+30"],
    correctIndex: 1,
    explanation: "India moved to T+1 in 2023. Shares hit your demat the next working day.",
  },
];

export const dematAndTradingAccountPractice: PracticeQuestion[] = [
  {
    id: "dt-pr1",
    type: "multiple_choice",
    question: "A demat account is used to:",
    options: ["Place orders", "Hold shares electronically", "Convert INR to USD", "File taxes"],
    correctIndex: 1,
    explanation: "Demat = electronic holding.",
  },
  {
    id: "dt-pr2",
    type: "true_false",
    statement: "PAN is mandatory for opening a demat account.",
    correct: true,
    explanation: "Yes, regulatory requirement.",
  },
  {
    id: "dt-pr3",
    type: "fill_blank",
    sentence: "Indian settlement cycle is currently T+[___].",
    correctAnswer: "1",
    explanation: "T+1 since 2023.",
  },
  {
    id: "dt-pr4",
    type: "multiple_choice",
    question: "Your bank account is used for:",
    options: ["Holding shares", "Funding the trading account", "Matching orders", "Setting Nifty price"],
    correctIndex: 1,
    explanation: "Bank → Trading account (funding pay-in / pay-out).",
  },
  {
    id: "dt-pr5",
    type: "true_false",
    statement: "You can have demat accounts at multiple brokers if you want.",
    correct: true,
    explanation: "True. Many traders keep more than one.",
  },
];
