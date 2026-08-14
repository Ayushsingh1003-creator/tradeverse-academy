import type { CandleBar, TrendlineAnchor } from "./geometry";

/* ================================================================
 * Scene roster — mirrors the design prototype's SC array (26 scenes).
 * SCENE_TYPES drives readiness/scoring logic; SECTION_META drives the
 * header badge + progress bar, the same way every sibling lesson's
 * data.ts does. Adds "dragline"/"dragchannel" on top of the scene types
 * support-resistance/data.ts already defines.
 * ================================================================ */

export type SceneType = "teach" | "mcq" | "tap" | "tapMulti" | "dragline" | "dragchannel" | "spot" | "candle" | "summary";

export const SCENE_TYPES: SceneType[] = [
  "teach", // 0 intro
  "teach", // 1 hook
  "mcq", // 2 intuition
  "teach", // 3 structure
  "tapMulti", // 4 tapStructure
  "teach", // 5 whatis
  "teach", // 6 types
  "mcq", // 7 typesQuiz
  "teach", // 8 drawTeach
  "dragline", // 9 dragLine
  "teach", // 10 validTeach
  "spot", // 11 spot
  "teach", // 12 strengthTeach
  "mcq", // 13 strengthCompare
  "teach", // 14 breakoutTeach
  "candle", // 15 breakoutPredict
  "teach", // 16 rejectionTeach
  "tap", // 17 tapRejection
  "teach", // 18 channelTeach
  "dragchannel", // 19 dragChannel
  "teach", // 20 mtfTeach
  "mcq", // 21 mtfQuiz
  "teach", // 22 confluenceTeach
  "tap", // 23 bossTap
  "mcq", // 24 bossDecide
  "summary", // 25 summary
];

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // 0
  { title: "Price climbs a staircase", kind: "learn" }, // 1
  { title: "Make a prediction", kind: "quiz" }, // 2
  { title: "Higher highs, higher lows", kind: "learn" }, // 3
  { title: "Mark the higher lows", kind: "quiz" }, // 4
  { title: "A diagonal line of support", kind: "learn" }, // 5
  { title: "Three kinds of trend", kind: "learn" }, // 6
  { title: "How would you draw this?", kind: "quiz" }, // 7
  { title: "2 to draw, 3 to confirm", kind: "learn" }, // 8
  { title: "Draw the trendline", kind: "quiz" }, // 9
  { title: "What makes a line valid", kind: "learn" }, // 10
  { title: "Spot the mistake", kind: "quiz" }, // 11
  { title: "Strong vs weak lines", kind: "learn" }, // 12
  { title: "Pick the stronger trendline", kind: "quiz" }, // 13
  { title: "When the line breaks", kind: "learn" }, // 14
  { title: "Predict the candle", kind: "quiz" }, // 15
  { title: "When the line holds", kind: "learn" }, // 16
  { title: "Tap the rejection", kind: "quiz" }, // 17
  { title: "Add a parallel line", kind: "learn" }, // 18
  { title: "Complete the channel", kind: "quiz" }, // 19
  { title: "Higher timeframe wins", kind: "learn" }, // 20
  { title: "Two lines disagree", kind: "quiz" }, // 21
  { title: "Where signals stack", kind: "learn" }, // 22
  { title: "Market Replay: the line", kind: "quiz" }, // 23
  { title: "Market Replay: the decision", kind: "quiz" }, // 24
  { title: "Complete", kind: "done" }, // 25
];

export const TOTAL_STEPS = SECTION_META.length - 1; // 25

/* ================================================================
 * Candle datasets — ported from the design's UP/DN/BRK/BOSS fields, then
 * hand-varied so wicks read as organic/asymmetric (real charts don't have
 * every candle's wick sit at a similar proportion of its body) instead of
 * the design's fairly uniform staircase shapes. Every price the interaction
 * logic depends on — trendline touch points, tap-validator ranges, the
 * break/reject candle — is preserved exactly; only the "other" side of each
 * candle's wick was reshaped.
 * ================================================================ */

