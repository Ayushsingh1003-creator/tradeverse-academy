"use client";

import { useMemo, useState } from "react";

type Mode = "intraday" | "delivery";

export function ChargesBreakdown() {
  const [mode, setMode] = useState<Mode>("intraday");
  const [tradeValue, setTradeValue] = useState(50000);

  const { brokerage, stt, gst, sebi, stamp, total } = useMemo(() => {
    const tv = Math.max(0, tradeValue);
    if (mode === "intraday") {
      const brokerageVal = Math.min(40, tv * 0.0003); // ₹20 per leg = ~₹40 round trip, capped
      const sttVal = tv * 0.00025; // 0.025% on sell leg (approx blended)
      const sebiVal = tv * 0.000001;
      const stampVal = tv * 0.00003;
      const gstVal = (brokerageVal + sebiVal) * 0.18;
      const totalVal = brokerageVal + sttVal + sebiVal + stampVal + gstVal;
      return {
        brokerage: brokerageVal,
        stt: sttVal,
        gst: gstVal,
        sebi: sebiVal,
        stamp: stampVal,
        total: totalVal,
      };
    }
    const brokerageVal = 0;
    const sttVal = tv * 0.001;
    const sebiVal = tv * 0.000001;
    const stampVal = tv * 0.00015;
    const gstVal = (brokerageVal + sebiVal) * 0.18;
    const totalVal = brokerageVal + sttVal + sebiVal + stampVal + gstVal;
    return {
      brokerage: brokerageVal,
      stt: sttVal,
      gst: gstVal,
      sebi: sebiVal,
      stamp: stampVal,
      total: totalVal,
    };
  }, [mode, tradeValue]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex justify-center gap-2">
        {(["intraday", "delivery"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-4 py-2 text-sm ${mode === m ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            {m === "intraday" ? "Intraday" : "Delivery"}
          </button>
        ))}
      </div>
      <label className="block rounded-2xl border border-border bg-surface p-4 text-xs text-text-muted">
        Trade value (₹)
        <input
          type="number"
          value={tradeValue}
          onChange={(e) => setTradeValue(Number(e.target.value))}
          className="mt-1 w-full rounded-xl border border-border bg-surface2 px-3 py-2 text-sm text-white"
        />
      </label>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <Row label="Brokerage (₹20/leg, capped)" value={brokerage} />
        <Row label="STT" value={stt} />
        <Row label="SEBI fee" value={sebi} />
        <Row label="Stamp duty" value={stamp} />
        <Row label="GST (18%)" value={gst} />
        <Row label="Total approx. charges" value={total} bold />
      </div>
      <p className="rounded-2xl border border-border bg-surface2 px-4 py-3 text-center text-xs text-text-muted">
        These are illustrative — actual charges vary by broker, segment & exchange. Always check your contract note.
      </p>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-b border-border/60 px-4 py-2 text-sm last:border-none ${bold ? "bg-accent/10 font-bold text-white" : "text-text-muted"}`}>
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}
