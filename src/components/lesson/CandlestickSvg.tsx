"use client";

import { candleBodyColor } from "@/lib/candleColors";
import { candleLayoutFromOhlc, type OhlcPixels } from "@/lib/candleGeometry";

const DEFAULT_WICK = "#94a3b8";

export type CandlestickSvgProps = {
  /** Center X of the candle */
  cx: number;
  bodyWidth: number;
  /** Pixel Y coords (smaller Y = higher price) */
  ohlc: OhlcPixels;
  wickStroke?: string;
  upperWickStroke?: string;
  lowerWickStroke?: string;
  wickWidth?: number;
  upperWickWidth?: number;
  lowerWickWidth?: number;
  bodyRx?: number;
  stroke?: string;
  strokeWidth?: number;
  bodyOpacity?: number;
  upperWickOpacity?: number;
  lowerWickOpacity?: number;
  className?: string;
};

/** Single candle: upper wick → body → lower wick; open/close on correct body edges. */
export function CandlestickSvg({
  cx,
  bodyWidth,
  ohlc,
  wickStroke = DEFAULT_WICK,
  upperWickStroke,
  lowerWickStroke,
  wickWidth = 3,
  upperWickWidth,
  lowerWickWidth,
  bodyRx = 4,
  stroke,
  strokeWidth = 0,
  bodyOpacity = 1,
  upperWickOpacity = 1,
  lowerWickOpacity = 1,
  className,
}: CandlestickSvgProps) {
  const { bullish, bodyTop, bodyBottom, bodyHeight, highY, lowY } = candleLayoutFromOhlc(ohlc);
  const x = cx - bodyWidth / 2;

  return (
    <g className={className}>
      <line
        x1={cx}
        y1={highY}
        x2={cx}
        y2={bodyTop}
        stroke={upperWickStroke ?? wickStroke}
        strokeWidth={upperWickWidth ?? wickWidth}
        strokeLinecap="round"
        opacity={upperWickOpacity}
      />
      <rect
        x={x}
        y={bodyTop}
        width={bodyWidth}
        height={bodyHeight}
        rx={bodyRx}
        fill={candleBodyColor(bullish)}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={bodyOpacity}
      />
      <line
        x1={cx}
        y1={bodyBottom}
        x2={cx}
        y2={lowY}
        stroke={lowerWickStroke ?? wickStroke}
        strokeWidth={lowerWickWidth ?? wickWidth}
        strokeLinecap="round"
        opacity={lowerWickOpacity}
      />
    </g>
  );
}

export type CandleSeriesProps = {
  candles: OhlcPixels[];
  xAt: (index: number) => number;
  bodyWidth: number;
  wickStroke?: string;
  wickWidth?: number;
  bodyRx?: number;
};

/** Renders multiple candles in a row (TrendLines, SupportResistance, ChartTap). */
export function CandleSeriesSvg({
  candles,
  xAt,
  bodyWidth,
  wickStroke = DEFAULT_WICK,
  wickWidth = 1.5,
  bodyRx = 2,
}: CandleSeriesProps) {
  return (
    <>
      {candles.map((ohlc, i) => {
        const cx = xAt(i) + bodyWidth / 2;
        return (
          <CandlestickSvg
            key={i}
            cx={cx}
            bodyWidth={bodyWidth}
            ohlc={ohlc}
            wickStroke={wickStroke}
            wickWidth={wickWidth}
            bodyRx={bodyRx}
          />
        );
      })}
    </>
  );
}
