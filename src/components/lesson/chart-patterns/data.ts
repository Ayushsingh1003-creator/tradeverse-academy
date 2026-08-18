import type { MiniSlopeSpec, PatternLevelSpec, PatternMarkSpec, PatternShape } from "./geometry";

/* ================================================================
 * Scene roster — mirrors the design prototype's SC array (29 scenes).
 * SCENE_TYPES drives readiness/scoring logic; SECTION_META drives the
 * header badge + progress bar, the same way every sibling lesson's
 * data.ts does. The design's "pattern" type folds into "mcq" (a chart above
 * McqOptions is functionally identical); "candle" reuses trend-lines'
 * CandleOptions pattern.
 * ================================================================ */

export type SceneType = "teach" | "mcq" | "tap" | "candle" | "summary";

export const SCENE_TYPES: SceneType[] = [
  "teach", // 0 intro
  "teach", // 1 hook
  "teach", // 2 whatIs
  "mcq", // 3 intuition
  "teach", // 4 supplyDemand
  "teach", // 5 whyForm
  "teach", // 6 reversalIntro
  "teach", // 7 doubleTop
  "teach", // 8 doubleBottom
  "tap", // 9 tapNeckline
  "teach", // 10 headShoulders
  "teach", // 11 invHS
  "teach", // 12 triples
  "mcq", // 13 idReversal
  "teach", // 14 continIntro
  "teach", // 15 flagsPennants
  "teach", // 16 triangles
  "teach", // 17 rectangles
  "mcq", // 18 idContin
  "teach", // 19 psychology
  "teach", // 20 context
  "mcq", // 21 contextQuiz
  "teach", // 22 breakouts
  "candle", // 23 falseBreak
  "teach", // 24 failure
  "teach", // 25 howTo
  "tap", // 26 bossTap
  "mcq", // 27 bossDecide
  "summary", // 28 summary
];

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // 0
  { title: "Price draws the same shapes", kind: "learn" }, // 1
  { title: "A pattern is a picture of behaviour", kind: "learn" }, // 2
  { title: "Make a prediction", kind: "quiz" }, // 3
  { title: "Supply meets demand", kind: "learn" }, // 4
  { title: "Crowds behave predictably", kind: "learn" }, // 5
  { title: "Six reversal patterns", kind: "learn" }, // 6
  { title: "Double top", kind: "learn" }, // 7
  { title: "Double bottom", kind: "learn" }, // 8
  { title: "Tap the neckline", kind: "quiz" }, // 9
  { title: "Head & shoulders", kind: "learn" }, // 10
  { title: "Inverse head & shoulders", kind: "learn" }, // 11
  { title: "Triple top & bottom", kind: "learn" }, // 12
  { title: "Identify the pattern", kind: "quiz" }, // 13
  { title: "Six continuation patterns", kind: "learn" }, // 14
  { title: "Flags & pennants", kind: "learn" }, // 15
  { title: "The three triangles", kind: "learn" }, // 16
  { title: "Rectangles", kind: "learn" }, // 17
  { title: "Identify the pattern", kind: "quiz" }, // 18
  { title: "The psychology underneath", kind: "learn" }, // 19
  { title: "Reading in context", kind: "learn" }, // 20
  { title: "Same shape, different odds", kind: "quiz" }, // 21
  { title: "The break is the trigger", kind: "learn" }, // 22
  { title: "Confirm the break", kind: "quiz" }, // 23
  { title: "When patterns fail", kind: "learn" }, // 24
  { title: "The five-step routine", kind: "learn" }, // 25
  { title: "Market Replay: the neckline", kind: "quiz" }, // 26
  { title: "Market Replay: the decision", kind: "quiz" }, // 27
  { title: "Complete", kind: "done" }, // 28
];

export const TOTAL_STEPS = SECTION_META.length - 1; // 28

/* ================================================================
 * S0 intro
 * ================================================================ */

