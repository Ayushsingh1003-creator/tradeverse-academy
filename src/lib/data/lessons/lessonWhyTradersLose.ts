import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const whyTradersLosePages: LessonPage[] = [
  {
    id: "wl-p1",
    type: "pretest",
    question: "Roughly what percent of retail F&O traders lose money (per SEBI's FY22–FY24 study)?",
    options: ["10%", "30%", "50%", "~93%"],
    correctIndex: 3,
    explanation: "SEBI's September 2024 study found 93% of individual F&O traders incurred losses between FY22 and FY24, with aggregate losses exceeding ₹1.8 lakh crore.",
  },
  {
    id: "wl-p2",
    type: "text",
    title: "Why most traders lose",
    body: "The dirty secret of retail trading: most people lose. Not because the market is rigged — because they violate the same handful of rules over and over:\n- No stop loss\n- Oversized positions\n- Chasing tips\n- Revenge trading after losses\n- Trading without a defined edge",
  },
  {
    id: "wl-p3",
    type: "visual",
    visualId: "LoseStatsVisual",
    caption: "Source: SEBI's *Study on F&O Trading* (Sept 2024). Click each reason to acknowledge it — we'll fix all of them in this course.",
  },
  {
    id: "wl-p4",
    type: "callout",
    variant: "warning",
    title: "Survival is the strategy",
    content:
      "Your only job in your first 6 months is to survive. Not to make money. Survive long enough to learn, refine, and build edge. Big returns come AFTER survival.",
  },
  {
    id: "wl-p5",
    type: "multiple_choice",
    question: "A trader risks ₹50,000 on one trade and loses. Account drops from ₹2L to ₹1.5L. To recover ₹50k, the next trade needs:",
    options: ["A 25% gain on the next trade", "A 33% gain on the next trade", "A 50% gain on the next trade", "Same ₹ amount = easy"],
    correctIndex: 1,
    explanation: "₹50k / ₹1.5L = 33%. Losses asymmetrically punish — bigger losses need outsized gains to recover.",
  },
  {
    id: "wl-p6",
    type: "true_false",
    statement: "Even highly skilled traders have losing trades — losses are not the problem; SIZE of losses is.",
    correct: true,
    explanation: "True. Pros lose often. They just don't lose BIG.",
  },
  {
    id: "wl-p7",
    type: "fill_blank",
    sentence: "The first goal of any beginner is [___] — not profit.",
    correctAnswer: "survival",
    explanation: "Stay in the game long enough to learn.",
  },
  {
    id: "wl-p8",
    type: "multiple_choice",
    question: "Which is the SAFEST mindset for a beginner?",
    options: [
      "I will double my account this month",
      "I'll learn process & limit downside; gains come later",
      "Big wins justify big bets",
      "Losses are unacceptable",
    ],
    correctIndex: 1,
    explanation: "Process-first, capital-preservation mindset wins long-term.",
  },
];

export const whyTradersLosePractice: PracticeQuestion[] = [
  {
    id: "wl-pr1",
    type: "multiple_choice",
    question: "Biggest reason beginners lose money is usually:",
    options: ["Bad luck", "Process & risk failures", "Broker issues", "Wrong screen size"],
    correctIndex: 1,
    explanation: "Process & risk discipline matter most.",
  },
  {
    id: "wl-pr2",
    type: "true_false",
    statement: "Big losses are mathematically harder to recover from than small ones.",
    correct: true,
    explanation: "Recovery percentage grows non-linearly with loss size.",
  },
  {
    id: "wl-pr3",
    type: "fill_blank",
    sentence: "Beginner job #1 is [___].",
    correctAnswer: "survival",
    explanation: "Survive to learn.",
  },
  {
    id: "wl-pr4",
    type: "multiple_choice",
    question: "Which is a survival mindset?",
    options: ["Risk everything for a 10x", "Risk 1% per trade and journal each one", "Average down every loser", "Trade size after losses"],
    correctIndex: 1,
    explanation: "Small, controlled risk per trade.",
  },
  {
    id: "wl-pr5",
    type: "true_false",
    statement: "Even pro traders take losses regularly.",
    correct: true,
    explanation: "Yes — they're inevitable.",
  },
];
