"use client";

import { useState } from "react";

type Asset = "stocks" | "fo" | "commodities" | "currency" | "crypto";

const ASSETS: { id: Asset; name: string; emoji: string; egs: string; risk: "Low" | "Med" | "High" | "Very High"; details: string }[] = [
  {
    id: "stocks",
    name: "Stocks (Equity)",
    emoji: "📈",
    egs: "Reliance, TCS, HDFC Bank, Infosys",
    risk: "Med",
    details:
      "Ownership in a listed company. Beginner-friendly. Trade on NSE/BSE during market hours. Returns from price change + dividends.",
  },
  {
    id: "fo",
    name: "F&O (Derivatives)",
    emoji: "⚙️",
    egs: "Nifty Futures, Bank Nifty Options",
    risk: "Very High",
    details:
      "Futures & Options — leveraged contracts. Powerful but most beginners lose money here. Avoid until you've mastered equity.",
  },
  {
    id: "commodities",
    name: "Commodities",
    emoji: "🪙",
    egs: "Gold (MCX), Silver, Crude Oil",
    risk: "High",
    details:
      "Traded on MCX (Multi Commodity Exchange). Affected by global supply, USD, geopolitics. Used for hedging or speculation.",
  },
  {
    id: "currency",
    name: "Currency",
    emoji: "💱",
    egs: "USD/INR, EUR/INR, GBP/INR",
    risk: "High",
    details:
      "Currency pairs traded on NSE/BSE currency segment. Smaller moves, often used by importers, exporters & forex traders.",
  },
  {
    id: "crypto",
    name: "Crypto",
    emoji: "₿",
    egs: "BTC, ETH (via WazirX, CoinDCX)",
    risk: "Very High",
    details:
      "Open 24/7. Extreme volatility. Regulatory status in India still evolving — proceed carefully, never with money you need.",
  },
];

export function AssetClassesIndia() {
  const [active, setActive] = useState<Asset>("stocks");
  const current = ASSETS.find((a) => a.id === active)!;
  const riskColor =
    current.risk === "Low"
      ? "#29CC57"
      : current.risk === "Med"
        ? "#88C9F7"
        : current.risk === "High"
          ? "#F7C325"
          : "#ef4444";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-2 sm:grid-cols-5">
        {ASSETS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActive(a.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center text-xs transition-colors ${
              active === a.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface2 text-text-primary hover:bg-surface"
            }`}
          >
            <span className="text-2xl">{a.emoji}</span>
            <span className="font-semibold">{a.name.split(" ")[0]}</span>
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-white">{current.name}</p>
          <span className="rounded-full border px-2 py-0.5 text-[11px] font-bold" style={{ color: riskColor, borderColor: riskColor }}>
            Risk: {current.risk}
          </span>
        </div>
        <p className="mt-1 text-xs text-text-muted">Examples: {current.egs}</p>
        <p className="mt-2 text-sm text-text-muted">{current.details}</p>
      </div>
    </div>
  );
}
