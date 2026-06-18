import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const howToReadAChartPages: LessonPage[] = [
  // ── Warm-up ───────────────────────────────────────────────────────
  {
    id: "b1",
    type: "visual_choice",
    challengeBadge: "Warm-up · +25 XP",
    question:
      "Price drops hard, then buyers push it all the way back up to close near the high. Tap the candle that tells this story.",
    options: [
      { label: "No wicks — sellers won", preset: "marubozuBear" },
      { label: "Long lower wick — buyers fought back", preset: "hammer" },
      { label: "Indecision — tied", preset: "doji" },
      { label: "Rejection at highs", preset: "shootingStar" },
    ],
    correctIndex: 1,
    explanation:
      "Green body + long lower wick! Sellers pushed hard, but buyers overwhelmed them and closed near the high.",
    image: { alt: "Price chart showing a dip followed by a strong recovery to close near the session high" },
  },

  // ── Reading the Chart ─────────────────────────────────────────────
  {
    id: "b2",
    type: "text",
    badge: "Reading the Chart",
    title: "Every Candle Tells a Story",
    image: { alt: "Single candlestick with body and wicks labeled as battle report between buyers and sellers" },
    body: "A candlestick isn't just a data point — it's a **battle report**. The body tells you **WHO WON**. The wicks tell you **HOW HARD EACH SIDE FOUGHT**.\n\nA green candle with a tiny body and huge upper wick? Buyers tried hard, sellers pushed back — a draw leaning bearish. A red candle with a long lower wick? Sellers controlled early, but buyers refused to quit.",
  },
  {
    id: "b3",
    type: "visual_choice",
    challengeBadge: "Story Check · +25 XP",
    question: "Tiny green body + huge upper wick after a rally — which candle matches?",
    options: [
      { label: "Full bull control", preset: "marubozuBull" },
      { label: "Rejection at highs", preset: "shootingStar" },
      { label: "Buyers at lows", preset: "hammer" },
      { label: "Perfect balance", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Long upper wick = price spiked up but sellers rejected the high. Small body = neither side won decisively.",
    image: { alt: "Shooting star candle with small body at bottom and long upper wick showing seller rejection" },
  },

  // ── Wick Signals ──────────────────────────────────────────────────
  {
    id: "b4",
    type: "visual",
    visualId: "WickExplainer",
    caption:
      "The wick above the body = price was pushed there and rejected. The wick below = same at the lows. **Long wicks = strong rejections.** Short wicks = price accepted those levels.",
  },
  {
    id: "b5",
    type: "visual_choice",
    challengeBadge: "Wick Signals · +25 XP",
    question: "Open ₹100, High ₹101, Low ₹85, Close ₹99 — tap the candle that matches.",
    options: [
      { label: "Bearish — close below open", preset: "bearish" },
      { label: "Hammer — long lower wick", preset: "hammer" },
      { label: "Doji — tied", preset: "doji" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation:
      "Sellers pushed to ₹85 (long lower wick), but buyers rejected that level and almost recovered to the open. That wick marks where buyers stepped in.",
    image: { alt: "Candlestick with open 100 low 85 close 99 showing dramatic lower wick rejection at 85" },
  },
  {
    id: "b6",
    type: "chart_tap",
    challengeBadge: "Tap the Chart · +25 XP",
    question: "Six candles on screen — tap the one with the STRONGEST buyer rejection at the lows.",
    correctCandleIndex: 3,
    explanation:
      "That long lower wick shows buyers rejected a major push lower — the longer the wick, the stronger the rejection.",
    highlightStyle: "longLowerWick",
    image: { alt: "Row of six candlesticks with one showing a prominent long lower wick at the lows" },
  },

  // ── Doji & Indecision ─────────────────────────────────────────────
  {
    id: "b7",
    type: "callout",
    variant: "concept",
    badge: "Doji & Indecision",
    title: "When Neither Side Wins",
    image: { alt: "Doji candle with tiny horizontal body and equal upper and lower wicks" },
    content:
      "When Open ≈ Close, we get a **Doji** — neither side won. Dojis after a strong trend are especially powerful. The market paused. Someone is about to win.",
  },
  {
    id: "b8",
    type: "visual",
    visualId: "DojiExplainer",
    caption: "A **Doji** signals indecision — the market opened and closed at nearly the same price.",
  },
  {
    id: "b9",
    type: "visual_choice",
    challengeBadge: "Pattern Hunt · +25 XP",
    question: "Tap the candle where Open and Close are the same — a Doji.",
    options: [
      { label: "Strong bull", preset: "marubozuBull" },
      { label: "Strong bear", preset: "marubozuBear" },
      { label: "Indecision", preset: "doji" },
      { label: "Rejection high", preset: "shootingStar" },
    ],
    correctIndex: 2,
    explanation: "Doji = Open ≈ Close. Tiny body, often equal wicks — the market couldn't pick a side.",
    image: { alt: "Doji candle with open and close at same price forming a cross shape" },
  },

  // ── Buyer vs Seller Battles ───────────────────────────────────────
  {
    id: "b10",
    type: "image",
    badge: "Buyer vs Seller Battles",
    title: "Marubozu — Total Control",
    alt: "Bearish marubozu red candle with no wicks showing sellers in complete control",
    caption:
      "A large red candle with no wicks (open = high, close = low) means sellers had **complete control** — no buyer resistance at all. This is a **Bearish Marubozu**.",
  },
  {
    id: "b11",
    type: "visual_choice",
    challengeBadge: "Pick the Candle · +25 XP",
    question: "Sellers in total control — open at high, close at low, no wicks. Tap it.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Bearish Marubozu = maximum bearish conviction. No upper wick (no push higher), no lower wick (close at the absolute low).",
    image: { alt: "Bearish marubozu with body spanning full range and no upper or lower wicks" },
  },
  {
    id: "b12",
    type: "drag_label",
    challengeBadge: "Label Challenge · +30 XP",
    instruction: "Every candle answers three questions. Drag WHO WON, BODY SIZE, and WICK SIGNAL to the right zone.",
    labels: ["WHO WON", "BODY SIZE", "WICK SIGNAL"],
    zones: [
      { id: "bz1", title: "Color of the body", correctLabel: "WHO WON" },
      { id: "bz2", title: "Thick vs thin rectangle", correctLabel: "BODY SIZE" },
      { id: "bz3", title: "Length of upper/lower lines", correctLabel: "WICK SIGNAL" },
    ],
    explanation:
      "1. WHO WON? (color) · 2. HOW DECISIVE? (body size) · 3. ANY REJECTIONS? (wick length).",
    image: { alt: "Candlestick diagram with three zones labeled for body color size and wick length" },
  },
  {
    id: "b13",
    type: "fill_blank",
    challengeBadge: "Type It · +20 XP",
    sentence: "A candle where Close = Open is called a [___].",
    correctAnswer: "doji",
    explanation:
      "A Doji represents indecision — buyers and sellers were perfectly balanced. Often precedes a reversal.",
    image: { alt: "Doji candle with open and close at same level highlighted" },
  },
  {
    id: "b14",
    type: "callout",
    variant: "rule",
    badge: "Recap",
    title: "The 3 Questions for Every Candle",
    image: { alt: "Summary card showing body color body size and wick length as three reading steps" },
    content:
      "1. **WHO WON?** (color of body)\n2. **HOW DECISIVE?** (body size — big = decisive, tiny = uncertain)\n3. **ANY REJECTIONS?** (wick length — long wick = strong rejection at that extreme)",
  },
  {
    id: "b15",
    type: "chart_tap",
    challengeBadge: "Final Boss · +25 XP",
    question: "Tap the candle with the strongest upper-wick rejection — sellers slamming the highs.",
    correctCandleIndex: 4,
    explanation: "Long upper wick = sellers rejected the high. The longer the wick, the stronger the rejection.",
    highlightStyle: "shootingStar",
    candleCount: 6,
    image: { alt: "Six candlesticks with shooting star pattern showing long upper wick rejection at highs" },
  },
];

export const howToReadAChartPractice: PracticeQuestion[] = [
  {
    id: "bp1",
    type: "visual_choice",
    challengeBadge: "Practice 1 · Pick",
    question: "Long upper wick, small green body — tap the matching candle.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation: "Upper wick shows rejection from highs — leaning bearish despite green body.",
    image: { alt: "Small green body candle with long upper wick showing rejection at highs" },
  },
  {
    id: "bp2",
    type: "chart_tap",
    challengeBadge: "Practice 2 · Tap",
    question: "Tap the candle with the strongest upper-wick rejection.",
    correctCandleIndex: 4,
    explanation: "Long upper wick = sellers rejected the high.",
    highlightStyle: "shootingStar",
    image: { alt: "Chart row of candles with one shooting star showing long upper wick" },
  },
  {
    id: "bp3",
    type: "visual_choice",
    challengeBadge: "Practice 3 · Pick",
    question: "Close > Open — tap the candle type.",
    options: [
      { label: "Bearish", preset: "bearish" },
      { label: "Bullish", preset: "bullish" },
      { label: "Doji", preset: "doji" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation: "Close > Open → bullish green. Buyers won the close vs open.",
    image: { alt: "Bullish green candle with close above open highlighted" },
  },
  {
    id: "bp4",
    type: "chart_tap",
    challengeBadge: "Practice 4 · Tap",
    question: "Tap the candle with the longest lower wick — buyer rejection at the lows.",
    correctCandleIndex: 2,
    explanation: "Long lower wick = buyers rejected a push lower.",
    highlightStyle: "longLowerWick",
    image: { alt: "Practice chart row of candles highlighting lower wick lengths" },
  },
  {
    id: "bp5",
    type: "visual_choice",
    challengeBadge: "Practice 5 · Pick",
    question: "A Doji after a long rally — tap the indecision candle.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
      { label: "Shooting star", preset: "shootingStar" },
    ],
    correctIndex: 2,
    explanation: "Doji = balance — context matters after trends, but the shape is indecision.",
    image: { alt: "Doji candle appearing after a series of bullish candles on a chart" },
  },
  {
    id: "bp6",
    type: "drag_label",
    challengeBadge: "Practice 6 · Drag",
    instruction: "Label this battle report — drag BODY, UPPER WICK, and LOWER WICK to the right zones.",
    labels: ["BODY", "UPPER WICK", "LOWER WICK"],
    zones: [
      { id: "bpz1", title: "Thick rectangle (who won)", correctLabel: "BODY" },
      { id: "bpz2", title: "Line above body", correctLabel: "UPPER WICK" },
      { id: "bpz3", title: "Line below body", correctLabel: "LOWER WICK" },
    ],
    explanation: "Body = who won. Wicks = rejections at extremes — core for stops and structure.",
    image: { alt: "Candlestick outline with three drop zones for body upper wick and lower wick" },
  },
  {
    id: "bp7",
    type: "visual_choice",
    challengeBadge: "Practice 7 · Boss",
    question: "Sellers dominated all session — no wicks, close at low. Tap it.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation: "Bearish Marubozu = sellers in total control from open to close.",
    image: { alt: "Bearish marubozu candle with full red body and no wicks" },
  },
];
