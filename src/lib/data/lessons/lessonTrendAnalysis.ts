import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const trendLinesPages: LessonPage[] = [
  // ── Warm-up ───────────────────────────────────────────────────────
  {
    id: "t1",
    type: "visual_choice",
    challengeBadge: "Warm-up · +25 XP",
    question:
      "Prices: ₹100→₹120→₹105→₹135→₹118→₹150. Which structure best describes this?",
    options: [
      { label: "Bearish — sellers winning", preset: "bearish" },
      { label: "Bullish — higher highs & lows", preset: "bullish" },
      { label: "Indecision — doji zone", preset: "doji" },
      { label: "Rejection at highs", preset: "shootingStar" },
    ],
    correctIndex: 1,
    explanation:
      "Higher highs and higher lows — the hallmark of an **uptrend**. Each pullback holds above the prior swing low.",
    image: { alt: "Line chart showing higher highs at 120 135 150 and higher lows at 105 118" },
  },

  // ── Trend Structure ───────────────────────────────────────────────
  {
    id: "t2",
    type: "visual",
    visualId: "TrendLines",
    caption:
      "**Uptrend**: higher highs + higher lows. **Downtrend**: lower highs + lower lows. **Sideways**: range between boundaries.",
  },
  {
    id: "t3",
    type: "text",
    badge: "Trend Structure",
    title: "Trade With the Trend",
    image: { alt: "Uptrend line connecting swing lows with price riding above the trendline" },
    body: "Swimming upstream is expensive. Most discretionary traders look for **with-trend** setups and use counter-trend trades only with tight risk and clear invalidation.\n\nFirst step: mark obvious **swing highs** and **swing lows**, then infer the trend.",
  },
  {
    id: "t4",
    type: "visual_choice",
    challengeBadge: "Structure Check · +25 XP",
    question: "A clean downtrend features lower highs and lower lows. Tap the candle showing seller control.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Lower highs + lower lows = sellers in control of structure. Bearish marubozu candles often mark decisive down legs.",
    image: { alt: "Downtrend chart with lower highs and lower lows connected by descending trendline" },
  },

  // ── Swing Points ──────────────────────────────────────────────────
  {
    id: "t5",
    type: "callout",
    variant: "rule",
    badge: "Swing Points",
    title: "Trading Rule",
    image: { alt: "Chart with swing high and swing low points marked at reversal peaks and troughs" },
    content:
      "Define trend on **YOUR trading timeframe** first, then seek alignment with higher timeframe bias.\n\nTrendlines connect meaningful swing points to visualize slope.",
  },
  {
    id: "t6",
    type: "chart_tap",
    challengeBadge: "Tap the Chart · +25 XP",
    question: "Tap the candle where an uptrend makes a clear higher high.",
    correctCandleIndex: 5,
    explanation: "Push above prior swing high — structure intact.",
    highlightStyle: "longLowerWick",
    image: { alt: "Six-candle uptrend chart with new higher high above previous swing peak" },
  },
  {
    id: "t7",
    type: "drag_label",
    challengeBadge: "Label Challenge · +30 XP",
    instruction: "Drag HIGHER HIGH, HIGHER LOW, and LOWER HIGH to the right trend concept.",
    labels: ["HIGHER HIGH", "HIGHER LOW", "LOWER HIGH"],
    zones: [
      { id: "tz1", title: "Peak above prior peak (uptrend)", correctLabel: "HIGHER HIGH" },
      { id: "tz2", title: "Pullback low above prior low", correctLabel: "HIGHER LOW" },
      { id: "tz3", title: "Rally peak below prior peak (downtrend)", correctLabel: "LOWER HIGH" },
    ],
    explanation: "Uptrend = higher highs + higher lows. Downtrend = lower highs + lower lows.",
    image: { alt: "Trend diagram with three zones for higher high higher low and lower high labels" },
  },

  // ── Sideways & Ranges ─────────────────────────────────────────────
  {
    id: "t8",
    type: "image",
    badge: "Sideways & Ranges",
    title: "When the Trend Pauses",
    alt: "Sideways consolidation chart with horizontal support and resistance boundaries",
    caption:
      "Sideways markets (ranges/consolidation) can still offer trades at support/resistance. Mean reversion inside the box.",
  },
  {
    id: "t9",
    type: "visual_choice",
    challengeBadge: "Range Spot · +25 XP",
    question: "Price bouncing between two horizontal levels — tap the indecision candle.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
      { label: "Hammer", preset: "hammer" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation:
      "Doji often appears when neither side can break the range — indecision inside consolidation.",
    image: { alt: "Range-bound chart with doji candles at horizontal support and resistance" },
  },

  // ── Trend Breaks ──────────────────────────────────────────────────
  {
    id: "t10",
    type: "callout",
    variant: "warning",
    badge: "Trend Breaks",
    title: "Watch Out for Whipsaws",
    image: { alt: "Chart showing false breakdown below trendline followed by sharp recovery" },
    content:
      "Trend breaks can **whipsaw** — wait for confirmation (close beyond structure) when possible.",
  },
  {
    id: "t11",
    type: "chart_tap",
    challengeBadge: "Breakdown Tap · +25 XP",
    question: "Tap the candle that best marks a breakdown after a series of lower highs.",
    correctCandleIndex: 4,
    explanation: "Structural shift lower — sellers break prior support.",
    highlightStyle: "shootingStar",
    image: { alt: "Downtrend chart with breakdown candle breaking below swing low support" },
  },
  {
    id: "t12",
    type: "fill_blank",
    challengeBadge: "Type It · +20 XP",
    sentence: "In an uptrend, each pullback should ideally hold above the prior [___] low.",
    correctAnswer: "swing",
    explanation: "Higher lows preserve uptrend structure.",
    image: { alt: "Uptrend chart with swing low labeled where pullback should hold" },
  },
  {
    id: "t13",
    type: "visual_choice",
    challengeBadge: "First Step · +25 XP",
    question: "Best first step when you open a chart — tap the approach that matches structure-first thinking.",
    options: [
      { label: "Mark swing highs/lows", preset: "bullish" },
      { label: "Random indicators", preset: "doji" },
      { label: "Guess earnings", preset: "bearish" },
      { label: "Ignore price", preset: "marubozuBear" },
    ],
    correctIndex: 0,
    explanation: "Structure before indicators — mark swing points, draw trendlines, then look for setups.",
    image: { alt: "Chart with swing highs and lows marked before any indicators added" },
  },
  {
    id: "t14",
    type: "callout",
    variant: "rule",
    badge: "Recap",
    title: "Trend Lines Cheat Sheet",
    image: { alt: "Summary card showing uptrend downtrend and sideways patterns with swing labels" },
    content:
      "**Uptrend** = higher highs + higher lows\n**Downtrend** = lower highs + lower lows\n**Sideways** = range between boundaries\n**Rule**: trade with the trend on your timeframe",
  },
  {
    id: "t15",
    type: "chart_tap",
    challengeBadge: "Final Boss · +25 XP",
    question: "Tap the candle marking the highest high in this uptrend sequence.",
    correctCandleIndex: 5,
    explanation: "The latest higher high — uptrend structure confirmed until broken.",
    highlightStyle: "longLowerWick",
    candleCount: 8,
    image: { alt: "Eight-candle uptrend with final higher high candle highlighted" },
  },
];

export const trendLinesPractice: PracticeQuestion[] = [
  {
    id: "tp1",
    type: "visual_choice",
    challengeBadge: "Practice 1 · Pick",
    question: "Higher highs + higher lows defines an uptrend — tap the bullish structure candle.",
    options: [
      { label: "Bearish", preset: "bearish" },
      { label: "Bullish", preset: "bullish" },
      { label: "Doji", preset: "doji" },
      { label: "Shooting star", preset: "shootingStar" },
    ],
    correctIndex: 1,
    explanation: "Classic uptrend structure — buyers making higher highs and higher lows.",
    image: { alt: "Uptrend chart snippet with higher highs and higher lows labeled" },
  },
  {
    id: "tp2",
    type: "chart_tap",
    challengeBadge: "Practice 2 · Tap",
    question: "Tap the candle that best marks a breakdown after lower highs.",
    correctCandleIndex: 4,
    explanation: "Structural shift lower.",
    highlightStyle: "shootingStar",
    image: { alt: "Downtrend practice chart with breakdown candle at lower high sequence" },
  },
  {
    id: "tp3",
    type: "drag_label",
    challengeBadge: "Practice 3 · Drag",
    instruction: "Label downtrend structure — drag LOWER HIGH and LOWER LOW to the right zones.",
    labels: ["LOWER HIGH", "LOWER LOW"],
    zones: [
      { id: "tpz1", title: "Rally peak below prior peak", correctLabel: "LOWER HIGH" },
      { id: "tpz2", title: "Pullback low below prior low", correctLabel: "LOWER LOW" },
    ],
    explanation: "Lower highs + lower lows = sellers cap rallies and break supports.",
    image: { alt: "Downtrend diagram with two drop zones for lower high and lower low" },
  },
  {
    id: "tp4",
    type: "visual_choice",
    challengeBadge: "Practice 4 · Pick",
    question: "Sideways price action between two levels — tap the indecision candle.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
      { label: "Hammer", preset: "hammer" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation: "Range/consolidation — two-sided auction in a box.",
    image: { alt: "Horizontal range chart with doji candles at boundaries" },
  },
  {
    id: "tp5",
    type: "chart_tap",
    challengeBadge: "Practice 5 · Tap",
    question: "Tap the candle making a clear higher high in the uptrend.",
    correctCandleIndex: 5,
    explanation: "Push above prior swing high preserves uptrend.",
    highlightStyle: "longLowerWick",
    image: { alt: "Uptrend practice chart with higher high candle marked" },
  },
  {
    id: "tp6",
    type: "visual_choice",
    challengeBadge: "Practice 6 · Pick",
    question: "Trendlines connect meaningful swing points — tap the candle at a swing low rejection.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 0,
    explanation: "Hammer at a swing low = buyers defending the trendline support.",
    image: { alt: "Hammer candle bouncing off uptrend line at swing low" },
  },
  {
    id: "tp7",
    type: "drag_label",
    challengeBadge: "Practice 7 · Boss",
    instruction: "Quick trend drill — label UPTREND, DOWNTREND, and SIDEWAYS on the right pattern.",
    labels: ["UPTREND", "DOWNTREND", "SIDEWAYS"],
    zones: [
      { id: "tpz3", title: "Higher highs + higher lows", correctLabel: "UPTREND" },
      { id: "tpz4", title: "Lower highs + lower lows", correctLabel: "DOWNTREND" },
      { id: "tpz5", title: "Horizontal range", correctLabel: "SIDEWAYS" },
    ],
    explanation: "Three trend states — know which one you're trading before entering.",
    image: { alt: "Three mini charts side by side for uptrend downtrend and sideways labeling" },
  },
];
