"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";

type Props = {
  items: string[];
  correctOrder: number[];
  onCheckResult: (correct: boolean) => void;
  onTryAgain?: () => void;
};

type DragSource = { kind: "pool"; itemIndex: number } | { kind: "slot"; slotIndex: number; itemIndex: number };

function chipClass(active: boolean, disabled: boolean) {
  return `flex h-[4.25rem] w-[4.25rem] shrink-0 select-none items-center justify-center rounded-xl border-2 text-sm font-bold touch-none ${
    disabled
      ? "pointer-events-none opacity-30"
      : active
        ? "scale-105 border-accent bg-accent/20 text-accent ring-2 ring-accent/30 cursor-grabbing"
        : "cursor-grab border-white/15 bg-white/[0.04] text-[#88C9F7] hover:border-accent/50"
  }`;
}

function emptySlotClass(highlight: boolean, correct: boolean, wrong: boolean) {
  if (correct) return "border-[#456DFF] bg-[rgba(69,109,255,0.12)]";
  if (wrong) return "border-red-400 bg-red-500/10";
  if (highlight) return "border-accent bg-accent/10 ring-2 ring-accent/20";
  return "border-dashed border-white/15 bg-white/[0.02]";
}

/** Drag timeframe codes into slots — shortest → longest, horizontal squares with < between. */
export function TimeframeOrderDrag({ items, correctOrder, onCheckResult, onTryAgain }: Props) {
  const slotCount = correctOrder.length;
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(slotCount).fill(null));
  const [checked, setChecked] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DragSource | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [hoverSlot, setHoverSlot] = useState<number | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const usedIndices = new Set(slots.filter((s): s is number => s != null));
  const allFilled = slots.every((s) => s != null);

  const findSlotAt = useCallback(
    (clientX: number, clientY: number) => {
      for (let i = 0; i < slotCount; i++) {
        const el = slotRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return i;
      }
      return null;
    },
    [slotCount],
  );

  const placeInSlot = useCallback((slotIndex: number, itemIndex: number, source?: DragSource) => {
    setSlots((prev) => {
      const next = [...prev];
      if (source?.kind === "slot") next[source.slotIndex] = null;
      const existingSlot = next.findIndex((s) => s === itemIndex);
      if (existingSlot >= 0) next[existingSlot] = null;
      next[slotIndex] = itemIndex;
      return next;
    });
  }, []);

  const finishDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!activeDrag || checked) return;
      const slot = findSlotAt(clientX, clientY);
      if (slot != null) placeInSlot(slot, activeDrag.itemIndex, activeDrag);
      else if (activeDrag.kind === "slot") {
        setSlots((prev) => {
          const next = [...prev];
          next[activeDrag.slotIndex] = null;
          return next;
        });
      }
      setActiveDrag(null);
      setPointer(null);
      setHoverSlot(null);
    },
    [activeDrag, checked, findSlotAt, placeInSlot],
  );

  useEffect(() => {
    if (!activeDrag) return;
    const onMove = (e: PointerEvent) => {
      setPointer({ x: e.clientX, y: e.clientY });
      setHoverSlot(findSlotAt(e.clientX, e.clientY));
    };
    const onUp = (e: PointerEvent) => finishDrag(e.clientX, e.clientY);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [activeDrag, findSlotAt, finishDrag]);

  function startDrag(source: DragSource, x: number, y: number) {
    if (checked) return;
    setActiveDrag(source);
    setPointer({ x, y });
  }

  function handleCheck() {
    const ok = slots.every((itemIdx, slotIdx) => itemIdx === correctOrder[slotIdx]);
    setChecked(true);
    onCheckResult(ok);
  }

  function handleReset() {
    setSlots(Array(slotCount).fill(null));
    setChecked(false);
    setActiveDrag(null);
    onTryAgain?.();
  }

  function slotCorrect(slotIdx: number) {
    return checked && slots[slotIdx] === correctOrder[slotIdx];
  }

  function slotWrong(slotIdx: number) {
    return checked && slots[slotIdx] != null && slots[slotIdx] !== correctOrder[slotIdx];
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between px-1 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        <span>← shorter</span>
        <span>longer →</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-min items-center justify-center gap-1.5 px-1 sm:gap-2">
          {Array.from({ length: slotCount }).map((_, slotIdx) => {
            const itemIdx = slots[slotIdx];
            const code = itemIdx != null ? items[itemIdx] : null;
            const correct = slotCorrect(slotIdx);
            const wrong = slotWrong(slotIdx);
            const highlight = hoverSlot === slotIdx && !!activeDrag;

            return (
              <Fragment key={slotIdx}>
                {slotIdx > 0 ? (
                  <span className="shrink-0 px-0.5 text-lg font-light text-text-muted" aria-hidden>
                    &lt;
                  </span>
                ) : null}
                <div
                  ref={(el) => {
                    slotRefs.current[slotIdx] = el;
                  }}
                  className={`flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-xl border-2 transition-colors ${emptySlotClass(highlight, correct, wrong)}`}
                >
                  {code ? (
                    <div
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        startDrag({ kind: "slot", slotIndex: slotIdx, itemIndex: itemIdx! }, e.clientX, e.clientY);
                      }}
                      className={chipClass(activeDrag?.itemIndex === itemIdx, checked)}
                    >
                      {code}
                    </div>
                  ) : null}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {items.map((code, itemIdx) => {
          if (usedIndices.has(itemIdx) && activeDrag?.itemIndex !== itemIdx) return null;
          return (
            <div
              key={code}
              role="button"
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                startDrag({ kind: "pool", itemIndex: itemIdx }, e.clientX, e.clientY);
              }}
              className={chipClass(activeDrag?.itemIndex === itemIdx, checked)}
            >
              {code}
            </div>
          );
        })}
      </div>

      {activeDrag && pointer ? (
        <div
          className="pointer-events-none fixed z-50 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-xl border-2 border-accent bg-accent/25 text-sm font-bold text-accent shadow-xl"
          style={{ left: pointer.x, top: pointer.y, transform: "translate(-50%, -120%)" }}
        >
          {items[activeDrag.itemIndex]}
        </div>
      ) : null}

      {!checked ? (
        <button
          type="button"
          disabled={!allFilled}
          onClick={handleCheck}
          className="h-12 w-full rounded-2xl bg-[#456DFF] font-semibold text-white disabled:opacity-40"
        >
          Check order
        </button>
      ) : (
        <button type="button" onClick={handleReset} className="h-12 w-full rounded-2xl border border-border font-semibold">
          Try again
        </button>
      )}
    </div>
  );
}
