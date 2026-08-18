import type { OhlcPixels } from "@/lib/candleGeometry";
import type { ChartCompareVariant } from "@/types/lessonPage";

/** Same price action for every compare option — only the time axis labels differ. */
export const COMPARE_CANDLES: OhlcPixels[] = [
  { o: 82, h: 74, l: 84, c: 78 },
  { o: 78, h: 76, l: 82, c: 80 },
  { o: 80, h: 70, l: 82, c: 72 },
  { o: 72, h: 68, l: 80, c: 76 },
  { o: 76, h: 64, l: 78, c: 68 },
];

export const COMPARE_TIME_LABELS: Record<ChartCompareVariant, string[]> = {
  m5: ["10:00", "10:05", "10:10", "10:15", "10:20"],
  m15: ["10:00", "10:15", "10:30", "10:45", "11:00"],
  h1: ["10:00", "11:00", "12:00", "13:00", "14:00"],
  h4: ["08:00", "12:00", "16:00", "20:00", "00:00"],
  d1: ["Oct 6", "Oct 7", "Oct 8", "Oct 9", "Oct 10"],
};

export const BRACKET_CHART_CANDLES: OhlcPixels[] = [
  { o: 78, h: 70, l: 80, c: 72 },
  { o: 72, h: 68, l: 80, c: 76 },
  { o: 76, h: 62, l: 78, c: 64 },
  { o: 64, h: 56, l: 66, c: 58 },
  { o: 58, h: 52, l: 60, c: 54 },
  { o: 54, h: 48, l: 56, c: 50 },
];

/** Black 1H candle used as the draggable token. */
export const BRACKET_DRAG_CANDLE: OhlcPixels = { o: 36, h: 22, l: 42, c: 28 };

/** x positions for N candles in a plot area. Two candles cluster in the center instead of the edges. */
export function chartXPositions(count: number, start = 28, span = 184): number[] {
  if (count <= 0) return [];
  if (count === 1) return [start + span / 2];
  if (count === 2) {
    const cx = start + span / 2;
    const halfGap = span / 4;
    return [cx - halfGap, cx + halfGap];
  }
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, i) => start + i * step);
}
