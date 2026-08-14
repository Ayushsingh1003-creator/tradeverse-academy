import { buildDailyRandomWalk, buildRandomWalk, aggregateBars, type CandleBar } from "./geometry";

/* ================================================================
 * Scene roster — mirrors the design prototype's SC array (21 scenes).
 * SCENE_TYPES drives readiness/scoring logic; SECTION_META drives the
 * header badge + progress bar, the same way every sibling lesson's
 * data.ts does. "tapGroup" is unique to this lesson: a tap scene whose
 * correct target is computed from the data (highest wick / last candle)
 * rather than a fixed index. "tfmcq" is a normal mcq scene that also lets
 * the learner flip between 5m/15m/1h before answering.
 * ================================================================ */

export type SceneType = "teach" | "mcq" | "tapGroup" | "tap" | "tfmcq" | "summary";

export const SCENE_TYPES: SceneType[] = [
  "teach", // 0 intro
  "teach", // 1 hook
  "mcq", // 2 intuition
  "teach", // 3 fixedTime
  "mcq", // 4 countQuiz
  "teach", // 5 aggregate
  "tapGroup", // 6 tapHigh
  "tapGroup", // 7 tapClose
  "teach", // 8 sameData
  "tfmcq", // 9 tfExplore
  "teach", // 10 noiseTeach
  "mcq", // 11 noiseQuiz
  "teach", // 12 tfMenu
  "mcq", // 13 matchQuiz
  "teach", // 14 htfContext
  "teach", // 15 topDown
  "mcq", // 16 conflictQuiz
  "teach", // 17 alignment
  "tap", // 18 bossTap
  "mcq", // 19 bossDecide
  "summary", // 20 summary
];

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // 0
  { title: "A candle is a slice of time", kind: "learn" }, // 1
  { title: "Make a prediction", kind: "quiz" }, // 2
  { title: "Fixed time, not fixed movement", kind: "learn" }, // 3
  { title: "How many fit inside?", kind: "quiz" }, // 4
  { title: "Twelve candles become one", kind: "learn" }, // 5
  { title: "Which candle set the high?", kind: "quiz" }, // 6
  { title: "Which candle set the close?", kind: "quiz" }, // 7
  { title: "One session, three charts", kind: "learn" }, // 8
  { title: "Switch the timeframe", kind: "quiz" }, // 9
  { title: "Lower timeframe, more noise", kind: "learn" }, // 10
  { title: "Crash, or a pullback?", kind: "quiz" }, // 11
  { title: "From seconds to weeks", kind: "learn" }, // 12
  { title: "Match the trader", kind: "quiz" }, // 13
  { title: "Context above, timing below", kind: "learn" }, // 14
  { title: "Work top-down", kind: "learn" }, // 15
  { title: "Two charts, two answers", kind: "quiz" }, // 16
  { title: "When timeframes agree", kind: "learn" }, // 17
  { title: "Market Replay: find the hour", kind: "quiz" }, // 18
  { title: "Market Replay: the decision", kind: "quiz" }, // 19
  { title: "Complete", kind: "done" }, // 20
];

export const TOTAL_STEPS = SECTION_META.length - 1; // 20

/* ================================================================
 * BASE dataset — the deterministic random walk every "same data, different
 * timeframe" scene re-slices. Ported verbatim from the design's data():
 * same seed, same legs, same aggregation, so every chart in this lesson
 * matches the design pixel-for-pixel in shape.
 * ================================================================ */

export const BASE: CandleBar[] = buildRandomWalk(
  20260812,
  [
    { n: 10, d: -0.32 },
    { n: 10, d: 0.56 },
    { n: 9, d: -0.26 },
    { n: 11, d: 0.6 },
    { n: 9, d: -0.28 },
    { n: 11, d: 0.62 },
    { n: 9, d: -0.3 },
    { n: 9, d: 0.34 },
    { n: 10, d: -0.85 },
    { n: 8, d: -0.32 },
  ],
  22180,
);
export const M15: CandleBar[] = aggregateBars(BASE, 3); // 32 candles
export const H1: CandleBar[] = aggregateBars(BASE, 12); // 8 candles

