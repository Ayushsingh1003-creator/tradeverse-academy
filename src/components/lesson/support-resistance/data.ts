import type { CandleBar } from "./geometry";

/* ================================================================
 * Scene roster — mirrors the design prototype's SC array (26 scenes).
 * SCENE_TYPES drives readiness/scoring logic; SECTION_META drives the
 * header badge + progress bar, the same way every sibling lesson's
 * data.ts does.
 * ================================================================ */

export type SceneType = "teach" | "mcq" | "tap" | "tapMulti" | "dragZone" | "orders" | "spot" | "candle" | "summary";

export const SCENE_TYPES: SceneType[] = [
  "teach", // 0 intro
  "teach", // 1 hook
  "mcq", // 2 intuition
  "teach", // 3 memory
  "teach", // 4 support
  "teach", // 5 resistance
  "tap", // 6 tapSupport
  "teach", // 7 swing
  "tapMulti", // 8 tapSwing
  "teach", // 9 notmagic
  "teach", // 10 zoneteach
  "dragZone", // 11 dragZone
  "teach", // 12 touches
  "spot", // 13 spot
  "teach", // 14 react
  "candle", // 15 candlePredict
  "teach", // 16 reversal
  "teach", // 17 retest
  "tap", // 18 tapRetest
  "teach", // 19 quality
  "mcq", // 20 qualityCompare
  "teach", // 21 risk
  "orders", // 22 placeOrders
  "tap", // 23 bossTap
  "mcq", // 24 bossDecide
  "summary", // 25 summary
];

export const SECTION_META: Array<{ title: string; kind: "learn" | "quiz" | "done" }> = [
  { title: "Welcome", kind: "learn" }, // 0
  { title: "The price keeps stopping", kind: "learn" }, // 1
  { title: "Make a prediction", kind: "quiz" }, // 2
  { title: "Markets remember", kind: "learn" }, // 3
  { title: "Support is the floor", kind: "learn" }, // 4
  { title: "Resistance is the ceiling", kind: "learn" }, // 5
  { title: "Tap the support", kind: "quiz" }, // 6
  { title: "Swing highs & lows", kind: "learn" }, // 7
  { title: "Mark the swing lows", kind: "quiz" }, // 8
  { title: "Reactions, not magic", kind: "learn" }, // 9
  { title: "It's an area, not a line", kind: "learn" }, // 10
  { title: "Draw the support zone", kind: "quiz" }, // 11
  { title: "2 to draw, 3 to confirm", kind: "learn" }, // 12
  { title: "Spot the mistake", kind: "quiz" }, // 13
  { title: "Read the candle", kind: "learn" }, // 14
  { title: "Predict the candle", kind: "quiz" }, // 15
  { title: "Broken resistance flips", kind: "learn" }, // 16
  { title: "The break-and-retest", kind: "learn" }, // 17
  { title: "Where would you enter?", kind: "quiz" }, // 18
  { title: "Strong vs weak levels", kind: "learn" }, // 19
  { title: "Pick the stronger level", kind: "quiz" }, // 20
  { title: "Entry, stop, and target", kind: "learn" }, // 21
  { title: "Place your orders", kind: "quiz" }, // 22
  { title: "Market Replay: the level", kind: "quiz" }, // 23
  { title: "Market Replay: the decision", kind: "quiz" }, // 24
  { title: "Complete", kind: "done" }, // 25
];

export const TOTAL_STEPS = SECTION_META.length - 1; // 25

/* ================================================================
 * Candle datasets — ported verbatim from the design's SC/Component
 * fields (search `A = [`, `NM = [`, etc. in support-resistance-design.html).
 * The design's `C`/`Cmin`/`Cmax` dataset is dead data (declared but never
 * referenced in stageEl()) and is intentionally skipped.
 * ================================================================ */

