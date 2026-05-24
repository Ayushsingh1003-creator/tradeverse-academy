"use client";

import { useMemo, useState } from "react";

export function ExecutionSlippage() {
  const [intended, setIntended] = useState(1250);
  const [actual, setActual] = useState(1252.5);
  const [qty, setQty] = useState(100);

  const slip = useMemo(() => +(actual - intended).toFixed(2), [actual, intended]);
  const slipCost = useMemo(() => +(slip * qty).toFixed(2), [slip, qty]);
  const sign = slip > 0 ? "Adverse" : slip < 0 ? "Favourable" : "None";
  const color = slip > 0 ? "#ef4444" : slip < 0 ? "#29CC57" : "#88C9F7";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-text-muted">
            Intended price (₹)
            <input
              type="number"
              step="0.05"
              value={intended}
              onChange={(e) => setIntended(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-text-muted">
            Actual fill (₹)
            <input
              type="number"
              step="0.05"
              value={actual}
              onChange={(e) => setActual(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-text-muted">
            Quantity
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
            />
          </label>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Slippage / share" value={`₹${slip.toFixed(2)}`} color={color} />
        <Stat label="Total slip cost" value={`₹${slipCost.toFixed(2)}`} color={color} />
        <Stat label="Type" value={sign} color={color} />
      </div>

      <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        Market orders in thin or fast-moving stocks suffer most. Use limit orders when price is sensitive.
      </p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface2 p-3 text-center">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