/* ================================================================
 * S0 intro — live-forming candle animation. 24 five-minute candles (12 up,
 * 12 down) rolling up into 2 one-hour candles on the right, drawn growing
 * in real time exactly like the design's intro3D()/startIntroForm().
 * ================================================================ */

export const INTRO_KICKER = "Time Frames";
export const INTRO_TITLE_LINE1 = "Same market.";
export const INTRO_TITLE_LINE2 = "Different story.";
export const INTRO_SUBTITLE =
  "A candle measures time, not movement. Learn how timeframes reshape the same prices — and how to read several together.";
export const INTRO_CHIPS = ["A candle = a slice of time", "How candles merge", "Same move, different look", "Noise vs signal", "Top-down multi-timeframe"];

export const INTRO_FIVE: CandleBar[] = [
  { o: 100, h: 104, l: 96, c: 102 },
  { o: 102, h: 113, l: 100, c: 111 },
  { o: 111, h: 114, l: 107, c: 109 },
  { o: 109, h: 110, l: 98, c: 101 },
  { o: 101, h: 118, l: 100, c: 116 },
  { o: 116, h: 119, l: 112, c: 114 },
  { o: 114, h: 116, l: 105, c: 108 },
  { o: 108, h: 124, l: 107, c: 122 },
  { o: 122, h: 126, l: 118, c: 120 },
  { o: 120, h: 122, l: 110, c: 113 },
  { o: 113, h: 130, l: 112, c: 128 },
  { o: 128, h: 134, l: 126, c: 132 },
  { o: 132, h: 133, l: 118, c: 121 },
  { o: 121, h: 123, l: 113, c: 116 },
  { o: 116, h: 128, l: 115, c: 126 },
  { o: 126, h: 127, l: 112, c: 114 },
  { o: 114, h: 116, l: 104, c: 107 },
  { o: 107, h: 118, l: 106, c: 116 },
  { o: 116, h: 117, l: 100, c: 103 },
  { o: 103, h: 105, l: 94, c: 97 },
  { o: 97, h: 108, l: 96, c: 106 },
  { o: 106, h: 107, l: 89, c: 92 },
  { o: 92, h: 94, l: 82, c: 85 },
  { o: 85, h: 96, l: 83, c: 93 },
];
/** Full animation cycle: 24 candles × 150ms to form, then an 1800ms hold. */
export const INTRO_FORM_MS_PER_CANDLE = 150;
export const INTRO_FORM_HOLD_MS = 1800;

/* ---------- S1 hook ---------- */

export const HOOK = {
  kicker: "Time frames · Lesson",
  title: "A candle is a slice of time",
  prompt:
    "A timeframe is simply how much time one candle covers. On a 5-minute chart each candle holds 5 minutes of trading. On a 1-hour chart each candle holds a full hour. Same market, same prices — just sliced differently.",
};

/* ---------- S2 intuition (mcq) ---------- */

export const INTUITION_MCQ = {
  kicker: "Intuition check",
  title: "Make a prediction first",
  prompt: "You are watching a 5-minute chart. What makes the current candle finish and a brand-new candle appear?",
  options: ["Price moves a set number of rupees", "5 minutes of time runs out", "Enough shares change hands"],
  correctIndex: 1,
  fb: {
    hint: "The clue is in the name: a 5-minute candle. What is being measured — rupees, or minutes?",
    correct: "Time runs out. A candle closes when its time period ends — whether price moved ₹5 or ₹500.",
    wrong: "A candle closes on TIME, not on price movement. When the 5 minutes are up, that candle is finished and the next one opens.",
  },
};

/* ---------- S3 fixedTime (teach) ---------- */

