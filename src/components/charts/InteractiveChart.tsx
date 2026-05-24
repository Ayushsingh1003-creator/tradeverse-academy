"use client";

import { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";
import { CANDLESTICK_SERIES_OPTIONS } from "@/lib/candleColors";

type OHLCVBar = { time: string; open: number; high: number; low: number; close: number };

export function InteractiveChart({
  data,
  height = 280,
  question,
  onCandleClick,
}: {
  data: OHLCVBar[];
  mode: "display" | "click_to_identify";
  annotations?: unknown[];
  onCandleClick?: (bar: OHLCVBar) => void;
  showVolume?: boolean;
  showRSI?: boolean;
  showMACD?: boolean;
  height?: number;
  question?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, {
      height,
      layout: { background: { color: "#1E1E1E" }, textColor: "#94A3B8" },
      grid: { vertLines: { color: "rgba(255,255,255,0.10)" }, horzLines: { color: "rgba(255,255,255,0.10)" } },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.20)" },
      timeScale: { borderColor: "rgba(255,255,255,0.20)" },
    });
    const chartApi = chart as unknown as {
      addCandlestickSeries: (options: Record<string, unknown>) => { setData: (data: unknown[]) => void };
      subscribeClick: (cb: (param: { logical?: number }) => void) => void;
      remove: () => void;
    };
    const series = chartApi.addCandlestickSeries({ ...CANDLESTICK_SERIES_OPTIONS });
    series.setData(data.map((bar) => ({ ...bar, time: bar.time as never })));
    chartApi.subscribeClick((param) => {
      const logical = param.logical ?? 0;
      const idx = Math.max(0, Math.min(data.length - 1, Math.round(logical)));
      onCandleClick?.(data[idx]);
    });
    return () => chartApi.remove();
  }, [data, height, onCandleClick]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      {question ? <p className="mb-2 text-sm">{question}</p> : null}
      <div ref={ref} />
    </div>
  );
}
