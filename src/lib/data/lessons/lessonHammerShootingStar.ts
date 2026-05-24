import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const hammerShootingStarPages: LessonPage[] = [
  {
    id: "h1",
    type: "pretest",
    question:
      "You see a candle at the BOTTOM of a downtrend with a tiny body and a very long lower wick (3x the body size). Before learning — what might this mean?",
    options: ["The sellers are winning — sell immediately", "Buyers are starting to fight back — possible reversal", "Nothing — candle patterns don't work", "The stock is illiquid"],
    correctIndex: 1,
    explanation:
      "Strong instinct! That long lower wick shows buyers rejected a major move lower. When this appears AFTER a downtrend, it's called a Hammer — one of the most reliable reversal signals.",
  },
  { id: "h2", type: "visual", visualId: "HammerCandle", caption: "The **Hammer** forms when sellers push price way below the open, buyers step in HARD, and price closes near or above the open." },
  {
    id: "h3",
    type: "multiple_choice",
    question: "For a candle to qualify as a Hammer, the lower wick must be at least...",
    options: ["Equal to the body size", "2x the body size", "Exactly 3x the body size", "There's no rule — it's subjective"],
    correctIndex: 1,
    explanation:
      "At least 2x! The lower wick should be at least twice the length of the body. The larger the ratio, the more powerful the signal. A lower wick 5x the body = very strong hammer signal.",
  },
  {
    id: "h4",
    type: "callout",
    variant: "warning",
    title: "Context Matters — A Hammer Is Only Bullish After a Downtrend",
    content:
      "A hammer at the BOTTOM of a downtrend = bullish reversal signal.\nThe same candle appearing DURING an uptrend has different meaning.\nAlways ask: where in the trend did this pattern appear?",
  },
  {
    id: "h5",
    type: "text",
    title: "The Shooting Star — The Hammer's Evil Twin",
    body: "The **Shooting Star** is the exact mirror of the Hammer — but appears at the TOP of an uptrend.\n\nIt has:\n- A small body at the BOTTOM of the range\n- A long upper wick (2x+ body size)\n- Little or no lower wick\n\nMeaning: buyers pushed price way up, but sellers crushed them back down. When you see this after a rally — be very careful.",
  },
  { id: "h6", type: "visual", visualId: "HammerVsShootingStar", caption: "Same shape, opposite context, opposite meaning. **Always check the trend** before acting on a candle pattern." },
  {
    id: "h7",
    type: "chart_tap",
    question: "Tap the Shooting Star on this chart.",
    correctCandleIndex: 6,
    explanation: "That's the Shooting Star! Long upper wick after a push higher — sellers rejected the high.",
    highlightStyle: "shootingStar",
    candleCount: 10,
  },
  {
    id: "h8",
    type: "multiple_choice",
    question: "You see a hammer at support after a 3-week downtrend. Volume on the hammer is 3x the 20-day average. This is:",
    options: [
      "A weak signal — hammers are unreliable",
      "A strong signal — high volume confirms strong buyer interest at this level",
      "Irrelevant — volume doesn't affect candle patterns",
      "A sell signal — high volume on down days is bearish",
    ],
    correctIndex: 1,
    explanation:
      "Strong signal! Volume is the fuel behind price moves. High volume on a hammer means many buyers stepped in at that level — not just a few. Institutional money often shows up as abnormally high volume on key reversal candles.",
  },
  {
    id: "h9",
    type: "fill_blank",
    sentence: "A candle at the top of an uptrend with a long upper wick and tiny body is called a [___].",
    correctAnswer: "shooting star",
    explanation: "Shooting Star! Price was launched upward but sellers pulled it back by the close.",
  },
  {
    id: "h10",
    type: "drag_label",
    instruction: "Label each part of this Hammer candle.",
    labels: ["BODY", "LOWER WICK", "OPEN (near Close)", "THE REJECTION ZONE"],
    zones: [
      { id: "hz1", title: "Thick rectangle", correctLabel: "BODY" },
      { id: "hz2", title: "Long thin line down", correctLabel: "LOWER WICK" },
      { id: "hz3", title: "Top of body", correctLabel: "OPEN (near Close)" },
      { id: "hz4", title: "Lower half of wick", correctLabel: "THE REJECTION ZONE" },
    ],
    explanation:
      "The hammer’s long lower wick is where sellers pushed price down and buyers rejected it — the rejection zone. The small body shows the close snapped back near the open.",
  },
];

export const hammerShootingStarPractice: PracticeQuestion[] = [
  {
    id: "hp1",
    type: "multiple_choice",
    question: "Hammer is primarily a:",
    options: ["Continuation pattern in uptrends", "Reversal clue after downtrends", "Volume indicator", "Moving average cross"],
    correctIndex: 1,
    explanation: "Context: downtrend → hammer.",
  },
  {
    id: "hp2",
    type: "true_false",
    statement: "Shooting star = small body low in range + long upper wick after rally.",
    correct: true,
    explanation: "Classic shooting star structure.",
  },
  {
    id: "hp3",
    type: "chart_tap",
    question: "Tap the hammer-like candle (long lower wick).",
    correctCandleIndex: 1,
    explanation: "Long lower wick vs body ratio stands out.",
    highlightStyle: "longLowerWick",
  },
  {
    id: "hp4",
    type: "fill_blank",
    sentence: "After a downtrend, a hammer suggests possible [___].",
    correctAnswer: "reversal",
    explanation: "Bulls fighting back.",
  },
  {
    id: "hp5",
    type: "multiple_choice",
    question: "A shooting star appears at random mid-range with no trend. You should:",
    options: ["Always short", "Ignore context — pattern always works", "Weigh trend location and confirmation", "Double size automatically"],
    correctIndex: 2,
    explanation: "Location + confirmation matter.",
  },
  {
    id: "hp6",
    type: "true_false",
    statement: "Higher volume on a reversal candle can strengthen the story.",
    correct: true,
    explanation: "Participation confirms conviction.",
  },
];
