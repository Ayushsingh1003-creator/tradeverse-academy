"use client";

import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";

const MUTED = "#64748b";
const LABEL = "#94a3b8";
const ACCENT = "#7b9fd4";

function BracketLabel({ x, y, h, label, side }: { x: number; y: number; h: number; label: string; side: "left" | "right" }) {
  const bx = side === "left" ? x - 12 : x + 12;
  return (
    <g>
      <path
        d={`M ${bx} ${y} L ${bx + (side === "left" ? -8 : 8)} ${y} L ${bx + (side === "left" ? -8 : 8)} ${y + h} L ${bx} ${y + h}`}
        fill="none"
        stroke={LABEL}
        strokeWidth="1.5"
      />
      <text
        x={side === "left" ? bx - 14 : bx + 14}
        y={y + h / 2 + 4}
        textAnchor={side === "left" ? "end" : "start"}
        fill={ACCENT}
        fontSize="11"
        fontWeight="600"
        letterSpacing="0.05em"
      >
        {label}
      </text>
    </g>
  );
}

/** Magnifying glass over red + green candles — smallest unit of research. */
export function CandleResearchUnit() {
  return (
    <svg viewBox="0 0 320 200" className="mx-auto h-48 w-full max-w-sm">
      <CandlestickSvg cx={100} bodyWidth={28} ohlc={TEACHING_CANDLES.choiceBearish} bodyRx={2} />
      <CandlestickSvg cx={160} bodyWidth={32} ohlc={TEACHING_CANDLES.choiceBullish} bodyRx={2} />
      <CandlestickSvg cx={220} bodyWidth={30} ohlc={TEACHING_CANDLES.choiceBullish} bodyRx={2} />
      <circle cx="175" cy="95" r="52" fill="none" stroke="#F7C325" strokeWidth="3" opacity="0.85" />
      <line x1="215" y1="135" x2="255" y2="175" stroke="#F7C325" strokeWidth="5" strokeLinecap="round" />
      <rect x="200" y="55" width="70" height="55" rx="6" fill="rgba(247,195,37,0.12)" stroke="#F7C325" strokeWidth="1" />
    </svg>
  );
}

/** Single candle with question mark — "what is a candlestick?" opener. */
export function CandleSnapshot() {
  const ohlc = TEACHING_CANDLES.anatomy;
  return (
    <svg viewBox="0 0 200 280" className="mx-auto h-64 w-40">
      <CandlestickSvg cx={100} bodyWidth={56} ohlc={ohlc} bodyRx={4} wickStroke={ACCENT} />
      <text x={100} y={145} textAnchor="middle" fill="#1e293b" fontSize="36" fontWeight="700">
        ?
      </text>
    </svg>
  );
}

/** Body vs shadows anatomy with bracket labels. */
export function BodyShadowParts() {
  const ohlc = TEACHING_CANDLES.anatomy;
  return (
    <svg viewBox="0 0 280 320" className="mx-auto h-72 w-full max-w-xs">
      <CandlestickSvg cx={140} bodyWidth={52} ohlc={ohlc} bodyRx={3} wickStroke={ACCENT} />
      <BracketLabel x={88} y={38} h={244} label="SHADOWS" side="left" />
      <BracketLabel x={192} y={92} h={66} label="BODY" side="right" />
    </svg>
  );
}

/** Red vs green candles with OPEN / CLOSE labels. */
export function BodyOpenClose() {
  return (
    <svg viewBox="0 0 340 300" className="mx-auto h-72 w-full max-w-md">
      <text x={70} y={28} textAnchor="middle" fill="#ef4444" fontSize="11" fontWeight="700">
        PRICE DROP
      </text>
      <CandlestickSvg cx={70} bodyWidth={44} ohlc={TEACHING_CANDLES.compareBearish} bodyRx={3} />
      <text x={70} y={118} textAnchor="middle" fill={LABEL} fontSize="10" fontWeight="600">
        OPEN
      </text>
      <text x={70} y={198} textAnchor="middle" fill={LABEL} fontSize="10" fontWeight="600">
        CLOSE
      </text>
      <text x={70} y={158} textAnchor="middle" fill="#ef4444" fontSize="18">
        ↓
      </text>

      <text x={270} y={28} textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="700">
        PRICE INCREASE
      </text>
      <CandlestickSvg cx={270} bodyWidth={44} ohlc={TEACHING_CANDLES.compareBullish} bodyRx={3} />
      <text x={270} y={198} textAnchor="middle" fill={LABEL} fontSize="10" fontWeight="600">
        OPEN
      </text>
      <text x={270} y={118} textAnchor="middle" fill={LABEL} fontSize="10" fontWeight="600">
        CLOSE
      </text>
      <text x={270} y={158} textAnchor="middle" fill="#22C55E" fontSize="18">
        ↑
      </text>
    </svg>
  );
}

/** Upper / lower shadow labels with highest / lowest price callouts. */
export function ShadowLabels() {
  const ohlc = TEACHING_CANDLES.wickExplainer;
  return (
    <svg viewBox="0 0 320 280" className="mx-auto h-64 w-full max-w-sm">
      <CandlestickSvg cx={160} bodyWidth={48} ohlc={ohlc} bodyRx={3} upperWickStroke="#F7C325" lowerWickStroke="#F7C325" wickWidth={2.5} />
      <text x={48} y={52} fill={ACCENT} fontSize="10" fontWeight="600">
        UPPER SHADOW
      </text>
      <text x={230} y={48} fill={LABEL} fontSize="10">
        HIGHEST PRICE →
      </text>
      <line x1={218} y1={44} x2={168} y2={44} stroke={LABEL} strokeWidth="1" markerEnd="url(#arrow)" />
      <text x={48} y={228} fill={ACCENT} fontSize="10" fontWeight="600">
        LOWER SHADOW
      </text>
      <text x={230} y={232} fill={LABEL} fontSize="10">
        LOWEST PRICE →
      </text>
      <line x1={218} y1={228} x2={168} y2={228} stroke={LABEL} strokeWidth="1" />
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6" fill={LABEL} />
        </marker>
      </defs>
    </svg>
  );
}

