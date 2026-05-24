import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const emotionalTrapsPages: LessonPage[] = [
  {
    id: "et-p1",
    type: "pretest",
    question: "You just hit your stop loss. Most damaging response is:",
    options: ["Take a 15-min break", "Journal the trade", "Immediately enter another trade to 'win it back'", "Walk for 5 minutes"],
    correctIndex: 2,
    explanation: "Revenge trading right after a loss = biggest beginner killer. Your judgement is impaired.",
  },
  {
    id: "et-p2",
    type: "text",
    title: "The 5 emotional traps",
    body: "Every trader fights these. Recognising them is half the fix:\n1. **FOMO** — chasing missed moves\n2. **Revenge trading** — angry trades after losses\n3. **Overtrading** — boredom-driven trades\n4. **Averaging losers** — adding to bad trades\n5. **Ego trading** — refusing to be wrong",
  },
  {
    id: "et-p3",
    type: "visual",
    visualId: "EmotionalTrapsScene",
    caption: "Tap each trap to see a realistic scenario and the practical fix.",
  },
  {
    id: "et-p4",
    type: "callout",
    variant: "rule",
    title: "Mandatory cool-down",
    content:
      "After ANY losing trade, walk away from the screen for 15 minutes. No exceptions. No new trades. Just breathe, journal, and reset.",
  },
  {
    id: "et-p5",
    type: "multiple_choice",
    question: "Trade goes against you. You DOUBLE your position to 'lower average price'. This is:",
    options: ["Smart capital management", "Averaging down a loser — high-risk anti-pattern", "Standard practice", "Required"],
    correctIndex: 1,
    explanation: "Adding to a losing trade scales up exposure to a bad thesis. Cut, don't add.",
  },
  {
    id: "et-p6",
    type: "true_false",
    statement: "Being WRONG fast (closing a losing trade) is a sign of skill, not weakness.",
    correct: true,
    explanation: "True. Pros cut losses fast. Beginners hold and hope.",
  },
  {
    id: "et-p7",
    type: "fill_blank",
    sentence: "Trading angry after a loss is called [___] trading.",
    correctAnswer: "revenge",
    explanation: "Revenge trading.",
  },
  {
    id: "et-p8",
    type: "multiple_choice",
    question: "Best antidote to FOMO:",
    options: [
      "Buy whatever's moving",
      "Wait for the NEXT valid setup with proper R:R",
      "Increase size",
      "Watch CNBC louder",
    ],
    correctIndex: 1,
    explanation: "The market gives infinite opportunities. Missing one is fine.",
  },
];

export const emotionalTrapsPractice: PracticeQuestion[] = [
  {
    id: "et-pr1",
    type: "multiple_choice",
    question: "Most dangerous trade right after a loss is the:",
    options: ["Planned setup tomorrow", "Revenge trade", "Skipping a trade", "Journaling"],
    correctIndex: 1,
    explanation: "Revenge trading.",
  },
  {
    id: "et-pr2",
    type: "true_false",
    statement: "Cool-down breaks reduce emotional decision-making.",
    correct: true,
    explanation: "Yes — let the heart rate settle.",
  },
  {
    id: "et-pr3",
    type: "fill_blank",
    sentence: "Adding to a losing trade is called averaging a [___].",
    correctAnswer: "loser",
    explanation: "Averaging down.",
  },
  {
    id: "et-pr4",
    type: "multiple_choice",
    question: "FOMO trade is usually:",
    options: ["Planned", "Late & emotional", "Backed by data", "Low risk"],
    correctIndex: 1,
    explanation: "Late chase at the top.",
  },
  {
    id: "et-pr5",
    type: "true_false",
    statement: "Closing a losing trade quickly is a strength, not weakness.",
    correct: true,
    explanation: "Risk-control hallmark.",
  },
];
