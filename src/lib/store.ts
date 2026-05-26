"use client";

import { create } from "zustand";
import {
  computeNewStreak,
  isStreakBroken,
  shouldEarnStreakFreeze,
  streakXpReward,
  todayLocalISO,
  yesterdayLocalISO,
} from "@/lib/streak";
import { applyXp, getLevelFromTotalXp } from "@/lib/xp";
import type { XpEarnReason } from "@/lib/xpEarnPolicy";
import { mergeServerClientStreakState } from "@/lib/mergeServerStreak";
import { syncXpEarn } from "@/lib/syncXpClient";
import {
  ANONYMOUS_USER_STORE_KEY,
  readPersistedUserStore,
  writePersistedUserStore,
  userStoreStorageKey,
  type PersistedUserStore,
} from "@/lib/userStoreStorage";

type CompletedLesson = {
  lessonSlug: string;
  score: number;
  xpEarned: number;
  completedAt: string;
};

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
};

export type StreakUpdateResult = {
  incremented: boolean;
  streak: number;
  xpAwarded: number;
  milestone: string | null;
  broken: boolean;
  freezeEarned: boolean;
};

export type CompleteLessonResult = {
  streak: number;
  streakIncremented: boolean;
  streakXpAwarded: number;
  milestone: string | null;
  streakBroken: boolean;
  freezeEarned: boolean;
};

type UserState = {
  hydrated: boolean;
  /** Active Clerk user id used for localStorage isolation (`null` = signed out / anonymous). */
  activeClerkUserId: string | null;
  xp: number;
  level: number;
  /** Competitive league tier id (bronze, silver, …) synced from server when signed in. */
  league: string;
  streak: number;
  lastActiveDate: string | null;
  streakHistory: string[];
  streakFreezeCount: number;
  lessonsCompleted: string[];
  lessonHistory: CompletedLesson[];
  achievements: Achievement[];
  dailyChallengeDoneDate?: string;
  /** UI state: user picked an answer today (right or wrong). */
  dailyChallengeAnsweredDate?: string;
  dailyChallengeSelected?: number;
  /** Set only when the user levels up via earned XP (not hydrate / server sync). */
  pendingLevelUp: number | null;
  clearLevelUp: () => void;
  hydrate: () => void;
  /** Load persisted progress for the signed-in Clerk account (or anonymous when signed out). */
  switchUserStore: (clerkUserId: string | null) => void;
  applyServerProfile: (
    data: {
      xp: number;
      level?: number;
      league?: string;
      streak?: number;
      streakLocalDate?: string | null;
    },
    opts?: { replace?: boolean },
  ) => void;
  addXp: (
    amount: number,
    opts?: { reason: XpEarnReason; ref?: string; idempotencyKey?: string },
  ) => { leveledUp: boolean };
  updateStreak: () => StreakUpdateResult;
  completeLesson: (payload: { lessonSlug: string; score: number; xpEarned: number }) => CompleteLessonResult;
  unlockAchievement: (id: string) => Achievement | null;
  recordDailyChallengeAnswer: (selectedIndex: number) => void;
  markDailyChallengeDone: () => StreakUpdateResult;
  addStreakFreeze: () => void;
  consumeStreakFreeze: () => boolean;
  reset: () => void;
};

let activeStorageKey: string = ANONYMOUS_USER_STORE_KEY;
let persistEnabled = true;

const baseAchievements: Achievement[] = Array.from({ length: 20 }).map((_, idx) => ({
  id: `a${idx + 1}`,
  icon: ["📈", "🧠", "🏁", "🔥", "🎯"][idx % 5],
  title: `Achievement ${idx + 1}`,
  description: `Complete milestone ${idx + 1}.`,
  earned: idx < 3,
  earnedAt: idx < 3 ? new Date().toISOString() : undefined,
}));

function storageKeyForClerkUser(clerkUserId: string | null) {
  return clerkUserId ? userStoreStorageKey(clerkUserId) : ANONYMOUS_USER_STORE_KEY;
}

function snapshotForPersist(state: UserState, clerkUserId: string | null): PersistedUserStore {
  return {
    clerkUserId: clerkUserId ?? undefined,
    xp: state.xp,
    level: state.level,
    league: state.league,
    streak: state.streak,
    lastActiveDate: state.lastActiveDate,
    streakHistory: state.streakHistory,
    streakFreezeCount: state.streakFreezeCount,
    lessonsCompleted: state.lessonsCompleted,
    lessonHistory: state.lessonHistory,
    achievements: state.achievements,
    dailyChallengeDoneDate: state.dailyChallengeDoneDate,
    dailyChallengeAnsweredDate: state.dailyChallengeAnsweredDate,
    dailyChallengeSelected: state.dailyChallengeSelected,
  };
}

