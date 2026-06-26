import type { OhlcPixels } from "@/lib/candleGeometry";
import type { OhlcBar } from "@/lib/timeframeOhlcData";

/** Map real OHLC prices into SVG Y coordinates (smaller Y = higher price). */
export function ohlcBarsToPixels(
  bars: OhlcBar[],
  chartTop: number,
  chartBottom: number,
  paddingRatio = 0.12,
): OhlcPixels[] {
  if (bars.length === 0) return [];

  let lo = Infinity;
  let hi = -Infinity;
  for (const b of bars) {
    lo = Math.min(lo, b.l);
    hi = Math.max(hi, b.h);
  }

  const range = hi - lo || 1;
  const pad = range * paddingRatio;
  const minP = lo - pad;
  const maxP = hi + pad;
  const span = maxP - minP;
  const plotH = chartBottom - chartTop;

  const y = (price: number) => chartTop + ((maxP - price) / span) * plotH;

  return bars.map((b) => ({
    o: y(b.o),
    h: y(b.h),
    l: y(b.l),
    c: y(b.c),
  }));
}

/** Body width that fits N candles in the plot width with a small gap. */
export function bodyWidthForCount(plotWidth: number, count: number, min = 6, max = 28): number {
  if (count <= 0) return max;
  const gap = 4;
  const fit = (plotWidth - gap * (count + 1)) / count;
  return Math.max(min, Math.min(max, fit));
}
