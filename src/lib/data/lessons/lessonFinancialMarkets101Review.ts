import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const financialMarkets101ReviewPages: LessonPage[] = [
  {
    id: "fmr-p1",
    type: "pretest",
    question: "Final check: what is a financial market in one line?",
    options: [
      "A government office that sets daily prices",
      "An ongoing auction where buyers and sellers exchange financial assets",
      "Only the F&O segment",
      "A WhatsApp group of tipsters",
    ],
    correctIndex: 1,
    explanation: "Correct. Markets are auctions — that's the foundation.",
  },
  {
    id: "fmr-p2",
    type: "callout",
    variant: "concept",
    title: "Course 1 recap",
    content:
      "You now know what a market is, who's in it (Retail / FII / DII / Broker / MM), India's structure (NSE, BSE, Nifty, Sensex, SEBI), when sessions run, what assets exist (equity, F&O, commodities, currency, crypto), how prices form, and what bid/ask/spread cost you. Next course: actually placing a trade.",
  },
  {
    id: "fmr-p3",
    type: "multiple_choice",
    question: "Which is the Indian markets regulator?",
    options: ["RBI", "NSE", "SEBI", "MCX"],
    correctIndex: 2,
    explanation: "SEBI regulates Indian capital markets.",
  },
  {
    id: "fmr-p4",
    type: "drag_label",
    instruction: "Match each concept to its definition.",
    labels: ["Bid", "Ask", "Spread", "Slippage"],
    zones: [
      { id: "fmr-z1", title: "Price buyers are willing to pay", correctLabel: "Bid" },
      { id: "fmr-z2", title: "Price sellers are willing to accept", correctLabel: "Ask" },
      { id: "fmr-z3", title: "Gap between bid and ask", correctLabel: "Spread" },
      { id: "fmr-z4", title: "Unfavourable fill vs expected price", correctLabel: "Slippage" },
    ],
    explanation: "Master these — they show up in every trade you'll ever place.",
  },
  {
    id: "fmr-p5",
    type: "true_false",
    statement: "Indian equity regular session is 09:15 to 15:30 IST on weekdays.",
    correct: true,
    explanation: "Yes — the core window for almost all trades.",
  },
  {
    id: "fmr-p6",
    type: "multiple_choice",
    question: "A complete beginner with limited capital should likely start with:",
    options: [
      "Nifty 50 F&O options for fast gains",
      "Large-cap equity or Nifty 50 ETF",
      "Penny stocks based on social media tips",
      "Leveraged crypto",
    ],
    correctIndex: 1,
    explanation: "Boring is beautiful — start liquid, start simple.",
  },
  {
    id: "fmr-p7",
    type: "fill_blank",
    sentence: "Price rises when [___] pressure overwhelms supply.",
    correctAnswer: "buyer",
    explanation: "Aggressive buying = upward pressure.",
  },
  {
    id: "fmr-p8",
    type: "callout",
    variant: "tip",
    title: "Ready for Course 2",
    content:
      "You now understand the playing field. Course 2 will teach you how to actually step on it — opening an account, choosing a broker, placing your first trade, and understanding what every trade really costs.",
  },
];

export const financialMarkets101ReviewPractice: PracticeQuestion[] = [
  {
    id: "fmr-pr1",
    type: "multiple_choice",
    question: "Best one-line definition of spread:",
    options: ["High − Low", "Ask − Bid", "Open − Close", "Target − Stop"],
    correctIndex: 1,
    explanation: "Ask − Bid.",
  },
  {
    id: "fmr-pr2",
    type: "true_false",
    statement: "Nifty 50 tracks 50 largest NSE-listed stocks.",
    correct: true,
    explanation: "Yes.",
  },
  {
    id: "fmr-pr3",
    type: "fill_blank",
    sentence: "FII = [___] Institutional Investor.",
    correctAnswer: "foreign",
    explanation: "Foreign capital flows.",
  },
  {
    id: "fmr-pr4",
    type: "multiple_choice",
    question: "Most important takeaway from this course?",
    options: [
      "Price moves randomly",
      "Markets are auctions driven by buyer/seller pressure",
      "Brokers control prices",
      "F&O is the best place for beginners",
    ],
    correctIndex: 1,
    explanation: "Auction logic is the bedrock of everything else.",
  },
  {
    id: "fmr-pr5",
    type: "true_false",
    statement: "Understanding the basics doesn't mean you'll automatically profit — but it prevents avoidable mistakes.",
    correct: true,
    explanation: "Right. Foundations protect you; strategy makes you profit.",
  },
  {
    id: "fmr-pr6",
    type: "multiple_choice",
    question: "Which is true about Indian markets?",
    options: [
      "NSE & BSE both host equity trading",
      "Crypto is regulated by SEBI",
      "F&O is risk-free",
      "FIIs don't participate",
    ],
    correctIndex: 0,
    explanation: "NSE & BSE both host equity trading.",
  },
];