function applyParsedPersisted(
  parsed: PersistedUserStore,
  clerkUserId: string | null,
): Partial<UserState> {
  if (parsed.clerkUserId && clerkUserId && parsed.clerkUserId !== clerkUserId) {
    return {};
  }
  return {
    xp: parsed.xp,
    level: parsed.level,
    league: parsed.league ?? defaultState.league,
    streak: parsed.streak,
    lastActiveDate: parsed.lastActiveDate,
    streakHistory: parsed.streakHistory ?? [],
    streakFreezeCount: parsed.streakFreezeCount ?? defaultState.streakFreezeCount,
    lessonsCompleted: parsed.lessonsCompleted ?? [],
    lessonHistory: (parsed.lessonHistory ?? []) as CompletedLesson[],
    achievements: (parsed.achievements ?? defaultState.achievements) as Achievement[],
    dailyChallengeDoneDate: parsed.dailyChallengeDoneDate,
    dailyChallengeAnsweredDate: parsed.dailyChallengeAnsweredDate,
    dailyChallengeSelected: parsed.dailyChallengeSelected,
  };
}

const defaultState = {
  hydrated: false,
  activeClerkUserId: null as string | null,
  xp: 120,
  level: 1,
  league: "bronze",
  streak: 0,
  lastActiveDate: null as string | null,
  streakHistory: [] as string[],
  streakFreezeCount: 1,
  lessonsCompleted: [] as string[],
  lessonHistory: [] as CompletedLesson[],
  achievements: baseAchievements,
  dailyChallengeDoneDate: undefined as string | undefined,
  dailyChallengeAnsweredDate: undefined as string | undefined,
  dailyChallengeSelected: undefined as number | undefined,
  pendingLevelUp: null as number | null,
};

