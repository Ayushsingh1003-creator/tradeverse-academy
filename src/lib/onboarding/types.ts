export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8";

export type AssessmentAnswers = Partial<Record<QuestionId, string>>;

export type FieldScores = {
  experience: number;
  trackRecord: number;
  knowledge: number;
  discipline: number;
};

export type StageKey =
  | "newcomer"
  | "cautious_beginner"
  | "disciplined_rookie"
  | "reckless_learner"
  | "developing_trader"
  | "steady_grinder"
  | "knowledgeable_loser"
  | "almost_there"
  | "skilled_disciplined";

export type Stage = {
  key: StageKey;
  label: string;
  remark: string;
};

export type AssessmentResult = {
  fields: FieldScores;
  fieldMax: FieldScores;
  composite: number;
  stage: Stage;
  notes: string[];
  /** UI-facing aliases kept for the onboarding screen and stored profile fields. */
  personaTitle: string;
  personaMessage: string;
  moduleTrack: string;
};
