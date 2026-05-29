"use client";

import { useCallback, useEffect, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { LeagueSymbol } from "@/components/league/LeagueSymbol";
import { leagueDisplayName } from "@/lib/league/tiers";
import type { LeaderboardResult, LeaderboardTab } from "@/lib/leaderboard/types";

const TABS: { id: LeaderboardTab; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "all-time", label: "All time" },
  { id: "friends", label: "Friends" },
  { id: "country", label: "Country" },
];

function rowColor(seed: string) {
  const palette = ["#EF4444", "#9D62FF", "#456DFF", "#F59E0B", "#22C55E", "#EC4899"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 360;
  return palette[h % palette.length];
}

function countryFlag(code: string | null | undefined) {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  return String.fromCodePoint(...[...upper].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function LeaderboardPageClient() {
  const [tab, setTab] = useState<LeaderboardTab>("weekly");
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

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
            <p className="mt-1 text-sm text-text-muted">
              Compete on weekly period XP, lifetime totals, friends, and by country.
            </p>
          </div>
          {data?.season ? (
            <p className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-[#88C9F7]">
              League round · {data.season.label}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-[#456DFF] text-white"
                  : "border border-border bg-[rgba(255,255,255,0.08)] text-white/80 hover:border-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {data?.country ? (
          <p className="mt-4 text-sm text-text-muted">
            {countryFlag(data.country)} Top traders in {data.country}
          </p>
        ) : null}

        {error ? (
          <Card className="mt-5 border-red-500/30 bg-red-500/10">
            <p className="text-sm text-red-200">{error}</p>
            <p className="mt-2 text-xs text-text-muted">
              Ensure <code className="text-white/80">DATABASE_URL</code> points at your local SQLite DB and run{" "}
              <code className="text-white/80">npm run db:setup</code>.
            </p>
          </Card>
        ) : null}

        {loading ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-6">
            <Loader size="md" />
            <p className="text-sm text-text-muted">Loading rankings…</p>
          </div>
        ) : null}

        {!loading && !error && data?.message ? (
          <Card className="mt-5">
            <p className="text-sm text-text-muted">{data.message}</p>
          </Card>
        ) : null}

        {!loading && !error && data && data.rows.length === 0 && !data.message ? (
          <Card className="mt-5">
            <p className="text-sm text-text-muted">No rankings yet. Earn XP from lessons to appear here.</p>
          </Card>
        ) : null}

        {!loading && !error && data && data.rows.length > 0 ? (
          <div className="mt-5 grid gap-3">
            {data.myRank != null && !data.rows.some((r) => r.isMe) ? (
              <Card className="border-[#456DFF]/40 bg-[rgba(69,109,255,0.12)]">
                <p className="text-sm text-text-muted">
                  Your rank: <span className="font-semibold text-white">#{data.myRank}</span> ·{" "}
                  <span className="text-[#F7C325]">{data.myXp.toLocaleString()} {xpLabel}</span>
                </p>
              </Card>
            ) : null}

            {data.rows.map((row) => {
              const letter = row.name.trim().charAt(0).toUpperCase() || "?";
              const bg = rowColor(row.name);
              const displayName = row.isMe ? "You" : row.name;

              return (
                <Card
                  key={row.userId}
                  className={`flex items-center gap-3 ${
                    row.isMe ? "border-[#456DFF]/40 bg-[rgba(69,109,255,0.20)]" : ""
                  }`}
                >
                  <span
                    className={`w-8 text-center text-sm font-bold ${row.isMe ? "text-[#88C9F7]" : "text-text-muted"}`}
                  >
                    #{row.rank}
                  </span>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
                    style={{ background: bg }}
                  >
                    {row.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      letter
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{displayName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-text-muted">
                      <LeagueSymbol leagueId={row.league} size={14} title={leagueDisplayName(row.league)} />
                      <span>{leagueDisplayName(row.league)}</span>
                      <span>·</span>
                      <span>Lv. {row.level}</span>
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-[#F7C325]">
                    {row.xp.toLocaleString()} <span className="text-xs font-normal text-text-muted">{xpLabel}</span>
                  </p>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
