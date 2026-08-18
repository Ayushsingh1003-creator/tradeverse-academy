"use client";

import { CandleSeriesSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";
import type { ChartCompareVariant } from "@/types/lessonPage";
import { COMPARE_CANDLES, COMPARE_TIME_LABELS, chartXPositions } from "@/components/lesson/chartMiniShared";

const VB_W = 172;
const VB_H = 102;
const PLOT_PAD_X = 16;
const PLOT_WIDTH = VB_W - PLOT_PAD_X * 2;
const CHART_TOP = 10;
const CHART_BOTTOM = 58;
const AXIS_Y = 68;
const LABEL_Y = 84;
const AXIS_TICK_LEN = 5;
const BODY_W = 12;

const X = chartXPositions(COMPARE_CANDLES.length, PLOT_PAD_X, PLOT_WIDTH);

function scaleCandlesToPlot(candles: OhlcPixels[], top: number, bottom: number): OhlcPixels[] {
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

const DISPLAY_CANDLES = scaleCandlesToPlot(COMPARE_CANDLES, CHART_TOP, CHART_BOTTOM);

function MiniChart({
  axis,
  selected,
  checked,
  correct,
  onSelect,
  disabled,
}: {
  axis: ChartCompareVariant;
  selected: boolean;
  checked: boolean;
  correct: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const labels = COMPARE_TIME_LABELS[axis];
  const correctPick = checked && selected && correct;
  const wrongPick = checked && selected && !correct;
  const reveal = checked && correct && !selected;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Chart with ${axis} time axis`}
      onClick={onSelect}
      className={`relative overflow-hidden rounded-xl border-2 p-3 transition-all active:scale-[0.98] ${
        selected && !checked
          ? "border-[#456DFF] bg-[rgba(69,109,255,0.10)] ring-2 ring-[#456DFF]/30"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      } ${correctPick ? "animate-correct-pulse border-[#456DFF]" : ""} ${
        wrongPick ? "animate-wrong-shake border-red-400" : ""
      } ${reveal ? "border-[#456DFF]/70" : ""} ${checked && !correct && !selected ? "opacity-35" : ""}`}
    >
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="h-32 w-full" aria-hidden>
        <CandleSeriesSvg
          candles={DISPLAY_CANDLES}
          xAt={(i) => X[i]! - BODY_W / 2}
          bodyWidth={BODY_W}
          wickWidth={1.5}
          bodyRx={2}
        />
        <line
          x1={PLOT_PAD_X - 4}
          y1={AXIS_Y}
          x2={VB_W - PLOT_PAD_X + 4}
          y2={AXIS_Y}
          stroke="rgba(148,163,184,0.55)"
          strokeWidth="1.5"
        />
        {labels.map((label, i) => (
          <g key={`${axis}-${label}-${i}`}>
            <line
              x1={X[i]}
              y1={AXIS_Y - AXIS_TICK_LEN / 2}
              x2={X[i]}
              y2={AXIS_Y + AXIS_TICK_LEN / 2}
              stroke="rgba(148,163,184,0.7)"
              strokeWidth="1"
            />
            <text
              x={X[i]}
              y={LABEL_Y}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="6.5"
              fontWeight="500"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      {correctPick ? <span className="absolute right-1 top-1 text-sm text-[#88C9F7]">✓</span> : null}
      {wrongPick ? <span className="absolute right-1 top-1 text-sm text-red-300">✗</span> : null}
    </button>
  );
}

type Props = {
  variants: ChartCompareVariant[];
  selectedIndex: number | null;
  checked: boolean;
  correctIndex: number;
  onSelect: (i: number) => void;
  disabled?: boolean;
};

/** Same candles in every option — pick by reading the time axis labels. */
export function ChartCompareQuestion({ variants, selectedIndex, checked, correctIndex, onSelect, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 md:gap-5">
      {variants.map((v, i) => (
        <MiniChart
          key={`${v}-${i}`}
          axis={v}
          selected={selectedIndex === i}
          checked={checked}
          correct={i === correctIndex}
          onSelect={() => onSelect(i)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