export const FIXED_TIME = {
  kicker: "The key idea",
  title: "Fixed time, not fixed movement",
  prompt:
    "This is the one idea to hold on to: a candle represents a fixed amount of TIME, not a fixed amount of price movement. A quiet 5-minute candle can be tiny and a wild one huge — both still cover exactly 5 minutes.",
};
export const FIXED_TIME_QUIET: CandleBar = { o: 22200, h: 22214, l: 22192, c: 22208 };
export const FIXED_TIME_WILD: CandleBar = { o: 22200, h: 22330, l: 22120, c: 22300 };

/* ---------- S4 countQuiz (mcq) ---------- */

export const COUNT_QUIZ = {
  kicker: "Check",
  title: "How many fit inside?",
  prompt: "If each candle on your chart covers 5 minutes, how many of them fit inside one 1-hour candle?",
  options: ["6", "12", "60"],
  correctIndex: 1,
  fb: {
    hint: "An hour is 60 minutes. How many 5-minute blocks go into 60 minutes?",
    correct: "12. Sixty minutes divided by five gives twelve 5-minute candles inside every 1-hour candle.",
    wrong: "60 ÷ 5 = 12. Twelve 5-minute candles combine into a single 1-hour candle.",
  },
};
export const COUNT_QUIZ_BARS: CandleBar[] = [
  { o: 22120, h: 22138, l: 22108, c: 22131 },
  { o: 22131, h: 22135, l: 22096, c: 22102 },
  { o: 22102, h: 22124, l: 22091, c: 22118 },
  { o: 22118, h: 22119, l: 22078, c: 22084 },
  { o: 22084, h: 22112, l: 22072, c: 22105 },
  { o: 22105, h: 22142, l: 22100, c: 22138 },
  { o: 22138, h: 22140, l: 22119, c: 22124 },
  { o: 22124, h: 22150, l: 22120, c: 22146 },
  { o: 22146, h: 22148, l: 22108, c: 22114 },
  { o: 22114, h: 22132, l: 22106, c: 22127 },
  { o: 22127, h: 22158, l: 22122, c: 22153 },
  { o: 22153, h: 22168, l: 22147, c: 22162 },
];

/* ---------- S5 aggregate (teach) ---------- */

export const AGGREGATE_TEACH = {
  kicker: "How it works",
  title: "Twelve candles become one",
  prompt:
    "Zoom out and the chart does not throw prices away — it merges them. Those twelve 5-minute candles combine into one 1-hour candle: it opens where the first one opened, closes where the last one closed, and its wicks reach the highest high and lowest low of the whole group.",
};
export const AGGREGATE_BARS: CandleBar[] = [
  { o: 22080, h: 22098, l: 22072, c: 22091 },
  { o: 22091, h: 22112, l: 22084, c: 22106 },
  { o: 22106, h: 22110, l: 22083, c: 22089 },
  { o: 22089, h: 22124, l: 22086, c: 22119 },
  { o: 22119, h: 22122, l: 22101, c: 22107 },
  { o: 22107, h: 22140, l: 22103, c: 22135 },
  { o: 22135, h: 22138, l: 22118, c: 22124 },
  { o: 22124, h: 22127, l: 22095, c: 22101 },
  { o: 22101, h: 22132, l: 22098, c: 22127 },
  { o: 22127, h: 22156, l: 22123, c: 22150 },
  { o: 22150, h: 22153, l: 22131, c: 22137 },
  { o: 22137, h: 22172, l: 22133, c: 22167 },
];

/* ---------- S6/S7 tapHigh / tapClose (tapGroup) ---------- */
// Both scenes tap the same live group: BASE.slice(0,12) merging into H1[0].

