"use client";

import { useCallback, useRef, useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { BRACKET_CHART_CANDLES, BRACKET_DRAG_CANDLE, chartXPositions } from "@/components/lesson/chartMiniShared";
import type { OhlcPixels } from "@/lib/candleGeometry";
import { CANDLE_BULL } from "@/lib/candleColors";
import { RichText } from "@/components/ui/RichText";

const VB_W = 240;
const VB_H = 112;
const PLOT_PAD_X = 24;
const PLOT_WIDTH = 192;
const BODY_W = 10;
const PLOT_TOP = 4;
const PLOT_BOTTOM = 54;
const AXIS_Y = 68;
const LABEL_Y = 84;
const AXIS_TICK_LEN = 5;

const TIMES = ["15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
const X = chartXPositions(BRACKET_CHART_CANDLES.length, PLOT_PAD_X, PLOT_WIDTH);

function scalePixelCandles(candles: OhlcPixels[], top: number, bottom: number): OhlcPixels[] {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const c of candles) {
    minY = Math.min(minY, c.h);
    maxY = Math.max(maxY, c.l);
  }
  const span = maxY - minY || 1;
  const map = (y: number) => top + ((y - minY) / span) * (bottom - top);
  return candles.map((c) => ({ o: map(c.o), h: map(c.h), l: map(c.l), c: map(c.c) }));
}

const SCALED = scalePixelCandles([...BRACKET_CHART_CANDLES, BRACKET_DRAG_CANDLE], PLOT_TOP, PLOT_BOTTOM);
const SCALED_CHART = SCALED.slice(0, BRACKET_CHART_CANDLES.length);
const SCALED_DRAG = SCALED[BRACKET_CHART_CANDLES.length]!;

function stretchOhlcY(ohlc: OhlcPixels, factor: number): OhlcPixels {
  const cy = (ohlc.h + ohlc.l) / 2;
  const s = (y: number) => cy + (y - cy) * factor;
  return { o: s(ohlc.o), h: s(ohlc.h), l: s(ohlc.l), c: s(ohlc.c) };
}

const SCALED_DRAG_TALL = stretchOhlcY(SCALED_DRAG, 2);

type Props = {
  correctCandleIndex: number;
  onCheckResult: (correct: boolean) => void;
  explanation?: string;
};

function HollowGreenCandle({ cx, ohlc }: { cx: number; ohlc: OhlcPixels }) {
  return (
    <CandlestickSvg
      cx={cx}
      bodyWidth={BODY_W}
      ohlc={ohlc}
      bodyFill="none"
      stroke={CANDLE_BULL}
      strokeWidth={1.5}
      wickWidth={1.5}
      bodyRx={2}
    />
  );
}

/** Single draggable token — 2× chart height, green hollow body. */
function DragToken({ className }: { className?: string }) {
  const ohlc = SCALED_DRAG_TALL;
  const pad = 6;
  const vbTop = ohlc.h - 4;
  const vbBottom = ohlc.l + 4;
  return (
    <svg
      viewBox={`${-pad} ${vbTop} ${BODY_W + pad * 2} ${vbBottom - vbTop}`}
      className={className}
      aria-hidden
    >
      <HollowGreenCandle cx={BODY_W / 2} ohlc={ohlc} />
    </svg>
  );
}

/** Drag a 1H candle onto the bar that spans one hour on the time axis. */
export function TimeBracketDragQuestion({ correctCandleIndex, onCheckResult, explanation }: Props) {
  const [slot, setSlot] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [dragging, setDragging] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);

  const findCol = useCallback((clientX: number, clientY: number) => {
    for (let i = 0; i < BRACKET_CHART_CANDLES.length; i++) {
      const el = colRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top - 48 && clientY <= r.bottom + 48) return i;
    }
    return null;
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (checked) return;
    setDragging(true);
    setPointer({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || checked) return;
    setPointer({ x: e.clientX, y: e.clientY });
    const col = findCol(e.clientX, e.clientY);
    if (col != null) setSlot(col);
  };

  const onPointerUp = () => {
    setDragging(false);
    setPointer(null);
  };

  const handleCheck = () => {
    const ok = slot === correctCandleIndex;
    setChecked(true);
    setIsCorrect(ok);
    onCheckResult(ok);
  };

  const hitW = BODY_W + 10;

  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-surface2/40 p-4">
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-44 w-full" aria-hidden>
          {SCALED_CHART.map((ohlc, i) => {
            if (slot === i) return null;
            return (
              <CandlestickSvg
                key={`chart-${i}`}
                cx={X[i]!}
                bodyWidth={BODY_W}
                ohlc={ohlc}
                wickWidth={1.5}
                bodyRx={2}
              />
            );
          })}
          {slot != null ? <HollowGreenCandle cx={X[slot]!} ohlc={SCALED_DRAG} /> : null}
          <line
            x1={PLOT_PAD_X - 4}
            y1={AXIS_Y}
            x2={VB_W - PLOT_PAD_X + 4}
            y2={AXIS_Y}
            stroke="rgba(148,163,184,0.55)"
            strokeWidth="1.5"
          />
          {TIMES.map((t, i) => (
            <g key={t}>
              <line
                x1={X[i]}
                y1={AXIS_Y - AXIS_TICK_LEN / 2}
                x2={X[i]}
                y2={AXIS_Y + AXIS_TICK_LEN / 2}
                stroke="rgba(148,163,184,0.7)"
                strokeWidth="1"
              />
              <text x={X[i]} y={LABEL_Y} textAnchor="middle" fill="#94a3b8" fontSize="9">
                {t}
              </text>
            </g>
          ))}
        </svg>
        {BRACKET_CHART_CANDLES.map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              colRefs.current[i] = el;
            }}
            className="absolute"
            style={{
              left: `${((X[i]! - hitW / 2) / VB_W) * 100}%`,
              top: "8%",
              width: `${(hitW / VB_W) * 100}%`,
              height: "68%",
            }}
          />
        ))}
      </div>

      <div className="flex justify-center">
        <div
          role="button"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`cursor-grab touch-none active:cursor-grabbing ${
            dragging ? "scale-105 opacity-90" : ""
          } ${checked ? "pointer-events-none opacity-50" : ""}`}
          aria-label="1-hour candle"
        >
          <DragToken className="h-[112px] w-[22px] drop-shadow-md" />
        </div>
      </div>

      {dragging && pointer ? (
        <div
          className="pointer-events-none fixed z-50 drop-shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -50%)" }}
        >
          <DragToken className="h-[104px] w-[20px]" />
        </div>
      ) : null}

      {!checked ? (
        <button
          type="button"
          disabled={slot == null}
          onClick={handleCheck}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
        >
          Check placement
        </button>
      ) : isCorrect != null ? (
        <div
          className={`rounded-2xl border p-4 text-sm leading-relaxed animate-slide-up-fade ${
            isCorrect
              ? "border-[#456DFF]/50 bg-[rgba(69,109,255,0.12)]"
              : "border-red-400/50 bg-red-500/10"
          }`}
        >
          <p className={`mb-1 font-semibold ${isCorrect ? "text-[#88C9F7]" : "text-red-300"}`}>
            {isCorrect ? "Correct!" : "Wrong!"}
          </p>
          {explanation ? (
            <p className="text-text-muted">
              <RichText text={explanation} />
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
