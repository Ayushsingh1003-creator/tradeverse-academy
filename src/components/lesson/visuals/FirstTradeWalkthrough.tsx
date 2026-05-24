"use client";

import { useState } from "react";

const STEPS = [
  {
    title: "1. Pick a setup",
    body: "You spot a clean uptrend on Reliance daily chart with a healthy pullback. Plan: long on bounce.",
  },
  {
    title: "2. Define risk first",
    body: "You decide max risk = 1% of ₹50,000 account = ₹500. Stop loss 2 points below entry → Position size = 500 / 2 = 250 shares (capped by capital). Round down.",
  },
  {
    title: "3. Place the order",
    body: "Use a LIMIT BUY at ₹1,250 — you want this exact price. Set SL at ₹1,240 and Target at ₹1,275 (1:2.5 R:R).",
  },
  {
    title: "4. Wait, don't tinker",
    body: "Order fills at ₹1,250. Don't move the SL closer. Don't add more shares. Let the plan play out.",
  },
  {
    title: "5. One of three outcomes",
    body: "Either SL hits → small loss as planned. Or target hits → planned win. Or you exit on a clear plan-based reason. No revenge re-entry.",
  },
  {
    title: "6. Journal it",
    body: "Win or lose, write down: setup, entry, SL, target, what happened, what you felt. This is how you improve.",
  },
];

export function FirstTradeWalkthrough() {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step {step + 1} of {STEPS.length}</p>
        <h3 className="mt-2 text-lg font-bold text-white">{STEPS[step]!.title}</h3>
        <p className="mt-2 text-sm text-text-muted">{STEPS[step]!.body}</p>
      </div>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-2xl border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Prev
        </button>
        <button
          type="button"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          className="rounded-2xl bg-accent px-5 py-2 text-sm font-semibold text-slate-900 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
      <div className="flex justify-center gap-1.5">
        {STEPS.map((_, i) => (
          <span key={i} className={`h-1.5 w-6 rounded-full ${i <= step ? "bg-accent" : "bg-border"}`} />
        ))}
      </div>
    </div>
  );
}
