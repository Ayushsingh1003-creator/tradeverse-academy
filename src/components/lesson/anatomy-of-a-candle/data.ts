import type { CandleBar } from "./geometry";

/* ================================================================
 * Scene roster — ported from the design prototype's SC array (21 scenes).
 * ================================================================ */

export type SceneType = "teach" | "mcq" | "tap" | "candle" | "summary";

export const SCENE_TYPES: SceneType[] = [
  "teach", // 0 intro
  "teach", // 1 hook
  "mcq", // 2 intuition
  "teach", // 3 whyCandle
  "teach", // 4 fourpoints
  "tap", // 5 tapClose
  "tap", // 6 tapLow
  "teach", // 7 anatomy
  "teach", // 8 bullbear
  "mcq", // 9 bullbearQuiz
  "teach", // 10 bodyTeach
  "candle", // 11 bodyCompare
  "teach", // 12 wicksTeach
  "teach", // 13 wickMeaning
  "tap", // 14 tapRejection
  "teach", // 15 readingTeach
  "mcq", // 16 readingQuiz
  "candle", // 17 bossIdentify
  "tap", // 18 bossTap
  "mcq", // 19 bossDecide
  "summary", // 20 summary
];

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // 0
  { title: "One bar, four prices", kind: "learn" }, // 1
  { title: "Make a prediction", kind: "quiz" }, // 2
  { title: "Why candlesticks", kind: "learn" }, // 3
  { title: "Open, High, Low, Close", kind: "learn" }, // 4
  { title: "Tap the close", kind: "quiz" }, // 5
  { title: "Tap the low", kind: "quiz" }, // 6
  { title: "Body and wicks", kind: "learn" }, // 7
  { title: "Bullish vs bearish", kind: "learn" }, // 8
  { title: "Which is bearish?", kind: "quiz" }, // 9
  { title: "Body size = conviction", kind: "learn" }, // 10
  { title: "Strongest buying?", kind: "quiz" }, // 11
  { title: "Wicks show rejection", kind: "learn" }, // 12
  { title: "Long vs short wicks", kind: "learn" }, // 13
  { title: "Tap the rejection", kind: "quiz" }, // 14
  { title: "Reading one candle", kind: "learn" }, // 15
  { title: "Read the candle", kind: "quiz" }, // 16
  { title: "Match the story", kind: "quiz" }, // 17
  { title: "An unseen candle", kind: "quiz" }, // 18
  { title: "Read the whole candle", kind: "quiz" }, // 19
  { title: "Complete", kind: "done" }, // 20
];

export const TOTAL_STEPS = SECTION_META.length - 1; // 20

/* ================================================================
 * Demo candles — ported from the design's A/B/C/BOSS/WHY fields. Each
 * already carries realistic, asymmetric wick/body proportions (this lesson
 * shows one or two fixed candles per scene, not a scrolling multi-bar
 * series, so it doesn't have the trend-lines rebuild's "uniform staircase"
 * problem — no reshaping pass needed here beyond the couple of paired demo
 * candles noted below that were literal mirror-images of each other).
 * ================================================================ */

/** Main demo candle: bullish, both wicks. */
export const A: CandleBar = { o: 22150, h: 22460, l: 22030, c: 22380 };
export const A_MIN = 21980;
export const A_MAX = 22520;

/** Rejection candle: long upper wick — sellers rejected the highs. */
export const B: CandleBar = { o: 22200, h: 22470, l: 22170, c: 22258 };
export const B_MIN = 22110;
export const B_MAX = 22520;

/** Hammer: long lower wick — buyers defended the lows. */
export const C: CandleBar = { o: 22350, h: 22432, l: 22180, c: 22398 };
export const C_MIN = 22120;
export const C_MAX = 22480;

/** Unseen "boss" candle: bullish, modest wicks. */
export const BOSS: CandleBar = { o: 22240, h: 22470, l: 22200, c: 22420 };
export const BOSS_MIN = 22140;
export const BOSS_MAX = 22520;

/** Path the hook scene's candle animates through — its start/end already match A exactly. */
export const HOOK_PATH: number[] = [22150, 22095, 22150, 22075, 22030, 22080, 22150, 22095, 22230, 22310, 22380, 22460, 22415, 22380];

/** whyCandle scene's 8-bar race dataset (line-chart-of-closes vs full candles). */
export const WHY: CandleBar[] = [
  { o: 22120, h: 22160, l: 22095, c: 22145 },
  { o: 22145, h: 22212, l: 22130, c: 22190 },
  { o: 22190, h: 22202, l: 22138, c: 22160 },
  { o: 22160, h: 22262, l: 22150, c: 22245 },
  { o: 22245, h: 22322, l: 22228, c: 22300 },
  { o: 22300, h: 22312, l: 22238, c: 22258 },
  { o: 22258, h: 22352, l: 22248, c: 22335 },
  { o: 22335, h: 22402, l: 22318, c: 22385 },
];
export const WHY_MIN = 22080;
export const WHY_MAX = 22420;

