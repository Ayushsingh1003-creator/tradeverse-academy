import type { LessonPage, PracticeQuestion } from "@/types/lessonPage";

export const brokerageAndTaxesIndiaPages: LessonPage[] = [
  {
    id: "bt-p1",
    type: "pretest",
    question: "Apart from brokerage, what else does every Indian equity trade incur?",
    options: ["Only GST", "STT, SEBI fee, Stamp duty, GST, plus exchange transaction charges", "Nothing — just brokerage", "Income tax on every trade"],
    correctIndex: 1,
    explanation: "Right. Each trade has multiple statutory components on top of brokerage.",
  },
  {
    id: "bt-p2",
    type: "text",
    title: "Breaking down every trade's cost",
    body: "Charges on Indian equity trades:\n- **Brokerage** — what your broker charges (₹0 delivery / ₹20 intraday at most discount brokers)\n- **STT** — Securities Transaction Tax (paid to govt)\n- **GST** — 18% on brokerage + SEBI fee\n- **SEBI fee** — tiny\n- **Stamp duty** — on buy side\n- **Capital gains tax** — at year-end (STCG 20% / LTCG 12.5% above ₹1.25L on equity)",
  },
  {
    id: "bt-p3",
    type: "visual",
    visualId: "ChargesBreakdown",
    caption: "Plug in trade value to see how charges add up — they're small but real.",
  },
  {
    id: "bt-p4",
    type: "callout",
    variant: "concept",
    title: "STCG vs LTCG (equity)",
    content:
      "Hold equity ≤ 12 months → STCG @ 20%. Hold > 12 months → LTCG @ 12.5% on gains above ₹1.25 lakh per year. (Rates as of FY 2024-25 — verify before tax filing.)",
  },
  {
    id: "bt-p5",
    type: "multiple_choice",
    question: "On a ₹50,000 INTRADAY trade with a discount broker, total charges are typically:",
    options: ["Around ₹0", "Around ₹40–₹70", "Around ₹500", "Around ₹5,000"],
    correctIndex: 1,
    explanation: "Brokerage (₹20–40) + STT + GST + small fees ≈ ₹40–70 total.",
  },
  {
    id: "bt-p6",
    type: "true_false",
    statement: "GST is charged on brokerage but not on STT.",
    correct: true,
    explanation: "True. STT is a tax — GST isn't charged on a tax.",
  },
  {
    id: "bt-p7",
    type: "fill_blank",
    sentence: "Gains on equity held over 1 year fall under [___]CG.",
    correctAnswer: "lt",
    explanation: "Long-Term Capital Gains.",
  },
  {
    id: "bt-p8",
    type: "multiple_choice",
    question: "Most cost-effective for a long-term equity investor:",
    options: ["Daily intraday flipping", "Buy-and-hold delivery", "F&O speculation", "Penny stock churning"],
    correctIndex: 1,
    explanation: "Delivery has lower frequency and qualifies for LTCG after a year.",
  },
];

export const brokerageAndTaxesIndiaPractice: PracticeQuestion[] = [
  {
    id: "bt-pr1",
    type: "multiple_choice",
    question: "STT stands for:",
    options: ["Securities Transaction Tax", "Stock Trading Tariff", "Short Term Tax", "Stamp & Trade Toll"],
    correctIndex: 0,
    explanation: "Securities Transaction Tax.",
  },
  {
    id: "bt-pr2",
    type: "true_false",
    statement: "Equity delivery often has ₹0 brokerage at discount brokers.",
    correct: true,
    explanation: "Common offer.",
  },
  {
    id: "bt-pr3",
    type: "fill_blank",
    sentence: "GST is charged at [___]% on brokerage.",
    correctAnswer: "18",
    explanation: "18% standard rate.",
  },
  {
    id: "bt-pr4",
    type: "multiple_choice",
    question: "STCG on equity (held ≤ 12 months) is taxed at:",
    options: ["0%", "10%", "20% (current rate)", "30%"],
    correctIndex: 2,
    explanation: "Updated to 20% in Budget 2024.",
  },
  {
    id: "bt-pr5",
    type: "true_false",
    statement: "Frequent intraday trading pays brokerage on every leg, eroding small wins.",
    correct: true,
    explanation: "Yes — costs compound against you.",
  },
];
