import { candleBodyColor } from "@/lib/candleColors";

/**
 * Percent-based candle geometry (0-100 scale for o/h/l/c, matching slider inputs)
 * mapped to pixel coordinates inside an SVG viewBox. Mirrors the Claude Design
 * prototype's `geo()` helper so every section can share one mental model.
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
