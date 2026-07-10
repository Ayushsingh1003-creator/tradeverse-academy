import { candleBodyColor } from "@/lib/candleColors";

/**
 * Percent-based candle geometry (0-100 scale for o/h/l/c, matching slider inputs)
 * mapped to pixel coordinates inside an SVG viewBox. Mirrors the anatomy-of-a-candle
 * lesson's `geo()` helper so every section in this course shares one mental model.
 * Kept as a local copy so this lesson folder stays self-contained.
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

export function geo(o: number, h: number, l: number, c: number, W = 240, H = 300, bw = 64, pad = 22): CandleGeo {
  const dh = H - pad * 2;
  const cx = W / 2;
  const y = (p: number) => +(pad + (1 - p / 100) * dh).toFixed(1);
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

export type LinePoint = { cx: number; cy: number; val: number };

/**
 * Maps a numeric series onto a polyline's point string + dot coordinates inside
 * an SVG viewBox, matching the design prototype's `lc()` helper (used for the
 * live price ticker, the "record a day" chart, and the up/down mini-charts).
 */
export function linePoints(series: number[], W = 480, H = 90, px = 10, pt = 10, pb = 10): { pts: string; dots: LinePoint[] } {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const rng = max - min || 1;
  const n = series.length;
  const X = (i: number) => +(px + (n === 1 ? (W - 2 * px) / 2 : (i * (W - 2 * px)) / (n - 1))).toFixed(1);
  const Y = (v: number) => +(pt + (1 - (v - min) / rng) * (H - pt - pb)).toFixed(1);
  const dots: LinePoint[] = series.map((v, i) => ({ cx: X(i), cy: Y(v), val: v }));
  return { pts: dots.map((d) => `${d.cx},${d.cy}`).join(" "), dots };
}
