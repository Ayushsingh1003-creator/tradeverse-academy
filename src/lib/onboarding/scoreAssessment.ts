import { ONBOARDING_QUESTIONS } from "./questions";
import type { AssessmentAnswers, AssessmentResult, FieldScores, QuestionId, Stage, StageKey } from "./types";

const POINTS: Record<string, Record<string, number>> = {
  q1: { never: 0, under_1y: 1, "1_3y": 2, "3y_plus": 3 },
  q2: { havent_traded: 0, losing: 1, breakeven: 2, profitable: 3 },
  q3: { market: 0, stop: 1, stop_limit: 2, limit: 3, not_sure: 0 },
  q4: { "200": 0, "1000": 1, "2000": 3, "20000": 0, not_sure: 0 },
  q5: { delta: 0, gamma: 0, vega: 1, decay: 3, not_sure: 0 },
  q6: { double_down: 0, chase_next_setup: 0, stop_for_day: 2, normal: 3, not_sure: 0 },
  q7: { hold_for_more: 0, move_stop_to_be: 1, close_all: 2, partial_trail: 3, not_sure: 0 },
  q8: { hold_and_hope: 0, average_down: 0, widen_stop: 0, exit: 3, not_sure: 0 },
};

const FIELD_MAX: FieldScores = { experience: 3, trackRecord: 3, knowledge: 9, discipline: 9 };

const WEIGHTS = { knowledge: 0.3, discipline: 0.4, experience: 0.15, trackRecord: 0.15 };

type Tier = "low" | "mid" | "high";

function tier(pct: number): Tier {
  if (pct < 0.4) return "low";
  if (pct >= 0.75) return "high";
  return "mid";
}

const STAGE_TABLE: Record<Tier, Record<Tier, Omit<Stage, never>>> = {
  low: {
    low: {
      key: "newcomer",
      label: "Newcomer",
      remark:
        "You're just starting out — both market knowledge and trade discipline need foundational work. Start with the basics (order types, position sizing, options mechanics) and practice on paper before risking real capital.",
    },
    mid: {
      key: "cautious_beginner",
      label: "Cautious Beginner",
      remark:
        "Your risk instincts are already decent, but market knowledge is thin. Focus on core concepts — order types, sizing math, options mechanics — while keeping the careful habits you already have.",
    },
    high: {
      key: "disciplined_rookie",
      label: "Disciplined Rookie",
      remark:
        "Excellent risk instincts for where you are, but knowledge gaps could still lead to costly mistakes — misreading an order type or an instrument. You need targeted education more than discipline coaching.",
    },
  },
  mid: {
    low: {
      key: "reckless_learner",
      label: "Reckless Learner",
      remark:
        "You've picked up real market knowledge, but discipline is the weak link — impulsive decisions under pressure are the biggest risk to your account right now. Prioritize rules, checklists, and pre-committing to your plan over learning more theory.",
    },
    mid: {
      key: "developing_trader",
      label: "Developing Trader",
      remark:
        "A solid, balanced foundation in both knowledge and discipline. You're on the right track — the priority now is consistency: turning what you know into what you reliably do.",
    },
    high: {
      key: "steady_grinder",
      label: "Steady Grinder",
      remark:
        "Discipline is a real strength, and knowledge is catching up. That combination tends to survive long enough to keep improving, which matters more than most people think.",
    },
  },
  high: {
    low: {
      key: "knowledgeable_loser",
      label: "Knowledgeable Loser",
      remark:
        "You clearly know the material — the gap is between what you know and what you do under pressure (revenge trading, ignoring stops, moving the goalposts). This is the highest-leverage group to fix, precisely because the knowledge is already there.",
    },
    mid: {
      key: "almost_there",
      label: "Almost There",
      remark:
        "Strong knowledge and good — but not yet bulletproof — discipline. You're close to a consistently repeatable process; tightening a few habits (honoring stops, planning exits before you're in the trade) should be the focus.",
    },
    high: {
      key: "skilled_disciplined",
      label: "Skilled & Disciplined",
      remark:
        "Strong on both fronts. If live results don't fully reflect that yet, the gap is most likely execution or psychology under real money, or simply more live reps — not a knowledge or on-paper discipline problem.",
    },
  },
};