/* ---------- S0 intro ---------- */

export const INTRO_KICKER = "Candlestick Anatomy";
export const INTRO_TITLE_LINE1 = "Every candle";
export const INTRO_TITLE_LINE2 = "tells a story.";
export const INTRO_SUBTITLE =
  "Four prices, one body, two wicks. Learn to read a single candlestick and you can see the fight between buyers and sellers at a glance.";
export const INTRO_CHIPS = ["The four price points", "Body & wicks", "Bullish vs bearish", "What wicks reveal", "Reading one candle"];

/* ---------- S1 hook ---------- */

export const HOOK = {
  kicker: "Candlesticks · Lesson",
  title: "One bar holds four prices",
  prompt:
    "Watch this candle draw itself. A single candlestick packs a whole time period — say one day — into one shape. From it you can read where price opened, how high and low it went, and where it closed. That is four prices in one glance.",
};

/* ---------- S2 intuition (mcq) ---------- */

export const INTUITION_MCQ = {
  kicker: "Intuition check",
  title: "Make a prediction first",
  prompt: "This candle is green — it closed higher than it opened. Before we define anything, who do you think was in control of price during this period?",
  options: ["The sellers — they pushed price down", "The buyers — they pushed price up to close higher", "Nobody — it was a perfect tie"],
  correctIndex: 1,
  fb: {
    hint: "Green means the closing price ended ABOVE the opening price. If price finished higher, which side won the tug-of-war?",
    correct: "The buyers. A green candle closes above its open — price finished higher, so buyers were in control.",
    wrong: "Green means it closed higher than it opened, so buyers won this period. Red would mean sellers were in control.",
  },
};

/* ---------- S3 whyCandle ---------- */

export const WHY_CANDLE = {
  kicker: "Why candlesticks",
  title: "A line shows one price. A candle shows four",
  prompt:
    "A line chart only plots one price per period — usually the close — so it hides the fight that happened along the way. A candlestick shows the open, the high, the low and the close together, so you can see who pushed, how far, and who won.",
};

/* ---------- S4 fourpoints ---------- */

export const FOUR_POINTS = {
  kicker: "The four price points",
  title: "Open, High, Low, Close (OHLC)",
  prompt:
    "Four prices define every candle. The OPEN is where the period started, the CLOSE where it ended. The HIGH is the highest price reached, the LOW the lowest. On a green candle the close sits above the open; the wicks mark the high and low extremes.",
};

/* ---------- S5 tapClose ---------- */

export const TAP_CLOSE = {
  kicker: "Your turn",
  title: "Tap the closing price",
  prompt: "This is a green (bullish) candle. Tap the level where price CLOSED — where the period ended.",
  priceMin: 22345,
  priceMax: 22425,
  fb: {
    hint: "On a green candle the close is the TOP of the solid body — not the tip of the thin wick above it.",
    correct: "That is the close — the top of the body on a green candle. Price ended the period there.",
    wrong: "The thin wick tip is the HIGH, not the close. On a green candle the close is the top of the solid body — highlighted now.",
  },
};

/* ---------- S6 tapLow ---------- */

export const TAP_LOW = {
  kicker: "Your turn",
  title: "Tap the lowest price",
  prompt: "Same candle. Tap the LOW — the lowest price this candle ever traded.",
  priceMax: 22085,
  fb: {
    hint: "The low is the very bottom of the lower wick — deeper than the body. Tap the tip of the thin line below.",
    correct: "That is the low — the bottom tip of the lower wick, the cheapest price of the period.",
    wrong: "The bottom of the body is the OPEN. The low is the tip of the lower wick, further down — highlighted now.",
  },
};

/* ---------- S7 anatomy ---------- */

export const ANATOMY_TEACH = {
  kicker: "Single candle anatomy",
  title: "Body and wicks",
  prompt:
    "A candle has two parts. The thick BODY spans the open-to-close range — the net move. The thin WICKS (or shadows) above and below reach out to the high and low — the extremes price touched but could not hold. Body = the outcome; wicks = the fight.",
};

/* ---------- S8 bullbear ---------- */

