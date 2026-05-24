"use client";

import { useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";

type Candle = { o: number; c: number; h: number; l: number };

const UPTREND: Candle[] = [
  { o: 160, c: 145, h: 142, l: 163 },
  { o: 145, c: 132, h: 128, l: 148 },
  { o: 132, c: 118, h: 114, l: 135 },
  { o: 118, c: 128, h: 115, l: 131 },
  { o: 128, c: 138, h: 125, l: 142 },
  { o: 138, c: 122, h: 118, l: 141 },
  { o: 122, c: 108, h: 104, l: 124 },
  { o: 108, c: 90, h: 86, l: 111 },
  { o: 90, c: 100, h: 87, l: 103 },
  { o: 100, c: 110, h: 97, l: 113 },
  { o: 110, c: 90, h: 87, l: 113 },
  { o: 90, c: 65, h: 60, l: 92 },
];

const DOWNTREND: Candle[] = [
  { o: 55, c: 70, h: 50, l: 73 },
  { o: 70, c: 85, h: 65, l: 88 },
  { o: 85, c: 100, h: 80, l: 103 },
  { o: 100, c: 88, h: 85, l: 103 },
  { o: 88, c: 78, h: 74, l: 91 },
  { o: 78, c: 92, h: 74, l: 95 },
  { o: 92, c: 108, h: 88, l: 111 },
  { o: 108, c: 125, h: 104, l: 128 },
  { o: 125, c: 115, h: 112, l: 128 },
  { o: 115, c: 105, h: 102, l: 118 },
  { o: 105, c: 122, h: 101, l: 125 },
  { o: 122, c: 150, h: 118, l: 153 },
];

const SIDEWAYS: Candle[] = [
  { o: 90, c: 108, h: 85, l: 112 },
  { o: 108, c: 122, h: 105, l: 128 },
  { o: 122, c: 132, h: 118, l: 138 },
  { o: 132, c: 120, h: 116, l: 135 },
  { o: 120, c: 105, h: 102, l: 123 },
  { o: 105, c: 88, h: 82, l: 108 },
  { o: 88, c: 100, h: 84, l: 105 },
  { o: 100, c: 118, h: 96, l: 122 },
  { o: 118, c: 130, h: 114, l: 136 },
  { o: 130, c: 118, h: 114, l: 134 },
  { o: 118, c: 100, h: 96, l: 122 },
  { o: 100, c: 85, h: 82, l: 105 },
];

const PAD_X = 16;
const SLOT = 24;
const BODY_W = 14;

function candleX(i: number) {
  return PAD_X + i * SLOT;
}

function candleCenterX(i: number) {
  return candleX(i) + BODY_W / 2;
}

function CandleSeries({ data }: { data: Candle[] }) {
  return (
    <>
      {data.map((cdl, i) => (
        <CandlestickSvg
          key={i}
          cx={candleCenterX(i)}
          bodyWidth={BODY_W}
          ohlc={cdl}
          wickWidth={1.5}
          bodyRx={2}
        />
      ))}
    </>
  );
}

function SwingTag({
  x,
  y,
  label,
  color,
  anchor = "middle",
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text x={x} y={y} fill={color} fontSize="9" fontWeight="700" textAnchor={anchor}>
      {label}
    </text>
  );
}

export function TrendLines() {
  const [tab, setTab] = useState<"up" | "down" | "side">("up");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex justify-center gap-2">
        {(["up", "down", "side"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              tab === t ? "bg-accent text-slate-900" : "border border-border bg-surface2"
            }`}
          >
            {t === "up" ? "Uptrend" : t === "down" ? "Downtrend" : "Sideways"}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 320 200" className="h-56 w-full">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#1f2937" strokeWidth="1" />
        ))}

        {tab === "up" && (
          <g>
            <CandleSeries data={UPTREND} />
            <line x1="10" y1="168" x2="310" y2="90" stroke="#F7C325" strokeWidth="2" strokeDasharray="6 4" />
            <SwingTag x={candleCenterX(2)} y={UPTREND[2]!.h - 6} label="HH" color="#88C9F7" />
            <SwingTag x={candleCenterX(7)} y={UPTREND[7]!.h - 6} label="HH" color="#88C9F7" />
            <SwingTag x={candleCenterX(11)} y={UPTREND[11]!.h - 6} label="HH" color="#88C9F7" />
            <SwingTag x={candleCenterX(4)} y={UPTREND[4]!.l + 12} label="HL" color="#F7C325" />
            <SwingTag x={candleCenterX(9)} y={UPTREND[9]!.l + 12} label="HL" color="#F7C325" />
            <text x="160" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">
              Higher highs + higher lows
            </text>
          </g>
        )}

        {tab === "down" && (
          <g>
            <CandleSeries data={DOWNTREND} />
            <line x1="10" y1="50" x2="310" y2="128" stroke="#F7C325" strokeWidth="2" strokeDasharray="6 4" />
            <SwingTag x={candleCenterX(2)} y={DOWNTREND[2]!.l + 12} label="LL" color="#fca5a5" />
            <SwingTag x={candleCenterX(7)} y={DOWNTREND[7]!.l + 12} label="LL" color="#fca5a5" />
            <SwingTag x={candleCenterX(11)} y={DOWNTREND[11]!.l + 12} label="LL" color="#fca5a5" />
            <SwingTag x={candleCenterX(4)} y={DOWNTREND[4]!.h - 6} label="LH" color="#F7C325" />
            <SwingTag x={candleCenterX(9)} y={DOWNTREND[9]!.h - 6} label="LH" color="#F7C325" />
            <text x="160" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">
              Lower highs + lower lows
            </text>
          </g>
        )}

        {tab === "side" && (
          <g>
            <CandleSeries data={SIDEWAYS} />
            <line x1="10" y1="82" x2="310" y2="82" stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
            <line x1="10" y1="136" x2="310" y2="136" stroke="#4ade80" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x="14" y="77" fill="#fca5a5" fontSize="10" fontWeight="700">
              Resistance
            </text>
            <text x="14" y="132" fill="#86efac" fontSize="10" fontWeight="700">
              Support
            </text>
            <text x="160" y="190" fill="#94a3b8" fontSize="10" textAnchor="middle">
              Price oscillates inside a range
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