export const INTRO_KICKER = "Chart Patterns";
export const INTRO_TITLE_LINE1 = "Price draws";
export const INTRO_TITLE_LINE2 = "the same shapes.";
export const INTRO_SUBTITLE =
  "Every pattern is a picture of buyers and sellers fighting. Learn to read the shapes, wait for confirmation, and trade probabilities.";
export const INTRO_CHIPS = ["What patterns are", "Reversals & continuations", "Why they form", "Breakouts & confirmation", "When they fail"];

/* ---------- S1 hook ---------- */

export const HOOK = {
  kicker: "Chart patterns · Lesson",
  title: "Price draws the same shapes",
  prompt:
    "Look at this chart. Price rallies, stalls at a ceiling, tries twice, fails, and rolls over. That shape has a name — a double top. It isn't magic. It's a picture of buyers running out of strength at the same price twice.",
};

/* ---------- S2 whatIs ---------- */

export const WHATIS = {
  kicker: "What they are",
  title: "A pattern is a picture of behaviour",
  prompt:
    "A chart pattern is a recognisable shape formed by price over time. Traders use them because the same crowd behaviour tends to produce the same shape — and the same shape often resolves the same way. It's a shorthand for the fight between buyers and sellers.",
};

/* ---------- S3 intuition (mcq) ---------- */

export const INTUITION_MCQ = {
  kicker: "Intuition check",
  title: "Make a prediction first",
  prompt:
    "Price pushed up to the same ceiling twice and got knocked back both times. Before we name anything — what does that most likely tell you?",
  options: ["Buyers are getting stronger", "Sellers are defending that price and buyers are failing there", "It means nothing at all"],
  correctIndex: 1,
  hiddenFrom: 72,
  fb: {
    hint: "Two attempts at the same price, two rejections. Who won both times?",
    correct: "Sellers are defending that level. Two failed attempts is a sign buyers could not break through.",
    wrong: "Two rejections at the same price means sellers won both times — buyers failed there. That is what the shape is telling you.",
  },
};

/* ---------- S4 supplyDemand ---------- */

export const SUPPLY_DEMAND = {
  kicker: "Supply & demand",
  title: "Every pattern is supply meeting demand",
  prompt:
    "Price moves because one side is more urgent than the other. More demand than supply, price rises. More supply than demand, price falls. Patterns form because that imbalance plays out in a repeatable way at levels traders are all watching.",
};

/* ---------- S5 whyForm ---------- */

export const WHY_FORM = {
  kicker: "Why patterns form",
  title: "Crowds behave predictably",
  prompt:
    "At a ceiling, sellers place orders and buyers hesitate. When it fails twice, the buyers who bought there start to doubt. Sellers press. That shared hesitation and shared conviction is what carves a shape into the chart.",
};

/* ---------- S6 reversalIntro ---------- */

export const REVERSAL_INTRO = {
  kicker: "Reversal patterns",
  title: "Reversals: the trend runs out",
  prompt:
    "Reversal patterns form when a trend is losing control. Price tries to continue, fails repeatedly at the same area, and then turns. The six you must know are the double top and bottom, head & shoulders and its inverse, and the triple top and bottom.",
};

export type MiniCardConfig = {
  title: string;
  shape: PatternShape;
  note?: string;
  accent?: string;
  levels?: PatternLevelSpec[];
  slopes?: MiniSlopeSpec[];
  marks?: PatternMarkSpec[];
  shapeOutline?: Array<[number, number]>;
  W?: number;
  H?: number;
};

