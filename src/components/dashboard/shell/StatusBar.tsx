"use client";

import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useUserStore } from "@/lib/store";

/**
 * The only things that stay out of the left rail: streak, XP, and the
 * signed-out sign in / sign up pair (replaced by the account menu once
 * signed in, so logging out stays reachable).
 */
export function StatusBar() {
  const streak = useUserStore((s) => s.streak);
  const xp = useUserStore((s) => s.xp);
  const { user, isLoading } = useAuthSession();
  const isSignedIn = Boolean(user?.id);
  const displayXp = isSignedIn ? xp : 0;

  return (
    <div className="tvd-status">
      <Link
        href="/dashboard#streak"
        className="tvd-chip"
        data-tone="flame"
        aria-label={`${streak} day streak — view details`}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("streak")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        <Flame size={16} aria-hidden />
        {streak}
      </Link>

      <Link href="/xp/history" className="tvd-chip" data-tone="bolt" aria-label="XP history">
        <Zap size={16} aria-hidden />
        {displayXp}
      </Link>

      {isLoading ? (
        <span className="inline-block h-[34px] w-[34px] animate-pulse rounded-full bg-black/10" aria-hidden />
      ) : isSignedIn ? (
        <AuthUserMenu />
      ) : (
        <Link href="/sign-in" className="tvd-signin">
          Sign In
        </Link>
      )}
    </div>
  );
}