export const UP_MIN = 21980;
export const UP_MAX = 22650;
export const UP: CandleBar[] = [
  { o: 22110, h: 22190, l: 22057, c: 22140 },
  { o: 22140, h: 22193, l: 22057, c: 22105 },
  { o: 22105, h: 22135, l: 22052, c: 22095 },
  { o: 22095, h: 22231, l: 22075, c: 22185 },
  { o: 22185, h: 22262, l: 22172, c: 22245 },
  { o: 22245, h: 22330, l: 22225, c: 22300 },
  { o: 22300, h: 22335, l: 22277, c: 22315 },
  { o: 22315, h: 22322, l: 22219, c: 22245 },
  { o: 22245, h: 22260, l: 22191, c: 22210 },
  { o: 22210, h: 22222, l: 22195, c: 22200 },
  { o: 22200, h: 22225, l: 22178, c: 22208 },
  { o: 22208, h: 22332, l: 22186, c: 22285 },
  { o: 22285, h: 22448, l: 22264, c: 22360 },
  { o: 22360, h: 22441, l: 22351, c: 22420 },
  { o: 22420, h: 22470, l: 22389, c: 22430 },
  { o: 22430, h: 22442, l: 22356, c: 22365 },
  { o: 22365, h: 22375, l: 22299, c: 22335 },
  { o: 22335, h: 22347, l: 22274, c: 22320 },
  { o: 22320, h: 22360, l: 22308, c: 22330 },
  { o: 22330, h: 22454, l: 22305, c: 22405 },
  { o: 22405, h: 22496, l: 22355, c: 22470 },
  { o: 22470, h: 22544, l: 22449, c: 22535 },
  { o: 22535, h: 22598, l: 22509, c: 22560 },
  { o: 22560, h: 22589, l: 22475, c: 22490 },
];
/** Rising trendline: touches idx2 low (₹22,052) and idx18 low (₹22,308). */
export const UP_TL: TrendlineAnchor = { i1: 2, p1: 22052, i2: 18, p2: 22308 };
/** Ceiling offset above UP_TL used by the channel scenes — kisses the swing highs at idx 6/14/22. */
export const UP_CHANNEL_OFFSET = 222;
export const UP_CHANNEL_BOUNDS = { min: 190, max: 258 };
export const UP_CHANNEL_DRAG_BOUNDS = { min: 40, max: 400 };
export const UP_CHANNEL_DRAG_INITIAL = 340;
export const DRAG_LINE_INITIAL = { p1: 22235, p2: 22470 };
export const DRAG_LINE_TOLERANCE = 48;

export const DN_MIN = 21960;
export const DN_MAX = 22610;
export const DN: CandleBar[] = [
  { o: 22470, h: 22515, l: 22441, c: 22460 },
  { o: 22460, h: 22547, l: 22401, c: 22525 },
  { o: 22525, h: 22552, l: 22516, c: 22530 },
  { o: 22530, h: 22547, l: 22427, c: 22455 },
  { o: 22455, h: 22496, l: 22388, c: 22395 },
  { o: 22395, h: 22418, l: 22340, c: 22350 },
  { o: 22350, h: 22364, l: 22309, c: 22315 },
  { o: 22315, h: 22444, l: 22304, c: 22390 },
  { o: 22390, h: 22455, l: 22380, c: 22400 },
  { o: 22400, h: 22413, l: 22389, c: 22405 },
  { o: 22405, h: 22422, l: 22395, c: 22410 },
  { o: 22410, h: 22432, l: 22307, c: 22335 },
  { o: 22335, h: 22369, l: 22266, c: 22275 },
  { o: 22275, h: 22311, l: 22205, c: 22230 },
  { o: 22230, h: 22253, l: 22188, c: 22200 },
  { o: 22200, h: 22288, l: 22173, c: 22275 },
  { o: 22275, h: 22294, l: 22244, c: 22285 },
  { o: 22285, h: 22307, l: 22274, c: 22288 },
  { o: 22288, h: 22292, l: 22260, c: 22275 },
  { o: 22275, h: 22288, l: 22198, c: 22205 },
  { o: 22205, h: 22234, l: 22137, c: 22150 },
  { o: 22150, h: 22165, l: 22026, c: 22100 },
  { o: 22100, h: 22122, l: 22053, c: 22060 },
  { o: 22060, h: 22168, l: 22010, c: 22045 },
];
/** Falling trendline: touches idx2 high (₹22,552) and idx18 high (₹22,292). */
export const DN_TL: TrendlineAnchor = { i1: 2, p1: 22552, i2: 18, p2: 22292 };