export const REVERSAL_CARDS_ROW1: MiniCardConfig[] = [
  {
    title: "Double top",
    shape: "dtop",
    note: "two failures at a ceiling",
    accent: "#ff8f8f",
    levels: [{ y: 21, color: "#FF5D5D" }, { y: 52, color: "#456DFF" }],
    marks: [
      { px: 26, py: 22, label: "1", color: "#FF5D5D" },
      { px: 66, py: 20, label: "2", color: "#FF5D5D" },
      { px: 46, py: 52, label: "neck", color: "#456DFF", below: true },
    ],
    shapeOutline: [[2, 74], [26, 22], [46, 52], [66, 20], [98, 80]],
  },
  {
    title: "Head & shoulders",
    shape: "hs",
    note: "high peak between two lower peaks",
    accent: "#ff8f8f",
    levels: [{ y: 60, color: "#456DFF" }],
    marks: [
      { px: 23, py: 42, label: "S", color: "#88C9F7" },
      { px: 51, py: 16, label: "H", color: "#F7C325" },
      { px: 79, py: 30, label: "S", color: "#88C9F7" },
    ],
    shapeOutline: [[2, 78], [23, 42], [37, 60], [51, 16], [65, 60], [79, 30], [98, 84]],
  },
  {
    title: "Triple top",
    shape: "ttop",
    note: "three failures — well defended",
    accent: "#ff8f8f",
    levels: [{ y: 22, color: "#FF5D5D" }, { y: 56, color: "#456DFF" }],
    marks: [
      { px: 20, py: 23, label: "1", color: "#FF5D5D" },
      { px: 48, py: 22, label: "2", color: "#FF5D5D" },
      { px: 76, py: 24, label: "3", color: "#FF5D5D" },
    ],
  },
];

export const REVERSAL_CARDS_ROW2: MiniCardConfig[] = [
  {
    title: "Double bottom",
    shape: "dbot",
    note: "two failures at a floor",
    levels: [{ y: 79, color: "#456DFF" }, { y: 48, color: "#F7C325" }],
    marks: [
      { px: 26, py: 78, label: "1", color: "#88C9F7", below: true },
      { px: 66, py: 80, label: "2", color: "#88C9F7", below: true },
      { px: 46, py: 48, label: "neck", color: "#F7C325" },
    ],
    shapeOutline: [[2, 26], [26, 78], [46, 48], [66, 80], [98, 20]],
  },
  {
    title: "Inverse H&S",
    shape: "ihs",
    note: "deep low between two higher lows",
    levels: [{ y: 40, color: "#F7C325" }],
    marks: [
      { px: 23, py: 58, label: "S", color: "#88C9F7", below: true },
      { px: 51, py: 84, label: "H", color: "#F7C325", below: true },
      { px: 79, py: 70, label: "S", color: "#88C9F7", below: true },
    ],
    shapeOutline: [[2, 22], [23, 58], [37, 40], [51, 84], [65, 40], [79, 70], [98, 16]],
  },
  {
    title: "Triple bottom",
    shape: "tbot",
    note: "three failures at the floor",
    levels: [{ y: 78, color: "#456DFF" }, { y: 44, color: "#F7C325" }],
    marks: [
      { px: 20, py: 77, label: "1", color: "#88C9F7", below: true },
      { px: 48, py: 78, label: "2", color: "#88C9F7", below: true },
      { px: 76, py: 76, label: "3", color: "#88C9F7", below: true },
    ],
  },
];

/* ---------- S7 doubleTop ---------- */

export const DOUBLE_TOP = {
  kicker: "Reversal · 1",
  title: "Double top",
  prompt:
    "Two failed pushes into the same ceiling, separated by a dip. The low between them is the neckline. When price closes below that neckline, the pattern completes and the trend is considered reversed. Shape: an M.",
};

/* ---------- S8 doubleBottom ---------- */

export const DOUBLE_BOTTOM = {
  kicker: "Reversal · 2",
  title: "Double bottom",
  prompt:
    "The mirror image. Two failed pushes into the same floor, separated by a bounce. The high between them is the neckline. A close above it completes the pattern. Shape: a W.",
};

/* ---------- S9 tapNeckline (tap) ---------- */

export const TAP_NECKLINE = {
  kicker: "Your turn",
  title: "Tap the neckline",
  prompt: "This is a double top. Tap the neckline — the level that has to break for the pattern to complete.",
  pyMin: 44,
  pyMax: 62,
  fb: {
    hint: "The neckline on a double top is the LOW between the two peaks — not the peaks themselves.",
    correct: "That is the neckline. A close below it completes the double top.",
    wrong: "You tapped near the peaks. The neckline is the dip BETWEEN them — marked now.",
  },
};

