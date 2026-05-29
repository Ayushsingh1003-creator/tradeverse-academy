"use client";

import { authClient } from "@/lib/auth/client";
import { useEffect, useRef } from "react";
import { useUserStore } from "@/lib/store";

/** Loads per-account local progress and syncs server XP / streak on sign-in. */
export function AuthSessionHydration() {
  const { data: session, isPending } = authClient.useSession();
  const switchUserStore = useUserStore((s) => s.switchUserStore);
  const applyServerProfile = useUserStore((s) => s.applyServerProfile);
  const lastUserIdRef = useRef<string | null | undefined>(undefined);

  const userId = session?.user?.id ?? null;
  const isSignedIn = Boolean(userId);

  useEffect(() => {
    if (isPending) return;

    const nextId = isSignedIn && userId ? userId : null;
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
  }, [isPending, isSignedIn, userId, switchUserStore, applyServerProfile]);

  return null;
}