export const A_MIN = 21900;
export const A_MAX = 22500;
export const A: CandleBar[] = [
  { o: 22318, h: 22410, l: 22300, c: 22372 },
  { o: 22372, h: 22392, l: 22300, c: 22322 },
  { o: 22322, h: 22345, l: 22210, c: 22232 },
  { o: 22232, h: 22258, l: 22090, c: 22112 },
  { o: 22112, h: 22128, l: 21988, c: 22068 },
  { o: 22068, h: 22156, l: 22050, c: 22140 },
  { o: 22140, h: 22168, l: 22095, c: 22110 },
  { o: 22110, h: 22300, l: 22098, c: 22280 },
  { o: 22280, h: 22405, l: 22262, c: 22330 },
  { o: 22330, h: 22350, l: 22240, c: 22258 },
  { o: 22258, h: 22278, l: 22150, c: 22168 },
  { o: 22168, h: 22190, l: 22055, c: 22072 },
  { o: 22072, h: 22085, l: 21990, c: 22040 },
  { o: 22040, h: 22180, l: 22030, c: 22165 },
  { o: 22165, h: 22205, l: 22120, c: 22135 },
  { o: 22135, h: 22260, l: 22120, c: 22245 },
  { o: 22245, h: 22400, l: 22232, c: 22300 },
  { o: 22300, h: 22330, l: 22180, c: 22200 },
  { o: 22200, h: 22230, l: 22150, c: 22215 },
  { o: 22215, h: 22240, l: 22060, c: 22078 },
  { o: 22078, h: 22095, l: 21996, c: 22052 },
  { o: 22052, h: 22150, l: 22040, c: 22138 },
  { o: 22138, h: 22185, l: 22110, c: 22125 },
  { o: 22125, h: 22270, l: 22112, c: 22255 },
];

export const NM_MIN = 22080;
export const NM_MAX = 22600;
export const NM: CandleBar[] = [
  { o: 22150, h: 22190, l: 22120, c: 22175 },
  { o: 22175, h: 22280, l: 22160, c: 22265 },
  { o: 22265, h: 22405, l: 22250, c: 22320 },
  { o: 22320, h: 22345, l: 22230, c: 22248 },
  { o: 22248, h: 22270, l: 22180, c: 22200 },
  { o: 22200, h: 22290, l: 22185, c: 22278 },
  { o: 22278, h: 22300, l: 22240, c: 22260 },
  { o: 22260, h: 22398, l: 22250, c: 22350 },
  { o: 22350, h: 22370, l: 22270, c: 22285 },
  { o: 22285, h: 22310, l: 22210, c: 22230 },
  { o: 22230, h: 22300, l: 22215, c: 22288 },
  { o: 22288, h: 22360, l: 22275, c: 22345 },
  { o: 22345, h: 22392, l: 22330, c: 22360 },
  { o: 22360, h: 22380, l: 22320, c: 22340 },
  { o: 22340, h: 22470, l: 22330, c: 22450 },
  { o: 22450, h: 22520, l: 22435, c: 22500 },
  { o: 22500, h: 22540, l: 22460, c: 22480 },
  { o: 22480, h: 22560, l: 22465, c: 22545 },
];

export const RV_MIN = 22150;
export const RV_MAX = 22780;
export const RV: CandleBar[] = [
  { o: 22220, h: 22260, l: 22200, c: 22250 },
  { o: 22250, h: 22360, l: 22240, c: 22345 },
  { o: 22345, h: 22405, l: 22335, c: 22360 },
  { o: 22360, h: 22375, l: 22270, c: 22288 },
  { o: 22288, h: 22300, l: 22210, c: 22232 },
  { o: 22232, h: 22320, l: 22220, c: 22308 },
  { o: 22308, h: 22398, l: 22295, c: 22350 },
  { o: 22350, h: 22365, l: 22260, c: 22280 },
  { o: 22280, h: 22300, l: 22225, c: 22245 },
  { o: 22245, h: 22340, l: 22235, c: 22330 },
  { o: 22330, h: 22470, l: 22320, c: 22455 },
  { o: 22455, h: 22540, l: 22445, c: 22520 },
  { o: 22520, h: 22560, l: 22470, c: 22490 },
  { o: 22490, h: 22505, l: 22420, c: 22440 },
  { o: 22440, h: 22460, l: 22395, c: 22415 },
  { o: 22415, h: 22520, l: 22405, c: 22500 },
  { o: 22500, h: 22590, l: 22490, c: 22575 },
  { o: 22575, h: 22610, l: 22520, c: 22545 },
  { o: 22545, h: 22660, l: 22535, c: 22640 },
  { o: 22640, h: 22670, l: 22560, c: 22585 },
  { o: 22585, h: 22620, l: 22540, c: 22560 },
  { o: 22560, h: 22680, l: 22550, c: 22660 },
  { o: 22660, h: 22720, l: 22645, c: 22700 },
  { o: 22700, h: 22735, l: 22660, c: 22685 },
];

