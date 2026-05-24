"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import CourseCardStack from "@/components/dashboard/CourseCardStack";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { isStreakAtRisk, todayLocalISO, weekActivityMap } from "@/lib/streak";
import { useUserStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { LeagueSymbol } from "@/components/league/LeagueSymbol";

const ROW_PALETTE = ["#EF4444", "#9D62FF", "#456DFF", "#F59E0B", "#22C55E", "#EC4899"];

function rowColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 360;
  return ROW_PALETTE[h % ROW_PALETTE.length];
}

/** Only mount when `ClerkProvider` is present (same gate as root `layout.tsx`). */
function WelcomeDisplayName() {
  const { user } = useUser();
  return <>{user?.firstName || "Trader"}</>;
}

function WelcomeSection() {
  const [query, setQuery] = useState("");
  const greetings = ["Good morning", "Good afternoon", "Good evening"] as const;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">
        {greeting}, {isClerkConfigured() ? <WelcomeDisplayName /> : "Trader"} 👋
      </h1>
      <div className="flex max-w-[480px] items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 transition-colors focus-within:border-[rgba(69,109,255,0.5)]">
        <span className="text-[15px] text-[#666]">🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to learn?"
          className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-white outline-none placeholder:text-[#666]"
        />
        <button type="button" className="cursor-pointer rounded-full border-0 bg-[rgba(255,255,255,0.12)] px-3.5 py-1 text-[13px] font-semibold text-white">
          Ask
        </button>
      </div>
    </div>
  );
}

function StreakCard() {
  const streak = useUserStore((s) => s.streak);
  const lastActiveDate = useUserStore((s) => s.lastActiveDate);
  const streakHistory = useUserStore((s) => s.streakHistory);
  const streakFreezeCount = useUserStore((s) => s.streakFreezeCount);

  const today = todayLocalISO();
  const practicedToday = lastActiveDate === today;
  const atRisk = isStreakAtRisk(lastActiveDate);
  const weekActivity = weekActivityMap(streakHistory);
  const days = ["M", "T", "W", "T", "F", "S", "S"] as const;

  const todayDayOfWeek = new Date().getDay();
  const todayIdx = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

  return (
    <div
      id="streak"
      className="scroll-mt-24 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1E1E1E] p-5"
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[52px] font-black leading-none text-white">{streak}</span>
          <span className="mt-2 text-2xl">⚡</span>
        </div>
        <div className="text-right" title="Streak freezes protect your count if you miss a day">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#666]">
            Freezes {streakFreezeCount}/2
          </p>
          <div className="flex items-center justify-end gap-1.5" role="list" aria-label={`${streakFreezeCount} of 2 streak freezes`}>
            {[0, 1].map((i) => {
              const filled = i < streakFreezeCount;
              return (
                <div
                  key={i}
                  role="listitem"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                    filled
                      ? "bg-[#456DFF] text-white shadow-[0_0_10px_rgba(69,109,255,0.35)]"
                      : "border border-dashed border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.02)] text-[#444]"
                  }`}
                  aria-label={filled ? "Freeze available — used automatically if you miss a day" : "Empty freeze slot — earn at 7, 30, or 100 day streak"}
                >
                  {filled ? "🛡️" : "—"}
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 max-w-[168px] text-[10px] leading-snug text-[#555]">
            {streakFreezeCount > 0
              ? "Not a button — auto-applied when you miss a day."
              : "Earn freezes at 7, 30 & 100 day streaks (max 2)."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {days.map((day, i) => {
          const isActive = weekActivity[i];
          const isToday = i === todayIdx;
          const isFuture = i > todayIdx;

          return (
            <div key={`${day}-${i}`} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-[#456DFF] to-[#6B8FFF] shadow-[0_0_12px_rgba(69,109,255,0.45)]"
                    : isToday
                      ? "border-[1.5px] border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.06)]"
                      : "border-[1.5px] border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                } ${isFuture ? "opacity-50" : ""}`}
              >
                <span
                  className="text-base"
                  style={{ filter: isActive ? "none" : "grayscale(1) opacity(0.3)" }}
                >
                  ⚡
                </span>
              </div>
              <span className={`text-[11px] ${isToday ? "font-bold text-white" : "text-[#555]"}`}>{day}</span>
            </div>
          );
        })}
      </div>

      {practicedToday ? (
        <div className="mt-3.5 rounded-[10px] border border-[rgba(69,109,255,0.20)] bg-[rgba(69,109,255,0.08)] px-3 py-2 text-[13px] font-medium text-[#88C9F7]">
          ✓ Streak secured today! Come back tomorrow.
        </div>
      ) : atRisk ? (
        <Link
          href="/courses"
          className="mt-3.5 block animate-pulse rounded-[10px] border border-[rgba(247,195,37,0.25)] bg-[rgba(247,195,37,0.08)] px-3 py-2.5 text-[13px] font-medium text-[#F7C325] no-underline transition hover:bg-[rgba(247,195,37,0.14)]"
        >
          {streak > 0
            ? `⚡ Complete a lesson to keep your ${streak}-day streak going!`
            : "⚡ Complete a lesson to start your streak today!"}
        </Link>
      ) : (
        <div className="mt-3.5 rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[13px] text-[#555]">
          Practice today to start building your streak.
        </div>
      )}
    </div>
  );
}

