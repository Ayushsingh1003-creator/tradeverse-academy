"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/client";
import { PAGE_SHELL_CLASSES } from "@/components/layout/pageShell";
import CourseCardStack from "@/components/dashboard/CourseCardStack";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getDailyChallengeForDate, parseLocalISODate } from "@/lib/dailyChallenge";
import { isStreakAtRisk, todayLocalISO, weekActivityMap } from "@/lib/streak";
import { useUserStore } from "@/lib/store";
import { useToast } from "@/components/ui/Toast";
import { LeagueSymbol } from "@/components/league/LeagueSymbol";
import { leagueColor, leagueDisplayName } from "@/lib/league/tiers";
import { LearningAskCard } from "@/components/dashboard/LearningAskCard";
import type { LeaderboardResult } from "@/lib/leaderboard/types";

const ROW_PALETTE = ["#EF4444", "#9D62FF", "#456DFF", "#F59E0B", "#22C55E", "#EC4899"];

function rowColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 360;
  return ROW_PALETTE[h % ROW_PALETTE.length];
}

function LeagueCollapseIcon({ open }: { open: boolean }) {
  const Icon = open ? ChevronDown : ChevronLeft;
  return <Icon className="h-4 w-4 shrink-0 text-[#888]" aria-hidden />;
}

function WelcomeSection() {
  return (
    <div className="relative z-30 w-full min-w-0">
      <LearningAskCard />
    </div>
  );
}

function StreakCard() {
  const streak = useUserStore((s) => s.streak);
  const lastActiveDate = useUserStore((s) => s.lastActiveDate);
  const streakHistory = useUserStore((s) => s.streakHistory);
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
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[52px] font-black leading-none text-white">{streak}</span>
        <span className="mt-2 text-2xl">⚡</span>
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
      ) : null}
    </div>
  );
}

