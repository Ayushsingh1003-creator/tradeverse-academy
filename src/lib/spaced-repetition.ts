const intervals = [1, 3, 7, 14];

export function nextReviewDate(completedAt: Date, reviewIndex = 0, score?: number) {
  const index = score !== undefined && score < 70 ? 0 : Math.min(reviewIndex, intervals.length - 1);
  const date = new Date(completedAt);
  date.setDate(date.getDate() + intervals[index]);
  return date;
}
