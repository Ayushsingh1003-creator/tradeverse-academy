"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { useLessonCoach } from "@/lib/hooks/useLessonCoach";
import { LessonCoachDock } from "@/components/lesson/LessonCoachPanel";
import { sound } from "@/lib/sounds";
import { candleBodyColor } from "@/lib/candleColors";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import { barChartScale, locateChartPoint, round5, type BarChartScale, type CandleBar, type ChartPoint } from "./geometry";
import { SUPPORT_RESISTANCE_LESSON_SLUG, SUPPORT_RESISTANCE_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  SCENE_TYPES,
  A,
  A_MIN,
  A_MAX,
  NM,
  NM_MIN,
  NM_MAX,
  RV,
  RV_MIN,
  RV_MAX,
  TR,
  TR_MIN,
  TR_MAX,
  PO,
  SW,
  SW_MIN,
  SW_MAX,
  BOSS,
  BOSS_MIN,
  BOSS_MAX,
  SUPPORT_ZONE,
  RESISTANCE_ZONE,
  SUPPORT_PIVOTS,
  RESISTANCE_TOUCHES,
  INTRO_KICKER,
  INTRO_TITLE_LINE1,
  INTRO_TITLE_LINE2,
  INTRO_SUBTITLE,
  INTRO_CHIPS,
  HOOK,
  INTUITION_MCQ,
  MEMORY,
  SUPPORT_TEACH,
  RESISTANCE_TEACH,
  TAP_SUPPORT,
  SWING,
  TAP_SWING,
  NOTMAGIC,
  ZONETEACH,
  DRAG_ZONE,
  DRAG_ZONE_INITIAL,
  DRAG_ZONE_BOUNDS,
  TOUCHES,
  SPOT_BARS,
  SPOT_CARDS,
  SPOT_MISTAKE,
  REACT_TEACH,
  CANDLE_PREDICT_OPTIONS,
  CANDLE_PREDICT_HAMMER,
  CANDLE_PREDICT,
  REVERSAL,
  RETEST_TEACH,
  TAP_RETEST,
  QUALITY_TEACH,
  QUALITY_CHART_WEAK,
  QUALITY_CHART_STRONG,
  QUALITY_CHART_META,
  QUALITY_COMPARE,
  RISK_TEACH,
  PLACE_ORDERS,
  PLACE_ORDERS_INITIAL,
  PLACE_ORDERS_BOUNDS,
  PLACE_ORDERS_VISIBLE_COUNT,
  BOSS_ZONE,
  BOSS_TAP,
  BOSS_DECIDE_EXTRA_BARS,
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
 * tiny icons — copied verbatim from the intro lesson's convention
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
  return (
    <div className={`mb-2 text-center text-[11px] font-extrabold tracking-[0.14em] ${tone === "gold" ? "text-gold" : "text-blue-light"}`}>{children}</div>
  );
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
 * chart primitives — ported from the design's grid()/candles()/zone()/
 * arrow()/pivotDot()/posTool() methods
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
          // Dimmed candles skip the candle-bar entrance animation: its
          // `candleAppear` keyframe ends at opacity:1 (fill-mode "both"),
          // which would override the inline dim opacity and reveal them early.
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

function ChartZone({
  sc,
  lo,
  hi,
  tone = "sup",
  label,
  above,
  glow,
  dash,
  strong,
}: {
  sc: BarChartScale;
  lo: number;
  hi: number;
  tone?: "sup" | "res" | "flip";
  label?: string;
  above?: boolean;
  glow?: boolean;
  dash?: string;
  strong?: boolean;
}) {
  const y = sc.y(hi);
  const h = Math.max(4, sc.y(lo) - sc.y(hi));
  const c = tone === "res" ? "255,93,93" : tone === "flip" ? "247,195,37" : "69,109,255";
  const labelY = y - (above ? 24 : -4);
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <rect
        x={sc.padX}
        y={y}
        width={sc.W - 2 * sc.padX}
        height={h}
        fill={`rgba(${c},0.15)`}
        stroke={`rgba(${c},${strong ? 0.9 : 0.5})`}
        strokeWidth={strong ? 1.6 : 1.2}
        strokeDasharray={dash ?? "none"}
        rx={4}
        style={glow ? { filter: `drop-shadow(0 0 10px rgba(${c},.45))` } : undefined}
      />
      {label ? (
        <>
          <rect x={sc.padX + 8} y={labelY} width={label.length * 6.6 + 18} height={20} rx={5} fill={`rgba(${c},0.92)`} />
          <text x={sc.padX + 8 + 9} y={labelY + 14} fill={tone === "flip" ? "#141414" : "#fff"} fontSize={11} fontWeight={800} letterSpacing="0.04em">
            {label}
          </text>
        </>
      ) : null}
    </motion.g>
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
        <text x={x} y={y + (label === "SWING HIGH" ? -14 : 24)} fill={color} fontSize={10.5} fontWeight={800} textAnchor="middle" letterSpacing="0.05em">
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

function PosTag({ x1, y, color, fg, text }: { x1: number; y: number; color: string; fg: string; text: string }) {
  return (
    <g>
      <rect x={x1 - 66} y={y - 11} width={66} height={22} rx={4} fill={color} />
      <text x={x1 - 59} y={y + 5} fill={fg} fontSize={11} fontWeight={800}>
        {text}
      </text>
    </g>
  );
}

function PosTool({
  sc,
  entry,
  stop,
  target,
  fromIdx,
  interactive,
  onDragBody,
  onDragEntry,
  onDragStop,
  onDragTarget,
}: {
  sc: BarChartScale;
  entry: number;
  stop: number;
  target: number;
  fromIdx?: number;
  interactive?: boolean;
  onDragBody?: (e: React.PointerEvent) => void;
  onDragEntry?: (e: React.PointerEvent) => void;
  onDragStop?: (e: React.PointerEvent) => void;
  onDragTarget?: (e: React.PointerEvent) => void;
}) {
  const x0 = fromIdx != null ? sc.x(fromIdx) : sc.padX;
  const x1 = sc.W - sc.padX;
  const yE = sc.y(entry);
  const yS = sc.y(stop);
  const yT = sc.y(target);
  const rr = (target - entry) / (entry - stop);
  return (
    <g>
      <rect x={x0} y={yT} width={x1 - x0} height={Math.max(1, yE - yT)} fill="rgba(34,197,94,0.07)" />
      <rect x={x0} y={yE} width={x1 - x0} height={Math.max(1, yS - yE)} fill="rgba(255,93,93,0.07)" />
      <rect x={x0} y={yT} width={x1 - x0} height={Math.max(2, yS - yT)} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth={1} />
      <line x1={x0} x2={x1} y1={yT} y2={yT} stroke="#22c55e" strokeWidth={2} />
      <line x1={x0} x2={x1} y1={yE} y2={yE} stroke="#88c9f7" strokeWidth={2} />
      <line x1={x0} x2={x1} y1={yS} y2={yS} stroke="#ff5d5d" strokeWidth={2} />
      <text x={x0 + 8} y={yT - 7} fill={rr >= 1.5 ? "#4ade80" : "#e0a020"} fontSize={12} fontWeight={800} fontFamily={MONO}>
        {`R:R ${isFinite(rr) && rr > 0 ? rr.toFixed(2) : "—"}×`}
      </text>
      <PosTag x1={x1} y={yT} color="#22c55e" fg="#052012" text="TARGET" />
      <PosTag x1={x1} y={yE} color="#88c9f7" fg="#04121f" text="ENTRY" />
      <PosTag x1={x1} y={yS} color="#ff5d5d" fg="#2a0505" text="STOP" />
      {interactive ? (
        <>
          <rect x={x0} y={yT + 11} width={x1 - x0} height={Math.max(4, yS - yT - 22)} fill="transparent" className="cursor-move" onPointerDown={onDragBody} />
          <rect x={x0} y={yE - 8} width={x1 - x0} height={16} fill="transparent" className="cursor-ns-resize" onPointerDown={onDragEntry} />
          <rect x={x0} y={yT - 8} width={x1 - x0} height={16} fill="transparent" className="cursor-ns-resize" onPointerDown={onDragTarget} />
          <rect x={x0} y={yS - 8} width={x1 - x0} height={16} fill="transparent" className="cursor-ns-resize" onPointerDown={onDragStop} />
          {[
            [yT, "#22c55e"],
            [yE, "#88c9f7"],
            [yS, "#ff5d5d"],
          ].map(([y, color], i) => (
            <g key={i}>
              <circle cx={x0} cy={y} r={5} fill={color as string} />
              <circle cx={x0 + (x1 - x0) / 2} cy={y} r={4} fill={color as string} />
            </g>
          ))}
        </>
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
        const rightReveal = locked && idx === CANDLE_PREDICT.correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== CANDLE_PREDICT.correctIndex;
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

function SpotCards({ sel, phase, onSelect }: { sel: number | null; phase: Phase; onSelect: (i: number) => void }) {
  const locked = phase === "correct" || phase === "wrong";
  const W = 180;
  const H = 120;
  const pad = 10;
  const n = SPOT_BARS.length;
  const min = 10;
  const max = 44;
  const bw = 8;
  const x = (i: number) => pad + (W - 2 * pad) * ((i + 0.5) / n);
  const y = (v: number) => pad + (H - 2 * pad) * (1 - (v - min) / (max - min));
  return (
    <div className="grid grid-cols-3 gap-3">
      {SPOT_CARDS.map((cf, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === SPOT_MISTAKE.correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== SPOT_MISTAKE.correctIndex;
        const ly = y(cf.line);
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
              {SPOT_BARS.map((b, i) => {
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
              <line x1={pad} x2={W - pad} y1={ly} y2={ly} stroke={cf.tone === "bad" && rightReveal ? "#FF5D5D" : "#88C9F7"} strokeWidth={2} strokeDasharray="5 4" />
            </svg>
            <div className="text-[11px] leading-snug text-[#999]">{cf.note}</div>
          </button>
        );
      })}
    </div>
  );
}

function QualityMiniChart({ kind }: { kind: "weak" | "strong" }) {
  const bars = kind === "weak" ? QUALITY_CHART_WEAK : QUALITY_CHART_STRONG;
  const meta = QUALITY_CHART_META[kind];
  const W = 340;
  const H = 150;
  const pad = 14;
  const min = 20;
  const max = 64;
  const n = bars.length;
  const x = (i: number) => pad + (W - 2 * pad) * ((i + 0.5) / n);
  const y = (v: number) => pad + (H - 2 * pad) * (1 - (v - min) / (max - min));
  const bw = Math.min(((W - 2 * pad) / n) * 0.5, 12);
  const ly = y(meta.level);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="rounded-[10px] border border-border bg-black">
      {bars.map((b, i) => {
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
      <line x1={pad} x2={W - pad} y1={ly} y2={ly} stroke="#88C9F7" strokeWidth={2} strokeDasharray="6 4" />
      {meta.touchIdx.map((ti) => (
        <circle key={ti} cx={x(ti)} cy={ly} r={4} fill="none" stroke="#F7C325" strokeWidth={2} />
      ))}
    </svg>
  );
}

/* ================================================================
 * state
 * ================================================================ */

type Phase = "idle" | "hint" | "correct" | "wrong";
type DragPart = "body" | "top" | "bottom" | "entry" | "stop" | "target" | "posbody";

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
  zoneLo: number;
  zoneHi: number;
  stop: number;
  target: number;
  entryP: number;
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
  zoneLo: DRAG_ZONE_INITIAL.lo,
  zoneHi: DRAG_ZONE_INITIAL.hi,
  stop: PLACE_ORDERS_INITIAL.stop,
  target: PLACE_ORDERS_INITIAL.target,
  entryP: PLACE_ORDERS_INITIAL.entryP,
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
  if (n === 11) {
    base.zoneHi = DRAG_ZONE_INITIAL.hi;
    base.zoneLo = DRAG_ZONE_INITIAL.lo;
  }
  if (n === 22) {
    base.stop = PLACE_ORDERS_INITIAL.stop;
    base.target = PLACE_ORDERS_INITIAL.target;
    base.entryP = PLACE_ORDERS_INITIAL.entryP;
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
    case 6:
      return !!state.tap && state.tap.price >= TAP_SUPPORT.priceMin && state.tap.price <= TAP_SUPPORT.priceMax;
    case 8:
      return TAP_SWING.lows.every((r) => state.taps.some((t) => t.idx >= r.idxLo && t.idx <= r.idxHi && t.price <= r.pMax));
    case 11: {
      const { loMin, loMax, hiMin, hiMax, minWidth } = DRAG_ZONE_BOUNDS;
      return state.zoneLo >= loMin && state.zoneLo <= loMax && state.zoneHi >= hiMin && state.zoneHi <= hiMax && state.zoneHi - state.zoneLo >= minWidth;
    }
    case 13:
      return state.sel === SPOT_MISTAKE.correctIndex;
    case 15:
      return state.sel === CANDLE_PREDICT.correctIndex;
    case 18:
      return !!state.tap && state.tap.idx >= TAP_RETEST.idxMin && state.tap.idx <= TAP_RETEST.idxMax && state.tap.price >= TAP_RETEST.priceMin && state.tap.price <= TAP_RETEST.priceMax;
    case 20:
      return state.sel === QUALITY_COMPARE.correctIndex;
    case 22: {
      const rr = (state.target - state.entryP) / (state.entryP - state.stop);
      const b = PLACE_ORDERS_BOUNDS;
      return state.stop <= b.stopMax && state.target >= b.targetMin && state.entryP >= b.entryMin && state.entryP <= b.entryMax && rr >= b.minRR;
    }
    case 23:
      return !!state.tap && state.tap.price >= BOSS_TAP.priceMin && state.tap.price <= BOSS_TAP.priceMax;
    case 24:
      return state.sel === BOSS_DECIDE.correctIndex;
    default:
      return false;
  }
}

const FB_BY_STEP: Partial<Record<number, { hint: string; correct: string; wrong: string }>> = {
  2: INTUITION_MCQ.fb,
  6: TAP_SUPPORT.fb,
  8: TAP_SWING.fb,
  11: DRAG_ZONE.fb,
  13: SPOT_MISTAKE.fb,
  15: CANDLE_PREDICT.fb,
  18: TAP_RETEST.fb,
  20: QUALITY_COMPARE.fb,
  22: PLACE_ORDERS.fb,
  23: BOSS_TAP.fb,
  24: BOSS_DECIDE.fb,
};

/** Real question text/options/answer per step, fed to the AI coach on a wrong attempt. */
const QUESTION_CONTEXT_BY_STEP: Partial<
  Record<number, { question: string; options?: string[]; correctAnswer?: string }>
> = {
  2: { question: INTUITION_MCQ.prompt, options: INTUITION_MCQ.options, correctAnswer: INTUITION_MCQ.options[INTUITION_MCQ.correctIndex] },
  6: { question: TAP_SUPPORT.prompt },
  8: { question: TAP_SWING.prompt },
  11: { question: DRAG_ZONE.prompt },
  13: {
    question: SPOT_MISTAKE.prompt,
    options: SPOT_CARDS.map((c) => `${c.label} — ${c.note}`),
    correctAnswer: SPOT_CARDS[SPOT_MISTAKE.correctIndex]
      ? `${SPOT_CARDS[SPOT_MISTAKE.correctIndex]!.label} — ${SPOT_CARDS[SPOT_MISTAKE.correctIndex]!.note}`
      : undefined,
  },
  15: {
    question: CANDLE_PREDICT.prompt,
    options: CANDLE_PREDICT_OPTIONS.map((o) => o.label),
    correctAnswer: CANDLE_PREDICT_OPTIONS[CANDLE_PREDICT.correctIndex]?.label,
  },
  18: { question: TAP_RETEST.prompt },
  20: { question: QUALITY_COMPARE.prompt, options: QUALITY_COMPARE.options, correctAnswer: QUALITY_COMPARE.options[QUALITY_COMPARE.correctIndex] },
  22: { question: PLACE_ORDERS.prompt },
  23: { question: BOSS_TAP.prompt },
  24: { question: BOSS_DECIDE.prompt, options: BOSS_DECIDE.options, correctAnswer: BOSS_DECIDE.options[BOSS_DECIDE.correctIndex] },
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

export function SupportResistanceLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const { collapsed, setCollapsed, coachPanelProps, notifyWrongAttempt } = useLessonCoach({
    lessonTitle: "Support & Resistance",
    lessonTopic: "support-resistance",
    suggestedChips: ["How do I spot support?", "What is resistance?", "Give me an example"],
  });

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const [dragPart, setDragPart] = useState<DragPart | null>(null);
  const [dragAnchor, setDragAnchor] = useState<{ p: number; entry: number; stop: number; target: number } | null>(null);
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

  function beginDrag(part: DragPart, sc: BarChartScale) {
    return (e: React.PointerEvent) => {
      if (resolved) return;
      e.stopPropagation();
      if (part === "posbody") {
        const svg = svgRef.current;
        if (svg) {
          const loc = locateChartPoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
          setDragAnchor({ p: loc.price, entry: state.entryP, stop: state.stop, target: state.target });
        }
      }
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
    if (dragPart === "body") {
      setState((s) => {
        const half = (s.zoneHi - s.zoneLo) / 2;
        const c = Math.max(sc.min + half + 10, Math.min(sc.max - half - 10, p));
        return { ...s, zoneHi: c + half, zoneLo: c - half };
      });
    } else if (dragPart === "top") {
      setState((s) => ({ ...s, zoneHi: Math.max(s.zoneLo + 30, Math.min(sc.max - 10, p)) }));
    } else if (dragPart === "bottom") {
      setState((s) => ({ ...s, zoneLo: Math.min(s.zoneHi - 30, Math.max(sc.min + 10, p)) }));
    } else if (dragPart === "entry") {
      setState((s) => ({ ...s, entryP: Math.round(Math.max(s.stop + 15, Math.min(s.target - 15, p)) / 5) * 5 }));
    } else if (dragPart === "stop") {
      setState((s) => ({ ...s, stop: Math.round(Math.max(sc.min + 10, Math.min(s.entryP - 15, p)) / 5) * 5 }));
    } else if (dragPart === "target") {
      setState((s) => ({ ...s, target: Math.round(Math.min(sc.max - 10, Math.max(s.entryP + 15, p)) / 5) * 5 }));
    } else if (dragPart === "posbody") {
      setState((s) => {
        if (!dragAnchor) return s;
        const dp = p - dragAnchor.p;
        let e2 = dragAnchor.entry + dp;
        let st2 = dragAnchor.stop + dp;
        let tg2 = dragAnchor.target + dp;
        if (st2 < sc.min + 10) {
          const k = sc.min + 10 - st2;
          st2 += k;
          e2 += k;
          tg2 += k;
        }
        if (tg2 > sc.max - 10) {
          const k = tg2 - (sc.max - 10);
          st2 -= k;
          e2 -= k;
          tg2 -= k;
        }
        const r5 = (n: number) => Math.round(n / 5) * 5;
        return { ...s, entryP: r5(e2), stop: r5(st2), target: r5(tg2) };
      });
    }
  }

  function endDrag() {
    setDragPart(null);
    setDragAnchor(null);
  }

  function notifyWrongAttemptForStep(stage: "hint" | "explain") {
    const ctx = QUESTION_CONTEXT_BY_STEP[step];
    if (!ctx) return;
    const userAnswer = ctx.options && state.sel != null ? ctx.options[state.sel] : undefined;
    notifyWrongAttempt({ question: ctx.question, options: ctx.options, correctAnswer: ctx.correctAnswer, userAnswer, stage, sectionLabel: `Section - ${step + 1}` });
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
        notifyWrongAttemptForStep("hint");
      }
    } else {
      const ok = evalSceneCorrect(step, state);
      if (ok) {
        setState((s) => ({ ...s, phase: "correct", attempts: s.attempts + 1, lastAward: 15, qAnswered: s.qAnswered + 1 }));
        awardXp(15);
        sound.correct();
      } else {
        setState((s) => ({ ...s, phase: "wrong", attempts: s.attempts + 1, lastAward: 5, qAnswered: s.qAnswered + 1 }));
        awardXp(5);
        notifyWrongAttemptForStep("explain");
      }
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
      completeLesson({ lessonSlug: SUPPORT_RESISTANCE_LESSON_SLUG, score: 100, xpEarned: SUPPORT_RESISTANCE_LESSON_XP });
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
      <header className="fixed inset-x-0 top-0 z-30 flex items-center gap-4 border-b border-border-subtle bg-brill-800/70 px-4 py-3.5 backdrop-blur-md md:px-6">
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
      <main
        className={`relative z-10 flex flex-1 items-center justify-center pr-5 pb-28 pt-[100px] transition-[padding-left] duration-300 ease-out ${
          step === 0 || collapsed ? "pl-5" : "pl-[calc(1.25rem+min(150px,42.5vw))]"
        }`}
      >
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
                <div className="mx-auto mb-6 max-w-[420px]">
                  <svg viewBox="40 45 780 300" width="100%" className="block">
                    <motion.line x1={150} x2={640} y1={120} y2={120} stroke="#FF5D5D" strokeWidth={5} strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} />
                    <motion.line x1={60} x2={640} y1={300} y2={300} stroke="#456DFF" strokeWidth={5} strokeLinecap="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65, duration: 0.5 }} />
                    <motion.path
                      d="M70,300 L190,120 L320,300 L450,120 L580,300 L700,72"
                      fill="none"
                      stroke="#E9EDF5"
                      strokeWidth={5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 0.15, duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
                    />
                    {[
                      [190, 120],
                      [450, 120],
                      [320, 300],
                      [580, 300],
                    ].map(([cx, cy], i) => (
                      <motion.circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={11}
                        fill="none"
                        stroke={cy < 200 ? "#ff9d9d" : "#88C9F7"}
                        strokeWidth={3}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1 + i * 0.08, duration: 0.35 }}
                      />
                    ))}
                    <motion.circle cx={668} cy={120} r={13} fill="none" stroke="#22C55E" strokeWidth={3} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.35, duration: 0.35 }} />
                    <motion.text x={614} y={66} fill="#22C55E" fontSize={15} fontWeight={900} letterSpacing="0.06em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                      BREAKOUT ▲
                    </motion.text>
                    <motion.text x={162} y={105} fill="#FF5D5D" fontSize={15} fontWeight={900} letterSpacing="0.06em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                      RESISTANCE
                    </motion.text>
                    <motion.text x={72} y={321} fill="#88C9F7" fontSize={15} fontWeight={900} letterSpacing="0.06em" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
                      SUPPORT
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
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HOOK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOOK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOOK.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={RESISTANCE_ZONE.lo} hi={RESISTANCE_ZONE.hi} tone="res" label="RESISTANCE · the ceiling" above glow />
                      {RESISTANCE_TOUCHES.map((t) => (
                        <ChartArrow key={t.idx} sc={sc} idx={t.idx} price={t.price} dir="down" color="#ff8f8f" />
                      ))}
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="SUPPORT · the floor" glow />
                      {SUPPORT_PIVOTS.map((t) => (
                        <ChartArrow key={t.idx} sc={sc} idx={t.idx} price={t.price} dir="up" color="#88C9F7" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S2 INTUITION (mcq) ===== */}
            {step === 2 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                const hs = INTUITION_MCQ.hiddenFrom;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{INTUITION_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INTUITION_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INTUITION_MCQ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={A} dimFrom={resolved ? undefined : hs - 1} dimOpacity={INTUITION_MCQ.hiddenOpacity} />
                        <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} dash="5 4" label="SUPPORT" />
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

            {/* ===== S3 MEMORY ===== */}
            {step === 3 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{MEMORY.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{MEMORY.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{MEMORY.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="BUYERS DEFEND" glow />
                      {SUPPORT_PIVOTS.map((p) => (
                        <PivotDot key={p.idx} sc={sc} idx={p.idx} price={p.price} color="#88C9F7" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S4 SUPPORT ===== */}
            {step === 4 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{SUPPORT_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SUPPORT_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SUPPORT_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="SUPPORT · the floor" glow />
                      {SUPPORT_PIVOTS.map((t) => (
                        <ChartArrow key={t.idx} sc={sc} idx={t.idx} price={t.price} dir="up" color="#88C9F7" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S5 RESISTANCE ===== */}
            {step === 5 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{RESISTANCE_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{RESISTANCE_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{RESISTANCE_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={RESISTANCE_ZONE.lo} hi={RESISTANCE_ZONE.hi} tone="res" label="RESISTANCE · the ceiling" above glow />
                      {RESISTANCE_TOUCHES.map((t) => (
                        <ChartArrow key={t.idx} sc={sc} idx={t.idx} price={t.price} dir="down" color="#ff8f8f" />
                      ))}
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} dash="5 4" />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S6 TAP SUPPORT ===== */}
            {step === 6 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_SUPPORT.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_SUPPORT.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_SUPPORT.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={A} />
                      {resolved ? <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="SUPPORT" glow /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S7 SWING ===== */}
            {step === 7 &&
              (() => {
                const sc = barChartScale(SW, SW_MIN, SW_MAX);
                const pts = [...SWING.highs, ...SWING.lows]
                  .slice()
                  .sort((a, b) => a.idx - b.idx)
                  .map((p) => `${sc.x(p.idx)},${sc.y(p.price)}`)
                  .join(" ");
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{SWING.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SWING.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SWING.prompt}</p>
                    <ChartSvg sc={sc}>
                      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.6} strokeDasharray="5 4" />
                      <ChartCandles sc={sc} bars={SW} />
                      {SWING.highs.map((p) => (
                        <PivotDot key={`h${p.idx}`} sc={sc} idx={p.idx} price={p.price} label="SWING HIGH" color="#ff8f8f" />
                      ))}
                      {SWING.lows.map((p) => (
                        <PivotDot key={`l${p.idx}`} sc={sc} idx={p.idx} price={p.price} label="SWING LOW" color="#88C9F7" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S8 TAP SWING (multi) ===== */}
            {step === 8 &&
              (() => {
                const sc = barChartScale(SW, SW_MIN, SW_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_SWING.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_SWING.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_SWING.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={SW} />
                      {resolved
                        ? TAP_SWING.revealLows.map((p) => <PivotDot key={p.idx} sc={sc} idx={p.idx} price={p.price} label="SWING LOW" color="#88C9F7" />)
                        : null}
                      {resolved ? <PivotDot sc={sc} idx={TAP_SWING.revealDecoy.idx} price={TAP_SWING.revealDecoy.price} label="not a swing" color="#777" /> : null}
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

            {/* ===== S9 NOTMAGIC ===== */}
            {step === 9 &&
              (() => {
                const sc = barChartScale(NM, NM_MIN, NM_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{NOTMAGIC.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{NOTMAGIC.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{NOTMAGIC.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={NM} />
                      <line x1={sc.padX} x2={sc.W - sc.padX} y1={sc.y(NOTMAGIC.level)} y2={sc.y(NOTMAGIC.level)} stroke="#F7C325" strokeWidth={1.8} strokeDasharray="6 4" />
                      <rect x={68} y={30} width={214} height={20} rx={5} fill="#F7C325" />
                      <text x={76} y={44} fill="#141414" fontSize={11} fontWeight={800}>
                        reacted here 3× … then broke
                      </text>
                      {NOTMAGIC.reactIdx.map((idx) => (
                        <ChartArrow key={idx} sc={sc} idx={idx} price={NOTMAGIC.level + 3} dir="down" color="#F7C325" />
                      ))}
                      <ChartArrow sc={sc} idx={NOTMAGIC.breakArrowIdx} price={NOTMAGIC.breakPrice} dir="up" color="#22c55e" />
                      <text x={sc.x(13) - 4} y={sc.y(22510)} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="middle">
                        BROKE OUT ↑
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S10 ZONETEACH ===== */}
            {step === 10 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                const bars = A.map((b, i) => (i === 4 ? { ...b, l: 22040 } : b));
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{ZONETEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{ZONETEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{ZONETEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={bars} />
                      <line
                        x1={sc.padX}
                        x2={sc.W - sc.padX}
                        y1={sc.y(ZONETEACH.hairlinePrice)}
                        y2={sc.y(ZONETEACH.hairlinePrice)}
                        stroke="#ff5d5d"
                        strokeWidth={1.5}
                        strokeDasharray="5 4"
                      />
                      <rect x={sc.padX + 8} y={sc.padTop + 2} width={258} height={20} rx={5} fill="rgba(255,93,93,0.92)" />
                      <text x={sc.padX + 16} y={sc.padTop + 16} fill="#fff" fontSize={11} fontWeight={700}>
                        ✕ one hairline line misses most touches
                      </text>
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="✓ ZONE" glow />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S11 DRAG ZONE ===== */}
            {step === 11 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                const y = sc.y(state.zoneHi);
                const h = sc.y(state.zoneLo) - sc.y(state.zoneHi);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{DRAG_ZONE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DRAG_ZONE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DRAG_ZONE.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} onPointerMove={(e) => onChartDragMove(e, sc)} onPointerUp={endDrag}>
                      <ChartCandles sc={sc} bars={A} />
                      {resolved && state.phase === "wrong" ? <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="TARGET ZONE" glow dash="5 4" /> : null}
                      <rect
                        x={sc.padX}
                        y={y}
                        width={sc.W - 2 * sc.padX}
                        height={Math.max(4, h)}
                        fill={resolved ? "rgba(69,109,255,0.13)" : "rgba(69,109,255,0.18)"}
                        stroke="#456DFF"
                        strokeWidth={1.6}
                        rx={4}
                        className={resolved ? "" : "cursor-grab"}
                        onPointerDown={resolved ? undefined : beginDrag("body", sc)}
                      />
                      {!resolved && (
                        <>
                          <rect x={sc.padX} y={y - 7} width={sc.W - 2 * sc.padX} height={14} fill="transparent" className="cursor-ns-resize" onPointerDown={beginDrag("top", sc)} />
                          <rect x={sc.padX} y={y + h - 7} width={sc.W - 2 * sc.padX} height={14} fill="transparent" className="cursor-ns-resize" onPointerDown={beginDrag("bottom", sc)} />
                          {[y, y + h].map((ey, k) =>
                            [sc.padX + 40, sc.W - sc.padX - 40].map((ex, j) => <rect key={`${k}-${j}`} x={ex - 9} y={ey - 2.5} width={18} height={5} rx={2.5} fill="#88C9F7" />),
                          )}
                        </>
                      )}
                      <text x={sc.padX + 8} y={y - 6} fill="#88C9F7" fontSize={11} fontWeight={700} fontFamily={MONO}>
                        {`₹${Math.round(state.zoneHi).toLocaleString("en-IN")}`}
                      </text>
                      <text x={sc.padX + 8} y={y + h + 15} fill="#88C9F7" fontSize={11} fontWeight={700} fontFamily={MONO}>
                        {`₹${Math.round(state.zoneLo).toLocaleString("en-IN")}`}
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S12 TOUCHES ===== */}
            {step === 12 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{TOUCHES.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TOUCHES.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TOUCHES.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="anchored on wicks + bodies" glow />
                      {SUPPORT_PIVOTS.map((p, i) => (
                        <PivotDot key={p.idx} sc={sc} idx={p.idx} price={p.price} label={String(i + 1)} color="#F7C325" />
                      ))}
                      <text x={sc.x(20) + 14} y={sc.y(21995) + 4} fill="#F7C325" fontSize={12} fontWeight={800}>
                        ← 3 touches = confirmed
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S13 SPOT ===== */}
            {step === 13 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{SPOT_MISTAKE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SPOT_MISTAKE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SPOT_MISTAKE.prompt}</p>
                <SpotCards sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S14 REACT ===== */}
            {step === 14 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{REACT_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{REACT_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{REACT_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} glow />
                      <text x={sc.x(4)} y={sc.y(21985) + 42} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                        long lower wick
                      </text>
                      <text x={sc.x(4)} y={sc.y(21985) + 56} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                        = rejection
                      </text>
                      <ChartArrow sc={sc} idx={5} price={22120} dir="up" color="#22c55e" />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S15 CANDLE PREDICT ===== */}
            {step === 15 &&
              (() => {
                const sc = barChartScale(A.slice(0, 14), A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{CANDLE_PREDICT.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CANDLE_PREDICT.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CANDLE_PREDICT.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={A.slice(0, 13)} />
                        <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="SUPPORT" glow />
                        {resolved ? (
                          <g className="candle-bar">
                            {(() => {
                              const b = CANDLE_PREDICT_HAMMER;
                              const cx = sc.x(13);
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
                          <rect x={sc.x(13) - 18} y={sc.padTop} width={40} height={sc.H - sc.padTop - sc.padBot} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.16)" strokeDasharray="5 4" rx={5} />
                        )}
                        {resolved ? (
                          <text x={sc.x(13)} y={sc.y(22112) - 10} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                            hammer ✓
                          </text>
                        ) : (
                          <text x={sc.x(13) - 6} y={sc.padTop + 30} fill="#888" fontSize={26} fontWeight={900}>
                            ?
                          </text>
                        )}
                      </ChartSvg>
                    </div>
                    <CandleOptions sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S16 REVERSAL ===== */}
            {step === 16 &&
              (() => {
                const sc = barChartScale(RV, RV_MIN, RV_MAX);
                const ly = sc.y(REVERSAL.level);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{REVERSAL.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{REVERSAL.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{REVERSAL.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={RV} />
                      <line x1={sc.padX} x2={sc.W - sc.padX} y1={ly} y2={ly} stroke="#F7C325" strokeWidth={2} />
                      <rect x={sc.padX + 8} y={sc.padTop + 2} width={252} height={20} rx={5} fill="#F7C325" />
                      <text x={sc.padX + 16} y={sc.padTop + 16} fill="#141414" fontSize={11} fontWeight={800}>
                        OLD RESISTANCE → NEW SUPPORT
                      </text>
                      <ChartArrow sc={sc} idx={2} price={22405} dir="down" color="#ff8f8f" />
                      <ChartArrow sc={sc} idx={6} price={22398} dir="down" color="#ff8f8f" />
                      <ChartArrow sc={sc} idx={15} price={22415} dir="up" color="#22c55e" />
                      <text x={sc.padX + 6} y={ly - 8} fill="#ff8f8f" fontSize={11} fontWeight={800}>
                        ceiling
                      </text>
                      <text x={sc.W - sc.padX - 44} y={ly + 16} fill="#22c55e" fontSize={11} fontWeight={800}>
                        floor
                      </text>
                      <text x={sc.x(10) - 10} y={sc.y(22445)} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="end">
                        ↑ BREAK
                      </text>
                      <text x={sc.x(14)} y={ly + 24} fill="#F7C325" fontSize={10.5} fontWeight={800} textAnchor="middle">
                        retest holds
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S17 RETEST (teach) ===== */}
            {step === 17 &&
              (() => {
                const sc = barChartScale(RV, RV_MIN, RV_MAX);
                const ly = sc.y(RETEST_TEACH.level);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{RETEST_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{RETEST_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{RETEST_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={RV} />
                      <line x1={sc.padX} x2={sc.W - sc.padX} y1={ly} y2={ly} stroke="#F7C325" strokeWidth={2} />
                      <rect x={sc.padX + 8} y={sc.padTop + 2} width={238} height={20} rx={5} fill="#F7C325" />
                      <text x={sc.padX + 16} y={sc.padTop + 16} fill="#141414" fontSize={11} fontWeight={800}>
                        1. break   2. retest   3. hold = enter
                      </text>
                      <text x={sc.padX + 6} y={ly - 8} fill="#F7C325" fontSize={11} fontWeight={800}>
                        flipped level
                      </text>
                      <text x={sc.x(10) - 10} y={sc.y(22450)} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="end">
                        ① BREAK ↑
                      </text>
                      <text x={sc.x(14)} y={ly + 22} fill="#F7C325" fontSize={10.5} fontWeight={800} textAnchor="middle">
                        ② retest
                      </text>
                      <ChartArrow sc={sc} idx={14} price={22395} dir="up" color="#22c55e" />
                      <text x={sc.x(16)} y={sc.y(22590) - 8} fill="#22c55e" fontSize={11} fontWeight={800} textAnchor="middle">
                        ③ holds → entry
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S18 TAP RETEST ===== */}
            {step === 18 &&
              (() => {
                const sc = barChartScale(TR, TR_MIN, TR_MAX);
                const ly = sc.y(TAP_RETEST.level);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_RETEST.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_RETEST.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_RETEST.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={TR} />
                      <line x1={sc.padX} x2={sc.W - sc.padX} y1={ly} y2={ly} stroke="#F7C325" strokeWidth={1.8} strokeDasharray="6 4" />
                      <text x={sc.padX + 6} y={ly - 8} fill="#F7C325" fontSize={11} fontWeight={800}>
                        broken level
                      </text>
                      <text x={sc.x(8) - 10} y={sc.y(22360) - 6} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="end">
                        break ↑
                      </text>
                      {resolved ? <PivotDot sc={sc} idx={11} price={22300} label="ENTER: RETEST" color="#F7C325" /> : null}
                      {resolved && state.phase === "wrong" ? <PivotDot sc={sc} idx={8} price={22360} label="chasing the break" color="#ff8f8f" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S19 QUALITY (teach) ===== */}
            {step === 19 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{QUALITY_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{QUALITY_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{QUALITY_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="STRONG · 3 sharp touches, recent" glow />
                      {SUPPORT_PIVOTS.map((p) => (
                        <PivotDot key={p.idx} sc={sc} idx={p.idx} price={p.price} color="#F7C325" />
                      ))}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S20 QUALITY COMPARE (mcq) ===== */}
            {step === 20 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{QUALITY_COMPARE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{QUALITY_COMPARE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{QUALITY_COMPARE.prompt}</p>
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Level A · 1 touch, months old</div>
                    <QualityMiniChart kind="weak" />
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-extrabold text-white">Level B · 4 recent touches</div>
                    <QualityMiniChart kind="strong" />
                  </div>
                </div>
                <McqOptions options={QUALITY_COMPARE.options} correctIndex={QUALITY_COMPARE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S21 RISK (teach) ===== */}
            {step === 21 &&
              (() => {
                const sc = barChartScale(A, A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{RISK_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{RISK_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{RISK_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={A} />
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} glow />
                      <ChartZone sc={sc} lo={RESISTANCE_ZONE.lo} hi={RESISTANCE_ZONE.hi} tone="res" />
                      <PosTool sc={sc} entry={RISK_TEACH.entry} stop={RISK_TEACH.stop} target={RISK_TEACH.target} fromIdx={RISK_TEACH.fromIdx} />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S22 PLACE ORDERS ===== */}
            {step === 22 &&
              (() => {
                const sc = barChartScale(PO, A_MIN, A_MAX);
                const shown = resolved ? PO : PO.slice(0, PLACE_ORDERS_VISIBLE_COUNT);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{PLACE_ORDERS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{PLACE_ORDERS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{PLACE_ORDERS.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} onPointerMove={(e) => onChartDragMove(e, sc)} onPointerUp={endDrag}>
                      <ChartCandles sc={sc} bars={shown} />
                      {!resolved ? (
                        <text x={(sc.x(PLACE_ORDERS_VISIBLE_COUNT) + sc.W - sc.padX) / 2} y={sc.padTop + 30} fill="#6a6a6a" fontSize={12} fontWeight={800} textAnchor="middle">
                          outcome hidden →
                        </text>
                      ) : null}
                      <ChartZone sc={sc} lo={SUPPORT_ZONE.lo} hi={SUPPORT_ZONE.hi} label="SUPPORT" glow />
                      <ChartZone sc={sc} lo={RESISTANCE_ZONE.lo} hi={RESISTANCE_ZONE.hi} tone="res" label="RESISTANCE" above />
                      <PosTool
                        sc={sc}
                        entry={state.entryP}
                        stop={state.stop}
                        target={state.target}
                        fromIdx={PLACE_ORDERS.fromIdx}
                        interactive={!resolved}
                        onDragBody={beginDrag("posbody", sc)}
                        onDragEntry={beginDrag("entry", sc)}
                        onDragStop={beginDrag("stop", sc)}
                        onDragTarget={beginDrag("target", sc)}
                      />
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
                      {resolved ? <ChartZone sc={sc} lo={BOSS_ZONE.lo} hi={BOSS_ZONE.hi} label="SUPPORT" glow /> : null}
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
                        <ChartZone sc={sc} lo={BOSS_ZONE.lo} hi={BOSS_ZONE.hi} label="SUPPORT" glow />
                        {resolved ? <ChartArrow sc={sc} idx={34} price={22340} dir="up" color="#22c55e" /> : null}
                        {resolved ? (
                          <text x={sc.x(35)} y={sc.y(22545) - 10} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="middle">
                            +₹380
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
                      {SUPPORT_RESISTANCE_LESSON_XP}
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
      <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border-subtle bg-brill-800/70 px-4 py-4 backdrop-blur-md md:px-6">
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

      {step > 0 ? (
        <LessonCoachDock {...coachPanelProps} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      ) : null}
    </div>
  );
}
