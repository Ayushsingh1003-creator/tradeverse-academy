"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Q = { question: string; options: string[]; correctAnswer: string; explanation: string };

export function PracticeSession({ questions }: { questions: Q[] }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState("");
  const [done, setDone] = useState(false);
  const q = questions[index];
  const progress = useMemo(() => `${index + 1} / ${questions.length}`, [index, questions.length]);

  if (done) {
    return (
      <Card className="mx-auto mt-10 max-w-xl">
        <h2 className="text-2xl font-bold">Practice Complete</h2>
        <p className="mt-2">Score: {score} / {questions.length}</p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <p className="text-sm text-text-muted">Question {progress}</p>
      <h2 className="mt-2 text-lg font-semibold">{q.question}</h2>
      <div className="mt-4 grid gap-3">
        {q.options.map((option) => (
          <button key={option} onClick={() => setPick(option)} className={`rounded-lg border p-2 text-left ${pick === option ? "border-accent bg-accent/10" : "border-border bg-surface2"}`}>
            {option}
          </button>
        ))}
      </div>
      <Button
        className="mt-4"
        disabled={!pick}
        onClick={() => {
          if (pick === q.correctAnswer) setScore((s) => s + 1);
          setPick("");
          if (index + 1 >= questions.length) setDone(true);
          else setIndex((v) => v + 1);
        }}
      >
        Next
      </Button>
    </Card>
  );
}
