"use client";

import { useState } from "react";

type Trap = "fomo" | "revenge" | "overtrade" | "averaging" | "ego";

const TRAPS: { id: Trap; emoji: string; name: string; scenario: string; fix: string }[] = [
  {
    id: "fomo",
    emoji: "🏃",
    name: "FOMO",
    scenario: "Reliance just rallied 4% — you didn't take the trade. You buy late at the top.",
    fix: "If you missed it, you missed it. Wait for the NEXT clean setup. Discipline > excitement.",
  },
  {
    id: "revenge",
    emoji: "🔥",
    name: "Revenge trading",
    scenario: "You hit your SL on TCS. Furious, you immediately enter Infosys to 'make it back'.",
    fix: "Mandatory 15-minute cool-down after every loss. Walk away, journal, then decide.",
  },
  {
    id: "overtrade",
    emoji: "🎰",
    name: "Overtrading",
    scenario: "You take 12 trades today because the screen is busy. Most are random.",
    fix: "Max 3 trades per day until proven profitable. Quality > quantity.",
  },
  {
    id: "averaging",
    emoji: "⬇️",
    name: "Averaging a loser",
    scenario: "Trade goes against you. You add more shares to 'lower your average'.",
    fix: "If your thesis is wrong, ADDING is worse — you scale up risk on a bad idea. Cut, don't add.",
  },
  {
    id: "ego",
    emoji: "🪞",
    name: "Ego trading",
    scenario: "You refuse to exit because being wrong feels bad. The loss grows.",
    fix: "Being wrong is part of trading. Closing wrong trades fast = professional behaviour.",
  },
];

export function EmotionalTrapsScene() {
  const [active, setActive] = useState<Trap>("fomo");
  const t = TRAPS.find((x) => x.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {TRAPS.map((tr) => (
          <button
            key={tr.id}
            type="button"
            onClick={() => setActive(tr.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-center text-xs transition-colors ${
              active === tr.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface2 text-text-primary"
            }`}
          >
            <span className="text-2xl">{tr.emoji}</span>
            <span className="font-semibold">{tr.name}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-base font-bold text-white">{t.emoji} {t.name}</p>
        <p className="mt-2 text-sm text-text-muted">
          <span className="font-semibold text-amber-300">Scenario: </span>
          {t.scenario}
        </p>
        <div className="mt-3 rounded-xl border border-accent/40 bg-accent/10 p-3 text-sm">
          <span className="font-semibold text-accent">Fix: </span>
          {t.fix}
        </div>
      </div>
    </div>
  );
}
