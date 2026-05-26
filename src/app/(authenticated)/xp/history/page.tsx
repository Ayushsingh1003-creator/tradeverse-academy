"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { useUserStore } from "@/lib/store";

type LedgerRow = {
  id: string;
  amount: number;
  reason: string;
  ref: string | null;
  createdAt: string;
  source: "server";
};

type LocalRow = {
  id: string;
  amount: number;
  reason: string;
  ref: string | null;
  createdAt: string;
  source: "device";
};

function formatReason(r: string) {
  return r.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function HistoryList({ rows }: { rows: Array<LedgerRow | LocalRow> }) {
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.id}>
          <Card className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium text-white">{formatReason(row.reason)}</p>
              <p className="text-xs text-text-muted">
                {new Date(row.createdAt).toLocaleString()}
                {row.ref ? ` · ${row.ref}` : ""}
                {row.source === "device" ? " · this device" : ""}
              </p>
            </div>
            <span className="shrink-0 text-sm font-bold text-[#F7C325]">+{row.amount} XP</span>
          </Card>
        </li>
      ))}
    </ul>
  );
}

function XpHistoryContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const hydrate = useUserStore((s) => s.hydrate);
  const lessonHistory = useUserStore((s) => s.lessonHistory);

  const [serverRows, setServerRows] = useState<LedgerRow[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const localRows = useMemo<LocalRow[]>(
    () =>
      lessonHistory.map((entry) => ({
        id: `local-${entry.lessonSlug}-${entry.completedAt}`,
        amount: entry.xpEarned,
        reason: "lesson",
        ref: entry.lessonSlug,
        createdAt: entry.completedAt,
        source: "device" as const,
      })),
    [lessonHistory],
  );

  const load = useCallback(async (nextPage: number, append: boolean) => {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/xp/history?page=${nextPage}`);
      if (r.status === 401) {
        setErr(null);
        setServerRows([]);
        setHasMore(false);
        return;
      }
      if (!r.ok) {
        setErr(r.status === 404 ? "Account not linked yet. Earn XP again while signed in." : "Could not load synced history.");
        if (!append) setServerRows([]);
        setHasMore(false);
        return;
      }
      const data = (await r.json()) as {
        rows: Omit<LedgerRow, "source">[];
        hasMore: boolean;
        page: number;
      };
      const mapped = data.rows.map((row) => ({ ...row, source: "server" as const }));
      setServerRows((prev) => (append ? [...prev, ...mapped] : mapped));
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch {
      setErr("Could not load synced history.");
      if (!append) setServerRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isClerkConfigured() || !isLoaded || !isSignedIn) {
      setServerRows([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    void load(0, false);
  }, [isLoaded, isSignedIn, load]);

  const showServer = isClerkConfigured() && isLoaded && isSignedIn;
  const displayRows = showServer && serverRows.length > 0 ? serverRows : localRows;
  const showLocalHint = showServer && serverRows.length === 0 && localRows.length > 0;
  const showEmpty = displayRows.length === 0 && !loading;

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">XP history</h1>
            <p className="mt-1 text-sm text-text-muted">
              {showServer
                ? "Synced to your account when you earn XP while signed in."
                : "Lesson XP saved on this device. Sign in to sync across devices."}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-[#88C9F7] no-underline hover:underline">
            ← Back to dashboard
          </Link>
        </div>

        {!isClerkConfigured() ? (
          <Card className="mb-4 border-[#456DFF]/30 bg-[#456DFF]/10 p-4 text-sm text-[#88C9F7]">
            Clerk is not configured — only on-device history is shown below.
          </Card>
        ) : !isLoaded ? (
          <Card className="p-6 text-sm text-text-muted">Loading…</Card>
        ) : !isSignedIn ? (
          <Card className="mb-4 p-4 text-sm text-text-muted">
            <Link href="/sign-in" className="font-medium text-[#456DFF] no-underline hover:underline">
              Sign in
            </Link>{" "}
            to sync XP to your account. Until then, completions on this device appear below.
          </Card>
        ) : err ? (
          <Card className="mb-4 p-4 text-sm text-[#fbbf24]">{err}</Card>
        ) : null}

        {showLocalHint ? (
          <Card className="mb-4 p-4 text-sm text-text-muted">
            No synced events yet. Showing lessons completed on this device — finish a lesson while signed in to
            back up XP to the server.
          </Card>
        ) : null}

        {loading && displayRows.length === 0 ? (
          <Card className="p-6 text-sm text-text-muted">Loading history…</Card>
        ) : showEmpty ? (
          <Card className="p-6 text-sm text-text-muted">
            No XP events yet. Complete a lesson or daily challenge to earn XP.
          </Card>
        ) : (
          <>
            <HistoryList rows={displayRows} />
            {showServer && hasMore ? (
              <button
                type="button"
                className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-medium text-white transition hover:bg-[rgba(255,255,255,0.06)]"
                disabled={loading}
                onClick={() => void load(page + 1, true)}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            ) : null}
          </>
        )}

        {showServer && serverRows.length > 0 && localRows.length > 0 ? (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Also on this device</h2>
            <HistoryList rows={localRows} />
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default function XpHistoryPage() {
  return <XpHistoryContent />;
}
