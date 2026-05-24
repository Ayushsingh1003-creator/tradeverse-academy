"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";

const SHOOTING_STAR: typeof TEACHING_CANDLES.compareBearish = { o: 120, h: 20, l: 180, c: 142 };

export function HammerVsShootingStar() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 md:flex-row md:justify-center">
      <div className="text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#22C55E]">Hammer</p>
        <svg viewBox="0 0 120 200" className="mx-auto h-52 w-28">
          <CandlestickSvg cx={60} bodyWidth={36} ohlc={TEACHING_CANDLES.hammerBullish} bodyRx={3} wickWidth={4} />
        </svg>
        <p className="mt-2 text-xs text-text-muted">Bullish reversal · bottom of downtrend</p>
      </div>
      <div className="text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">Shooting star</p>
        <svg viewBox="0 0 120 200" className="mx-auto h-52 w-28">
          <CandlestickSvg cx={60} bodyWidth={36} ohlc={SHOOTING_STAR} bodyRx={3} wickWidth={4} />
        </svg>
        <p className="mt-2 text-xs text-text-muted">Bearish reversal · top of uptrend</p>
      </div>
    </div>
  );
}