export const TAP_HIGH = {
  kicker: "Your turn",
  title: "Which candle set the high?",
  prompt: "These twelve 5-minute candles merge into the 1-hour candle on the right. Tap the 5-minute candle that gave the 1-hour candle its HIGH.",
  fb: {
    hint: "The 1-hour high is the highest price any single candle in the group reached — look at the wick tips, not the bodies.",
    correct: "That is the one. Its wick tip is the highest point in the group, so it becomes the 1-hour candle’s high.",
    wrong: "Look for the tallest wick tip in the group — that candle sets the hourly high. It is highlighted now.",
  },
};
export const TAP_CLOSE = {
  kicker: "Your turn",
  title: "Which candle set the close?",
  prompt: "Same group. Tap the 5-minute candle whose close becomes the CLOSE of the 1-hour candle.",
  fb: {
    hint: "The hour ends when the last candle in the group ends. Which candle is the final one — position matters, not size.",
    correct: "The last candle in the group. Where it closes is where the whole hour closes.",
    wrong: "It is the LAST candle of the group, whatever its size — the hour closes when that final candle closes. Highlighted now.",
  },
};

/* ---------- S8 sameData (teach) ---------- */

export const SAME_DATA = {
  kicker: "Same market, different look",
  title: "One session, three charts",
  prompt:
    "Here is the exact same trading data drawn three ways. On 5 minutes it is a jagged mess of pushes and pullbacks. On 15 minutes the shape settles down. On 1 hour the story is obvious at a glance: a rally, then a sharp reversal. No prices changed — only the slicing.",
};

/* ---------- S9 tfExplore (tfmcq) ---------- */

export type TfKey = "5m" | "15m" | "1h";
export const TF_OPTIONS: TfKey[] = ["5m", "15m", "1h"];
export const TF_EXPLORE = {
  kicker: "Explore it yourself",
  title: "Switch the timeframe",
  prompt: "Tap through 5m, 15m and 1h. It is one dataset re-sliced each time. Then answer: which timeframe shows the overall trend most clearly?",
  options: ["5-minute — the most detail", "15-minute — somewhere in between", "1-hour — the least noise, clearest direction"],
  correctIndex: 2,
  fb: {
    hint: "Detail is not the same as clarity. Which version lets you say the direction in one glance, without squinting past the wiggles?",
    correct: "The 1-hour. Fewer candles strip out the noise and leave the underlying direction obvious.",
    wrong: "The 1-hour is clearest. More candles means more detail but also more noise — the trend gets buried in the wiggles.",
  },
};
export const TF_SUBLABEL: Record<TfKey, string> = {
  "5m": "96 candles · 8 hours",
  "15m": "32 candles · same 8 hours",
  "1h": "8 candles · same 8 hours",
};

/* ---------- S10 noiseTeach (teach) ---------- */

export const NOISE_TEACH = {
  kicker: "Noise",
  title: "Lower timeframe, more noise",
  prompt:
    "Every timeframe shows real prices, but lower ones show far more random movement. A 5-minute chart throws dozens of small signals at you each day, and most are noise — moves that mean nothing once you zoom out.",
};

/* ---------- S11 noiseQuiz (mcq) ---------- */