export const BRK_MIN = 22080;
export const BRK_MAX = 22440;
export const BRK: CandleBar[] = [
  { o: 22150, h: 22182, l: 22134, c: 22175 },
  { o: 22175, h: 22247, l: 22129, c: 22135 },
  { o: 22135, h: 22152, l: 22120, c: 22140 },
  { o: 22140, h: 22241, l: 22063, c: 22220 },
  { o: 22220, h: 22284, l: 22215, c: 22278 },
  { o: 22278, h: 22288, l: 22228, c: 22255 },
  { o: 22255, h: 22279, l: 22222, c: 22228 },
  { o: 22228, h: 22234, l: 22208, c: 22222 },
  { o: 22222, h: 22320, l: 22153, c: 22288 },
  { o: 22288, h: 22370, l: 22275, c: 22348 },
  { o: 22348, h: 22364, l: 22292, c: 22335 },
  { o: 22335, h: 22342, l: 22300, c: 22305 },
  { o: 22305, h: 22311, l: 22281, c: 22298 },
  { o: 22298, h: 22326, l: 22286, c: 22305 },
  { o: 22305, h: 22438, l: 22300, c: 22375 },
  { o: 22375, h: 22392, l: 22325, c: 22360 },
  { o: 22368, h: 22392, l: 22330, c: 22384 },
  { o: 22300, h: 22335, l: 22239, c: 22262 },
  { o: 22262, h: 22269, l: 22202, c: 22215 },
  { o: 22215, h: 22260, l: 22203, c: 22248 },
  { o: 22248, h: 22265, l: 22186, c: 22205 },
  { o: 22205, h: 22223, l: 22130, c: 22165 },
];
/** Rising support: touches idx2 low (₹22,120) and idx14 low (₹22,300). */
export const BRK_TL: TrendlineAnchor = { i1: 2, p1: 22120, i2: 14, p2: 22300 };
/** The "predict the next candle" reveal bar for breakoutPredict — chains off BRK[15].c, closes well below the line. */
export const BREAKOUT_REVEAL_CANDLE: CandleBar = { o: 22360, h: 22372, l: 22235, c: 22245 };

export const BOSS_MIN = 22090;
export const BOSS_MAX = 22500;
export const BOSS: CandleBar[] = [
  { o: 22230, h: 22260, l: 22200, c: 22245 },
  { o: 22245, h: 22258, l: 22184, c: 22205 },
  { o: 22205, h: 22211, l: 22159, c: 22175 },
  { o: 22175, h: 22189, l: 22150, c: 22182 },
  { o: 22182, h: 22308, l: 22163, c: 22258 },
  { o: 22258, h: 22320, l: 22215, c: 22305 },
  { o: 22305, h: 22351, l: 22261, c: 22300 },
  { o: 22300, h: 22309, l: 22253, c: 22265 },
  { o: 22265, h: 22272, l: 22244, c: 22250 },
  { o: 22250, h: 22290, l: 22217, c: 22258 },
  { o: 22258, h: 22336, l: 22245, c: 22318 },
  { o: 22318, h: 22342, l: 22272, c: 22315 },
  { o: 22315, h: 22333, l: 22252, c: 22262 },
  { o: 22262, h: 22357, l: 22239, c: 22338 },
  { o: 22338, h: 22415, l: 22318, c: 22395 },
  { o: 22395, h: 22414, l: 22357, c: 22375 },
  { o: 22375, h: 22396, l: 22333, c: 22350 },
  { o: 22350, h: 22365, l: 22313, c: 22340 },
  { o: 22340, h: 22426, l: 22322, c: 22415 },
  { o: 22415, h: 22508, l: 22370, c: 22420 },
  { o: 22420, h: 22427, l: 22374, c: 22385 },
  { o: 22385, h: 22407, l: 22346, c: 22362 },
  { o: 22362, h: 22376, l: 22349, c: 22368 },
  { o: 22368, h: 22391, l: 22352, c: 22372 },
];
/** Rising support the unseen "boss" chart's swing lows ride on. */
export const BOSS_TL: TrendlineAnchor = { i1: 3, p1: 22150, i2: 21, p2: 22348 };
export const BOSS_DECIDE_EXTRA_BARS: CandleBar[] = [
  { o: 22372, h: 22470, l: 22362, c: 22455 },
  { o: 22455, h: 22540, l: 22445, c: 22525 },
];

/* ================================================================
 * S0 intro
 * ================================================================ */

export const INTRO_KICKER = "Trendlines · Lesson 2";
export const INTRO_TITLE_LINE1 = "The trend is a line";
export const INTRO_TITLE_LINE2 = "you can trade.";
export const INTRO_SUBTITLE =
  "Connect the dips of a rising market and you get a diagonal line price keeps bouncing off. Learn to draw it, read it, and trade its bounces and breaks.";
export const INTRO_CHIPS = [
  "What market structure is",
  "Uptrend & downtrend lines",
  "Drawing them correctly",
  "Breakouts vs rejections",
  "Channels & confluence",
];

/* ---------- S1 hook ---------- */

export const HOOK = {
  kicker: "Trendlines · Lesson 2",
  title: "Price is climbing a staircase",
  prompt:
    "Watch the chart draw itself. Price zig-zags up, but every dip stops along the same rising line and pushes higher again. Connect those dips and you get a trendline — a diagonal floor the uptrend keeps bouncing off.",
};

/* ---------- S2 intuition (mcq) ---------- */

