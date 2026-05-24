"use client";

import { useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { candleLayoutFromOhlc, TEACHING_CANDLES } from "@/lib/candleGeometry";

type Part = "high" | "close" | "open" | "low" | null;

export function CandleAnatomy() {
  const [bullish, setBullish] = useState(true);
  const [hover, setHover] = useState<Part>(null);

  const ohlc = bullish ? TEACHING_CANDLES.anatomy : TEACHING_CANDLES.anatomyBearish;
  const { openY, closeY } = candleLayoutFromOhlc(ohlc);
  const wickHighlight = (part: Part) => (hover === part ? "#F7C325" : "#94a3b8");
  const wickW = (part: Part) => (hover === part ? 5 : 3);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setBullish(true)}
          className={`rounded-full px-4 py-2 text-sm font-medium ${bullish ? "bg-[#22C55E] text-white" : "border border-border bg-surface2"}`}
        >
          Bullish 📈
        </button>
        <button
          type="button"
          onClick={() => setBullish(false)}
          className={`rounded-full px-4 py-2 text-sm font-medium ${!bullish ? "bg-red-500 text-white" : "border border-border bg-surface2"}`}
        >
          Bearish 📉
        </button>
      </div>
      <svg viewBox="0 0 320 360" className="mx-auto h-[360px] w-full max-w-[320px]">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CandlestickSvg
          cx={160}
          bodyWidth={60}
          ohlc={ohlc}
          upperWickStroke={wickHighlight("high")}
          lowerWickStroke={wickHighlight("low")}
          upperWickWidth={wickW("high")}
          lowerWickWidth={wickW("low")}
          bodyOpacity={hover && ["open", "close"].includes(hover) ? 1 : hover ? 0.45 : 1}
        />
        {(
          [
            { id: "high" as const, x: 200, y: 50, text: "HIGH" },
            { id: "close" as const, x: 200, y: closeY + 8, text: "CLOSE" },
            { id: "open" as const, x: 200, y: openY - 8, text: "OPEN" },
            { id: "low" as const, x: 200, y: 300, text: "LOW" },
          ] as const
        ).map((L) => (
          <g key={L.id} className="cursor-pointer" onMouseEnter={() => setHover(L.id)} onMouseLeave={() => setHover(null)}>
            <rect x={L.x - 4} y={L.y - 18} width="72" height="26" rx="6" fill={hover === L.id ? "rgba(247,195,37,0.25)" : "#1e293b"} stroke={hover === L.id ? "#F7C325" : "#475569"} />
            <text x={L.x + 32} y={L.y - 2} textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="600">
              {L.text}
            </text>
          </g>
        ))}
      </svg>
      <p className="text-center text-xs text-text-muted">Hover each label to highlight that part on the candle.</p>
    </div>
  );
}
