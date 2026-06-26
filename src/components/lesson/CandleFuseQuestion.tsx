"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CandleSeriesSvg, CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import type { OhlcPixels } from "@/lib/candleGeometry";

const POOL: OhlcPixels[] = [
  { o: 92, h: 78, l: 96, c: 84 },
  { o: 84, h: 82, l: 108, c: 98 },
  { o: 98, h: 88, l: 102, c: 80 },
];

const RESULTS: OhlcPixels[] = [
  { o: 95, h: 78, l: 98, c: 82 },
  { o: 100, h: 72, l: 108, c: 80 },
  { o: 88, h: 80, l: 92, c: 96 },
  { o: 92, h: 85, l: 105, c: 86 },
];

type Props = {
  correctResultIndex: number;
  onCheckResult: (correct: boolean) => void;
};

type DragSource = { kind: "pool"; index: number } | { kind: "slot"; slotIndex: number; index: number };

/** Drag three 5M candles into the fuse tray, then tap the 15M result they produce. */
export function CandleFuseQuestion({ correctResultIndex, onCheckResult }: Props) {
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<"fuse" | "pick" | "done">("fuse");
  const [active, setActive] = useState<DragSource | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const used = new Set(slots.filter((s): s is number => s != null));
  const fused = slots.every((s) => s != null);

  const findSlot = useCallback((x: number, y: number) => {
    for (let i = 0; i < 3; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  }, []);

  const place = useCallback((slotIndex: number, index: number, source?: DragSource) => {
    setSlots((prev) => {
      const next = [...prev];
      if (source?.kind === "slot") next[source.slotIndex] = null;
      const existing = next.findIndex((s) => s === index);
      if (existing >= 0) next[existing] = null;
      next[slotIndex] = index;
      return next;
    });
  }, []);

  const finish = useCallback(
    (x: number, y: number) => {
      if (!active || phase !== "fuse") return;
      const slot = findSlot(x, y);
      if (slot != null) place(slot, active.index, active);
      else if (active.kind === "slot") {
        setSlots((prev) => {
          const next = [...prev];
          next[active.slotIndex] = null;
          return next;
        });
      }
      setActive(null);
      setPointer(null);
      setHoverSlot(null);
    },
    [active, phase, findSlot, place],
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

  useEffect(() => {
    if (fused && phase === "fuse") setPhase("pick");
  }, [fused, phase]);

  function start(source: DragSource, x: number, y: number) {
    if (phase !== "fuse") return;
    setActive(source);
    setPointer({ x, y });
  }

  function confirmPick() {
    if (picked == null) return;
    const ok = picked === correctResultIndex;
    setPhase("done");
    onCheckResult(ok);
  }

  return (
    <div className="space-y-5">
      {phase === "fuse" ? (
        <>
          <p className="text-center text-xs text-text-muted">Step 1 — drag all three 5M candles into the tray</p>
          <div className="flex justify-center gap-2">
            {POOL.map((c, i) =>
              used.has(i) && active?.index !== i ? null : (
                <div
                  key={i}
                  role="button"
                  tabIndex={0}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    start({ kind: "pool", index: i }, e.clientX, e.clientY);
                  }}
                  className="cursor-grab rounded-lg border border-border bg-surface2 p-1 touch-none active:cursor-grabbing"
                >
                  <svg viewBox="0 0 24 48" className="h-12 w-6">
                    <CandlestickSvg cx={12} bodyWidth={10} ohlc={c} wickWidth={1} bodyRx={1} />
                  </svg>
                </div>
              ),
            )}
          </div>
          <div className="mx-auto flex max-w-xs justify-center gap-3 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-4">
            {slots.map((idx, si) => (
              <div
                key={si}
                ref={(el) => {
                  slotRefs.current[si] = el;
                }}
                className={`flex h-16 w-12 items-center justify-center rounded-lg border-2 ${
                  hoverSlot === si && active
                    ? "border-accent bg-accent/10"
                    : idx != null
                      ? "border-[#F7C325] bg-[rgba(247,195,37,0.08)]"
                      : "border-white/10 bg-white/[0.02]"
                }`}
              >
                {idx != null ? (
                  <div
                    role="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      start({ kind: "slot", slotIndex: si, index: idx }, e.clientX, e.clientY);
                    }}
                  >
                    <svg viewBox="0 0 24 48" className="h-12 w-6">
                      <CandlestickSvg cx={12} bodyWidth={10} ohlc={POOL[idx]!} wickWidth={1} bodyRx={1} />
                    </svg>
                  </div>
                ) : (
                  <span className="text-lg text-text-muted">+</span>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {phase === "pick" || phase === "done" ? (
        <>
          <p className="text-center text-xs text-text-muted">Step 2 — tap the 15M candle this fusion produces</p>
          <div className="flex justify-center">
            <svg viewBox="0 0 80 50" className="h-14 w-24 opacity-80" aria-hidden>
              <CandleSeriesSvg candles={POOL} xAt={(i) => 10 + i * 22} bodyWidth={10} wickWidth={1} bodyRx={1} />
              <text x="72" y="28" fill="#64748b" fontSize="10">
                →
              </text>
            </svg>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {RESULTS.map((ohlc, i) => {
              const sel = picked === i;
              const ok = phase === "done" && i === correctResultIndex;
              const bad = phase === "done" && sel && i !== correctResultIndex;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={phase === "done"}
                  onClick={() => setPicked(i)}
                  className={`rounded-xl border-2 p-1.5 transition-all ${
                    sel && phase === "pick"
                      ? "border-[#456DFF] ring-2 ring-[#456DFF]/30"
                      : ok
                        ? "border-[#456DFF] bg-[rgba(69,109,255,0.15)]"
                        : bad
                          ? "border-red-400 bg-red-500/10"
                          : "border-border bg-surface2 hover:border-accent/50"
                  } ${phase === "done" && i !== correctResultIndex && !sel ? "opacity-40" : ""}`}
                >
                  <svg viewBox="0 0 32 64" className="mx-auto h-14 w-8">
                    <CandlestickSvg cx={16} bodyWidth={12} ohlc={ohlc} wickWidth={1.5} bodyRx={2} />
                  </svg>
                </button>
              );
            })}
          </div>
          {phase === "pick" ? (
            <button
              type="button"
              disabled={picked == null}
              onClick={confirmPick}
              className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
            >
              Confirm result
            </button>
          ) : null}
        </>
      ) : null}

      {active && pointer && phase === "fuse" ? (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-border bg-surface2 p-1 shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -50%)" }}
        >
          <svg viewBox="0 0 24 48" className="h-12 w-6">
            <CandlestickSvg cx={12} bodyWidth={10} ohlc={POOL[active.index]!} wickWidth={1} bodyRx={1} />
          </svg>
        </div>
      ) : null}
    </div>
  );
}
