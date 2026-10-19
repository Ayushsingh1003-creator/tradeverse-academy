"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { leagueDisplayName } from "@/lib/league/tiers";
import type { LeaderboardResult, LeaderboardTab } from "@/lib/leaderboard/types";

const TABS: { id: Extract<LeaderboardTab, "weekly" | "all-time">; label: string }[] = [
  { id: "all-time", label: "All time" },
  { id: "weekly", label: "This week" },
];

export function SideLeaderboardCard() {
  const { user, isLoading } = useAuthSession();
  const isSignedIn = Boolean(user?.id);
  const [tab, setTab] = useState<"weekly" | "all-time">("all-time");
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthConfigured() || isLoading || !isSignedIn) {
      setData(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setData(null);
    setError(null);
    void fetch(`/api/leaderboard?tab=${tab}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Sign in required" : "Failed to load");
        return r.json() as Promise<LeaderboardResult>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load standings");
      });
    return () => {
      cancelled = true;
    };
  }, [isLoading, isSignedIn, tab]);

  const rows = data?.rows.slice(0, 6) ?? [];
  const topXp = rows[0]?.xp ?? 0;
  const me = data?.rows.find((r) => r.isMe) ?? null;
  const aheadOfMe = me ? data?.rows.find((r) => r.rank === me.rank - 1) ?? null : null;
  const league = me ? leagueDisplayName(me.league) : null;

  return (
    <div className="tvd-card">
      <h5 className="tvd-cardh">
        Leaderboard
        <Link href={`/leaderboard?tab=${tab}`} className="tvd-lk">
          View all
        </Link>
      </h5>

      <div className="tvd-lbtabs" role="tablist" aria-label="Leaderboard range">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="tvd-lbmeta">
        <span>{league ? `${league} league` : "Global standings"}</span>
        <span>{tab === "weekly" ? data?.season?.label ?? "This week" : "Since launch"}</span>
      </div>

      {!isAuthConfigured() || (!isSignedIn && !isLoading) ? (
        <p className="tvd-lbmsg">Sign in to see where you land on the board.</p>
      ) : error ? (
        <p className="tvd-lbmsg">{error}</p>
      ) : !data ? (
        <p className="tvd-lbmsg">Loading standings…</p>
      ) : rows.length === 0 ? (
        <p className="tvd-lbmsg">No players yet. Earn XP to appear on the board.</p>
      ) : (
        <>
          <div>
            {rows.map((row) => (
              <div
                key={row.userId}
                className="tvd-lgrow"
                data-me={row.isMe ? "" : undefined}
                data-m1={row.rank === 1 ? "" : undefined}
              >
                <span className="tvd-rk" data-m={row.rank <= 3 ? row.rank : undefined}>
                  {row.rank}
                </span>
                <span className="tvd-av">
                  {row.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.avatar} alt="" />
                  ) : (
                    (row.name.trim().charAt(0).toUpperCase() || "?")
                  )}
                </span>
                <span className="tvd-who">
                  <span>{row.isMe ? "You" : row.name}</span>
                  <span className="tvd-xpbar">
                    <i style={{ width: `${topXp ? Math.round((row.xp / topXp) * 100) : 0}%` }} />
                  </span>
                </span>
                <em>{row.xp.toLocaleString("en-IN")}</em>
              </div>
            ))}
          </div>

          <div className="tvd-lbyou">
            <span>Your position</span>
            <b>{data.myRank ? `#${data.myRank}` : "—"}</b>
            <span className="tvd-gap">
              {aheadOfMe && me
                ? `${(aheadOfMe.xp - me.xp).toLocaleString("en-IN")} XP to #${aheadOfMe.rank}`
                : `${data.myXp.toLocaleString("en-IN")} XP`}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
