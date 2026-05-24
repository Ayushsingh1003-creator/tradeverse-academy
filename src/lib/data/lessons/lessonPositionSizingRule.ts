import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const positionSizingRulePages: LessonPage[] = [
  {
    id: "ps-p1",
    type: "pretest",
    question: "Your account is ₹1,00,000. Using the 1% rule, max risk per trade is:",
    options: ["₹100", "₹500", "₹1,000", "₹10,000"],
    correctIndex: 2,
    explanation: "1% of ₹1L = ₹1,000. This is the MAX you accept losing on ONE trade.",
  },
  {
    id: "ps-p2",
    type: "text",
    title: "The 1% Rule",
    body: "**Never risk more than 1% of your account on a single trade.** That single rule alone keeps you in the game through any losing streak. A 10-loss streak at 1% risk = ~10% drawdown. Survivable. A 10-loss streak at 5% risk = ~40% drawdown. Account-ending.",
  },
  {
    id: "ps-p3",
    type: "visual",
    visualId: "PositionSizingCalc",
    caption: "Plug in your account, risk %, entry, and SL — see the exact share count your plan allows.",
  },
  {
    id: "ps-p4",
    type: "callout",
    variant: "rule",
    title: "The formula",
    content:
      "Position size = (Account × Risk%) ÷ |Entry − Stop Loss|. \nDon't pick a share count first and then choose SL. ALWAYS plan SL first, then derive size.",
  },
  {
    id: "ps-p5",
    type: "multiple_choice",
    question: "Account ₹2,00,000. Risk 1%. Entry ₹500, SL ₹490. Max shares?",
    options: ["10", "20", "50", "200"],
    correctIndex: 4,
    explanation: "Max risk = ₹2,000. Risk per share = ₹10. So ₹2,000 / ₹10 = 200 shares.",
  },
  {
    id: "ps-p6",
    type: "fill_blank",
    sentence: "Position size = (Account × Risk%) ÷ Risk per [___].",
    correctAnswer: "share",
    explanation: "Risk per share = |Entry − SL|.",
  },
  {
    id: "ps-p7",
    type: "true_false",
    statement: "When stop loss is wider, position size must be smaller to keep risk constant.",
    correct: true,
    explanation: "Yes — wider SL = bigger ₹ risk per share = smaller share count.",
  },
  {
    id: "ps-p8",
    type: "multiple_choice",
    question: "If your sizing formula gives a fractional answer like 47.6, you should:",
    options: ["Round UP to 48", "Round DOWN to 47", "Trade 47.6 shares", "Skip the trade"],
    correctIndex: 1,
    explanation: "Always round DOWN to keep risk strictly below your max.",
  },
];

export const positionSizingRulePractice: PracticeQuestion[] = [
  {
    id: "ps-pr1",
    type: "multiple_choice",
    question: "1% risk on a ₹50,000 account is:",
    options: ["₹50", "₹500", "₹5,000", "₹10"],
    correctIndex: 1,
    explanation: "₹500.",
  },
  {
    id: "ps-pr2",
    type: "true_false",
    statement: "Wider stop = smaller position size (for same risk budget).",
    correct: true,
    explanation: "Yes — inverse relationship.",
  },
  {
    id: "ps-pr3",
    type: "fill_blank",
    sentence: "Position size = Max risk ÷ Risk per [___].",
    correctAnswer: "share",
    explanation: "Per-share risk.",
  },
  {
    id: "ps-pr4",
    type: "multiple_choice",
    question: "Increasing size after losses (martingale) is generally:",
    options: ["Smart strategy", "Account-killer", "Recommended", "Required"],
    correctIndex: 1,
    explanation: "Avoid martingale in trading.",
  },
  {
    id: "ps-pr5",
    type: "true_false",
    statement: "Sizing each trade by formula removes emotion from share count.",
    correct: true,
    explanation: "Mechanical sizing = consistent risk.",
  },
];
