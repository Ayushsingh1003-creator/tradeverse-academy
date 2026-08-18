"use client";

import { useId, useState } from "react";
import type { LibraryLearnProgressEntry } from "@/lib/libraryProgress";

const SIZE = 28;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2;

function polar(angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function sectorPath(startAngle: number, endAngle: number) {
  const sweep = endAngle - startAngle;
  if (sweep >= 359.99) {
    return `M ${CX} ${CY} m -${R} 0 a ${R} ${R} 0 1 0 ${R * 2} 0 a ${R} ${R} 0 1 0 -${R * 2} 0`;
  }
  const start = polar(startAngle);
  const end = polar(startAngle + sweep);
  const large = sweep > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

function PieDisk({ correct, missed, pending }: { correct: number; missed: number; pending: number }) {
  const total = correct + missed + pending || 1;
  const slices: { value: number; color: string }[] = [
    { value: correct, color: "#456DFF" },
    { value: missed, color: "#F7C325" },
    { value: pending, color: "rgba(255,255,255,0.12)" },
  ].filter((s) => s.value > 0);

  let angle = 0;
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0">
      {slices.map((slice, i) => {
        const sweep = (slice.value / total) * 360;
        const d = sectorPath(angle, angle + sweep);
        angle += sweep;
        return <path key={i} d={d} fill={slice.color} />;
      })}
    </svg>
  );
}

export function LibraryLessonPracticePie({
  title,
  entry,
  loading,
}: {
  title: string;
  entry?: LibraryLearnProgressEntry;
  loading?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  const practiceCorrect = entry?.practiceCorrect ?? 0;
  const practiceTotal = entry?.practiceTotal ?? 0;
  const lessonCompleted = entry?.lessonCompleted ?? false;
  const practicePercent = entry?.practicePercent ?? null;

  const correct = practiceTotal > 0 ? practiceCorrect : 0;
  const missed = practiceTotal > 0 ? practiceTotal - practiceCorrect : 0;
  const pending = practiceTotal > 0 ? 0 : 1;

  const centerLabel = loading
    ? "…"
    : practicePercent != null
      ? `${practicePercent}%`
      : lessonCompleted
        ? "✓"
        : "—";

  const detailLine =
    practiceTotal > 0
      ? `${practiceCorrect} of ${practiceTotal} practice questions correct (${practicePercent}%)`
      : lessonCompleted
        ? "Lesson completed — practice not scored yet"
        : "Not started — open lesson to begin";

  return (
    <div
      className="relative shrink-0 bg-transparent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {open ? (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full right-0 z-50 mb-1.5 w-52 rounded-xl border border-white/10 bg-[#1E1E1E] p-3 text-left shadow-xl"
        >
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="mt-1 text-[11px] leading-snug text-text-muted">{detailLine}</p>
          {practiceTotal > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#456DFF]" /> Correct
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F7C325]" /> Missed
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="relative bg-transparent"
        aria-describedby={open ? tooltipId : undefined}
        title={open ? undefined : detailLine}
      >
        <PieDisk correct={correct} missed={missed} pending={pending} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none text-white drop-shadow-sm">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}
