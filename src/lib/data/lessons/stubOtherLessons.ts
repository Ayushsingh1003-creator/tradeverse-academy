import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

const stubPractice: PracticeQuestion[] = [
  {
    id: "st1",
    type: "multiple_choice",
    question: "Placeholder practice: RSI measures:",
    options: ["Volume", "Momentum / speed of moves", "Market cap", "Dividends"],
    correctIndex: 1,
    explanation: "RSI is a momentum oscillator.",
  },
  {
    id: "st2",
    type: "true_false",
    statement: "This course will be expanded in a future release.",
    correct: true,
    explanation: "Candlestick Foundations is fully interactive; this path is a stub.",
  },
];

const rsiPages: LessonPage[] = [
  {
    id: "r1",
    type: "pretest",
    question: "RSI near 70 on a stock in a strong uptrend often means:",
    options: ["Guaranteed crash tomorrow", "Momentum is stretched — watch for pause", "The company is bankrupt", "Volume is zero"],
    correctIndex: 1,
    explanation: "Context matters — stretched momentum can persist or mean-revert.",
  },
  { id: "r2", type: "text", title: "RSI Basics (coming soon)", body: "Full **RSI** lessons will cover overbought/oversold, divergences, and failure swings. This stub keeps navigation working." },
  { id: "r3", type: "callout", variant: "tip", title: "Pro Tip:", content: "Pair RSI with **structure** — signals at key levels matter more than random oscillator prints." },
];

const maPages: LessonPage[] = [
  {
    id: "m1",
    type: "pretest",
    question: "A simple moving average uses:",
    options: ["Only today's close", "An average of past closes over N periods", "Options flow", "News sentiment"],
    correctIndex: 1,
    explanation: "SMA smooths price over a window.",
  },
  { id: "m2", type: "text", title: "Moving Averages (coming soon)", body: "We'll build **SMA/EMA** interactions like Brilliant-style drills. For now, complete Candlestick Foundations!" },
];

export const STUB_OTHER_LESSONS = [
  {
    id: "l-rsi",
    slug: "rsi-basics",
    title: "RSI Basics",
    courseId: "c2",
    xpReward: 50,
    isFree: false,
    pages: rsiPages,
    practice: stubPractice,
  },
  {
    id: "l-ma",
    slug: "moving-averages",
    title: "Moving Averages",
    courseId: "c2",
    xpReward: 50,
    isFree: false,
    pages: maPages,
    practice: stubPractice,
  },
];
