"use client";

import { useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function TeamsOnboardPage() {
  const [step, setStep] = useState(1);
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-2xl space-y-6 px-4 py-10">
        <h1 className="text-3xl font-bold">Team onboarding</h1>
        <p className="text-sm text-text-muted">Step {step} of 4</p>
        {step === 1 ? (
          <Card>
            <label className="text-sm font-medium">Organization name</label>
            <input className="mt-2 w-full rounded-2xl border border-border bg-surface2 px-3 py-3" placeholder="Apex Prop Desk" />
            <p className="mt-4 text-sm text-text-muted">Logo + primary color — wire to upload + Stripe Connect in production.</p>
            <button type="button" className="mt-4 rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900" onClick={() => setStep(2)}>
              Continue
            </button>
          </Card>
        ) : null}
        {step === 2 ? (
          <Card>
            <p className="font-medium">Invite members</p>
            <textarea className="mt-3 w-full rounded-2xl border border-border bg-surface2 px-3 py-3" rows={4} placeholder="email@firm.com, one per line" />
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-2xl border border-border px-4 py-2" onClick={() => setStep(1)}>
                Back
              </button>
              <button type="button" className="rounded-2xl bg-accent px-6 py-2 font-semibold text-slate-900" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </Card>
        ) : null}
        {step === 3 ? (
          <Card>
            <p className="font-medium">Assign courses</p>
            <p className="mt-2 text-sm text-text-muted">Select courses from your catalog and optional due dates (UI stub).</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded-2xl border border-border px-4 py-2" onClick={() => setStep(2)}>
                Back
              </button>
              <button type="button" className="rounded-2xl bg-accent px-6 py-2 font-semibold text-slate-900" onClick={() => setStep(4)}>
                Next
              </button>
            </div>
          </Card>
        ) : null}
        {step === 4 ? (
          <Card>
            <p className="font-medium">Checkout</p>
            <p className="mt-2 text-sm text-text-muted">Per-seat Stripe Checkout ($49/seat, min 5) — connect your Stripe price IDs.</p>
            <Link href="/teams/dashboard" className="mt-4 inline-block rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">
              Go to team dashboard (demo)
            </Link>
          </Card>
        ) : null}
      </section>
    </main>
  );
}