export const NOISE_QUIZ = {
  kicker: "Read both charts",
  title: "Crash, or a pullback?",
  prompt: "On the 15-minute chart (left) price is falling hard and looks like a breakdown. The 1-hour chart (right) covers the very same period. What is actually happening?",
  options: ["A major downtrend has started", "A normal pullback inside a bigger uptrend", "The two charts disagree, so both are unreliable"],
  correctIndex: 1,
  fb: {
    hint: "Find that falling stretch inside the 1-hour chart. Is it the whole story, or one dip in a bigger climb?",
    correct: "A pullback. What fills the screen on the 5-minute chart is just one red candle inside an ongoing 1-hour uptrend.",
    wrong: "It is a pullback inside an uptrend. The 5-minute selloff is a single candle on the 1-hour chart — the bigger trend is still up.",
  },
};
export const NOISE_QUIZ_SEG: CandleBar[] = [
  { o: 21860, h: 21880, l: 21845, c: 21858 },
  { o: 21858, h: 21875, l: 21840, c: 21850 },
  { o: 21850, h: 21895, l: 21845, c: 21888 },
  { o: 21888, h: 21920, l: 21880, c: 21912 },
  { o: 21912, h: 21930, l: 21895, c: 21902 },
  { o: 21902, h: 21915, l: 21882, c: 21890 },
  { o: 21890, h: 21896, l: 21860, c: 21868 },
  { o: 21868, h: 21875, l: 21845, c: 21852 },
  { o: 21852, h: 21858, l: 21820, c: 21828 },
  { o: 21828, h: 21832, l: 21700, c: 21712 },
  { o: 21712, h: 21718, l: 21620, c: 21630 },
  { o: 21630, h: 21636, l: 21560, c: 21572 },
  { o: 21572, h: 21600, l: 21540, c: 21590 },
  { o: 21590, h: 21595, l: 21500, c: 21510 },
  { o: 21510, h: 21515, l: 21460, c: 21468 },
  { o: 21468, h: 21500, l: 21455, c: 21492 },
  { o: 21492, h: 21525, l: 21480, c: 21518 },
  { o: 21518, h: 21522, l: 21470, c: 21478 },
  { o: 21478, h: 21485, l: 21445, c: 21452 },
  { o: 21452, h: 21495, l: 21440, c: 21488 },
  { o: 21488, h: 21510, l: 21475, c: 21502 },
  { o: 21502, h: 21508, l: 21470, c: 21478 },
  { o: 21478, h: 21482, l: 21455, c: 21462 },
  { o: 21462, h: 21500, l: 21450, c: 21495 },
  { o: 21495, h: 21518, l: 21482, c: 21510 },
  { o: 21510, h: 21515, l: 21460, c: 21468 },
  { o: 21468, h: 21474, l: 21420, c: 21430 },
  { o: 21430, h: 21436, l: 21395, c: 21405 },
  { o: 21405, h: 21430, l: 21398, c: 21422 },
  { o: 21422, h: 21426, l: 21380, c: 21388 },
  { o: 21388, h: 21394, l: 21340, c: 21350 },
  { o: 21350, h: 21378, l: 21338, c: 21370 },
  { o: 21370, h: 21374, l: 21335, c: 21342 },
  { o: 21342, h: 21348, l: 21300, c: 21310 },
  { o: 21310, h: 21316, l: 21260, c: 21270 },
  { o: 21270, h: 21300, l: 21258, c: 21292 },
  { o: 21292, h: 21296, l: 21255, c: 21262 },
  { o: 21262, h: 21266, l: 21200, c: 21210 },
  { o: 21210, h: 21216, l: 21150, c: 21160 },
  { o: 21160, h: 21188, l: 21148, c: 21180 },
  { o: 21180, h: 21184, l: 21140, c: 21148 },
  { o: 21148, h: 21152, l: 21100, c: 21108 },
  { o: 21108, h: 21150, l: 21095, c: 21140 },
  { o: 21140, h: 21148, l: 21085, c: 21095 },
  { o: 21095, h: 21100, l: 21030, c: 21038 },
  { o: 21038, h: 21070, l: 21020, c: 21062 },
];
export const NOISE_QUIZ_TWO_H: CandleBar[] = [
  { o: 21200, h: 21260, l: 20980, c: 21020 },
  { o: 21020, h: 21120, l: 20960, c: 21080 },
  { o: 21080, h: 21150, l: 21000, c: 21040 },
  { o: 21040, h: 21160, l: 21010, c: 21120 },
  { o: 21120, h: 21220, l: 21080, c: 21200 },
  { o: 21200, h: 21420, l: 21180, c: 21400 },
  { o: 21400, h: 21520, l: 21360, c: 21500 },
  { o: 21500, h: 21610, l: 21470, c: 21590 },
  { o: 21590, h: 21700, l: 21560, c: 21680 },
  { o: 21680, h: 21830, l: 21650, c: 21800 },
  { o: 21800, h: 21900, l: 21750, c: 21860 },
  { o: 21860, h: 21880, l: 21620, c: 21650 },
  { o: 21650, h: 21690, l: 21600, c: 21630 },
  { o: 21630, h: 21930, l: 21440, c: 21460 },
  { o: 21460, h: 21520, l: 21340, c: 21360 },
  { o: 21360, h: 21400, l: 21150, c: 21180 },
  { o: 21180, h: 21220, l: 21030, c: 21062 },
];