/* ---------- S10 headShoulders ---------- */

export const HEAD_SHOULDERS = {
  kicker: "Reversal · 3",
  title: "Head & shoulders",
  prompt:
    "Three pushes: a peak, a higher peak, then a lower peak. Buyers made a new high, then failed to match it. Connect the two lows to draw the neckline. A close below it signals the reversal.",
};

/* ---------- S11 invHS ---------- */

export const INV_HS = {
  kicker: "Reversal · 4",
  title: "Inverse head & shoulders",
  prompt:
    "The same structure upside down, forming at the bottom of a downtrend: a low, a deeper low, then a higher low. Sellers could not make a new low. A close above the neckline signals the reversal up.",
};

/* ---------- S12 triples ---------- */

export const TRIPLES = {
  kicker: "Reversal · 5 & 6",
  title: "Triple top & triple bottom",
  prompt:
    "The same idea as a double, with a third attempt. Three failures at the same ceiling (or floor) means the level is well defended. Fewer of these form, but when they do the level carries more weight.",
};

export const TRIPLES_CARDS: MiniCardConfig[] = [
  { title: "Triple top", shape: "ttop", note: "three rejections at one ceiling", levels: [{ y: 22, color: "#FF5D5D" }, { y: 52, color: "#456DFF" }], W: 400, H: 210 },
  { title: "Triple bottom", shape: "tbot", note: "three defences of one floor", levels: [{ y: 78, color: "#456DFF" }, { y: 44, color: "#F7C325" }], W: 400, H: 210 },
];

/* ---------- S13 idReversal (mcq / "pattern") ---------- */

export const ID_REVERSAL_MCQ = {
  kicker: "Identify it",
  title: "Which pattern is this?",
  prompt: "Read the shape: a peak, then a higher peak, then a lower peak, with two lows forming a neckline. What is it?",
  shape: "hs" as PatternShape,
  options: ["Double top", "Triple top", "Head & shoulders", "Double bottom"],
  correctIndex: 2,
  fb: {
    hint: "Count the peaks and compare their heights. One is clearly taller than the two on either side.",
    correct: "Head & shoulders — a high peak (the head) between two lower peaks (the shoulders).",
    wrong: "It is a head & shoulders: the middle peak is the highest, with a lower shoulder on each side.",
  },
};

/* ---------- S14 continIntro ---------- */

export const CONTIN_INTRO = {
  kicker: "Continuation patterns",
  title: "Continuations: a pause, not a turn",
  prompt:
    "Continuation patterns form when a trend pauses to catch its breath. Price consolidates in a tight shape, then usually resumes in the original direction. Flags, pennants, the three triangles, and rectangles.",
};

export const CONTIN_CARDS_ROW1: MiniCardConfig[] = [
  {
    title: "Flag",
    shape: "flag",
    note: "sharp pole, small drift",
    slopes: [
      { p1: [36, 0], p2: [78, 0], thru: [[44, 30], [72, 42]], color: "#456DFF" },
      { p1: [36, 0], p2: [78, 0], thru: [[38, 40], [66, 52]], color: "#456DFF" },
    ],
    marks: [
      { px: 18, py: 50, label: "pole", color: "#F7C325" },
      { px: 80, py: 26, label: "break", color: "#22C55E" },
    ],
  },
  {
    title: "Pennant",
    shape: "pennant",
    note: "pole, then a tight squeeze",
    slopes: [
      { p1: [34, 0], p2: [78, 0], thru: [[32, 20], [64, 34]], color: "#456DFF" },
      { p1: [34, 0], p2: [78, 0], thru: [[40, 44], [72, 37]], color: "#456DFF" },
    ],
    marks: [
      { px: 22, py: 44, label: "pole", color: "#F7C325" },
      { px: 80, py: 22, label: "break", color: "#22C55E" },
    ],
  },
  {
    title: "Rectangle",
    shape: "rect",
    note: "flat ceiling & floor",
    levels: [{ y: 29, color: "#FF5D5D" }, { y: 67, color: "#456DFF" }],
    marks: [
      { px: 18, py: 30, color: "#FF5D5D" },
      { px: 50, py: 30, color: "#FF5D5D" },
      { px: 26, py: 66, color: "#88C9F7", below: true },
      { px: 58, py: 66, color: "#88C9F7", below: true },
      { px: 84, py: 26, label: "break", color: "#22C55E" },
    ],
  },
];

