"use client";

import { useMemo, useState } from "react";

export function BidAskSpreadCostDemo() {
  const [bid, setBid] = useState(1248.5);
  const [ask, setAsk] = useState(1249.0);
  const [qty, setQty] = useState(100);

  const spread = useMemo(() => Math.max(0, +(ask - bid).toFixed(2)), [ask, bid]);
  const roundTripCost = useMemo(() => +(spread * qty).toFixed(2), [spread, qty]);

  const qualityLabel =
    spread <= 0.5 ? "Tight" : spread <= 1.5 ? "Normal" : "Wide";
  const qualityColor =
    spread <= 0.5 ? "#29CC57" : spread <= 1.5 ? "#88C9F7" : "#ef4444";

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-text-muted">
            Bid (₹)
            <input
              type="number"
              step="0.05"
              value={bid}
              onChange={(e) => setBid(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="text-xs text-text-muted">
            Ask (₹)
            <input
              type="number"
              step="0.05"
              value={ask}
              onChange={(e) => setAsk(Number(e.target.value))}
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
        <div className="rounded-2xl border border-border bg-surface2 p-3 text-center">
          <p className="text-xs text-text-muted">Spread</p>
          <p className="text-lg font-bold" style={{ color: qualityColor }}>
            ₹{spread.toFixed(2)}
          </p>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: qualityColor }}>
            {qualityLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface2 p-3 text-center">
          <p className="text-xs text-text-muted">Round-trip cost</p>
          <p className="text-lg font-bold text-white">₹{roundTripCost.toFixed(2)}</p>
          <p className="text-[10px] text-text-muted">{qty} shares</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface2 p-3 text-center">
          <p className="text-xs text-text-muted">Mid-price</p>
          <p className="text-lg font-bold text-white">₹{((bid + ask) / 2).toFixed(2)}</p>
          <p className="text-[10px] text-text-muted">Approx. fair value</p>
        </div>
      </div>

      <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        Tighter spreads (typical in liquid stocks like Reliance or HDFC Bank) keep your friction low. Avoid wide-spread instruments.
      </p>
    </div>
  );
}
