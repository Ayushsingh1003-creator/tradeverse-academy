"use client";

import { CandleSeriesSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";
import type { TapChoiceDiagram } from "@/types/lessonPage";

const FOLD_CANDLES: OhlcPixels[] = [
  { o: 72, h: 58, l: 88, c: 82 },
  { o: 82, h: 48, l: 86, c: 68 },
  { o: 68, h: 62, l: 98, c: 88 },
  { o: 88, h: 78, l: 92, c: 76 },
];

const FOLD_POINTS = [
  { id: 0, cx: 18, cy: 72, label: "①" },
  { id: 1, cx: 42, cy: 48, label: "②" },
  { id: 2, cx: 66, cy: 98, label: "③" },
  { id: 3, cx: 90, cy: 76, label: "④" },
];

function tapBtnClass(opts: { sel: boolean; checked: boolean; correct: boolean; wrong: boolean; reveal: boolean; dim: boolean }) {
  const { sel, checked, correct, wrong, reveal, dim } = opts;
  return `relative flex items-center justify-center rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] ${
    sel && !checked
      ? "border-[#456DFF] bg-[rgba(69,109,255,0.12)] ring-2 ring-[#456DFF]/30"
      : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
  } ${correct ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.18)]" : ""} ${
    wrong ? "animate-wrong-shake border-red-400 bg-red-500/15" : ""
  } ${reveal ? "border-[#456DFF]/70 bg-[rgba(69,109,255,0.10)]" : ""} ${dim ? "opacity-35" : ""}`;
}

type OptionProps = {
  selectedIndex: number | null;
  checked: boolean;
  correctIndex: number;
  onSelect: (i: number) => void;
  disabled?: boolean;
};

function TimeframeCodes({ codes, selectedIndex, checked, correctIndex, onSelect, disabled }: OptionProps & { codes: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {codes.map((code, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const correctPick = checked && sel && isCorrect;
        const wrongPick = checked && sel && !isCorrect;
        const reveal = checked && isCorrect && !sel;
        const dim = checked && !isCorrect && !sel;
        return (
          <button
            key={code}
            type="button"
            disabled={disabled}
            aria-label={code}
            onClick={() => onSelect(i)}
            className={`${tapBtnClass({ sel, checked, correct: correctPick, wrong: wrongPick, reveal, dim })} min-h-[88px] px-2 py-4`}
          >
            <span className="text-2xl font-bold tracking-wider text-[#88C9F7] sm:text-3xl">{code}</span>
            {correctPick ? <span className="absolute right-2 top-2 text-lg text-[#88C9F7]">✓</span> : null}
            {wrongPick ? <span className="absolute right-2 top-2 text-lg text-red-300">✗</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function DurationClocks({ minutes, selectedIndex, checked, correctIndex, onSelect, disabled }: OptionProps & { minutes: number[] }) {
  const max = Math.max(...minutes);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {minutes.map((m, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const correctPick = checked && sel && isCorrect;
        const wrongPick = checked && sel && !isCorrect;
        const reveal = checked && isCorrect && !sel;
        const dim = checked && !isCorrect && !sel;
        const pct = Math.max(12, Math.round((m / max) * 100));
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            aria-label={`Duration option ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`${tapBtnClass({ sel, checked, correct: correctPick, wrong: wrongPick, reveal, dim })} min-h-[100px] p-3`}
          >
            <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden>
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="#456DFF"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(pct / 100) * 126} 126`}
                transform="rotate(-90 24 24)"
              />
              <line x1="24" y1="24" x2="24" y2="10" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {correctPick ? <span className="absolute right-2 top-2 text-lg text-[#88C9F7]">✓</span> : null}
            {wrongPick ? <span className="absolute right-2 top-2 text-lg text-red-300">✗</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function DateScopePick({ selectedIndex, checked, correctIndex, onSelect, disabled }: OptionProps) {
  const modes: Array<{ mode: string; days: boolean[] }> = [
    { mode: "range", days: [true, true, true, true] },
    { mode: "single", days: [false, false, false, true] },
    { mode: "none", days: [false, false, false, false] },
  ];
  return (
    <div className="mx-auto grid max-w-xs grid-cols-3 gap-3">
      {modes.map((m, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const correctPick = checked && sel && isCorrect;
        const wrongPick = checked && sel && !isCorrect;
        const reveal = checked && isCorrect && !sel;
        const dim = checked && !isCorrect && !sel;
        return (
          <button
            key={m.mode}
            type="button"
            disabled={disabled}
            aria-label={`Calendar option ${i + 1}`}
            onClick={() => onSelect(i)}
            className={`${tapBtnClass({ sel, checked, correct: correctPick, wrong: wrongPick, reveal, dim })} min-h-[96px] px-2 py-3`}
          >
            <div className={`flex gap-0.5 ${m.mode === "none" ? "opacity-40" : ""}`}>
              {m.days.map((on, d) => (
                <div
                  key={d}
                  className={`h-9 w-5 rounded-sm border ${on ? "border-accent bg-accent/30" : "border-white/10 bg-white/5"}`}
                />
              ))}
            </div>
            {correctPick ? <span className="absolute right-1 top-1 text-sm text-[#88C9F7]">✓</span> : null}
            {wrongPick ? <span className="absolute right-1 top-1 text-sm text-red-300">✗</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function FoldPointPick({ selectedIndex, checked, correctIndex, onSelect, disabled }: OptionProps) {
  return (
    <div className="mx-auto max-w-xs">
      <svg viewBox="0 0 120 110" className="h-44 w-full touch-manipulation" aria-hidden>
        <CandleSeriesSvg candles={FOLD_CANDLES} xAt={(i) => 18 + i * 24} bodyWidth={10} wickWidth={1.5} bodyRx={1} />
        {FOLD_POINTS.map((pt) => {
          const sel = selectedIndex === pt.id;
          const isCorrect = pt.id === correctIndex;
          const showResult = checked;
          const fill = showResult
            ? isCorrect
              ? "#456DFF"
              : sel
                ? "#f87171"
                : "rgba(148,163,184,0.35)"
            : sel
              ? "#456DFF"
              : "rgba(247,195,37,0.85)";
          return (
            <g
              key={pt.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => !disabled && onSelect(pt.id)}
              onKeyDown={(e) => e.key === "Enter" && !disabled && onSelect(pt.id)}
            >
              <circle cx={pt.cx} cy={pt.cy} r={sel ? 9 : 7} fill={fill} stroke="#0f172a" strokeWidth="1.5" />
              <text x={pt.cx} y={pt.cy + 3} textAnchor="middle" fill="#0f172a" fontSize="7" fontWeight="700">
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type Props = OptionProps & {
  diagram: TapChoiceDiagram;
};

/** Visual-only tap options — no text labels on choices. */
export function ChartReadingTapQuestion({ diagram, selectedIndex, checked, correctIndex, onSelect, disabled }: Props) {
  switch (diagram.kind) {
    case "timeframe_codes":
      return (
        <TimeframeCodes
          codes={[...diagram.codes]}
          selectedIndex={selectedIndex}
          checked={checked}
          correctIndex={correctIndex}
          onSelect={onSelect}
          disabled={disabled}
        />
      );
    case "duration_clocks":
      return (
        <DurationClocks
          minutes={[...diagram.minutes]}
          selectedIndex={selectedIndex}
          checked={checked}
          correctIndex={correctIndex}
          onSelect={onSelect}
          disabled={disabled}
        />
      );
    case "date_scope":
      return (
        <DateScopePick
          selectedIndex={selectedIndex}
          checked={checked}
          correctIndex={correctIndex}
          onSelect={onSelect}
          disabled={disabled}
        />
      );
    case "fold_point":
      return (
        <FoldPointPick
          selectedIndex={selectedIndex}
          checked={checked}
          correctIndex={correctIndex}
          onSelect={onSelect}
          disabled={disabled}
        />
      );
    default:
      return null;
  }
}