export const INTUITION_MCQ = {
  kicker: "Intuition check",
  title: "Make a prediction first",
  prompt:
    "Price has bounced up off this rising line twice. Now it's dipping toward it a third time. Before we explain anything — what's the higher-probability outcome?",
  options: ["It crashes straight down — the line means nothing", "It bounces again — buyers tend to defend the rising line", "No way to have any idea"],
  correctIndex: 1,
  hiddenFrom: 19,
  hiddenOpacity: 0,
  fb: {
    hint: "Each earlier dip found buyers exactly at the line. A line that held before tends to hold again — until it clearly breaks.",
    correct:
      "While the uptrend is intact, dips to the line tend to attract buyers again. That repeated reaction is what a trendline captures.",
    wrong:
      "The line held twice, so buyers are watching it. It leans toward another bounce — never guaranteed, but the odds favour it while the trend holds.",
  },
};

/* ---------- S3 structure ---------- */

export const STRUCTURE = {
  kicker: "Market structure",
  title: "Higher highs, higher lows",
  prompt:
    "Price moves in a zig-zag of swings. When each peak is higher than the last (higher highs) AND each valley is higher than the last (higher lows), that's an uptrend. Flip it — lower highs and lower lows — and it's a downtrend. A trendline just connects those swing points.",
  highs: [
    { idx: 6, price: 22335 },
    { idx: 14, price: 22470 },
    { idx: 22, price: 22598 },
  ],
  lows: [
    { idx: 2, price: 22052 },
    { idx: 10, price: 22178 },
    { idx: 18, price: 22308 },
  ],
};

/* ---------- S4 tapStructure (multi = 2) ---------- */

export const TAP_STRUCTURE = {
  kicker: "Your turn",
  title: "Mark the two higher lows",
  prompt:
    "This is an uptrend. Tap the two most recent higher lows — the rising valleys the uptrend is built on. Tap twice, one per valley (tap again to adjust).",
  lows: [
    { idxLo: 9.3, idxHi: 10.7, pMax: 22240 },
    { idxLo: 17.3, idxHi: 18.7, pMax: 22360 },
  ],
  revealLows: [
    { idx: 10, price: 22178 },
    { idx: 18, price: 22308 },
  ],
  revealDecoy: { idx: 14, price: 22470, label: "a peak, not a low" },
  fb: {
    hint: "A higher low is a valley that sits ABOVE the previous valley. Tap the two rising dips, not the peaks.",
    correct: "Both higher lows found — each valley sits above the last, the signature of an uptrend.",
    wrong: "Tap the two rising valleys (higher lows). The correct swing lows are highlighted now.",
  },
};

/* ---------- S5 whatis ---------- */

export const WHATIS = {
  kicker: "What a trendline is",
  title: "A diagonal line of support",
  prompt:
    "A trendline connects the swing lows of an uptrend (or the swing highs of a downtrend). It behaves like support and resistance — but slanted. In an uptrend it's a diagonal floor; price keeps bouncing up off it as long as the trend lasts.",
};

/* ---------- S6 types ---------- */

export const TYPES = {
  kicker: "Types of trendlines",
  title: "Three kinds of trend",
  prompt:
    "An uptrend line connects rising lows and acts as diagonal support. A downtrend line connects falling highs and acts as diagonal resistance. When highs and lows are flat, the trend is sideways — you'd use horizontal support & resistance instead.",
};

/* ---------- S7 typesQuiz (mcq) ---------- */

export const TYPES_QUIZ = {
  kicker: "Which line fits?",
  title: "How would you draw this trend?",
  prompt: "Look at the structure below — lower highs and lower lows. Which trendline belongs on this chart?",
  options: ["Connect the swing lows with a rising line", "Connect the falling highs — a downtrend resistance line", "Draw one flat horizontal line"],
  correctIndex: 1,
  fb: {
    hint: "The peaks are stepping DOWN. A downtrend line rides along those falling highs, acting as resistance.",
    correct: "A downtrend line connects the lower highs and acts as diagonal resistance — price keeps getting rejected under it.",
    wrong: "These are falling highs, so the line rides across the peaks as resistance — a downtrend line, drawn now.",
  },
};

/* ---------- S8 drawTeach ---------- */

export const DRAW_TEACH = {
  kicker: "How to draw",
  title: "2 to draw, 3 to confirm",
  prompt:
    "You need at least 2 swing lows to draw an uptrend line, and a 3rd touch to confirm it. Anchor the line on the wicks (the extremes), let it just kiss the lows, and never force it through candle bodies to make it 'fit'.",
};

/* ---------- S9 dragLine ---------- */

export const DRAG_LINE = {
  kicker: "Do it by hand",
  title: "Draw the trendline",
  prompt:
    "Drag the two blue handles so the line sits under the swing lows — just touching the wicks. Get it right and it should line up with the 3rd touch too. Then Check.",
  fb: {
    hint: "Lay the line UNDER the dips so it just touches the lows. Too high and it slices through candles; too low and it touches nothing.",
    correct: "Clean trendline — it rests under the swing lows and lines up with the 3rd touch. That is a valid line.",
    wrong: "Not quite. Anchor the line on the swing-low wicks (~₹22,050 rising to ~₹22,310). The correct line is shown now.",
  },
};

