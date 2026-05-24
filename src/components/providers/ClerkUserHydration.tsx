"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/lib/store";

/** Loads per-Clerk-account local progress and syncs server XP / streak on sign-in. */
export function ClerkUserHydration() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const switchUserStore = useUserStore((s) => s.switchUserStore);
  const applyServerProfile = useUserStore((s) => s.applyServerProfile);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    const nextId = isSignedIn && userId ? userId : null;
    if (lastUserIdRef.current === nextId) return;
    lastUserIdRef.current = nextId;

    switchUserStore(nextId);

    if (!nextId) return;

    const run = () =>
      fetch("/api/user/me")
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (data: {
            xp?: number;
            level?: number;
            league?: string;
            streak?: number;
            streakLocalDate?: string | null;
          } | null) => {
            if (data?.xp == null) return;
            applyServerProfile(
              {
                xp: data.xp,
                level: data.level,
                league: data.league,
                streak: data.streak,
                streakLocalDate: data.streakLocalDate,
              },
              { replace: true },
            );
          },
        );

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => void run(), { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    void run();
  }, [isLoaded, isSignedIn, userId, switchUserStore, applyServerProfile]);

  return null;
}
