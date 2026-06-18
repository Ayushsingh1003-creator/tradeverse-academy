import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const meaningOfPatternsPages: LessonPage[] = [
  // ── Warm-up ───────────────────────────────────────────────────────
  {
    id: "h1",
    type: "visual_choice",
    challengeBadge: "Warm-up · +25 XP",
    question:
      "At the BOTTOM of a downtrend: tiny body, very long lower wick (3× body). Tap the candle.",
    options: [
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Long lower wick shows buyers rejected a major move lower. After a downtrend, this is a **Hammer** — a reliable reversal signal.",
    image: { alt: "Hammer candle at bottom of downtrend with long lower wick and small body at top" },
  },

  // ── The Hammer ────────────────────────────────────────────────────
  {
    id: "h2",
    type: "text",
    badge: "The Hammer",
    title: "Buyers Fight Back",
    image: { alt: "Hammer candlestick with small body at top and long lower wick showing buyer rejection" },
    body: "The **Hammer** forms when sellers push price way below the open, buyers step in HARD, and price closes near or above the open.\n\nKey traits:\n- Small body at the **top** of the range\n- Lower wick at least **2× the body**\n- Little or no upper wick",
  },
  {
    id: "h3",
    type: "visual",
    visualId: "HammerCandle",
    caption:
      "The **Hammer** forms when sellers push price way below the open, buyers step in HARD, and price closes near or above the open.",
  },
  {
    id: "h4",
    type: "visual_choice",
    challengeBadge: "Spot the Hammer · +25 XP",
    question: "Which candle has a lower wick at least 2× the body size?",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
      { label: "Bearish", preset: "bearish" },
    ],
    correctIndex: 1,
    explanation:
      "Hammer rule: lower wick ≥ 2× body. The larger the ratio, the more powerful the signal.",
    image: { alt: "Comparison of candle wick ratios with hammer showing 2x or greater lower wick to body" },
  },

  // ── Context Matters ───────────────────────────────────────────────
  {
    id: "h5",
    type: "callout",
    variant: "warning",
    badge: "Context Matters",
    title: "A Hammer Is Only Bullish After a Downtrend",
    image: { alt: "Hammer at bottom of downtrend vs same shape mid-uptrend showing different meanings" },
    content:
      "A hammer at the **BOTTOM** of a downtrend = bullish reversal signal.\nThe same candle during an uptrend has different meaning.\nAlways ask: **where in the trend** did this pattern appear?",
  },
  {
    id: "h6",
    type: "visual_choice",
    challengeBadge: "Context Check · +25 XP",
    question: "Hammer at support after a 3-week downtrend with 3× average volume — tap the candle.",
    options: [
      { label: "Hammer — buyers fighting back", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 0,
    explanation:
      "High volume on a hammer = many buyers stepped in — institutional money often shows up as abnormally high volume on key reversal candles.",
    image: { alt: "Hammer candle at support level with volume bar showing 3x average participation" },
  },

  // ── The Shooting Star ─────────────────────────────────────────────
  {
    id: "h7",
    type: "text",
    badge: "The Shooting Star",
    title: "The Hammer's Evil Twin",
    image: { alt: "Shooting star candle with small body at bottom and long upper wick at top of uptrend" },
    body: "The **Shooting Star** is the exact mirror of the Hammer — but appears at the **TOP** of an uptrend.\n\nIt has:\n- A small body at the **bottom** of the range\n- A long upper wick (2×+ body size)\n- Little or no lower wick\n\nMeaning: buyers pushed price way up, but sellers crushed them back down.",
  },
  {
    id: "h8",
    type: "visual",
    visualId: "HammerVsShootingStar",
    caption:
      "Same shape, opposite context, opposite meaning. **Always check the trend** before acting on a candle pattern.",
  },
  {
    id: "h9",
    type: "visual_choice",
    challengeBadge: "Mirror Match · +25 XP",
    question: "At the TOP of an uptrend — long upper wick, tiny body low in range. Tap it.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Shooting Star! Price was launched upward but sellers pulled it back by the close. Bearish after a rally.",
    image: { alt: "Shooting star at top of uptrend with long upper wick and small body at range bottom" },
  },
  {
    id: "h10",
    type: "chart_tap",
    challengeBadge: "Tap the Chart · +25 XP",
    question: "Tap the Shooting Star on this chart.",
    correctCandleIndex: 6,
    explanation:
      "That's the Shooting Star! Long upper wick after a push higher — sellers rejected the high.",
    highlightStyle: "shootingStar",
    candleCount: 10,
    image: { alt: "Ten-candle chart with shooting star pattern highlighted at the top of a rally" },
  },

  // ── Pattern Anatomy ───────────────────────────────────────────────
  {
    id: "h11",
    type: "drag_label",
    challengeBadge: "Label Challenge · +30 XP",
    instruction: "Label each part of this Hammer candle.",
    labels: ["BODY", "LOWER WICK", "OPEN (near Close)", "THE REJECTION ZONE"],
    zones: [
      { id: "hz1", title: "Thick rectangle", correctLabel: "BODY" },
      { id: "hz2", title: "Long thin line down", correctLabel: "LOWER WICK" },
      { id: "hz3", title: "Top of body", correctLabel: "OPEN (near Close)" },
      { id: "hz4", title: "Lower half of wick", correctLabel: "THE REJECTION ZONE" },
    ],
    explanation:
      "The hammer's long lower wick is where sellers pushed price down and buyers rejected it — the rejection zone.",
    image: { alt: "Hammer candle outline with four drop zones for body wick open and rejection zone" },
  },
  {
    id: "h12",
    type: "fill_blank",
    challengeBadge: "Type It · +20 XP",
    sentence: "A candle at the top of an uptrend with a long upper wick and tiny body is called a [___].",
    correctAnswer: "shooting star",
    explanation: "Shooting Star! Price was launched upward but sellers pulled it back by the close.",
    image: { alt: "Shooting star candle labeled with long upper wick at top of uptrend" },
  },
  {
    id: "h13",
    type: "callout",
    variant: "rule",
    badge: "Recap",
    title: "Pattern Cheat Sheet",
    image: { alt: "Side by side hammer and shooting star summary with trend context arrows" },
    content:
      "**Hammer** = long lower wick + small body → bullish after downtrend\n**Shooting Star** = long upper wick + small body → bearish after uptrend\n**Always**: check trend location + volume before acting",
  },
  {
    id: "h14",
    type: "chart_tap",
    challengeBadge: "Final Boss · +25 XP",
    question: "Tap the hammer-like candle — long lower wick after a selloff.",
    correctCandleIndex: 1,
    explanation: "Long lower wick vs body ratio stands out — buyers rejected the push lower.",
    highlightStyle: "longLowerWick",
    candleCount: 8,
    image: { alt: "Eight-candle chart with hammer pattern showing long lower wick after downtrend" },
  },
];

export const meaningOfPatternsPractice: PracticeQuestion[] = [
  {
    id: "hp1",
    type: "visual_choice",
    challengeBadge: "Practice 1 · Pick",
    question: "After a downtrend — tap the reversal clue candle.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Bearish", preset: "bearish" },
    ],
    correctIndex: 1,
    explanation: "Context: downtrend → hammer = possible reversal.",
    image: { alt: "Hammer candle appearing at bottom of a downtrend chart" },
  },
  {
    id: "hp2",
    type: "visual_choice",
    challengeBadge: "Practice 2 · Pick",
    question: "Small body low in range + long upper wick after rally — tap it.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Doji", preset: "doji" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation: "Classic shooting star structure at the top of a rally.",
    image: { alt: "Shooting star with small body at bottom and long upper wick" },
  },
  {
    id: "hp3",
    type: "chart_tap",
    challengeBadge: "Practice 3 · Tap",
    question: "Tap the hammer-like candle (long lower wick).",
    correctCandleIndex: 1,
    explanation: "Long lower wick vs body ratio stands out.",
    highlightStyle: "longLowerWick",
    image: { alt: "Chart row with hammer candle showing prominent lower wick" },
  },
  {
    id: "hp4",
    type: "drag_label",
    challengeBadge: "Practice 4 · Drag",
    instruction: "Label the Shooting Star — drag BODY, UPPER WICK, and REJECTION ZONE.",
    labels: ["BODY", "UPPER WICK", "REJECTION ZONE"],
    zones: [
      { id: "hpz1", title: "Small rectangle at bottom", correctLabel: "BODY" },
      { id: "hpz2", title: "Long line above body", correctLabel: "UPPER WICK" },
      { id: "hpz3", title: "Tip of upper wick", correctLabel: "REJECTION ZONE" },
    ],
    explanation: "Upper wick tip = where sellers rejected the high.",
    image: { alt: "Shooting star outline with three label drop zones" },
  },
  {
    id: "hp5",
    type: "visual_choice",
    challengeBadge: "Practice 5 · Pick",
    question: "Same hammer shape mid-range with no trend context — tap the candle shape first.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 0,
    explanation: "Shape = hammer, but location + confirmation matter before trading it.",
    image: { alt: "Hammer-shaped candle in middle of price range without clear trend" },
  },
  {
    id: "hp6",
    type: "chart_tap",
    challengeBadge: "Practice 6 · Tap",
    question: "Tap the Shooting Star after the rally push.",
    correctCandleIndex: 6,
    explanation: "Long upper wick at the top — sellers rejected the high.",
    highlightStyle: "shootingStar",
    candleCount: 10,
    image: { alt: "Ten-candle practice chart with shooting star at rally peak" },
  },
  {
    id: "hp7",
    type: "visual_choice",
    challengeBadge: "Practice 7 · Boss",
    question: "High volume hammer at support after downtrend — tap the pattern.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Shooting star", preset: "shootingStar" },
    ],
    correctIndex: 0,
    explanation: "Higher volume on a reversal candle strengthens the story — participation confirms conviction.",
    image: { alt: "Hammer at support with elevated volume bar confirming buyer interest" },
  },
];
