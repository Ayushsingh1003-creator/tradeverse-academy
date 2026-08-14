"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { candleBodyColor } from "@/lib/candleColors";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import {
  barChartScale,
  formatPrice,
  locateChartPoint,
  priceAtIndex,
  round5,
  type BarChartScale,
  type CandleBar,
  type ChartPoint,
  type TrendlineAnchor,
} from "./geometry";
import { TREND_LINES_LESSON_SLUG, TREND_LINES_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  SCENE_TYPES,
  UP,
  UP_MIN,
  UP_MAX,
  UP_TL,
  UP_CHANNEL_OFFSET,
  UP_CHANNEL_BOUNDS,
  UP_CHANNEL_DRAG_BOUNDS,
  UP_CHANNEL_DRAG_INITIAL,
  DRAG_LINE_INITIAL,
  DRAG_LINE_TOLERANCE,
  DN,
  DN_MIN,
  DN_MAX,
  DN_TL,
  BRK,
  BRK_MIN,
  BRK_MAX,
  BRK_TL,
  BREAKOUT_REVEAL_CANDLE,
  BOSS,
  BOSS_MIN,
  BOSS_MAX,
  BOSS_TL,
  BOSS_DECIDE_EXTRA_BARS,
  INTRO_KICKER,
  INTRO_TITLE_LINE1,
  INTRO_TITLE_LINE2,
  INTRO_SUBTITLE,
  INTRO_CHIPS,
  HOOK,
  INTUITION_MCQ,
  STRUCTURE,
  TAP_STRUCTURE,
  WHATIS,
  TYPES,
  TYPES_QUIZ,
  DRAW_TEACH,
  DRAG_LINE,
  VALID_TEACH,
  SPOT_CARDS,
  SPOT_MISTAKE,
  STRENGTH_TEACH,
  STRENGTH_COMPARE,
  MINI_TL,
  MINI_TL_MIN,
  MINI_TL_MAX,
  type MiniTlKind,
  BREAKOUT_TEACH,
  CANDLE_PREDICT_OPTIONS,
  BREAKOUT_PREDICT,
  REJECTION_TEACH,
  TAP_REJECTION,
  CHANNEL_TEACH,
  DRAG_CHANNEL,
  MTF_TEACH,
  MTF_QUIZ,
  CONFLUENCE_TEACH,
  BOSS_TAP,
  BOSS_DECIDE,
  BADGE_TITLE,
  BADGE_SUBTITLE,
  CHECKLIST_ITEMS,
  type CandleKind,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/* ================================================================
 * decorative intro chart — pixel-space candles, not real prices
 * ================================================================ */

const INTRO_CANDLES: Array<[number, number, number, number, number]> = [
  [105, 291, 278, 270, 298],
  [150, 278, 256, 249, 284],
  [195, 256, 222, 215, 262],
  [240, 222, 198, 190, 229],
  [285, 200, 214, 197, 222],
  [330, 214, 219, 210, 226],
  [375, 216, 196, 188, 221],
  [420, 196, 160, 150, 201],
  [465, 160, 126, 118, 166],
  [510, 128, 145, 121, 152],
  [555, 145, 152, 140, 160],
  [600, 153, 132, 124, 158],
  [645, 132, 104, 95, 138],
  [690, 104, 82, 70, 110],
];
const INTRO_RINGS: Array<[number, number]> = [
  [150, 283],
  [375, 220],
  [600, 157],
];

/* ================================================================
 * tiny icons — copied verbatim from the sibling lessons' convention
 * ================================================================ */

function CheckIcon({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function XIcon({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function HintIcon({ color = "#fff", size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.45 1 1.2 1 2.1h5c0-.9.4-1.65 1-2.1A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

function SectionEyebrow({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "gold" }) {
  return <div className={`mb-2 text-center text-[11px] font-extrabold tracking-[0.14em] ${tone === "gold" ? "text-gold" : "text-blue-light"}`}>{children}</div>;
}

type FeedbackTone = "correct" | "hint" | "wrong";
type Feedback = { tone: FeedbackTone; text: string } | null;

function FeedbackBanner({ fb, center = false }: { fb: Feedback; center?: boolean }) {
  if (!fb) return null;
  const toneClass: Record<FeedbackTone, string> = {
    correct: "border-blue/40 bg-blue-bg text-blue-light",
    hint: "border-gold/40 bg-gold-bg text-gold-light",
    wrong: "border-wrong/40 bg-wrong-bg text-white",
  };
  return (
    <div className={`inline-flex animate-pop-in items-center gap-2.5 rounded-xl border px-5 py-3 text-left text-sm font-medium ${toneClass[fb.tone]} ${center ? "mx-auto" : ""}`}>
      <span className="shrink-0">{fb.tone === "correct" ? <CheckIcon size={18} /> : fb.tone === "wrong" ? <XIcon size={18} /> : <HintIcon size={18} />}</span>
      <span>{fb.text}</span>
    </div>
  );
}

/* ================================================================
 * chart primitives — ported from support-resistance, plus new
 * trendline/channel/drag-handle primitives this lesson needs
 * ================================================================ */

function ChartGrid({ sc }: { sc: BarChartScale }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = sc.min + ((sc.max - sc.min) * i) / 4;
        const y = sc.y(p);
        return (
          <g key={i}>
            <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={sc.W - sc.padX + 7} y={y + 4} fill="#5c5c5c" fontSize={11} fontFamily={MONO}>
              {Math.round(p).toLocaleString("en-IN")}
            </text>
          </g>
        );
      })}
    </>
  );
}

function ChartCandles({ sc, bars, dimFrom, dimOpacity = 0 }: { sc: BarChartScale; bars: CandleBar[]; dimFrom?: number; dimOpacity?: number }) {
  return (
    <>
      {bars.map((b, i) => {
        const cx = sc.x(i);
        const color = candleBodyColor(b.c >= b.o);
        const top = sc.y(Math.max(b.o, b.c));
        const bot = sc.y(Math.min(b.o, b.c));
        const dim = dimFrom != null && i > dimFrom;
        return (
          <g
            key={i}
            className={dim ? undefined : "candle-bar"}
            style={{ opacity: dim ? dimOpacity : 1, animationDelay: dim ? undefined : `${Math.min(i * 26, 900)}ms` }}
          >
            <line x1={cx} x2={cx} y1={sc.y(b.h)} y2={top} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <line x1={cx} x2={cx} y1={bot} y2={sc.y(b.l)} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <rect x={cx - sc.bw / 2} y={top} width={sc.bw} height={Math.max(2, bot - top)} rx={2} fill={color} />
          </g>
        );
      })}
    </>
  );
}

function TrendLineOverlay({
  sc,
  anchor,
  tone = "blue",
  dash,
  glow,
  strong,
  label,
  above,
  delay = 0,
  labelGap = 24,
}: {
  sc: BarChartScale;
  anchor: TrendlineAnchor;
  tone?: "blue" | "red" | "gold";
  dash?: string;
  glow?: boolean;
  strong?: boolean;
  label?: string;
  above?: boolean;
  delay?: number;
  /** Extra vertical clearance between the line and its label chip — bump this when a pivot dot sits near the line's default label position (e.g. near idx2, close to the chip's home at idx -0.5). */
  labelGap?: number;
}) {
  const pL = priceAtIndex(anchor, -0.5);
  const pR = priceAtIndex(anchor, sc.n - 0.5);
  const c = tone === "red" ? "255,93,93" : tone === "gold" ? "247,195,37" : "69,109,255";
  const y1 = sc.y(pL);
  const y2 = sc.y(pR);
  const labelW = label ? label.length * 6.4 + 18 : 0;
  const labelY = label ? Math.max(sc.padTop + 2, (above ? y2 : y1) + (above ? 4 : -labelGap)) : 0;
  const labelX = above ? sc.W - sc.padX - labelW - 6 : sc.padX + 8;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay }}>
      <line
        x1={sc.padX}
        x2={sc.W - sc.padX}
        y1={y1}
        y2={y2}
        stroke={`rgb(${c})`}
        strokeWidth={strong ? 3 : 2.4}
        strokeDasharray={dash ?? "none"}
        strokeLinecap="round"
        style={glow ? { filter: `drop-shadow(0 0 8px rgba(${c},.6))` } : undefined}
      />
      {label ? (
        <>
          <rect x={labelX} y={labelY} width={labelW} height={20} rx={5} fill={`rgba(${c},0.92)`} />
          <text x={labelX + 9} y={labelY + 14} fill={tone === "gold" ? "#141414" : "#fff"} fontSize={11} fontWeight={800} letterSpacing="0.03em">
            {label}
          </text>
        </>
      ) : null}
    </motion.g>
  );
}