function LeagueCardAuth({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const isLoaded = !isPending;
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthConfigured() || !isLoaded || !isSignedIn) {
      setData(null);
      setErr(null);
      return;
    }
    let cancelled = false;
    void fetch("/api/leaderboard?tab=all-time", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Sign in required" : "Failed to load");
        return r.json() as Promise<LeaderboardResult>;
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

  const meRow = data?.rows.find((r) => r.isMe) ?? null;
  const tierId = meRow?.league ?? "bronze";
  const tierColor = leagueColor(tierId);
  const label = leagueDisplayName(tierId);
  const sub = "Global all-time XP · same as Leaderboard → All time";
  const topRows = data?.rows.filter((r) => !r.isMe).slice(0, 5) ?? [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1E1E1E] p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 border-0 bg-transparent p-0 text-left"
        >
          <div
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
            style={{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}88)` }}
          >
            <LeagueSymbol leagueId={tierId} size={22} title={`${label} league`} />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold tracking-wide text-white">LEADERBOARD</div>
            <div className="mt-px truncate text-[11px] text-[#666]">{sub}</div>
          </div>
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-label={open ? "Collapse leaderboard" : "Expand leaderboard"}
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-[rgba(255,255,255,0.06)] transition-colors hover:bg-[rgba(255,255,255,0.1)]"
        >
          <LeagueCollapseIcon open={open} />
        </button>
        <Link
          href="/leaderboard?tab=all-time"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.06)] text-xs text-[#999] no-underline transition-colors hover:bg-[rgba(255,255,255,0.1)]"
        >
          ↗
        </Link>
      </div>

      {open && (!isAuthConfigured() || !isSignedIn) ? (
        <p className="mt-3.5 text-[13px] text-[#666]">Sign in to see global all-time XP standings.</p>
      ) : open && err ? (
        <p className="mt-3.5 text-[13px] text-[#888]">{err}</p>
      ) : open && !data ? (
        <p className="mt-3.5 text-[13px] text-[#666]">Loading standings…</p>
      ) : open && data && data.rows.length === 0 ? (
        <p className="mt-3.5 text-[13px] text-[#666]">No players in this league yet. Earn XP to appear on the board.</p>
      ) : open && data ? (
        <div className="mt-3.5 flex flex-col gap-0.5">
          {meRow ? (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-[rgba(69,109,255,0.30)] bg-[rgba(69,109,255,0.18)] px-2.5 py-2 transition-colors">
              <span className="w-4 text-[13px] font-semibold text-[#88C9F7]">{meRow.rank}</span>
              <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white" style={{ background: rowColor(meRow.name) }}>
                {meRow.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={meRow.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (meRow.name.trim().charAt(0).toUpperCase() || "?")
                )}
              </div>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-white">You</span>
              <span className="text-[13px] font-semibold text-[#F7C325]">{meRow.xp} XP</span>
            </div>
          ) : null}

          {topRows.map((person) => {
            const letter = person.name.trim().charAt(0).toUpperCase() || "?";
            const bg = rowColor(person.name);
            return (
              <div
                key={`${person.rank}-${person.name}`}
                className="flex items-center gap-2.5 rounded-[10px] border border-transparent px-2.5 py-2 transition-colors"
              >
                <span className="w-4 text-[13px] font-semibold text-[#666]">
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
                <span className="min-w-0 flex-1 truncate text-sm text-[#aaa]">
                  {person.name}
                </span>
                <span className="text-[13px] font-semibold text-[#555]">
                  {person.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function LeagueCard() {
  const [open, setOpen] = useState(false);

  if (!isAuthConfigured()) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#1E1E1E] p-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
        >
          <span className="text-[13px] font-bold tracking-wide text-white">LEADERBOARD</span>
          <LeagueCollapseIcon open={open} />
        </button>
        {open ? (
          <p className="mt-3.5 text-[13px] text-[#666]">Sign in to see competitive leagues and period standings.</p>
        ) : null}
      </div>
    );
  }
  return <LeagueCardAuth open={open} onToggle={() => setOpen((v) => !v)} />;
}

function DailyChallengeCard() {
  const addXp = useUserStore((s) => s.addXp);
  const markDailyChallengeDone = useUserStore((s) => s.markDailyChallengeDone);
  const recordDailyChallengeAnswer = useUserStore((s) => s.recordDailyChallengeAnswer);
  const dailyChallengeAnsweredDate = useUserStore((s) => s.dailyChallengeAnsweredDate);
  const dailyChallengeSelected = useUserStore((s) => s.dailyChallengeSelected);
  const dailyChallengeDoneDate = useUserStore((s) => s.dailyChallengeDoneDate);
  const hydrated = useUserStore((s) => s.hydrated);
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const isLoaded = !isPending;
  const { push } = useToast();
  const today = todayLocalISO();
  const challenge = getDailyChallengeForDate(parseLocalISODate(today));

  const answered =
    hydrated && dailyChallengeAnsweredDate === today && dailyChallengeSelected != null;
  const selected = answered ? dailyChallengeSelected! : null;
  const earnedXpToday = dailyChallengeDoneDate === today;

  useEffect(() => {
    if (!hydrated || !isAuthConfigured() || !isLoaded || !isSignedIn) return;
    if (dailyChallengeAnsweredDate === today) return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const url = `/api/user/me?localDate=${encodeURIComponent(today)}`;
    void fetch(url, { headers: tz ? { "x-tv-timezone": tz } : undefined })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { dailyChallengeCompletedToday?: boolean } | null) => {
        if (!data?.dailyChallengeCompletedToday) return;
        recordDailyChallengeAnswer(challenge.correctIndex);
      });
  }, [
    challenge.correctIndex,
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
    if (i !== challenge.correctIndex) return;
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
      <p className="mb-3 text-[13px] leading-relaxed text-[#ccc]">{challenge.question}</p>
      {!answered ? (
        <div className="flex flex-col gap-1.5">
          {challenge.options.map((opt, i) => (
            <button
              key={`${challenge.dailyChallengeId}-${i}`}
              type="button"
              onClick={() => handlePick(i)}
              className="cursor-pointer rounded-lg border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] px-3 py-2 text-left text-xs text-[#ccc] transition-all hover:border-[rgba(69,109,255,0.4)] hover:bg-[rgba(69,109,255,0.08)]"
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <div
          className={`rounded-[10px] px-3 py-2.5 text-xs ${selected === challenge.correctIndex ? "border border-[rgba(69,109,255,0.3)] bg-[rgba(69,109,255,0.12)] text-[#88C9F7]" : "border border-[rgba(255,93,93,0.3)] bg-[rgba(255,93,93,0.12)] text-[#FF5D5D]"}`}
        >
          {selected === challenge.correctIndex
            ? `✓ Correct! +30 XP — ${challenge.explanation}`
            : `✗ ${challenge.explanation}`}
        </div>
      )}
    </div>
  );
}

export function BrilliantDashboard() {
  return (
    <div className={`${PAGE_SHELL_CLASSES} py-8 text-white`}>
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <div className="relative flex w-full min-w-0 flex-col gap-4 self-center overflow-visible">
          <WelcomeSection />
          <StreakCard />
          <LeagueCard />
          <DailyChallengeCard />
        </div>

        <div className="flex w-full min-w-0 flex-col gap-4 lg:pt-10">
          <CourseCardStack />
        </div>
      </div>
    </div>
  );
}
