"use client";

import { AppNav } from "@/components/layout/AppNav";

export function ReferClient({ referralCode, referralLink }: { referralCode: string; referralLink: string }) {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm text-text-muted">Your referral code</p>
          <p className="mt-1 text-2xl font-bold text-accent">{referralCode}</p>
          <p className="mt-2 break-all text-sm text-text-muted">{referralLink}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => navigator.clipboard.writeText(referralLink)} className="rounded-2xl bg-accent px-4 py-2 font-semibold text-slate-900">
              Copy link
            </button>
            <a className="rounded-2xl border border-border px-4 py-2" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(referralLink)}`}>
              Twitter
            </a>
            <a className="rounded-2xl border border-border px-4 py-2" href={`https://wa.me/?text=${encodeURIComponent(referralLink)}`}>
              WhatsApp
            </a>
            <a
              className="rounded-2xl border border-border px-4 py-2"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`}
            >
              LinkedIn
            </a>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Friends invited</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Rewards earned</p>
            <p className="text-2xl font-bold">0 XP</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-text-muted">Premium bonus</p>
            <p className="text-2xl font-bold">0 months</p>
          </div>
        </div>
      </section>
    </main>
  );
}