/* ---------- S12 tfMenu (teach) ---------- */

export const TF_MENU_TEACH = {
  kicker: "The common timeframes",
  title: "From seconds to weeks",
  prompt:
    "Traders cluster around a handful of timeframes: 1m and 5m for scalpers, 15m and 1h for intraday traders, 4h and daily for swing traders, weekly for investors. The slower you trade, the higher the timeframe you live on.",
};
export const TF_MENU_ROWS: Array<{ tf: string; who: string; span: string; color: string }> = [
  { tf: "1m · 5m", who: "Scalpers", span: "seconds to minutes", color: "#ff8f8f" },
  { tf: "15m · 1h", who: "Intraday traders", span: "hours, closed by 3:30", color: "#88C9F7" },
  { tf: "4h · Daily", who: "Swing traders", span: "days to weeks", color: "#F7C325" },
  { tf: "Weekly", who: "Investors", span: "months to years", color: "#22c55e" },
];

/* ---------- S13 matchQuiz (mcq) ---------- */

export const MATCH_QUIZ = {
  kicker: "Check",
  title: "Match the trader",
  prompt: "A swing trader holds positions for several days to a couple of weeks. Which timeframe should be their main chart?",
  options: ["1-minute — maximum precision", "5-minute — a good all-rounder", "Daily — it matches how long they hold"],
  correctIndex: 2,
  fb: {
    hint: "Match the candle to the holding period. If a trade lasts days, how much should one candle cover?",
    correct: "The daily. Your main timeframe should match your holding period — days held, daily candles.",
    wrong: "The daily chart matches a multi-day hold. A 1-minute chart would bury a days-long trade in thousands of irrelevant candles.",
  },
};

/* ---------- S14 htfContext (teach) ---------- */

export const HTF_CONTEXT = {
  kicker: "Using two together",
  title: "Context above, timing below",
  prompt:
    "Timeframes are not rivals — they do different jobs. The higher timeframe tells you the direction and the important levels: your context. The lower timeframe tells you exactly when to get in: your timing. You need both.",
};

/* ---------- S15 topDown (teach) ---------- */

export const TOP_DOWN = {
  kicker: "The workflow",
  title: "Work top-down",
  prompt:
    "The professional habit is to start high and drill down. Read the daily for the trend, drop to the 1-hour to find the level price is reacting to, then use the 15-minute to time your entry. Direction first, precision last — never the reverse.",
};
export const TOP_DOWN_STEPS: Array<{ n: string; tf: string; job: string; color: string }> = [
  { n: "1", tf: "Daily", job: "What is the trend?", color: "#F7C325" },
  { n: "2", tf: "1-hour", job: "Which level is price at?", color: "#88C9F7" },
  { n: "3", tf: "15-min", job: "Time the entry", color: "#22c55e" },
];

/* ---------- S16 conflictQuiz (mcq) ---------- */

