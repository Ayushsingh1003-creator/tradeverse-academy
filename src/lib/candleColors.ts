/** Standard bullish/bearish candle colors used across lessons and charts. */
export const CANDLE_BULL = "#22C55E";
export const CANDLE_BEAR = "#EF4444";

export function candleBodyColor(bullish: boolean): string {
  return bullish ? CANDLE_BULL : CANDLE_BEAR;
}

export const CANDLESTICK_SERIES_OPTIONS = {
  upColor: CANDLE_BULL,
  downColor: CANDLE_BEAR,
  borderVisible: false,
  wickUpColor: CANDLE_BULL,
  wickDownColor: CANDLE_BEAR,
} as const;
