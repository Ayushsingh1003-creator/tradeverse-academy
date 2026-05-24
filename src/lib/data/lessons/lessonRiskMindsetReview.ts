import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const riskMindsetReviewPages: LessonPage[] = [
  {
    id: "rmr-p1",
    type: "pretest",
    question: "Final check: what matters most for a beginner's long-term survival?",
    options: ["Picking the right tip", "Risk control + journaling + discipline", "Trading every signal", "Using maximum leverage"],
    correctIndex: 1,
    explanation: "Right. Risk + process + journal = the survival triangle.",
  },
  {
    id: "rmr-p2",
    type: "callout",
    variant: "concept",
    title: "Course 3 recap",
    content:
      "You now understand WHY traders lose, the 1% rule for position sizing, why SL is non-negotiable, how R:R math drives long-term profitability, the value of journaling & review, the 5 main emotional traps, and the guardrails that protect you from yourself.",
  },
  {
    id: "rmr-p3",
    type: "multiple_choice",
    question: "Your account is ₹2,00,000. Risk per trade 1%. Entry ₹500, SL ₹490. Max position size?",
    options: ["20 shares", "100 shares", "200 shares", "1,000 shares"],
    correctIndex: 2,
    explanation: "Max risk ₹2,000 / risk per share ₹10 = 200 shares.",
  },
  {
    id: "rmr-p4",
    type: "drag_label",
    instruction: "Match each beginner mistake to its mechanical fix.",
    labels: ["Overtrading", "Revenge trading", "No SL", "Oversizing"],
    zones: [
      { id: "rmr-z1", title: "Max 3 trades per day rule", correctLabel: "Overtrading" },
      { id: "rmr-z2", title: "15-min cool-down after loss", correctLabel: "Revenge trading" },
      { id: "rmr-z3", title: "Mandatory broker-side SL before entry", correctLabel: "No SL" },
      { id: "rmr-z4", title: "Fixed 1% risk position-sizing formula", correctLabel: "Oversizing" },
    ],
    explanation: "Every emotional mistake has a mechanical fix.",
  },
  {
    id: "rmr-p5",
    type: "true_false",
    statement: "Process discipline is more important than any single trade's outcome.",
    correct: true,
    explanation: "Process > outcome on any individual trade.",
  },
  {
    id: "rmr-p6",
    type: "multiple_choice",
    question: "Best definition of a 'good trade':",
    options: [
      "Any trade that made profit",
      "A planned trade with proper risk, executed per rules — regardless of outcome",
      "A trade based on news",
      "A trade with no stop loss",
    ],
    correctIndex: 1,
    explanation: "Process success ≠ outcome.",
  },
  {
    id: "rmr-p7",
    type: "fill_blank",
    sentence: "A losing trade that followed all rules is still a [___] trade.",
    correctAnswer: "good",
    explanation: "Process-good.",
  },
  {
    id: "rmr-p8",
    type: "callout",
    variant: "tip",
    title: "Foundation complete",
    content:
      "You've finished the Foundation track. You know the markets, how to trade, and how to survive. Now move on to Technical Analysis — but never abandon what you've built here. Risk discipline IS the strategy.",
  },
];

export const riskMindsetReviewPractice: PracticeQuestion[] = [
  {
    id: "rmr-pr1",
    type: "multiple_choice",
    question: "The 1% rule says you should:",
    options: ["Risk 1% of your account per trade", "Trade 1% of stocks daily", "Take 1% leverage", "Hold for 1% gain"],
    correctIndex: 0,
    explanation: "Max risk per trade = 1% of account.",
  },
  {
    id: "rmr-pr2",
    type: "true_false",
    statement: "Even profitable traders have losing trades regularly.",
    correct: true,
    explanation: "Yes — losses are normal.",
  },
  {
    id: "rmr-pr3",
    type: "fill_blank",
    sentence: "After a losing trade, take a mandatory [___]-minute cool-down.",
    correctAnswer: "15",
    explanation: "15 minutes to reset.",
  },
  {
    id: "rmr-pr4",
    type: "multiple_choice",
    question: "Target R:R for planned trades is at least:",
    options: ["1:0.5", "1:1", "1:2", "1:10 always"],
    correctIndex: 2,
    explanation: "1:2 is the practical floor.",
  },
  {
    id: "rmr-pr5",
    type: "true_false",
    statement: "Journaling without weekly review captures most of the benefit.",
    correct: false,
    explanation: "Review is where lessons surface.",
  },
  {
    id: "rmr-pr6",
    type: "multiple_choice",
    question: "Which is the WORST response to 3 consecutive losses today?",
    options: ["Stop and review tomorrow", "Take a 4th trade with double size", "Journal and plan tomorrow", "Walk away"],
    correctIndex: 1,
    explanation: "Doubling on losing streak is account-killer.",
  },
];
