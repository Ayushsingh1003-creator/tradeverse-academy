"use client";

import { useMemo, useState } from "react";

export function PriceFormationDemo() {
  const [demand, setDemand] = useState(50);
  const [supply, setSupply] = useState(50);

  const pressure = demand - supply;
  const arrowY = useMemo(() => {
    const center = 110;
    return center - pressure * 0.7;
  }, [pressure]);

  const arrowColor = pressure > 5 ? "#29CC57" : pressure < -5 ? "#ef4444" : "#88C9F7";
  const headline = pressure > 5 ? "Price rises ↑" : pressure < -5 ? "Price falls ↓" : "Price stable =";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <label className="text-xs font-semibold text-text-muted">
          Demand (buyers) — {demand}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={demand}
          onChange={(e) => setDemand(Number(e.target.value))}
          className="mt-2 w-full accent-[#456DFF]"
        />
        <label className="mt-3 block text-xs font-semibold text-text-muted">
          Supply (sellers) — {supply}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={supply}
          onChange={(e) => setSupply(Number(e.target.value))}
          className="mt-2 w-full accent-[#ef4444]"
        />
      </div>

      <svg viewBox="0 0 320 220" className="mx-auto w-full max-w-md">
        <line x1="30" y1="110" x2="290" y2="110" stroke="#334155" strokeDasharray="4 4" />
        <text x="30" y="106" fill="#94a3b8" fontSize="10">
          Reference
        </text>

        <circle cx="160" cy={arrowY} r="16" fill={arrowColor} opacity="0.2" />
        <text x="160" y={arrowY + 6} textAnchor="middle" fill={arrowColor} fontSize="28" fontWeight="900">
          {pressure > 5 ? "↑" : pressure < -5 ? "↓" : "="}
        </text>
        <text x="160" y={arrowY - 26} textAnchor="middle" fill={arrowColor} fontSize="11" fontWeight="700">
          PRICE
        </text>

        <rect x="20" y="180" width={demand * 1.6} height="14" rx="4" fill="#456DFF" />
        <text x="20" y="174" fill="#88C9F7" fontSize="10">
          Demand
        </text>
        <rect x="20" y="200" width={supply * 1.6} height="14" rx="4" fill="#ef4444" />
        <text x="20" y="196" fill="#fca5a5" fontSize="10">
          Supply
        </text>
      </svg>

      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-sm text-text-muted">
        {headline}
      </p>
    </div>
  );
}
