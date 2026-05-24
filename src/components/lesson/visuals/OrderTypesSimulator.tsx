"use client";

import { useState } from "react";

type OrderType = "market" | "limit" | "sl" | "slm" | "gtt";

const ORDERS: { id: OrderType; name: string; when: string; how: string }[] = [
  {
    id: "market",
    name: "Market Order",
    when: "Speed matters more than price",
    how: "Buys at the current ask / sells at the current bid. Instant fill but exact price not guaranteed (slippage risk).",
  },
  {
    id: "limit",
    name: "Limit Order",
    when: "You want a specific price, not now",
    how: "Sits on the order book. Fills only if price reaches your specified level. No fill = no trade.",
  },
  {
    id: "sl",
    name: "Stop-Loss (SL)",
    when: "Protect a trade with a trigger + limit",
    how: "Triggers once price hits the SL price, then places a limit order. Safer but may not fill in fast moves.",
  },
  {
    id: "slm",
    name: "Stop-Loss Market (SL-M)",
    when: "You want guaranteed exit, accept slippage",
    how: "Triggers a market order at the SL price. Almost always fills — but at whatever price is available.",
  },
  {
    id: "gtt",
    name: "GTT (Good Till Triggered)",
    when: "Set & forget for swing trades",
    how: "Order stays alive (usually up to 1 year) until your trigger price is hit. Common in delivery investing.",
  },
];

export function OrderTypesSimulator() {
  const [active, setActive] = useState<OrderType>("market");
  const current = ORDERS.find((o) => o.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ORDERS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setActive(o.id)}
            className={`rounded-2xl border px-2 py-2 text-xs font-semibold transition-colors ${
              active === o.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface2 text-text-primary"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-base font-bold text-white">{current.name}</p>
        <p className="mt-2 text-xs text-text-muted">When to use: {current.when}</p>
        <p className="mt-2 text-sm text-text-muted">{current.how}</p>
      </div>
    </div>
  );
}