/* ---------- S10 validTeach ---------- */

export const VALID_TEACH = {
  kicker: "Valid vs invalid",
  title: "What makes a line valid",
  prompt:
    "A valid trendline touches at least 2–3 swing points, rides along the wicks without cutting through candle bodies, and isn't impossibly steep. If you have to tilt or force it to make it touch, it isn't a real line.",
  invalidAnchor: { i1: 2, p1: 22150, i2: 18, p2: 22470 } as TrendlineAnchor,
};

/* ---------- S11 spot ---------- */

export const SPOT_CARDS: Array<{ label: string; bars: CandleBar[]; yL: number; yR: number; tone: "ok" | "bad"; note: string }> = [
  {
    label: "Trader A",
    bars: [
      { o: 18, h: 21.8, l: 15.2, c: 20 },
      { o: 20, h: 21.4, l: 14, c: 19 },
      { o: 19, h: 31.3, l: 16.9, c: 28 },
      { o: 28, h: 34.4, l: 25.9, c: 32 },
      { o: 32, h: 42.6, l: 22.7, c: 26 },
      { o: 26, h: 33.6, l: 18.1, c: 28 },
      { o: 28, h: 41.5, l: 27, c: 38 },
      { o: 38, h: 45.1, l: 34.5, c: 41 },
      { o: 41, h: 44.3, l: 30.7, c: 36 },
      { o: 36, h: 42.4, l: 27.9, c: 40 },
      { o: 40, h: 52.2, l: 39, c: 48 },
      { o: 48, h: 53, l: 44.1, c: 52 },
    ],
    yL: 13,
    yR: 37,
    tone: "ok",
    note: "uptrend — 2 clean touches on the lows",
  },
  {
    label: "Trader B",
    bars: [
      { o: 44, h: 49.2, l: 37.3, c: 45 },
      { o: 45, h: 46.2, l: 40, c: 41 },
      { o: 41, h: 42, l: 33.4, c: 37 },
      { o: 37, h: 38.6, l: 31.1, c: 33 },
      { o: 33, h: 35, l: 31.4, c: 34 },
      { o: 34, h: 39.2, l: 32.3, c: 35 },
      { o: 35, h: 36.2, l: 33.2, c: 35 },
      { o: 35, h: 38, l: 27.1, c: 31 },
      { o: 31, h: 32.5, l: 23.9, c: 28 },
      { o: 28, h: 30, l: 21.5, c: 25 },
      { o: 25, h: 26.1, l: 21, c: 22 },
      { o: 22, h: 24, l: 21, c: 23 },
      { o: 23, h: 24, l: 21.2, c: 23 },
      { o: 23, h: 24.4, l: 18.1, c: 20 },
      { o: 20, h: 21, l: 16, c: 17 },
      { o: 17, h: 18.5, l: 14, c: 15 },
    ],
    yL: 49,
    yR: 17,
    tone: "ok",
    note: "downtrend — legs down, then retrace, rides falling highs",
  },
  {
    label: "Trader C",
    bars: [
      { o: 20, h: 23, l: 17.2, c: 22 },
      { o: 22, h: 27, l: 20.5, c: 26 },
      { o: 26, h: 28, l: 20.7, c: 25 },
      { o: 25, h: 32.3, l: 23.2, c: 31 },
      { o: 31, h: 37.2, l: 27.2, c: 33 },
      { o: 33, h: 35.6, l: 27.6, c: 30 },
      { o: 30, h: 41.3, l: 28.9, c: 39 },
      { o: 39, h: 43.8, l: 36, c: 41 },
      { o: 41, h: 47, l: 32.8, c: 37 },
      { o: 37, h: 44.6, l: 35.5, c: 43 },
      { o: 43, h: 51.2, l: 42, c: 49 },
      { o: 49, h: 53, l: 47.9, c: 52 },
    ],
    yL: 26,
    yR: 46,
    tone: "bad",
    note: "1 touch, cuts through bodies",
  },
];
export const SPOT_MISTAKE = {
  kicker: "Spot the mistake",
  title: "Which trendline is invalid?",
  prompt: "Three traders drew a trendline on the same uptrend. Tap the card where the line is drawn incorrectly.",
  correctIndex: 2,
  fb: {
    hint: "A valid line rests on the lows without slicing through candle bodies, and needs more than one touch.",
    correct: "Right — that line has just one touch and cuts straight through the candle bodies. Not a real trendline.",
    wrong: "Trader C forced the line through the bodies with only one real touch — that is the invalid one, marked now.",
  },
};

