"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RichText } from "@/components/ui/RichText";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { candleLayoutFromOhlc, TEACHING_CANDLES } from "@/lib/candleGeometry";
import type { DragLabelPage } from "@/types/lessonPage";

type Zone = DragLabelPage["zones"][number];

type LayoutKind = "ohlc" | "hammer" | "list";

type DragSource = { kind: "pool"; label: string } | { kind: "zone"; zoneId: string; label: string };

const OHLC_LABELS = new Set(["OPEN", "CLOSE", "HIGH", "LOW"]);
const HAMMER_LABELS = new Set(["BODY", "LOWER WICK", "OPEN (near Close)", "THE REJECTION ZONE"]);

const OHLC_SLOT_ORDER: Record<string, number> = {
  HIGH: 0,
  CLOSE: 1,
  OPEN: 2,
  LOW: 3,
};

const OHLC_BEARISH_SLOT_ORDER: Record<string, number> = {
  HIGH: 0,
  OPEN: 1,
  CLOSE: 2,
  LOW: 3,
};

const OHLC_VIEW_H = 360;
const OHLC_VIEW_W = 240;
const OHLC_CANDLE_CX = 58;
const OHLC_BOX_W = 38;
const OHLC_LINE_START = 86;
const OHLC_LINE_END = OHLC_VIEW_W - OHLC_BOX_W;

function getOhlcAnchorY(variant: "bullish" | "bearish"): Record<string, number> {
  const ohlc = variant === "bearish" ? TEACHING_CANDLES.ohlcBearish : TEACHING_CANDLES.ohlcBullish;
  const { highY, lowY, openY, closeY } = candleLayoutFromOhlc(ohlc);
  return { HIGH: highY, CLOSE: closeY, OPEN: openY, LOW: lowY };
}

function inferLayout(zones: Zone[]): LayoutKind {
  if (zones.some((z) => HAMMER_LABELS.has(z.correctLabel))) return "hammer";
  if (zones.every((z) => OHLC_LABELS.has(z.correctLabel))) return "ohlc";
  return "list";
}

/** viewBox 0 0 200 360 — positions for hammer tap layout */
const HAMMER_ZONE_POS: Record<string, { cx: number; cy: number; r: number; hint: string }> = {
  "OPEN (near Close)": { cx: 100, cy: 46, r: 26, hint: "Top of body" },
  BODY: { cx: 100, cy: 62, r: 26, hint: "Body" },
  "LOWER WICK": { cx: 100, cy: 168, r: 26, hint: "Long wick" },
  "THE REJECTION ZONE": { cx: 100, cy: 288, r: 26, hint: "Deep wick" },
};

function inferOhlcVariant(zones: Zone[], instruction: string): "bullish" | "bearish" {
  if (/red|bearish/i.test(instruction)) return "bearish";
  if (/green|bullish/i.test(instruction)) return "bullish";

  const openZone = zones.find((z) => z.correctLabel === "OPEN");
  const closeZone = zones.find((z) => z.correctLabel === "CLOSE");
  const openTitle = openZone?.title.toLowerCase() ?? "";
  const closeTitle = closeZone?.title.toLowerCase() ?? "";

  if (openTitle.includes("top") && closeTitle.includes("bottom")) return "bearish";
  if (closeTitle.includes("top") && openTitle.includes("bottom")) return "bullish";

  return "bullish";
}

function sortOhlcZones(zones: Zone[], variant: "bullish" | "bearish"): Zone[] {
  const order = variant === "bearish" ? OHLC_BEARISH_SLOT_ORDER : OHLC_SLOT_ORDER;
  return [...zones].sort((a, b) => (order[a.correctLabel] ?? 99) - (order[b.correctLabel] ?? 99));
}

function zoneGeometryHammer(zone: Zone): { cx: number; cy: number; r: number; hint: string } {
  const pos = HAMMER_ZONE_POS[zone.correctLabel];
  return pos ?? { cx: 100, cy: 180, r: 26, hint: zone.title };
}

function BullishCandleSvg({ cx = 100 }: { cx?: number }) {
  return <CandlestickSvg cx={cx} bodyWidth={56} ohlc={TEACHING_CANDLES.ohlcBullish} wickWidth={3} bodyRx={4} />;
}

function BearishCandleSvg({ cx = 100 }: { cx?: number }) {
  return <CandlestickSvg cx={cx} bodyWidth={56} ohlc={TEACHING_CANDLES.ohlcBearish} wickWidth={3} bodyRx={4} />;
}

