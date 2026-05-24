"use client";

import { useState } from "react";

type Window = "preopen" | "regular" | "postclose" | "closed";

const WINDOWS: { id: Window; label: string; range: string; details: string }[] = [
  {
    id: "preopen",
    label: "Pre-Open",
    range: "09:00 – 09:15 IST",
    details:
      "Orders collected but not yet executed. Equilibrium price is discovered — useful for gauging opening sentiment.",
  },
  {
    id: "regular",
    label: "Regular Session",
    range: "09:15 – 15:30 IST",
    details:
      "The main trading session on NSE & BSE. Highest liquidity, tightest spreads. This is where most traders operate.",
  },
  {
    id: "postclose",
    label: "Post-Close",
    range: "15:40 – 16:00 IST",
    details:
      "Limited order matching at closing price. Mostly for end-of-day cleanups, not active trading.",
  },
  {
    id: "closed",
    label: "Market Closed",
    range: "After 16:00 and weekends",
    details:
      "No trading. Avoid taking trades just before close — you can't react until next morning. Use this time to journal & plan.",
  },
];

export function MarketHoursClock() {
  const [active, setActive] = useState<Window>("regular");
  const current = WINDOWS.find((w) => w.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <svg viewBox="0 0 560 120" className="w-full">
        <line x1="40" y1="60" x2="520" y2="60" stroke="#334155" strokeWidth="2" />
        {[
          { x: 80, label: "09:00" },
          { x: 160, label: "09:15" },
          { x: 380, label: "15:30" },
          { x: 460, label: "15:40" },
          { x: 510, label: "16:00" },
        ].map((m, i) => (
          <g key={i}>
            <line x1={m.x} y1="50" x2={m.x} y2="70" stroke="#64748b" strokeWidth="1.5" />
            <text x={m.x} y="90" textAnchor="middle" fill="#94a3b8" fontSize="10">
              {m.label}
            </text>
          </g>
        ))}
        <rect x="80" y="44" width="80" height="32" rx="6" fill={active === "preopen" ? "#F7C325" : "rgba(247,195,37,0.2)"} opacity={active === "preopen" ? 1 : 0.6} />
        <rect x="160" y="44" width="220" height="32" rx="6" fill={active === "regular" ? "#456DFF" : "rgba(69,109,255,0.2)"} opacity={active === "regular" ? 1 : 0.6} />
        <rect x="460" y="44" width="50" height="32" rx="6" fill={active === "postclose" ? "#88C9F7" : "rgba(136,201,247,0.2)"} opacity={active === "postclose" ? 1 : 0.6} />
        <text x="120" y="35" textAnchor="middle" fill="#F7C325" fontSize="10" fontWeight="700">PRE</text>
        <text x="270" y="35" textAnchor="middle" fill="#88C9F7" fontSize="10" fontWeight="700">MAIN SESSION</text>
        <text x="485" y="35" textAnchor="middle" fill="#88C9F7" fontSize="10" fontWeight="700">POST</text>
      </svg>

      <div className="flex flex-wrap justify-center gap-2">
        {WINDOWS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setActive(w.id)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              active === w.id ? "bg-accent text-slate-900" : "border border-border bg-surface2 text-text-primary"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-bold text-white">
          {current.label} · <span className="text-text-muted">{current.range}</span>
        </p>
        <p className="mt-2 text-sm text-text-muted">{current.details}</p>
      </div>
    </div>
  );
}
