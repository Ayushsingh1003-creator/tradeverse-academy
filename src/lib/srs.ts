export interface SRSCard {
  lessonId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
}

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function updateSRS(card: SRSCard, quality: number): SRSCard {
  if (quality < 3) {
    return { ...card, repetitions: 0, interval: 1, nextReviewDate: tomorrowISO() };
  }
  const newEF = Math.max(1.3, card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const newInterval =
    card.repetitions === 0 ? 1 : card.repetitions === 1 ? 6 : Math.round(card.interval * newEF);
  return {
    ...card,
    easeFactor: newEF,
    interval: newInterval,
    repetitions: card.repetitions + 1,
    nextReviewDate: daysFromNow(newInterval),
  };
}

export function qualityFromPractice(opts: {
  correctFirstTry: boolean;
  attempts: number;
  fastSeconds?: number;
}): number {
  const { correctFirstTry, attempts, fastSeconds = 999 } = opts;
  if (!correctFirstTry && attempts >= 3) return 0;
  if (!correctFirstTry && attempts === 2) return 1;
  if (!correctFirstTry && attempts === 1) return 2;
  if (correctFirstTry && fastSeconds <= 8) return 5;
  if (correctFirstTry && fastSeconds <= 25) return 4;
  if (correctFirstTry) return 3;
  return 2;
}
