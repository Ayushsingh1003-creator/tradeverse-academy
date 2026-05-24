"use client";

import { useMemo, useState } from "react";

export function PositionSizingCalc() {
  const [account, setAccount] = useState(100000);
  const [riskPct, setRiskPct] = useState(1);
  const [entry, setEntry] = useState(1250);
  const [stop, setStop] = useState(1240);

  const { riskRupees, riskPerShare, qty } = useMemo(() => {
    const r = (account * riskPct) / 100;
    const perShare = Math.max(0.01, Math.abs(entry - stop));
    return {
      riskRupees: r,
      riskPerShare: perShare,
      qty: Math.floor(r / perShare),
    };
  }, [account, riskPct, entry, stop]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
        <label className="text-xs text-text-muted">
          Account (₹)
          <input
            type="number"
            value={account}
            onChange={(e) => setAccount(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-text-muted">
          Risk per trade (%)
          <input
            type="number"
            step="0.1"
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-text-muted">
          Entry price (₹)
          <input
            type="number"
            step="0.05"
            value={entry}
            onChange={(e) => setEntry(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-xs text-text-muted">
          Stop loss price (₹)
          <input
            type="number"
            step="0.05"
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Max risk in ₹" value={`₹${riskRupees.toFixed(0)}`} />
        <Stat label="Risk per share" value={`₹${riskPerShare.toFixed(2)}`} />
        <Stat label="Position size" value={`${qty} shares`} accent />
      </div>

      <p className="rounded-2xl border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        Rule of thumb: never risk more than 1% of your account on a single trade. Position size adjusts automatically — don't force a fixed share count.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${accent ? "border-accent bg-accent/10" : "border-border bg-surface2"}`}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-bold ${accent ? "text-accent" : "text-white"}`}>{value}</p>
    </div>
  );
}
