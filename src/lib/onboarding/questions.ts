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
    question: "How would you describe your trading results so far?",
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
    question: "Which order type do you use to buy only at or below a specific price?",
    options: [
      { id: "market", label: "Market order" },
      { id: "stop", label: "Stop order" },
      { id: "stop_limit", label: "Stop-limit order" },
      { id: "limit", label: "Limit order" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q4",
    block: "knowledge",
    question:
      "You have a ₹1,00,000 account and risk 2% per trade. How much (₹) are you risking on this trade?",
    options: [
      { id: "200", label: "₹200" },
      { id: "1000", label: "₹1,000" },
      { id: "2000", label: "₹2,000" },
      { id: "20000", label: "₹20,000" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q5",
    block: "knowledge",
    question: "Which concept describes an option losing value purely from time passing?",
    options: [
      { id: "delta", label: "Delta" },
      { id: "gamma", label: "Gamma" },
      { id: "vega", label: "Vega" },
      { id: "decay", label: "Theta (time decay)" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q6",
    block: "discipline",
    question:
      "You've hit 3 losing trades in a row, all within your normal risk rules. What do you do?",
    options: [
      { id: "double_down", label: "Double my size on the next trade to recover losses" },
      { id: "chase_next_setup", label: "Jump on the next setup I see, even outside my plan" },
      { id: "stop_for_day", label: "Stop trading for the day to reset" },
      {
        id: "normal",
        label: "Take the next valid setup at normal size — three losses within my rules is normal variance",
      },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q7",
    block: "discipline",
    question: "Your trade hits its original profit target. What do you do?",
    options: [
      { id: "hold_for_more", label: "Hold for more — remove the target and let it run" },
      { id: "move_stop_to_be", label: "Move my stop to breakeven and keep holding" },
      { id: "close_all", label: "Close the entire position at target" },
      { id: "partial_trail", label: "Book partial profit, trail a stop on the rest" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
  {
    id: "q8",
    block: "discipline",
    question: "Price gaps straight through your stop-loss. What do you do?",
    options: [
      { id: "hold_and_hope", label: "Hold and hope it recovers" },
      { id: "average_down", label: "Average down to lower my entry price" },
      { id: "widen_stop", label: "Widen my stop to give it more room" },
      { id: "exit", label: "Exit at the next available price — no exceptions" },
      { id: "not_sure", label: "Not sure" },
    ],
  },
];

export const ONBOARDING_QUESTION_IDS = ONBOARDING_QUESTIONS.map((q) => q.id);
