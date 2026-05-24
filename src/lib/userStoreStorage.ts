/** Legacy single-user key (pre–per-account isolation). */
export const LEGACY_USER_STORE_KEY = "tv_user_store_v2";

export const ANONYMOUS_USER_STORE_KEY = "tv_user_store_v2:anonymous";

export function userStoreStorageKey(clerkUserId: string) {
  return `tv_user_store_v2:${clerkUserId}`;
}

export type PersistedUserStore = {
  clerkUserId?: string;
  xp: number;
  level: number;
  league: string;
  streak: number;
  lastActiveDate: string | null;
  streakHistory: string[];
  streakFreezeCount: number;
  lessonsCompleted: string[];
  lessonHistory: unknown[];
  achievements: unknown[];
  dailyChallengeDoneDate?: string;
  /** Local calendar day the user submitted any daily-challenge answer. */
  dailyChallengeAnsweredDate?: string;
  dailyChallengeSelected?: number;
};

export function readPersistedUserStore(storageKey: string): PersistedUserStore | null {
  if (typeof window === "undefined") return null;
  let raw = window.localStorage.getItem(storageKey);
  if (!raw && storageKey !== LEGACY_USER_STORE_KEY) {
    const legacy = window.localStorage.getItem(LEGACY_USER_STORE_KEY);
    if (legacy) {
      window.localStorage.setItem(storageKey, legacy);
      window.localStorage.removeItem(LEGACY_USER_STORE_KEY);
      raw = legacy;
    }
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedUserStore;
  } catch {
    return null;
  }
}

export function writePersistedUserStore(storageKey: string, payload: PersistedUserStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
}
