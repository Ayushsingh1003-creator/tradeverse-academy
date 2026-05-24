"use client";

import { useMemo, useState } from "react";

export function RRRatioVisual() {
  const [entry, setEntry] = useState(1250);
  const [stop, setStop] = useState(1240);
  const [target, setTarget] = useState(1280);

  const risk = Math.max(0.01, Math.abs(entry - stop));
  const reward = Math.max(0, Math.abs(target - entry));
  const ratio = useMemo(() => +(reward / risk).toFixed(2), [reward, risk]);

  const quality =
    ratio >= 3 ? "Excellent" : ratio >= 2 ? "Good" : ratio >= 1 ? "Acceptable" : "Poor";
  const color = ratio >= 2 ? "#29CC57" : ratio >= 1 ? "#F7C325" : "#ef4444";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-3">
        <label className="text-xs text-text-muted">
          Entry (₹)
          <input
            type="number"
            value={entry}
            onChange={(e) => setEntry(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-text-muted">
          Stop loss (₹)
          <input
            type="number"
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-text-muted">
          Target (₹)
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <svg viewBox="0 0 560 120" className="w-full">
        <rect x="20" y="40" width={Math.max(20, risk * 4)} height="40" rx="6" fill="#ef4444" />
        <text x="30" y="100" fill="#fca5a5" fontSize="11">Risk ₹{risk.toFixed(2)}</text>
        <rect x={Math.max(20, risk * 4) + 30} y="40" width={Math.max(20, reward * 4)} height="40" rx="6" fill="#29CC57" />
        <text x={Math.max(20, risk * 4) + 40} y="100" fill="#86efac" fontSize="11">Reward ₹{reward.toFixed(2)}</text>
      </svg>

      <div className="rounded-2xl border p-4 text-center" style={{ borderColor: color }}>
        <p className="text-xs text-text-muted">Reward-to-Risk Ratio</p>
        <p className="text-3xl font-extrabold" style={{ color }}>
          1 : {ratio}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide" style={{ color }}>{quality}</p>
      </div>

      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-xs text-text-muted">
        Aim for ≥ 1:2 on planned trades. Even a 40% win rate is profitable at 1:2 R:R.
      </p>
    </div>
  );
}
