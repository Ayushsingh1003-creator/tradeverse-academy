export type CandleDef = { o: number; h: number; l: number; c: number };
export type UpDown = "up" | "down";
export type NcMode = "number" | "candle";
export type GrId = "green" | "red";
export type MatchId = "green" | "red" | "biggreen" | "bigred";

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // S0
  { title: "What is price?", kind: "learn" }, // S1
  { title: "Quick check", kind: "quiz" }, // S2
  { title: "Price over time", kind: "learn" }, // S3
  { title: "Up or down?", kind: "quiz" }, // S4
  { title: "Why a candle?", kind: "learn" }, // S5
  { title: "Which shows more?", kind: "quiz" }, // S6
  { title: "Green vs red", kind: "learn" }, // S7
  { title: "Spot the up day", kind: "quiz" }, // S8
  { title: "Candles build a chart", kind: "learn" }, // S9
  { title: "Match it", kind: "quiz" }, // S10
  { title: "Sort the deck", kind: "quiz" }, // S11
  { title: "Prove it", kind: "quiz" }, // S12
  { title: "Complete", kind: "done" }, // S13
];

export const TOTAL_STEPS = SECTION_META.length - 1; // last index (13)

/* ---------- S1: what is price? (buy/sell market simulator) ---------- */

export const MARKET_START_PRICE = 100;
export const MARKET_MIN_PRICE = 60;
export const MARKET_MAX_PRICE = 160;

/* ---------- S2: quick check (MCQ) ---------- */

export const MCQ_QUESTION = {
  question: "What makes a price rise?",
  options: [
    {
      text: "More buyers than sellers",
      correct: true,
      why: "Exactly. When buyers outnumber sellers, they bid the price up. The reverse pushes it down.",
    },
    {
      text: "The clock passing midnight",
      correct: false,
      why: "Time alone does nothing. Price only moves when buyers and sellers act.",
    },
    {
      text: "The chart being coloured green",
      correct: false,
      why: "Green is the result of a rise, not the cause. Buyers cause the rise.",
    },
    {
      text: "A bigger company logo",
      correct: false,
      why: "Branding doesn't move price. Only the balance of buyers and sellers does.",
    },
  ],
};

/* ---------- S3: price over time (record a day) ---------- */

export const RECORD_SERIES = [100, 103, 101, 106, 104, 109, 112];

/* ---------- S4: up or down? ---------- */

export const UP_DOWN_ROUNDS: Array<{ a: number; b: number; ans: UpDown }> = [
  { a: 100, b: 108, ans: "up" },
  { a: 120, b: 112, ans: "down" },
  { a: 96, b: 101, ans: "up" },
];

/* ---------- S5: why a candle? (number vs candle toggle) ---------- */

export const NC_SAMPLE: CandleDef = { o: 35, h: 88, l: 10, c: 62 };
export const NC_LABELS = { high: 131, open: 116, close: 124, low: 110 };

export const NC_CAPTIONS: Record<NcMode, string> = {
  number:
    'All this number says is "the day ended at ₹124." You have no idea if it was calm or a rollercoaster.',
  candle:
    "Same day, but now you see it opened at ₹116, ran up to ₹131, dipped to ₹110, and closed at ₹124 — the full journey.",
};

/* ---------- S6: which shows more? ---------- */

export const S6_COPY = {
  correctFb: "Right — the candle shows the open, high, low AND close. The dot shows only one price.",
  wrongFb: "A single dot is just one price. The candle packs in far more about the day.",
};

/* ---------- S7: green vs red ---------- */

export const GR_CARDS: Array<{ id: GrId; name: string; sample: CandleDef; detail: string }> = [
  { id: "green", name: "Green candle", sample: { o: 40, h: 80, l: 34, c: 72 }, detail: "Closed higher than it opened. Buyers won the day." },
  { id: "red", name: "Red candle", sample: { o: 72, h: 78, l: 32, c: 40 }, detail: "Closed lower than it opened. Sellers won the day." },
];

/* ---------- S8: spot the up day ---------- */

