/**
 * Reconcile client localStorage streak with server `/api/user/me` streak fields.
 * Uses lexicographic order on YYYY-MM-DD (valid for ISO calendar strings).
 */
export function mergeServerClientStreakState(
  clientStreak: number,
  clientLastActiveDate: string | null,
  serverStreak: number,
  serverStreakLocalDate: string | null,
): { streak: number; lastActiveDate: string | null } {
  if (!serverStreakLocalDate && !clientLastActiveDate) {
    return { streak: clientStreak, lastActiveDate: clientLastActiveDate };
  }
  if (!serverStreakLocalDate) {
    return { streak: clientStreak, lastActiveDate: clientLastActiveDate };
  }
  if (!clientLastActiveDate) {
    return { streak: serverStreak, lastActiveDate: serverStreakLocalDate };
  }
  if (serverStreakLocalDate > clientLastActiveDate) {
    return { streak: serverStreak, lastActiveDate: serverStreakLocalDate };
  }
  if (clientLastActiveDate > serverStreakLocalDate) {
    return { streak: clientStreak, lastActiveDate: clientLastActiveDate };
  }
  return {
    streak: Math.max(clientStreak, serverStreak),
    lastActiveDate: clientLastActiveDate,
  };
}