const MODULE_TRACKS: Record<StageKey, string> = {
  newcomer: "Market basics, order types, chart reading, first trade walkthrough, intro to risk",
  cautious_beginner:
    "Order types, position sizing math, options mechanics, chart reading, first trade walkthrough",
  disciplined_rookie:
    "Order types & instruments deep dive, options mechanics, position sizing math, risk fundamentals",
  reckless_learner: "Trading journal, pre-trade checklists, psychology of losses, rules & plan design",
  developing_trader: "Consistency systems, trading journal, strategy refinement, risk management review",
  steady_grinder: "Market knowledge deep dive, strategy design, options strategies, portfolio hedging",
  knowledgeable_loser:
    "Position sizing bootcamp, trading journal, psychology of losses, drawdown management, trading plan",
  almost_there:
    "Strategy design & backtesting, edge quantification, options strategies, portfolio hedging, performance analytics",
  skilled_disciplined:
    "Advanced strategy design, portfolio construction, live-reps coaching, performance analytics",
};

function optionPoints(questionId: string, optionId: string | undefined): number {
  if (!optionId) return 0;
  return POINTS[questionId]?.[optionId] ?? 0;
}

function computeFields(answers: AssessmentAnswers): FieldScores {
  return {
    experience: optionPoints("q1", answers.q1),
    trackRecord: optionPoints("q2", answers.q2),
    knowledge: optionPoints("q3", answers.q3) + optionPoints("q4", answers.q4) + optionPoints("q5", answers.q5),
    discipline: optionPoints("q6", answers.q6) + optionPoints("q7", answers.q7) + optionPoints("q8", answers.q8),
  };
}

function computeComposite(fields: FieldScores): number {
  return Math.round(
    100 *
      ((fields.knowledge / FIELD_MAX.knowledge) * WEIGHTS.knowledge +
        (fields.discipline / FIELD_MAX.discipline) * WEIGHTS.discipline +
        (fields.experience / FIELD_MAX.experience) * WEIGHTS.experience +
        (fields.trackRecord / FIELD_MAX.trackRecord) * WEIGHTS.trackRecord),
  );
}

function computeStage(fields: FieldScores): Stage {
  const knowledgeTier = tier(fields.knowledge / FIELD_MAX.knowledge);
  const disciplineTier = tier(fields.discipline / FIELD_MAX.discipline);
  return STAGE_TABLE[knowledgeTier][disciplineTier];
}

function computeNotes(answers: AssessmentAnswers, fields: FieldScores): string[] {
  const notes: string[] = [];
  const knowledgePct = fields.knowledge / FIELD_MAX.knowledge;
  const disciplinePct = fields.discipline / FIELD_MAX.discipline;

  if (answers.q1 === "never") {
    notes.push(
      "You haven't placed a live trade yet, so this reflects theoretical understanding rather than tested behavior — discipline questions are much easier to answer correctly on a quiz than to follow with real money on the line.",
    );
  }
  if (answers.q2 === "losing" && disciplinePct >= 0.4) {
    notes.push(
      "Your live results (currently losing) don't yet match the discipline score you tested at — worth honestly auditing whether you're actually following these answers in real trades, or whether something else (edge, execution, costs) is the bigger drag.",
    );
  }
  if (answers.q2 === "profitable" && (knowledgePct < 0.4 || disciplinePct < 0.4)) {
    notes.push(
      "You're already profitable despite the gaps this assessment found — good results so far, but don't mistake results for a robust process. A shift in market conditions could expose the gap faster than you'd expect.",
    );
  }
  return notes;
}

/** Pure and total: any subset of answers (including none) produces a valid result; never throws. */
export function assessTrader(answers: AssessmentAnswers): AssessmentResult {
  const fields = computeFields(answers);
  const composite = computeComposite(fields);
  const stage = computeStage(fields);
  const notes = computeNotes(answers, fields);

  return {
    fields,
    fieldMax: FIELD_MAX,
    composite,
    stage,
    notes,
    personaTitle: stage.label,
    personaMessage: stage.remark,
    moduleTrack: MODULE_TRACKS[stage.key],
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
    normalized[q.id as QuestionId] = raw;
  }

  if (Object.keys(normalized).length === 0) {
    return { ok: false, error: "At least one answer is required." };
  }

  return { ok: true, answers: normalized };
}