/* ---------- S12 strengthTeach ---------- */

export const STRENGTH_TEACH = {
  kicker: "Trendline strength",
  title: "Strong vs weak lines",
  prompt:
    "Trendlines are not equal. Strength grows with more touches, a longer time in play, a moderate angle (roughly 30–45°, not vertical), and a higher timeframe. A gently-sloped line with four touches beats a steep one touched twice.",
};

/* ---------- S13 strengthCompare (mcq) ---------- */

export const STRENGTH_COMPARE = {
  kicker: "Which is stronger?",
  title: "Pick the stronger trendline",
  prompt: "Two uptrend lines, same chart period. Which one would you trust more?",
  options: ["Line A — 2 touches, very steep angle", "Line B — 4 touches, a moderate, sustainable slope"],
  correctIndex: 1,
  fb: {
    hint: "More touches plus a moderate, sustainable angle = a more reliable line. Steep lines break fast.",
    correct: "Line B — four touches and a moderate slope. Steep lines (like A) rarely hold for long.",
    wrong: "Line B is stronger: more touches and a sustainable angle. Steep lines break quickly.",
  },
};

/* ---------- mini trendline chart configs (types + strengthCompare) ---------- */

export type MiniTlKind = "up" | "down" | "weak" | "strong";
export const MINI_TL: Record<MiniTlKind, { bars: CandleBar[]; line: [number, number]; touch: number[]; tone: "up" | "down"; label: string }> = {
  up: {
    bars: [
      { o: 18, h: 20, l: 15.9, c: 17 },
      { o: 17, h: 19.5, l: 15, c: 17 },
      { o: 17, h: 24.4, l: 15, c: 23 },
      { o: 23, h: 24.6, l: 19.9, c: 22 },
      { o: 22, h: 34, l: 17.6, c: 33 },
      { o: 33, h: 34, l: 30, c: 31 },
      { o: 31, h: 32.7, l: 26.8, c: 28 },
      { o: 28, h: 46.4, l: 22.1, c: 44 },
      { o: 44, h: 47.2, l: 38.4, c: 42 },
      { o: 42, h: 44.5, l: 40.9, c: 43 },
      { o: 43, h: 52.4, l: 42, c: 51 },
      { o: 51, h: 53.6, l: 47, c: 48 },
      { o: 48, h: 50.1, l: 43.4, c: 45 },
      { o: 45, h: 46.4, l: 41.4, c: 43 },
      { o: 43, h: 45.1, l: 41.1, c: 44 },
      { o: 44, h: 47.4, l: 43, c: 46 },
      { o: 46, h: 48, l: 44.3, c: 47 },
      { o: 47, h: 57, l: 44.2, c: 56 },
      { o: 56, h: 57, l: 50.5, c: 53 },
      { o: 53, h: 56.7, l: 52, c: 55 },
    ],
    line: [13, 53],
    touch: [2, 16],
    tone: "up",
    label: "UPTREND · support",
  },
  down: {
    bars: [
      { o: 44, h: 48, l: 43, c: 47 },
      { o: 47, h: 53.1, l: 46, c: 51 },
      { o: 51, h: 52, l: 48, c: 49 },
      { o: 49, h: 51.3, l: 37.8, c: 41 },
      { o: 41, h: 45.9, l: 33.2, c: 35 },
      { o: 35, h: 43.5, l: 31.3, c: 40 },
      { o: 40, h: 44.5, l: 38.7, c: 43 },
      { o: 42, h: 43, l: 38.1, c: 40 },
      { o: 40, h: 41.6, l: 36.6, c: 38 },
      { o: 38, h: 39, l: 30, c: 31 },
      { o: 31, h: 35, l: 23.7, c: 25 },
      { o: 25, h: 45.5, l: 20.5, c: 33 },
      { o: 32, h: 33, l: 30, c: 31 },
      { o: 30, h: 31.7, l: 24.1, c: 28 },
      { o: 28, h: 29.8, l: 25, c: 26 },
      { o: 26, h: 27.1, l: 16.1, c: 19 },
      { o: 19, h: 27.5, l: 17.2, c: 23 },
      { o: 22, h: 24.4, l: 15, c: 16 },
      { o: 16, h: 23, l: 15, c: 15 },
      { o: 14, h: 16.3, l: 15, c: 15 },
    ],
    line: [57, 17],
    touch: [2, 8, 14],
    tone: "down",
    label: "DOWNTREND · resistance",
  },
  weak: {
    bars: [
      { o: 22, h: 26, l: 17.1, c: 20 },
      { o: 20, h: 29.3, l: 18.2, c: 27 },
      { o: 27, h: 32, l: 26, c: 30 },
      { o: 34, h: 51.3, l: 28.4, c: 33 },
      { o: 38, h: 43, l: 36.6, c: 42 },
      { o: 42, h: 43.8, l: 38, c: 41 },
      { o: 45, h: 53.4, l: 43.7, c: 48 },
      { o: 48, h: 50.5, l: 42.6, c: 49 },
      { o: 53, h: 55.4, l: 49.6, c: 51 },
      { o: 51, h: 57, l: 47.8, c: 49 },
    ],
    line: [16, 58],
    touch: [0, 8],
    tone: "up",
    label: "STEEP · 2 touches",
  },
  strong: {
    bars: [
      { o: 21, h: 24.5, l: 19, c: 23 },
      { o: 23, h: 24, l: 19.1, c: 21 },
      { o: 21, h: 30, l: 18.9, c: 29 },
      { o: 29, h: 32.7, l: 26.7, c: 31 },
      { o: 31, h: 39.8, l: 25.3, c: 28 },
      { o: 28, h: 32.8, l: 27, c: 29 },
      { o: 29, h: 31.6, l: 27.3, c: 30 },
      { o: 30, h: 41.1, l: 24.3, c: 38 },
      { o: 38, h: 42.1, l: 35.5, c: 40 },
      { o: 40, h: 42.8, l: 30.9, c: 35 },
      { o: 35, h: 38.6, l: 32.3, c: 36 },
      { o: 36, h: 47.3, l: 33.8, c: 44 },
      { o: 44, h: 50.1, l: 38.4, c: 46 },
      { o: 46, h: 48.2, l: 38.6, c: 42 },
      { o: 42, h: 44, l: 40.2, c: 43 },
      { o: 43, h: 50.2, l: 41.7, c: 49 },
    ],
    line: [18, 43],
    touch: [1, 6, 10, 14],
    tone: "up",
    label: "MODERATE · 4 touches",
  },
};
export const MINI_TL_MIN = 14;
export const MINI_TL_MAX = 58;

