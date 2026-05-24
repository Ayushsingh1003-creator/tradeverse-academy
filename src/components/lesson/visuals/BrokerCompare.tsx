"use client";

import { useState } from "react";

type Type = "discount" | "full";

const DATA: Record<Type, { label: string; brokerage: string; advice: string; tools: string; bestFor: string; examples: string }> = {
  discount: {
    label: "Discount Broker",
    brokerage: "₹0 delivery, ~₹20 per intraday trade",
    advice: "No personal advice — DIY",
    tools: "Clean app, basic charts",
    bestFor: "Self-directed traders, low cost",
    examples: "Zerodha, Groww, Upstox, Dhan",
  },
  full: {
    label: "Full-Service Broker",
    brokerage: "0.3–0.5% of trade value",
    advice: "Research reports, advisor support",
    tools: "Research + advisory + premium tools",
    bestFor: "Long-term investors wanting hand-holding",
    examples: "ICICI Direct, HDFC Securities, Motilal Oswal",
  },
};

export function BrokerCompare() {
  const [type, setType] = useState<Type>("discount");
  const d = DATA[type];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-center gap-2">
        {(["discount", "full"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-full px-4 py-2 text-sm ${type === t ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            {DATA[t].label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-lg font-bold text-white">{d.label}</p>
        <div className="mt-3 space-y-2 text-sm">
          <Row label="Brokerage" value={d.brokerage} />
          <Row label="Advice" value={d.advice} />
          <Row label="Tools" value={d.tools} />
          <Row label="Best for" value={d.bestFor} />
          <Row label="Examples" value={d.examples} />
        </div>
      </div>

      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-xs text-text-muted">
        Beginners and active traders mostly use discount brokers for low cost & better apps.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2 last:border-none last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
