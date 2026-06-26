import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const howToReadAChartPages: LessonPage[] = [
  {
    id: "c0",
    type: "intro",
    title: "Candlestick Price Chart",
    subtitle: "Learn to read it.",
    image: { alt: "Futuristic candlestick chart inside a glowing cube on a dark trading grid" },
    startLabel: "Start",
  },
  {
    id: "c1",
    type: "image",
    badge: "Discovery",
    title: "What is a candlestick chart?",
    alt: "Simple candlestick chart with green and red candles trending upward",
    caption: "A type of **price chart**, consisting of a **sequence of candlesticks**.",
  },
  {
    id: "c2",
    type: "image",
    badge: "Axes",
    title: "Price vs Time",
    alt: "Candlestick chart showing price on the Y-axis and time on the X-axis",
    caption:
      "This chart shows the asset price on the **Y-axis** — and how the price changed over time on the **X-axis**.",
  },
  {
    id: "c3",
    type: "visual",
    visualId: "TimeframeTable",
  },
  {
    id: "c3q",
    type: "chart_compare",
    challengeBadge: "Spot the Chart · +30 XP",
    question: "You switch the platform to **1 hour per candle**.\n\nWhich chart did you get?",
    variants: ["m5", "m15", "h1", "d1"],
    correctIndex: 2,
    explanation: "**H1** = time labels **one hour apart** — e.g. 10:00, 11:00, 12:00.",
  },
  {
    id: "c4",
    type: "image",
    badge: "1-Hour Chart",
    title: "One candle = one hour",
    alt: "1-hour candlestick chart with 18:00 highlighted and a glowing candle between 18:00 and 19:00",
    caption:
      "This candlestick shows how price changed from **18:00 to 19:00**.\n\nOn a **1-hour** chart, each candlestick covers **60 minutes**.",
  },
  {
    id: "c4q",
    type: "time_bracket_drag",
    challengeBadge: "Place the Bracket · +30 XP",
    instruction: "Drag the **1-hour candle** onto the bar for **18:00 → 19:00**.",
    correctCandleIndex: 3,
    explanation: "One H1 candle = exactly **one hour** on the time axis. That span is the **18:00** bar.",
    image: { alt: "1-hour chart with time labels from 15:00 to 20:00" },
  },
  {
    id: "c5",
    type: "image",
    badge: "Daily Chart",
    title: "One candle = one day",
    alt: "Daily D1 candlestick chart with October 10 highlighted and a question mark above one candle",
    caption: "On a **D1 (daily)** chart, each candlestick represents **one full trading day**.",
  },
  {
    id: "c5q",
    type: "chart_compare",
    challengeBadge: "Spot the Chart · +30 XP",
    question: "Now the platform shows **one candle per trading day**. Which chart?",
    variants: ["h1", "h4", "d1", "m5"],
    correctIndex: 2,
    explanation: "**D1** = **date labels** on the axis (Oct 6, Oct 7…) — **one trading day** per bar.",
    image: { alt: "Daily chart with October 10 candle highlighted" },
  },
  {
    id: "c6",
    type: "image",
    badge: "Folding",
    title: "Candlesticks fold when you switch time frames",
    alt: "Four 1-hour candles on the left folding into one 4-hour candle on the right",
    caption:
      "If you switch time frames, the candlesticks **fold** (1H → 4H example).\n\nFour 1-hour candles combine into **one 4-hour candle**.",
  },
  {
    id: "c7",
    type: "image",
    badge: "Folding",
    title: "If you switch time frames, the candlesticks fold (1H → 4H example)",
    alt: "Four 1-hour candles folding into one 4-hour candle with Open, High, Low, and Close mapping",
    caption:
      "The **Close Price** of the last candlesticks becomes the **Close Price** of the folded candlesticks.",
  },
  {
    id: "c8",
    type: "image",
    badge: "Folding",
    title: "Four prices fold into one",
    alt: "1H to 4H fold diagram with OPEN HIGH LOW CLOSE mapping lines",
    caption:
      "The **Open** of the first, **High/Low** extremes, and **Close** of the last candlestick become the folded bar.",
  },
  {
    id: "c8q",
    type: "fold_chart_choice",
    variant: "text_options",
    challengeBadge: "Pick the Fold · +35 XP",
    question:
      "Four **1H** candles fold into one **4H** bar.\n\nWhich **4H** candle matches the guide lines?",
    correctIndex: 1,
    explanation:
      "**Open** from the first 1H bar · **High/Low** from the extremes · **Close** from the last. **Option B** is the folded **4H** candle.",
    image: { alt: "Four 1H candles with horizontal guide lines and four 4H result options A through D" },
  },
  {
    id: "c9",
    type: "image",
    badge: "Consolidation",
    title: "Smaller candles merge too",
    alt: "Three 5-minute candles merging into one 15-minute candle",
    caption: "Switching **5M → 15M** merges **three** candles into **one**.",
  },
  {
    id: "c10",
    type: "fold_chart_choice",
    variant: "text_options",
    challengeBadge: "Pick the Fold · +35 XP",
    question:
      "You've switched from **5 minutes** time frame to **15**.\n\nHow **15M** candlestick will look like?",
    correctIndex: 1,
    explanation:
      "Fuse left→right: **Open** from candle 1, **High/Low** from extremes, **Close** from candle 3. **Option B** is correct.",
    image: { alt: "Three 5M candles with guide lines and four 15M result options A through D" },
  },
  {
    id: "c11",
    type: "callout",
    variant: "rule",
    badge: "Recap",
    title: "How to Read a Chart",
    content:
      "1. **Y-axis** = price · **X-axis** = time\n2. **Time frame** sets candle spacing on the chart\n3. **Switching time frames folds candles** — connect Open/High/Low/Close\n4. **Lower TF candles fuse** into higher TF bars (5M→15M, 1H→4H…)",
  },
];

