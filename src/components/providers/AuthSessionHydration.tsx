"use client";

import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/lib/store";

/** Loads per-account local progress and syncs server XP / streak on sign-in. */
export function AuthSessionHydration() {
  const { user, isLoading } = useAuthSession();
  const switchUserStore = useUserStore((s) => s.switchUserStore);
  const applyServerProfile = useUserStore((s) => s.applyServerProfile);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (isLoading) return;

    const nextId = userId;
    if (lastUserIdRef.current !== nextId) {
      lastUserIdRef.current = nextId;
      switchUserStore(nextId);
    }

    if (!nextId) return;

    let cancelled = false;
    fetch("/api/user/me")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (data: {
          xp?: number;
          level?: number;
          league?: string;
          streak?: number;
          streakLocalDate?: string | null;
          isAdmin?: boolean;
        } | null) => {
          if (cancelled || !data) return;
          applyServerProfile(
            {
              xp: data.xp ?? 0,
              level: data.level,
              league: data.league,
              streak: data.streak,
              streakLocalDate: data.streakLocalDate,
              isAdmin: Boolean(data.isAdmin),
            },
            { replace: data.xp != null },
          );
        },
      );

    return () => {
      cancelled = true;
    };
  }, [isLoading, userId, switchUserStore, applyServerProfile]);

  return null;
}