export const CONFLICT_QUIZ = {
  kicker: "When they disagree",
  title: "Two charts, two answers",
  prompt: "Your 5-minute chart is rallying and screaming buy. The daily chart shows a clear downtrend. Which one should carry more weight?",
  options: ["The 5-minute — it reflects what is happening right now", "The daily — the higher timeframe sets the real context", "Neither, the setup cancels out"],
  correctIndex: 1,
  fb: {
    hint: "One chart is built from a few minutes of trading, the other from months. Which represents more real participation?",
    correct: "The daily. Higher-timeframe price action is stronger context — a 5-minute rally against a daily downtrend is usually just a bounce.",
    wrong: "The daily wins. Higher timeframes carry more weight; that 5-minute rally is most likely a short-lived bounce inside a bigger downtrend.",
  },
};
export const CONFLICT_QUIZ_UP: CandleBar[] = [
  { o: 22040, h: 22050, l: 22030, c: 22046 },
  { o: 22046, h: 22074, l: 22042, c: 22052 },
  { o: 22052, h: 22056, l: 22038, c: 22044 },
  { o: 22044, h: 22086, l: 22040, c: 22080 },
  { o: 22080, h: 22084, l: 22066, c: 22072 },
  { o: 22072, h: 22078, l: 22058, c: 22064 },
  { o: 22064, h: 22108, l: 22060, c: 22102 },
  { o: 22102, h: 22106, l: 22086, c: 22092 },
  { o: 22092, h: 22132, l: 22088, c: 22128 },
  { o: 22128, h: 22134, l: 22110, c: 22116 },
  { o: 22116, h: 22120, l: 22098, c: 22104 },
  { o: 22104, h: 22162, l: 22100, c: 22156 },
];
export const CONFLICT_QUIZ_DAILY: CandleBar[] = buildDailyRandomWalk(
  550019,
  [
    { n: 3, d: -1 },
    { n: 3, d: 0.55 },
    { n: 3, d: -1 },
    { n: 3, d: 0.5 },
    { n: 3, d: -1 },
    { n: 3, d: 0.45 },
    { n: 3, d: -1 },
    { n: 3, d: 0.4 },
    { n: 3, d: -1 },
    { n: 3, d: 0.35 },
    { n: 3, d: -1 },
    { n: 3, d: 0.32 },
  ],
  22860,
);

/* ---------- S17 alignment (teach) ---------- */

export const ALIGNMENT_TEACH = {
  kicker: "Alignment",
  title: "When timeframes agree",
  prompt:
    "The best setups are the ones where your timeframes point the same way: the daily trending up, the 1-hour holding support, the 15-minute turning back up. Alignment does not guarantee anything — it simply stacks the odds in your favour.",
};
export const ALIGNMENT_ROWS: Array<{ tf: string; note: string; color: string }> = [
  { tf: "Daily", note: "trending up", color: "#F7C325" },
  { tf: "1-hour", note: "holding support", color: "#88C9F7" },
  { tf: "15-min", note: "turning back up", color: "#22c55e" },
];
export const ALIGNMENT_SUMMARY = "All three agree → the odds are stacked in your favour";

/* ---------- S18 bossTap (tap) ---------- */

export const BOSS_TAP = {
  kicker: "Market Replay · Boss",
  title: "Find the hour that holds it",
  prompt: "Below is the 1-hour chart of a session. That sharp 12-candle selloff you saw on the 5-minute chart happened entirely inside ONE of these hourly candles. Tap it.",
  target: 3,
  fb: {
    hint: "You are looking for the one bearish hourly candle in the middle of the climb — twelve red 5-minute candles roll up into a single red hour.",
    correct: "That is it. Twelve panicky 5-minute candles compress into one ordinary red hourly candle inside an uptrend.",
    wrong: "It is the red candle in the middle of the uptrend — that single hour contains the entire 5-minute selloff. Highlighted now.",
  },
};
export const BOSS_H1: CandleBar[] = [
  { o: 22040, h: 22090, l: 22020, c: 22078 },
  { o: 22078, h: 22130, l: 22065, c: 22120 },
  { o: 22120, h: 22170, l: 22108, c: 22160 },
  { o: 22160, h: 22178, l: 21960, c: 21985 },
  { o: 21985, h: 22045, l: 21975, c: 22030 },
  { o: 22030, h: 22095, l: 22018, c: 22085 },
  { o: 22085, h: 22150, l: 22072, c: 22140 },
  { o: 22140, h: 22210, l: 22128, c: 22198 },
];