export const CONTIN_CARDS_ROW2: MiniCardConfig[] = [
  {
    title: "Ascending triangle",
    shape: "ascTri",
    note: "flat ceiling, rising lows",
    levels: [{ y: 26, color: "#FF5D5D" }],
    slopes: [{ p1: [6, 0], p2: [72, 0], thru: [[26, 50], [58, 36]], color: "#456DFF" }],
    marks: [
      { px: 18, py: 26, color: "#FF5D5D" },
      { px: 34, py: 26, color: "#FF5D5D" },
      { px: 50, py: 26, color: "#FF5D5D" },
      { px: 26, py: 50, color: "#88C9F7", below: true },
      { px: 42, py: 42, color: "#88C9F7", below: true },
      { px: 74, py: 18, label: "break", color: "#22C55E" },
    ],
  },
  {
    title: "Descending triangle",
    shape: "descTri",
    note: "flat floor, falling highs",
    levels: [{ y: 74, color: "#456DFF" }],
    slopes: [{ p1: [6, 0], p2: [72, 0], thru: [[26, 50], [58, 64]], color: "#FF5D5D" }],
    marks: [
      { px: 18, py: 74, color: "#88C9F7", below: true },
      { px: 34, py: 74, color: "#88C9F7", below: true },
      { px: 50, py: 74, color: "#88C9F7", below: true },
      { px: 26, py: 50, color: "#FF5D5D" },
      { px: 42, py: 58, color: "#FF5D5D" },
      { px: 74, py: 82, label: "break", color: "#FF5D5D", below: true },
    ],
  },
  {
    title: "Symmetrical triangle",
    shape: "symTri",
    note: "squeezing from both sides",
    slopes: [
      { p1: [16, 0], p2: [78, 0], thru: [[18, 20], [66, 42]], color: "#FF5D5D" },
      { p1: [16, 0], p2: [78, 0], thru: [[26, 66], [58, 52]], color: "#456DFF" },
    ],
    marks: [{ px: 84, py: 22, label: "break", color: "#22C55E" }],
  },
];

/* ---------- S15 flagsPennants ---------- */

export const FLAGS_PENNANTS = {
  kicker: "Continuation · 1 & 2",
  title: "Flags & pennants",
  prompt:
    "Both follow a sharp move — the flagpole. A flag drifts sideways or slightly against the trend in a small parallel channel. A pennant squeezes into a tiny symmetrical triangle. Both usually break in the direction of the pole.",
};

export const FLAGS_PENNANTS_CARDS: MiniCardConfig[] = [
  {
    title: "Flag",
    shape: "flag",
    note: "A sharp move (the pole), then a small parallel drift against the trend, then continuation.",
    W: 400,
    H: 210,
    slopes: [
      { p1: [36, 0], p2: [78, 0], thru: [[44, 30], [72, 42]], color: "#456DFF" },
      { p1: [36, 0], p2: [78, 0], thru: [[38, 40], [66, 52]], color: "#456DFF" },
    ],
    marks: [
      { px: 18, py: 50, label: "POLE", color: "#F7C325", below: true },
      { px: 44, py: 30, color: "#88C9F7" },
      { px: 58, py: 36, color: "#88C9F7" },
      { px: 72, py: 42, color: "#88C9F7" },
      { px: 38, py: 40, color: "#88C9F7", below: true },
      { px: 52, py: 46, color: "#88C9F7", below: true },
      { px: 66, py: 52, color: "#88C9F7", below: true },
      { px: 80, py: 26, label: "BREAK ▲", color: "#22C55E" },
    ],
  },
  {
    title: "Pennant",
    shape: "pennant",
    note: "Same pole, but the pause squeezes into a tiny symmetrical triangle before it resumes.",
    W: 400,
    H: 210,
    slopes: [
      { p1: [34, 0], p2: [78, 0], thru: [[32, 20], [64, 34]], color: "#456DFF" },
      { p1: [34, 0], p2: [78, 0], thru: [[40, 44], [72, 37]], color: "#456DFF" },
    ],
    marks: [
      { px: 22, py: 44, label: "POLE", color: "#F7C325", below: true },
      { px: 40, py: 44, color: "#88C9F7", below: true },
      { px: 48, py: 30, color: "#88C9F7" },
      { px: 56, py: 40, color: "#88C9F7", below: true },
      { px: 64, py: 34, color: "#88C9F7" },
      { px: 80, py: 22, label: "BREAK ▲", color: "#22C55E" },
    ],
  },
];