/* ---------- S14 breakoutTeach ---------- */

export const BREAKOUT_TEACH = {
  kicker: "Trendline breakouts",
  title: "When the line breaks",
  prompt:
    "A trendline doesn't last forever. When price closes decisively THROUGH the line — a strong candle body on the other side, not just a wick poke — it's a breakout, a warning the trend may be changing. A wick that pierces and snaps back is not a break.",
  breakIdx: 16,
};

/* ---------- S15 breakoutPredict (candle) ---------- */

export type CandleKind = "bull" | "hammer" | "bear" | "doji";

export const CANDLE_PREDICT_OPTIONS: Array<{ kind: CandleKind; label: string }> = [
  { kind: "bull", label: "Strong green" },
  { kind: "hammer", label: "Long lower wick" },
  { kind: "bear", label: "Heavy red close" },
  { kind: "doji", label: "Flat doji" },
];
export const BREAKOUT_PREDICT = {
  kicker: "Predict the candle",
  title: "Price is sitting on the line",
  prompt: "Price in this uptrend has dropped back to its rising trendline. Which next candle would signal the trend is BREAKING, not holding?",
  correctIndex: 2,
  fb: {
    hint: "A break needs price to CLOSE firmly below the line — a big candle body on the wrong side, not a small wick.",
    correct: "A heavy candle closing well below the line is a genuine break — sellers took control through the trendline.",
    wrong: "The heavy close below the line is the break signal. A long lower wick would mean buyers defended and the line held.",
  },
};

/* ---------- S16 rejectionTeach ---------- */

export const REJECTION_TEACH = {
  kicker: "Trendline rejections",
  title: "When the line holds",
  prompt:
    "The opposite of a break is a rejection: price dips to the line, buyers step in, and a candle with a long lower wick or strong close pushes it back up. A clean rejection says the trend is still alive — a continuation entry in the trend's direction.",
};

/* ---------- S17 tapRejection ---------- */

export const TAP_REJECTION = {
  kicker: "Your turn",
  title: "Tap the rejection",
  prompt: "The rising trendline is drawn. Tap the most recent spot where price dipped to the line and got rejected back up — the continuation entry.",
  idxMin: 16.4,
  idxMax: 19.6,
  priceMin: 22250,
  priceMax: 22400,
  fb: {
    hint: "Find where price came DOWN to the line and bounced. The freshest bounce off the line is the entry.",
    correct: "That is the rejection — price tagged the line and buyers pushed it back into the trend.",
    wrong: "The most recent rejection is where price dipped to the line and bounced (marked now) — that is the continuation entry.",
  },
};

/* ---------- S18 channelTeach ---------- */

