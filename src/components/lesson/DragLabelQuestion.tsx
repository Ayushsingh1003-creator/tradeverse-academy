"use client";

import { useMemo, useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";
import type { DragLabelPage } from "@/types/lessonPage";

type Zone = DragLabelPage["zones"][number];

type LayoutKind = "ohlc" | "hammer" | "list";

const OHLC_LABELS = new Set(["OPEN", "CLOSE", "HIGH", "LOW"]);
const HAMMER_LABELS = new Set(["BODY", "LOWER WICK", "OPEN (near Close)", "THE REJECTION ZONE"]);

function inferLayout(zones: Zone[]): LayoutKind {
  if (zones.some((z) => HAMMER_LABELS.has(z.correctLabel))) return "hammer";
  if (zones.every((z) => OHLC_LABELS.has(z.correctLabel))) return "ohlc";
  return "list";
}

/** viewBox 0 0 200 360 — positions for OHLC (bullish) */
const OHLC_ZONE_POS: Record<string, { cx: number; cy: number; r: number; hint: string }> = {
  HIGH: { cx: 100, cy: 24, r: 26, hint: "Upper wick tip" },
  CLOSE: { cx: 100, cy: 82, r: 26, hint: "Top of body" },
  OPEN: { cx: 100, cy: 158, r: 26, hint: "Bottom of body" },
  LOW: { cx: 100, cy: 312, r: 26, hint: "Lower wick tip" },
};

/** Hammer diagram — same viewBox */
const HAMMER_ZONE_POS: Record<string, { cx: number; cy: number; r: number; hint: string }> = {
  "OPEN (near Close)": { cx: 100, cy: 46, r: 26, hint: "Top of body" },
  BODY: { cx: 100, cy: 62, r: 26, hint: "Body" },
  "LOWER WICK": { cx: 100, cy: 168, r: 26, hint: "Long wick" },
  "THE REJECTION ZONE": { cx: 100, cy: 288, r: 26, hint: "Deep wick" },
};

function zoneGeometry(
  layout: LayoutKind,
  zone: Zone,
): { cx: number; cy: number; r: number; hint: string } {
  const map = layout === "hammer" ? HAMMER_ZONE_POS : OHLC_ZONE_POS;
  const pos = map[zone.correctLabel];
  if (pos) return pos;
  return { cx: 100, cy: 180, r: 26, hint: zone.title };
}

function BullishCandleSvg() {
  return <CandlestickSvg cx={100} bodyWidth={56} ohlc={TEACHING_CANDLES.ohlcBullish} wickWidth={3} bodyRx={4} />;
}

function HammerCandleSvg() {
  return <CandlestickSvg cx={100} bodyWidth={48} ohlc={TEACHING_CANDLES.hammerBullish} wickWidth={3} bodyRx={3} />;
}

export type DragLabelQuestionProps = {
  instruction: string;
  labels: string[];
  zones: Zone[];
  explanation?: string;
  onCheckResult: (allCorrect: boolean) => void;
  onTryAgain?: () => void;
};

export function DragLabelQuestion({ instruction, labels, zones, explanation, onCheckResult, onTryAgain }: DragLabelQuestionProps) {
  const layout = useMemo(() => inferLayout(zones), [zones]);
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const placedLabels = useMemo(() => new Set(Object.values(placed)), [placed]);
  const allPlaced = zones.every((z) => placed[z.id]);

  function pickLabel(label: string) {
    if (checked) return;
    if (placedLabels.has(label)) return;
    setSelected((prev) => (prev === label ? null : label));
  }

  function tapZone(zoneId: string) {
    if (checked || !selected) return;
    const next: Record<string, string> = { ...placed };
    for (const z of zones) {
      if (next[z.id] === selected) delete next[z.id];
    }
    next[zoneId] = selected;
    setPlaced(next);
    setSelected(null);
  }

  function handleCheck() {
    const nextResults: Record<string, boolean> = {};
    let allCorrect = true;
    for (const z of zones) {
      const ok = placed[z.id] === z.correctLabel;
      nextResults[z.id] = ok;
      if (!ok) allCorrect = false;
    }
    setResults(nextResults);
    setChecked(true);
    onCheckResult(allCorrect);
  }

  function handleReset() {
    setPlaced({});
    setSelected(null);
    setChecked(false);
    setResults({});
    onTryAgain?.();
  }

  const showHint = selected && !checked;
  const remaining = zones.length - Object.keys(placed).length;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <p className="w-full text-center text-lg font-medium text-text-primary">{instruction}</p>

      <div className="flex w-full flex-col items-center gap-2">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {labels.map((label) => {
            const isUsed = placedLabels.has(label);
            const isSelected = selected === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => pickLabel(label)}
                disabled={isUsed || checked}
                className={`select-none rounded-full border-2 px-3 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 sm:px-4 sm:text-sm ${
                  isUsed
                    ? "pointer-events-none scale-95 opacity-[0.22]"
                    : isSelected
                      ? "scale-110 border-accent bg-accent/25 text-accent shadow-lg shadow-accent/30 ring-2 ring-accent/40"
                      : "cursor-pointer border-border bg-surface2 text-text-primary hover:scale-105 hover:border-accent"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {showHint ? (
          <p className="w-full animate-pulse text-center text-xs text-accent">
            ↓ Tap on the candle where <strong className="text-text-primary">{selected}</strong> belongs
          </p>
        ) : null}
      </div>

      {layout === "list" ? (
        <div className="grid w-full gap-2.5">
          {zones.map((zone) => {
            const isPlaced = !!placed[zone.id];
            const placedLabel = placed[zone.id];
            const isCorrect = results[zone.id] === true;
            const isWrong = checked && isPlaced && results[zone.id] !== true;
            const invite = selected !== null && !checked && !isPlaced;

            const borderClass = checked
              ? isCorrect
                ? "border-[#456DFF] bg-[rgba(69,109,255,0.12)]"
                : isWrong
                  ? "border-red-400 bg-red-500/15"
                  : "border-border bg-surface2"
              : isPlaced
                ? "border-[#F7C325] bg-[rgba(247,195,37,0.10)]"
                : invite
                  ? "animate-pulse border-[#F7C325]/70 bg-[rgba(247,195,37,0.06)]"
                  : "border-border bg-surface2";

            return (
              <button
                key={zone.id}
                type="button"
                disabled={checked || (!selected && !isPlaced)}
                onClick={() => tapZone(zone.id)}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${borderClass} ${
                  !checked && (invite || isPlaced) ? "cursor-pointer" : ""
                }`}
              >
                <span className="text-sm font-medium text-text-primary">{zone.title}</span>
                <span
                  className={`flex min-w-[120px] items-center justify-center rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    isPlaced
                      ? checked
                        ? isCorrect
                          ? "border-[#456DFF] bg-[rgba(69,109,255,0.18)] text-[#88C9F7]"
                          : "border-red-400 bg-red-500/20 text-red-200"
                        : "border-[#F7C325] bg-[rgba(247,195,37,0.18)] text-[#F7C325]"
                      : "border-dashed border-slate-500 text-slate-400"
                  }`}
                >
                  {isPlaced ? (
                    <>
                      {placedLabel}
                      {checked && isCorrect ? " ✓" : ""}
                      {checked && isWrong ? " ✗" : ""}
                    </>
                  ) : invite ? (
                    "tap to place"
                  ) : (
                    "—"
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="relative flex w-full justify-center px-1">
          <svg
            viewBox="0 0 200 360"
            className="h-[min(78vh,360px)] w-auto max-w-full overflow-visible touch-manipulation"
            role="img"
            aria-label="Interactive candlestick diagram"
          >
            {layout === "hammer" ? <HammerCandleSvg /> : <BullishCandleSvg />}

            {zones.map((zone) => {
              const { cx, cy, r, hint } = zoneGeometry(layout, zone);
              const isPlaced = !!placed[zone.id];
              const placedLabel = placed[zone.id];
              const isCorrect = results[zone.id] === true;
              const isWrong = checked && isPlaced && results[zone.id] !== true;
              const invite = selected !== null && !checked && !isPlaced;

              const fill = checked
                ? isCorrect
                  ? "rgba(69,109,255,0.28)"
                  : isWrong
                    ? "rgba(239,68,68,0.28)"
                    : "rgba(148,163,184,0.12)"
                : isPlaced
                  ? "rgba(212,160,23,0.22)"
                  : invite
                    ? "rgba(212,160,23,0.18)"
                    : "rgba(255,255,255,0.06)";

              const stroke = checked ? (isCorrect ? "#456DFF" : isWrong ? "#ef4444" : "#94a3b8") : isPlaced ? "#F7C325" : invite ? "#F7C325" : "rgba(148,163,184,0.45)";

              return (
                <g
                  key={zone.id}
                  role="button"
                  tabIndex={0}
                  className={invite || (isPlaced && !checked) ? "cursor-pointer touch-manipulation" : "touch-manipulation"}
                  onClick={() => tapZone(zone.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      tapZone(zone.id);
                    }
                  }}
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 4}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={invite ? 2.5 : 1.75}
                    strokeDasharray={!isPlaced && !invite ? "5 4" : "none"}
                    className={invite ? "animate-pulse" : undefined}
                  />
                  {isPlaced ? (
                    <text
                      x={cx}
                      y={cy + (placedLabel.length > 14 ? 3 : 5)}
                      textAnchor="middle"
                      fontSize={placedLabel.length > 18 ? 7 : placedLabel.length > 12 ? 8 : 10}
                      fontWeight="700"
                      fill={checked ? (isCorrect ? "#88C9F7" : "#fca5a5") : "#F7C325"}
                      className="pointer-events-none"
                    >
                      {placedLabel.length > 22 ? `${placedLabel.slice(0, 20)}…` : placedLabel}
                      {checked && isCorrect ? " ✓" : ""}
                      {checked && isWrong ? " ✗" : ""}
                    </text>
                  ) : (
                    <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.65)" className="pointer-events-none">
                      {invite ? "tap to place" : hint}
                    </text>
                  )}
                  {isPlaced ? (
                    <line
                      x1={cx + r + 4}
                      y1={cy}
                      x2={100}
                      y2={cy}
                      stroke={checked ? (isCorrect ? "#88C9F7" : "#f87171") : "#F7C325"}
                      strokeWidth="1.25"
                      strokeDasharray="4 3"
                      opacity={0.75}
                      className="pointer-events-none"
                    />
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {checked ? (
        <div
          className={`w-full rounded-2xl border p-4 transition-all duration-300 ${
            Object.values(results).every(Boolean)
              ? "border-[#456DFF]/40 bg-[rgba(69,109,255,0.12)]"
              : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          <p className={`mb-1 font-bold ${Object.values(results).every(Boolean) ? "text-[#88C9F7]" : "text-amber-400"}`}>
            {Object.values(results).every(Boolean) ? "🎯 Perfect! All labels placed correctly." : "🔍 Some were off — check the highlights on the candle."}
          </p>
          {explanation ? <p className="text-sm leading-relaxed text-slate-300">{explanation}</p> : null}
          {!Object.values(results).every(Boolean) ? (
            <button type="button" onClick={handleReset} className="mt-3 text-sm font-semibold text-accent hover:underline">
              ↺ Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {!checked ? (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!allPlaced}
          className={`w-full min-h-[56px] rounded-2xl py-4 text-lg font-bold transition-all ${
            allPlaced ? "bg-accent text-slate-900 hover:brightness-110" : "cursor-not-allowed bg-surface2 text-slate-500"
          }`}
        >
          {allPlaced ? "Check labels ✓" : `Place all ${remaining} remaining label${remaining === 1 ? "" : "s"}`}
        </button>
      ) : null}
    </div>
  );
}