function HammerCandleSvg() {
  return <CandlestickSvg cx={100} bodyWidth={48} ohlc={TEACHING_CANDLES.hammerBullish} wickWidth={3} bodyRx={3} />;
}

function labelChipClass(active: boolean, disabled: boolean) {
  return `select-none rounded-lg border-2 px-3 py-2.5 text-xs font-bold tracking-wide transition-all duration-150 sm:px-4 sm:text-sm touch-none ${
    disabled
      ? "pointer-events-none opacity-[0.22]"
      : active
        ? "scale-105 border-accent bg-accent/25 text-accent shadow-lg shadow-accent/30 ring-2 ring-accent/40 cursor-grabbing"
        : "cursor-grab border-border bg-surface2 text-text-primary hover:border-accent active:cursor-grabbing"
  }`;
}

function dropBoxClass(opts: { isPlaced: boolean; isCorrect: boolean; isWrong: boolean; isHover: boolean; checked: boolean }) {
  const { isPlaced, isCorrect, isWrong, isHover, checked } = opts;
  if (checked) {
    if (isCorrect) return "border-[#456DFF] bg-[rgba(69,109,255,0.15)]";
    if (isWrong) return "border-red-400 bg-red-500/15";
    return "border-border bg-surface2/50";
  }
  if (isHover) return "border-accent bg-accent/10 ring-2 ring-accent/25";
  if (isPlaced) return "border-[#F7C325] bg-[rgba(247,195,37,0.10)]";
  return "border-dashed border-slate-500/70 bg-white/[0.03]";
}

export type DragLabelQuestionProps = {
  instruction: string;
  labels: string[];
  zones: Zone[];
  explanation?: string;
  onCheckResult: (allCorrect: boolean) => void;
  onTryAgain?: () => void;
  hideInstruction?: boolean;
  compact?: boolean;
};

