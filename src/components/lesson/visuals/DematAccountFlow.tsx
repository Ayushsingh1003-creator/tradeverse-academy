"use client";

import { useState } from "react";

type StepId = "bank" | "trading" | "exchange" | "demat";

const STEPS: { id: StepId; emoji: string; title: string; desc: string }[] = [
  { id: "bank", emoji: "🏦", title: "Bank Account", desc: "Holds your money. Used to deposit funds into your trading account." },
  { id: "trading", emoji: "📲", title: "Trading Account", desc: "Opened with a broker (Zerodha, Groww…). Used to place buy/sell orders." },
  { id: "exchange", emoji: "🏛️", title: "Exchange (NSE/BSE)", desc: "Matches your buy order with someone's sell order. Trade is executed here." },
  { id: "demat", emoji: "💼", title: "Demat Account", desc: "Holds your purchased shares in electronic form (via NSDL or CDSL)." },
];

export function DematAccountFlow() {
  const [active, setActive] = useState<StepId>("bank");
  const current = STEPS.find((s) => s.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActive(s.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-center text-xs transition-colors ${
              active === s.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface2 text-text-primary"
            }`}
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-semibold">
              {i + 1}. {s.title.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <svg viewBox="0 0 560 60" className="w-full">
        {STEPS.map((s, i) => {
          const x = 70 + i * 140;
          return (
            <g key={s.id}>
              <circle cx={x} cy="30" r="14" fill={active === s.id ? "#456DFF" : "#1E293B"} stroke="#456DFF" strokeWidth="1.5" />
              <text x={x} y="34" textAnchor="middle" fill="white" fontSize="12" fontWeight="700">
                {i + 1}
              </text>
              {i < STEPS.length - 1 ? <line x1={x + 16} y1="30" x2={x + 124} y2="30" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" /> : null}
            </g>
          );
        })}
      </svg>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-base font-bold text-white">
          {current.emoji} {current.title}
        </p>
        <p className="mt-2 text-sm text-text-muted">{current.desc}</p>
      </div>
    </div>
  );
}
