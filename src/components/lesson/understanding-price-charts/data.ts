export type AxisKey = "x" | "y";
export type TrendKey = "up" | "down" | "side";
export type ChartMode = "line" | "candle";
export type LineTeachKey = "dots" | "line";
export type MatchId = "up" | "down" | "side" | "spike";

export type Candle = { o: number; h: number; l: number; c: number };

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Introduction", kind: "learn" },
  { title: "The two axes", kind: "learn" },
  { title: "Quick check", kind: "quiz" },
  { title: "Reading a point", kind: "learn" },
  { title: "Find the high", kind: "quiz" },
  { title: "The line chart", kind: "learn" },
  { title: "Read the trend", kind: "quiz" },
  { title: "The three trends", kind: "learn" },
  { title: "Spot the trend", kind: "quiz" },
  { title: "Line vs candle", kind: "learn" },
  { title: "Match the shape", kind: "quiz" },
  { title: "Build an uptrend", kind: "quiz" },
  { title: "Read it live", kind: "quiz" },
  { title: "Complete", kind: "done" },
];

export const TOTAL_STEPS = SECTION_META.length - 1; // last index (13)

/* ---------- shared price series ---------- */

export function upSeries(variant: 0 | 1): number[] {
  return variant ? [100, 108, 104, 116, 122, 119, 130, 138] : [102, 106, 112, 110, 120, 126, 132, 140];
}
export function downSeries(variant: 0 | 1): number[] {
  return variant ? [140, 132, 136, 126, 120, 123, 112, 104] : [138, 134, 128, 130, 120, 116, 110, 102];
}
export function sideSeries(variant: 0 | 1): number[] {
  return variant ? [120, 126, 118, 124, 119, 125, 120, 123] : [122, 117, 123, 118, 124, 119, 123, 120];
}
export function spikeSeries(): number[] {
  return [118, 119, 117, 145, 120, 118, 119, 117];
}
export function seriesFor(kind: TrendId, variant: 0 | 1): number[] {
  return kind === "up" ? upSeries(variant) : kind === "down" ? downSeries(variant) : sideSeries(variant);
}
export function strokeFor(kind: TrendId | "spike"): string {
  return kind === "up" ? "#22c55e" : kind === "down" ? "#ef4444" : "#88c9f7";
}

export type TrendId = "up" | "down" | "side";

export const READ_SERIES: number[] = [112, 108, 118, 124, 121, 130, 127, 138, 135, 144];
export const S4_SERIES: number[] = [120, 132, 128, 141, 137, 130, 124, 133, 129, 126];
export const LC_SERIES: number[] = [116, 112, 122, 119, 128, 124, 134, 131];

/* ---------- step 1 — the two axes ---------- */

export const AXIS_INFO: Record<AxisKey, { name: string; revealed: string; prompt: string }> = {
  y: {
    name: "Vertical axis — Price",
    revealed:
      "Measures price. The higher a point sits, the more expensive it was. Read a point straight across to this axis to get its price.",
    prompt: "Tap the tall axis on the left to reveal what it measures.",
  },
  x: {
    name: "Horizontal axis — Time",
    revealed:
      "Measures time, flowing left to right. The far right is the most recent moment. Read a point straight down to this axis to get its time.",
    prompt: "Tap the wide axis along the bottom to reveal what it measures.",
  },
};

/* ---------- step 2 — quiz ---------- */

export const MCQ_QUESTION = {
  question: "On a price chart, what does the vertical axis show?",
  options: [
    {
      text: "Price — higher up means a higher price",
      correct: true,
      why: "Right. The vertical (up-down) axis is price; the horizontal axis is time.",
    },
    {
      text: "Time — how many days have passed",
      correct: false,
      why: "Time runs along the horizontal axis, left to right. The vertical axis is price.",
    },
    {
      text: "The number of traders",
      correct: false,
      why: "Charts plot price against time — not how many people are trading.",
    },
    {
      text: "The company's profit",
      correct: false,
      why: "A price chart only shows price over time, not company earnings.",
    },
  ],
};

/* ---------- step 4 — find the high ---------- */

export const S4_MAX_INDEX = S4_SERIES.indexOf(Math.max(...S4_SERIES));

/* ---------- step 5 — the line chart (teach) ---------- */

export const LINE_TEACH_CAPTIONS: Record<"dots" | "line", string> = {
  dots: "Each dot is one day's closing price, plotted at its time and height. On their own they're just scattered points.",
  line: "Connected, the closes form a line you can read instantly: this stock drifted upward over the period.",
};

/* ---------- step 6 — read the trend (quiz, 3 rounds) ---------- */