function ChannelFill({ sc, anchor, offset }: { sc: BarChartScale; anchor: TrendlineAnchor; offset: number }) {
  const pL = priceAtIndex(anchor, -0.5);
  const pR = priceAtIndex(anchor, sc.n - 0.5);
  const x0 = sc.padX;
  const x1 = sc.W - sc.padX;
  const points = `${x0},${sc.y(pL)} ${x1},${sc.y(pR)} ${x1},${sc.y(pR + offset)} ${x0},${sc.y(pL + offset)}`;
  return <polygon points={points} fill="rgba(69,109,255,0.07)" />;
}

function DragHandle({ sc, x, price, onDragStart }: { sc: BarChartScale; x: number; price: number; onDragStart: (e: React.PointerEvent) => void }) {
  const y = sc.y(price);
  return (
    <g className="cursor-ns-resize" onPointerDown={onDragStart}>
      <circle cx={x} cy={y} r={16} fill="transparent" />
      <circle cx={x} cy={y} r={8} fill="#88C9F7" stroke="#fff" strokeWidth={2} />
      <text x={x} y={y - 16} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
        {formatPrice(price)}
      </text>
    </g>
  );
}

function ChartArrow({ sc, idx, price, dir, color }: { sc: BarChartScale; idx: number; price: number; dir: "up" | "down"; color: string }) {
  const x = sc.x(idx);
  const y = sc.y(price);
  const d = dir === "up" ? 1 : -1;
  return (
    <path
      d={`M${x} ${y + d * 30} L${x} ${y + d * 8} M${x - 6} ${y + d * 17} L${x} ${y + d * 8} L${x + 6} ${y + d * 17}`}
      stroke={color}
      strokeWidth={2.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function PivotDot({ sc, idx, price, label, color }: { sc: BarChartScale; idx: number; price: number; label?: string; color: string }) {
  const x = sc.x(idx);
  const y = sc.y(price);
  return (
    <g>
      <circle cx={x} cy={y} r={6} fill="none" stroke={color} strokeWidth={2.4} />
      <circle cx={x} cy={y} r={2.5} fill={color} />
      {label ? (
        <text x={x} y={y + (label.includes("HIGH") || label.includes("peak") ? -14 : 24)} fill={color} fontSize={10.5} fontWeight={800} textAnchor="middle" letterSpacing="0.05em">
          {label}
        </text>
      ) : null}
    </g>
  );
}

function TapMarker({ sc, point, num }: { sc: BarChartScale; point: ChartPoint; num?: number }) {
  const x = Math.max(sc.padX, Math.min(sc.W - sc.padX, point.x));
  const y = sc.y(point.price);
  return (
    <g>
      <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="#88C9F7" strokeWidth={num ? 1.2 : 1.4} strokeDasharray="5 4" />
      <circle cx={x} cy={y} r={8} fill="rgba(136,201,247,0.25)" stroke="#88C9F7" strokeWidth={2} />
      <circle cx={x} cy={y} r={2.5} fill="#fff" />
      {num != null ? (
        <text x={x} y={y - 13} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="middle">
          {num}
        </text>
      ) : null}
    </g>
  );
}

function ChartSvg({
  sc,
  svgRef,
  onPointerMove,
  onPointerUp,
  tapHit,
  children,
}: {
  sc: BarChartScale;
  svgRef?: React.Ref<SVGSVGElement>;
  onPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
  tapHit?: (e: React.PointerEvent<SVGRectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${sc.W} ${sc.H}`}
      width="100%"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className="block touch-none select-none rounded-2xl border border-border bg-black"
    >
      <ChartGrid sc={sc} />
      {children}
      {tapHit ? (
        <rect
          x={sc.padX}
          y={sc.padTop}
          width={sc.W - 2 * sc.padX}
          height={sc.H - sc.padTop - sc.padBot}
          fill="transparent"
          className="cursor-crosshair"
          onPointerDown={tapHit}
        />
      ) : null}
    </svg>
  );
}

function MiniCandle({ kind }: { kind: CandleKind }) {
  const W = 60;
  const H = 92;
  const cx = 30;
  let bodyTop: number;
  let bodyBot: number;
  let wickTop: number;
  let wickBot: number;
  let color: string;
  if (kind === "bull") {
    color = "#22c55e";
    wickTop = 10;
    wickBot = 84;
    bodyTop = 20;
    bodyBot = 74;
  } else if (kind === "hammer") {
    color = "#22c55e";
    wickTop = 8;
    wickBot = 86;
    bodyTop = 14;
    bodyBot = 34;
  } else if (kind === "bear") {
    color = "#ef4444";
    wickTop = 8;
    wickBot = 86;
    bodyTop = 18;
    bodyBot = 76;
  } else {
    color = "#94a3b8";
    wickTop = 12;
    wickBot = 82;
    bodyTop = 44;
    bodyBot = 50;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={44} height={68} className="block">
      <line x1={cx} x2={cx} y1={wickTop} y2={wickBot} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <rect x={cx - 13} y={bodyTop} width={26} height={Math.max(3, bodyBot - bodyTop)} rx={3} fill={color} />
    </svg>
  );
}

function MiniTrendlineChart({ kind }: { kind: MiniTlKind }) {
  const cfg = MINI_TL[kind];
  const W = 340;
  const H = 160;
  const pad = 14;
  const n = cfg.bars.length;
  const x = (i: number) => pad + (W - 2 * pad) * ((i + 0.5) / n);
  const y = (v: number) => pad + (H - 2 * pad) * (1 - (v - MINI_TL_MIN) / (MINI_TL_MAX - MINI_TL_MIN));
  const bw = Math.min(((W - 2 * pad) / n) * 0.5, 13);
  const c = cfg.tone === "down" ? "255,93,93" : "69,109,255";
  const ly0 = y(cfg.line[0]);
  const ly1 = y(cfg.line[1]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="rounded-[10px] border border-border bg-black">
      {cfg.bars.map((b, i) => {
        const color = candleBodyColor(b.c >= b.o);
        const t = y(Math.max(b.o, b.c));
        const bt = y(Math.min(b.o, b.c));
        return (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={t} stroke={color} strokeWidth={1.6} />
            <line x1={x(i)} x2={x(i)} y1={bt} y2={y(b.l)} stroke={color} strokeWidth={1.6} />
            <rect x={x(i) - bw / 2} y={t} width={bw} height={Math.max(1.5, bt - t)} fill={color} />
          </g>
        );
      })}
      <line x1={pad} x2={W - pad} y1={ly0} y2={ly1} stroke={`rgb(${c})`} strokeWidth={2.4} strokeLinecap="round" />
      {cfg.touch.map((ti) => {
        const ly = ly0 + (ly1 - ly0) * ((ti + 0.5) / n);
        return <circle key={ti} cx={x(ti)} cy={ly} r={4.5} fill="none" stroke="#F7C325" strokeWidth={2} />;
      })}
      <rect x={pad + 6} y={H - 26} width={cfg.label.length * 6.2 + 14} height={18} rx={4} fill={`rgba(${c},0.9)`} />
      <text x={pad + 13} y={H - 13} fill="#fff" fontSize={10.5} fontWeight={800}>
        {cfg.label}
      </text>
    </svg>
  );
}

/* ================================================================
 * option renderers
 * ================================================================ */

function McqOptions({
  options,
  correctIndex,
  sel,
  phase,
  onSelect,
}: {
  options: string[];
  correctIndex: number;
  sel: number | null;
  phase: Phase;
  onSelect: (i: number) => void;
}) {
  const locked = phase === "correct" || phase === "wrong";
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((label, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== correctIndex;
        return (
          <button
            key={label}
            type="button"
            disabled={locked}
            onClick={() => onSelect(idx)}
            className={`flex items-center gap-3 rounded-xl border-[1.5px] px-4 py-[15px] text-left text-[15px] font-medium text-white transition-all duration-150 ${
              rightReveal ? "border-blue bg-blue-bg shadow-blue-glow" : wrongChosen ? "border-wrong/55 bg-wrong-bg" : chosen ? "border-blue bg-blue-bg" : "border-border bg-white/[0.04]"
            } ${locked ? "cursor-default" : "cursor-pointer"} ${wrongChosen ? "animate-wrong-shake" : rightReveal ? "animate-pop-in" : ""}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-[1.5px] text-xs font-extrabold ${
                chosen || rightReveal ? "border-blue text-blue-light" : wrongChosen ? "border-wrong text-wrong" : "border-border-strong text-text-muted"
              }`}
            >
              {rightReveal ? <CheckIcon size={13} color="currentColor" /> : wrongChosen ? <XIcon size={12} color="currentColor" /> : String.fromCharCode(65 + idx)}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function CandleOptions({ sel, phase, onSelect }: { sel: number | null; phase: Phase; onSelect: (i: number) => void }) {
  const locked = phase === "correct" || phase === "wrong";
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {CANDLE_PREDICT_OPTIONS.map((o, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === BREAKOUT_PREDICT.correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== BREAKOUT_PREDICT.correctIndex;
        return (
          <button
            key={o.kind}
            type="button"
            disabled={locked}
            onClick={() => onSelect(idx)}
            className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] px-1.5 pb-2.5 pt-3.5 transition-all ${
              rightReveal ? "border-blue bg-blue-bg shadow-blue-glow" : wrongChosen ? "border-wrong/55 bg-wrong-bg" : chosen ? "border-blue bg-blue-bg" : "border-border bg-white/[0.03]"
            } ${locked ? "cursor-default" : "cursor-pointer"}`}
          >
            <MiniCandle kind={o.kind} />
            <span className="text-center text-[11.5px] font-semibold text-[#bbb]">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SpotTrendlineCards({ sel, phase, onSelect }: { sel: number | null; phase: Phase; onSelect: (i: number) => void }) {
  const locked = phase === "correct" || phase === "wrong";
  const W = 180;
  const H = 120;
  const pad = 10;
  const min = 12;
  const max = 54;
  const y = (v: number) => pad + (H - 2 * pad) * (1 - (v - min) / (max - min));
  return (
    <div className="grid grid-cols-3 gap-3">
      {SPOT_CARDS.map((cf, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === SPOT_MISTAKE.correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== SPOT_MISTAKE.correctIndex;
        const lineCol = cf.tone === "bad" && rightReveal ? "#FF5D5D" : "#88C9F7";
        const n = cf.bars.length;
        const x = (i: number) => pad + (W - 2 * pad) * ((i + 0.5) / n);
        const bw = Math.min(((W - 2 * pad) / n) * 0.55, 8);
        return (
          <button
            key={cf.label}
            type="button"
            disabled={locked}
            onClick={() => onSelect(idx)}
            className={`flex flex-col gap-2 rounded-xl border-[1.5px] bg-brill-900 p-2.5 text-left transition-all ${
              rightReveal ? "border-blue shadow-blue-glow" : wrongChosen ? "border-wrong/55" : chosen ? "border-blue" : "border-border"
            } ${locked ? "cursor-default" : "cursor-pointer"}`}
          >
            <div className={`text-xs font-extrabold ${rightReveal ? "text-blue-light" : "text-white"}`}>
              {cf.label}
              {rightReveal ? "  ✓" : wrongChosen ? "  ✕" : ""}
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="rounded-lg bg-black">
              {cf.bars.map((b, i) => {
                const color = candleBodyColor(b.c >= b.o);
                const t = y(Math.max(b.o, b.c));
                const bt = y(Math.min(b.o, b.c));
                return (
                  <g key={i}>
                    <line x1={x(i)} x2={x(i)} y1={y(b.h)} y2={t} stroke={color} strokeWidth={1.5} />
                    <line x1={x(i)} x2={x(i)} y1={bt} y2={y(b.l)} stroke={color} strokeWidth={1.5} />
                    <rect x={x(i) - bw / 2} y={t} width={bw} height={Math.max(1.5, bt - t)} fill={color} />
                  </g>
                );
              })}
              <line x1={pad} x2={W - pad} y1={y(cf.yL)} y2={y(cf.yR)} stroke={lineCol} strokeWidth={2.2} strokeLinecap="round" />
            </svg>
            <div className="text-[11px] leading-snug text-[#999]">{cf.note}</div>
          </button>
        );
      })}
    </div>
  );
}

/* ================================================================
 * state
 * ================================================================ */

type Phase = "idle" | "hint" | "correct" | "wrong";
type DragPart = "tlHandle1" | "tlHandle2" | "channelOffset";

type LessonState = {
  step: number;
  xp: number;
  sessionXp: number;
  qAnswered: number;
  firstTryCorrect: number;
  phase: Phase;
  attempts: number;
  lastAward: number;
  sel: number | null;
  tap: ChartPoint | null;
  taps: ChartPoint[];
  tlP1: number;
  tlP2: number;
  channelOffset: number;
};

const initialState: LessonState = {
  step: 0,
  xp: 0,
  sessionXp: 0,
  qAnswered: 0,
  firstTryCorrect: 0,
  phase: "idle",
  attempts: 0,
  lastAward: 0,
  sel: null,
  tap: null,
  taps: [],
  tlP1: DRAG_LINE_INITIAL.p1,
  tlP2: DRAG_LINE_INITIAL.p2,
  channelOffset: UP_CHANNEL_DRAG_INITIAL,
};

function enterStep(state: LessonState, n: number): LessonState {
  const base: LessonState = {
    ...state,
    step: n,
    phase: "idle",
    attempts: 0,
    lastAward: 0,
    sel: null,
    tap: null,
    taps: [],
  };
  if (n === 9) {
    base.tlP1 = DRAG_LINE_INITIAL.p1;
    base.tlP2 = DRAG_LINE_INITIAL.p2;
  }
  if (n === 19) {
    base.channelOffset = UP_CHANNEL_DRAG_INITIAL;
  }
  return base;
}

function isSceneReady(step: number, state: LessonState): boolean {
  switch (SCENE_TYPES[step]) {
    case "mcq":
    case "spot":
    case "candle":
      return state.sel != null;
    case "tap":
      return state.tap != null;
    case "tapMulti":
      return state.taps.length >= 2;
    default:
      return true;
  }
}

function evalSceneCorrect(step: number, state: LessonState): boolean {
  switch (step) {
    case 2:
      return state.sel === INTUITION_MCQ.correctIndex;
    case 4:
      return TAP_STRUCTURE.lows.every((r) => state.taps.some((t) => t.idx >= r.idxLo && t.idx <= r.idxHi && t.price <= r.pMax));
    case 7:
      return state.sel === TYPES_QUIZ.correctIndex;
    case 9:
      return Math.abs(state.tlP1 - UP_TL.p1) <= DRAG_LINE_TOLERANCE && Math.abs(state.tlP2 - UP_TL.p2) <= DRAG_LINE_TOLERANCE;
    case 11:
      return state.sel === SPOT_MISTAKE.correctIndex;
    case 13:
      return state.sel === STRENGTH_COMPARE.correctIndex;
    case 15:
      return state.sel === BREAKOUT_PREDICT.correctIndex;
    case 17:
      return !!state.tap && state.tap.idx >= TAP_REJECTION.idxMin && state.tap.idx <= TAP_REJECTION.idxMax && state.tap.price >= TAP_REJECTION.priceMin && state.tap.price <= TAP_REJECTION.priceMax;
    case 19:
      return state.channelOffset >= UP_CHANNEL_BOUNDS.min && state.channelOffset <= UP_CHANNEL_BOUNDS.max;
    case 21:
      return state.sel === MTF_QUIZ.correctIndex;
    case 23:
      return !!state.tap && state.tap.idx >= BOSS_TAP.idxMin && state.tap.idx <= BOSS_TAP.idxMax && Math.abs(state.tap.price - priceAtIndex(BOSS_TL, state.tap.idx)) <= BOSS_TAP.tolerance;
    case 24:
      return state.sel === BOSS_DECIDE.correctIndex;
    default:
      return false;
  }
}

const FB_BY_STEP: Partial<Record<number, { hint: string; correct: string; wrong: string }>> = {
  2: INTUITION_MCQ.fb,
  4: TAP_STRUCTURE.fb,
  7: TYPES_QUIZ.fb,
  9: DRAG_LINE.fb,
  11: SPOT_MISTAKE.fb,
  13: STRENGTH_COMPARE.fb,
  15: BREAKOUT_PREDICT.fb,
  17: TAP_REJECTION.fb,
  19: DRAG_CHANNEL.fb,
  21: MTF_QUIZ.fb,
  23: BOSS_TAP.fb,
  24: BOSS_DECIDE.fb,
};

function currentFeedback(step: number, phase: Phase, lastAward: number): Feedback {
  if (phase === "idle") return null;
  const fb = FB_BY_STEP[step];
  if (!fb) return null;
  if (phase === "correct") return { tone: "correct", text: `Correct! +${lastAward} XP — ${fb.correct}` };
  if (phase === "hint") return { tone: "hint", text: `Hint — ${fb.hint}` };
  return { tone: "wrong", text: `${fb.wrong} (+${lastAward} XP for reviewing)` };
}

/* ================================================================ */

export function TrendLinesLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const [dragPart, setDragPart] = useState<DragPart | null>(null);
  const floaterId = useRef(0);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const step = state.step;
  const meta = SECTION_META[step]!;
  const sceneType = SCENE_TYPES[step]!;
  const interactive = sceneType !== "teach" && sceneType !== "summary";
  const resolved = state.phase === "correct" || state.phase === "wrong";
  const ready = isSceneReady(step, state);
  const feedback = currentFeedback(step, state.phase, state.lastAward);

  function awardXp(amt: number) {
    setState((s) => ({ ...s, xp: s.xp + amt, sessionXp: s.sessionXp + amt }));
    const id = ++floaterId.current;
    setFloaters((f) => [...f, { id, amt }]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1000);
  }

  function selectOption(idx: number) {
    if (resolved) return;
    sound.tick();
    setState((s) => ({ ...s, sel: idx }));
  }

  function tapChart(e: React.PointerEvent<SVGRectElement>, sc: BarChartScale) {
    if (resolved) return;
    const svg = svgRef.current;
    if (!svg) return;
    const loc = locateChartPoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
    if (sceneType === "tapMulti") {
      setState((s) => {
        let taps = [...s.taps, loc];
        if (taps.length > 2) taps = taps.slice(taps.length - 2);
        return { ...s, taps };
      });
    } else {
      setState((s) => ({ ...s, tap: loc }));
    }
  }

  function beginDrag(part: DragPart) {
    return (e: React.PointerEvent) => {
      if (resolved) return;
      e.stopPropagation();
      setDragPart(part);
      try {
        (e.target as Element).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
  }

  function onChartDragMove(e: React.PointerEvent<SVGSVGElement>, sc: BarChartScale) {
    if (!dragPart) return;
    const svg = svgRef.current;
    if (!svg) return;
    const loc = locateChartPoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
    const p = round5(loc.price);
    if (dragPart === "tlHandle1") {
      setState((s) => ({ ...s, tlP1: Math.max(sc.min + 10, Math.min(sc.max - 10, p)) }));
    } else if (dragPart === "tlHandle2") {
      setState((s) => ({ ...s, tlP2: Math.max(sc.min + 10, Math.min(sc.max - 10, p)) }));
    } else if (dragPart === "channelOffset") {
      const off = round5(loc.price - priceAtIndex(UP_TL, loc.idx));
      setState((s) => ({ ...s, channelOffset: Math.max(UP_CHANNEL_DRAG_BOUNDS.min, Math.min(UP_CHANNEL_DRAG_BOUNDS.max, off)) }));
    }
  }

  function endDrag() {
    setDragPart(null);
  }

  function checkAnswer() {
    if (!ready) return;
    if (state.attempts === 0) {
      const ok = evalSceneCorrect(step, state);
      if (ok) {
        setState((s) => ({ ...s, phase: "correct", attempts: 1, lastAward: 30, qAnswered: s.qAnswered + 1, firstTryCorrect: s.firstTryCorrect + 1 }));
        awardXp(30);
        sound.correct();
      } else {
        setState((s) => ({ ...s, phase: "hint", attempts: 1 }));
        sound.wrong();
      }
    } else {
      setState((s) => ({ ...s, phase: "wrong", attempts: s.attempts + 1, lastAward: 5, qAnswered: s.qAnswered + 1 }));
      awardXp(5);
    }
  }

  function goBack() {
    sound.tick();
    endDrag();
    if (step === 0) {
      router.push(BACK_HREF);
      return;
    }
    setState((s) => enterStep(s, Math.max(0, s.step - 1)));
  }

  function exitLesson() {
    sound.tick();
    router.push(BACK_HREF);
  }

  function advance() {
    sound.tick();
    endDrag();
    const n = step + 1;
    setState((s) => enterStep(s, n));
    if (n === TOTAL_STEPS) {
      sound.lessonComplete();
      setBurst((b) => ({ id: b.id + 1, count: 64 }));
      completeLesson({ lessonSlug: TREND_LINES_LESSON_SLUG, score: 100, xpEarned: TREND_LINES_LESSON_XP });
    }
  }

  function restart() {
    setState(initialState);
    setFloaters([]);
    endDrag();
  }

  function handlePrimary() {
    if (step === TOTAL_STEPS) {
      restart();
      return;
    }
    if (interactive && !resolved) {
      checkAnswer();
      return;
    }
    advance();
  }

  const ctaDisabled = interactive && !resolved && !ready;
  let ctaLabel = "Continue";
  if (step === 0) ctaLabel = "Start lesson";
  else if (sceneType === "summary") ctaLabel = "Restart lesson";
  else if (interactive && !resolved) ctaLabel = "Check answer";

  useScrollCtaIntoView(ctaRef, ctaDisabled);
  const progress = Math.round((step / TOTAL_STEPS) * 100);
  const firstTryPct = Math.round((state.firstTryCorrect / Math.max(1, state.qAnswered)) * 100);

  /* ================================================================ */

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brill-800 text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="pointer-events-none fixed -top-36 left-1/2 z-0 h-[420px] w-[680px] -translate-x-1/2"
        style={{ background: "radial-gradient(ellipse at center, rgba(69,109,255,.14), transparent 70%)" }}
      />
      <Confetti key={burst.id} active={burst.id > 0} count={burst.count} />

      <div className="pointer-events-none fixed right-6 top-14 z-[70] flex flex-col items-end gap-0.5">
        {floaters.map((f) => (
          <div key={f.id} className="animate-float-xp text-lg font-black text-gold [text-shadow:0_2px_8px_rgba(0,0,0,.6)]">
            +{f.amt} XP
          </div>
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-10 flex items-center gap-4 border-b border-border-subtle bg-brill-800/70 px-4 py-3.5 backdrop-blur-md md:px-6">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-brill-700 text-white transition-colors hover:bg-brill-600"
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[13px] font-black tracking-tight"
          style={{ background: "linear-gradient(135deg,#456dff,#2a4ae8)", boxShadow: "0 0 16px rgba(69,109,255,.4)" }}
        >
          TV
        </div>
        <div className="hidden min-w-[170px] shrink-0 sm:block">
          <div className="text-[10px] font-bold tracking-[0.14em] text-text-muted">{COURSE_LABEL}</div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-white">
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-[0.08em] ${
                meta.kind === "quiz" ? "bg-gold-bg text-gold" : meta.kind === "done" ? "bg-gold-bg text-gold" : "bg-blue-bg text-blue-light"
              }`}
            >
              {meta.kind === "quiz" ? "PRACTISE" : meta.kind === "done" ? "DONE" : "LEARN"}
            </span>
            {meta.title}
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3">
          <ProgressBar value={progress} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-gold/30 bg-gold-bg px-3.5 py-1.5">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="#f7c325" stroke="#f7c325" strokeWidth={1.4} strokeLinejoin="round">
            <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12z" />
          </svg>
          <span className="text-sm font-extrabold tabular-nums text-gold">{state.xp}</span>
        </div>
        <button
          type="button"
          onClick={exitLesson}
          aria-label="Exit lesson"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-brill-700 text-white transition-colors hover:border-wrong/40 hover:bg-wrong-bg"
        >
          <XIcon size={18} />
        </button>
      </header>

      {/* STAGE */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {/* ===== S0 INTRO ===== */}
            {step === 0 && (
              <div className="mx-auto max-w-[760px] text-center">
                <div className="mx-auto mb-6 max-w-[460px]">
                  <svg viewBox="50 55 720 290" width="100%" className="block">
                    <motion.line
                      x1={80}
                      y1={301}
                      x2={730}
                      y2={119}
                      stroke="#456DFF"
                      strokeWidth={4}
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.95, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {INTRO_CANDLES.map(([cx, o, c, hi, lo], i) => {
                      const up = c < o;
                      const color = up ? "#22C55E" : "#EF4444";
                      const top = Math.min(o, c);
                      const h = Math.max(2, Math.abs(o - c));
                      return (
                        <motion.g
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.045, 0.65), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <line x1={cx} x2={cx} y1={hi} y2={lo} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
                          <rect x={cx - 6.5} y={top} width={13} height={h} rx={2} fill={color} />
                        </motion.g>
                      );
                    })}
                    {INTRO_RINGS.map(([rx, ry], i) => (
                      <motion.circle
                        key={i}
                        cx={rx}
                        cy={ry}
                        r={11}
                        fill="none"
                        stroke="#88C9F7"
                        strokeWidth={3}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.6 + i * 0.12, duration: 0.35 }}
                      />
                    ))}
                    <motion.circle
                      cx={690}
                      cy={82}
                      r={13}
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth={3}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 2.05, duration: 0.35 }}
                    />
                    <motion.text x={612} y={74} fill="#22C55E" fontSize={12} fontWeight={900} letterSpacing="0.06em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.15 }}>
                      BREAKOUT ▲
                    </motion.text>
                    <motion.text x={96} y={298} fill="#88C9F7" fontSize={12} fontWeight={900} letterSpacing="0.06em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                      TRENDLINE
                    </motion.text>
                  </svg>
                </div>
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-light">{INTRO_KICKER}</div>
                <h1 className="mb-3.5 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[40px]">
                  {INTRO_TITLE_LINE1}
                  <br />
                  {INTRO_TITLE_LINE2}
                </h1>
                <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-relaxed text-text-secondary">{INTRO_SUBTITLE}</p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {INTRO_CHIPS.map((c) => (
                    <div key={c} className="flex items-center gap-2 rounded-xl border border-border bg-brill-700 px-4 py-2.5 text-[13px] font-semibold text-text-secondary">
                      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-blue" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== S1 HOOK ===== */}
            {step === 1 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HOOK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOOK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOOK.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1 }}>
                        <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="UPTREND LINE · diagonal support" />
                        <ChartArrow sc={sc} idx={2} price={22025} dir="up" color="#88C9F7" />
                        <ChartArrow sc={sc} idx={10} price={22155} dir="up" color="#88C9F7" />
                        <ChartArrow sc={sc} idx={18} price={22285} dir="up" color="#88C9F7" />
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S2 INTUITION (mcq) ===== */}
            {step === 2 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const hs = INTUITION_MCQ.hiddenFrom;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{INTUITION_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INTUITION_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INTUITION_MCQ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={UP} dimFrom={resolved ? undefined : hs - 1} dimOpacity={INTUITION_MCQ.hiddenOpacity} />
                        <TrendLineOverlay sc={sc} anchor={UP_TL} dash="5 4" label="RISING TRENDLINE" />
                        {!resolved && (
                          <rect
                            x={sc.x(hs) - 16}
                            y={sc.padTop}
                            width={sc.W - sc.padX - (sc.x(hs) - 16)}
                            height={sc.H - sc.padTop - sc.padBot}
                            fill="rgba(255,255,255,0.03)"
                            stroke="rgba(255,255,255,0.16)"
                            strokeDasharray="6 5"
                            rx={6}
                          />
                        )}
                        {!resolved && (
                          <text x={(sc.x(hs) + sc.W - sc.padX) / 2 - 14} y={sc.padTop + 34} fill="#888" fontSize={30} fontWeight={900}>
                            ?
                          </text>
                        )}
                      </ChartSvg>
                    </div>
                    <McqOptions options={INTUITION_MCQ.options} correctIndex={INTUITION_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S3 STRUCTURE ===== */}
            {step === 3 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const pts = [...STRUCTURE.lows, ...STRUCTURE.highs]
                  .slice()
                  .sort((a, b) => a.idx - b.idx)
                  .map((p) => `${sc.x(p.idx)},${sc.y(p.price)}`)
                  .join(" ");
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{STRUCTURE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{STRUCTURE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{STRUCTURE.prompt}</p>
                    <ChartSvg sc={sc}>
                      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.6} strokeDasharray="5 4" />
                      <ChartCandles sc={sc} bars={UP} />
                      {STRUCTURE.highs.map((p) => (
                        <PivotDot key={`h${p.idx}`} sc={sc} idx={p.idx} price={p.price} label="HH" color="#ff8f8f" />
                      ))}
                      {STRUCTURE.lows.map((p) => (
                        <PivotDot key={`l${p.idx}`} sc={sc} idx={p.idx} price={p.price} label="HL" color="#88C9F7" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S4 TAP STRUCTURE (multi) ===== */}
            {step === 4 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_STRUCTURE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_STRUCTURE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_STRUCTURE.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={UP} />
                      {resolved
                        ? TAP_STRUCTURE.revealLows.map((p) => <PivotDot key={p.idx} sc={sc} idx={p.idx} price={p.price} label="HIGHER LOW" color="#88C9F7" />)
                        : null}
                      {resolved ? <PivotDot sc={sc} idx={TAP_STRUCTURE.revealDecoy.idx} price={TAP_STRUCTURE.revealDecoy.price} label={TAP_STRUCTURE.revealDecoy.label} color="#777" /> : null}
                      {state.taps.map((t, i) => (
                        <TapMarker key={i} sc={sc} point={t} num={i + 1} />
                      ))}
                      <text x={sc.padX + 4} y={sc.padTop + 18} fill="#9db4ff" fontSize={13} fontWeight={800} fontFamily={MONO}>
                        {`Marked ${state.taps.length} / 2`}
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S5 WHATIS ===== */}
            {step === 5 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{WHATIS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WHATIS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WHATIS.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="DIAGONAL SUPPORT" delay={0.9} labelGap={56} />
                      <PivotDot sc={sc} idx={2} price={22052} color="#F7C325" />
                      <PivotDot sc={sc} idx={10} price={22178} color="#F7C325" />
                      <PivotDot sc={sc} idx={18} price={22308} color="#F7C325" />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S6 TYPES ===== */}
            {step === 6 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{TYPES.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TYPES.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TYPES.prompt}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Uptrend line — connects rising lows</div>
                    <MiniTrendlineChart kind="up" />
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Downtrend line — connects falling highs</div>
                    <MiniTrendlineChart kind="down" />
                  </div>
                </div>
              </div>
            )}

            {/* ===== S7 TYPES QUIZ (mcq) ===== */}
            {step === 7 &&
              (() => {
                const sc = barChartScale(DN, DN_MIN, DN_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TYPES_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TYPES_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TYPES_QUIZ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={DN} />
                        {resolved ? (
                          <>
                            <TrendLineOverlay sc={sc} anchor={DN_TL} tone="red" glow above label="DOWNTREND · resistance" />
                            <PivotDot sc={sc} idx={2} price={22552} color="#ff8f8f" />
                            <PivotDot sc={sc} idx={10} price={22422} color="#ff8f8f" />
                            <PivotDot sc={sc} idx={18} price={22292} color="#ff8f8f" />
                          </>
                        ) : null}
                      </ChartSvg>
                    </div>
                    <McqOptions options={TYPES_QUIZ.options} correctIndex={TYPES_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S8 DRAW TEACH ===== */}
            {step === 8 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{DRAW_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DRAW_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DRAW_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="anchored on the wicks" delay={0.9} labelGap={56} />
                      <PivotDot sc={sc} idx={2} price={22052} label="1" color="#F7C325" />
                      <PivotDot sc={sc} idx={10} price={22178} label="2" color="#F7C325" />
                      <PivotDot sc={sc} idx={18} price={22308} label="3" color="#F7C325" />
                      <text x={sc.x(18) + 14} y={sc.y(22308) + 30} fill="#F7C325" fontSize={12} fontWeight={800}>
                        ← 3rd touch = confirmed
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S9 DRAG LINE ===== */}
            {step === 9 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const liveAnchor: TrendlineAnchor = { i1: 2, p1: state.tlP1, i2: 18, p2: state.tlP2 };
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{DRAG_LINE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DRAG_LINE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DRAG_LINE.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} onPointerMove={(e) => onChartDragMove(e, sc)} onPointerUp={endDrag}>
                      <ChartCandles sc={sc} bars={UP} />
                      {resolved && state.phase === "wrong" ? <TrendLineOverlay sc={sc} anchor={UP_TL} dash="6 4" glow label="CORRECT LINE" /> : null}
                      <TrendLineOverlay sc={sc} anchor={liveAnchor} glow={!resolved} />
                      {!resolved ? (
                        <>
                          <DragHandle sc={sc} x={sc.x(2)} price={state.tlP1} onDragStart={beginDrag("tlHandle1")} />
                          <DragHandle sc={sc} x={sc.x(18)} price={state.tlP2} onDragStart={beginDrag("tlHandle2")} />
                        </>
                      ) : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S10 VALID TEACH ===== */}
            {step === 10 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{VALID_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{VALID_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{VALID_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={VALID_TEACH.invalidAnchor} tone="red" dash="5 4" label="✕ forced through bodies" delay={0.7} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="✓ rides the wicks" delay={0.9} />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S11 SPOT ===== */}
            {step === 11 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{SPOT_MISTAKE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SPOT_MISTAKE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SPOT_MISTAKE.prompt}</p>
                <SpotTrendlineCards sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S12 STRENGTH TEACH ===== */}
            {step === 12 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{STRENGTH_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{STRENGTH_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{STRENGTH_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow strong label="STRONG · 3 touches, ~35°" delay={0.9} labelGap={56} />
                      <PivotDot sc={sc} idx={2} price={22052} color="#F7C325" />
                      <PivotDot sc={sc} idx={10} price={22178} color="#F7C325" />
                      <PivotDot sc={sc} idx={18} price={22308} color="#F7C325" />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S13 STRENGTH COMPARE (mcq) ===== */}
            {step === 13 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{STRENGTH_COMPARE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{STRENGTH_COMPARE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{STRENGTH_COMPARE.prompt}</p>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Line A</div>
                    <MiniTrendlineChart kind="weak" />
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Line B</div>
                    <MiniTrendlineChart kind="strong" />
                  </div>
                </div>
                <McqOptions options={STRENGTH_COMPARE.options} correctIndex={STRENGTH_COMPARE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S14 BREAKOUT TEACH ===== */}
            {step === 14 &&
              (() => {
                const sc = barChartScale(BRK, BRK_MIN, BRK_MAX);
                const idx = BREAKOUT_TEACH.breakIdx;
                const breakPrice = priceAtIndex(BRK_TL, idx);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{BREAKOUT_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BREAKOUT_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BREAKOUT_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={BRK} />
                      <TrendLineOverlay sc={sc} anchor={BRK_TL} glow label="UPTREND LINE" delay={0.9} />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.4 }}>
                        <circle cx={sc.x(idx)} cy={sc.y(breakPrice)} r={12} fill="none" stroke="#ff8f8f" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 7px rgba(255,93,93,.6))" }} />
                        <text x={sc.x(idx)} y={sc.y(breakPrice) - 18} fill="#ff8f8f" fontSize={12} fontWeight={800} textAnchor="middle">
                          BREAK ↓
                        </text>
                        <ChartArrow sc={sc} idx={idx} price={breakPrice - 40} dir="down" color="#ff8f8f" />
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S15 BREAKOUT PREDICT (candle) ===== */}
            {step === 15 &&
              (() => {
                const sc = barChartScale(BRK.slice(0, 16), BRK_MIN, BRK_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BREAKOUT_PREDICT.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BREAKOUT_PREDICT.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BREAKOUT_PREDICT.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={BRK.slice(0, 15)} />
                        <TrendLineOverlay sc={sc} anchor={BRK_TL} glow label="TRENDLINE" />
                        {resolved ? (
                          <g className="candle-bar">
                            {(() => {
                              const b = BREAKOUT_REVEAL_CANDLE;
                              const cx = sc.x(15);
                              const color = candleBodyColor(b.c >= b.o);
                              const top = sc.y(Math.max(b.o, b.c));
                              const bot = sc.y(Math.min(b.o, b.c));
                              return (
                                <>
                                  <line x1={cx} x2={cx} y1={sc.y(b.h)} y2={top} stroke={color} strokeWidth={2} strokeLinecap="round" />
                                  <line x1={cx} x2={cx} y1={bot} y2={sc.y(b.l)} stroke={color} strokeWidth={2} strokeLinecap="round" />
                                  <rect x={cx - sc.bw / 2} y={top} width={sc.bw} height={Math.max(2, bot - top)} rx={2} fill={color} />
                                </>
                              );
                            })()}
                          </g>
                        ) : (
                          <rect x={sc.x(15) - 18} y={sc.padTop} width={40} height={sc.H - sc.padTop - sc.padBot} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.16)" strokeDasharray="5 4" rx={5} />
                        )}
                        {resolved ? (
                          <text x={sc.x(15)} y={sc.y(BREAKOUT_REVEAL_CANDLE.l) + 34} fill="#ff8f8f" fontSize={11} fontWeight={800} textAnchor="middle">
                            broke ↓
                          </text>
                        ) : (
                          <text x={sc.x(15) - 6} y={sc.padTop + 30} fill="#888" fontSize={26} fontWeight={900}>
                            ?
                          </text>
                        )}
                      </ChartSvg>
                    </div>
                    <CandleOptions sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S16 REJECTION TEACH ===== */}
            {step === 16 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{REJECTION_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{REJECTION_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{REJECTION_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="TRENDLINE HOLDS" delay={0.9} />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.4 }}>
                        <text x={sc.x(18)} y={sc.y(22308) + 34} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                          bullish rejection
                        </text>
                        <text x={sc.x(18)} y={sc.y(22308) + 48} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                          → trend continues
                        </text>
                        <ChartArrow sc={sc} idx={19} price={22400} dir="up" color="#22c55e" />
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S17 TAP REJECTION ===== */}
            {step === 17 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_REJECTION.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_REJECTION.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_REJECTION.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="RISING TRENDLINE" />
                      {resolved ? <PivotDot sc={sc} idx={18} price={22308} label="REJECTION → LONG" color="#F7C325" /> : null}
                      {resolved && state.phase === "wrong" ? <PivotDot sc={sc} idx={14} price={22470} label="a peak, not a bounce" color="#ff8f8f" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S18 CHANNEL TEACH ===== */}
            {step === 18 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const upperAnchor: TrendlineAnchor = { i1: UP_TL.i1, p1: UP_TL.p1 + UP_CHANNEL_OFFSET, i2: UP_TL.i2, p2: UP_TL.p2 + UP_CHANNEL_OFFSET };
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{CHANNEL_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CHANNEL_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CHANNEL_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <ChannelFill sc={sc} anchor={UP_TL} offset={UP_CHANNEL_OFFSET} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="buy near the floor" delay={0.9} />
                      <TrendLineOverlay sc={sc} anchor={upperAnchor} tone="gold" above label="sell near the ceiling" delay={0.9} />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S19 DRAG CHANNEL ===== */}
            {step === 19 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const liveUpper: TrendlineAnchor = { i1: UP_TL.i1, p1: UP_TL.p1 + state.channelOffset, i2: UP_TL.i2, p2: UP_TL.p2 + state.channelOffset };
                const correctUpper: TrendlineAnchor = { i1: UP_TL.i1, p1: UP_TL.p1 + UP_CHANNEL_OFFSET, i2: UP_TL.i2, p2: UP_TL.p2 + UP_CHANNEL_OFFSET };
                const pL = priceAtIndex(liveUpper, -0.5);
                const pR = priceAtIndex(liveUpper, sc.n - 0.5);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{DRAG_CHANNEL.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DRAG_CHANNEL.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DRAG_CHANNEL.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} onPointerMove={(e) => onChartDragMove(e, sc)} onPointerUp={endDrag}>
                      <ChartCandles sc={sc} bars={UP} />
                      {resolved && state.phase === "wrong" ? <TrendLineOverlay sc={sc} anchor={correctUpper} tone="gold" dash="6 4" glow above label="CORRECT CEILING" /> : null}
                      <ChannelFill sc={sc} anchor={UP_TL} offset={state.channelOffset} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="lower line (fixed)" />
                      <TrendLineOverlay sc={sc} anchor={liveUpper} tone="gold" glow={!resolved} />
                      {!resolved ? (
                        <>
                          <line
                            x1={sc.padX}
                            x2={sc.W - sc.padX}
                            y1={sc.y(pL)}
                            y2={sc.y(pR)}
                            stroke="transparent"
                            strokeWidth={22}
                            className="cursor-ns-resize"
                            onPointerDown={beginDrag("channelOffset")}
                          />
                          <circle
                            cx={sc.W - sc.padX - 30}
                            cy={sc.y(priceAtIndex(liveUpper, sc.n - 1.5))}
                            r={7}
                            fill="#F7C325"
                            stroke="#141414"
                            strokeWidth={1.5}
                            className="pointer-events-none"
                          />
                        </>
                      ) : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S20 MTF TEACH ===== */}
            {step === 20 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{MTF_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{MTF_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{MTF_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow strong label="DAILY LINE · months of touches" delay={0.9} />
                      <TrendLineOverlay sc={sc} anchor={MTF_TEACH.minorAnchor} tone="gold" dash="5 4" label="5-min line · minor" delay={1.1} />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S21 MTF QUIZ (mcq, text-only) ===== */}
            {step === 21 && (
              <div className="mx-auto max-w-[640px]">
                <SectionEyebrow tone="gold">{MTF_QUIZ.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{MTF_QUIZ.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{MTF_QUIZ.prompt}</p>
                <McqOptions options={MTF_QUIZ.options} correctIndex={MTF_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S22 CONFLUENCE TEACH ===== */}
            {step === 22 &&
              (() => {
                const sc = barChartScale(UP, UP_MIN, UP_MAX);
                const hz = sc.y(CONFLUENCE_TEACH.horizontalLevel);
                const cx = sc.x(CONFLUENCE_TEACH.confluenceIdx);
                const cy = sc.y(CONFLUENCE_TEACH.horizontalLevel);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{CONFLUENCE_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CONFLUENCE_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CONFLUENCE_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={UP} />
                      <line x1={sc.padX} x2={sc.W - sc.padX} y1={hz} y2={hz} stroke="rgba(255,255,255,0.5)" strokeWidth={1.6} strokeDasharray="6 4" />
                      <text x={sc.padX + 8} y={hz - 6} fill="#cfcfcf" fontSize={10.5} fontWeight={700}>
                        horizontal S/R ₹22,300
                      </text>
                      <PivotDot sc={sc} idx={6} price={22335} color="#ff8f8f" />
                      <ChartArrow sc={sc} idx={6} price={22375} dir="down" color="#ff8f8f" />
                      <text x={sc.x(6)} y={sc.y(22375) + 30} fill="#ff8f8f" fontSize={10.5} fontWeight={800} textAnchor="middle">
                        was resistance here
                      </text>
                      <TrendLineOverlay sc={sc} anchor={UP_TL} glow label="rising trendline" delay={0.9} />
                      <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.5, duration: 0.4 }}>
                        <circle cx={cx} cy={cy} r={20} fill="none" stroke="#F7C325" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 8px rgba(247,195,37,.6))" }} />
                        <text x={cx} y={cy - 28} fill="#F7C325" fontSize={12} fontWeight={900} textAnchor="middle">
                          CONFLUENCE
                        </text>
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S23 BOSS TAP ===== */}
            {step === 23 &&
              (() => {
                const sc = barChartScale(BOSS, BOSS_MIN, BOSS_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_TAP.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_TAP.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_TAP.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={BOSS} />
                      {resolved ? <TrendLineOverlay sc={sc} anchor={BOSS_TL} glow label="UPTREND LINE" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S24 BOSS DECIDE ===== */}
            {step === 24 &&
              (() => {
                const bars = resolved ? [...BOSS, ...BOSS_DECIDE_EXTRA_BARS] : BOSS;
                const sc = barChartScale(bars, BOSS_MIN, BOSS_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_DECIDE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_DECIDE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_DECIDE.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={bars} />
                        <TrendLineOverlay sc={sc} anchor={BOSS_TL} glow label="YOUR TRENDLINE" />
                        {resolved ? <ChartArrow sc={sc} idx={23} price={22300} dir="up" color="#22c55e" /> : null}
                        {resolved ? (
                          <text x={sc.x(24.3)} y={sc.y(22525) - 10} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="middle">
                            +₹300
                          </text>
                        ) : null}
                      </ChartSvg>
                    </div>
                    <McqOptions options={BOSS_DECIDE.options} correctIndex={BOSS_DECIDE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S25 SUMMARY ===== */}
            {step === 25 && (
              <div className="mx-auto max-w-[600px] text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
                  className="mx-auto mb-5 flex h-[120px] w-[120px] items-center justify-center rounded-[30px] shadow-gold-glow"
                  style={{ background: "linear-gradient(135deg,#f7c325,#c49b10)" }}
                >
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 2 2.4 7.4H22l-6 4.6 2.3 7.4-6.3-4.6L5.7 21.4 8 14 2 9.4h7.6z" />
                  </svg>
                </motion.div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-gold">BADGE UNLOCKED</div>
                <h1 className="mb-1.5 text-[32px] font-black sm:text-[34px]">{BADGE_TITLE}</h1>
                <p className="mb-6 text-base text-text-secondary">{BADGE_SUBTITLE}</p>
                <div className="mb-6 flex justify-center gap-3.5">
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-gold/35 bg-brill-700 p-4.5">
                    <div className="flex items-center justify-center gap-1.5 text-[32px] font-black text-gold">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="#f7c325" stroke="#f7c325" strokeWidth={1.4} strokeLinejoin="round">
                        <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12z" />
                      </svg>
                      {TREND_LINES_LESSON_XP}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">XP earned</div>
                  </div>
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-blue/35 bg-brill-700 p-4.5">
                    <div className="text-[32px] font-black text-blue">{firstTryPct}%</div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">first-try</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  {CHECKLIST_ITEMS.map((c) => (
                    <div key={c} className="flex items-center gap-3 rounded-2xl border border-blue/35 bg-blue-bgDark px-4 py-3">
                      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-blue">
                        <CheckIcon size={15} />
                      </div>
                      <div className="flex-1 text-sm font-extrabold text-white">{c}</div>
                      <div className="text-[11px] font-bold tracking-[0.08em] text-blue-light">DONE</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interactive ? (
              <div className="mx-auto mt-4 max-w-[880px] min-h-[46px] text-center">
                <FeedbackBanner center fb={feedback} />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 flex items-center justify-between border-t border-border-subtle bg-brill-800/70 px-4 py-4 backdrop-blur-md md:px-6">
        <div className="text-[13px] font-semibold text-text-muted">{step === TOTAL_STEPS ? "Lesson complete" : `Section ${step + 1} of ${TOTAL_STEPS + 1}`}</div>
        <div className="flex items-center gap-3">
          <button
            ref={ctaRef}
            type="button"
            onClick={handlePrimary}
            disabled={ctaDisabled}
            className={`min-w-[150px] rounded-full px-7 py-3 text-[15px] font-extrabold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              step === TOTAL_STEPS ? "bg-gradient-to-r from-gold to-gold-dark shadow-gold-glow" : "bg-blue hover:bg-blue-dark"
            }`}
          >
            {ctaLabel}
          </button>
          {step === TOTAL_STEPS && (
            <button
              type="button"
              onClick={exitLesson}
              className="rounded-full border border-border-strong bg-brill-700 px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-brill-600"
            >
              Back to course
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