export const howToReadAChartPractice: PracticeQuestion[] = [
  {
    id: "cp1",
    type: "chart_compare",
    challengeBadge: "Practice 1",
    question: "Which chart is **15 minutes** per candle?",
    variants: ["m5", "m15", "h1", "d1"],
    correctIndex: 1,
    explanation: "**M15** labels step by **15 minutes** — e.g. 10:00, 10:15, 10:30.",
  },
  {
    id: "cp2",
    type: "drag_order",
    challengeBadge: "Practice 2 · Drag",
    instruction: "Drag codes into order — **shortest → longest** span per candle.",
    items: ["D1", "M5", "H1", "M15"],
    correctOrder: [1, 3, 2, 0],
    explanation: "**M5** < **M15** < **H1** < **D1**.",
  },
  {
    id: "cp3",
    type: "time_bracket_drag",
    challengeBadge: "Practice 3 · Drag",
    instruction: "Drag the **1-hour candle** onto the bar for **17:00 → 18:00**.",
    correctCandleIndex: 2,
    explanation: "Each bracket width = **one H1 candle** on the time axis.",
  },
  {
    id: "cp4",
    type: "fold_chart_choice",
    variant: "text_options",
    challengeBadge: "Practice 4",
    question:
      "Three **2H** candles fold into one **6H** bar.\n\nWhich **6H** candle matches the guide lines?",
    correctIndex: 1,
    explanation:
      "Fold rules: first **Open**, extreme **High/Low**, last **Close**. **Option B** is the folded **6H** candle.",
    image: { alt: "Three 2H candles with horizontal guide lines and four 6H result options A through D" },
  },
  {
    id: "cp5",
    type: "fold_chart_choice",
    variant: "text_options",
    challengeBadge: "Practice 5",
    question:
      "You've switched from **1 minute** time frame to **5**.\n\nHow **5M** candlestick will look like?",
    correctIndex: 1,
    explanation:
      "Fuse left→right: **Open** from candle 1, **High/Low** from extremes, **Close** from candle 5. **Option B** is correct.",
    image: { alt: "Five 1M candles with guide lines and four 5M result options A through D" },
  },
  {
    id: "cp6",
    type: "chart_compare",
    challengeBadge: "Practice 6",
    question: "Platform set to **4 hours** per candle — which chart?",
    variants: ["h1", "h4", "d1", "m15"],
    correctIndex: 1,
    explanation: "**H4** = labels every **four hours** — e.g. 08:00, 12:00, 16:00.",
  },
];