/* ---------- S16 triangles ---------- */

export const TRIANGLES = {
  kicker: "Continuation · 3, 4 & 5",
  title: "The three triangles",
  prompt:
    "An ascending triangle has a flat ceiling and rising lows — buyers pressing up. A descending triangle has a flat floor and falling highs — sellers pressing down. A symmetrical triangle squeezes from both sides; it breaks either way, so wait for the break.",
};

export const TRIANGLES_CARDS: MiniCardConfig[] = [
  {
    title: "Ascending",
    shape: "ascTri",
    note: "flat ceiling, rising lows → buyers pressing",
    levels: [{ y: 26, color: "#FF5D5D" }],
    slopes: [{ p1: [6, 0], p2: [72, 0], thru: [[26, 50], [58, 36]], color: "#456DFF" }],
    marks: [{ px: 74, py: 18, label: "BREAK ▲", color: "#22C55E" }],
  },
  {
    title: "Descending",
    shape: "descTri",
    note: "flat floor, falling highs → sellers pressing",
    levels: [{ y: 74, color: "#456DFF" }],
    slopes: [{ p1: [6, 0], p2: [72, 0], thru: [[26, 50], [58, 64]], color: "#FF5D5D" }],
    marks: [{ px: 74, py: 82, label: "BREAK ▼", color: "#FF5D5D", below: true }],
  },
  {
    title: "Symmetrical",
    shape: "symTri",
    note: "both sides squeeze → wait for the break",
    slopes: [
      { p1: [16, 0], p2: [78, 0], thru: [[18, 20], [66, 42]], color: "#FF5D5D" },
      { p1: [16, 0], p2: [78, 0], thru: [[26, 66], [58, 52]], color: "#456DFF" },
    ],
    marks: [{ px: 84, py: 22, label: "BREAK ▲", color: "#22C55E" }],
  },
];

/* ---------- S17 rectangles ---------- */

export const RECTANGLES = {
  kicker: "Continuation · 6",
  title: "Rectangles",
  prompt:
    "Price bounces between a flat ceiling and a flat floor — a range. Neither side wins for a while. In a trend, a rectangle usually resolves in the trend's direction, but the break is what tells you, not the shape.",
};

/* ---------- S18 idContin (mcq / "pattern") ---------- */

export const ID_CONTIN_MCQ = {
  kicker: "Identify it",
  title: "Which pattern is this?",
  prompt: "Price is making higher lows into a flat ceiling, squeezing tighter with each attempt. What is it?",
  shape: "ascTri" as PatternShape,
  options: ["Ascending triangle", "Descending triangle", "Rectangle", "Double bottom"],
  correctIndex: 0,
  fb: {
    hint: "Look at the two boundaries. One is flat, one is sloping. Which way does the sloping one go?",
    correct: "Ascending triangle — a flat ceiling with rising lows. Buyers are pressing into the level.",
    wrong: "It is an ascending triangle: the ceiling is flat and the lows are rising, so buyers are squeezing price upward.",
  },
};

/* ---------- S19 psychology ---------- */