export const TR_MIN = 22060;
export const TR_MAX = 22690;
export const TR: CandleBar[] = [
  { o: 22120, h: 22160, l: 22100, c: 22150 },
  { o: 22150, h: 22250, l: 22140, c: 22235 },
  { o: 22235, h: 22305, l: 22225, c: 22250 },
  { o: 22250, h: 22270, l: 22160, c: 22180 },
  { o: 22180, h: 22210, l: 22120, c: 22140 },
  { o: 22140, h: 22240, l: 22130, c: 22225 },
  { o: 22225, h: 22298, l: 22215, c: 22248 },
  { o: 22248, h: 22265, l: 22175, c: 22195 },
  { o: 22195, h: 22360, l: 22185, c: 22345 },
  { o: 22345, h: 22410, l: 22335, c: 22390 },
  { o: 22390, h: 22405, l: 22320, c: 22335 },
  { o: 22335, h: 22350, l: 22295, c: 22315 },
  { o: 22315, h: 22420, l: 22305, c: 22405 },
  { o: 22405, h: 22470, l: 22395, c: 22455 },
  { o: 22455, h: 22490, l: 22410, c: 22430 },
  { o: 22430, h: 22540, l: 22420, c: 22525 },
  { o: 22525, h: 22560, l: 22470, c: 22495 },
  { o: 22495, h: 22600, l: 22485, c: 22585 },
  { o: 22585, h: 22620, l: 22540, c: 22560 },
  { o: 22560, h: 22640, l: 22550, c: 22625 },
];

/** No own min/max in the design — placeOrders scales this against A_MIN/A_MAX. */
export const PO: CandleBar[] = [
  { o: 22280, h: 22360, l: 22265, c: 22340 },
  { o: 22340, h: 22405, l: 22325, c: 22360 },
  { o: 22360, h: 22380, l: 22250, c: 22268 },
  { o: 22268, h: 22300, l: 22150, c: 22175 },
  { o: 22175, h: 22210, l: 22030, c: 22055 },
  { o: 22055, h: 22075, l: 21990, c: 22045 },
  { o: 22045, h: 22160, l: 22035, c: 22145 },
  { o: 22145, h: 22240, l: 22130, c: 22225 },
  { o: 22225, h: 22320, l: 22210, c: 22300 },
  { o: 22300, h: 22398, l: 22285, c: 22350 },
  { o: 22350, h: 22370, l: 22255, c: 22275 },
  { o: 22275, h: 22300, l: 22160, c: 22185 },
  { o: 22185, h: 22215, l: 22080, c: 22100 },
  { o: 22100, h: 22140, l: 22010, c: 22060 },
  { o: 22060, h: 22090, l: 21985, c: 22040 },
  { o: 22040, h: 22150, l: 22025, c: 22135 },
  { o: 22135, h: 22225, l: 22120, c: 22120 },
  { o: 22120, h: 22200, l: 22105, c: 22185 },
  { o: 22185, h: 22240, l: 22150, c: 22165 },
  { o: 22165, h: 22195, l: 22050, c: 22075 },
  { o: 22075, h: 22110, l: 22000, c: 22095 },
  { o: 22095, h: 22190, l: 22080, c: 22170 },
  { o: 22170, h: 22260, l: 22155, c: 22245 },
  { o: 22245, h: 22340, l: 22230, c: 22320 },
];

export const SW_MIN = 21920;
export const SW_MAX = 22470;
export const SW: CandleBar[] = [
  { o: 22050, h: 22090, l: 22030, c: 22080 },
  { o: 22080, h: 22180, l: 22070, c: 22165 },
  { o: 22165, h: 22260, l: 22150, c: 22245 },
  { o: 22245, h: 22360, l: 22235, c: 22300 },
  { o: 22300, h: 22320, l: 22200, c: 22215 },
  { o: 22215, h: 22235, l: 22095, c: 22110 },
  { o: 22110, h: 22125, l: 21980, c: 22050 },
  { o: 22050, h: 22160, l: 22040, c: 22150 },
  { o: 22150, h: 22240, l: 22135, c: 22225 },
  { o: 22225, h: 22410, l: 22210, c: 22330 },
  { o: 22330, h: 22350, l: 22240, c: 22255 },
  { o: 22255, h: 22275, l: 22120, c: 22140 },
  { o: 22140, h: 22155, l: 22035, c: 22095 },
  { o: 22095, h: 22200, l: 22080, c: 22185 },
  { o: 22185, h: 22250, l: 22170, c: 22235 },
];

