"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CandleSeriesSvg, CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";

const H1: OhlcPixels[] = [
  { o: 72, h: 58, l: 88, c: 82 },
  { o: 82, h: 48, l: 86, c: 68 },
  { o: 68, h: 62, l: 98, c: 88 },
  { o: 88, h: 78, l: 92, c: 85 },
];

const FOLDED: OhlcPixels = { o: 72, h: 48, l: 98, c: 85 };

const POINTS = [
  { id: "d_open", label: "O", cx: 28, cy: 72, slot: "open", lineY: 72 },
  { id: "d_high", label: "H", cx: 68, cy: 48, slot: "high", lineY: 48 },
  { id: "d_low", label: "L", cx: 108, cy: 98, slot: "low", lineY: 98 },
  { id: "d_close", label: "C", cx: 148, cy: 85, slot: "close", lineY: 85 },
] as const;

const SLOTS = [
  { id: "open", cx: 228, cy: 72 },
  { id: "high", cx: 228, cy: 48 },
  { id: "low", cx: 228, cy: 98 },
  { id: "close", cx: 228, cy: 85 },
] as const;

type DragSource = { kind: "pool"; dotId: string } | { kind: "slot"; slotId: string; dotId: string };

type Props = {
  onCheckResult: (correct: boolean) => void;
  onTryAgain?: () => void;
};

