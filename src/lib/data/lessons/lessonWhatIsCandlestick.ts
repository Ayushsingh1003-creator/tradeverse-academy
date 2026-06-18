import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const whatIsCandlestickPages: LessonPage[] = [
  // ── Warm-up: visual pick ───────────────────────────────────────────
  {
    id: "p1",
    type: "visual_choice",
    challengeBadge: "Warm-up · +25 XP",
    question: "Opens ₹100, closes ₹115 — tap the candle that matches this session.",
    options: [
      { label: "Sellers won", preset: "bearish" },
      { label: "Buyers won", preset: "bullish" },
      { label: "No winner", preset: "doji" },
      { label: "Rejection at lows", preset: "hammer" },
    ],
    correctIndex: 1,
    explanation: "Close above open → **bullish green**. Buyers pushed price from ₹100 to ₹115.",
    image: { alt: "Price moving up from 100 to 115 on a simple line chart" },
  },

  // ── Learn 1 ──────────────────────────────────────────────────────
  {
    id: "p2",
    type: "text",
    badge: "Discovery",
    title: "Meet the Candlestick 🕯️",
    image: { alt: "Trading chart with green and red candlesticks on a dark background" },
    body: "Every candlestick is a **mini battle report** for one time period. It shows who won — buyers or sellers — and how hard each side fought.\n\nTraders have used this shape for centuries because it packs **four prices** into one glanceable symbol.",
  },
  {
    id: "p3",
    type: "drag_label",
    challengeBadge: "Label Challenge · +30 XP",
    instruction: "Each candle hides four prices. Drag OPEN, HIGH, LOW, and CLOSE to the right zones.",
    labels: ["OPEN", "CLOSE", "HIGH", "LOW"],
    zones: [
      { id: "z1", title: "Upper wick tip", correctLabel: "HIGH" },
      { id: "z2", title: "Top of body", correctLabel: "CLOSE" },
      { id: "z3", title: "Bottom of body", correctLabel: "OPEN" },
      { id: "z4", title: "Lower extreme", correctLabel: "LOW" },
    ],
    explanation: "Four prices = **OHLC**. HIGH/LOW are wick tips; OPEN/CLOSE form the body edges.",
    image: { alt: "Blank candlestick outline with four drop zones for OHLC labels" },
  },

  // ── Learn 2: OHLC anatomy ──────────────────────────────────────────
  {
    id: "p4",
    type: "image",
    badge: "Anatomy",
    title: "The Four Prices (OHLC)",
    alt: "Labeled candlestick diagram showing open high low close on a bullish green candle",
    caption:
      "A candlestick shows **4 prices** in one shape: Open, High, Low, and Close. One candle = one time period — 1 minute, 1 hour, or 1 day.",
  },
  {
    id: "p5",
    type: "visual",
    visualId: "CandleAnatomy",
    caption: "Toggle **Bullish / Bearish**, then hover each label to light up that price on the candle.",
  },
  {
    id: "p6",
    type: "visual_choice",
    challengeBadge: "Spot the Pattern · +25 XP",
    question: "Which candle shows a long lower wick — buyers rejecting a push lower?",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation: "Long **lower wick** = sellers pushed down, buyers slammed the door and pushed back up.",
    image: { alt: "Comparison of candle wick types with hammer highlighted" },
  },

  // ── Learn 3: Body vs Wick ─────────────────────────────────────────
  {
    id: "p7",
    type: "callout",
    variant: "concept",
    badge: "Structure",
    title: "The Body vs. The Wick",
    image: { alt: "Side by side comparison of candle body and upper lower wicks with labels" },
    content:
      "The BODY = distance between Open and Close (who won).\nThe WICKS = highest/lowest prices reached — even if quickly rejected.\n\nLong wicks = strong rejections. Tiny wicks = price accepted those extremes.",
  },
  {
    id: "p8",
    type: "chart_tap",
    challengeBadge: "Tap the Chart · +25 XP",
    question: "Six candles on screen — tap the one with the strongest buyer rejection at the lows.",
    correctCandleIndex: 2,
    explanation: "That long lower wick shows sellers pushed hard, but buyers rejected the low and recovered.",
    highlightStyle: "longLowerWick",
    image: { alt: "Row of six candlesticks with one showing a prominent long lower wick" },
  },

  // ── Learn 4: Bullish vs Bearish ───────────────────────────────────
  {
    id: "p9",
    type: "image",
    badge: "Color Code",
    title: "Green vs Red — Who Won?",
    alt: "Bullish green candle next to bearish red candle with open and close arrows",
    caption:
      "Bullish (green) closes **above** open. Bearish (red) closes **below** open. Color = who won the session.",
  },
  {
    id: "p10",
    type: "visual_choice",
    challengeBadge: "Pick the Candle · +25 XP",
    question: "Open ₹50 · High ₹58 · Low ₹47 · Close ₹44 — which candle matches?",
    options: [
      { label: "Green — new high", preset: "bullish" },
      { label: "Red — close below open", preset: "bearish" },
      { label: "Doji — tied", preset: "doji" },
      { label: "Full bull control", preset: "marubozuBull" },
    ],
    correctIndex: 1,
    explanation:
      "Close ₹44 < Open ₹50 → **red bearish**. The spike to ₹58 (upper wick) shows buyers tried; the dip to ₹47 shows seller pressure.",
    image: { alt: "Bearish red candlestick with OHLC values open 50 high 58 low 47 close 44" },
  },
  {
    id: "p11",
    type: "visual",
    visualId: "BullishVsBearish",
    caption: "Side by side — **close vs open** alone decides color, not total price travel.",
  },

  // ── Learn 5: Doji & Timeframes ────────────────────────────────────
  {
    id: "p12",
    type: "image",
    badge: "Special Cases",
    title: "When Open Meets Close — The Doji",
    alt: "Doji candlestick with tiny horizontal body and equal upper and lower wicks",
    caption: "Open ≈ Close → body collapses to a line. A **Doji** signals **indecision** — neither side won.",
  },
  {
    id: "p13",
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
  {
    id: "p14",
    type: "image",
    badge: "Timeframes",
    title: "One Candle = One Period",
    alt: "Three charts side by side showing daily hourly and five minute candlesticks",
    caption:
      "**Daily** = 1 candle/day · **Hourly** = 1 candle/hour · **5-min** = 1 candle every 5 minutes.",
  },
  {
    id: "p15",
    type: "fill_blank",
    challengeBadge: "Type It · +20 XP",
    sentence: "On a daily chart, each candlestick represents one [___] of trading.",
    correctAnswer: "day",
    explanation: "Daily chart → one full trading day. The timeframe is always in the chart name.",
    image: { alt: "Daily candlestick chart with calendar icon showing one candle equals one day" },
  },
  {
    id: "p16",
    type: "callout",
    variant: "rule",
    badge: "Boss Level · Recap",
    title: "Your Candlestick Cheat Sheet",
    image: { alt: "Summary card with OHLC labels body wicks green red and doji icons" },
    content:
      "1. **OHLC** — four prices in every candle\n2. **Body** = Open to Close (who won)\n3. **Wicks** = rejections at extremes\n4. **Green** = Close > Open · **Red** = Close < Open\n5. **Doji** = Open = Close (indecision)",
  },
  {
    id: "p17",
    type: "chart_tap",
    challengeBadge: "Final Boss · +25 XP",
    question: "Tap the candle with the longest upper wick — sellers rejecting the highs.",
    correctCandleIndex: 4,
    explanation: "Long upper wick = price spiked up but sellers pushed it back down hard.",
    highlightStyle: "shootingStar",
    candleCount: 6,
    image: { alt: "Six candlesticks with shooting star pattern showing long upper wick rejection" },
  },
];

export const whatIsCandlestickPractice: PracticeQuestion[] = [
  {
    id: "pr1",
    type: "visual_choice",
    challengeBadge: "Practice 1 · Pick",
    question: "Close ₹102, Open ₹100 — tap the matching candle.",
    options: [
      { label: "Bearish", preset: "bearish" },
      { label: "Bullish", preset: "bullish" },
      { label: "Doji", preset: "doji" },
      { label: "Hammer", preset: "hammer" },
    ],
    correctIndex: 1,
    explanation: "Close > Open → bullish green.",
    image: { alt: "Small bullish green candle with open 100 and close 102 labeled" },
  },
  {
    id: "pr2",
    type: "chart_tap",
    challengeBadge: "Practice 2 · Tap",
    question: "Tap the candle whose upper wick marks the session HIGH.",
    correctCandleIndex: 1,
    explanation: "The top of the upper wick = highest price traded that period.",
    highlightStyle: "shootingStar",
    image: { alt: "Candlestick with arrow pointing to top of upper wick labeled high price" },
  },
  {
    id: "pr3",
    type: "fill_blank",
    challengeBadge: "Practice 3 · Type",
    sentence: "When Close < Open, the candle is [___].",
    correctAnswer: "bearish",
    explanation: "Sellers won the session.",
    image: { alt: "Red bearish candlestick with close below open highlighted" },
  },
  {
    id: "pr4",
    type: "chart_tap",
    challengeBadge: "Practice 4 · Tap",
    question: "Tap the candle with the longest lower wick (buyer rejection).",
    correctCandleIndex: 2,
    explanation: "Long lower wick = buyers rejected a push lower.",
    highlightStyle: "longLowerWick",
    image: { alt: "Practice chart row of candles highlighting lower wick lengths" },
  },
  {
    id: "pr5",
    type: "drag_label",
    challengeBadge: "Practice 5 · Drag",
    instruction: "Quick OHLC drill — label this bullish candle.",
    labels: ["OPEN", "CLOSE", "HIGH", "LOW"],
    zones: [
      { id: "z1", title: "Session high", correctLabel: "HIGH" },
      { id: "z2", title: "Top of body", correctLabel: "CLOSE" },
      { id: "z3", title: "Bottom of body", correctLabel: "OPEN" },
      { id: "z4", title: "Session low", correctLabel: "LOW" },
    ],
    explanation: "OHLC = Open, High, Low, Close — the four prices in every candle.",
    image: { alt: "OHLC acronym breakdown with icons for each price point" },
  },
  {
    id: "pr6",
    type: "drag_label",
    challengeBadge: "Practice 6 · Drag",
    instruction: "Label the bearish candle — OPEN sits at the top of the body here.",
    labels: ["OPEN", "CLOSE", "HIGH", "LOW"],
    zones: [
      { id: "z1", title: "Session high", correctLabel: "HIGH" },
      { id: "z2", title: "Top of body", correctLabel: "OPEN" },
      { id: "z3", title: "Bottom of body", correctLabel: "CLOSE" },
      { id: "z4", title: "Session low", correctLabel: "LOW" },
    ],
    explanation: "On bearish candles, OPEN is at the top of the body, CLOSE at the bottom.",
    image: { alt: "Bearish red candle outline with four label drop zones" },
  },
  {
    id: "pr7",
    type: "visual_choice",
    challengeBadge: "Practice 7 · Boss",
    question: "Tap the Marubozu — almost no wicks, one side in total control.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
      { label: "Shooting star", preset: "shootingStar" },
    ],
    correctIndex: 0,
    explanation: "Marubozu = tiny wicks, body spans nearly the full range. Strong conviction.",
    image: { alt: "Marubozu candle with no wicks showing full body from high to low" },
  },
];