export const BOSS_MIN = 22040;
export const BOSS_MAX = 22620;
export const BOSS: CandleBar[] = [
  { o: 22300, h: 22360, l: 22290, c: 22350 },
  { o: 22350, h: 22430, l: 22340, c: 22420 },
  { o: 22420, h: 22460, l: 22400, c: 22440 },
  { o: 22440, h: 22470, l: 22420, c: 22430 },
  { o: 22430, h: 22450, l: 22360, c: 22375 },
  { o: 22375, h: 22400, l: 22300, c: 22320 },
  { o: 22320, h: 22345, l: 22230, c: 22250 },
  { o: 22250, h: 22275, l: 22160, c: 22180 },
  { o: 22180, h: 22205, l: 22135, c: 22160 },
  { o: 22160, h: 22250, l: 22150, c: 22235 },
  { o: 22235, h: 22300, l: 22225, c: 22285 },
  { o: 22285, h: 22355, l: 22270, c: 22335 },
  { o: 22335, h: 22370, l: 22315, c: 22325 },
  { o: 22325, h: 22345, l: 22250, c: 22270 },
  { o: 22270, h: 22295, l: 22190, c: 22210 },
  { o: 22210, h: 22235, l: 22140, c: 22165 },
  { o: 22165, h: 22255, l: 22150, c: 22240 },
  { o: 22240, h: 22320, l: 22230, c: 22305 },
  { o: 22305, h: 22385, l: 22290, c: 22360 },
  { o: 22360, h: 22400, l: 22340, c: 22350 },
  { o: 22350, h: 22370, l: 22270, c: 22285 },
  { o: 22285, h: 22305, l: 22210, c: 22230 },
  { o: 22230, h: 22255, l: 22155, c: 22175 },
  { o: 22175, h: 22200, l: 22125, c: 22155 },
  { o: 22155, h: 22245, l: 22145, c: 22230 },
  { o: 22230, h: 22300, l: 22220, c: 22285 },
  { o: 22285, h: 22340, l: 22270, c: 22320 },
  { o: 22320, h: 22360, l: 22305, c: 22315 },
  { o: 22315, h: 22335, l: 22240, c: 22260 },
  { o: 22260, h: 22285, l: 22185, c: 22205 },
  { o: 22205, h: 22230, l: 22150, c: 22170 },
  { o: 22170, h: 22195, l: 22130, c: 22185 },
  { o: 22185, h: 22210, l: 22135, c: 22155 },
  { o: 22155, h: 22180, l: 22120, c: 22165 },
];

/* ---------- shared zones/pivots on the A dataset ---------- */

export const SUPPORT_ZONE = { lo: 21980, hi: 22045 };
export const RESISTANCE_ZONE = { lo: 22355, hi: 22420 };
export const SUPPORT_PIVOTS: Array<{ idx: number; price: number }> = [
  { idx: 4, price: 21985 },
  { idx: 12, price: 21990 },
  { idx: 20, price: 21995 },
];
export const RESISTANCE_TOUCHES: Array<{ idx: number; price: number }> = [
  { idx: 0, price: 22412 },
  { idx: 8, price: 22405 },
  { idx: 16, price: 22400 },
];

/* ================================================================
 * S0 intro
 * ================================================================ */

export const INTRO_KICKER = "Support & Resistance · Lesson 1";
export const INTRO_TITLE_LINE1 = "Price remembers";
export const INTRO_TITLE_LINE2 = "where it's been.";
export const INTRO_SUBTITLE =
  "Charts keep pausing and turning at the same prices. Learn to spot those areas — support and resistance — and you can read where price is likely to stop, bounce, or break.";
export const INTRO_CHIPS = [
  "Support = the floor",
  "Resistance = the ceiling",
  "Zones, not exact lines",
  "Bounces & breaks",
];

/* ---------- S1 hook ---------- */

export const HOOK = {
  kicker: "Support & Resistance · Lesson 1",
  title: "The price keeps stopping here",
  prompt:
    "Watch the chart draw itself. Price keeps turning around at the same two areas. Support (the floor) is where falls stop — buyers step in and push price back up. Resistance (the ceiling) is where rises stop — sellers step in and press price back down. Both are highlighted below.",
};

