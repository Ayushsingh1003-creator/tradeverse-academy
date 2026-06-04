"use client";

import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ONBOARDING_URL } from "@/lib/onboarding/constants";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { useUserStore } from "@/lib/store";

/** Loads per-account local progress and syncs server XP / streak on sign-in. */
export function AuthSessionHydration() {
  const { user, isLoading } = useAuthSession();
  const pathname = usePathname();
  const router = useRouter();
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

    if (!nextId) {
      if (pathname === ONBOARDING_URL || pathname.startsWith(`${ONBOARDING_URL}/`)) {
        router.replace(AUTH_SIGN_IN_URL);
      }
      return;
    }

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
          onboardingCompleted?: boolean;
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
            { replace: true },
          );
          if (
            data.onboardingCompleted === false &&
            pathname !== ONBOARDING_URL &&
            !pathname.startsWith("/admin") &&
            !pathname.startsWith("/sign-in") &&
            !pathname.startsWith("/sign-up") &&
            !pathname.startsWith("/auth/")
          ) {
            router.replace(ONBOARDING_URL);
          }
        },
      );

    return () => {
      cancelled = true;
    };
  }, [isLoading, userId, switchUserStore, applyServerProfile, pathname, router]);

  return null;
}