export const useUserStore = create<UserState>((set, get) => ({
  ...defaultState,
  hydrate: () => {
    get().switchUserStore(get().activeClerkUserId);
  },
  switchUserStore: (clerkUserId) => {
    if (typeof window === "undefined") return;

    const prevKey = activeStorageKey;
    const prevClerkId = get().activeClerkUserId;
    if (persistEnabled && get().hydrated) {
      writePersistedUserStore(prevKey, snapshotForPersist(get(), prevClerkId));
    }

    activeStorageKey = storageKeyForClerkUser(clerkUserId);
    persistEnabled = false;

    const parsed = readPersistedUserStore(activeStorageKey);
    if (!parsed) {
      set({ ...defaultState, activeClerkUserId: clerkUserId, hydrated: true });
      persistEnabled = true;
      return;
    }

    const partial = applyParsedPersisted(parsed, clerkUserId);
    const legacyParsed = parsed as Partial<PersistedUserStore>;
    if (
      legacyParsed.lastActiveDate === undefined &&
      typeof legacyParsed.streak === "number" &&
      legacyParsed.streak > 0
    ) {
      partial.streak = 0;
    }
    const lastActive = partial.lastActiveDate ?? null;

    if (isStreakBroken(lastActive)) {
      const freezeCount = partial.streakFreezeCount ?? 0;
      const streakVal = partial.streak ?? 0;
      if (freezeCount > 0 && streakVal > 0) {
        set({
          ...defaultState,
          ...partial,
          activeClerkUserId: clerkUserId,
          streak: streakVal,
          streakFreezeCount: freezeCount - 1,
          lastActiveDate: yesterdayLocalISO(),
          hydrated: true,
        });
        persistEnabled = true;
        return;
      }
      set({
        ...defaultState,
        ...partial,
        activeClerkUserId: clerkUserId,
        streak: 0,
        lastActiveDate: null,
        hydrated: true,
      });
      persistEnabled = true;
      return;
    }

    set({
      ...defaultState,
      ...partial,
      activeClerkUserId: clerkUserId,
      hydrated: true,
    });
    persistEnabled = true;
  },
  applyServerProfile: (data, opts) => {
    const replace = opts?.replace ?? false;
    set((state) => {
      const nextXp = replace ? data.xp : Math.max(state.xp, data.xp);
      const { level } = getLevelFromTotalXp(nextXp);
      const streakFields =
        data.streak !== undefined || data.streakLocalDate !== undefined
          ? replace
            ? {
                streak: data.streak ?? 0,
                lastActiveDate: data.streakLocalDate ?? null,
              }
            : mergeServerClientStreakState(
                state.streak,
                state.lastActiveDate,
                data.streak ?? 0,
                data.streakLocalDate ?? null,
              )
          : null;
      return {
        xp: nextXp,
        level: data.level ?? level,
        league: data.league ?? state.league,
        ...(streakFields
          ? { streak: streakFields.streak, lastActiveDate: streakFields.lastActiveDate }
          : {}),
      };
    });
  },
  clearLevelUp: () => set({ pendingLevelUp: null }),
  addXp: (amount, opts) => {
    let leveledUp = false;
    set((state) => {
      const { xp: nextXp, level: nextLevel } = applyXp(state.xp, state.level, amount);
      leveledUp = nextLevel > state.level;
      return {
        xp: nextXp,
        level: nextLevel,
        ...(leveledUp ? { pendingLevelUp: nextLevel } : {}),
      };
    });
    if (opts?.reason) {
      const streakReasons = new Set<XpEarnReason>(["lesson", "streak", "daily_challenge"]);
      const tz =
        typeof window !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : undefined;
      void syncXpEarn({
        amount,
        reason: opts.reason,
        ref: opts.ref,
        idempotencyKey: opts.idempotencyKey,
        ...(streakReasons.has(opts.reason)
          ? { activityLocalDate: todayLocalISO(), ...(tz ? { ianaTimezone: tz } : {}) }
          : {}),
      });
    }
    return { leveledUp };
  },
  updateStreak: () => {
    const today = todayLocalISO();
    const state = get();
    const { newStreak, changed, broken } = computeNewStreak(state.lastActiveDate, today, state.streak);

    if (!changed) {
      return {
        incremented: false,
        streak: state.streak,
        xpAwarded: 0,
        milestone: null,
        broken: false,
        freezeEarned: false,
      };
    }

    const { total: xpAwarded, milestone } = streakXpReward(newStreak);
    const newHistory = Array.from(new Set([...state.streakHistory, today])).sort().slice(-90);
    const priorFreeze = state.streakFreezeCount;

    set({
      streak: newStreak,
      lastActiveDate: today,
      streakHistory: newHistory,
    });

    get().addXp(xpAwarded, {
      reason: "streak",
      idempotencyKey: `streak-reward:${today}:${newStreak}`,
    });

    let freezeEarned = false;
    if (shouldEarnStreakFreeze(newStreak, priorFreeze)) {
      get().addStreakFreeze();
      freezeEarned = true;
    }

    return {
      incremented: true,
      streak: newStreak,
      xpAwarded,
      milestone,
      broken,
      freezeEarned,
    };
  },
  completeLesson: ({ lessonSlug, score, xpEarned }) => {
    const state = get();
    if (state.lessonsCompleted.includes(lessonSlug)) {
      return {
        streak: state.streak,
        streakIncremented: false,
        streakXpAwarded: 0,
        milestone: null,
        streakBroken: false,
        freezeEarned: false,
      };
    }

    const now = new Date().toISOString();
    set({
      lessonsCompleted: [...state.lessonsCompleted, lessonSlug],
      lessonHistory: [{ lessonSlug, score, xpEarned, completedAt: now }, ...state.lessonHistory],
    });
    get().addXp(xpEarned, {
      reason: "lesson",
      ref: lessonSlug,
      idempotencyKey: `lesson:${lessonSlug}`,
    });
    const streakResult = get().updateStreak();
    return {
      streak: streakResult.streak,
      streakIncremented: streakResult.incremented,
      streakXpAwarded: streakResult.xpAwarded,
      milestone: streakResult.milestone,
      streakBroken: streakResult.broken,
      freezeEarned: streakResult.freezeEarned,
    };
  },
  unlockAchievement: (id) => {
    let unlocked: Achievement | null = null;
    set((state) => ({
      achievements: state.achievements.map((achievement) => {
        if (achievement.id !== id || achievement.earned) return achievement;
        unlocked = { ...achievement, earned: true, earnedAt: new Date().toISOString() };
        return unlocked;
      }),
    }));
    return unlocked;
  },
  recordDailyChallengeAnswer: (selectedIndex) => {
    const today = todayLocalISO();
    set({
      dailyChallengeAnsweredDate: today,
      dailyChallengeSelected: selectedIndex,
    });
  },
  markDailyChallengeDone: () => {
    const today = todayLocalISO();
    set({ dailyChallengeDoneDate: today });
    return get().updateStreak();
  },
  addStreakFreeze: () => {
    set((s) => ({ streakFreezeCount: Math.min(2, s.streakFreezeCount + 1) }));
  },
  consumeStreakFreeze: () => {
    const state = get();
    if (state.streakFreezeCount <= 0) return false;
    set({ streakFreezeCount: state.streakFreezeCount - 1 });
    return true;
  },
  reset: () => {
    const clerkUserId = get().activeClerkUserId;
    set({ ...defaultState, activeClerkUserId: clerkUserId, hydrated: true });
    if (typeof window !== "undefined") {
      writePersistedUserStore(activeStorageKey, snapshotForPersist(get(), clerkUserId));
    }
  },
}));

if (typeof window !== "undefined") {
  useUserStore.subscribe((state) => {
    if (!persistEnabled || !state.hydrated) return;
    writePersistedUserStore(activeStorageKey, snapshotForPersist(state, state.activeClerkUserId));
  });
}
