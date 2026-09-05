"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useToast } from "@/components/ui/Toast";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";
import { getDailyChallengeForDate, parseLocalISODate } from "@/lib/dailyChallenge";
import { todayLocalISO } from "@/lib/streak";
import { useUserStore } from "@/lib/store";

const DAILY_CHALLENGE_XP = 30;
const KEYS = ["A", "B", "C", "D", "E", "F"];

export function DailyWarmUp() {
  const addXp = useUserStore((s) => s.addXp);
  const markDailyChallengeDone = useUserStore((s) => s.markDailyChallengeDone);
  const recordDailyChallengeAnswer = useUserStore((s) => s.recordDailyChallengeAnswer);
  const dailyChallengeAnsweredDate = useUserStore((s) => s.dailyChallengeAnsweredDate);
  const dailyChallengeSelected = useUserStore((s) => s.dailyChallengeSelected);
  const dailyChallengeDoneDate = useUserStore((s) => s.dailyChallengeDoneDate);
  const hydrated = useUserStore((s) => s.hydrated);
  const { user, isLoading } = useAuthSession();
  const isSignedIn = Boolean(user?.id);
  const isLoaded = !isLoading;
  const { push } = useToast();
  const router = useRouter();
  const today = todayLocalISO();
  const challenge = getDailyChallengeForDate(parseLocalISODate(today));

  const answered = hydrated && dailyChallengeAnsweredDate === today && dailyChallengeSelected != null;
  const selected = answered ? dailyChallengeSelected! : null;
  const earnedXpToday = dailyChallengeDoneDate === today;
  const correct = selected === challenge.correctIndex;

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
    // The warm-up banks XP and a streak, so it needs an account behind it.
    if (isAuthConfigured() && !isSignedIn) {
      if (!isLoaded) return;
      router.push(AUTH_SIGN_IN_URL);
      return;
    }
    recordDailyChallengeAnswer(i);
    if (i !== challenge.correctIndex) return;
    if (earnedXpToday) return;
    addXp(DAILY_CHALLENGE_XP, { reason: "daily_challenge", idempotencyKey: `daily:${today}` });
    const streakResult = markDailyChallengeDone();
    if (streakResult.incremented && !streakResult.broken) {
      if (streakResult.milestone) {
        push(`${streakResult.milestone} +${streakResult.xpAwarded} XP`, "xp");
      } else {
        push(`Day ${streakResult.streak} streak! +${streakResult.xpAwarded} XP`, "success");
      }
    }
    if (streakResult.broken) {
      push("Streak reset — but you're back! Day 1.", "info");
    }
    if (streakResult.freezeEarned) {
      push("Streak freeze earned! (max 2)", "success");
    }
  };

  return (
    <section className="tvd-warm">
      <div className="tvd-wh">
        <span>One question · +{DAILY_CHALLENGE_XP} XP</span>
        <span className="tvd-a">Resets at midnight</span>
      </div>
      <h3>{challenge.question}</h3>
      <p className="tvd-sub">One shot a day — pick the answer you would trade on.</p>

      <div className="tvd-opts" role="group" aria-label="Choose an answer">
        {challenge.options.map((opt, i) => {
          const isRight = answered && i === challenge.correctIndex;
          const isWrong = answered && i === selected && !correct;
          return (
            <button
              key={`${challenge.dailyChallengeId}-${i}`}
              type="button"
              className="tvd-obtn"
              onClick={() => handlePick(i)}
              disabled={answered}
              data-pick={!answered && i === selected ? "" : undefined}
              data-right={isRight ? "" : undefined}
              data-wrong={isWrong ? "" : undefined}
            >
              <span className="tvd-okey" aria-hidden>
                {KEYS[i] ?? i + 1}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="tvd-fb" data-tone={correct ? "good" : "bad"}>
          <div className="tvd-fbi" aria-hidden>
            {correct ? <Check size={18} strokeWidth={3} /> : <X size={18} strokeWidth={3} />}
          </div>
          <div className="tvd-fbt">
            <b>{correct ? `Correct! +${DAILY_CHALLENGE_XP} XP` : "Not quite"}</b>
            <span>{challenge.explanation}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
