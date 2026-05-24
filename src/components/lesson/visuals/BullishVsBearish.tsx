"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";

export function BullishVsBearish() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 md:flex-row md:justify-center md:gap-12">
      <div className="text-center">
        <svg viewBox="0 0 140 220" className="mx-auto h-56 w-32">
          <CandlestickSvg cx={70} bodyWidth={50} ohlc={TEACHING_CANDLES.compareBullish} bodyRx={4} />
        </svg>
        <p className="mt-2 font-semibold text-[#22C55E]">BUYERS WON</p>
        <p className="mt-1 text-sm text-text-muted">Close &gt; Open</p>
      </div>
      <div className="hidden text-3xl text-accent md:block">↔</div>
      <div className="text-center">
        <svg viewBox="0 0 140 220" className="mx-auto h-56 w-32">
          <CandlestickSvg cx={70} bodyWidth={50} ohlc={TEACHING_CANDLES.compareBearish} bodyRx={4} />
        </svg>
        <p className="mt-2 font-semibold text-red-400">SELLERS WON</p>
        <p className="mt-1 text-sm text-text-muted">Close &lt; Open</p>
      </div>
    </div>
  );
}
