import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const marketHoursIndiaPages: LessonPage[] = [
  {
    id: "mh-p1",
    type: "pretest",
    question: "When does the regular equity session on NSE & BSE start?",
    options: ["08:00 IST", "09:00 IST", "09:15 IST", "10:00 IST"],
    correctIndex: 2,
    explanation: "Regular session starts at 09:15 IST. Pre-open is from 09:00 to 09:15.",
  },
  {
    id: "mh-p2",
    type: "text",
    title: "When is the Indian market open?",
    body: "Indian equity markets follow a fixed schedule on weekdays (Mon–Fri):\n- **Pre-Open:** 09:00 – 09:15 IST\n- **Regular Session:** 09:15 – 15:30 IST\n- **Post-Close:** 15:40 – 16:00 IST\n\nWeekends are closed. Specific holidays are declared by NSE/BSE.",
  },
  {
    id: "mh-p3",
    type: "visual",
    visualId: "MarketHoursClock",
    caption: "Click each window to understand what happens in that phase.",
  },
  {
    id: "mh-p4",
    type: "callout",
    variant: "tip",
    title: "The first & last hour matter most",
    content:
      "Volatility is usually highest in the first hour (09:15–10:15) and the last hour (14:30–15:30). These windows have the most volume — and the most opportunity & risk.",
  },
  {
    id: "mh-p5",
    type: "multiple_choice",
    question: "You see a sharp move at 09:10 IST in the pre-open. What's true?",
    options: [
      "Trades are being executed at this exact price",
      "Orders are being collected — execution starts only at 09:15",
      "It's a fake move with no relevance",
      "Pre-open is a global session",
    ],
    correctIndex: 1,
    explanation: "Pre-open is for order collection & equilibrium price discovery. Actual matching at the open price happens at 09:15.",
  },
  {
    id: "mh-p6",
    type: "true_false",
    statement: "Indian equity markets are open on Saturdays.",
    correct: false,
    explanation: "False. NSE & BSE are closed on Saturdays, Sundays, and declared holidays.",
  },
  {
    id: "mh-p7",
    type: "fill_blank",
    sentence: "The Indian equity market closes at [___] IST.",
    correctAnswer: "15:30",
    explanation: "Regular session ends at 15:30. Post-close window runs from 15:40 to 16:00.",
  },
  {
    id: "mh-p8",
    type: "multiple_choice",
    question: "A beginner should generally avoid trading in:",
    options: [
      "The first 5 minutes of open (high noise)",
      "Mid-morning steady session",
      "Pre-lunch zone",
      "All of these are equally good",
    ],
    correctIndex: 0,
    explanation: "First few minutes after open can be wild and unpredictable. Many pros wait 15–30 minutes for structure to form.",
  },
];

export const marketHoursIndiaPractice: PracticeQuestion[] = [
  {
    id: "mh-pr1",
    type: "multiple_choice",
    question: "Regular session ends at:",
    options: ["14:30 IST", "15:00 IST", "15:30 IST", "16:00 IST"],
    correctIndex: 2,
    explanation: "Equity regular session ends at 15:30 IST.",
  },
  {
    id: "mh-pr2",
    type: "true_false",
    statement: "Volume is usually highest at the open and close.",
    correct: true,
    explanation: "Yes — the first and last hour see the most action.",
  },
  {
    id: "mh-pr3",
    type: "fill_blank",
    sentence: "Pre-open runs from 09:00 to [___] IST.",
    correctAnswer: "09:15",
    explanation: "15 minutes for order collection.",
  },
  {
    id: "mh-pr4",
    type: "multiple_choice",
    question: "Best beginner practice is to:",
    options: ["Trade every minute of the session", "Pick specific windows with structure", "Trade after midnight", "Only trade at the open"],
    correctIndex: 1,
    explanation: "Disciplined window selection reduces overtrading.",
  },
  {
    id: "mh-pr5",
    type: "true_false",
    statement: "Holidays are pre-declared by the exchanges.",
    correct: true,
    explanation: "Yes — NSE/BSE publish the holiday calendar in advance.",
  },
];
