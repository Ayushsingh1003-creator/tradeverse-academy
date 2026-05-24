export interface ConceptScore {
  conceptId: string;
  conceptName: string;
  attempts: number;
  correctRate: number;
  avgTimeSeconds: number;
  masteryScore: number;
  trend: "improving" | "stable" | "declining";
}

export type PracticeResult = {
  conceptId?: string;
  conceptName?: string;
  correct: boolean;
  attempts?: number;
  timeSeconds?: number;
  at: string;
};

export function detectWeakAreas(practiceHistory: PracticeResult[]): ConceptScore[] {
  const byConcept = new Map<
    string,
    { name: string; correct: number; total: number; times: number[]; recent: boolean[] }
  >();

  const sorted = [...practiceHistory].sort((a, b) => a.at.localeCompare(b.at));
  for (const row of sorted) {
    const id = row.conceptId ?? "general";
    const name = row.conceptName ?? "General practice";
    const cur = byConcept.get(id) ?? { name, correct: 0, total: 0, times: [], recent: [] };
    cur.total += 1;
    if (row.correct) cur.correct += 1;
    cur.times.push(row.timeSeconds ?? 30);
    cur.recent.push(row.correct);
    byConcept.set(id, cur);
  }

  const scores: ConceptScore[] = [];
  for (const [conceptId, agg] of byConcept) {
    const correctRate = agg.total ? agg.correct / agg.total : 0;
    const avgTimeSeconds = agg.times.length ? agg.times.reduce((a, b) => a + b, 0) / agg.times.length : 0;
    const speedFactor = Math.min(1, 30 / Math.max(5, avgTimeSeconds));
    const masteryScore = correctRate * 0.75 + speedFactor * 0.25;
    const half = Math.floor(agg.recent.length / 2);
    const first = half ? agg.recent.slice(0, half).filter(Boolean).length / half : correctRate;
    const second = agg.recent.length - half ? agg.recent.slice(half).filter(Boolean).length / (agg.recent.length - half) : correctRate;
    let trend: ConceptScore["trend"] = "stable";
    if (second > first + 0.08) trend = "improving";
    else if (second < first - 0.08) trend = "declining";
    scores.push({
      conceptId,
      conceptName: agg.name,
      attempts: agg.total,
      correctRate,
      avgTimeSeconds,
      masteryScore,
      trend,
    });
  }
  return scores.sort((a, b) => a.masteryScore - b.masteryScore);
}