export const BULLBEAR = {
  kicker: "Bullish vs bearish",
  title: "Green up, red down",
  prompt:
    "Colour comes from the open-close relationship. A BULLISH (green) candle closes above its open — buyers won. A BEARISH (red) candle closes below its open — sellers won. Same four points, opposite story, told by which end the body closes at.",
  bull: { o: 22150, h: 22440, l: 22090, c: 22400 } satisfies CandleBar,
  // A hand-varied bearish partner — not a mirror-image of `bull` (a perfect
  // mirror reads as a synthetic "textbook" pair rather than two independent
  // sessions), asymmetric upper/lower wicks instead.
  bear: { o: 22400, h: 22462, l: 22095, c: 22150 } satisfies CandleBar,
};

/* ---------- S9 bullbearQuiz (mcq) ---------- */

export const BULLBEAR_QUIZ = {
  kicker: "Check",
  title: "Which candle is bearish?",
  prompt: "Two candles below. Which one is bearish — the one where sellers won and price closed lower than it opened?",
  options: ["Candle A — the green one", "Candle B — the red one, close below open", "Both are bearish"],
  correctIndex: 1,
  fb: {
    hint: "Bearish = close BELOW open = red. Which candle has its body closing at the bottom?",
    correct: "Candle B — red, with its close below its open. Sellers were in control.",
    wrong: "Candle B is the bearish one: red, closing below its open. The green candle A is bullish.",
  },
  candleA: { o: 22270, h: 22350, l: 22240, c: 22330 } satisfies CandleBar,
  candleB: { o: 22420, h: 22460, l: 22070, c: 22110 } satisfies CandleBar,
};

/* ---------- S10 bodyTeach ---------- */

export const BODY_TEACH = {
  kicker: "The body",
  title: "Body size = conviction",
  prompt:
    "The body measures how decisively price moved. A LARGE body (open and close far apart) means one side dominated — strong conviction. A SMALL body means buyers and sellers roughly tied — indecision. Read body size relative to the candle's full range.",
  big: { o: 22120, h: 22420, l: 22080, c: 22400 } satisfies CandleBar,
  // Small body, deliberately asymmetric wicks (not a mirrored doji) so it
  // reads as a real session rather than a diagram.
  small: { o: 22270, h: 22430, l: 22175, c: 22290 } satisfies CandleBar,
};

/* ---------- S11 bodyCompare (candle) ---------- */

export type CandleKind = "bull" | "hammer" | "bear" | "doji";
export const CANDLE_OPTIONS: Array<{ kind: CandleKind; label: string }> = [
  { kind: "bull", label: "Big green body" },
  { kind: "hammer", label: "Long lower wick" },
  { kind: "bear", label: "Heavy red body" },
  { kind: "doji", label: "Flat doji" },
];

export const BODY_COMPARE = {
  kicker: "Check",
  title: "Which shows the strongest buying?",
  prompt: "All four closed the period. Which single candle shows buyers in firm control with the most conviction?",
  correctIndex: 0,
  fb: {
    hint: "Strong conviction = a big body in the buyers’ direction with little wick fighting back. Which is a large, full green body?",
    correct: "The big strong-green candle — a large body, buyers dominant the whole period. Maximum conviction.",
    wrong: "A large full-green body shows the strongest buying. A doji or a small body means indecision, not conviction.",
  },
};

/* ---------- S12 wicksTeach ---------- */

export const WICKS_TEACH = {
  kicker: "The wicks",
  title: "Wicks show rejection",
  prompt:
    "Wicks are where price went but could not stay. A long UPPER wick means price pushed up then got sold back down — sellers rejected the highs. A long LOWER wick means price dropped then got bought back up — buyers rejected the lows. Long wick = strong rejection.",
  up: { o: 22200, h: 22470, l: 22180, c: 22250 } satisfies CandleBar,
};

/* ---------- S13 wickMeaning ---------- */

export const WICK_MEANING = {
  kicker: "Reading wicks",
  title: "Long vs short wicks",
  prompt:
    "A short wick means price closed near its extreme — that side held control into the end. A long wick means price was pushed to an extreme and then forced back — a failed attempt. The longer the wick, the more forceful the rejection at that price.",
  short: { o: 22200, h: 22470, l: 22185, c: 22452 } satisfies CandleBar,
  long: { o: 22200, h: 22470, l: 22180, c: 22250 } satisfies CandleBar,
};

/* ---------- S14 tapRejection ---------- */

export const TAP_REJECTION = {
  kicker: "Your turn",
  title: "Tap where price was rejected",
  prompt: "This candle has a long upper wick. Tap the area where price pushed up but got sold back down — where sellers rejected the highs.",
  priceMin: 22390,
  fb: {
    hint: "Rejection happened at the far tip of the long wick — the high price that could not hold. Tap the top of the thin upper line, not the body.",
    correct: "That is the rejection — price spiked up there and sellers slammed it back down, leaving a long upper wick.",
    wrong: "The body is where price settled. The rejection is at the tip of the long upper wick, up high — highlighted now.",
  },
};