type LeagueStandingsRow = {
  rank: number;
  name: string;
  avatar: string | null;
  periodXp: number;
  isMe: boolean;
};

type LeagueStandingsPayload = {
  /** Tier id for badge symbol (bronze, silver, …). */
  league: string;
  leagueLabel: string;
  leagueColor: string;
  daysLeft: number;
  roundEndedPending: boolean;
  rows: LeagueStandingsRow[];
  myRank: number | null;
  myPeriodXp: number;
};

function LeagueCardClerk() {
  const { isSignedIn, isLoaded } = useAuth();
  const [data, setData] = useState<LeagueStandingsPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isClerkConfigured() || !isLoaded || !isSignedIn) {
      setData(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    void fetch("/api/league/standings", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Sign in required" : "Failed to load");
        return r.json() as Promise<LeagueStandingsPayload>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setErr(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setErr("Could not load standings");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn]);

  const tierColor = data?.leagueColor ?? "#CD7F32";
  const tierId = data?.league ?? "bronze";
  const label = data?.leagueLabel ?? "BRONZE";
  const daysLeft = data?.roundEndedPending ? 0 : Math.max(1, data?.daysLeft ?? 1);
  const sub =
    data?.roundEndedPending === true
      ? "Round ended — finalizing soon"
      : `Top 10 advance · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1E1E1E] p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            style={{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}88)` }}
          >
            <LeagueSymbol leagueId={tierId} size={22} title={`${label} league`} />
          </div>
          <div>
            <div className="text-[13px] font-bold tracking-wide text-white">{label} LEAGUE</div>
            <div className="mt-px text-[11px] text-[#666]">{sub}</div>
          </div>
        </div>
        <Link
          href="/leaderboard"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] text-xs text-[#999] no-underline transition-colors hover:bg-[rgba(255,255,255,0.1)]"
        >
          ↗
        </Link>
      </div>

      {!isClerkConfigured() || !isSignedIn ? (
        <p className="text-[13px] text-[#666]">Sign in to see your league and period XP standings.</p>
      ) : err ? (
        <p className="text-[13px] text-[#888]">{err}</p>
      ) : !data ? (
        <p className="text-[13px] text-[#666]">Loading standings…</p>
      ) : data.rows.length === 0 ? (
        <p className="text-[13px] text-[#666]">No players in this league yet. Earn XP to appear on the board.</p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {data.rows.map((person) => {
            const letter = person.name.trim().charAt(0).toUpperCase() || "?";
            const bg = rowColor(person.name);
            return (
              <div
                key={`${person.rank}-${person.name}`}
                className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors ${
                  person.isMe ? "border border-[rgba(69,109,255,0.30)] bg-[rgba(69,109,255,0.18)]" : "border border-transparent"
                }`}
              >
                <span className={`w-4 text-[13px] font-semibold ${person.isMe ? "text-[#88C9F7]" : "text-[#666]"}`}>
                  {person.rank}
                </span>
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white" style={{ background: bg }}>
                  {person.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={person.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    letter
                  )}
                </div>
                <span className={`min-w-0 flex-1 truncate text-sm ${person.isMe ? "font-bold text-white" : "text-[#aaa]"}`}>
                  {person.isMe ? "You" : person.name}
                </span>
                <span className={`text-[13px] font-semibold ${person.isMe ? "text-[#F7C325]" : "text-[#555]"}`}>
                  {person.periodXp} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LeagueCard() {
  if (!isClerkConfigured()) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1E1E1E] p-4">
        <p className="text-[13px] text-[#666]">Sign in (with Clerk enabled) to see competitive leagues and period standings.</p>
      </div>
    );
  }
  return <LeagueCardClerk />;
}

function DailyChallengeCard() {
  const addXp = useUserStore((s) => s.addXp);
  const markDailyChallengeDone = useUserStore((s) => s.markDailyChallengeDone);
  const recordDailyChallengeAnswer = useUserStore((s) => s.recordDailyChallengeAnswer);
  const dailyChallengeAnsweredDate = useUserStore((s) => s.dailyChallengeAnsweredDate);
  const dailyChallengeSelected = useUserStore((s) => s.dailyChallengeSelected);
  const dailyChallengeDoneDate = useUserStore((s) => s.dailyChallengeDoneDate);
  const hydrated = useUserStore((s) => s.hydrated);
  const { isSignedIn, isLoaded } = useAuth();
  const { push } = useToast();
  const today = todayLocalISO();

  const answered =
    hydrated && dailyChallengeAnsweredDate === today && dailyChallengeSelected != null;
  const selected = answered ? dailyChallengeSelected! : null;
  const earnedXpToday = dailyChallengeDoneDate === today;

  useEffect(() => {
    if (!hydrated || !isClerkConfigured() || !isLoaded || !isSignedIn) return;
    if (dailyChallengeAnsweredDate === today) return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/api/user/me?localDate=${encodeURIComponent(today)}`;
    void fetch(url, { headers: tz ? { "x-tv-timezone": tz } : undefined })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { dailyChallengeCompletedToday?: boolean } | null) => {
        if (!data?.dailyChallengeCompletedToday) return;
        recordDailyChallengeAnswer(1);
      });
  }, [
    hydrated,
    isLoaded,
    isSignedIn,
    today,
    dailyChallengeAnsweredDate,
    recordDailyChallengeAnswer,
  ]);

  const handlePick = (i: number) => {
    if (answered) return;
    recordDailyChallengeAnswer(i);
    if (i !== 1) return;
    if (earnedXpToday) return;
    addXp(30, {
      reason: "daily_challenge",
      idempotencyKey: `daily:${today}`,
    });
    const streakResult = markDailyChallengeDone();
    if (streakResult.incremented && !streakResult.broken) {
      if (streakResult.milestone) {
        push(`${streakResult.milestone} +${streakResult.xpAwarded} XP`, "xp");
      } else {
        push(`🔥 Day ${streakResult.streak} streak! +${streakResult.xpAwarded} XP`, "success");
      }
    }
    if (streakResult.broken) {
      push("📅 Streak reset — but you're back! Day 1.", "info");
    }
    if (streakResult.freezeEarned) {
      push("🛡️ Streak freeze earned! (max 2)", "success");
    }
  };

  return (
    <div className="rounded-2xl border border-[rgba(247,195,37,0.20)] bg-[#1E1E1E] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <div>
          <div className="text-[13px] font-bold text-white">Daily Challenge</div>
          <div className="text-[11px] text-[#F7C325]">+30 XP · Resets at midnight</div>
        </div>
      </div>
      <p className="mb-3 text-[13px] leading-relaxed text-[#ccc]">
        A stock opens at $100, hits $115, drops to $97, closes at $108. What color is this candle?
      </p>
      {!answered ? (
        <div className="flex flex-col gap-1.5">
          {["Red — closed below open", "Green — closed above open", "Doji — same open/close", "Gray — volatile session"].map((opt, i) => (
            <button key={opt} type="button" onClick={() => handlePick(i)} className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-left text-xs text-[#ccc] transition-all hover:border-[rgba(69,109,255,0.4)] hover:bg-[rgba(69,109,255,0.08)]">
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div className={`rounded-[10px] px-3 py-2.5 text-xs ${selected === 1 ? "border border-[rgba(69,109,255,0.3)] bg-[rgba(69,109,255,0.12)] text-[#88C9F7]" : "border border-[rgba(255,93,93,0.3)] bg-[rgba(255,93,93,0.12)] text-[#FF5D5D]"}`}>
          {selected === 1 ? "✓ Correct! +30 XP — Green candle: Close ($108) > Open ($100)" : "✗ Green! Close ($108) > Open ($100) = bullish candle"}
        </div>
      )}
    </div>
  );
}

export function BrilliantDashboard() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[1100px] px-5 py-8 text-white">
      <WelcomeSection />

      <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <StreakCard />
          <LeagueCard />
          <DailyChallengeCard />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <CourseCardStack />
        </div>
      </div>
    </div>
  );
}
