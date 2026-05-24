/** Returns today's date as "YYYY-MM-DD" in LOCAL time (not UTC) */
export function todayLocalISO(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns yesterday's date as "YYYY-MM-DD" in local time */
export function yesterdayLocalISO(now = new Date()): string {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return todayLocalISO(yesterday);
}

/**
 * Given a lastActiveDate and today's date, returns the new streak value.
 * - Same day as today → no change (already counted, return currentStreak)
 * - Yesterday → increment by 1
 * - null (never practiced) → 1
 * - More than 1 day ago → streak BROKEN, reset to 1
 */
export function computeNewStreak(
  lastActiveDate: string | null,
  today: string,
  currentStreak: number,
): { newStreak: number; changed: boolean; broken: boolean } {
  if (!lastActiveDate) {
    return { newStreak: 1, changed: true, broken: false };
  }
  if (lastActiveDate === today) {
    return { newStreak: currentStreak, changed: false, broken: false };
  }
  const noon = new Date(`${today}T12:00:00`);
  const yesterday = yesterdayLocalISO(noon);
  if (lastActiveDate === yesterday) {
    return { newStreak: currentStreak + 1, changed: true, broken: false };
  }
  return { newStreak: 1, changed: true, broken: true };
}

export function streakXpReward(newStreak: number): {
  base: number;
  bonus: number;
  total: number;
  milestone: string | null;
} {
  const base = 10;
  const milestones: [number, number, string][] = [
    [365, 500, "🏆 One Year Streak!"],
    [100, 200, "💎 100-Day Streak!"],
    [30, 100, "🔥 30-Day Streak!"],
    [14, 50, "⚡ 14-Day Streak!"],
    [7, 30, "🎯 7-Day Streak!"],
    [3, 15, "✨ 3-Day Streak!"],
  ];
  for (const [days, bonus, label] of milestones) {
    if (newStreak === days) {
      return { base, bonus, total: base + bonus, milestone: label };
    }
  }
  return { base, bonus: 0, total: base, milestone: null };
}

/** Earn a freeze at these streak lengths (max 2 freezes held). */
export const STREAK_FREEZE_MILESTONES = [7, 30, 100] as const;

export function shouldEarnStreakFreeze(newStreak: number, currentFreezeCount: number): boolean {
  return STREAK_FREEZE_MILESTONES.some((d) => d === newStreak) && currentFreezeCount < 2;
}

export function weekActivityMap(streakHistory: string[], today = new Date()): boolean[] {
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const iso = todayLocalISO(day);
    return streakHistory.includes(iso);
  });
}

export function isStreakAtRisk(lastActiveDate: string | null, now = new Date()): boolean {
  const today = todayLocalISO(now);
  return lastActiveDate !== today && now.getHours() >= 12;
}

/** True if last activity was not today and not yesterday (missed at least one full calendar gap). */
export function isStreakBroken(lastActiveDate: string | null, now = new Date()): boolean {
  if (!lastActiveDate) return false;
  const today = todayLocalISO(now);
  const yesterday = yesterdayLocalISO(now);
  return lastActiveDate !== today && lastActiveDate !== yesterday;
}