/* ---------- S15 readingTeach ---------- */

export const READING_TEACH = {
  kicker: "Reading a single candle",
  title: "The story of one candle",
  prompt:
    "Put it together and every candle answers three questions. WHO controlled it? — the colour and body. HOW FAR did price move? — the body and range. WHERE was price rejected? — the wicks. Read those and a single candle tells you the balance of buyer vs seller pressure.",
  questions: [
    { text: "WHO? → colour + body", color: "#88C9F7", price: 22300 },
    { text: "HOW FAR? → the range", color: "#F7C325", price: 22240 },
    { text: "REJECTED? → the wicks", color: "#ff8f8f", price: 22180 },
  ],
};

/* ---------- S16 readingQuiz (mcq) ---------- */

export const READING_QUIZ = {
  kicker: "Read the candle",
  title: "What story does this candle tell?",
  prompt: "This candle has a small green body sitting up top and a long lower wick. What most likely happened during the period?",
  options: [
    "Sellers dominated the whole period",
    "Price dropped, then buyers rejected the lows and pushed it back up to close green",
    "Nothing moved — a flat, dead period",
  ],
  correctIndex: 1,
  fb: {
    hint: "A long LOWER wick means price fell then got bought back. The green body up top means it recovered to close higher. Who defended?",
    correct: "Sellers pushed price down, then buyers stepped in, rejected the lows, and drove it back up to close green. A bullish hammer.",
    wrong: "The long lower wick plus a green body means buyers rejected the lows and pushed price back up. That is a hammer, not seller control.",
  },
};

/* ---------- S17 bossIdentify (candle) ---------- */

export const BOSS_IDENTIFY = {
  kicker: "Market Replay · Boss",
  title: "Match the story to the candle",
  prompt: "On an unseen chart you spot a period where buyers stepped in at lower prices and bought aggressively, driving price back up. Which candle shape matches that story?",
  correctIndex: 1,
  fb: {
    hint: "Buyers stepping in at the lows leaves a long LOWER wick with the close pushed back up near the top. Which candle is that?",
    correct: "The long-lower-wick candle (a hammer). Price dropped, buyers bought aggressively at the lows, and drove it back up to close near the top.",
    wrong: "A long lower wick is the sign of buyers stepping in at the lows and buying aggressively. A heavy red or a doji tells a different story — the hammer is the match.",
  },
};

/* ---------- S18 bossTap ---------- */

export const BOSS_TAP = {
  kicker: "Market Replay · Boss",
  title: "An unseen candle",
  prompt: "Last job. Here is a fresh candle. Tap the price where it CLOSED — where this period actually ended.",
  priceMin: 22385,
  priceMax: 22455,
  fb: {
    hint: "It is a green candle, so the close is the TOP of the solid body — below the thin high wick.",
    correct: "Spot on — the close is the top of the green body. You can read a candle cold now.",
    wrong: "The close on a green candle is the top of the body, just below the high wick — highlighted now.",
  },
};

/* ---------- S19 bossDecide (mcq) ---------- */

export const BOSS_DECIDE = {
  kicker: "Market Replay · Boss",
  title: "Read the whole candle",
  prompt: "Your boss candle: a green body, closing near its high, with only tiny wicks. What is the cleanest read?",
  options: ["Sellers were in firm control", "Total indecision — a coin flip", "Buyers controlled it start to finish, closing strong with little rejection"],
  correctIndex: 2,
  fb: {
    hint: "Green body + close near the high + tiny wicks = one side ran it with almost no pushback. Which side, and how convincingly?",
    correct: "Buyers ran it start to finish — a large green body closing near the high with tiny wicks means strong conviction and little rejection.",
    wrong: "A big green body closing near the high with tiny wicks is decisive buyer control, not indecision or seller strength.",
  },
};

/* ---------- S20 summary ---------- */

export const BADGE_TITLE = "You can read a candle now";
export const BADGE_SUBTITLE = "You can dissect any candle on sight — its four prices, its body, and what its wicks reveal. Onto reading patterns next.";
export const CHECKLIST_ITEMS = [
  "What a candlestick is & why we use it",
  "Open, High, Low, Close",
  "Body = the net move",
  "Wicks = rejection & the fight",
  "Bullish (green) vs bearish (red)",
  "Body size = conviction",
  "Long vs short wicks",
  "Reading one candle’s story",
];
