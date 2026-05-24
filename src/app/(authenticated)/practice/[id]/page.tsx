import { PracticeSession } from "@/components/practice/PracticeSession";

const questions = [
  { question: "Price closes above open. Candle is?", options: ["Bullish", "Bearish", "Neutral", "Invalid"], correctAnswer: "Bullish", explanation: "" },
  { question: "Long upper wick suggests?", options: ["Strong rejection", "No volatility", "Guaranteed uptrend", "Gap only"], correctAnswer: "Strong rejection", explanation: "" },
];

export default function PracticePage() {
  return <PracticeSession questions={questions} />;
}