export const PSYCHOLOGY = {
  kicker: "Why they can work",
  title: "The psychology underneath",
  prompt:
    "Patterns can work because they map real behaviour. A level gets defended, so it becomes support or resistance. Attempts fail, so conviction shifts. Traders all watch the same shapes and place orders in the same places — which makes the break itself meaningful.",
};

/* ---------- S20 context ---------- */

export const CONTEXT = {
  kicker: "Reading in context",
  title: "A pattern alone is not a signal",
  prompt:
    "The same shape means different things in different places. Check the overall trend, the higher-timeframe structure, whether the pattern sits at key support or resistance, and whether momentum and volume agree. Context turns a shape into a setup.",
};

export const CONTEXT_ROWS: Array<{ label: string; text: string; color: string }> = [
  { label: "Trend", text: "Does the pattern agree with the direction?", color: "#F7C325" },
  { label: "Higher timeframe", text: "Is the bigger structure on your side?", color: "#88C9F7" },
  { label: "Key levels", text: "Is it forming at real support or resistance?", color: "#456DFF" },
  { label: "Momentum & volume", text: "Is participation confirming the move?", color: "#22c55e" },
];

/* ---------- S21 contextQuiz (mcq) ---------- */

export const CONTEXT_QUIZ_MCQ = {
  kicker: "Context check",
  title: "Same shape, different odds",
  prompt: "You spot a bullish flag. In which situation does it carry the best odds?",
  options: [
    "At the top of an extended rally, against a daily downtrend",
    "Mid-trend on a strong uptrend, sitting on higher-timeframe support",
    "In a dead sideways market with no trend at all",
  ],
  correctIndex: 1,
  fb: {
    hint: "A continuation pattern needs something to continue. Which option has a real trend behind it and support underneath?",
    correct: "Mid-trend with higher-timeframe support behind it. The pattern agrees with the context.",
    wrong: "The best odds come when the pattern agrees with the trend and sits at higher-timeframe support — not when it fights a bigger downtrend.",
  },
};

export const CONTEXT_QUIZ_CARDS: MiniCardConfig[] = [
  { title: "The flag", shape: "flag", note: "a pause inside a move", W: 400, H: 200, slopes: [{ p1: [38, 26], p2: [82, 34], color: "#456DFF" }, { p1: [38, 42], p2: [82, 50], color: "#456DFF" }] },
  { title: "Context decides", shape: "dtop", note: "the same shape, wrong place", accent: "#ff8f8f", W: 400, H: 200 },
];

/* ---------- S22 breakouts ---------- */

export const BREAKOUTS = {
  kicker: "Breakouts",
  title: "The break is the trigger",
  prompt:
    "A pattern is only complete when price breaks its boundary — the neckline on a reversal, the trendline on a continuation. Anticipating the break means entering before the market agrees with you. Waiting for a close beyond the level is the confirmation.",
};

/* ---------- S23 falseBreak (candle) ---------- */

export type CandleKind = "bull" | "hammer" | "bear" | "doji";

export const CANDLE_OPTIONS: Array<{ kind: CandleKind; label: string }> = [
  { kind: "hammer", label: "Long lower wick, recovers" },
  { kind: "bear", label: "Heavy red close below" },
  { kind: "doji", label: "Flat doji on the level" },
  { kind: "bull", label: "Strong green close back up" },
];

export const FALSE_BREAK = {
  kicker: "Confirm it",
  title: "Which close confirms the break?",
  prompt: "Price has just poked below the neckline of a double top. Which candle confirms the breakdown rather than trapping you?",
  correctIndex: 1,
  fb: {
    hint: "A confirmed break needs price to CLOSE beyond the level with conviction — not just wick through it and recover.",
    correct: "A heavy red close below the neckline. The body closing beyond the level is the confirmation.",
    wrong: "A long lower wick that recovers is a false break — a trap. The confirmation is a decisive close beyond the neckline.",
  },
};

/* ---------- S24 failure ---------- */

