"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-text-muted">Please try again, or return to your dashboard.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">Retry</button>
          <Link href="/dashboard" className="rounded-2xl border border-border px-6 py-3">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