export const T3_ROUNDS: Array<{ series: number[]; ans: TrendId; hint: string }> = [
  { series: upSeries(0), ans: "up", hint: "Each close is higher than the last — a clear uptrend." },
  { series: downSeries(0), ans: "down", hint: "Each close is lower than the last — a downtrend." },
  { series: sideSeries(0), ans: "side", hint: "Price wiggles around the same level — sideways / ranging." },
];

export const TREND_OPTIONS: Array<{ id: TrendId; label: string }> = [
  { id: "up", label: "Up" },
  { id: "down", label: "Down" },
  { id: "side", label: "Sideways" },
];

/* ---------- step 7 — the three trends (teach) ---------- */

export const TREND_DEFS: Array<{ id: TrendId; name: string; series: number[]; stroke: string; title: string; sub: string }> = [
  {
    id: "up",
    name: "Uptrend",
    series: upSeries(0),
    stroke: "#22c55e",
    title: "Uptrend — higher highs, higher lows",
    sub: "Buyers keep stepping in at rising prices. The staircase points up.",
  },
  {
    id: "down",
    name: "Downtrend",
    series: downSeries(0),
    stroke: "#ef4444",
    title: "Downtrend — lower highs, lower lows",
    sub: "Sellers keep pressing at falling prices. The staircase points down.",
  },
  {
    id: "side",
    name: "Sideways",
    series: sideSeries(0),
    stroke: "#88c9f7",
    title: "Sideways — a range",
    sub: "Neither side wins. Price bounces between a floor and a ceiling.",
  },
];

/* ---------- step 8 — spot the trend (quiz, 2 rounds) ---------- */

export const S8_ROUNDS: Array<{ prompt: string; kinds: TrendId[]; ans: number; hint: string }> = [
  { prompt: "Tap the uptrend", kinds: ["down", "up", "side", "down"], ans: 1, hint: "The uptrend is the chart climbing left-to-right." },
  {
    prompt: "Tap the sideways (ranging) market",
    kinds: ["up", "side", "down", "up"],
    ans: 1,
    hint: "The sideways chart stays flat, bouncing in a range.",
  },
];

/* ---------- step 9 — line vs candlestick (teach) ---------- */

export const LVC_BARS: Candle[] = [
  { o: 114, h: 121, l: 110, c: 118 },
  { o: 118, h: 122, l: 111, c: 113 },
  { o: 113, h: 129, l: 112, c: 127 },
  { o: 127, h: 131, l: 120, c: 122 },
  { o: 122, h: 135, l: 121, c: 133 },
  { o: 133, h: 140, l: 129, c: 131 },
];

export const LVC_CAPTIONS: Record<ChartMode, string> = {
  candle:
    "Same six days — but now you see each day's full range: open, high, low and close. Notice day 2 and day 4 actually closed DOWN, which the line completely hid.",
  line: "The line joins only the six closing prices. Smooth and simple — but it hides how wild each day really was.",
};

/* ---------- step 10 — match the shape (quiz) ---------- */

export type MatchPair = { id: MatchId; kind: MatchId; name: string; title: string; sub: string };

export const MATCH_PAIRS: MatchPair[] = [
  { id: "up", kind: "up", name: "Rising staircase", title: "Uptrend", sub: "Buyers in control — higher highs." },
  { id: "down", kind: "down", name: "Falling staircase", title: "Downtrend", sub: "Sellers in control — lower lows." },
  { id: "side", kind: "side", name: "Flat zig-zag", title: "Sideways range", sub: "Balance — price stuck between levels." },
  { id: "spike", kind: "spike", name: "Sharp spike", title: "High volatility", sub: "A violent, fast move — big risk." },
];

export function seriesForMatch(kind: MatchId): number[] {
  return kind === "spike" ? spikeSeries() : kind === "up" ? upSeries(0) : kind === "down" ? downSeries(0) : sideSeries(0);
}

/* ---------- step 11 — build an uptrend (quiz) ---------- */

export const BUILD_INITIAL = { p1: 46, p2: 40, p3: 34 };

/* ---------- step 12 — read it live (final quiz, 3 rounds) ---------- */

export const SP_ROUNDS: Array<{ prompt: string; kinds: TrendId[]; ans: number; hint: string }> = [
  { prompt: "Tap the downtrend", kinds: ["up", "side", "down", "side"], ans: 2, hint: "The downtrend steps lower and lower to the right." },
  { prompt: "Tap the uptrend", kinds: ["side", "down", "up", "down"], ans: 2, hint: "The uptrend climbs higher and higher to the right." },
  { prompt: "Tap the sideways market", kinds: ["up", "side", "down", "up"], ans: 1, hint: "The sideways chart holds a flat range." },
];

/* ---------- completion screen ---------- */

export const RECAP_ITEMS = ["Price & time axes", "Reading points", "The line chart", "Up, down, sideways", "Line vs candle"];
