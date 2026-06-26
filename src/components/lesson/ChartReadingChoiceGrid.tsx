"use client";

import { CandleSeriesSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";
import type { UiChoiceCard, UiChoiceOption } from "@/types/lessonPage";

const FOLD_CANDLES: OhlcPixels[] = [
  { o: 72, h: 58, l: 88, c: 82 },
  { o: 82, h: 48, l: 86, c: 68 },
  { o: 68, h: 62, l: 98, c: 88 },
  { o: 88, h: 78, l: 92, c: 76 },
];

type FoldSource = Extract<UiChoiceCard, { variant: "fold_source" }>["source"];

function foldHighlight(source: FoldSource): { candle: number; y: number; color: string } | null {
  switch (source) {
    case "first_open":
      return { candle: 0, y: 72, color: "#F7C325" };
    case "last_close":
      return { candle: 3, y: 76, color: "#88C9F7" };
    case "high_wick":
      return { candle: 1, y: 48, color: "#88C9F7" };
    case "low_wick":
      return { candle: 2, y: 98, color: "#F7C325" };
    case "first_only":
      return { candle: 0, y: 75, color: "#F7C325" };
    case "middle":
      return { candle: 1, y: 68, color: "#88C9F7" };
    case "avg":
      return null;
    default:
      return null;
  }
}

function FoldSourceVisual({ source }: { source: FoldSource }) {
  const hl = foldHighlight(source);
  const xAt = (i: number) => 14 + i * 22;

  return (
    <svg viewBox="0 0 100 56" className="h-14 w-full" aria-hidden>
      <CandleSeriesSvg candles={FOLD_CANDLES} xAt={xAt} bodyWidth={9} wickWidth={1.2} bodyRx={1} />
      {source === "avg" ? (
        <>
          <line x1="8" y1="28" x2="92" y2="28" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="50" y="24" fill="#94a3b8" fontSize="7" textAnchor="middle">
            avg
          </text>
        </>
      ) : hl ? (
        <>
          {source === "first_only" || source === "middle" ? (
            <rect
              x={xAt(hl.candle) - 8}
              y="18"
              width="16"
              height="36"
              fill="none"
              stroke={hl.color}
              strokeWidth="1.5"
              rx="3"
            />
          ) : (
            <>
              <line
                x1={xAt(hl.candle) + 10}
                y1={hl.y}
                x2="96"
                y2={hl.y}
                stroke={hl.color}
                strokeWidth="1.2"
                strokeDasharray="3 2"
              />
              <circle cx={xAt(hl.candle)} cy={hl.y} r="3.5" fill={hl.color} />
            </>
          )}
        </>
      ) : null}
    </svg>
  );
}

function TimeframeVisual({ code, period }: { code: string; period: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="rounded-lg bg-[#88C9F7]/15 px-3 py-1.5 text-lg font-bold tracking-wide text-[#88C9F7]">{code}</span>
      <span className="text-xs text-text-muted">{period}</span>
    </div>
  );
}

function DurationVisual({ amount, unit }: { amount: string; unit: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl" aria-hidden>
        🕐
      </span>
      <div className="text-left">
        <p className="text-xl font-bold leading-none text-text-primary">{amount}</p>
        <p className="text-xs text-text-muted">{unit}</p>
      </div>
    </div>
  );
}

function DateScopeVisual({ mode, label }: { mode: "range" | "single" | "none"; label: string }) {
  const days = ["1", "4", "7", "10"];
  return (
    <div className="flex w-full flex-col items-center gap-1.5">
      <div className="flex gap-1">
        {days.map((d) => {
          const active =
            mode === "range" ? true : mode === "single" ? d === "10" : false;
          return (
            <div
              key={d}
              className={`flex h-8 w-7 flex-col items-center justify-center rounded-md border text-[10px] font-bold ${
                active
                  ? "border-accent bg-accent/20 text-accent"
                  : "border-white/10 bg-white/5 text-text-muted"
              } ${mode === "none" ? "opacity-40 line-through" : ""}`}
            >
              {d}
            </div>
          );
        })}
      </div>
      <span className="text-[10px] leading-tight text-text-muted">{label}</span>
    </div>
  );
}

function TimeframeBarVisual({ code, barPercent }: { code: string; barPercent: number }) {
  return (
    <div className="flex w-full flex-col items-center gap-2 px-1">
      <span className="text-sm font-bold text-[#88C9F7]">{code}</span>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-accent/70" style={{ width: `${barPercent}%` }} />
      </div>
    </div>
  );
}

function CardVisual({ card }: { card: UiChoiceCard }) {
  switch (card.variant) {
    case "timeframe":
      return <TimeframeVisual code={card.code} period={card.period} />;
    case "duration":
      return <DurationVisual amount={card.amount} unit={card.unit} />;
    case "fold_source":
      return <FoldSourceVisual source={card.source} />;
    case "date_scope":
      return <DateScopeVisual mode={card.mode} label={card.label} />;
    case "timeframe_bar":
      return <TimeframeBarVisual code={card.code} barPercent={card.barPercent} />;
    default:
      return null;
  }
}

type Props = {
  options: UiChoiceOption[];
  selectedIndex: number | null;
  checked: boolean;
  correctIndex: number;
  onSelect: (index: number) => void;
  columns?: 2 | 3 | 4;
};

export function ChartReadingChoiceGrid({
  options,
  selectedIndex,
  checked,
  correctIndex,
  onSelect,
  columns = 2,
}: Props) {
  const colClass =
    columns === 4 ? "grid-cols-2 sm:grid-cols-4" : columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";

  return (
    <div className={`grid gap-3 ${colClass}`}>
      {options.map((opt, i) => {
        const sel = selectedIndex === i;
        const isCorrect = i === correctIndex;
        const showResult = checked;
        const correctPick = showResult && sel && isCorrect;
        const wrongPick = showResult && sel && !isCorrect;
        const revealCorrect = showResult && isCorrect && !sel;

        return (
          <button
            key={i}
            type="button"
            disabled={checked}
            aria-label={opt.label}
            onClick={() => onSelect(i)}
            className={`group relative flex min-h-[120px] flex-col items-center justify-center rounded-2xl border-2 px-3 py-4 transition-all duration-150 active:scale-[0.98] ${
              sel && !showResult
                ? "border-[#456DFF] bg-[rgba(69,109,255,0.12)] ring-2 ring-[#456DFF]/30"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
            } ${correctPick ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.18)]" : ""} ${
              wrongPick ? "animate-wrong-shake border-red-400 bg-red-500/15" : ""
            } ${revealCorrect ? "border-[#456DFF]/70 bg-[rgba(69,109,255,0.10)]" : ""} ${
              showResult && !isCorrect && !sel ? "opacity-40" : ""
            }`}
          >
            <CardVisual card={opt.card} />
            <span className="mt-2 text-center text-[11px] font-medium leading-snug text-text-muted">{opt.label}</span>
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
