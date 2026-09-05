"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { isStreakAtRisk, todayLocalISO, weekActivityMap } from "@/lib/streak";
import { useUserStore } from "@/lib/store";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

export function SideStreakCard() {
  const streak = useUserStore((s) => s.streak);
  const lastActiveDate = useUserStore((s) => s.lastActiveDate);
  const streakHistory = useUserStore((s) => s.streakHistory);
  const { user, isLoading } = useAuthSession();
  // A streak only means something on an account, so send signed-out users to sign in.
  const needsSignIn = isAuthConfigured() && !isLoading && !user?.id;

  const today = todayLocalISO();
  const practicedToday = lastActiveDate === today;
  const atRisk = isStreakAtRisk(lastActiveDate);
  const weekActivity = weekActivityMap(streakHistory);

  const dayOfWeek = new Date().getDay();
  const todayIdx = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return (
    <div className="tvd-card" id="streak" style={{ scrollMarginTop: 24 }}>
      <h5 className="tvd-cardh">
        Streak
        <Link href="/xp/history" className="tvd-lk">
          XP history
        </Link>
      </h5>

      <div className="tvd-streaktop">
        <span className="tvd-flamebox" aria-hidden>
          <Flame size={22} />
        </span>
        <div>
          <b>{streak}</b>
          <span>{streak === 1 ? "day" : "days"} · {practicedToday ? "secured today" : "keep it alive"}</span>
        </div>
      </div>

      <div className="tvd-week">
        {DAYS.map((day, i) => (
          <i
            key={`${day}-${i}`}
            data-today={i === todayIdx ? "" : undefined}
            data-lit={weekActivity[i] ? "" : undefined}
          >
            {day}
          </i>
        ))}
      </div>

      {practicedToday ? (
        <p className="tvd-note">Streak secured today — come back tomorrow.</p>
      ) : atRisk ? (
        <Link href={needsSignIn ? AUTH_SIGN_IN_URL : "/courses"} className="tvd-note" data-tone="warn">
          {streak > 0
            ? `Complete a lesson to keep your ${streak}-day streak going.`
            : "Complete a lesson to start your streak today."}
        </Link>
      ) : null}
    </div>
  );
}
