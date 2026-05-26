"use client";

import { useState } from "react";

const REASONS = [
  { id: "nosl", label: "No stop loss", weight: 30 },
  { id: "size", label: "Oversized positions", weight: 25 },
  { id: "tips", label: "Chasing tips", weight: 20 },
  { id: "emo", label: "Emotional / revenge trading", weight: 15 },
  { id: "no-edge", label: "No defined edge", weight: 10 },
];

export function LoseStatsVisual() {
  const [active, setActive] = useState(REASONS[0]!.id);
  const current = REASONS.find((r) => r.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">SEBI Study — Sep 2024 (FY22–FY24)</p>
        <p className="mt-1 text-3xl font-extrabold text-amber-300">93%</p>
        <p className="mt-1 text-xs text-amber-200">of individual F&O traders incurred losses over three fiscal years.</p>
        <p className="mt-1 text-[10px] text-amber-200/70">Total aggregate losses exceeded ₹1.8 lakh crore.</p>
      </div>

      <div className="space-y-2">
        {REASONS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
              active === r.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface2 text-text-primary"
            }`}
          >
            <span>{r.label}</span>
            <span className="text-xs text-text-muted">{r.weight}%</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-text-muted">
        <span className="font-semibold text-white">{current.label}</span> — one of the most common patterns we&apos;ll fix in this course.
      </div>
    </div>
  );
}