/* ---------- S2 intuition (mcq) ---------- */

export const INTUITION_MCQ = {
  kicker: "Intuition check",
  title: "Make a prediction first",
  prompt:
    "Price bounced off this area twice. Now it's dropping toward it a third time. Before we explain anything — what's most likely to happen at the level?",
  options: [
    "It smashes straight through — old prices don't matter",
    "It reacts — buyers likely step in again",
    "Impossible to have any idea at all",
  ],
  correctIndex: 1,
  hiddenFrom: 21,
  hiddenOpacity: 0,
  fb: {
    hint: "Two bounces already showed buyers waiting there. A level that held before tends to react again — though nothing is ever guaranteed.",
    correct:
      "A level that reacted before is likely to react again. That memory is the whole idea behind support & resistance.",
    wrong:
      "The level held twice, so buyers are watching it. It leans toward a reaction — never certain, but the odds favour one.",
  },
};

/* ---------- S3 memory ---------- */

export const MEMORY = {
  kicker: "Foundation",
  title: "Markets remember prices",
  prompt:
    'Near ₹22,000, more people wanted to buy than sell — so price stopped falling and turned up. That happened more than once. Traders notice this and think "price bounced here before, it might again," so they place buy orders at the same spot. That extra buying makes the bounce happen again. A price area where the market keeps reacting like this is called a level.',
};

/* ---------- S4 support ---------- */

export const SUPPORT_TEACH = {
  kicker: "Core definition",
  title: "Support is the floor",
  prompt: "Support is a price area below the market where buying tends to stop a fall. Think of it as a floor that price keeps bouncing up off.",
};

/* ---------- S5 resistance ---------- */

export const RESISTANCE_TEACH = {
  kicker: "Core definition",
  title: "Resistance is the ceiling",
  prompt: "Resistance is a price area above the market where selling tends to stop a rise — a ceiling price struggles to push through.",
};

/* ---------- S6 tapSupport ---------- */

export const TAP_SUPPORT = {
  kicker: "Your turn",
  title: "Tap the support",
  prompt: "No lines drawn this time. Tap the area on the chart where buyers keep stepping in.",
  priceMin: 21960,
  priceMax: 22090,
  fb: {
    hint: "Look at the bottom — where do candles keep bouncing up from? Tap that band, not the top.",
    correct: "That is the floor. Price found buyers there twice.",
    wrong: "That is the ceiling (resistance). Support is the floor at the bottom where price bounced up — highlighted now.",
  },
};

/* ---------- S7 swing ---------- */

export const SWING = {
  kicker: "Foundation",
  title: "Swing highs & swing lows",
  prompt:
    "Price doesn't move in a straight line — it moves in a zig-zag. Each peak is a swing high (a candle higher than the ones on both sides). Each valley is a swing low (lower than both sides). Every up-or-down leg between a peak and a valley is one swing. Follow the dotted line: two swing highs and two swing lows. These peaks and valleys are the exact points we draw our levels from.",
  highs: [
    { idx: 3, price: 22360 },
    { idx: 9, price: 22410 },
  ],
  lows: [
    { idx: 6, price: 21980 },
    { idx: 12, price: 22035 },
  ],
};

/* ---------- S8 tapSwing (multi = 2) ---------- */

export const TAP_SWING = {
  kicker: "Your turn",
  title: "Mark both swing lows",
  prompt:
    "This chart has two swing lows. Tap each one — the two valleys where price bottomed out and turned back up. Tap twice, one per valley (tap again to adjust).",
  lows: [
    { idxLo: 5.3, idxHi: 6.7, pMax: 22110 },
    { idxLo: 11.3, idxHi: 12.7, pMax: 22170 },
  ],
  revealLows: [
    { idx: 6, price: 21980 },
    { idx: 12, price: 22035 },
  ],
  revealDecoy: { idx: 4, price: 22200 },
  fb: {
    hint: "You need BOTH valleys. A swing low is lower than the candles on either side — tap the two deepest turning points, not a candle partway down a fall.",
    correct: "Both swing lows found — each is a valley where price turned back up.",
    wrong: "Mark both valleys where price turned up. The two true swing lows are highlighted now.",
  },
};

/* ---------- S9 notmagic ---------- */

