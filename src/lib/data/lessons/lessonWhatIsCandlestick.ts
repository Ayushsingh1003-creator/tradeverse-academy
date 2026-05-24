import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const whatIsCandlestickPages: LessonPage[] = [
  {
    id: "p1",
    type: "pretest",
    question: "A stock opens at ₹100 and closes at ₹115. What color is the candlestick?",
    options: ["Red — price moved a lot", "Green — price closed above open", "Blue — it depends on volume", "Gray — not enough info"],
    correctIndex: 1,
    explanation: "Green! When Close > Open, buyers won the session. The color is your instant signal.",
  },
  {
    id: "p2",
    type: "visual",
    visualId: "CandleAnatomy",
    caption:
      "A candlestick shows **4 prices** in one shape: the Open, High, Low, and Close. Traders call this **OHLC data**. One candle = one time period — could be 1 minute, 1 hour, or 1 day.",
  },
  {
    id: "p3",
    type: "callout",
    variant: "concept",
    title: "The Body vs. The Wick",
    content:
      "The BODY (thick part) = distance between Open and Close. The WICKS (thin lines) = the highest and lowest prices reached — even if price quickly rejected those levels. Long wicks = strong rejections.",
  },
  {
    id: "p4",
    type: "multiple_choice",
    question: "This candle: Open=₹50, High=₹58, Low=₹47, Close=₹44. What color is it?",
    options: [
      "Green — it made a new high at ₹58",
      "Red — Close is below Open",
      "Green — buyers held above $47",
      "Cannot tell without volume",
    ],
    correctIndex: 1,
    explanation:
      "Red! Close (₹44) is BELOW Open (₹50). Sellers won the session. The spike to ₹58 (upper wick) shows buyers tried but failed. The dip to ₹47 (lower wick) shows sellers pushed hard before buyers partially recovered.",
    showBearishCandle: true,
  },
  {
    id: "p5",
    type: "visual",
    visualId: "BullishVsBearish",
    caption:
      "Bullish candles (green) close **above** the open. Bearish candles (red) close **below** the open. In most platforms, you can customize these colors — but green/red is the standard.",
  },
  {
    id: "p6",
    type: "drag_label",
    instruction: "Drag each label to its correct position on the candlestick.",
    labels: ["OPEN", "CLOSE", "HIGH", "LOW"],
    zones: [
      { id: "z1", title: "Upper wick tip", correctLabel: "HIGH" },
      { id: "z2", title: "Top of body", correctLabel: "CLOSE" },
      { id: "z3", title: "Bottom of body", correctLabel: "OPEN" },
      { id: "z4", title: "Lower extreme", correctLabel: "LOW" },
    ],
    explanation:
      "HIGH is the session peak, LOW the trough. CLOSE vs OPEN sets the body color — green when buyers close above where they opened.",
  },
  {
    id: "p7",
    type: "true_false",
    statement: "A candlestick with Open=₹80 and Close=₹80 (exact same price) would have NO body.",
    correct: true,
    explanation:
      "True! When Open = Close, the body collapses to a horizontal line. This is called a **Doji** — and it signals indecision in the market. Neither buyers nor sellers won.",
  },
  {
    id: "p8",
    type: "multiple_choice",
    question: "You are looking at a daily chart. Each candle represents...",
    options: ["One hour of trading", "One day of trading (open to close)", "One week of trading", "It varies — could be any timeframe"],
    correctIndex: 3,
    explanation:
      "Exactly — it varies! A daily chart shows 1 candle per day. An hourly chart shows 1 candle per hour. A 5-minute chart shows 1 candle every 5 minutes. You choose the timeframe based on your trading style.",
  },
];

export const whatIsCandlestickPractice: PracticeQuestion[] = [
  {
    id: "pr1",
    type: "multiple_choice",
    question: "Close is ₹102 and Open is ₹100. The candle is:",
    options: ["Bearish", "Bullish", "A Doji", "Cannot tell"],
    correctIndex: 1,
    explanation: "Close > Open → bullish (typically green).",
  },
  {
    id: "pr2",
    type: "true_false",
    statement: "The upper wick shows the highest price traded during the candle.",
    correct: true,
    explanation: "High of the session is the top of the upper wick.",
  },
  {
    id: "pr3",
    type: "fill_blank",
    sentence: "When Close < Open, the candle is [___].",
    correctAnswer: "bearish",
    explanation: "Sellers won the session.",
  },
  {
    id: "pr4",
    type: "chart_tap",
    question: "Tap the candle with the longest lower wick (buyer rejection).",
    correctCandleIndex: 2,
    explanation: "Long lower wick = buyers rejected a push lower.",
    highlightStyle: "longLowerWick",
  },
  {
    id: "pr5",
    type: "multiple_choice",
    question: "OHLC stands for:",
    options: ["Open, High, Low, Close", "Only High Low Close", "Order, Hedge, Leverage, Close", "Open, Hold, Liquidate, Cover"],
    correctIndex: 0,
    explanation: "The four prices encoded in each candle.",
  },
  {
    id: "pr6",
    type: "true_false",
    statement: "A Marubozu has almost no wicks — open near high/low extremes.",
    correct: true,
    explanation: "Strong one-sided control when wicks are minimal.",
  },
];
