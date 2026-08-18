export type TraderPersona = "newcomer" | "knowledgeable_loser" | "almost_there";

export type AssessmentAnswers = Record<string, string>;

export type AssessmentResult = {
  persona: TraderPersona;
  kScore: number;
  dScore: number;
  acceleratedPace: boolean;
  personaTitle: string;
  personaMessage: string;
  moduleTrack: string;
};