export const NOTMAGIC = {
  kicker: "Mindset",
  title: "Reactions, not magic numbers",
  prompt:
    "A level won't stop price every single time — it's not magic. It just marks a spot where buyers or sellers showed up before, so there's a good chance they show up again. Sometimes they do and price turns (a reaction). Sometimes they don't and price pushes straight through (a break) — like this chart, which bounced three times, then broke. So the rule is: wait to SEE price react at the level before you trade it. Don't blindly assume the number will hold.",
  level: 22400,
  reactIdx: [2, 7, 12],
  breakArrowIdx: 14,
  breakPrice: 22455,
};

/* ---------- S10 zoneteach ---------- */

export const ZONETEACH = {
  kicker: "Levels vs zones",
  title: "It's an area, not a line",
  prompt: "Price rarely turns at the exact same rupee. Real support and resistance are zones — a band covering the cluster of wicks and closes. A hairline level will let you down.",
  hairlinePrice: 22012,
};

/* ---------- S11 dragZone ---------- */

export const DRAG_ZONE_INITIAL = { hi: 22195, lo: 22168 };
export const DRAG_ZONE_BOUNDS = { loMin: 21955, loMax: 22010, hiMin: 22020, hiMax: 22085, minWidth: 40 };
export const DRAG_ZONE = {
  kicker: "Do it by hand",
  title: "Draw the support zone",
  prompt: "Drag the band and its edges to cover where price actually reacted — the cluster of lows and wicks. Make it a zone, not a razor line.",
  fb: {
    hint: "Cover the wicks AND the closes of both bounces. Thinner than a candle means it is a line — widen it.",
    correct: "That is a proper zone — it wraps the whole reaction area, wicks included.",
    wrong: "Your band missed the reaction. A good zone wraps the cluster of lows (~₹21,980–22,045), wicks and all — shown now.",
  },
};

/* ---------- S12 touches ---------- */

export const TOUCHES = {
  kicker: "Drawing correctly",
  title: "2 to draw, 3 to confirm",
  prompt: "You need 2 touches to draw a level and a 3rd reaction to confirm it. Anchor the zone on the wicks (the extremes) and the bodies (where price settled) — never one random candle.",
};

/* ---------- S13 spot ---------- */

export const SPOT_BARS: CandleBar[] = [
  { o: 34, h: 40, l: 22, c: 26 },
  { o: 26, h: 30, l: 14, c: 20 },
  { o: 20, h: 26, l: 12, c: 23 },
  { o: 23, h: 38, l: 21, c: 35 },
  { o: 35, h: 42, l: 30, c: 33 },
  { o: 33, h: 37, l: 19, c: 22 },
];
export const SPOT_CARDS: Array<{ label: string; line: number; tone: "ok" | "bad"; note: string }> = [
  { label: "Trader A", line: 14, tone: "ok", note: "2 clean touches at the lows" },
  { label: "Trader B", line: 42, tone: "ok", note: "2 touches at the highs" },
  { label: "Trader C", line: 27, tone: "bad", note: "1 touch, cuts through bodies" },
];
export const SPOT_MISTAKE = {
  kicker: "Spot the mistake",
  title: "Which level is drawn wrong?",
  prompt: "Three traders drew a level on the same chart. Tap the card where the level is drawn incorrectly.",
  correctIndex: 2,
  fb: {
    hint: "A valid level needs at least 2 clean touches and should sit at the reaction edge — not slice through candle bodies.",
    correct: "Right — that line has just one touch and cuts through bodies. That is a guess, not a level.",
    wrong: "Trader C drew through the bodies with only one touch — that is the badly drawn level, marked now.",
  },
};

/* ---------- S14 react ---------- */

export const REACT_TEACH = {
  kicker: "How price reacts",
  title: "Read the candle at the level",
  prompt: "When price reaches support, watch the candle. A long lower wick or a strong bullish close = rejection, buyers defending. A weak, heavy close warns the level may fail.",
};

/* ---------- S15 candlePredict ---------- */

export type CandleKind = "bull" | "hammer" | "bear" | "doji";

