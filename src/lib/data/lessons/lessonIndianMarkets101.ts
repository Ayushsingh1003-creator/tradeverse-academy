import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const indianMarkets101Pages: LessonPage[] = [
  {
    id: "im-p1",
    type: "pretest",
    question: "Which two are India's main stock exchanges?",
    options: ["NSE and BSE", "RBI and SEBI", "MCX and NCDEX", "Nifty and Sensex"],
    correctIndex: 0,
    explanation: "NSE (National Stock Exchange) and BSE (Bombay Stock Exchange) are the two main equity exchanges in India.",
  },
  {
    id: "im-p2",
    type: "text",
    title: "The big picture of Indian markets",
    body: "Two exchanges (**NSE** & **BSE**), two benchmark indices (**Nifty 50** & **Sensex**), and one watchdog (**SEBI**) — these are the pieces every Indian trader must know.",
  },
  {
    id: "im-p3",
    type: "visual",
    visualId: "IndianMarketsExplorer",
    caption: "Tap each pillar of the Indian market to learn what it is and what it does.",
  },
  {
    id: "im-p4",
    type: "callout",
    variant: "concept",
    title: "Nifty vs Sensex",
    content:
      "Both are 'market thermometers'. **Nifty 50** = 50 largest stocks on NSE. **Sensex** = 30 largest stocks on BSE. They almost always move together — when people say 'the market', they usually mean these.",
  },
  {
    id: "im-p5",
    type: "multiple_choice",
    question: "SEBI's main job is to:",
    options: ["Run the exchanges", "Regulate the market and protect investors", "Set Nifty's price", "License banks"],
    correctIndex: 1,
    explanation: "SEBI (Securities and Exchange Board of India) is the regulator — it makes rules, licenses brokers, and protects investors.",
  },
  {
    id: "im-p6",
    type: "fill_blank",
    sentence: "The benchmark index of NSE is the [___] 50.",
    correctAnswer: "nifty",
    explanation: "Nifty 50 is NSE's flagship index.",
  },
  {
    id: "im-p7",
    type: "true_false",
    statement: "A stock can be listed on both NSE and BSE at the same time.",
    correct: true,
    explanation: "True. Most large-cap stocks like Reliance, TCS, HDFC Bank are dual-listed. NSE usually has higher volume.",
  },
  {
    id: "im-p8",
    type: "multiple_choice",
    question: "If Nifty drops 1% in a day, it most likely means:",
    options: [
      "BSE is shutting down",
      "The 50 largest NSE stocks fell on average by ~1%",
      "Only Reliance fell",
      "Sensex moved up",
    ],
    correctIndex: 1,
    explanation: "Nifty is a weighted average of 50 stocks. A 1% drop reflects broad weakness across these names.",
  },
];

export const indianMarkets101Practice: PracticeQuestion[] = [
  {
    id: "im-pr1",
    type: "multiple_choice",
    question: "SEBI is best described as:",
    options: ["A stock exchange", "The Indian markets regulator", "A broker", "An index"],
    correctIndex: 1,
    explanation: "Securities and Exchange Board of India = regulator.",
  },
  {
    id: "im-pr2",
    type: "true_false",
    statement: "Sensex has 30 stocks.",
    correct: true,
    explanation: "Sensex is composed of 30 BSE-listed large-caps.",
  },
  {
    id: "im-pr3",
    type: "fill_blank",
    sentence: "NSE was founded in [___] and is fully electronic.",
    correctAnswer: "1992",
    explanation: "NSE was set up in 1992 to bring transparency and electronic trading to India.",
  },
  {
    id: "im-pr4",
    type: "multiple_choice",
    question: "Which is NOT a benchmark index?",
    options: ["Nifty 50", "Sensex", "Bank Nifty", "MCX Gold"],
    correctIndex: 3,
    explanation: "MCX Gold is a commodity contract, not an equity index.",
  },
  {
    id: "im-pr5",
    type: "true_false",
    statement: "BSE is Asia's oldest stock exchange.",
    correct: true,
    explanation: "BSE was established in 1875 — Asia's oldest.",
  },
];