export const FAILURE = {
  kicker: "When patterns fail",
  title: "No pattern is guaranteed",
  prompt:
    "Patterns fail all the time. A false break traps early entries. Volatility and news can overwhelm any shape. A pattern that fights the higher-timeframe trend fails more often. Treat every pattern as a probability, never a prediction.",
};

export const FAILURE_ROWS: Array<{ label: string; text: string; color: string }> = [
  { label: "False breaks", text: "price pokes through, then snaps back", color: "#ff8f8f" },
  { label: "Volatility", text: "a wild session overwhelms any shape", color: "#F7C325" },
  { label: "News", text: "earnings, policy, shocks ignore patterns", color: "#88C9F7" },
  { label: "HTF conflict", text: "fighting the higher timeframe fails more", color: "#456DFF" },
];
export const FAILURE_NOTE = "A pattern is a probability, never a prediction";

/* ---------- S25 howTo ---------- */

export const HOW_TO = {
  kicker: "How to trade them",
  title: "The five-step routine",
  prompt:
    "Identify the pattern. Ask what supply and demand story it tells. Wait for the confirmed break. Define the price that proves you wrong — the invalidation. Size the position so that being wrong costs a small, planned amount.",
};

export const HOW_TO_STEPS: Array<{ n: string; label: string; text: string; color: string }> = [
  { n: "1", label: "Identify", text: "name the shape", color: "#F7C325" },
  { n: "2", label: "Understand", text: "what supply/demand story is it telling?", color: "#88C9F7" },
  { n: "3", label: "Confirm", text: "wait for the close beyond the boundary", color: "#456DFF" },
  { n: "4", label: "Invalidate", text: "decide the price that proves you wrong", color: "#ff8f8f" },
  { n: "5", label: "Size it", text: "risk a small, planned amount", color: "#22c55e" },
];

/* ---------- S26 bossTap ---------- */

export const BOSS_TAP = {
  kicker: "Market Replay · Boss",
  title: "An unseen chart",
  prompt: "Nifty, last week. This is an inverse head & shoulders. Tap the neckline — the level that must break for the pattern to complete.",
  pyMin: 32,
  pyMax: 50,
  fb: {
    hint: "On an inverse head & shoulders the neckline connects the two HIGHS between the three lows — above price, not below.",
    correct: "That is the neckline. A close above it completes the pattern and signals the reversal up.",
    wrong: "The neckline connects the two highs between the lows — it sits above the head, not at the lows. Marked now.",
  },
};

/* ---------- S27 bossDecide (mcq) ---------- */

export const BOSS_DECIDE = {
  kicker: "Market Replay · Boss",
  title: "The break happens",
  prompt: "Price closes decisively above the neckline on strong volume, and the daily trend is already up. What is the disciplined action?",
  options: [
    "Skip it — patterns never work",
    "Buy, but with no stop since the pattern is strong",
    "Buy the confirmed break, stop below the right shoulder, and size the risk",
  ],
  correctIndex: 2,
  fb: {
    hint: "Confirmation is there and context agrees. What is still missing from the plan?",
    correct:
      "Buy the confirmed break with a stop below the right shoulder and a planned position size. Price ran ₹420 higher — but the stop is what made it a trade, not a gamble.",
    wrong: "The setup is valid, but no trade is complete without an invalidation level and sized risk. Stop below the right shoulder.",
  },
};

/* ---------- S28 summary ---------- */

export const BADGE_TITLE = "You can read chart patterns now";
export const BADGE_SUBTITLE =
  "You can spot the six reversal and six continuation patterns, read the psychology behind them, wait for a confirmed break, and trade the setup with a defined invalidation.";
export const CHECKLIST_ITEMS = [
  "What a chart pattern is",
  "Six reversal patterns: double top/bottom, H&S, inverse H&S, triple top/bottom",
  "Six continuation patterns: flags, pennants, 3 triangles, rectangles",
  "The supply & demand story behind every pattern",
  "Reading patterns in context, not in isolation",
  "Breakouts & confirmed vs false breaks",
  "Why patterns fail",
  "The five-step trading routine",
];
