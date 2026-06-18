import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const supportResistancePages: LessonPage[] = [
  // ── Warm-up ───────────────────────────────────────────────────────
  {
    id: "s1",
    type: "visual_choice",
    challengeBadge: "Warm-up · +25 XP",
    question:
      "Price bounced off ₹50 three times in 4 months. Tap the candle showing buyer defense at support.",
    options: [
      { label: "Marubozu bear — breakdown", preset: "marubozuBear" },
      { label: "Hammer — rejection at lows", preset: "hammer" },
      { label: "Shooting star — rejection at highs", preset: "shootingStar" },
      { label: "Doji — no signal", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Long lower wick at ₹50 = buyers stepped in again. This is **Support** — the market remembers where price has bounced before.",
    image: { alt: "Chart showing three bounces at 50 rupee support level with hammer rejection candle" },
  },

  // ── Support & Resistance ──────────────────────────────────────────
  {
    id: "s2",
    type: "text",
    badge: "Support & Resistance",
    title: "Support = Floor, Resistance = Ceiling",
    image: { alt: "Chart with horizontal support floor and resistance ceiling zones marked" },
    body: "**Support** is where demand repeatedly absorbs selling. **Resistance** is where supply caps rallies. The more times a level holds, the more traders watch it.\n\nThink in **zones** (a few ticks wide) rather than one exact price — liquidity sits across a band.",
  },
  {
    id: "s3",
    type: "visual",
    visualId: "SupportResistanceMap",
    caption: "Watch bounces cluster — that clustering **is** the level, not a single tick.",
  },
  {
    id: "s4",
    type: "visual_choice",
    challengeBadge: "Zone Spot · +25 XP",
    question: "Rally fails at the same ceiling three times — tap the rejection candle.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation: "Long upper wick at resistance = sellers rejected the ceiling. Classic supply zone.",
    image: { alt: "Shooting star at horizontal resistance ceiling with three prior rejections marked" },
  },

  // ── Zones Not Lines ───────────────────────────────────────────────
  {
    id: "s5",
    type: "callout",
    variant: "tip",
    badge: "Zones Not Lines",
    title: "Pro Tip",
    image: { alt: "Support zone drawn as shaded band rather than single pixel line on chart" },
    content:
      "Think in **zones** (a few ticks wide) rather than one exact price — liquidity sits across a band.\n\nMany traders draw **zones** instead of one-pixel lines.",
  },
  {
    id: "s6",
    type: "chart_tap",
    challengeBadge: "Tap the Chart · +25 XP",
    question: "Tap the candle that tests the support zone most clearly.",
    correctCandleIndex: 2,
    explanation: "Touches the zone and rejects — classic support test with long lower wick.",
    highlightStyle: "longLowerWick",
    image: { alt: "Chart with support zone and candle showing clear bounce with long lower wick" },
  },

  // ── Role Reversal ─────────────────────────────────────────────────
  {
    id: "s7",
    type: "image",
    badge: "Role Reversal",
    title: "When Support Breaks",
    alt: "Chart showing broken support becoming resistance on retest after breakdown",
    caption:
      "Broken support often becomes **resistance** on retests. Role reversal: former support can act as resistance after a breakdown.",
  },
  {
    id: "s8",
    type: "visual_choice",
    challengeBadge: "Flip Check · +25 XP",
    question: "Price breaks below support, retests from below and fails — tap the rejection candle.",
    options: [
      { label: "Hammer at lows", preset: "hammer" },
      { label: "Shooting star at old support", preset: "shootingStar" },
      { label: "Marubozu bull breakout", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 1,
    explanation:
      "Former support → new resistance. Shooting star at the retest = sellers defending the flipped level.",
    image: { alt: "Role reversal chart with old support now acting as resistance on retest" },
  },

  // ── Volume & Confluence ───────────────────────────────────────────
  {
    id: "s9",
    type: "callout",
    variant: "concept",
    badge: "Volume & Confluence",
    title: "Key Concept",
    image: { alt: "Support bounce with high volume bar confirming buyer participation at level" },
    content:
      "Higher volume at a bounce can make that support level more meaningful.\n\nCombine **timeframes**: daily zone + hourly trigger can improve timing while keeping the bigger map.",
  },
  {
    id: "s10",
    type: "visual_choice",
    challengeBadge: "Conviction Check · +25 XP",
    question: "High volume hammer bouncing off a well-tested support zone — tap the candle.",
    options: [
      { label: "Hammer", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Doji", preset: "doji" },
    ],
    correctIndex: 0,
    explanation:
      "Volume confirms conviction at the level — participation strengthens the support thesis.",
    image: { alt: "Hammer at support zone with volume spike showing strong buyer defense" },
  },
  {
    id: "s11",
    type: "fill_blank",
    challengeBadge: "Type It · +20 XP",
    sentence: "A ceiling where rallies fail is called [___].",
    correctAnswer: "resistance",
    explanation: "Supply shows up at resistance — sellers cap rallies.",
    image: { alt: "Horizontal resistance ceiling with multiple rally rejections labeled" },
  },
  {
    id: "s12",
    type: "drag_label",
    challengeBadge: "Label Challenge · +30 XP",
    instruction: "Drag SUPPORT, RESISTANCE, and ROLE REVERSAL to the right concept zone.",
    labels: ["SUPPORT", "RESISTANCE", "ROLE REVERSAL"],
    zones: [
      { id: "sz1", title: "Floor where buyers step in", correctLabel: "SUPPORT" },
      { id: "sz2", title: "Ceiling where sellers cap rallies", correctLabel: "RESISTANCE" },
      { id: "sz3", title: "Broken support retested from below", correctLabel: "ROLE REVERSAL" },
    ],
    explanation: "Support = demand zone. Resistance = supply zone. Broken levels can flip roles.",
    image: { alt: "Chart diagram with three zones for support resistance and role reversal labels" },
  },

  // ── Trading the Zone ──────────────────────────────────────────────
  {
    id: "s13",
    type: "callout",
    variant: "rule",
    badge: "Trading the Zone",
    title: "Best Practice at Support",
    image: { alt: "Trader planning entry at support zone with stop below and target at resistance" },
    content:
      "When price approaches a well-tested support zone: watch **reaction + volume**, plan risk around the zone.\n\nReactions + risk plan beat guessing.",
  },
  {
    id: "s14",
    type: "visual_choice",
    challengeBadge: "Approach Check · +25 XP",
    question: "Price drifting through a level on low volume — tap the weak-conviction candle.",
    options: [
      { label: "Marubozu bull — strong", preset: "marubozuBull" },
      { label: "Doji — low conviction drift", preset: "doji" },
      { label: "Hammer — strong bounce", preset: "hammer" },
      { label: "Marubozu bear — breakdown", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation:
      "Low volume drift through a level suggests weaker conviction — easier to violate than a high-volume rejection.",
    image: { alt: "Low volume candles drifting through support level without strong rejection" },
  },
  {
    id: "s15",
    type: "chart_tap",
    challengeBadge: "Final Boss · +25 XP",
    question: "Tap a candle that tags support and bounces with a long lower wick.",
    correctCandleIndex: 2,
    explanation: "Clear rejection from the floor — buyers defended the support zone.",
    highlightStyle: "longLowerWick",
    candleCount: 8,
    image: { alt: "Eight-candle chart with support bounce showing long lower wick rejection" },
  },
];

export const supportResistancePractice: PracticeQuestion[] = [
  {
    id: "sp1",
    type: "visual_choice",
    challengeBadge: "Practice 1 · Pick",
    question: "Support = area where demand showed up repeatedly — tap the bounce candle.",
    options: [
      { label: "Hammer at lows", preset: "hammer" },
      { label: "Shooting star", preset: "shootingStar" },
      { label: "Marubozu bear", preset: "marubozuBear" },
      { label: "Doji only", preset: "doji" },
    ],
    correctIndex: 0,
    explanation: "Memory of buyers stepping in — long lower wick at support.",
    image: { alt: "Hammer candle bouncing off support zone with prior bounces marked" },
  },
  {
    id: "sp2",
    type: "visual_choice",
    challengeBadge: "Practice 2 · Pick",
    question: "Resistance can turn into support after breakout and retest — tap the breakout candle.",
    options: [
      { label: "Marubozu bull — breaks resistance", preset: "marubozuBull" },
      { label: "Hammer", preset: "hammer" },
      { label: "Doji", preset: "doji" },
      { label: "Shooting star", preset: "shootingStar" },
    ],
    correctIndex: 0,
    explanation: "Role reversal works both ways — strong breakout through resistance.",
    image: { alt: "Bullish marubozu breaking through resistance with follow-through" },
  },
  {
    id: "sp3",
    type: "drag_label",
    challengeBadge: "Practice 3 · Drag",
    instruction: "Label the S/R map — drag SUPPORT FLOOR and RESISTANCE CEILING to the right zones.",
    labels: ["SUPPORT FLOOR", "RESISTANCE CEILING"],
    zones: [
      { id: "spz1", title: "Lower horizontal band", correctLabel: "SUPPORT FLOOR" },
      { id: "spz2", title: "Upper horizontal band", correctLabel: "RESISTANCE CEILING" },
    ],
    explanation: "Zones capture liquidity better than one-pixel lines.",
    image: { alt: "Chart with upper and lower horizontal zones for labeling" },
  },
  {
    id: "sp4",
    type: "chart_tap",
    challengeBadge: "Practice 4 · Tap",
    question: "Tap a candle that tags support and bounces.",
    correctCandleIndex: 2,
    explanation: "Clear rejection from the floor.",
    highlightStyle: "longLowerWick",
    image: { alt: "Practice chart with support test and bounce candle highlighted" },
  },
  {
    id: "sp5",
    type: "visual_choice",
    challengeBadge: "Practice 5 · Pick",
    question: "Low volume drift through a level — tap the weak-conviction shape.",
    options: [
      { label: "Marubozu bull", preset: "marubozuBull" },
      { label: "Doji", preset: "doji" },
      { label: "Hammer", preset: "hammer" },
      { label: "Marubozu bear", preset: "marubozuBear" },
    ],
    correctIndex: 1,
    explanation: "Weaker conviction — easier to violate than a high-volume rejection.",
    image: { alt: "Small doji candles drifting through level on low volume" },
  },
  {
    id: "sp6",
    type: "chart_tap",
    challengeBadge: "Practice 6 · Tap",
    question: "Tap the candle rejecting at the resistance ceiling.",
    correctCandleIndex: 4,
    explanation: "Long upper wick at resistance — sellers cap the rally.",
    highlightStyle: "shootingStar",
    image: { alt: "Chart with shooting star rejection at resistance ceiling" },
  },
  {
    id: "sp7",
    type: "drag_label",
    challengeBadge: "Practice 7 · Boss",
    instruction: "Multi-timeframe drill — label DAILY ZONE and HOURLY TRIGGER.",
    labels: ["DAILY ZONE", "HOURLY TRIGGER"],
    zones: [
      { id: "spz3", title: "Bigger support/resistance band", correctLabel: "DAILY ZONE" },
      { id: "spz4", title: "Precise entry candle at the zone", correctLabel: "HOURLY TRIGGER" },
    ],
    explanation: "Multi-timeframe confluence can strengthen a S/R thesis.",
    image: { alt: "Daily zone with hourly trigger candle marked for confluence entry" },
  },
];
