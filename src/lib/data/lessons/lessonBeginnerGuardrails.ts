import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const beginnerGuardrailsPages: LessonPage[] = [
  {
    id: "bg-p1",
    type: "pretest",
    question: "Which is a 'guardrail' a beginner should commit to?",
    options: ["No max trades per day", "Max 1% risk per trade and max 3 trades per day", "Trade as much as possible", "Skip the journal"],
    correctIndex: 1,
    explanation: "Mechanical limits are guardrails. They protect you from emotion.",
  },
  {
    id: "bg-p2",
    type: "text",
    title: "Rules that save you from yourself",
    body: "Guardrails are pre-committed rules you DON'T re-decide in the moment. They override your emotions. Without them, every losing day pulls you into worse decisions.",
  },
  {
    id: "bg-p3",
    type: "visual",
    visualId: "GuardrailsBoard",
    caption: "Tick the rules you'll commit to. Be honest. These will define your survival.",
  },
  {
    id: "bg-p4",
    type: "callout",
    variant: "rule",
    title: "Beginner default rule set",
    content:
      "1. Max 1% risk per trade\n2. Max 3 trades per day\n3. Mandatory SL before every entry\n4. 15-min cool-down after any loss\n5. Journal every trade\n6. Weekly review every Sunday",
  },
  {
    id: "bg-p5",
    type: "multiple_choice",
    question: "If you hit 3 stop losses in a row, the best guardrail action is:",
    options: ["Try a 4th — luck has to turn", "Stop trading for the day", "Increase size", "Trade a different asset class"],
    correctIndex: 1,
    explanation: "3 consecutive losses signals 'something's off'. Stop, review, return tomorrow.",
  },
  {
    id: "bg-p6",
    type: "true_false",
    statement: "Pre-committed rules are easier to follow than 'I'll decide in the moment'.",
    correct: true,
    explanation: "Decisions made in calm beat decisions made in stress.",
  },
  {
    id: "bg-p7",
    type: "fill_blank",
    sentence: "A daily max-trade rule directly attacks [___] trading.",
    correctAnswer: "over",
    explanation: "Overtrading.",
  },
  {
    id: "bg-p8",
    type: "multiple_choice",
    question: "Which rule helps reduce revenge trading?",
    options: ["No max trades", "Mandatory cool-down after loss", "Always double size", "Skip journal"],
    correctIndex: 1,
    explanation: "Cool-down breaks the emotional spiral.",
  },
];

export const beginnerGuardrailsPractice: PracticeQuestion[] = [
  {
    id: "bg-pr1",
    type: "multiple_choice",
    question: "A guardrail is best described as:",
    options: ["A real-time decision", "A pre-committed rule", "A WhatsApp tip", "A type of indicator"],
    correctIndex: 1,
    explanation: "Pre-commitment is the point.",
  },
  {
    id: "bg-pr2",
    type: "true_false",
    statement: "Mechanical max-trade limits attack overtrading.",
    correct: true,
    explanation: "Yes.",
  },
  {
    id: "bg-pr3",
    type: "fill_blank",
    sentence: "[___]-minute cool-down after a loss reduces revenge trading.",
    correctAnswer: "15",
    explanation: "15 minutes is a common baseline.",
  },
  {
    id: "bg-pr4",
    type: "multiple_choice",
    question: "After 3 losses today, you should:",
    options: ["Take 5 more trades", "Stop, review, return tomorrow", "Double size", "Change asset class"],
    correctIndex: 1,
    explanation: "Walk away. Review. Reset.",
  },
  {
    id: "bg-pr5",
    type: "true_false",
    statement: "Posting your rules near your screen helps with compliance.",
    correct: true,
    explanation: "Visual reminder fights emotional drift.",
  },
];