export const CANDLE_PREDICT_OPTIONS: Array<{ kind: CandleKind; label: string }> = [
  { kind: "bull", label: "Strong green" },
  { kind: "hammer", label: "Long lower wick" },
  { kind: "bear", label: "Heavy red close" },
  { kind: "doji", label: "Flat doji" },
];
export const CANDLE_PREDICT_HAMMER: CandleBar = { o: 22090, h: 22112, l: 21985, c: 22100 };
export const CANDLE_PREDICT = {
  kicker: "Predict the candle",
  title: "Price just hit support",
  prompt: "Price has dropped into the support zone on a strong buying history. Which next candle signals buyers are defending the level?",
  correctIndex: 1,
  fb: {
    hint: "You want evidence buyers fought back — a long LOWER wick rejecting the lows, or a strong bullish close.",
    correct: "A long lower wick (a hammer) shows lower prices were rejected — buyers defended support.",
    wrong: "The hammer, with its long lower wick, is the rejection signal. A heavy red close would mean support is failing.",
  },
};

/* ---------- S16 reversal ---------- */

export const REVERSAL = {
  kicker: "Breaks & role reversal",
  title: "Broken resistance becomes support",
  prompt: "When price breaks a level with force, the level flips roles: old resistance becomes new support, and old support becomes resistance. The ceiling turns into the floor.",
  level: 22400,
};

/* ---------- S17 retest (teach) ---------- */

export const RETEST_TEACH = {
  kicker: "Breaks & role reversal",
  title: "The break-and-retest",
  prompt: "After a break, price often returns to the flipped level to retest it. If old resistance now holds as support, it confirms the break — a classic, lower-risk entry.",
  level: 22400,
};

/* ---------- S18 tapRetest ---------- */

export const TAP_RETEST = {
  kicker: "Your turn",
  title: "Where would you enter?",
  prompt: "Resistance just broke. Tap the spot where a break-and-retest entry sets up — do not chase the breakout candle.",
  idxMin: 10.3,
  idxMax: 11.7,
  priceMin: 22250,
  priceMax: 22370,
  level: 22300,
  fb: {
    hint: "Wait for price to come BACK to the broken level and hold. The entry is the retest, not the big break candle.",
    correct: "That is the retest — price returns to the flipped level, holds, and offers a clean entry.",
    wrong: "That is chasing the breakout candle — high risk. The entry is the retest where price returns to the level (marked).",
  },
};

/* ---------- S19 quality ---------- */

export const QUALITY_TEACH = {
  kicker: "Quality of levels",
  title: "Strong vs weak levels",
  prompt: "Levels are not equal. Strength grows with more touches, a higher timeframe, recent reactions, and a sharp move away. Weigh these before you trust a level.",
};

/* ---------- S20 qualityCompare ---------- */

export const QUALITY_CHART_WEAK: CandleBar[] = [
  { o: 30, h: 34, l: 27, c: 29 },
  { o: 29, h: 32, l: 23, c: 31 },
  { o: 31, h: 40, l: 30, c: 38 },
  { o: 38, h: 42, l: 33, c: 35 },
  { o: 35, h: 39, l: 31, c: 37 },
  { o: 37, h: 50, l: 36, c: 47 },
  { o: 47, h: 51, l: 40, c: 43 },
  { o: 43, h: 48, l: 40, c: 45 },
  { o: 45, h: 49, l: 37, c: 40 },
  { o: 40, h: 55, l: 38, c: 52 },
  { o: 52, h: 56, l: 47, c: 50 },
  { o: 50, h: 60, l: 48, c: 58 },
];
export const QUALITY_CHART_STRONG: CandleBar[] = [
  { o: 44, h: 48, l: 25, c: 31 },
  { o: 31, h: 45, l: 29, c: 42 },
  { o: 42, h: 46, l: 35, c: 38 },
  { o: 38, h: 41, l: 26, c: 33 },
  { o: 33, h: 48, l: 31, c: 45 },
  { o: 45, h: 49, l: 38, c: 41 },
  { o: 41, h: 44, l: 33, c: 36 },
  { o: 36, h: 40, l: 25, c: 31 },
  { o: 31, h: 47, l: 29, c: 44 },
  { o: 44, h: 50, l: 40, c: 46 },
  { o: 46, h: 49, l: 34, c: 37 },
  { o: 37, h: 42, l: 26, c: 40 },
];
export const QUALITY_CHART_META: Record<"weak" | "strong", { level: number; touchIdx: number[] }> = {
  weak: { level: 24, touchIdx: [1] },
  strong: { level: 26, touchIdx: [0, 3, 7, 11] },
};
export const QUALITY_COMPARE = {
  kicker: "Which is stronger?",
  title: "Pick the stronger level",
  prompt: "Two levels on the same timeframe. Which one would you trust more?",
  options: ["Level A — touched once, months ago", "Level B — touched 4 times this month with sharp bounces"],
  correctIndex: 1,
  fb: {
    hint: "More touches + more recent + sharper reactions = stronger. Which level has all three?",
    correct: "Level B — more touches, recent, and strong reactions. A level worth trusting.",
    wrong: "Level B is stronger: four recent touches with sharp bounces beat a single old touch.",
  },
};

