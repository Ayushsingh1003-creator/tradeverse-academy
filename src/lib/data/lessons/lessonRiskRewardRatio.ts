import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const riskRewardRatioPages: LessonPage[] = [
  {
    id: "rr-p1",
    type: "pretest",
    question: "Risk ₹10, reward ₹30. R:R is:",
    options: ["1:3", "3:1", "1:30", "10:30"],
    correctIndex: 0,
    explanation: "Risk:Reward = 1:3. You risk 1 unit to make 3.",
  },
  {
    id: "rr-p2",
    type: "text",
    title: "Asymmetric bets win long-term",
    body: "The math of trading isn't about win rate — it's about R:R. A 40% win rate at 1:2 R:R is profitable. A 70% win rate at 1:0.5 R:R is barely break-even after costs. Aim for **at least 1:2** R:R on every planned trade.",
  },
  {
    id: "rr-p3",
    type: "visual",
    visualId: "RRRatioVisual",
    caption: "Adjust entry, SL, and target — see how the math changes.",
  },
  {
    id: "rr-p4",
    type: "callout",
    variant: "concept",
    title: "Expectancy",
    content:
      "Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss). Positive expectancy = profitable over time. R:R is the dial that lets you be profitable even with mediocre win rate.",
  },
  {
    id: "rr-p5",
    type: "multiple_choice",
    question: "Entry ₹100, SL ₹95, Target ₹120. R:R is:",
    options: ["1:1", "1:2", "1:4", "5:1"],
    correctIndex: 2,
    explanation: "Risk = 5, Reward = 20. 1:4 R:R.",
  },
  {
    id: "rr-p6",
    type: "true_false",
    statement: "With 1:3 R:R, even a 30% win rate is profitable over many trades.",
    correct: true,
    explanation: "Math: 30% × 3R − 70% × 1R = 0.9R − 0.7R = +0.2R per trade.",
  },
  {
    id: "rr-p7",
    type: "fill_blank",
    sentence: "Aim for at least 1:[___] R:R on planned trades.",
    correctAnswer: "2",
    explanation: "1:2 is the beginner-friendly threshold.",
  },
  {
    id: "rr-p8",
    type: "multiple_choice",
    question: "Best response when target gives only 1:1 R:R:",
    options: [
      "Take the trade anyway",
      "Skip — the math is poor",
      "Widen the stop loss for better ratio",
      "Move target further (without basis)",
    ],
    correctIndex: 1,
    explanation: "Don't fake the math. Skip trades where R:R is poor.",
  },
];

export const riskRewardRatioPractice: PracticeQuestion[] = [
  {
    id: "rr-pr1",
    type: "multiple_choice",
    question: "Risk ₹2, reward ₹8 → R:R is:",
    options: ["1:2", "1:4", "2:1", "4:1"],
    correctIndex: 1,
    explanation: "Reward/Risk = 4 → 1:4.",
  },
  {
    id: "rr-pr2",
    type: "true_false",
    statement: "R:R > 1 means reward exceeds risk per trade.",
    correct: true,
    explanation: "Yes — favourable bet structure.",
  },
  {
    id: "rr-pr3",
    type: "fill_blank",
    sentence: "Expectancy combines win rate with [___] ratio.",
    correctAnswer: "rr",
    explanation: "R:R + win rate define expectancy.",
  },
  {
    id: "rr-pr4",
    type: "multiple_choice",
    question: "Better trader logic:",
    options: ["High win rate, low R:R", "Sustainable edge with at least 1:2 R:R", "Random", "Always 100% win rate"],
    correctIndex: 1,
    explanation: "Edge + R:R compounds.",
  },
  {
    id: "rr-pr5",
    type: "true_false",
    statement: "Faking better R:R by widening SL is acceptable.",
    correct: false,
    explanation: "Never. Plan SL by structure, not by desire.",
  },
];
