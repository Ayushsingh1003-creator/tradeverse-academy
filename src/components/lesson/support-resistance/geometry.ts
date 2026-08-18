import { candleBodyColor } from "@/lib/candleColors";

/**
 * Percent-based single-candle geometry, mirroring the sibling lessons'
 * geo() helper (copied from understanding-price-charts/geometry.ts, which
 * has the more general scaleMin/scaleMax signature). Kept here for parity
 * with every sibling lesson's geometry module even though this lesson's
 * "predict the candle" options end up using the simpler hardcoded
 * MiniCandle shapes instead (see SupportResistanceLesson.tsx) — the design
 * prototype's own miniCandle() hardcodes literal pixel coordinates per kind,
 * which is simpler and matches the design exactly.
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

/* ---------- multi-candle OHLC bar-chart scale ---------- */

export type CandleBar = { o: number; h: number; l: number; c: number };

export type BarChartScale = {
  W: number;
  H: number;
  padX: number;
  padTop: number;
  padBot: number;
  min: number;
  max: number;
  n: number;
  x: (i: number) => number;
  y: (price: number) => number;
  bw: number;
};

/**
 * Ports the design prototype's `scale(bars,min,max)` — lays out `bars.length`
 * OHLC candles evenly across [padX, W-padX] and maps [min,max] onto
 * [H-padBot, padTop]. Every multi-candle chart in this lesson (all of them
 * are OHLC bar series, unlike the sibling lessons which only ever needed a
 * single candle or a line chart) is built from this.
 */
export function barChartScale(
  bars: CandleBar[],
  min: number,
  max: number,
  W = 840,
  H = 380,
  padX = 60,
  padTop = 28,
  padBot = 30,
): BarChartScale {
  const n = bars.length;
  return {
    W,
    H,
    padX,
    padTop,
    padBot,
    min,
    max,
    n,
    x: (i: number) => padX + (W - 2 * padX) * ((i + 0.5) / n),
    y: (price: number) => padTop + (H - padTop - padBot) * (1 - (price - min) / (max - min)),
    bw: Math.min(((W - 2 * padX) / n) * 0.56, 24),
  };
}

/** A tapped/located point on a bar chart, in price + candle-index space. */
export type ChartPoint = { price: number; x: number; idx: number };

/**
 * Converts a pointer's client position (given the chart SVG's bounding
 * rect) into a price + fractional candle index, mirroring the design's
 * `locate()`. Used by every tap/drag scene's pointer handlers.
 */
export function locateChartPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  sc: BarChartScale,
): ChartPoint {
  const lx = ((clientX - rect.left) / rect.width) * sc.W;
  const ly = ((clientY - rect.top) / rect.height) * sc.H;
  const u = (ly - sc.padTop) / (sc.H - sc.padTop - sc.padBot);
  return {
    price: sc.min + (1 - u) * (sc.max - sc.min),
    x: lx,
    idx: ((lx - sc.padX) / (sc.W - 2 * sc.padX)) * sc.n - 0.5,
  };
}

/** Rounds a price to the nearest ₹5 — matches the design's round5(). */
export function round5(p: number): number {
  return Math.round(p / 5) * 5;
}

/** ₹-formats a price with Indian digit grouping, matching the design's fmt(). */
export function formatPrice(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
