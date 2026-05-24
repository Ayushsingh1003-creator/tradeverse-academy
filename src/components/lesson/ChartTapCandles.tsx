"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";

type Props = {
  count?: number;
  correctIndex: number;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  highlightStyle?: "longLowerWick" | "shootingStar";
  showSupportZone?: boolean;
};

export function ChartTapCandles({
  count = 6,
  correctIndex,
  selectedIndex,
  onSelect,
  highlightStyle = "longLowerWick",
  showSupportZone = false,
}: Props) {
  const w = 360;
  const pad = 16;
  const cw = (w - pad * 2) / count;

  return (
    <svg viewBox={`0 0 ${w} 200`} className="mx-auto w-full max-w-md touch-manipulation">
      {showSupportZone ? (
        <g>
          <rect x={pad} y={150} width={w - pad * 2} height={16} fill="rgba(69,109,255,0.12)" />
          <line x1={pad} y1={158} x2={w - pad} y2={158} stroke="#456DFF" strokeWidth="2" strokeDasharray="6 5" />
          <text x={w - pad - 4} y={147} textAnchor="end" fill="#88C9F7" fontSize="10" fontWeight="700">
            SUPPORT ZONE
          </text>
        </g>
      ) : null}
      {Array.from({ length: count }).map((_, i) => {
        const x = pad + i * cw;
        const mid = x + cw / 2;
        const isCorrect = i === correctIndex;
        const isLongLower = highlightStyle === "longLowerWick" && isCorrect;
        const isShoot = highlightStyle === "shootingStar" && isCorrect;
        const bodyH = isLongLower ? 14 : isShoot ? 12 : 22;
        const bodyY = isLongLower ? 95 : isShoot ? 125 : 80 + (i % 3) * 8;
        const upWick = isShoot ? 35 : isLongLower ? 8 : 12 + (i % 2) * 4;
        const lowWick = isLongLower ? 55 : isShoot ? 10 : 15;
        const up = i % 2 === 0;
        const sel = selectedIndex === i;
        const bodyBottom = bodyY + bodyH;
        const ohlc: OhlcPixels = up
          ? { o: bodyBottom, c: bodyY, h: bodyY - upWick, l: bodyBottom + lowWick }
          : { o: bodyY, c: bodyBottom, h: bodyY - upWick, l: bodyBottom + lowWick };
        return (
          <g
            key={i}
            role="button"
            tabIndex={0}
            className="cursor-pointer"
            onClick={() => onSelect(i)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(i)}
          >
            <rect x={x + 2} y={40} width={cw - 4} height={160} fill="transparent" />
            <CandlestickSvg
              cx={mid}
              bodyWidth={18}
              ohlc={ohlc}
              wickWidth={2}
              bodyRx={2}
              stroke={sel ? "#F7C325" : undefined}
              strokeWidth={sel ? 3 : 0}
            />
          </g>
        );
      })}
    </svg>
  );
}
