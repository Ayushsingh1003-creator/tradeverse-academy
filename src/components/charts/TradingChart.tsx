"use client";

import { createChart, CandlestickData, CandlestickSeries, ColorType } from "lightweight-charts";
import { CANDLESTICK_SERIES_OPTIONS } from "@/lib/candleColors";
import { useEffect, useRef } from "react";

type Props = {
  data?: CandlestickData[];
  height?: number;
};

const fallbackData: CandlestickData[] = [
  { time: "2024-01-11", open: 190, high: 194, low: 188, close: 193 },
  { time: "2024-01-12", open: 193, high: 198, low: 191, close: 197 },
  { time: "2024-01-13", open: 197, high: 199, low: 192, close: 194 },
  { time: "2024-01-14", open: 194, high: 201, low: 193, close: 199 },
];

export function TradingChart({ data = fallbackData, height = 420 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      layout: { background: { type: ColorType.Solid, color: "#1E293B" }, textColor: "#F1F5F9" },
      grid: { vertLines: { color: "#334155" }, horzLines: { color: "#334155" } },
      width: ref.current.clientWidth,
      height,
    });
    const series = chart.addSeries(CandlestickSeries, CANDLESTICK_SERIES_OPTIONS);
    series.setData(data);
    const resize = () => chart.applyOptions({ width: ref.current?.clientWidth ?? 0 });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [data, height]);

  return <div ref={ref} className="w-full rounded-lg border border-border" />;
}
