type ConceptStats = { attempts: number; correct: number; avgTime: number; concept: string };

export function masteryScore(stats: ConceptStats) {
  const accuracy = stats.attempts === 0 ? 0 : stats.correct / stats.attempts;
  const speedFactor = Math.max(0.3, 1 - stats.avgTime / 120);
  return Number((accuracy * speedFactor).toFixed(2));
}

export function weakAreas(stats: ConceptStats[]) {
  return stats.filter((s) => masteryScore(s) < 0.7).sort((a, b) => masteryScore(a) - masteryScore(b));
}