/** Drag O/H/L/C from the 1H row onto matching slots on the folded 4H candle. */
export function FoldConnectQuestion({ onCheckResult, onTryAgain }: Props) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState<DragSource | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<string | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const placedLabels = new Set(Object.values(placed));
  const allPlaced = SLOTS.every((s) => placed[s.id]);

  const findSlot = useCallback((x: number, y: number) => {
    for (const s of SLOTS) {
      const el = slotRefs.current[s.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return s.id;
    }
    return null;
  }, []);

  const place = useCallback((slotId: string, dotId: string, source?: DragSource) => {
    setPlaced((prev) => {
      const next = { ...prev };
      for (const s of SLOTS) if (next[s.id] === dotId) delete next[s.id];
      if (source?.kind === "slot" && source.slotId !== slotId) delete next[source.slotId];
      next[slotId] = dotId;
      return next;
    });
  }, []);

  const finish = useCallback(
    (x: number, y: number) => {
      if (!active || checked) return;
      const slot = findSlot(x, y);
      if (slot) place(slot, active.dotId, active);
      else if (active.kind === "slot") {
        setPlaced((prev) => {
          const next = { ...prev };
          delete next[active.slotId];
          return next;
        });
      }
      setActive(null);
      setPointer(null);
      setHoverSlot(null);
    },
    [active, checked, findSlot, place],
  );

  useEffect(() => {
    if (!active) return;
    const move = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
      setHoverSlot(findSlot(e.clientX, e.clientY));
    };
    const up = (e: PointerEvent) => finish(e.clientX, e.clientY);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [active, findSlot, finish]);

  function start(source: DragSource, x: number, y: number) {
    if (checked) return;
    setActive(source);
    setPointer({ x, y });
  }

  function handleCheck() {
    let ok = true;
    for (const s of SLOTS) {
      const dotId = placed[s.id];
      const pt = POINTS.find((p) => p.id === dotId);
      if (!pt || pt.slot !== s.id) ok = false;
    }
    setChecked(true);
    onCheckResult(ok);
  }

  function reset() {
    setPlaced({});
    setChecked(false);
    setActive(null);
    onTryAgain?.();
  }

  const labelFor = (dotId: string) => POINTS.find((p) => p.id === dotId)?.label ?? "";

  return (
    <div className="space-y-5">
      <div className="relative mx-auto max-w-xl rounded-2xl border border-border bg-surface2/30 p-4">
        <svg viewBox="0 0 260 150" className="h-56 w-full min-h-[220px]" aria-hidden>
          {POINTS.map((pt) => (
            <line
              key={`line-${pt.id}`}
              x1={12}
              y1={pt.lineY}
              x2={248}
              y2={pt.lineY}
              stroke="rgba(148,163,184,0.35)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          ))}
          <CandleSeriesSvg candles={H1} xAt={(i) => 28 + i * 40} bodyWidth={12} wickWidth={1.5} bodyRx={1.5} />
          <text x="178" y="68" fill="#64748b" fontSize="12">
            →
          </text>
          <CandlestickSvg cx={228} bodyWidth={24} ohlc={FOLDED} wickWidth={2} bodyRx={2} />
          {POINTS.map((pt) =>
            placedLabels.has(pt.id) && active?.dotId !== pt.id ? null : (
              <g key={pt.id}>
                <circle
                  cx={pt.cx}
                  cy={pt.cy}
                  r="9"
                  fill={active?.dotId === pt.id ? "#456DFF" : "#F7C325"}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                <text x={pt.cx} y={pt.cy + 3.5} textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="700">
                  {pt.label}
                </text>
              </g>
            ),
          )}
        </svg>

        {SLOTS.map((s) => {
          const leftPct = (s.cx / 260) * 100;
          const topPct = (s.cy / 150) * 100;
          const dotId = placed[s.id];
          const pt = POINTS.find((p) => p.id === dotId);
          const ok = checked && pt?.slot === s.id;
          const bad = checked && dotId && pt?.slot !== s.id;
          return (
            <div
              key={s.id}
              ref={(el) => {
                slotRefs.current[s.id] = el;
              }}
              className={`absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                ok
                  ? "border-[#456DFF] bg-[rgba(69,109,255,0.25)] text-[#88C9F7]"
                  : bad
                    ? "border-red-400 bg-red-500/20 text-red-200"
                    : hoverSlot === s.id && active
                      ? "border-accent bg-accent/15 ring-2 ring-accent/30"
                      : dotId
                        ? "border-[#F7C325] bg-[rgba(247,195,37,0.15)] text-[#F7C325]"
                        : "border-dashed border-slate-500/60 bg-white/[0.04] text-slate-500"
              }`}
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              {dotId ? labelFor(dotId) : s.id.charAt(0).toUpperCase()}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {POINTS.filter((p) => !placedLabels.has(p.id) || active?.dotId === p.id).map((p) => (
          <div
            key={p.id}
            role="button"
            tabIndex={0}
            onPointerDown={(e) => {
              e.preventDefault();
              start({ kind: "pool", dotId: p.id }, e.clientX, e.clientY);
            }}
            className={`flex h-11 w-11 cursor-grab items-center justify-center rounded-full border-2 text-sm font-bold touch-none active:cursor-grabbing ${
              checked ? "pointer-events-none opacity-30" : "border-[#F7C325] bg-[rgba(247,195,37,0.15)] text-[#F7C325]"
            }`}
          >
            {p.label}
          </div>
        ))}
        {SLOTS.map((s) => {
          const dotId = placed[s.id];
          if (!dotId || (active?.kind === "slot" && active.slotId === s.id)) return null;
          return (
            <div
              key={`placed-${s.id}`}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                start({ kind: "slot", slotId: s.id, dotId }, e.clientX, e.clientY);
              }}
              className={`flex h-11 w-11 cursor-grab items-center justify-center rounded-full border-2 border-[#F7C325] bg-[rgba(247,195,37,0.15)] text-sm font-bold text-[#F7C325] touch-none ${
                checked ? "pointer-events-none" : ""
              }`}
            >
              {labelFor(dotId)}
            </div>
          );
        })}
      </div>

      {active && pointer ? (
        <div
          className="pointer-events-none fixed z-50 flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#F7C325] bg-[rgba(247,195,37,0.35)] text-sm font-bold shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -50%)" }}
        >
          {labelFor(active.dotId)}
        </div>
      ) : null}

      {!checked ? (
        <button
          type="button"
          disabled={!allPlaced}
          onClick={handleCheck}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
        >
          Check connections
        </button>
      ) : (
        <button type="button" onClick={reset} className="h-12 w-full rounded-2xl border border-border font-semibold">
          Try again
        </button>
      )}
    </div>
  );
}