/** Hollow outline candle = solid green (bullish terminal styles). */
export function HollowGreenExplainer() {
  const ohlc = TEACHING_CANDLES.compareBullish;
  const { bodyTop, bodyBottom, highY, lowY } = { bodyTop: 70, bodyBottom: 160, highY: 30, lowY: 200 };
  const cx1 = 80;
  const cx2 = 240;
  const bw = 44;
  return (
    <svg viewBox="0 0 320 240" className="mx-auto h-56 w-full max-w-sm">
      <text x={cx1 - 36} y={120} fill={ACCENT} fontSize="11" fontWeight="700">
        HOLLOW
      </text>
      <line x1={cx1} y1={highY} x2={cx1} y2={bodyTop} stroke={ACCENT} strokeWidth="2" />
      <rect x={cx1 - bw / 2} y={bodyTop} width={bw} height={bodyBottom - bodyTop} rx={3} fill="none" stroke={ACCENT} strokeWidth="2.5" />
      <line x1={cx1} y1={bodyBottom} x2={cx1} y2={lowY} stroke={ACCENT} strokeWidth="2" />

      <text x={160} y={120} textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="300">
        =
      </text>

      <text x={cx2 + 36} y={108} fill="#22C55E" fontSize="11" fontWeight="700">
        GREEN
      </text>
      <text x={cx2 + 36} y={124} fontSize="14">
        🐂
      </text>
      <CandlestickSvg cx={cx2} bodyWidth={bw} ohlc={ohlc} bodyRx={3} />
    </svg>
  );
}

/** Full/black candle = red bearish (terminal color conventions). */
export function FullBlackRedExplainer() {
  const ohlc = TEACHING_CANDLES.compareBearish;
  const { bodyTop, bodyBottom, highY, lowY } = { bodyTop: 50, bodyBottom: 140, highY: 30, lowY: 200 };
  const cx1 = 80;
  const cx2 = 240;
  const bw = 44;
  return (
    <svg viewBox="0 0 320 240" className="mx-auto h-56 w-full max-w-sm">
      <text x={cx1 - 40} y={120} fill={ACCENT} fontSize="10" fontWeight="700">
        FULL, BLACK
      </text>
      <line x1={cx1} y1={highY} x2={cx1} y2={bodyTop} stroke={ACCENT} strokeWidth="2" />
      <rect x={cx1 - bw / 2} y={bodyTop} width={bw} height={bodyBottom - bodyTop} rx={3} fill={MUTED} stroke={ACCENT} strokeWidth="1" />
      <line x1={cx1} y1={bodyBottom} x2={cx1} y2={lowY} stroke={ACCENT} strokeWidth="2" />

      <text x={160} y={120} textAnchor="middle" fill="#f1f5f9" fontSize="22" fontWeight="300">
        =
      </text>

      <text x={cx2 + 36} y={108} fill="#ef4444" fontSize="11" fontWeight="700">
        RED
      </text>
      <text x={cx2 + 36} y={124} fontSize="14">
        🐻
      </text>
      <CandlestickSvg cx={cx2} bodyWidth={bw} ohlc={ohlc} bodyRx={3} />
    </svg>
  );
}

/** Four candlestick form variants in a row. */
export function CandleForms() {
  const forms = [
    { ohlc: { o: 100, h: 60, l: 140, c: 100 }, label: "" },
    { ohlc: { o: 95, h: 50, l: 145, c: 105 }, label: "" },
    { ohlc: TEACHING_CANDLES.choiceBullish, label: "" },
    { ohlc: TEACHING_CANDLES.choiceHammer, label: "" },
  ];
  return (
    <svg viewBox="0 0 320 180" className="mx-auto h-44 w-full max-w-sm">
      {forms.map((f, i) => (
        <CandlestickSvg key={i} cx={50 + i * 75} bodyWidth={28} ohlc={f.ohlc} bodyRx={2} wickStroke={ACCENT} />
      ))}
    </svg>
  );
}

/** Single bullish candle on a price grid — used with MCQ about OHLC values. */
export function OhlcPriceChart() {
  const prices = [1.13, 1.12, 1.11, 1.1, 1.09, 1.08, 1.07, 1.06];
  const chartTop = 30;
  const chartBottom = 250;
  const chartLeft = 40;
  const chartRight = 220;
  const priceToY = (p: number) => chartTop + ((1.13 - p) / 0.07) * (chartBottom - chartTop);

  const open = 1.09;
  const close = 1.12;
  const high = 1.13;
  const low = 1.06;

  const cx = 130;
  const bw = 36;
  const ohlc = {
    o: priceToY(open),
    c: priceToY(close),
    h: priceToY(high),
    l: priceToY(low),
  };

  return (
    <svg viewBox="0 0 280 280" className="mx-auto h-72 w-full max-w-xs">
      {prices.map((p) => {
        const y = priceToY(p);
        return (
          <g key={p}>
            <line x1={chartLeft} y1={y} x2={chartRight} y2={y} stroke="rgba(148,163,184,0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={chartRight + 8} y={y + 4} fill={LABEL} fontSize="10">
              {p.toFixed(2)}
            </text>
          </g>
        );
      })}
      <CandlestickSvg cx={cx} bodyWidth={bw} ohlc={ohlc} bodyRx={2} wickWidth={2} />
    </svg>
  );
}
