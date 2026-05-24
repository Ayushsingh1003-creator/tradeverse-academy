import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const journalingYourTradesPages: LessonPage[] = [
  {
    id: "j-p1",
    type: "pretest",
    question: "What's the SINGLE biggest difference between profitable retail traders and the rest?",
    options: ["They use better indicators", "They journal & review every trade", "They have more capital", "They use leverage"],
    correctIndex: 1,
    explanation: "Studies consistently show: journaling + structured review is the #1 differentiator.",
  },
  {
    id: "j-p2",
    type: "text",
    title: "Journal or stay random",
    body: "If you don't journal, you can't see your own patterns. You'll repeat the same mistakes forever. A trade journal converts experience into **lessons**.\n\nMinimum fields: setup, entry, SL, target, size, outcome, emotion, lesson.",
  },
  {
    id: "j-p3",
    type: "visual",
    visualId: "JournalDemo",
    caption: "A real journal entry — copy this template into Notion, Excel, or a notebook.",
  },
  {
    id: "j-p4",
    type: "callout",
    variant: "tip",
    title: "Weekly review > daily journal",
    content:
      "Daily journal = capture data. Weekly review = find patterns: 'I lose most on Mondays' or 'My winners are when I wait for confirmation'. Patterns drive improvement.",
  },
  {
    id: "j-p5",
    type: "multiple_choice",
    question: "Which trade is MOST important to journal?",
    options: ["The biggest win", "The biggest loss", "Every single trade", "Only ones with news"],
    correctIndex: 2,
    explanation: "Every trade. Losses teach. Wins reinforce. Both are data.",
  },
  {
    id: "j-p6",
    type: "true_false",
    statement: "Journaling your EMOTION (not just price) reveals when discipline broke down.",
    correct: true,
    explanation: "True. 'I felt impatient and chased' is a critical lesson.",
  },
  {
    id: "j-p7",
    type: "fill_blank",
    sentence: "Weekly [___] turns daily journal entries into actionable patterns.",
    correctAnswer: "review",
    explanation: "Review surfaces what's recurring.",
  },
  {
    id: "j-p8",
    type: "multiple_choice",
    question: "A trader keeps a journal but never re-reads it. The journal is:",
    options: ["Still useful — writing is enough", "Worthless without review", "Equivalent to no journal", "Both B and C"],
    correctIndex: 3,
    explanation: "Writing alone helps a little. Real value comes from RE-READING and REVIEWING.",
  },
];

export const journalingYourTradesPractice: PracticeQuestion[] = [
  {
    id: "j-pr1",
    type: "multiple_choice",
    question: "Minimum field set in a journal includes:",
    options: ["Just P&L", "Setup, entry, SL, target, outcome, lesson", "Just date", "Just emotion"],
    correctIndex: 1,
    explanation: "Comprehensive fields = real learning.",
  },
  {
    id: "j-pr2",
    type: "true_false",
    statement: "Journaling alone (no review) gives most of the benefit.",
    correct: false,
    explanation: "Review is where lessons are extracted.",
  },
  {
    id: "j-pr3",
    type: "fill_blank",
    sentence: "Weekly review of your journal reveals [___].",
    correctAnswer: "patterns",
    explanation: "Recurring strengths & weaknesses.",
  },
  {
    id: "j-pr4",
    type: "multiple_choice",
    question: "You should journal:",
    options: ["Only wins", "Only big trades", "Every trade", "Only news days"],
    correctIndex: 2,
    explanation: "Every trade — no exceptions.",
  },
  {
    id: "j-pr5",
    type: "true_false",
    statement: "Capturing emotion is just as useful as capturing price levels.",
    correct: true,
    explanation: "Emotion data shows discipline breakdowns.",
  },
];
