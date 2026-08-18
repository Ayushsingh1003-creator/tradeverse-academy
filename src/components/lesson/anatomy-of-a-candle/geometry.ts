/**
 * Absolute-price, single-candle chart scale — mirrors the design prototype's
 * `sScale()`. Every scene in this lesson shows one (or two, side-by-side)
 * fixed candles rather than a scrolling multi-bar series, so unlike the
 * trend-lines/support-resistance lessons' `barChartScale`, x is not
 * index-driven — callers place candles at whatever cx they choose.
 */
export type SingleCandleScale = {
  W: number;
  H: number;
  padX: number;
  padTop: number;
  padBot: number;
  min: number;
  max: number;
  y: (price: number) => number;
};

export function singleCandleScale(
  min: number,
  max: number,
  W = 840,
  H = 380,
  padX = 60,
  padTop = 34,
  padBot = 30,
): SingleCandleScale {
  return {
    W,
    H,
    padX,
    padTop,
    padBot,
    min,
    max,
    y: (price: number) => padTop + (H - padTop - padBot) * (1 - (price - min) / (max - min)),
  };
}

/** A located tap point, in price + pixel space (no candle index — single-candle scenes). */
export type PricePoint = { price: number; x: number; y: number };

/**
 * Converts a pointer's client position (given the chart SVG's bounding rect)
 * into a price, mirroring the design's `locate()`.
 */
export function locatePoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  sc: SingleCandleScale,
): PricePoint {
  const ly = ((clientY - rect.top) / rect.height) * sc.H;
  const u = (ly - sc.padTop) / (sc.H - sc.padTop - sc.padBot);
  const lx = ((clientX - rect.left) / rect.width) * sc.W;
  return { price: sc.min + (1 - u) * (sc.max - sc.min), x: lx, y: ly };
}

/** ₹-formats a price with Indian digit grouping, matching the design's fmt(). */
export function formatPrice(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export type CandleBar = { o: number; h: number; l: number; c: number };
