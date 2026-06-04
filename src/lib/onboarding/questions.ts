export type AssessmentOption = {
  id: string;
  label: string;
};

export type AssessmentQuestion = {
  id: string;
  block: "background" | "knowledge" | "discipline";
  question: string;
  options: AssessmentOption[];
};

export const ONBOARDING_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "q1",
    block: "background",
    question: "How long have you been actively trading?",
    options: [
      { id: "never", label: "Never traded" },
      { id: "under_1y", label: "Less than 1 year" },
      { id: "1_3y", label: "1–3 years" },
      { id: "3y_plus", label: "3+ years" },
    ],
  },
  {
    id: "q2",
    block: "background",
    question: "What best describes your results so far?",
    options: [
      { id: "havent_traded", label: "Haven't really traded yet" },
      { id: "losing", label: "Losing overall" },
      { id: "breakeven", label: "Around breakeven" },
      { id: "profitable", label: "Consistently profitable" },
    ],
  },
  {
    id: "q3",
    block: "knowledge",
    question:
      "You want to buy only if price drops to a specific level. Which order do you use?",
    options: [
      { id: "market", label: "Market order" },
      { id: "limit", label: "Limit order" },
      { id: "stop_loss", label: "Stop-loss order" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q4",
    block: "knowledge",
    question:
      "You have $10,000 and risk 1% per trade. Your stop-loss is 5% below entry. How big can your position be?",
    options: [
      { id: "100", label: "$100" },
      { id: "500", label: "$500" },
      { id: "2000", label: "$2,000" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q5",
    block: "knowledge",
    question:
      "You buy a call option and price stays flat until expiry. Your option's value will…",
    options: [
      { id: "rise", label: "Rise slowly" },
      { id: "flat", label: "Stay the same" },
      { id: "decay", label: "Fall due to time decay" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q6",
    block: "discipline",
    question:
      "You've hit 3 stop-losses in a row today and are down 4%. The market is showing another setup that matches your plan. What do you do?",
    options: [
      { id: "double", label: "Take it with double size to recover losses" },
      { id: "skip", label: "Skip it — I don't trust myself after 3 losses" },
      { id: "normal", label: "Take it at normal size — the setup is valid, past trades don't change the odds" },
      { id: "half", label: "Take it with half size to be safe" },
    ],
  },
  {
    id: "q7",
    block: "discipline",
    question:
      "Your trade is up 8%, hitting your target. Momentum still looks strong. What do you do?",
    options: [
      { id: "exit_all", label: "Exit everything — a profit is a profit" },
      { id: "hold_all", label: "Hold everything and remove the target — let it ride" },
      { id: "partial_trail", label: "Book partial profit, trail a stop on the rest" },
      { id: "add", label: "Add more to the position" },
    ],
  },
  {
    id: "q8",
    block: "discipline",
    question:
      "You bought expecting a bounce. Price falls through your stop level, but you're \"sure\" it will recover. What do you do?",
    options: [
      { id: "hold", label: "Hold — it always comes back eventually" },
      { id: "average_down", label: "Average down to lower my entry price" },
      { id: "exit", label: "Exit now — the stop is the stop" },
      { id: "hedge", label: "Hold but hedge with an opposite position" },
    ],
  },
];

export const ONBOARDING_QUESTION_IDS = ONBOARDING_QUESTIONS.map((q) => q.id);
