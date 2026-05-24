import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const pickingABrokerPages: LessonPage[] = [
  {
    id: "pb-p1",
    type: "pretest",
    question: "For a beginner mostly doing delivery + occasional intraday, which broker type usually fits best?",
    options: ["Full-service broker with advisor", "Discount broker (Zerodha, Groww, Upstox)", "No broker — direct to exchange", "Foreign broker only"],
    correctIndex: 1,
    explanation: "Discount brokers offer low cost, clean apps, and enough features for most beginners.",
  },
  {
    id: "pb-p2",
    type: "text",
    title: "Discount vs Full-service",
    body: "Two broad camps in India:\n- **Discount brokers** — Zerodha, Groww, Upstox, Dhan. Low cost. DIY. Built for self-directed traders.\n- **Full-service brokers** — ICICI Direct, HDFC Securities, Motilal Oswal. Higher cost. Bundled with research, advisory, premium tools.",
  },
  {
    id: "pb-p3",
    type: "visual",
    visualId: "BrokerCompare",
    caption: "Toggle to compare features, costs, and best-fit users for each type.",
  },
  {
    id: "pb-p4",
    type: "callout",
    variant: "tip",
    title: "What to actually check",
    content:
      "Pick based on: 1) brokerage charges, 2) app stability & speed, 3) order types supported (GTT, basket, alerts), 4) customer support quality, and 5) reputation/SEBI complaints. Not based on cashback ads.",
  },
  {
    id: "pb-p5",
    type: "multiple_choice",
    question: "Typical discount broker intraday brokerage:",
    options: ["~₹500 per trade", "~₹0 per trade", "~₹20 per executed order (capped)", "10% of trade value"],
    correctIndex: 2,
    explanation: "Most discount brokers charge ~₹20 (or 0.03%) per executed order, whichever is lower.",
  },
  {
    id: "pb-p6",
    type: "true_false",
    statement: "All SEBI-registered brokers in India offer access to the same NSE/BSE.",
    correct: true,
    explanation: "True. The exchange is shared — your broker is the gateway.",
  },
  {
    id: "pb-p7",
    type: "fill_blank",
    sentence: "Equity delivery brokerage at most discount brokers in India is ₹[___].",
    correctAnswer: "0",
    explanation: "Most discount brokers charge zero for equity delivery.",
  },
  {
    id: "pb-p8",
    type: "multiple_choice",
    question: "When choosing a broker, the MOST important factor for a beginner is:",
    options: ["Free movie passes", "App reliability & low friction", "Most aggressive cashback", "Highest leverage"],
    correctIndex: 1,
    explanation: "A reliable app saves more than freebies will ever pay you.",
  },
];

export const pickingABrokerPractice: PracticeQuestion[] = [
  {
    id: "pb-pr1",
    type: "multiple_choice",
    question: "Examples of Indian discount brokers:",
    options: ["Zerodha, Groww, Upstox", "Goldman, JP Morgan", "BSE, NSE", "RBI, SEBI"],
    correctIndex: 0,
    explanation: "Indian discount brokers.",
  },
  {
    id: "pb-pr2",
    type: "true_false",
    statement: "Full-service brokers typically charge a percentage of trade value.",
    correct: true,
    explanation: "Yes — common model.",
  },
  {
    id: "pb-pr3",
    type: "fill_blank",
    sentence: "All Indian brokers are regulated by [___].",
    correctAnswer: "sebi",
    explanation: "SEBI regulates brokers.",
  },
  {
    id: "pb-pr4",
    type: "multiple_choice",
    question: "Best fit for a beginner DIY trader is usually a:",
    options: ["Discount broker", "Full-service broker", "Foreign broker", "No broker"],
    correctIndex: 0,
    explanation: "Low cost + clean app = discount broker.",
  },
  {
    id: "pb-pr5",
    type: "true_false",
    statement: "App stability matters more than cashback offers.",
    correct: true,
    explanation: "A glitching app at a critical moment costs more than any reward.",
  },
];
