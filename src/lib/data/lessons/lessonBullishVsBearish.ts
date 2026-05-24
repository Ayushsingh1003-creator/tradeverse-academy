import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const bullishVsBearishPages: LessonPage[] = [
  {
    id: "b1",
    type: "pretest",
    question: "Price drops hard, then buyers push it all the way back up to close near the high. What does this candle look like?",
    options: ["Red body, no wicks", "Green body with a long lower wick and tiny upper wick", "A Doji with equal wicks", "Red body with a long upper wick"],
    correctIndex: 1,
    explanation:
      "Green body, long lower wick! Sellers pushed hard (long lower wick = they got far below open), but buyers overwhelmed them and closed near the high. This pattern has a name — and you'll learn it soon.",
  },
  {
    id: "b2",
    type: "text",
    title: "Every Candle Tells a Story",
    body: "A candlestick isn't just a data point — it's a battle report. The body tells you **WHO WON**. The wicks tell you **HOW HARD EACH SIDE FOUGHT**. A green candle with a tiny body and huge upper wick? Buyers tried hard, sellers pushed back hard — a draw leaning bearish. A red candle with a long lower wick? Sellers controlled early, but buyers refused to quit.",
  },
  {
    id: "b3",
    type: "visual",
    visualId: "WickExplainer",
    caption: "The wick above the body = price was pushed there and rejected. The wick below the body = price was pushed there and rejected. **Long wicks = strong rejections.** Short wicks = price accepted those levels.",
  },
  {
    id: "b4",
    type: "multiple_choice",
    question: "A candle has: Open=$100, High=$101, Low=$85, Close=$99. What does the long lower wick tell you?",
    options: [
      "Sellers dominated and drove price to $85",
      "Buyers stepped in strongly at $85 and pushed price back up",
      "The stock had low volume that day",
      "Price will definitely go higher tomorrow",
    ],
    correctIndex: 1,
    explanation:
      "Buyers stepped in at $85! The wick shows sellers DID push price to $85 (a big drop from $100), but buyers rejected that level so aggressively that price almost recovered to the open. That lower wick at $85 becomes a significant support level to watch.",
  },
  {
    id: "b5",
    type: "visual",
    visualId: "DojiExplainer",
    caption: "When Open ≈ Close, we get a **Doji** — neither side won. Dojis after a strong trend are especially powerful signals. The market paused. Someone is about to win.",
  },
  {
    id: "b6",
    type: "chart_tap",
    question: "Which candle shows the STRONGEST buyer rejection? (Tap it)",
    correctCandleIndex: 3,
    explanation: "That long lower wick shows buyers rejected a major push lower — the longer the wick, the stronger the rejection. This is often where institutional buyers entered.",
    highlightStyle: "longLowerWick",
  },
  {
    id: "b7",
    type: "callout",
    variant: "rule",
    title: "The 3 Questions for Every Candle",
    content:
      "1. WHO WON? (color of body)\n2. HOW DECISIVE? (body size — big = decisive, tiny = uncertain)\n3. ANY REJECTIONS? (wick length — long wick = strong rejection at that extreme)",
  },
  {
    id: "b8",
    type: "true_false",
    statement:
      "A large red candle with no wicks (open = high, close = low) means sellers had complete control for the entire session — no buyer resistance at all.",
    correct: true,
    explanation:
      "True — this is called a **Bearish Marubozu**. It means from the opening bell, sellers were in total control. No one tried to push higher (no upper wick), and sellers held the close at the absolute low (no lower wick). Maximum bearish conviction.",
  },
  {
    id: "b9",
    type: "fill_blank",
    sentence: "A candle where Close = Open is called a [___].",
    correctAnswer: "doji",
    explanation: "A Doji! It represents indecision — the market opened and closed at the same price, meaning buyers and sellers were perfectly balanced. Often precedes a reversal.",
  },
];

export const bullishVsBearishPractice: PracticeQuestion[] = [
  {
    id: "bp1",
    type: "multiple_choice",
    question: "Long upper wick, small green body — bias?",
    options: ["Strongly bullish", "Leaning bearish / rejection at highs", "Always a Doji", "No information"],
    correctIndex: 1,
    explanation: "Upper wick shows rejection from highs.",
  },
  {
    id: "bp2",
    type: "true_false",
    statement: "Lower wicks can mark support if buyers repeatedly defend that price.",
    correct: true,
    explanation: "Rejection of lows can build memory at a level.",
  },
  {
    id: "bp3",
    type: "fill_blank",
    sentence: "Close > Open describes a [___] candle.",
    correctAnswer: "bullish",
    explanation: "Buyers won the close vs open.",
  },
  {
    id: "bp4",
    type: "chart_tap",
    question: "Tap the candle with the strongest upper-wick rejection.",
    correctCandleIndex: 4,
    explanation: "Long upper wick = sellers rejected the high.",
    highlightStyle: "shootingStar",
  },
  {
    id: "bp5",
    type: "multiple_choice",
    question: "A Doji after a long rally often suggests:",
    options: ["Guaranteed crash", "Indecision / possible pause or reversal", "More of the same trend forever", "Low liquidity only"],
    correctIndex: 1,
    explanation: "Doji = balance — context matters after trends.",
  },
  {
    id: "bp6",
    type: "true_false",
    statement: "Wicks can lie — they never matter for risk management.",
    correct: false,
    explanation: "Wicks show extremes and rejections — core for stops and structure.",
  },
];
