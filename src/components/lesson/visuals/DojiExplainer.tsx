"use client";

import { useState } from "react";

const variants = [
  { id: "standard", label: "Standard Doji", desc: "Equal wicks — balanced push from both sides." },
  { id: "long", label: "Long-legged Doji", desc: "Wide range, tiny body — high volatility, no winner." },
  { id: "dragon", label: "Dragonfly Doji", desc: "Long lower wick — sellers pushed down, buyers closed it back." },
] as const;

export function DojiExplainer() {
  const [active, setActive] = useState<string>("standard");

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <svg viewBox="0 0 260 200" className="mx-auto h-48 w-full">
        <line x1="130" y1="30" x2="130" y2="85" stroke="#94a3b8" strokeWidth="3" />
        <line x1="130" y1="95" x2="130" y2="170" stroke="#94a3b8" strokeWidth="3" />
        <rect x="115" y="88" width="30" height="8" rx="2" fill="#cbd5e1" />
        <text x="40" y="100" fill="#60a5fa" fontSize="12">
          BUYERS
        </text>
        <text x="190" y="100" fill="#f87171" fontSize="12">
          SELLERS
        </text>
      </svg>
      <p className="text-center text-sm text-text-muted">Neither side wins when Open ≈ Close — indecision.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {variants.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setActive(v.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${active === v.id ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            {v.label}
          </button>
        ))}
      </div>
      <p className="text-center text-sm text-text-primary">{variants.find((v) => v.id === active)?.desc}</p>
    </div>
  );
}
