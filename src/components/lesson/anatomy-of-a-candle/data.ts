export type OhlcKey = "open" | "high" | "low" | "close";
export type WickKey = "upper" | "lower";
export type ShapeId = "body" | "upper" | "lower" | "doji";
export type Timeframe = "min" | "hour" | "day";

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Introduction", kind: "learn" },
  { title: "What is a candle?", kind: "learn" },
  { title: "Quick check", kind: "quiz" },
  { title: "The four prices", kind: "learn" },
  { title: "Label the candle", kind: "quiz" },
  { title: "The body & colour", kind: "learn" },
  { title: "Who won?", kind: "quiz" },
  { title: "The wicks", kind: "learn" },
  { title: "Find the wick", kind: "quiz" },
  { title: "Reading the shape", kind: "learn" },
  { title: "Match the meaning", kind: "quiz" },
  { title: "Build a candle", kind: "quiz" },
  { title: "Spot it", kind: "quiz" },
  { title: "Complete", kind: "done" },
];

export const TOTAL_STEPS = SECTION_META.length - 1; // last index (13)

export const TIMEFRAME_WORDS: Record<Timeframe, string> = {
  min: "one minute",
  hour: "one hour",
  day: "one trading day",
};

export const MCQ_QUESTION = {
  question: "What does a single candlestick show you?",
  options: [
    {
      text: "Everything price did during one time period",
      correct: true,
      why: "Exactly — one candle packs the open, high, low and close of a single slice of time.",
    },
    {
      text: "The price at one exact instant",
      correct: false,
      why: "A single instant would just be a dot. A candle summarises a whole period of movement.",
    },
    {
      text: "How much profit a trader made",
      correct: false,
      why: "Candles show price, not anyone's profit or loss.",
    },
    {
      text: "The total value of the company",
      correct: false,
      why: "That's market cap. A candle only shows how price moved over time.",
    },
  ],
};

export const OHLC_INFO: Record<OhlcKey, { name: string; dot: string; text: string }> = {
  open: { name: "Open", dot: "#94a3b8", text: "The first traded price when the period began." },
  high: { name: "High", dot: "#22c55e", text: "The highest price reached at any point in the period." },
  low: { name: "Low", dot: "#ef4444", text: "The lowest price reached during the period." },
  close: { name: "Close", dot: "#88c9f7", text: "The final price when the period ended — the one traders watch most." },
};

export const WICK_INFO: Record<WickKey, string> = {
  upper: "Buyers pushed price all the way up here, but sellers slammed it back down. The tip is the session HIGH.",
  lower: "Sellers drove price down to here, then buyers stepped in and lifted it. The tip is the session LOW.",
};

export const WHO_WON_ROUNDS: Array<{ o: number; h: number; l: number; c: number; ans: "bull" | "bear"; hint: string }> = [
  { o: 32, h: 78, l: 26, c: 70, ans: "bull", hint: "The close (70) landed well above the open (32) — buyers drove it up all session." },
  { o: 74, h: 82, l: 30, c: 40, ans: "bear", hint: "Price opened at 74 and closed down at 40 — sellers were firmly in control." },
  { o: 47, h: 64, l: 30, c: 55, ans: "bull", hint: "A slimmer green body: the close just edged above the open. Buyers won — barely." },
];

export type ShapeDef = { id: ShapeId; o: number; h: number; l: number; c: number; name: string; title: string; sub: string };
export const READING_SHAPES: ShapeDef[] = [
  { id: "body", o: 26, h: 84, l: 22, c: 80, name: "Big green body", title: "Strong buying pressure", sub: "A large body with small wicks — one side dominated the whole session. Here, buyers ran the show." },
  { id: "upper", o: 46, h: 92, l: 40, c: 52, name: "Long upper wick", title: "Sellers rejected higher prices", sub: "Price spiked up, then got sold back down hard. Buyers tried and failed to hold the highs." },
  { id: "lower", o: 54, h: 62, l: 12, c: 60, name: "Long lower wick", title: "Buyers defended lower prices", sub: "Price dropped, then got bought straight back up. Sellers tried and failed to hold the lows." },
  { id: "doji", o: 50, h: 74, l: 26, c: 51, name: "Doji (tiny body)", title: "Indecision — a stand-off", sub: "Open and close are almost equal. Buyers and sellers fought to a draw. Nobody won." },
];

export const MATCH_PAIRS: ShapeDef[] = [
  { id: "lower", o: 56, h: 62, l: 14, c: 60, name: "Long lower wick", title: "Buyers rejected lower prices", sub: "Price dropped, then got bought back up." },
  { id: "upper", o: 46, h: 92, l: 40, c: 50, name: "Long upper wick", title: "Sellers rejected higher prices", sub: "Price spiked, then got sold back down." },
  { id: "body", o: 28, h: 82, l: 24, c: 78, name: "Big green body", title: "Strong buying pressure", sub: "A one-sided session — bulls dominated." },
  { id: "doji", o: 50, h: 72, l: 28, c: 51, name: "Doji (tiny body)", title: "Indecision — a tug of war", sub: "Open and close nearly equal. Nobody won." },
];

export const SPOT_IT_ROUNDS: Array<{
  prompt: string;
  candles: Array<{ o: number; h: number; l: number; c: number }>;
  ans: number;
  hint: string;
}> = [
  {
    prompt: "Tap the bullish candle",
    candles: [
      { o: 70, h: 78, l: 34, c: 42 },
      { o: 36, h: 74, l: 30, c: 68 },
      { o: 60, h: 66, l: 40, c: 46 },
      { o: 55, h: 60, l: 30, c: 44 },
    ],
    ans: 1,
    hint: "A bullish candle closes above where it opened — the green one.",
  },
  {
    prompt: "Tap the candle with the longest upper wick",
    candles: [
      { o: 40, h: 58, l: 34, c: 52 },
      { o: 45, h: 92, l: 42, c: 52 },
      { o: 30, h: 80, l: 26, c: 74 },
      { o: 55, h: 62, l: 20, c: 58 },
    ],
    ans: 1,
    hint: "The upper wick is the line above the body — look for the tallest one.",
  },
  {
    prompt: "Tap the doji — near-total indecision",
    candles: [
      { o: 30, h: 82, l: 26, c: 76 },
      { o: 62, h: 70, l: 30, c: 40 },
      { o: 50, h: 74, l: 28, c: 51 },
      { o: 40, h: 60, l: 34, c: 55 },
    ],
    ans: 2,
    hint: "A doji has almost no body — the open and close are nearly equal.",
  },
];

export const RECAP_ITEMS = ["What a candle is", "The four prices", "Body & colour", "The wicks", "Reading the shape"];
