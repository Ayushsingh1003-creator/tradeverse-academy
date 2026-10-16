"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { Loader } from "@/components/ui/Loader";
import { LeagueSymbol } from "@/components/league/LeagueSymbol";
import { leagueDisplayName } from "@/lib/league/tiers";
import {
  parseLeaderboardTabParam,
  type LeaderboardResult,
  type LeaderboardRow,
  type LeaderboardTab,
} from "@/lib/leaderboard/types";

const TABS: { id: LeaderboardTab; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "all-time", label: "All time" },
  { id: "friends", label: "Friends" },
  { id: "country", label: "Country" },
];

function initialTabFromUrl(): LeaderboardTab {
  if (typeof window === "undefined") return "weekly";
  return parseLeaderboardTabParam(new URLSearchParams(window.location.search).get("tab"));
}

export function LeaderboardPageClient() {
  const [tab, setTab] = useState<LeaderboardTab>(initialTabFromUrl);
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (activeTab: LeaderboardTab) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leaderboard?tab=${encodeURIComponent(activeTab)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed to load (${res.status})`);
      }
      const json = (await res.json()) as LeaderboardResult;
      setData(json);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Could not load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  useEffect(() => {
    const refresh = () => void load(tab);
    window.addEventListener("focus", refresh);
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tab, load]);

  const xpLabel = tab === "weekly" ? "period XP" : "XP";
  const meRow = data?.rows.find((r) => r.isMe) ?? null;
  const otherRows = data?.rows.filter((r) => !r.isMe) ?? [];

  return (
    <ThemeScope>
      <AppShell>
        <div className="tvd-pagehead">
          <h1>Leaderboard</h1>
          <p>Compete on weekly period XP, lifetime totals, friends, and by country.</p>
        </div>

        {data?.season ? (
          <div className="tvd-chips" style={{ marginBottom: 14 }}>
            <span className="tvd-tag" data-tone="acc">
              League round · {data.season.label}
            </span>
          </div>
        ) : null}

        <div className="tvd-seg" role="tablist" aria-label="Leaderboard range">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                const url = new URL(window.location.href);
                url.searchParams.set("tab", t.id);
                window.history.replaceState(null, "", url.pathname + url.search);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {data?.country ? (
          <p className="tvd-secsub" style={{ marginTop: 14 }}>
            <Globe size={13} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
            Top traders in {data.country}
          </p>
        ) : null}

        {error ? (
          <div className="tvd-alert" style={{ marginTop: 18 }}>
            {error}
            <div style={{ marginTop: 6, fontSize: 12, fontWeight: 500 }}>
              Ensure <code>DATABASE_URL</code> points at your local DB and run <code>npm run db:setup</code>.
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-6">
            <Loader size="md" />
            <p className="tvd-secsub" style={{ margin: 0 }}>
              Loading rankings…
            </p>
          </div>
        ) : null}

        {!loading && !error && data?.message ? (
          <div className="tvd-card" style={{ marginTop: 18 }}>
            <p className="tvd-empty">{data.message}</p>
          </div>
        ) : null}

        {!loading && !error && data && data.rows.length === 0 && !data.message ? (
          <div className="tvd-card" style={{ marginTop: 18 }}>
            <p className="tvd-empty">No rankings yet. Earn XP from lessons to appear here.</p>
          </div>
        ) : null}

        {!loading && !error && data && data.rows.length > 0 ? (
          <div className="tvd-stack" style={{ marginTop: 18 }}>
            {meRow ? <LeaderRow row={meRow} xpLabel={xpLabel} isMe /> : null}

            {data.myRank != null && !meRow ? (
              <div className="tvd-row" data-me="">
                <div className="tvd-rowbody">
                  <b>Your rank: #{data.myRank}</b>
                  <small>
                    {data.myXp.toLocaleString()} {xpLabel}
                  </small>
                </div>
              </div>
            ) : null}

            {otherRows.map((row) => (
              <LeaderRow key={row.userId} row={row} xpLabel={xpLabel} />
            ))}
          </div>
        ) : null}
      </AppShell>
    </ThemeScope>
  );
}

function LeaderRow({ row, xpLabel, isMe }: { row: LeaderboardRow; xpLabel: string; isMe?: boolean }) {
  return (
    <div className="tvd-row" data-me={isMe ? "" : undefined}>
      <span className="tvd-rownum">#{row.rank}</span>
      <span className="tvd-rowav" aria-hidden>
        {row.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.avatar} alt="" />
        ) : (
          (row.name.trim().charAt(0).toUpperCase() || "?")
        )}
      </span>
      <div className="tvd-rowbody">
        <b>{isMe ? "You" : row.name}</b>
        <small>
          <LeagueSymbol leagueId={row.league} size={13} title={leagueDisplayName(row.league)} />
          {leagueDisplayName(row.league)} · Lv. {row.level}
        </small>
      </div>
      <span className="tvd-rowxp">
        {row.xp.toLocaleString()} <span>{xpLabel}</span>
      </span>
    </div>
  );
}
