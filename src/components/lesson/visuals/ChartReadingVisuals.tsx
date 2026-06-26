"use client";

import { useMemo, useState } from "react";
import { CandleSeriesSvg, CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { chartXPositions } from "@/components/lesson/chartMiniShared";
import { bodyWidthForCount, ohlcBarsToPixels } from "@/lib/ohlcToPixels";
import type { OhlcPixels } from "@/lib/candleGeometry";
import {
  formatBarLabel,
  previewBarsForTimeframe,
  type TimeframeCode,
} from "@/lib/timeframeOhlcData";
import { RichText } from "@/components/ui/RichText";

const TIMEFRAMES = [
  { abbr: "M1", label: "1 minute" },
  { abbr: "M5", label: "5 minutes" },
  { abbr: "M15", label: "15 minutes" },
  { abbr: "M30", label: "30 minutes" },
  { abbr: "H1", label: "1 hour" },
  { abbr: "H4", label: "4 hours" },
  { abbr: "D1", label: "1 day" },
  { abbr: "W1", label: "1 week" },
  { abbr: "MN", label: "1 month" },
] as const satisfies ReadonlyArray<{ abbr: TimeframeCode; label: string }>;

const CHART_VB = { w: 260, h: 145 };
const AXIS_Y = 114;
const LABEL_Y = 130;
const AXIS_TICK_LEN = 5;
const CHART_TOP = 12;
const CHART_BOTTOM = 102;
const PLOT_PAD_X = 24;
const PLOT_WIDTH = CHART_VB.w - PLOT_PAD_X * 2;
const CANDLE_WIDTH_SCALE = 0.5;
const AXIS_LABEL_SIZE = 6.5;

/** Tap a timeframe row — chart preview updates from aggregated 2-month M1 OHLC data. */
export function TimeframeTable() {
  const [active, setActive] = useState(0);

  const tf = TIMEFRAMES[active]!;
  const { bars, pixels, labels, bodyWidth } = useMemo(() => {
    const sourceBars = previewBarsForTimeframe(tf.abbr);
    return {
      bars: sourceBars,
      pixels: ohlcBarsToPixels(sourceBars, CHART_TOP, CHART_BOTTOM),
      labels: sourceBars.map((b) => formatBarLabel(b.t, tf.abbr)),
      bodyWidth: bodyWidthForCount(PLOT_WIDTH, sourceBars.length) * CANDLE_WIDTH_SCALE,
    };
  }, [tf.abbr]);

  const xs = chartXPositions(bars.length, PLOT_PAD_X, PLOT_WIDTH);

  return (
    <div className="w-full">
      <div className="space-y-1 text-[1.05rem] leading-snug text-text-muted md:text-[1.1rem]">
        <p>
          <RichText text="There are plenty of different **time frames** you can find on any trading platform." />
        </p>
        <p>
          <RichText text="The time frame you select determines what **each candlestick represents**." />
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 items-stretch gap-3 md:mt-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-4">
        <div className="rounded-xl border border-border bg-surface2/50 p-2">
          <div className="mb-1 grid grid-cols-2 gap-2 border-b border-border pb-1 text-xs font-bold uppercase tracking-wide text-text-muted">
            <span>Code</span>
            <span>Period</span>
          </div>
          <div className="space-y-0.5">
            {TIMEFRAMES.map((row, i) => (
              <button
                key={row.abbr}
                type="button"
                onClick={() => setActive(i)}
                className={`grid w-full grid-cols-2 gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                  active === i ? "bg-accent/20 text-accent ring-1 ring-accent/40" : "text-text-primary hover:bg-white/5"
                }`}
              >
                <span className="font-bold text-[#88C9F7]">{row.abbr}</span>
                <span className="text-text-muted">{row.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface2/40 p-2.5 md:p-3">
          <p className="mb-1.5 text-center text-xs font-semibold text-[#88C9F7] md:text-sm">
            {tf.abbr} — each candle = {tf.label}
          </p>
          <svg
            viewBox={`0 0 ${CHART_VB.w} ${CHART_VB.h}`}
            className="min-h-[200px] w-full flex-1 md:min-h-[220px]"
            aria-hidden
          >
            <CandleSeriesSvg
              candles={pixels}
              xAt={(i) => xs[i]! - bodyWidth / 2}
              bodyWidth={bodyWidth}
              wickWidth={1}
              bodyRx={2}
            />
            <line
              x1="12"
              y1={AXIS_Y}
              x2={CHART_VB.w - 12}
              y2={AXIS_Y}
              stroke="rgba(148,163,184,0.55)"
              strokeWidth="1.5"
            />
            {labels.map((label, i) => (
              <g key={`${tf.abbr}-${label}-${i}`}>
                <line
                  x1={xs[i]}
                  y1={AXIS_Y - AXIS_TICK_LEN / 2}
                  x2={xs[i]}
                  y2={AXIS_Y + AXIS_TICK_LEN / 2}
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth="1"
                />
                <text
                  x={xs[i]}
                  y={LABEL_Y}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize={AXIS_LABEL_SIZE}
                  fontWeight="500"
                >
                  {label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Simple chart with price (Y) and time (X) axes — kept for reuse elsewhere */
export function ChartAxesExplainer() {
  const candles: OhlcPixels[] = [
    { o: 130, h: 115, l: 135, c: 120 },
    { o: 120, h: 100, l: 125, c: 110 },
    { o: 110, h: 95, l: 118, c: 105 },
    { o: 105, h: 90, l: 112, c: 95 },
    { o: 95, h: 80, l: 100, c: 85 },
  ];

  return (
    <div className="mx-auto max-w-sm">
      <svg viewBox="0 0 280 200" className="h-48 w-full">
        <line x1="44" y1="20" x2="44" y2="170" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowUp)" />
        <text x="28" y="24" fill="#94a3b8" fontSize="14" fontWeight="700">
          $
        </text>
        <text x="8" y="100" fill="#64748b" fontSize="9" transform="rotate(-90 8 100)">
          Price
        </text>
        <line x1="44" y1="170" x2="260" y2="170" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowRight)" />
        <text x="248" y="188" fill="#94a3b8" fontSize="12">
          🕐
        </text>
        <text x="130" y="188" fill="#64748b" fontSize="9">
          Time
        </text>
        <CandleSeriesSvg candles={candles} xAt={(i) => 70 + i * 36} bodyWidth={18} wickWidth={2} />
        <defs>
          <marker id="arrowUp" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,6 L3,0 L6,6" fill="#64748b" />
          </marker>
          <marker id="arrowRight" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill="#64748b" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

type FoldStep = "overview" | "open" | "high" | "low" | "close";

/** Four 1H candles folding into one 4H candle — step through OHLC mapping */
export function CandleFoldExplainer() {
  const [step, setStep] = useState<FoldStep>("overview");

  const h1: OhlcPixels[] = [
    { o: 72, h: 58, l: 88, c: 82 },
    { o: 82, h: 48, l: 86, c: 68 },
    { o: 68, h: 62, l: 98, c: 88 },
    { o: 88, h: 78, l: 92, c: 76 },
  ];

  const folded: OhlcPixels = { o: 72, h: 48, l: 98, c: 76 };

  const steps: FoldStep[] = ["overview", "open", "high", "low", "close"];
  const stepLabels: Record<FoldStep, string> = {
    overview: "Four 1H candles → one 4H candle",
    open: "OPEN = first candle's open",
    high: "HIGH = highest wick in the set",
    low: "LOW = lowest wick in the set",
    close: "CLOSE = last candle's close",
  };

  const line = (y: number, color: string, show: boolean) =>
    show ? (
      <line x1="118" y1={y} x2="168" y2={y} stroke={color} strokeWidth="2" strokeDasharray="5 4" opacity={0.95} />
    ) : null;

  const anchorY = {
    open: 72,
    high: 48,
    low: 98,
    close: 76,
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <svg viewBox="0 0 220 130" className="mx-auto h-40 w-full max-w-xs">
        <CandleSeriesSvg candles={h1} xAt={(i) => 18 + i * 24} bodyWidth={10} wickWidth={1.5} bodyRx={1} />
        <text x="108" y="68" fill="#64748b" fontSize="14">
          →
        </text>
        <CandlestickSvg cx={188} bodyWidth={22} ohlc={folded} wickWidth={2} bodyRx={2} />
        {line(anchorY.open, "#F7C325", step === "open")}
        {line(anchorY.high, "#88C9F7", step === "high")}
        {line(anchorY.low, "#F7C325", step === "low")}
        {line(anchorY.close, "#88C9F7", step === "close")}
        {step !== "overview" ? (
          <text x="142" y={anchorY[step as keyof typeof anchorY] + 3} fill="#F7C325" fontSize="8" fontWeight="700">
            {step.toUpperCase()}
          </text>
        ) : null}
      </svg>
      <p className="text-center text-sm font-medium text-text-primary">{stepLabels[step]}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
              step === s ? "bg-accent text-slate-900" : "border border-border bg-surface2 text-text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 5M→15M fold — source candles + four visual result options (no text labels). */
export function FifteenMinChoiceGrid({
  selectedIndex,
  onSelect,
  disabled,
  checked = false,
  correctIndex = 0,
}: {
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  disabled?: boolean;
  checked?: boolean;
  correctIndex?: number;
}) {
  const source: OhlcPixels[] = [
    { o: 92, h: 78, l: 96, c: 84 },
    { o: 84, h: 82, l: 108, c: 98 },
    { o: 98, h: 88, l: 102, c: 80 },
  ];
  const options: OhlcPixels[] = [
    { o: 95, h: 78, l: 98, c: 82 },
    { o: 100, h: 72, l: 108, c: 80 },
    { o: 88, h: 80, l: 92, c: 96 },
    { o: 92, h: 85, l: 105, c: 86 },
  ];

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <div className="rounded-xl border border-border bg-surface2/40 px-3 py-3">
        <svg viewBox="0 0 120 70" className="mx-auto h-16 w-full max-w-[200px]" aria-hidden>
          <CandleSeriesSvg candles={source} xAt={(i) => 18 + i * 32} bodyWidth={14} wickWidth={1.5} bodyRx={2} />
          <text x="108" y="38" fill="#64748b" fontSize="14">
            →
          </text>
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {options.map((ohlc, i) => {
          const sel = selectedIndex === i;
          const isCorrect = i === correctIndex;
          const correctPick = checked && sel && isCorrect;
          const wrongPick = checked && sel && !isCorrect;
          const revealCorrect = checked && isCorrect && !sel;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              aria-label={`Candle option ${i + 1}`}
              onClick={() => onSelect(i)}
              className={`relative flex flex-col items-center rounded-xl border-2 p-1.5 transition-all ${
                sel && !checked
                  ? "border-accent bg-accent/15 ring-2 ring-accent/30"
                  : "border-border bg-surface2 hover:border-accent/50"
              } ${correctPick ? "animate-correct-pulse border-[#456DFF] bg-[rgba(69,109,255,0.18)]" : ""} ${
                wrongPick ? "animate-wrong-shake border-red-400 bg-red-500/15" : ""
              } ${revealCorrect ? "border-[#456DFF]/70 bg-[rgba(69,109,255,0.10)]" : ""} ${
                checked && !isCorrect && !sel ? "opacity-40" : ""
              }`}
            >
              <svg viewBox="0 0 40 80" className="h-16 w-full">
                <CandlestickSvg cx={20} bodyWidth={14} ohlc={ohlc} wickWidth={1.5} bodyRx={2} />
              </svg>
              {correctPick ? (
                <span className="absolute right-0.5 top-0.5 text-xs text-[#88C9F7]" aria-hidden>
                  ✓
                </span>
              ) : null}
              {wrongPick ? (
                <span className="absolute right-0.5 top-0.5 text-xs text-red-300" aria-hidden>
                  ✗
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
