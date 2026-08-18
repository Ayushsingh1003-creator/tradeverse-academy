"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";
import type { CandleChoicePreset, VisualChoiceOption } from "@/types/lessonPage";

const PRESET_OHLC: Record<CandleChoicePreset, (typeof TEACHING_CANDLES)[keyof typeof TEACHING_CANDLES]> = {
  bullish: TEACHING_CANDLES.choiceBullish,
  bearish: TEACHING_CANDLES.choiceBearish,
  doji: TEACHING_CANDLES.choiceDoji,
  hammer: TEACHING_CANDLES.choiceHammer,
  shootingStar: TEACHING_CANDLES.choiceShootingStar,
  marubozuBull: TEACHING_CANDLES.choiceMarubozuBull,
  marubozuBear: TEACHING_CANDLES.choiceMarubozuBear,
};

type Props = {
  options: VisualChoiceOption[];
  selectedIndex: number | null;
  checked: boolean;
  correctIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function VisualChoiceGrid({ options, selectedIndex, checked, correctIndex, onSelect, className = "" }: Props) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      {options.map((opt, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const showResult = checked;
        const correctPick = showResult && sel && isCorrect;
        const wrongPick = showResult && sel && !isCorrect;
        const revealCorrect = showResult && isCorrect && !sel;
        const hasLabels = options.some((o) => o.label);

        return (
          <button
            key={i}
            type="button"
            disabled={checked}
            onClick={() => onSelect(i)}
            className={`group relative flex min-h-[148px] flex-col items-center rounded-2xl border-2 px-3 pb-3 pt-4 transition-all duration-150 active:scale-[0.98] ${
              hasLabels ? "justify-between" : "justify-center"
            } ${
              sel && !showResult
                ? "border-[#456DFF] bg-[rgba(69,109,255,0.12)] ring-2 ring-[#456DFF]/30"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            } ${correctPick ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.18)]" : ""} ${
              wrongPick ? "animate-wrong-shake border-red-400 bg-red-500/15" : ""
            } ${revealCorrect ? "border-[#456DFF]/70 bg-[rgba(69,109,255,0.10)]" : ""} ${
              showResult && !isCorrect && !sel ? "opacity-40" : ""
            }`}
          >
            <svg viewBox="0 0 120 180" className="h-[100px] w-[72px] shrink-0" aria-hidden>
              <CandlestickSvg cx={60} bodyWidth={36} ohlc={PRESET_OHLC[opt.preset]} wickWidth={2.5} bodyRx={4} />
            </svg>
            {opt.label ? (
              <span className="mt-2 text-center text-xs font-semibold leading-snug text-text-primary sm:text-sm">{opt.label}</span>
            ) : null}
            {correctPick ? (
              <span className="absolute right-2 top-2 text-lg text-[#88C9F7]" aria-hidden>
                ✓
              </span>
            ) : null}
            {wrongPick ? (
              <span className="absolute right-2 top-2 text-lg text-red-300" aria-hidden>
                ✗
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
