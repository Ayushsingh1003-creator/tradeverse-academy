"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";

/** A–D options for 1H → 4H fold MCQ (matches reference layout). */
export const FOUR_H_FOLD_OPTIONS: OhlcPixels[] = [
  { o: 44, h: 10, l: 64, c: 24 },
  { o: 54, h: 10, l: 88, c: 24 },
  { o: 24, h: 10, l: 88, c: 54 },
  { o: 44, h: 16, l: 88, c: 24 },
];

const LABELS = ["A", "B", "C", "D"] as const;
const VB_W = 56;
const VB_H = 96;
const GRID_LINES = [12, 24, 36, 48, 60, 72, 84];

function OptionCandle({ ohlc }: { ohlc: OhlcPixels }) {
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="mx-auto h-24 w-full max-w-[72px]" aria-hidden>
      {GRID_LINES.map((y) => (
        <line
          key={y}
          x1={4}
          y1={y}
          x2={VB_W - 4}
          y2={y}
          stroke="rgba(148,163,184,0.22)"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
      ))}
      <CandlestickSvg cx={VB_W / 2} bodyWidth={14} ohlc={ohlc} wickWidth={1.5} bodyRx={2} />
    </svg>
  );
}

type Props = {
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  disabled?: boolean;
  checked?: boolean;
  correctIndex?: number;
};

/** Pick the 4H candle that matches the folded 1H Open / High / Low / Close. */
export function FourHourFoldChoiceGrid({
  selectedIndex,
  onSelect,
  disabled,
  checked = false,
  correctIndex = 2,
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {FOUR_H_FOLD_OPTIONS.map((ohlc, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const correctPick = checked && sel && isCorrect;
        const wrongPick = checked && sel && !isCorrect;
        const revealCorrect = checked && isCorrect && !sel;
        return (
          <button
            key={LABELS[i]}
            type="button"
            disabled={disabled}
            aria-label={`Option ${LABELS[i]}`}
            onClick={() => onSelect(i)}
            className={`relative flex flex-col items-center rounded-xl border-2 px-1.5 pb-2 pt-2 transition-all ${
              sel && !checked
                ? "border-[#456DFF] bg-[rgba(69,109,255,0.10)] ring-2 ring-[#456DFF]/30"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            } ${correctPick ? "animate-correct-pulse border-[#456DFF]" : ""} ${
              wrongPick ? "animate-wrong-shake border-red-400" : ""
            } ${revealCorrect ? "border-[#456DFF]/70" : ""} ${
              checked && !isCorrect && !sel ? "opacity-40" : ""
            }`}
          >
            <OptionCandle ohlc={ohlc} />
            <span className="text-sm font-semibold text-[#88C9F7]">{LABELS[i]}</span>
            {correctPick ? (
              <span className="absolute right-1 top-1 text-xs text-[#88C9F7]" aria-hidden>
                ✓
              </span>
            ) : null}
            {wrongPick ? (
              <span className="absolute right-1 top-1 text-xs text-red-300" aria-hidden>
                ✗
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
