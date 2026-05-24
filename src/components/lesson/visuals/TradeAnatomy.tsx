"use client";

import { useState } from "react";

type Part = "entry" | "sl" | "target" | "exit";

const PARTS: Record<Part, { label: string; desc: string }> = {
  entry: { label: "Entry", desc: "The price at which you open the trade. Should match your plan, not your feelings." },
  sl: { label: "Stop Loss", desc: "Predefined exit if the trade is wrong. NO SL = undefined risk = dangerous." },
  target: { label: "Target", desc: "Pre-planned profit objective. Usually based on structure or a multiple of risk." },
  exit: { label: "Exit", desc: "Actual close of the trade — at target, at SL, or at a discretionary level based on plan." },
};

export function TradeAnatomy() {
  const [hover, setHover] = useState<Part>("entry");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <svg viewBox="0 0 560 220" className="w-full">
        <line x1="40" y1="40" x2="520" y2="40" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 4" opacity={hover === "target" ? 1 : 0.5} />
        <text x="44" y="34" fill="#fca5a5" fontSize="11">Target ₹1,290</text>

        <line x1="40" y1="180" x2="520" y2="180" stroke="#88C9F7" strokeWidth="2" strokeDasharray="6 4" opacity={hover === "sl" ? 1 : 0.5} />
        <text x="44" y="195" fill="#88C9F7" fontSize="11">Stop Loss ₹1,240</text>

        <line x1="40" y1="110" x2="520" y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <circle cx="120" cy="110" r="8" fill={hover === "entry" ? "#F7C325" : "#456DFF"} />
        <text x="120" y="135" textAnchor="middle" fill={hover === "entry" ? "#F7C325" : "#88C9F7"} fontSize="11" fontWeight="700">
          Entry ₹1,250
        </text>

        <path d="M 120 110 Q 240 70 400 50" stroke={hover === "exit" ? "#29CC57" : "#475569"} strokeWidth="2.5" fill="none" />
        <circle cx="400" cy="50" r="7" fill={hover === "exit" ? "#29CC57" : "#94a3b8"} />
        <text x="400" y="32" textAnchor="middle" fill={hover === "exit" ? "#86efac" : "#94a3b8"} fontSize="11" fontWeight="700">
          Exit
        </text>
      </svg>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(PARTS) as Part[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setHover(p)}
            className={`rounded-2xl border px-2 py-2 text-xs font-semibold transition-colors ${
              hover === p ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface2"
            }`}
          >
            {PARTS[p].label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-text-muted">
        {PARTS[hover].desc}
      </div>
    </div>
  );
}
