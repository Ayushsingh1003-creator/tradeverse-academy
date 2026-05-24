"use client";

import { useState } from "react";

type Scenario = "with" | "without";

const DATA: Record<Scenario, { title: string; outcome: string; lesson: string; color: string }> = {
  with: {
    title: "Trade WITH a stop loss",
    outcome:
      "Entry ₹1,250, SL ₹1,240, qty 100. Trade goes wrong. Exit at ₹1,240. Loss = ₹1,000 (1% of ₹1L account). Survival intact.",
    lesson: "A small, planned loss is part of trading. You're still in the game tomorrow.",
    color: "#88C9F7",
  },
  without: {
    title: "Trade WITHOUT a stop loss",
    outcome:
      "Same entry ₹1,250, qty 100. No SL set. Stock crashes to ₹1,100 on bad news. Forced to exit. Loss = ₹15,000 (15% of account).",
    lesson: "One unprotected trade can erase weeks of small gains. Discipline > optimism.",
    color: "#ef4444",
  },
};

export function StopLossDrill() {
  const [scn, setScn] = useState<Scenario>("with");
  const d = DATA[scn];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-center gap-2">
        {(["with", "without"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setScn(s)}
            className={`rounded-full px-4 py-2 text-sm ${scn === s ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            {DATA[s].title}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border p-4" style={{ borderColor: d.color }}>
        <p className="text-base font-bold" style={{ color: d.color }}>
          {d.title}
        </p>
        <p className="mt-2 text-sm text-text-muted">{d.outcome}</p>
        <p className="mt-3 rounded-xl bg-surface2 px-3 py-2 text-xs text-white">
          <span className="font-semibold" style={{ color: d.color }}>Lesson: </span>
          {d.lesson}
        </p>
      </div>
    </div>
  );
}