/* ---------- S21 risk ---------- */

export const RISK_TEACH = {
  kicker: "Risk & application",
  title: "Entry, stop, and target",
  prompt: "Buy near support, place your stop just BELOW the zone (never inside it), and aim for the next resistance as your target. The level defines your risk.",
  entry: 22110,
  stop: 21950,
  target: 22340,
  fromIdx: 20,
};

/* ---------- S22 placeOrders ---------- */

export const PLACE_ORDERS_INITIAL = { stop: 22050, target: 22250, entryP: 22110 };
export const PLACE_ORDERS_BOUNDS = { stopMax: 21965, targetMin: 22340, entryMin: 22055, entryMax: 22160, minRR: 1.4 };
export const PLACE_ORDERS_VISIBLE_COUNT = 21;
export const PLACE_ORDERS = {
  kicker: "Do it by hand",
  title: "Place your stop and target",
  prompt:
    "This is a long-position tool. Drag the whole box to move it, or drag the ENTRY, STOP and TARGET lines one at a time. Put entry near support, stop just below the zone, target up at resistance — aim for at least 1.5× reward-to-risk. Then Check to reveal how the trade played out.",
  fromIdx: 20,
  fb: {
    hint: "Your stop belongs just BELOW the whole zone — inside it, a normal wick shakes you out. Put the target at the ceiling.",
    correct: "Clean setup: stop safely below the zone, target at resistance, healthy reward-to-risk.",
    wrong: "Not quite. Put entry near support, drop the stop just below the zone (a normal wick inside it would shake you out), and lift the target to the ceiling for at least 1.5× reward-to-risk.",
  },
};

/* ---------- S23 bossTap ---------- */

export const BOSS_ZONE = { lo: 22115, hi: 22172 };
export const BOSS_TAP = {
  kicker: "Market Replay · Boss",
  title: "An unseen chart",
  prompt: "Nifty, last Tuesday. First job: tap the key support level you would watch going into the session.",
  priceMin: 22105,
  priceMax: 22195,
  fb: {
    hint: "Find the band price bounced from more than once. Tap the floor, not the ceiling.",
    correct: "Good eye — that is the level that mattered on the day.",
    wrong: "The level price defended sits lower — highlighted. That is the floor to watch.",
  },
};

/* ---------- S24 bossDecide ---------- */

export const BOSS_DECIDE_EXTRA_BARS: CandleBar[] = [
  { o: 22165, h: 22360, l: 22155, c: 22340 },
  { o: 22340, h: 22565, l: 22330, c: 22545 },
];
export const BOSS_DECIDE = {
  kicker: "Market Replay · Boss",
  title: "Price is at your support",
  prompt: "Price dropped into the level you marked and printed a long lower wick. Your move?",
  options: [
    "Short it — it's about to break",
    "Wait — there is no reaction yet",
    "Go long — buyers are defending, stop below the zone",
  ],
  correctIndex: 2,
  fb: {
    hint: "You mapped this as support and price just rejected the lows with a long wick. What does the plan say?",
    correct: "Long, with a stop below the zone. Price rallied ₹380 into the close — your level did its job.",
    wrong: "The setup was a long: support plus a rejection wick. Shorting fights the level. Price rallied ₹380 after that wick.",
  },
};

/* ---------- S25 summary ---------- */

export const BADGE_TITLE = "You can read levels now";
export const BADGE_SUBTITLE =
  "You can spot support and resistance zones, judge their strength, and plan entries with a defined stop and target.";
export const CHECKLIST_ITEMS = [
  "What price levels are & market memory",
  "Support (floor) vs resistance (ceiling)",
  "Levels are zones, not exact lines",
  "2 to draw, 3 to confirm — wicks & bodies",
  "Bounces, breaks & role reversal",
  "Break-and-retest entries",
  "Judging level quality",
  "Stops, targets & filtering fakeouts",
];
