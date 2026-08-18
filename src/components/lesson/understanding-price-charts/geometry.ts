import { candleBodyColor } from "@/lib/candleColors";

/**
 * Percent (or arbitrary shared-scale) candle geometry mapped to pixel
 * coordinates inside an SVG viewBox. Mirrors the anatomy-of-a-candle
 * lesson's `geo()` helper — kept as its own copy (rather than an import) so
 * this folder stays self-contained. `scaleMin`/`scaleMax` default to 0-100
 * (percent) but can be overridden so several candles can share one price
 * scale (see the line-vs-candle section, where all six bars are scaled
 * against the min/max of the whole series rather than 0-100 each).
 */
export type CandleGeo = {
  W: number;
  H: number;
  cx: number;
  bw: number;
  bull: boolean;
  o: number;
  h: number;
  l: number;
  c: number;
  bodyX: number;
  bodyY: number;
  bodyH: number;
  upY1: number;
  upY2: number;
  loY1: number;
  loY2: number;
  hy: number;
  ly: number;
  openY: number;
  closeY: number;
  color: string;
};

export function geo(
  o: number,
  h: number,
  l: number,
  c: number,
  W = 240,
  H = 300,
  bw = 64,
  pad = 22,
  scaleMin = 0,
  scaleMax = 100,
): CandleGeo {
  const dh = H - pad * 2;
  const cx = W / 2;
  const range = scaleMax - scaleMin || 1;
  const y = (p: number) => +(pad + (1 - (p - scaleMin) / range) * dh).toFixed(1);
  const bull = c >= o;
  const bt = y(Math.max(o, c));
  const bb = y(Math.min(o, c));
  return {
    W,
    H,
    cx,
    bw,
    bull,
    o,
    h,
    l,
    c,
    bodyX: +(cx - bw / 2).toFixed(1),
    bodyY: bt,
    bodyH: +Math.max(3, bb - bt).toFixed(1),
    upY1: y(h),
    upY2: bt,
    loY1: bb,
    loY2: y(l),
    hy: y(h),
    ly: y(l),
    openY: y(o),
    closeY: y(c),
    color: candleBodyColor(bull),
  };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Evenly-spaced x position for the i-th of n points — matches lineChartGeo's own X(). */
export function seriesX(i: number, n: number, W: number, px: number): number {
  return +(px + (n === 1 ? 0 : (i * (W - 2 * px)) / (n - 1))).toFixed(1);
}

export type LineChartPoint = { cx: number; cy: number; val: number; i: number };
export type LineChartGeo = { pts: string; dots: LineChartPoint[]; min: number; max: number };

/**
 * Maps a raw price series (arbitrary numbers, not 0-100 percent) onto pixel
 * coordinates inside a viewBox, auto-scaling to the series' own min/max
 * unless forceMin/forceMax are supplied. This is the "line chart" building
 * block used throughout the lesson — every polyline, trend card and
 * multi-candle scale in this file is built from it.
 */
export function lineChartGeo(
  series: number[],
  W: number,
  H: number,
  px: number,
  pt: number,
  pb: number,
  forceMin?: number,
  forceMax?: number,
): LineChartGeo {
  const min = forceMin ?? Math.min(...series);
  const max = forceMax ?? Math.max(...series);
  const rng = max - min || 1;
  const n = series.length;
  const X = (i: number) => +(px + (n === 1 ? 0 : (i * (W - 2 * px)) / (n - 1))).toFixed(1);
  const Y = (v: number) => +(pt + (1 - (v - min) / rng) * (H - pt - pb)).toFixed(1);
  const dots: LineChartPoint[] = series.map((v, i) => ({ cx: X(i), cy: Y(v), val: v, i }));
  return { pts: dots.map((d) => `${d.cx},${d.cy}`).join(" "), dots, min, max };
}
