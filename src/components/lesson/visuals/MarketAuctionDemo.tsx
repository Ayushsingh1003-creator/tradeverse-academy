"use client";

import { useState } from "react";

type Mode = "buyers" | "balanced" | "sellers";

const MODE_LABEL: Record<Mode, string> = {
  buyers: "More aggressive buyers",
  balanced: "Buyers ≈ Sellers",
  sellers: "More aggressive sellers",
};

const MODE_RESULT: Record<Mode, string> = {
  buyers: "Price moves UP — buyers willing to pay higher to get filled.",
  balanced: "Price barely moves — fair value, low conviction.",
  sellers: "Price moves DOWN — sellers accept lower bids to exit.",
};

export function MarketAuctionDemo() {
  const [mode, setMode] = useState<Mode>("balanced");

  const arrow = mode === "buyers" ? "↑" : mode === "sellers" ? "↓" : "=";
  const arrowColor = mode === "buyers" ? "#29CC57" : mode === "sellers" ? "#ef4444" : "#88C9F7";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="flex flex-wrap justify-center gap-2">
        {(["buyers", "balanced", "sellers"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm ${
              mode === m ? "bg-accent text-slate-900" : "border border-border bg-surface2 text-text-primary"
            }`}
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 560 240" className="w-full">
        <rect x="20" y="40" width="200" height="80" rx="14" fill="#1E293B" stroke="#475569" />
        <text x="120" y="78" textAnchor="middle" fill="#88C9F7" fontSize="16" fontWeight="700">
          BUYERS
        </text>
        <text x="120" y="100" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Want shares
        </text>

        <rect x="340" y="40" width="200" height="80" rx="14" fill="#1E293B" stroke="#475569" />
        <text x="440" y="78" textAnchor="middle" fill="#fca5a5" fontSize="16" fontWeight="700">
          SELLERS
        </text>
        <text x="440" y="100" textAnchor="middle" fill="#94a3b8" fontSize="11">
          Want cash
        </text>

        <line x1="220" y1="80" x2="340" y2="80" stroke={arrowColor} strokeWidth="3" />
        <text x="280" y="70" textAnchor="middle" fill={arrowColor} fontSize="28" fontWeight="900">
          {arrow}
        </text>
        <text x="280" y="98" textAnchor="middle" fill="#cbd5e1" fontSize="11">
          Price
        </text>

        <rect x="180" y="160" width="200" height="56" rx="12" fill="#0F172A" stroke="#334155" />
        <text x="280" y="184" textAnchor="middle" fill="#88C9F7" fontSize="13" fontWeight="700">
          MATCHED TRADE
        </text>
        <text x="280" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10">
          Both sides agree on a price — a trade happens
        </text>

        <line x1="120" y1="120" x2="260" y2="160" stroke={arrowColor} strokeWidth="2.5" />
        <line x1="440" y1="120" x2="300" y2="160" stroke={arrowColor} strokeWidth="2.5" />
      </svg>

      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-sm text-text-muted">
        {MODE_RESULT[mode]}
      </p>
    </div>
  );
}
