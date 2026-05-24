import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const whatIsTheMarketPages: LessonPage[] = [
  {
    id: "wm-p1",
    type: "pretest",
    question: "What is a financial market — at the most basic level?",
    options: [
      "A government office that fixes prices every morning",
      "A place where buyers and sellers exchange financial assets",
      "Only the stock exchange in Mumbai",
      "A chatroom where people post tips",
    ],
    correctIndex: 1,
    explanation: "Right. A market is simply a place — physical or digital — where buyers and sellers meet to trade.",
  },
  {
    id: "wm-p2",
    type: "text",
    title: "Markets are auctions",
    body: "A financial market is an **ongoing auction**. Buyers shout how much they're willing to pay (bids). Sellers shout how much they want (asks). When the two agree on a price — boom, a trade happens.\n\nThat last agreed price is what you see on your screen as the **'live price'**.",
  },
  {
    id: "wm-p3",
    type: "visual",
    visualId: "MarketAuctionDemo",
    caption: "Toggle the buyer/seller pressure to see why price moves up or down.",
  },
  {
    id: "wm-p4",
    type: "callout",
    variant: "concept",
    title: "Price is just the latest agreement",
    content:
      "There is no 'official' price set by anyone. The price you see is simply the most recent agreement between a buyer and a seller. The next trade may happen at a slightly different price.",
  },
  {
    id: "wm-p5",
    type: "multiple_choice",
    question: "Reliance closed at ₹1,250. The next morning, why might it open at ₹1,265?",
    options: [
      "The exchange manually raised the price overnight",
      "Aggressive buyers were willing to pay more than ₹1,250 to get filled",
      "The company added new shares",
      "Brokers reset the price each night",
    ],
    correctIndex: 1,
    explanation: "Correct. New information (news, earnings, global cues) shifts demand. If buyers urgently want shares, price gaps up.",
  },
  {
    id: "wm-p6",
    type: "true_false",
    statement: "A modern financial market can operate fully online, without any physical trading floor.",
    correct: true,
    explanation: "True. NSE and BSE are 100% electronic. Orders are matched by computers in microseconds.",
  },
  {
    id: "wm-p7",
    type: "fill_blank",
    sentence: "A trade only happens when a buyer and a [___] agree on a price.",
    correctAnswer: "seller",
    explanation: "Every trade has two sides — no agreement, no trade.",
  },
  {
    id: "wm-p8",
    type: "multiple_choice",
    question: "Which of these is NOT a financial market?",
    options: ["NSE (stocks)", "MCX (commodities)", "Forex (currencies)", "Sabzi mandi (vegetables)"],
    correctIndex: 3,
    explanation: "Sabzi mandi is also a market — but for physical goods, not financial assets like stocks, bonds, currencies, or commodities.",
  },
];

export const whatIsTheMarketPractice: PracticeQuestion[] = [
  {
    id: "wm-pr1",
    type: "multiple_choice",
    question: "The primary purpose of a financial market is to:",
    options: ["Issue government IDs", "Match buyers and sellers", "Set fixed prices", "Print currency"],
    correctIndex: 1,
    explanation: "Markets exist to bring buyers and sellers together.",
  },
  {
    id: "wm-pr2",
    type: "true_false",
    statement: "If nobody is willing to buy at a price, no trade happens at that price.",
    correct: true,
    explanation: "Exactly. Price requires mutual agreement.",
  },
  {
    id: "wm-pr3",
    type: "fill_blank",
    sentence: "Strong [___] pressure tends to push price up.",
    correctAnswer: "buyer",
    explanation: "More aggressive buyers willing to pay higher = price rises.",
  },
  {
    id: "wm-pr4",
    type: "multiple_choice",
    question: "Which is a financial market example?",
    options: ["BSE", "Local supermarket", "Bus terminal", "Library"],
    correctIndex: 0,
    explanation: "BSE (Bombay Stock Exchange) is a financial market.",
  },
  {
    id: "wm-pr5",
    type: "true_false",
    statement: "Retail traders cannot directly participate in Indian financial markets.",
    correct: false,
    explanation: "False. You can participate by opening a demat & trading account with a broker.",
  },
];
