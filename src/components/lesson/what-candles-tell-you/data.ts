export type WickKey = "upper" | "lower";
export type SignalId = "hammer" | "star" | "doji" | "maru";
export type ContextMode = "bottom" | "top";
export type PredictAns = "up" | "down";

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Introduction", kind: "learn" },
  { title: "The tug-of-war", kind: "learn" },
  { title: "Quick check", kind: "quiz" },
  { title: "Conviction", kind: "learn" },
  { title: "Read the momentum", kind: "quiz" },
  { title: "Wicks = rejection", kind: "learn" },
  { title: "Predict the move", kind: "quiz" },
  { title: "Named signals", kind: "learn" },
  { title: "Name that candle", kind: "quiz" },
  { title: "Context", kind: "learn" },
  { title: "Match the meaning", kind: "quiz" },
  { title: "Build a hammer", kind: "quiz" },
  { title: "Read it live", kind: "quiz" },
  { title: "Complete", kind: "done" },
];

export const TOTAL_STEPS = SECTION_META.length - 1; // last index (13)

export const MCQ_QUESTION = {
  question: "A candle with a big green body tells you…",
  options: [
    {
      text: "Buyers were strongly in control this session",
      correct: true,
      why: "Right — a large body means one side pushed hard and won by a wide margin. Green = buyers.",
    },
    {
      text: "The price never moved",
      correct: false,
      why: "A big body is the opposite of no movement — it means price travelled a long way from open to close.",
    },
    {
      text: "Sellers were winning",
      correct: false,
      why: "Green means the close was above the open, so buyers won — not sellers.",
    },
    {
      text: "The market was undecided",
      correct: false,
      why: "Indecision looks like a tiny body (a doji). A big body signals conviction, not doubt.",
    },
  ],
};

export type Candle = { o: number; h: number; l: number; c: number };

export const MOMENTUM_CANDLES: Candle[] = [
  { o: 46, h: 60, l: 40, c: 53 },
  { o: 26, h: 88, l: 22, c: 84 },
  { o: 50, h: 66, l: 44, c: 42 },
  { o: 42, h: 72, l: 38, c: 58 },
];
export const MOMENTUM_ANS = 1;
export const MOMENTUM_CORRECT_TEXT = "Yes — the tallest green body is the most one-sided, confident move.";
export const MOMENTUM_WRONG_TEXT = "Look for the LONGEST green body — that's the strongest push.";

export const WICK_MEANING: Record<WickKey, string> = {
  upper:
    "Buyers drove price up to the tip, then sellers slammed it back down before the close. Sellers won that fight — a warning for bulls.",
  lower:
    "Sellers pushed price down to the tip, then buyers hauled it back up before the close. Buyers won that fight — strength for bulls.",
};

export type PredictRound = { o: number; h: number; l: number; c: number; ans: PredictAns; hint: string };
export const PREDICT_ROUNDS: PredictRound[] = [
  {
    o: 60,
    h: 66,
    l: 22,
    c: 64,
    ans: "up",
    hint: "A long lower wick (a hammer): buyers rejected the lows hard. Momentum leans UP.",
  },
  {
    o: 44,
    h: 90,
    l: 40,
    c: 46,
    ans: "down",
    hint: "A long upper wick (a shooting star): sellers rejected the highs. Momentum leans DOWN.",
  },
];

export type SignalDef = { id: SignalId; o: number; h: number; l: number; c: number; name: string; title: string; sub: string };
export const SIGNAL_CARDS: SignalDef[] = [
  {
    id: "hammer",
    o: 70,
    h: 78,
    l: 30,
    c: 75,
    name: "Hammer",
    title: "Hammer — buyers fought back",
    sub: "Small body up top, long lower wick. Sellers pushed down but buyers slammed it back. Often a bullish reversal after a fall.",
  },
  {
    id: "star",
    o: 44,
    h: 90,
    l: 40,
    c: 46,
    name: "Shooting star",
    title: "Shooting star — sellers fought back",
    sub: "Small body down low, long upper wick. Buyers pushed up but sellers crushed it back. Often a bearish reversal after a climb.",
  },
  {
    id: "doji",
    o: 50,
    h: 76,
    l: 24,
    c: 51,
    name: "Doji",
    title: "Doji — a stand-off",
    sub: "Open and close nearly equal. Neither side won. Signals hesitation — the current trend may be running out of steam.",
  },
  {
    id: "maru",
    o: 24,
    h: 82,
    l: 24,
    c: 82,
    name: "Marubozu",
    title: "Marubozu — total control",
    sub: "A full body with almost no wicks. One side dominated from open to close. Pure, uninterrupted momentum.",
  },
];

