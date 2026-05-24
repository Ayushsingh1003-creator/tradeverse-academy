"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FeedbackAnimation } from "@/components/lesson/FeedbackAnimation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export function QuestionBlock({ question, onCorrect }: { question: Question; onCorrect: () => void }) {
  const [picked, setPicked] = useState<string>("");
  const [checked, setChecked] = useState(false);
  const correct = checked && picked === question.correctAnswer;

  return (
    <Card className="border-white/10 bg-[#171717]">
      <p className="mb-4 text-lg font-semibold text-white">{question.question}</p>
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const selected = picked === option;
          const showResult = checked;
          const isCorrectOption = option === question.correctAnswer;
          const isWrongPick = showResult && selected && !correct;

          return (
            <motion.button
              key={option}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={!checked ? { y: -1 } : undefined}
              whileTap={!checked ? { scale: 0.99 } : undefined}
              onClick={() => {
                if (!checked) setPicked(option);
              }}
              className={`rounded-xl border p-3.5 text-left transition-colors ${
                showResult && isCorrectOption
                  ? "border-[#456DFF]/60 bg-[#456DFF]/15 text-white"
                  : isWrongPick
                    ? "border-error bg-red-500/10 text-white"
                    : selected
                      ? "border-[#F7C325]/60 bg-[#F7C325]/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-white/90 hover:border-white/25"
              }`}
            >
              <span className="mr-2 text-xs font-bold uppercase tracking-wide text-white/35">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </motion.button>
          );
        })}
      </div>
      <Button
        className="mt-4 w-full rounded-full bg-[#456DFF] hover:bg-[#2A4AE8]"
        onClick={() => {
          setChecked(true);
          if (picked === question.correctAnswer) onCorrect();
        }}
        disabled={!picked || checked}
      >
        Check Answer
      </Button>
      {checked ? <FeedbackAnimation correct={correct} explanation={question.explanation} /> : null}
    </Card>
  );
}