/* ---------- S19 bossDecide (mcq) ---------- */

export const BOSS_DECIDE = {
  kicker: "Market Replay · Boss",
  title: "So what do you do?",
  prompt: "You were about to short that 5-minute breakdown. Then you checked the 1-hour and saw the selloff was one red candle inside a strong uptrend. Your move?",
  options: ["Short anyway — the 5-minute signal was clear", "Short, but with a wider stop", "Stand down, or look to buy the pullback with the higher-timeframe trend"],
  correctIndex: 2,
  fb: {
    hint: "The higher timeframe sets the context, and it says up. Does shorting agree with it, or fight it?",
    correct: "Stand down or buy with the trend. Price rallied to new highs the next hour — the higher timeframe told you which way to lean.",
    wrong: "Shorting fights the higher-timeframe uptrend. The disciplined read is to stand down or buy the pullback — price made new highs the next hour.",
  },
};
export const BOSS_DECIDE_PRE: CandleBar[] = [
  { o: 22000, h: 22045, l: 21985, c: 22038 },
  { o: 22038, h: 22070, l: 22020, c: 22062 },
  { o: 22062, h: 22068, l: 22025, c: 22034 },
  { o: 22034, h: 22105, l: 22030, c: 22096 },
  { o: 22096, h: 22140, l: 22082, c: 22128 },
  { o: 22128, h: 22205, l: 22120, c: 22195 },
  { o: 22195, h: 22202, l: 22140, c: 22150 },
  { o: 22150, h: 22165, l: 22095, c: 22105 },
  { o: 22105, h: 22135, l: 22088, c: 22125 },
  { o: 22125, h: 22185, l: 22118, c: 22175 },
  { o: 22175, h: 22182, l: 22145, c: 22155 },
  { o: 22155, h: 22240, l: 22150, c: 22230 },
  { o: 22230, h: 22285, l: 22215, c: 22272 },
  { o: 22272, h: 22280, l: 22245, c: 22255 },
  { o: 22255, h: 22355, l: 22250, c: 22345 },
  { o: 22345, h: 22352, l: 22300, c: 22310 },
  { o: 22310, h: 22322, l: 22268, c: 22278 },
  { o: 22278, h: 22300, l: 22262, c: 22292 },
  { o: 22292, h: 22296, l: 22240, c: 22250 },
  { o: 22250, h: 22258, l: 22218, c: 22226 },
];
export const BOSS_DECIDE_CONT: CandleBar[] = [
  { o: 22226, h: 22290, l: 22220, c: 22282 },
  { o: 22282, h: 22320, l: 22270, c: 22312 },
  { o: 22312, h: 22318, l: 22285, c: 22295 },
  { o: 22295, h: 22380, l: 22290, c: 22370 },
  { o: 22370, h: 22440, l: 22360, c: 22428 },
];
/** ~50% retracement of the 22088→22355 swing inside BOSS_DECIDE_PRE. */
export const BOSS_DECIDE_FIB = 22221;

/* ---------- S20 summary ---------- */

export const BADGE_TITLE = "You can read timeframes now";
export const BADGE_SUBTITLE =
  "You know a candle measures time, how candles aggregate across timeframes, why lower timeframes are noisier, and how to work top-down from context to timing.";
export const CHECKLIST_ITEMS = [
  "A candle measures time, not movement",
  "How many candles merge into one",
  "How candles aggregate (O·H·L·C)",
  "Same data looks different per timeframe",
  "Lower timeframe = more noise",
  "Which timeframe suits which trader",
  "Context above, timing below",
  "Higher timeframe wins conflicts",
];