export const SPOT_UP_DAY_ROUNDS: Array<{ prompt: string; candles: CandleDef[]; ans: number; hint: string }> = [
  {
    prompt: "Tap the day price went UP",
    candles: [
      { o: 70, h: 78, l: 40, c: 46 },
      { o: 40, h: 74, l: 34, c: 68 },
      { o: 60, h: 66, l: 42, c: 48 },
      { o: 55, h: 60, l: 30, c: 44 },
    ],
    ans: 1,
    hint: "The green candle closed above its open — an up day.",
  },
  {
    prompt: "Tap the day price went DOWN",
    candles: [
      { o: 36, h: 72, l: 30, c: 66 },
      { o: 40, h: 70, l: 36, c: 62 },
      { o: 68, h: 74, l: 34, c: 42 },
      { o: 30, h: 64, l: 26, c: 58 },
    ],
    ans: 2,
    hint: "The red candle closed below its open — a down day.",
  },
  {
    prompt: "Tap the strongest UP day",
    candles: [
      { o: 46, h: 60, l: 42, c: 52 },
      { o: 28, h: 86, l: 24, c: 82 },
      { o: 66, h: 72, l: 40, c: 48 },
      { o: 50, h: 58, l: 34, c: 44 },
    ],
    ans: 1,
    hint: "The tallest green body is the biggest up day.",
  },
];

/* ---------- S9: candles build a chart ---------- */

export const BUILD_CHART_BARS: CandleDef[] = [
  { o: 100, h: 106, l: 98, c: 104 },
  { o: 104, h: 108, l: 101, c: 102 },
  { o: 102, h: 110, l: 101, c: 109 },
  { o: 109, h: 112, l: 105, c: 106 },
  { o: 106, h: 114, l: 105, c: 113 },
  { o: 113, h: 116, l: 110, c: 111 },
  { o: 111, h: 120, l: 110, c: 118 },
];

/* ---------- S10: match it ---------- */

export const MATCH_PAIRS: Array<{ id: MatchId; o: number; h: number; l: number; c: number; name: string; title: string; sub: string }> = [
  { id: "green", o: 40, h: 78, l: 34, c: 70, name: "Green candle", title: "Buyers won", sub: "Price closed higher than it opened." },
  { id: "red", o: 70, h: 76, l: 32, c: 40, name: "Red candle", title: "Sellers won", sub: "Price closed lower than it opened." },
  { id: "biggreen", o: 26, h: 86, l: 22, c: 82, name: "Big green candle", title: "A strong up day", sub: "Buyers dominated by a wide margin." },
  { id: "bigred", o: 82, h: 86, l: 20, c: 24, name: "Big red candle", title: "A strong down day", sub: "Sellers dominated by a wide margin." },
];

/* ---------- S11: sort the deck ---------- */

export const SORT_DECK: CandleDef[] = [
  { o: 40, h: 74, l: 34, c: 68 },
  { o: 70, h: 76, l: 32, c: 42 },
  { o: 46, h: 82, l: 40, c: 76 },
  { o: 64, h: 70, l: 30, c: 40 },
  { o: 38, h: 66, l: 32, c: 60 },
];

/* ---------- S12: prove it (final spot-it) ---------- */

export const FINAL_SPOT_ROUNDS: Array<{ prompt: string; candles: CandleDef[]; ans: number; hint: string }> = [
  {
    prompt: "Tap the day buyers won",
    candles: [
      { o: 68, h: 74, l: 36, c: 44 },
      { o: 40, h: 76, l: 34, c: 70 },
      { o: 60, h: 66, l: 40, c: 46 },
    ],
    ans: 1,
    hint: "Green = buyers won — it closed up.",
  },
  {
    prompt: "Tap the day sellers won",
    candles: [
      { o: 40, h: 74, l: 34, c: 68 },
      { o: 44, h: 70, l: 38, c: 64 },
      { o: 70, h: 76, l: 32, c: 42 },
    ],
    ans: 2,
    hint: "Red = sellers won — it closed down.",
  },
  {
    prompt: "Tap the biggest up move",
    candles: [
      { o: 46, h: 60, l: 42, c: 52 },
      { o: 60, h: 66, l: 40, c: 46 },
      { o: 26, h: 86, l: 22, c: 82 },
    ],
    ans: 2,
    hint: "The tallest green body is the biggest up move.",
  },
];

/* ---------- S13: complete ---------- */

export const BADGE_TITLE = "Market Rookie";
export const BADGE_SUBTITLE = "You get what price is, why it moves, and how a candle captures it. Here's your road ahead.";
export const LESSONS_DONE_LABEL = "1/4";

export const ROADMAP_ITEMS: Array<{ title: string; done: boolean }> = [
  { title: "Lesson 1 · Introduction", done: true },
  { title: "Lesson 2 · Understanding Price Charts", done: false },
  { title: "Lesson 3 · Anatomy of a Candle", done: false },
  { title: "Lesson 4 · What Candles Tell You", done: false },
];
