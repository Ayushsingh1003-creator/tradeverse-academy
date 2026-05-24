"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { CANDLE_BEAR, CANDLE_BULL } from "@/lib/candleColors";

import { useRef, useState } from "react";

const bounceXs = [40, 100, 160];
const SUPPORT_Y = 195;
const SNAP_TOLERANCE = 10;

export function SupportResistanceMap() {
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dotYs, setDotYs] = useState<number[]>([170, 150, 130]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const moveDot = (clientY: number) => {
    if (dragging == null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxHeight = 260;
    const y = ((clientY - rect.top) / rect.height) * viewBoxHeight;
    const clamped = Math.max(40, Math.min(225, y));
    const snapped = Math.abs(clamped - SUPPORT_Y) <= SNAP_TOLERANCE ? SUPPORT_Y : clamped;
    setDotYs((prev) => {
      const next = [...prev];
      next[dragging] = snapped;
      return next;
    });
  };

  const placedCount = dotYs.filter((y) => Math.abs(y - SUPPORT_Y) <= 1).length;

  return (
    <div className="mx-auto max-w-md">
      <svg
        ref={svgRef}
        viewBox="0 0 400 260"
        className="w-full"
        onPointerMove={(e) => moveDot(e.clientY)}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((i) => {
          const x = 20 + i * 24;
          const highs = [80, 90, 85, 95, 88, 92, 86, 84, 82, 80, 78, 76, 74, 72, 70];
          const o = i === 0 ? 95 : highs[i - 1]! + 5;
          const c = highs[i]!;
          const top = Math.min(o, c);
          const bodyH = Math.abs(c - o) || 6;
          const ohlc = { o, c, h: top - 15, l: top + bodyH + 15 };
          return (
            <CandlestickSvg
              key={i}
              cx={x + 10}
              bodyWidth={20}
              ohlc={ohlc}
              wickStroke="#64748b"
              wickWidth={2}
            />
          );
        })}
        <line x1="20" y1="195" x2="380" y2="195" stroke="#456DFF" strokeWidth="2" strokeDasharray="8 6" opacity="0.9" />
        <text x="220" y="188" fill="#4ade80" fontSize="11">
          SUPPORT
        </text>
        <line x1="20" y1="55" x2="380" y2="55" stroke="#f87171" strokeWidth="2" strokeDasharray="8 6" opacity="0.7" />
        <text x="240" y="48" fill="#fca5a5" fontSize="11">
          RESISTANCE
        </text>
        {bounceXs.map((bx, idx) => (
          <circle
            key={bx}
            cx={bx + 10}
            cy={dotYs[idx]}
            r="8"
            fill={hover === idx ? "#F7C325" : Math.abs(dotYs[idx]! - SUPPORT_Y) <= 1 ? CANDLE_BULL : CANDLE_BEAR}
            className="cursor-grab touch-none transition-all active:cursor-grabbing"
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(null)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(idx);
              moveDot(e.clientY);
            }}
          />
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-text-muted">
        {placedCount === bounceXs.length
          ? "Great! All bounce points are aligned on support."
          : hover != null
            ? `Bounce #${hover + 1} — drag it onto support.`
            : "Drag the dots onto the support line."}
      </p>
    </div>
  );
}
