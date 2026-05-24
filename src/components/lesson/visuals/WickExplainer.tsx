"use client";

import { useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";

export function WickExplainer() {
  const [phase, setPhase] = useState(0);

  const replay = () => setPhase(0);

  return (
    <div className="mx-auto max-w-lg space-y-4 text-center">
      <svg viewBox="0 0 280 260" className="mx-auto h-64 w-full">
        <CandlestickSvg
          cx={140}
          bodyWidth={60}
          ohlc={TEACHING_CANDLES.wickExplainer}
          bodyOpacity={phase >= 0 ? 1 : 0.3}
          upperWickOpacity={phase >= 1 ? 1 : 0.2}
          lowerWickOpacity={phase >= 2 ? 1 : 0.3}
          wickWidth={phase >= 2 ? 5 : 3}
        />
        {phase >= 1 ? (
          <text x="200" y="55" fill="#fbbf24" fontSize="11">
            Tested high
          </text>
        ) : null}
        {phase >= 2 ? (
          <text x="200" y="200" fill="#fbbf24" fontSize="11">
            Rejected low
          </text>
        ) : null}
      </svg>
      <p className="text-sm text-text-muted">
        {phase === 0 && "Body forms first — open to close."}
        {phase === 1 && "Upper wick: price tested higher… then sellers pushed back."}
        {phase === 2 && "Lower wick: a deep probe that buyers rejected — strong support battle."}
      </p>
      <div className="flex justify-center gap-2">
        {phase < 2 ? (
          <button type="button" className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-900" onClick={() => setPhase((p) => p + 1)}>
            Next step →
          </button>
        ) : (
          <button type="button" className="rounded-2xl border border-border px-4 py-2 text-sm" onClick={replay}>
            Play again
          </button>
        )}
      </div>
    </div>
  );
}
