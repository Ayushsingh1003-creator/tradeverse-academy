import { ONBOARDING_QUESTIONS } from "./questions";
import type { AssessmentAnswers, AssessmentResult, TraderPersona } from "./types";

const Q3_CORRECT = "limit";

const POINTS: Record<string, Record<string, number>> = {
  q1: { never: 0, under_1y: 1, "1_3y": 2, "3y_plus": 3 },
  q3: { market: 0, limit: 2, stop_loss: 0, not_sure: 0 },
  q4: { "100": 0, "500": 0, "2000": 3, not_sure: 0 },
  q5: { rise: 0, flat: 0, decay: 3, not_sure: 0 },
  q6: { double: 0, skip: 1, normal: 3, half: 1 },
  q7: { exit_all: 1, hold_all: 0, partial_trail: 3, add: 0 },
  q8: { hold: 0, average_down: 0, exit: 3, hedge: 1 },
};

const PERSONA_COPY: Record<
  TraderPersona,
  { title: string; message: string; moduleTrack: string }
> = {
  newcomer: {
    title: "The Newcomer",
    message:
      "We'll start with how markets actually work — order types, charts, and your first trade walkthrough.",
    moduleTrack:
      "Market basics, order types, chart reading, first trade walkthrough, intro to risk",
  },
  knowledgeable_loser: {
    title: "The Knowledgeable Loser",
    message:
      "You know the markets. Your enemy is execution. We'll focus on position sizing, psychology, and a written trading plan.",
    moduleTrack:
      "Position sizing bootcamp, trading journal, psychology of losses, drawdown management, trading plan",
  },
  almost_there: {
    title: "The Almost-There Trader",
    message:
      "You're disciplined — time to refine a repeatable edge with strategy design, backtesting, and advanced tools.",
    moduleTrack:
      "Strategy design & backtesting, edge quantification, options strategies, portfolio hedging, performance analytics",
  },
};

function optionPoints(questionId: string, optionId: string | undefined): number {
  if (!optionId) return 0;
  return POINTS[questionId]?.[optionId] ?? 0;
}

function allNotSure(answers: AssessmentAnswers): boolean {
  const scored = ["q3", "q4", "q5", "q6", "q7", "q8"] as const;
  return scored.every((id) => answers[id] === "not_sure");
}

function matrixPersona(kScore: number, dScore: number): TraderPersona {
  const weakK = kScore <= 4;
  const weakD = dScore <= 5;
  if (weakK && weakD) return "newcomer";
  if (!weakK && weakD) return "knowledgeable_loser";
  if (weakK && !weakD) return "newcomer";
  return "almost_there";
}

export function scoreOnboardingAssessment(answers: AssessmentAnswers): AssessmentResult {
  const kScore =
    optionPoints("q3", answers.q3) +
    optionPoints("q4", answers.q4) +
    optionPoints("q5", answers.q5);
  const dScore =
    optionPoints("q6", answers.q6) +
    optionPoints("q7", answers.q7) +
    optionPoints("q8", answers.q8);

  let persona: TraderPersona = "newcomer";
  let acceleratedPace = false;

  if (allNotSure(answers)) {
    persona = "newcomer";
  } else if (answers.q1 === "never") {
    persona = "newcomer";
  } else if (answers.q3 !== Q3_CORRECT) {
    persona = "newcomer";
  } else {
    persona = matrixPersona(kScore, dScore);
    if (kScore <= 4 && dScore >= 6) {
      acceleratedPace = true;
    }
    if (answers.q2 === "profitable" && dScore <= 5) {
      persona = "knowledgeable_loser";
      acceleratedPace = false;
    }
  }

  const copy = PERSONA_COPY[persona];
  return {
    persona,
    kScore,
    dScore,
    acceleratedPace,
    personaTitle: copy.title,
    personaMessage: acceleratedPace
      ? `${copy.message} We'll move you through fundamentals at an accelerated pace.`
      : copy.message,
    moduleTrack: copy.moduleTrack,
  };
}

export function validateAssessmentAnswers(
  answers: unknown,
): { ok: true; answers: AssessmentAnswers } | { ok: false; error: string } {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return { ok: false, error: "Invalid answers payload." };
  }
  const record = answers as Record<string, unknown>;
  const normalized: AssessmentAnswers = {};

  for (const q of ONBOARDING_QUESTIONS) {
    const raw = record[q.id];
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw !== "string") {
      return { ok: false, error: `Invalid answer for ${q.id}.` };
    }
    if (!q.options.some((o) => o.id === raw)) {
      return { ok: false, error: `Unknown option for ${q.id}.` };
    }
    normalized[q.id] = raw;
  }

  if (Object.keys(normalized).length === 0) {
    return { ok: false, error: "At least one answer is required." };
  }

  return { ok: true, answers: normalized };
}
