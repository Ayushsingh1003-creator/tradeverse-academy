"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { isAuthConfigured } from "@/lib/auth/enabled";
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
    <ul className="tvd-stack" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map((row) => (
        <li key={row.id}>
          <div className="tvd-row">
            <div className="tvd-rowbody">
              <b>{formatReason(row.reason)}</b>
              <small>
                {new Date(row.createdAt).toLocaleString()}
                {row.ref ? ` · ${row.ref}` : ""}
                {row.source === "device" ? " · this device" : ""}
              </small>
            </div>
            <span className="tvd-rowxp">+{row.amount} XP</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

function XpHistoryContent() {
  const { user, isLoading } = useAuthSession();
  const isSignedIn = Boolean(user?.id);
  const isLoaded = !isLoading;
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
    if (!isAuthConfigured() || !isLoaded || !isSignedIn) {
      setServerRows([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    void load(0, false);
  }, [isLoaded, isSignedIn, load]);

  const showServer = isAuthConfigured() && isLoaded && isSignedIn;
  const displayRows = showServer && serverRows.length > 0 ? serverRows : localRows;
  const showLocalHint = showServer && serverRows.length === 0 && localRows.length > 0;
  const showEmpty = displayRows.length === 0 && !loading;

  return (
    <ThemeScope>
      <AppShell>
        <div className="tvd-pagehead" style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1>XP history</h1>
            <p>
              {showServer
                ? "Synced to your account when you earn XP while signed in."
                : "Lesson XP saved on this device. Sign in to sync across devices."}
            </p>
          </div>
          <Link href="/dashboard" className="tvd-lk">
            <ArrowLeft size={13} aria-hidden style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
            Back to dashboard
          </Link>
        </div>

        {!isAuthConfigured() ? (
          <div className="tvd-card" style={{ marginBottom: 14 }}>
            <p className="tvd-muted">Sign-in is not configured — only on-device history is shown below.</p>
          </div>
        ) : !isLoaded ? (
          <div className="tvd-card">
            <p className="tvd-empty">Loading…</p>
          </div>
        ) : !isSignedIn ? (
          <div className="tvd-card" style={{ marginBottom: 14 }}>
            <p className="tvd-muted">
              Sign in to sync XP to your account. Until then, completions on this device appear below.
            </p>
            <Link href="/sign-in" className="tvd-btn" data-tone="primary" style={{ marginTop: 14 }}>
              Sign in
            </Link>
          </div>
        ) : err ? (
          <div className="tvd-alert" style={{ marginBottom: 14 }}>
            {err}
          </div>
        ) : null}

        {showLocalHint ? (
          <div className="tvd-card" style={{ marginBottom: 14 }}>
            <p className="tvd-muted">
              No synced events yet. Showing lessons completed on this device — finish a lesson while signed in to
              back up XP to the server.
            </p>
          </div>
        ) : null}

        {loading && displayRows.length === 0 ? (
          <div className="tvd-card">
            <p className="tvd-empty">Loading history…</p>
          </div>
        ) : showEmpty ? (
          <div className="tvd-card">
            <p className="tvd-empty">No XP events yet. Complete a lesson or daily challenge to earn XP.</p>
          </div>
        ) : (
          <>
            <HistoryList rows={displayRows} />
            {showServer && hasMore ? (
              <button
                type="button"
                className="tvd-btn"
                style={{ marginTop: 16, width: "100%" }}
                disabled={loading}
                onClick={() => void load(page + 1, true)}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            ) : null}
          </>
        )}

        {showServer && serverRows.length > 0 && localRows.length > 0 ? (
          <>
            <div className="tvd-srule">
              <h2>Also on this device</h2>
              <i />
            </div>
            <HistoryList rows={localRows} />
          </>
        ) : null}
      </AppShell>
    </ThemeScope>
  );
}

export default function XpHistoryPage() {
  return <XpHistoryContent />;
}