export type IdentifyRound = { prompt: string; candles: Candle[]; ans: number; hint: string };
export const IDENTIFY_ROUNDS: IdentifyRound[] = [
  {
    prompt: "Tap the hammer",
    candles: [
      { o: 24, h: 82, l: 24, c: 82 },
      { o: 70, h: 78, l: 30, c: 74 },
      { o: 42, h: 90, l: 38, c: 46 },
      { o: 30, h: 80, l: 26, c: 72 },
    ],
    ans: 1,
    hint: "The hammer has a small body up top and a long lower wick.",
  },
  {
    prompt: "Tap the doji",
    candles: [
      { o: 28, h: 82, l: 24, c: 78 },
      { o: 68, h: 76, l: 28, c: 72 },
      { o: 50, h: 74, l: 26, c: 51 },
      { o: 44, h: 88, l: 40, c: 48 },
    ],
    ans: 2,
    hint: "The doji has almost no body — open and close are nearly equal.",
  },
];

export type ContextInfo = { candle: Candle; series: number[]; title: string; desc: string };
export const CONTEXT_INFO: Record<"none" | ContextMode, ContextInfo> = {
  none: {
    candle: { o: 50, h: 74, l: 26, c: 51 },
    series: [55, 55, 55, 55, 55, 55, 55],
    title: "Pick a context",
    desc: "The same candle shape means different things depending on the trend it appears in. Choose a context to see how.",
  },
  bottom: {
    candle: { o: 60, h: 66, l: 22, c: 64 },
    series: [80, 72, 64, 55, 47, 38, 30],
    title: "After a fall → opportunity",
    desc: "Price dropped steadily, then this hammer appeared at the bottom. Sellers pushed lower but buyers slammed it back. It hints the downtrend may be ending — a bullish signal.",
  },
  top: {
    candle: { o: 44, h: 90, l: 40, c: 46 },
    series: [30, 38, 46, 55, 63, 72, 80],
    title: "After a climb → warning",
    desc: "Price rallied hard, then this shooting star appeared at the top. Buyers tried to push higher but got rejected. It hints the uptrend may be exhausted — a bearish signal.",
  },
};

export type MatchDef = { id: SignalId; o: number; h: number; l: number; c: number; name: string; title: string; sub: string };
export const MATCH_PAIRS: MatchDef[] = [
  {
    id: "hammer",
    o: 70,
    h: 78,
    l: 30,
    c: 75,
    name: "Hammer",
    title: "Bullish reversal",
    sub: "Buyers defended a low — the fall may be ending.",
  },
  {
    id: "star",
    o: 44,
    h: 90,
    l: 40,
    c: 46,
    name: "Shooting star",
    title: "Bearish reversal",
    sub: "Sellers rejected a high — the climb may be ending.",
  },
  {
    id: "doji",
    o: 50,
    h: 76,
    l: 24,
    c: 51,
    name: "Doji",
    title: "Indecision",
    sub: "Neither side won — the trend may pause.",
  },
  {
    id: "maru",
    o: 24,
    h: 82,
    l: 24,
    c: 82,
    name: "Marubozu",
    title: "Strong momentum",
    sub: "One side had total control — trend continues.",
  },
];
export const MATCH_RIGHT_ORDER: SignalId[] = ["star", "maru", "doji", "hammer"];

export type BuildHammerState = { o: number; h: number; l: number; c: number; done: boolean };
export const BUILD_HAMMER_INITIAL: BuildHammerState = { o: 62, h: 70, l: 40, c: 58, done: false };
export const BUILD_HAMMER_STORY =
  "Sellers crushed price down, then buyers dragged it all the way back to close near the high.";

export const FINAL_SPOT_ROUNDS: IdentifyRound[] = [
  {
    prompt: "Tap the candle showing the strongest bullish momentum",
    candles: [
      { o: 50, h: 74, l: 26, c: 51 },
      { o: 24, h: 82, l: 24, c: 82 },
      { o: 46, h: 60, l: 40, c: 53 },
      { o: 70, h: 78, l: 30, c: 74 },
    ],
    ans: 1,
    hint: "The marubozu — a full body with no wicks — is pure one-sided momentum.",
  },
  {
    prompt: "Tap the shooting star (rejection at the top)",
    candles: [
      { o: 70, h: 78, l: 30, c: 74 },
      { o: 24, h: 82, l: 24, c: 82 },
      { o: 44, h: 90, l: 40, c: 46 },
      { o: 50, h: 76, l: 24, c: 51 },
    ],
    ans: 2,
    hint: "The shooting star has a small body at the bottom and a long upper wick.",
  },
  {
    prompt: "Tap the doji (buyers and sellers balanced)",
    candles: [
      { o: 28, h: 82, l: 24, c: 78 },
      { o: 70, h: 78, l: 30, c: 74 },
      { o: 50, h: 76, l: 24, c: 51 },
      { o: 44, h: 90, l: 40, c: 46 },
    ],
    ans: 2,
    hint: "The doji has an almost invisible body — open and close nearly match.",
  },
];

export const RECAP_ITEMS = ["Buyers vs sellers", "Conviction & momentum", "Rejection wicks", "Named signals", "Reading context"];