export const CHANNEL_TEACH = {
  kicker: "Trendline channels",
  title: "Add a parallel line",
  prompt:
    "Copy the trendline and shift it to touch the swing highs on the other side. Now price is boxed in a channel: buy near the lower line, take profit near the upper line, and watch a close outside the channel as an exit signal.",
};

/* ---------- S19 dragChannel ---------- */

export const DRAG_CHANNEL = {
  kicker: "Do it by hand",
  title: "Complete the channel",
  prompt: "The lower trendline is fixed. Drag the parallel upper line up or down until it caps the swing highs — forming a clean channel around the uptrend. Then Check.",
  fb: {
    hint: "Slide the upper line so it just touches the tops of the rallies — parallel to the lower line, resting on the highs.",
    correct: "Clean channel — the upper line runs parallel and caps the swing highs. Buy the floor, sell the ceiling.",
    wrong: "The upper line should sit on the swing highs, parallel to the lower one. The correct channel is shown now.",
  },
};

/* ---------- S20 mtfTeach ---------- */

export const MTF_TEACH = {
  kicker: "Multi-timeframe",
  title: "Higher timeframe wins",
  prompt:
    "The same line on a bigger timeframe carries more weight. A trendline off the daily chart, held for months, is far more significant than one off the 5-minute chart. When they disagree, respect the higher-timeframe line.",
  minorAnchor: { i1: 14, p1: 22405, i2: 22, p2: 22470 } as TrendlineAnchor,
};

/* ---------- S21 mtfQuiz (mcq, text-only) ---------- */

export const MTF_QUIZ = {
  kicker: "Which matters more?",
  title: "Two lines disagree",
  prompt: "Your 5-minute trendline says sell, but the daily trendline is still rising and intact. Which line should carry more weight?",
  options: ["The 5-minute line — it reacts faster to price", "The daily line — months of touches make it far more significant"],
  correctIndex: 1,
  fb: {
    hint: "Bigger timeframe = more traders watching, more touches, more weight. Which line is that?",
    correct: "The daily line. Higher-timeframe trendlines hold more weight; the lower timeframe is just noise around it.",
    wrong: "The daily line wins — a higher-timeframe line with months of touches outweighs a fast, noisy 5-minute line.",
  },
};

/* ---------- S22 confluenceTeach ---------- */

export const CONFLUENCE_TEACH = {
  kicker: "Confluence",
  title: "Where signals stack",
  prompt:
    "A trendline is strongest where it lines up with other evidence. When your rising line meets a horizontal support level and a round number at the same spot, that confluence is a high-probability zone — far better than any single line alone.",
  horizontalLevel: 22300,
  confluenceIdx: 17.4,
};

/* ---------- S23 bossTap ---------- */

export const BOSS_TAP = {
  kicker: "Market Replay · Boss",
  title: "An unseen chart",
  prompt: "Nifty, last week. First job: this is an uptrend. Tap along the rising trendline the swing lows are riding — the diagonal floor you'd watch.",
  idxMin: 3,
  idxMax: 23,
  tolerance: 45,
  fb: {
    hint: "Connect the rising valleys. Tap on the diagonal floor the swing lows sit on — not the peaks.",
    correct: "Good eye — that is the trendline holding the whole uptrend together.",
    wrong: "The rising trendline runs along the swing lows (drawn now). That diagonal floor is the line to watch.",
  },
};

/* ---------- S24 bossDecide ---------- */

export const BOSS_DECIDE = {
  kicker: "Market Replay · Boss",
  title: "Price is at your trendline",
  prompt: "Price dipped to the rising trendline you marked and printed a long lower wick. The daily trend is still up. Your move?",
  options: [
    "Short it — the trend is about to reverse",
    "Wait — there's no signal at all here",
    "Go long with the trend — buyers defended the line, stop just below it",
  ],
  correctIndex: 2,
  fb: {
    hint: "You mapped an uptrend, and price just rejected the line with a bullish wick. What does trading WITH the trend say?",
    correct: "Long, with the trend, stop just below the line. Price rallied ₹300 into the close — the line held.",
    wrong: "The setup was a long WITH the trend: a rejection wick at the rising line. Shorting fights the trend. Price rallied ₹300 after that wick.",
  },
};

/* ---------- S25 summary ---------- */

export const BADGE_TITLE = "You can trade trendlines now";
export const BADGE_SUBTITLE =
  "You can spot uptrends and downtrends, draw a valid trendline, judge its strength, and trade bounces, breaks, and channels with a defined plan.";
export const CHECKLIST_ITEMS = [
  "Market structure: HH/HL vs LH/LL",
  "Uptrend, downtrend & sideways lines",
  "What makes a trendline valid",
  "Drawing: 2 to draw, 3 to confirm",
  "Judging trendline strength",
  "Breakouts through the line",
  "Rejections = trend continues",
  "Channels, multi-TF & confluence",
];
