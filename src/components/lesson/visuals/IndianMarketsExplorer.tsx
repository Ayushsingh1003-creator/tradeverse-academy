"use client";

import { useState } from "react";

type Item = "nse" | "bse" | "nifty" | "sensex" | "sebi";

const ITEMS: { id: Item; name: string; emoji: string; details: string }[] = [
  {
    id: "nse",
    name: "NSE",
    emoji: "🏛️",
    details:
      "National Stock Exchange — India's largest exchange by volume. Hosts the Nifty 50 index. Founded 1992, fully electronic.",
  },
  {
    id: "bse",
    name: "BSE",
    emoji: "🏛️",
    details:
      "Bombay Stock Exchange — Asia's oldest stock exchange (1875). Hosts the Sensex (S&P BSE SENSEX) index of 30 large companies.",
  },
  {
    id: "nifty",
    name: "Nifty 50",
    emoji: "📊",
    details:
      "Benchmark of 50 largest, most liquid Indian companies (Reliance, TCS, HDFC Bank, Infosys, ICICI Bank…). Tracks NSE.",
  },
  {
    id: "sensex",
    name: "Sensex",
    emoji: "📊",
    details:
      "Benchmark of 30 largest Indian companies on BSE. Both Nifty & Sensex usually move together — they're proxies for the market.",
  },
  {
    id: "sebi",
    name: "SEBI",
    emoji: "🛡️",
    details:
      "Securities and Exchange Board of India — the market regulator. Protects investors, sets rules, and licenses brokers.",
  },
];

export function IndianMarketsExplorer() {
  const [active, setActive] = useState<Item>("nse");
  const current = ITEMS.find((i) => i.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ITEMS.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setActive(it.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center text-xs transition-colors ${
              active === it.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface2 text-text-primary hover:bg-surface"
            }`}
          >
            <span className="text-2xl">{it.emoji}</span>
            <span className="font-semibold">{it.name}</span>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-base font-bold text-white">{current.name}</p>
        <p className="mt-2 text-sm text-text-muted">{current.details}</p>
      </div>
    </div>
  );
}
