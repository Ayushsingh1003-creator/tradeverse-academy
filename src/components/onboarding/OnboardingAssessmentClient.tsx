"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import type { AssessmentAnswers, AssessmentResult } from "@/lib/onboarding/types";
import { AUTH_HOME_URL } from "@/lib/auth/urls";

type Phase = "intro" | "questions" | "submitting" | "result";

export function OnboardingAssessmentClient() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const question = ONBOARDING_QUESTIONS[index];
  const progress = useMemo(
    () => `${index + 1} / ${ONBOARDING_QUESTIONS.length}`,
    [index],
  );
  const selected = question ? answers[question.id] : undefined;

  async function submitAssessment(finalAnswers: AssessmentAnswers) {
    setPhase("submitting");
    setError(null);
    const res = await fetch("/api/onboarding/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Could not save your assessment.");
      setPhase("questions");
      return;
    }
    setResult(data as AssessmentResult);
    setPhase("result");
  }

  if (phase === "intro") {
    return (
      <Card className="mx-auto max-w-xl border-white/10 bg-[#1a1a1a] p-8 text-white">
        <p className="text-sm font-medium text-[#888]">~2 minutes · 8 questions</p>
        <h1 className="mt-2 text-2xl font-bold">Find your trader profile</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#aaa]">
          A short assessment on how you trade today — not a test you can fail. Your answers shape
          which lessons and modules we surface first.
        </p>
        <Button className="mt-6 w-full" onClick={() => setPhase("questions")}>
          Start assessment
        </Button>
      </Card>
    );
  }

  if (phase === "result" && result) {
    return (
      <Card className="mx-auto max-w-xl border-white/10 bg-[#1a1a1a] p-8 text-white">
        <p className="text-sm font-medium text-accent">Your profile</p>
        <h2 className="mt-2 text-2xl font-bold">{result.personaTitle}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#aaa]">{result.personaMessage}</p>
        <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#ccc]">
          <span className="font-medium text-white">Your track: </span>
          {result.moduleTrack}
        </p>
        <Button
          className="mt-6 w-full"
          onClick={() => {
            router.push(AUTH_HOME_URL);
            router.refresh();
          }}
        >
          Go to dashboard
        </Button>
      </Card>
    );
  }

  if (!question) return null;

  return (
    <Card className="mx-auto max-w-xl border-white/10 bg-[#1a1a1a] p-8 text-white">
      <p className="text-sm text-[#888]">
        Question {progress}
        {question.block === "knowledge"
          ? " · Knowledge"
          : question.block === "discipline"
            ? " · Real-market behavior"
            : ""}
      </p>
      <h2 className="mt-3 text-lg font-semibold leading-snug">{question.question}</h2>
      <div className="mt-5 grid gap-2.5">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
            className={`rounded-xl border px-4 py-3 text-left text-[15px] transition-colors ${
              selected === option.id
                ? "border-accent bg-accent/15 text-white"
                : "border-white/10 bg-white/5 text-[#ddd] hover:border-white/20"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
      <div className="mt-6 flex gap-3">
        {index > 0 ? (
          <Button
            variant="outline"
            className="border-white/20 bg-transparent text-white hover:bg-white/10"
            disabled={phase === "submitting"}
            onClick={() => setIndex((i) => i - 1)}
          >
            Back
          </Button>
        ) : null}
        <Button
          className="flex-1"
          disabled={!selected || phase === "submitting"}
          onClick={() => {
            const nextAnswers = { ...answers, [question.id]: selected! };
            setAnswers(nextAnswers);
            if (index + 1 >= ONBOARDING_QUESTIONS.length) {
              void submitAssessment(nextAnswers);
              return;
            }
            setIndex((i) => i + 1);
          }}
        >
          {index + 1 >= ONBOARDING_QUESTIONS.length
            ? phase === "submitting"
              ? "Saving…"
              : "See my profile"
            : "Next"}
        </Button>
      </div>
    </Card>
  );
}
