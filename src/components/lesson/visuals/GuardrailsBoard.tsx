"use client";

import { useState } from "react";

const RULES = [
  { id: "size", label: "Max 1% risk per trade", checked: true },
  { id: "max3", label: "Max 3 trades per day", checked: true },
  { id: "cooldown", label: "15-min cool-down after a loss", checked: true },
  { id: "sl", label: "Mandatory stop-loss BEFORE entry", checked: true },
  { id: "journal", label: "Journal every trade — win or lose", checked: true },
  { id: "nofo", label: "No trades on news headlines I haven't researched", checked: false },
  { id: "weekly", label: "Weekly review every Sunday", checked: false },
];

export function GuardrailsBoard() {
  const [state, setState] = useState(RULES);

  const toggle = (id: string) =>
    setState((prev) => prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)));

  const checked = state.filter((r) => r.checked).length;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold text-white">My Trading Guardrails</p>
        <p className="text-xs text-text-muted">Tick the rules you&apos;ll commit to right now.</p>
        <div className="mt-3 space-y-2">
          {state.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => toggle(r.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface2 px-3 py-2 text-left"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded border-2 text-[11px] ${
                  r.checked ? "border-accent bg-accent text-slate-900" : "border-border text-transparent"
                }`}
              >
                ✓
              </span>
              <span className="text-sm text-white">{r.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-text-muted">
          {checked} / {state.length} rules committed
        </p>
      </div>
      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-xs text-text-muted">
        Print this list. Stick it next to your screen. Re-read before EVERY session.
      </p>
    </div>
  );
}
