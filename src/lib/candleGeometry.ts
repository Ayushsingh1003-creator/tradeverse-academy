/**
 * Lesson/chart SVG convention: smaller Y = higher price (inverted screen axis).
 * OHLC fields are pixel Y coordinates, not dollar prices.
 */
export type OhlcPixels = { o: number; h: number; l: number; c: number };

export function isBullishScreenY(openY: number, closeY: number): boolean {
  return closeY < openY;
}

export function candleLayoutFromOhlc({ o, h, l, c }: OhlcPixels) {
  const bullish = isBullishScreenY(o, c);
  const bodyTop = Math.min(o, c);
  const bodyBottom = Math.max(o, c);
  const bodyHeight = Math.max(1, bodyBottom - bodyTop);
  return {
    bullish,
    bodyTop,
    bodyBottom,
    bodyHeight,
    highY: h,
    lowY: l,
    openY: bullish ? bodyBottom : bodyTop,
    closeY: bullish ? bodyTop : bodyBottom,
    cx: 0 as number, // filled by renderer
  };
}

/** Presets for teaching diagrams (viewBox coordinates). */
export const TEACHING_CANDLES = {
  /** DragLabel OHLC bullish — viewBox 0 0 200 360 */
  ohlcBullish: { o: 168, h: 14, l: 328, c: 72 } satisfies OhlcPixels,
  /** LessonBlock drag diagram — viewBox 0 0 220 220 */
  lessonBlockBullish: { o: 150, h: 35, l: 185, c: 80 } satisfies OhlcPixels,
  /** Hammer drag layout — small body at top, long lower wick */
  hammerBullish: { o: 74, h: 12, l: 332, c: 46 } satisfies OhlcPixels,
  /** BullishVsBearish side-by-side — viewBox 0 0 140 220 */
  compareBullish: { o: 160, h: 30, l: 200, c: 70 } satisfies OhlcPixels,
  compareBearish: { o: 50, h: 30, l: 200, c: 140 } satisfies OhlcPixels,
  /** LessonPlayer practice bearish — viewBox 0 0 120 160 */
  practiceBearish: { o: 48, h: 22, l: 142, c: 118 } satisfies OhlcPixels,
  /** CandleAnatomy interactive — viewBox 0 0 320 360 */
  anatomy: { o: 155, h: 40, l: 320, c: 95 } satisfies OhlcPixels,
  anatomyBearish: { o: 95, h: 40, l: 320, c: 155 } satisfies OhlcPixels,
  /** WickExplainer bullish — viewBox 0 0 280 260 */
  wickExplainer: { o: 130, h: 40, l: 220, c: 80 } satisfies OhlcPixels,
} as const;