export function DragLabelQuestion({
  instruction,
  labels,
  zones,
  explanation,
  onCheckResult,
  onTryAgain,
  hideInstruction = false,
  compact = false,
}: DragLabelQuestionProps) {
  const layout = useMemo(() => inferLayout(zones), [zones]);
  const ohlcVariant = useMemo(() => inferOhlcVariant(zones, instruction), [zones, instruction]);
  const sortedOhlcZones = useMemo(() => sortOhlcZones(zones, ohlcVariant), [zones, ohlcVariant]);
  const ohlcAnchorY = useMemo(() => getOhlcAnchorY(ohlcVariant), [ohlcVariant]);

  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [activeDrag, setActiveDrag] = useState<DragSource | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverZoneId, setHoverZoneId] = useState<string | null>(null);

  const dropRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const placedLabels = useMemo(() => new Set(Object.values(placed)), [placed]);
  const allPlaced = zones.every((z) => placed[z.id]);
  const diagramHeight = compact ? 220 : 360;

  const findZoneAt = useCallback((clientX: number, clientY: number): string | null => {
    for (const zone of zones) {
      const el = dropRefs.current[zone.id];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        return zone.id;
      }
    }
    return null;
  }, [zones]);

  const placeLabel = useCallback(
    (zoneId: string, label: string, source?: DragSource) => {
      setPlaced((prev) => {
        const next = { ...prev };
        for (const z of zones) {
          if (next[z.id] === label) delete next[z.id];
        }
        if (source?.kind === "zone" && source.zoneId !== zoneId) {
          delete next[source.zoneId];
        }
        next[zoneId] = label;
        return next;
      });
    },
    [zones],
  );

  const removeFromZone = useCallback((zoneId: string) => {
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[zoneId];
      return next;
    });
  }, []);

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!activeDrag || checked) return;
      const targetZone = findZoneAt(clientX, clientY);
      if (targetZone) {
        placeLabel(targetZone, activeDrag.label, activeDrag);
      } else if (activeDrag.kind === "zone") {
        removeFromZone(activeDrag.zoneId);
      }
      setActiveDrag(null);
      setPointer(null);
      setHoverZoneId(null);
    },
    [activeDrag, checked, findZoneAt, placeLabel, removeFromZone],
  );

  useEffect(() => {
    if (!activeDrag) return;

    const onMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
      setHoverZoneId(findZoneAt(e.clientX, e.clientY));
    };
    const onUp = (e: PointerEvent) => finishDrag(e.clientX, e.clientY);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [activeDrag, findZoneAt, finishDrag]);

  function startDrag(source: DragSource, clientX: number, clientY: number) {
    if (checked) return;
    setActiveDrag(source);
    setPointer({ x: clientX, y: clientY });
    setSelected(null);
  }

  function pickLabel(label: string) {
    if (checked || layout === "ohlc") return;
    if (placedLabels.has(label)) return;
    setSelected((prev) => (prev === label ? null : label));
  }

  function tapZone(zoneId: string) {
    if (checked || layout === "ohlc" || !selected) return;
    placeLabel(zoneId, selected);
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
    setActiveDrag(null);
    setPointer(null);
    setHoverZoneId(null);
    onTryAgain?.();
  }

  const showHint = layout !== "ohlc" && selected && !checked;
  const remaining = zones.length - Object.keys(placed).length;

  const renderOhlcDiagram = () => (
    <div
      className="relative mx-auto w-full max-w-[300px] px-2 py-3"
      style={{ height: diagramHeight + 16 }}
      role="img"
      aria-label={ohlcVariant === "bearish" ? "Bearish candlestick with OHLC drop zones" : "Bullish candlestick with OHLC drop zones"}
    >
      <svg
        viewBox="0 0 240 360"
        className="pointer-events-none absolute inset-x-2 top-3 bottom-3 h-[calc(100%-1.5rem)] w-[calc(100%-1rem)] overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {ohlcVariant === "bearish" ? <BearishCandleSvg cx={OHLC_CANDLE_CX} /> : <BullishCandleSvg cx={OHLC_CANDLE_CX} />}
        {sortedOhlcZones.map((zone) => {
          const y = ohlcAnchorY[zone.correctLabel] ?? 180;
          const isPlaced = !!placed[zone.id];
          const isCorrect = results[zone.id] === true;
          const isWrong = checked && isPlaced && !isCorrect;
          const isHover = hoverZoneId === zone.id && !!activeDrag;

          const stroke = checked
            ? isCorrect
              ? "#88C9F7"
              : isWrong
                ? "#f87171"
                : "#475569"
            : isHover
              ? "#456DFF"
              : isPlaced
                ? "#F7C325"
                : "rgba(148,163,184,0.55)";

          const opacity = isPlaced || isHover || checked ? 1 : 0.5;

          return (
            <g key={`line-${zone.id}`}>
              <line
                x1={OHLC_LINE_START}
                y1={y}
                x2={OHLC_LINE_END}
                y2={y}
                stroke={stroke}
                strokeWidth={isHover || isPlaced ? 1.75 : 1.25}
                strokeLinecap="butt"
                opacity={opacity}
              />
              <circle cx={OHLC_LINE_START} cy={y} r={isPlaced || isHover ? 2.5 : 2} fill={stroke} opacity={opacity} />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-2 top-3 bottom-3">
        {sortedOhlcZones.map((zone) => {
          const y = ohlcAnchorY[zone.correctLabel] ?? 180;
          const yPct = (y / OHLC_VIEW_H) * 100;
          const isPlaced = !!placed[zone.id];
          const placedLabel = placed[zone.id];
          const isCorrect = results[zone.id] === true;
          const isWrong = checked && isPlaced && !isCorrect;
          const isHover = hoverZoneId === zone.id && !!activeDrag;

          return (
            <div
              key={zone.id}
              ref={(el) => {
                dropRefs.current[zone.id] = el;
              }}
              style={{ top: `${yPct}%`, transform: "translateY(-50%)", width: OHLC_BOX_W }}
              className="pointer-events-auto absolute right-0 flex items-center justify-center"
            >
              <div
                className={`flex h-[17px] w-full flex-col items-center justify-center rounded border px-0.5 py-0 transition-all duration-150 sm:h-[18px] ${dropBoxClass({
                  isPlaced,
                  isCorrect,
                  isWrong,
                  isHover,
                  checked,
                })}`}
              >
              {isPlaced ? (
                <button
                  type="button"
                  disabled={checked}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    startDrag({ kind: "zone", zoneId: zone.id, label: placedLabel }, e.clientX, e.clientY);
                  }}
                  className={`w-full truncate text-center text-[8px] font-bold leading-none touch-none ${
                    checked ? (isCorrect ? "text-[#88C9F7]" : "text-red-300") : "cursor-grab text-[#F7C325] active:cursor-grabbing"
                  }`}
                >
                  {placedLabel}
                  {checked && isCorrect ? " ✓" : ""}
                  {checked && isWrong ? " ✗" : ""}
                </button>
              ) : (
                <span className="line-clamp-2 text-center text-[7px] leading-[1.05] text-slate-500">{zone.title}</span>
              )}
              </div>
            </div>
          );
        })}
      </div>

      {activeDrag && pointer ? (
        <div
          className="pointer-events-none fixed z-[500] rounded-md border-2 border-accent bg-accent/30 px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-accent shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -50%)" }}
        >
          {activeDrag.label}
        </div>
      ) : null}
    </div>
  );

  const renderTapDiagram = () => (
    <div className="relative flex w-full justify-center px-1">
      <svg
        viewBox="0 0 200 360"
        className={
          compact
            ? "h-[220px] w-auto max-w-full overflow-visible touch-manipulation"
            : "h-[min(78vh,360px)] w-auto max-w-full overflow-visible touch-manipulation"
        }
        role="img"
        aria-label="Interactive candlestick diagram"
      >
        {layout === "hammer" ? <HammerCandleSvg /> : ohlcVariant === "bearish" ? <BearishCandleSvg /> : <BullishCandleSvg />}

        {zones.map((zone) => {
          const { cx, cy, r, hint } = zoneGeometryHammer(zone);
          const isPlaced = !!placed[zone.id];
          const placedLabel = placed[zone.id];
          const isCorrect = results[zone.id] === true;
          const isWrong = checked && isPlaced && !isCorrect;
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
              <circle cx={cx} cy={cy} r={r + 4} fill={fill} stroke={stroke} strokeWidth={invite ? 2.5 : 1.75} strokeDasharray={!isPlaced && !invite ? "5 4" : "none"} className={invite ? "animate-pulse" : undefined} />
              {isPlaced ? (
                <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fontWeight="700" fill={checked ? (isCorrect ? "#88C9F7" : "#fca5a5") : "#F7C325"} className="pointer-events-none">
                  {placedLabel}
                  {checked && isCorrect ? " ✓" : ""}
                  {checked && isWrong ? " ✗" : ""}
                </text>
              ) : (
                <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.65)" className="pointer-events-none">
                  {invite ? "tap to place" : hint}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div className={`flex w-full flex-col items-center ${compact ? "gap-5" : "max-w-xl gap-7"}`}>
      {!hideInstruction ? (
        <p className="w-full text-center text-sm font-medium leading-snug text-text-primary">{instruction}</p>
      ) : null}

      <div className="flex w-full min-h-[2rem] flex-col items-center justify-center gap-2">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {labels.map((label) => {
            const isUsed = placedLabels.has(label);
            const isDragging = activeDrag?.label === label;
            if (layout === "ohlc") {
              if (isUsed) return null;
              return (
                <div
                  key={label}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    startDrag({ kind: "pool", label }, e.clientX, e.clientY);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      startDrag({ kind: "pool", label }, 0, 0);
                    }
                  }}
                  className={labelChipClass(isDragging, false)}
                >
                  {label}
                </div>
              );
            }

            const isSelected = selected === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => pickLabel(label)}
                disabled={isUsed || checked}
                className={labelChipClass(isSelected, isUsed || checked)}
              >
                {label}
              </button>
            );
          })}
        </div>
        {layout === "ohlc" && !checked ? (
          <p className="w-full text-center text-xs text-text-muted">Drag each tag to the matching box beside the candle</p>
        ) : showHint ? (
          <p className="w-full animate-pulse text-center text-xs text-accent">
            ↓ Tap on the candle where <strong className="text-text-primary">{selected}</strong> belongs
          </p>
        ) : layout !== "ohlc" ? (
          <span className="invisible text-xs" aria-hidden>
            ↓ Tap on the candle where label belongs
          </span>
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
                  className={`flex min-w-[120px] items-center justify-center rounded-lg border px-3 py-1 text-xs font-bold transition-colors ${
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
      ) : layout === "ohlc" ? (
        renderOhlcDiagram()
      ) : (
        renderTapDiagram()
      )}

      {checked ? (
        <div
          className={`mb-2 w-full rounded-2xl border p-4 transition-all duration-300 ${
            Object.values(results).every(Boolean)
              ? "border-[#456DFF]/40 bg-[rgba(69,109,255,0.12)]"
              : "border-amber-500/40 bg-amber-500/10"
          }`}
        >
          <p className={`mb-1 font-bold ${Object.values(results).every(Boolean) ? "text-[#88C9F7]" : "text-amber-400"}`}>
            {Object.values(results).every(Boolean) ? "🎯 Perfect! All labels placed correctly." : "🔍 Some were off — check the highlights on the candle."}
          </p>
          {explanation ? (
            <p className="text-sm leading-relaxed text-slate-300">
              <RichText text={explanation} />
            </p>
          ) : null}
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
