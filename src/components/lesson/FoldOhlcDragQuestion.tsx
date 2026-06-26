"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CandleSeriesSvg, CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";

const FOLD_CANDLES: OhlcPixels[] = [
  { o: 72, h: 58, l: 88, c: 82 },
  { o: 82, h: 48, l: 86, c: 68 },
  { o: 68, h: 62, l: 98, c: 88 },
  { o: 88, h: 78, l: 92, c: 76 },
];

const FOLDED: OhlcPixels = { o: 72, h: 48, l: 98, c: 76 };

const ZONES = [
  { id: "z_open", label: "OPEN", correctLabel: "OPEN", cx: 18, cy: 72 },
  { id: "z_high", label: "HIGH", correctLabel: "HIGH", cx: 42, cy: 48 },
  { id: "z_low", label: "LOW", correctLabel: "LOW", cx: 66, cy: 98 },
  { id: "z_close", label: "CLOSE", correctLabel: "CLOSE", cx: 90, cy: 76 },
] as const;

type DragSource = { kind: "pool"; label: string } | { kind: "zone"; zoneId: string; label: string };

function chipClass(active: boolean, disabled: boolean) {
  return `select-none rounded-lg border-2 px-4 py-2.5 text-xs font-bold tracking-wide touch-none sm:text-sm ${
    disabled
      ? "pointer-events-none opacity-25"
      : active
        ? "scale-105 border-accent bg-accent/25 text-accent shadow-lg ring-2 ring-accent/40 cursor-grabbing"
        : "cursor-grab border-border bg-surface2 text-text-primary hover:border-accent"
  }`;
}

type Props = {
  onCheckResult: (allCorrect: boolean) => void;
  onTryAgain?: () => void;
};

/** Drag OPEN / HIGH / LOW / CLOSE onto the 1H candle points that fold into 4H. */
export function FoldOhlcDragQuestion({ onCheckResult, onTryAgain }: Props) {
  const labels = ["OPEN", "HIGH", "LOW", "CLOSE"];
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [activeDrag, setActiveDrag] = useState<DragSource | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverZoneId, setHoverZoneId] = useState<string | null>(null);
  const dropRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const placedLabels = new Set(Object.values(placed));
  const allPlaced = ZONES.every((z) => placed[z.id]);

  const findZoneAt = useCallback((clientX: number, clientY: number) => {
    for (const zone of ZONES) {
      const el = dropRefs.current[zone.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return zone.id;
    }
    return null;
  }, []);

  const placeLabel = useCallback((zoneId: string, label: string, source?: DragSource) => {
    setPlaced((prev) => {
      const next = { ...prev };
      for (const z of ZONES) {
        if (next[z.id] === label) delete next[z.id];
      }
      if (source?.kind === "zone" && source.zoneId !== zoneId) delete next[source.zoneId];
      next[zoneId] = label;
      return next;
    });
  }, []);

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!activeDrag || checked) return;
      const target = findZoneAt(clientX, clientY);
      if (target) placeLabel(target, activeDrag.label, activeDrag);
      else if (activeDrag.kind === "zone") {
        setPlaced((prev) => {
          const next = { ...prev };
          delete next[activeDrag.zoneId];
          return next;
        });
      }
      setActiveDrag(null);
      setPointer(null);
      setHoverZoneId(null);
    },
    [activeDrag, checked, findZoneAt, placeLabel],
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

  function startDrag(source: DragSource, x: number, y: number) {
    if (checked) return;
    setActiveDrag(source);
    setPointer({ x, y });
  }

  function handleCheck() {
    const next: Record<string, boolean> = {};
    let ok = true;
    for (const z of ZONES) {
      const match = placed[z.id] === z.correctLabel;
      next[z.id] = match;
      if (!match) ok = false;
    }
    setResults(next);
    setChecked(true);
    onCheckResult(ok);
  }

  function handleReset() {
    setPlaced({});
    setChecked(false);
    setResults({});
    setActiveDrag(null);
    onTryAgain?.();
  }

  return (
    <div className="space-y-4">
      <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-surface2/40 p-3">
        <svg viewBox="0 0 200 120" className="h-36 w-full" aria-hidden>
          <CandleSeriesSvg candles={FOLD_CANDLES} xAt={(i) => 14 + i * 22} bodyWidth={9} wickWidth={1.2} bodyRx={1} />
          <text x="108" y="62" fill="#64748b" fontSize="12">
            →
          </text>
          <CandlestickSvg cx={168} bodyWidth={20} ohlc={FOLDED} wickWidth={2} bodyRx={2} />
        </svg>
        {ZONES.map((zone) => {
          const leftPct = (zone.cx / 200) * 100;
          const topPct = (zone.cy / 120) * 100;
          const isPlaced = !!placed[zone.id];
          const isCorrect = results[zone.id] === true;
          const isWrong = checked && isPlaced && !isCorrect;
          const isHover = hoverZoneId === zone.id && !!activeDrag;
          return (
            <div
              key={zone.id}
              ref={(el) => {
                dropRefs.current[zone.id] = el;
              }}
              className={`absolute flex h-5 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded border text-[9px] font-bold transition-colors ${
                checked
                  ? isCorrect
                    ? "border-[#456DFF] bg-[rgba(69,109,255,0.2)] text-[#88C9F7]"
                    : isWrong
                      ? "border-red-400 bg-red-500/20 text-red-200"
                      : "border-border bg-surface2/60 text-text-muted"
                  : isHover
                    ? "border-accent bg-accent/15 ring-2 ring-accent/30"
                    : isPlaced
                      ? "border-[#F7C325] bg-[rgba(247,195,37,0.12)] text-[#F7C325]"
                      : "border-dashed border-slate-500/60 bg-white/[0.04] text-transparent"
              }`}
              style={{ left: `${leftPct}%`, top: `${topPct + 8}%` }}
            >
              {placed[zone.id] ?? ""}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {labels.map((label) => {
          const inPool = !placedLabels.has(label) || activeDrag?.label === label;
          if (!inPool && activeDrag?.label !== label) return null;
          return (
            <div
              key={label}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                startDrag({ kind: "pool", label }, e.clientX, e.clientY);
              }}
              className={chipClass(activeDrag?.label === label, checked)}
            >
              {label}
            </div>
          );
        })}
        {Object.entries(placed).map(([zoneId, label]) =>
          activeDrag?.kind === "zone" && activeDrag.zoneId === zoneId ? null : (
            <div
              key={`${zoneId}-${label}`}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                startDrag({ kind: "zone", zoneId, label }, e.clientX, e.clientY);
              }}
              className={chipClass(activeDrag?.label === label, checked)}
            >
              {label}
            </div>
          ),
        )}
      </div>

      {activeDrag && pointer ? (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border-2 border-accent bg-accent/30 px-4 py-2 text-xs font-bold text-accent shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -120%)" }}
        >
          {activeDrag.label}
        </div>
      ) : null}

      <div className="flex gap-2">
        {!checked ? (
          <button
            type="button"
            disabled={!allPlaced}
            onClick={handleCheck}
            className="h-12 flex-1 rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
          >
            Check
          </button>
        ) : (
          <button type="button" onClick={handleReset} className="h-12 flex-1 rounded-2xl border border-border font-semibold">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
