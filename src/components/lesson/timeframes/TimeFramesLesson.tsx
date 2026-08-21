"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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
import {
  autoScale,
  aggregateBars,
  indexOfHigh,
  locateChartPoint,
  type BarChartScale,
  type CandleBar,
  type ChartPoint,
} from "./geometry";
import { TIME_FRAMES_LESSON_SLUG, TIME_FRAMES_LESSON_XP } from "./constants";
import {
  SCENE_TYPES,
  SECTION_META,
  TOTAL_STEPS,
  BASE,
  M15,
  H1,
  INTRO_KICKER,
  INTRO_TITLE_LINE1,
  INTRO_TITLE_LINE2,
  INTRO_SUBTITLE,
  INTRO_CHIPS,
  INTRO_FIVE,
  INTRO_FORM_MS_PER_CANDLE,
  INTRO_FORM_HOLD_MS,
  HOOK,
  INTUITION_MCQ,
  FIXED_TIME,
  FIXED_TIME_QUIET,
  FIXED_TIME_WILD,
  COUNT_QUIZ,
  COUNT_QUIZ_BARS,
  AGGREGATE_TEACH,
  AGGREGATE_BARS,
  TAP_HIGH,
  TAP_CLOSE,
  SAME_DATA,
  TF_OPTIONS,
  TF_EXPLORE,
  TF_SUBLABEL,
  type TfKey,
  NOISE_TEACH,
  NOISE_QUIZ,
  NOISE_QUIZ_SEG,
  NOISE_QUIZ_TWO_H,
  TF_MENU_TEACH,
  TF_MENU_ROWS,
  MATCH_QUIZ,
  HTF_CONTEXT,
  TOP_DOWN,
  TOP_DOWN_STEPS,
  CONFLICT_QUIZ,
  CONFLICT_QUIZ_UP,
  CONFLICT_QUIZ_DAILY,
  ALIGNMENT_TEACH,
  ALIGNMENT_ROWS,
  ALIGNMENT_SUMMARY,
  BOSS_TAP,
  BOSS_H1,
  BOSS_DECIDE,
  BOSS_DECIDE_PRE,
  BOSS_DECIDE_CONT,
  BOSS_DECIDE_FIB,
  BADGE_TITLE,
  BADGE_SUBTITLE,
  CHECKLIST_ITEMS,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

const TAP_GROUP_BARS: CandleBar[] = BASE.slice(0, 12);
const TAP_GROUP_AGG: CandleBar = aggregateBars(TAP_GROUP_BARS, 12)[0]!;
const BOSS_DECIDE_FULL: CandleBar[] = [...BOSS_DECIDE_PRE, ...BOSS_DECIDE_CONT];

const TF_BARS: Record<TfKey, CandleBar[]> = { "5m": BASE, "15m": M15, "1h": H1 };

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

function LockIcon({ color = "#ccc", size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SectionEyebrow({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "gold" }) {
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
 * chart primitives
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

function ChartCandles({
  sc,
  bars,
  stagger = 18,
  bw,
  highlight = null,
  dimOthers = true,
  noAnim = false,
  keyPrefix = "c",
}: {
  sc: BarChartScale;
  bars: CandleBar[];
  stagger?: number;
  bw?: number;
  highlight?: number | null;
  dimOthers?: boolean;
  noAnim?: boolean;
  keyPrefix?: string;
}) {
  return (
    <>
      {bars.map((b, i) => {
        const cx = sc.x(i);
        const color = candleBodyColor(b.c >= b.o);
        const top = sc.y(Math.max(b.o, b.c));
        const bot = sc.y(Math.min(b.o, b.c));
        const isHl = highlight === i;
        const dim = highlight != null && highlight !== i && dimOthers;
        const barW = bw ?? sc.bw;
        const style: CSSProperties = { opacity: dim ? 0.28 : 1, transition: "opacity .3s" };
        if (!noAnim) {
          style.animation = "candleAppear .3s cubic-bezier(.22,1,.36,1) both";
          style.animationDelay = `${Math.min(i * stagger, 900)}ms`;
        }
        if (isHl) style.filter = "drop-shadow(0 0 8px rgba(69,109,255,.95))";
        return (
          <g key={`${keyPrefix}${i}`} style={style}>
            <line x1={cx} x2={cx} y1={sc.y(b.h)} y2={top} stroke={color} strokeWidth={Math.max(1.4, barW * 0.16)} strokeLinecap="round" />
            <line x1={cx} x2={cx} y1={bot} y2={sc.y(b.l)} stroke={color} strokeWidth={Math.max(1.4, barW * 0.16)} strokeLinecap="round" />
            <rect x={cx - barW / 2} y={top} width={barW} height={Math.max(2, bot - top)} rx={2} fill={color} />
            {isHl ? <rect x={cx - barW / 2 - 5} y={sc.y(b.h) - 5} width={barW + 10} height={sc.y(b.l) - sc.y(b.h) + 10} rx={4} fill="none" stroke="#456DFF" strokeWidth={2} /> : null}
          </g>
        );
      })}
    </>
  );
}

function ChartSvg({
  sc,
  svgRef,
  tapHit,
  children,
}: {
  sc: BarChartScale;
  svgRef?: React.Ref<SVGSVGElement>;
  tapHit?: (e: React.PointerEvent<SVGRectElement>) => void;
  children: ReactNode;
}) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${sc.W} ${sc.H}`} width="100%" className="block touch-none select-none rounded-2xl border border-border bg-black">
      <ChartGrid sc={sc} />
      {children}
      {tapHit ? (
        <rect x={sc.padX - 6} y={sc.padTop} width={sc.W - 2 * sc.padX + 12} height={sc.H - sc.padTop - sc.padBot} fill="transparent" className="cursor-pointer" onPointerDown={tapHit} />
      ) : null}
    </svg>
  );
}

function TapRing({ sc, bars, tap }: { sc: BarChartScale; bars: CandleBar[]; tap: ChartPoint | null }) {
  if (!tap) return null;
  const i = Math.max(0, Math.min(bars.length - 1, tap.idx));
  const b = bars[i]!;
  const cx = sc.x(i);
  const bw = sc.bw;
  return <rect x={cx - bw / 2 - 6} y={sc.y(b.h) - 6} width={bw + 12} height={sc.y(b.l) - sc.y(b.h) + 12} rx={4} fill="rgba(136,201,247,0.14)" stroke="#88C9F7" strokeWidth={2} />;
}

function Panel({
  bars,
  label,
  sub,
  accent = "#88C9F7",
  W = 270,
  H = 230,
  stagger = 10,
  bw,
}: {
  bars: CandleBar[];
  label: string;
  sub: string;
  accent?: string;
  W?: number;
  H?: number;
  stagger?: number;
  bw?: number;
}) {
  const sc = autoScale(bars, { W, H, padX: 14, padTop: 34, padBot: 22 });
  return (
    <div className="flex-1">
      <div className="mb-1.5 truncate text-[12.5px]">
        <span style={{ fontFamily: MONO, fontWeight: 800, color: accent }}>{label}</span>
        <span className="font-semibold text-[#777]">{"  ·  " + sub}</span>
      </div>
      <svg viewBox={`0 0 ${sc.W} ${sc.H}`} width="100%" className="block rounded-xl border border-border bg-black">
        <ChartCandles sc={sc} bars={bars} stagger={stagger} bw={bw} keyPrefix={label} />
      </svg>
    </div>
  );
}

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

function TfPills({ tf, onSelect }: { tf: TfKey; onSelect: (t: TfKey) => void }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {TF_OPTIONS.map((t) => {
        const on = tf === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onSelect(t)}
            style={{ fontFamily: MONO }}
            className={`rounded-full border-[1.5px] px-5 py-2.5 text-[13px] font-extrabold transition-all duration-150 ${
              on ? "border-blue bg-blue-bg text-white shadow-blue-glow" : "border-border-medium bg-white/[0.04] text-[#aaa]"
            }`}
          >
            {t}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-[#777]" style={{ fontFamily: MONO }}>
        {TF_SUBLABEL[tf]}
      </span>
    </div>
  );
}

/* ================================================================
 * group-aggregate chart — the "N candles merge into 1" two-region layout
 * used by countQuiz / aggregate / tapHigh / tapClose.
 * ================================================================ */

type GroupLayout = {
  sc: BarChartScale;
  ox: number;
  gbw: number;
  obw: number;
};

function computeGroupLayout(
  groupBars: CandleBar[],
  aggBar: CandleBar,
  opts: { W?: number; H?: number; padTop?: number; padBot?: number; gx0?: number; gx1?: number; ox?: number; gbw?: number; obw?: number } = {},
): GroupLayout {
  const W = opts.W ?? 840;
  const H = opts.H ?? 380;
  const padTop = opts.padTop ?? 44;
  const padBot = opts.padBot ?? 34;
  const gx0 = opts.gx0 ?? 70;
  const gx1 = opts.gx1 ?? 520;
  const ox = opts.ox ?? 690;
  const obw = opts.obw ?? 64;
  let lo = Math.min(...groupBars.map((b) => b.l), aggBar.l);
  let hi = Math.max(...groupBars.map((b) => b.h), aggBar.h);
  const pad = (hi - lo) * 0.12;
  lo -= pad;
  hi += pad;
  const n = groupBars.length;
  const y = (p: number) => padTop + (H - padTop - padBot) * (1 - (p - lo) / (hi - lo));
  const x = (i: number) => gx0 + (gx1 - gx0) * ((i + 0.5) / n);
  const gbw = opts.gbw ?? Math.min(((gx1 - gx0) / n) * 0.55, 26);
  const sc: BarChartScale = { W, H, padX: gx0, padTop, padBot, min: lo, max: hi, n, x0: gx0, x1: gx1, x, y, bw: gbw };
  return { sc, ox, gbw, obw };
}

function GroupAggregateChart({
  groupBars,
  aggBar,
  layout,
  groupLabel,
  aggLabel,
  highlight = null,
  showLast = false,
  mapLines = true,
  noAnim = false,
  tap = false,
  svgRef,
  onTapDown,
  blurred = false,
  note,
}: {
  groupBars: CandleBar[];
  aggBar: CandleBar;
  layout: GroupLayout;
  groupLabel: string;
  aggLabel: string;
  highlight?: number | null;
  showLast?: boolean;
  mapLines?: boolean;
  noAnim?: boolean;
  tap?: boolean;
  svgRef?: React.Ref<SVGSVGElement>;
  onTapDown?: (e: React.PointerEvent<SVGRectElement>) => void;
  blurred?: boolean;
  note?: string;
}) {
  const { sc, ox, gbw, obw } = layout;
  const n = groupBars.length;
  const hiIdx = indexOfHigh(groupBars);
  const loIdx = groupBars.reduce((bi, b, i) => (b.l < groupBars[bi]!.l ? i : bi), 0);

  const svg = (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${sc.W} ${sc.H}`}
      width="100%"
      style={{ display: "block", background: "#000", borderRadius: 16, border: "1px solid var(--border)", touchAction: "none", userSelect: "none", filter: blurred ? "blur(9px)" : "none", transition: "filter .5s ease" }}
    >
      <text x={(sc.x0 + sc.x1) / 2} y={20} fill="#88C9F7" fontSize={12.5} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
        {groupLabel}
      </text>
      <text x={ox} y={20} fill="#F7C325" fontSize={12.5} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
        {aggLabel}
      </text>
      <text x={(sc.x1 + ox - obw / 2) / 2} y={sc.H / 2} fill="#5b6b8c" fontSize={26} fontWeight={900} textAnchor="middle">
        ›
      </text>
      {groupBars.map((b, i) => {
        const cx = sc.x(i);
        const bull = b.c >= b.o;
        const col = bull ? "#22c55e" : "#ef4444";
        const top = sc.y(Math.max(b.o, b.c));
        const bot = sc.y(Math.min(b.o, b.c));
        const isHl = highlight === i;
        const dim = highlight != null && highlight !== i;
        const style: CSSProperties = { opacity: dim ? 0.3 : 1, transition: "opacity .3s" };
        if (!noAnim) {
          style.animation = "candleAppear .3s cubic-bezier(.22,1,.36,1) both";
          style.animationDelay = `${i * 40}ms`;
        }
        if (isHl) style.filter = "drop-shadow(0 0 8px rgba(69,109,255,.9))";
        return (
          <g key={`gc${i}`} style={style}>
            <line x1={cx} x2={cx} y1={sc.y(b.h)} y2={top} stroke={col} strokeWidth={3} strokeLinecap="round" />
            <line x1={cx} x2={cx} y1={bot} y2={sc.y(b.l)} stroke={col} strokeWidth={3} strokeLinecap="round" />
            <rect x={cx - gbw / 2} y={top} width={gbw} height={Math.max(2, bot - top)} rx={2} fill={col} />
            {isHl ? <rect x={cx - gbw / 2 - 6} y={sc.y(b.h) - 6} width={gbw + 12} height={sc.y(b.l) - sc.y(b.h) + 12} rx={4} fill="none" stroke="#456DFF" strokeWidth={2.4} /> : null}
            {i === n - 1 && showLast ? (
              <text x={cx} y={sc.y(b.l) + 20} fill="#F7C325" fontSize={10.5} fontWeight={800} textAnchor="middle">
                LAST
              </text>
            ) : null}
          </g>
        );
      })}
      {(() => {
        const bull = aggBar.c >= aggBar.o;
        const col = bull ? "#22c55e" : "#ef4444";
        const top = sc.y(Math.max(aggBar.o, aggBar.c));
        const bot = sc.y(Math.min(aggBar.o, aggBar.c));
        const style: CSSProperties = noAnim ? {} : { animation: "candleAppear .45s cubic-bezier(.22,1,.36,1) both", animationDelay: "620ms" };
        return (
          <g style={style}>
            <line x1={ox} x2={ox} y1={sc.y(aggBar.h)} y2={top} stroke={col} strokeWidth={4} strokeLinecap="round" />
            <line x1={ox} x2={ox} y1={bot} y2={sc.y(aggBar.l)} stroke={col} strokeWidth={4} strokeLinecap="round" />
            <rect x={ox - obw / 2} y={top} width={obw} height={Math.max(3, bot - top)} rx={3} fill={col} />
          </g>
        );
      })()}
      {mapLines
        ? (() => {
            const specs = [
              { price: groupBars[hiIdx]!.h, fromI: hiIdx, label: "HIGH", col: "#F7C325" },
              { price: groupBars[0]!.o, fromI: 0, label: "OPEN", col: "#88C9F7" },
              { price: groupBars[n - 1]!.c, fromI: n - 1, label: "CLOSE", col: "#456DFF" },
              { price: groupBars[loIdx]!.l, fromI: loIdx, label: "LOW", col: "#94a3b8" },
            ].sort((a, b) => sc.y(a.price) - sc.y(b.price));
            const MIN = 22;
            let prevLy = sc.y(specs[0]!.price);
            const laidOut = specs.map((s, i) => {
              const ly = i === 0 ? sc.y(s.price) : Math.max(sc.y(s.price), prevLy + MIN);
              prevLy = ly;
              return { ...s, ly };
            });
            return laidOut.map((s) => {
              const leaderX = ox + obw / 2 + 6;
              const priceY = sc.y(s.price);
              return (
                <motion.g key={`lk${s.label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.82 }}>
                  <line x1={sc.x(s.fromI)} x2={leaderX} y1={priceY} y2={priceY} stroke={s.col} strokeWidth={1.3} strokeDasharray="4 3" opacity={0.75} />
                  {s.ly !== priceY ? <line x1={leaderX} x2={leaderX} y1={priceY} y2={s.ly} stroke={s.col} strokeWidth={1.3} strokeDasharray="4 3" opacity={0.75} /> : null}
                  <text x={ox + obw / 2 + 12} y={s.ly + 4} fill={s.col} fontSize={11} fontWeight={800}>
                    {s.label}
                  </text>
                </motion.g>
              );
            });
          })()
        : null}
      {note ? (
        <text x={(sc.x0 + sc.x1) / 2} y={sc.H - 8} fill="#777" fontSize={12} fontWeight={700} textAnchor="middle">
          {note}
        </text>
      ) : null}
      {tap ? <rect x={sc.x0 - 10} y={sc.padTop} width={sc.x1 - sc.x0 + 20} height={sc.H - sc.padTop - sc.padBot} fill="transparent" style={{ cursor: "pointer" }} onPointerDown={onTapDown} /> : null}
    </svg>
  );

  if (!blurred) return svg;
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {svg}
      <div className="absolute inset-0 grid place-items-center bg-black/25">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border-medium bg-[rgba(20,20,20,0.85)] px-4 py-2 text-[12.5px] font-bold text-[#ccc]">
          <LockIcon />
          answer to reveal the chart
        </span>
      </div>
    </div>
  );
}

/* ================================================================
 * S0 intro — live-forming candle animation. 24 five-minute candles
 * merge in real time into 2 one-hour candles, exactly like the design's
 * intro3D()/startIntroForm() loop.
 * ================================================================ */

function partialBar(b: CandleBar, fr: number): CandleBar {
  const c = b.o + (b.c - b.o) * fr;
  const h = Math.max(b.o, c, b.o + (b.h - b.o) * fr);
  const l = Math.min(b.o, c, b.o + (b.l - b.o) * fr);
  return { o: b.o, c, h, l };
}

function liveGroup(bars: CandleBar[], a: number, b: number, nFull: number, frac: number): (CandleBar & { complete: boolean }) | null {
  const eff: CandleBar[] = [];
  for (let k = a; k <= b; k++) {
    if (k < nFull) eff.push(bars[k]!);
    else if (k === nFull && frac > 0) eff.push(partialBar(bars[k]!, frac));
    else break;
  }
  if (!eff.length) return null;
  const last = eff[eff.length - 1]!;
  return { o: bars[a]!.o, c: last.c, h: Math.max(...eff.map((x) => x.h)), l: Math.min(...eff.map((x) => x.l)), complete: nFull > b };
}

function groupExtremeIdx(bars: CandleBar[], a: number, b: number, pick: "h" | "l"): number {
  let bi = a;
  for (let k = a; k <= b; k++) {
    if (pick === "h" ? bars[k]!.h > bars[bi]!.h : bars[k]!.l < bars[bi]!.l) bi = k;
  }
  return bi;
}

function IntroLiveForm() {
  const [introN, setIntroN] = useState(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const dur = 24 * INTRO_FORM_MS_PER_CANDLE;
    function run() {
      const t0 = performance.now();
      setIntroN(0);
      function step(now: number) {
        if (cancelled) return;
        const el = now - t0;
        if (el >= dur) {
          setIntroN(24);
          timeoutRef.current = window.setTimeout(() => {
            if (!cancelled) run();
          }, INTRO_FORM_HOLD_MS);
          return;
        }
        setIntroN((el / dur) * 24);
        rafRef.current = requestAnimationFrame(step);
      }
      rafRef.current = requestAnimationFrame(step);
    }
    run();
    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current != null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const H1A_FULL = { h: Math.max(...INTRO_FIVE.slice(0, 12).map((b) => b.h)), l: Math.min(...INTRO_FIVE.slice(0, 12).map((b) => b.l)) };
  const H1B_FULL = { h: Math.max(...INTRO_FIVE.slice(12, 24).map((b) => b.h)), l: Math.min(...INTRO_FIVE.slice(12, 24).map((b) => b.l)) };
  const allLo = Math.min(...INTRO_FIVE.map((b) => b.l), H1A_FULL.l, H1B_FULL.l);
  const allHi = Math.max(...INTRO_FIVE.map((b) => b.h), H1A_FULL.h, H1B_FULL.h);
  const y = (v: number) => 28 + (190 - 28) * (1 - (v - allLo) / (allHi - allLo));
  const lx0 = 16;
  const lx1 = 406;
  const rx: [number, number] = [476, 566];

  const nFull = Math.min(24, Math.floor(introN));
  const frac = introN - nFull;
  const H1A = liveGroup(INTRO_FIVE, 0, 11, nFull, frac);
  const H1B = liveGroup(INTRO_FIVE, 12, 23, nFull, frac);

  const fiveEls: ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    let b: CandleBar;
    if (i < nFull) b = INTRO_FIVE[i]!;
    else if (i === nFull && frac > 0) b = partialBar(INTRO_FIVE[i]!, frac);
    else break;
    const cx = lx0 + ((lx1 - lx0) / 24) * (i + 0.5);
    const col = b.c >= b.o ? "#22C55E" : "#EF4444";
    const bw = Math.max(3, ((lx1 - lx0) / 24) * 0.55);
    const top = y(Math.max(b.o, b.c));
    const bot = y(Math.min(b.o, b.c));
    const isLast = i === nFull && frac > 0 && nFull < 24;
    fiveEls.push(
      <g key={`f${i}`} style={{ filter: isLast ? "drop-shadow(0 0 5px rgba(255,255,255,.5))" : undefined }}>
        <line x1={cx} x2={cx} y1={y(b.h)} y2={top} stroke={col} strokeWidth={1.8} strokeLinecap="round" />
        <line x1={cx} x2={cx} y1={bot} y2={y(b.l)} stroke={col} strokeWidth={1.8} strokeLinecap="round" />
        <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(1.5, bot - top)} rx={1.5} fill={col} />
      </g>,
    );
  }

  const h1Els = [H1A, H1B].map((b, i) => {
    if (!b) return null;
    const cx = rx[i]!;
    const col = b.c >= b.o ? "#22C55E" : "#EF4444";
    const bw = 34;
    const top = y(Math.max(b.o, b.c));
    const bot = y(Math.min(b.o, b.c));
    return (
      <g key={`h${i}`} style={{ filter: b.complete ? undefined : "drop-shadow(0 0 5px rgba(255,255,255,.35))", opacity: b.complete ? 1 : 0.85 }}>
        <line x1={cx} x2={cx} y1={y(b.h)} y2={top} stroke={col} strokeWidth={3} strokeLinecap="round" />
        <line x1={cx} x2={cx} y1={bot} y2={y(b.l)} stroke={col} strokeWidth={3} strokeLinecap="round" />
        <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(2, bot - top)} rx={2} fill={col} />
      </g>
    );
  });

  const hiA = groupExtremeIdx(INTRO_FIVE, 0, 11, "h");
  const loA = groupExtremeIdx(INTRO_FIVE, 0, 11, "l");
  const hiB = groupExtremeIdx(INTRO_FIVE, 12, 23, "h");
  const loB = groupExtremeIdx(INTRO_FIVE, 12, 23, "l");
  const dashSpecs: Array<[number, number, number]> = [];
  if (H1A?.complete) dashSpecs.push([INTRO_FIVE[0]!.o, 0, 0], [INTRO_FIVE[hiA]!.h, hiA, 0], [INTRO_FIVE[loA]!.l, loA, 0], [INTRO_FIVE[11]!.c, 11, 0]);
  if (H1B?.complete) dashSpecs.push([INTRO_FIVE[12]!.o, 12, 1], [INTRO_FIVE[hiB]!.h, hiB, 1], [INTRO_FIVE[loB]!.l, loB, 1], [INTRO_FIVE[23]!.c, 23, 1]);

  return (
    <div className="text-center">
      <div className="relative mx-auto max-w-[560px]">
        <svg viewBox="0 0 620 214" width="100%" className="block">
          {fiveEls}
          {h1Els}
          {dashSpecs.map((d, i) => (
            <line key={`dl${i}`} x1={lx0 + ((lx1 - lx0) / 24) * (d[1] + 0.5)} x2={rx[d[2]!]} y1={y(d[0]!)} y2={y(d[0]!)} stroke="#5b6b8c" strokeWidth={1.1} strokeDasharray="3 4" opacity={0.7} />
          ))}
          <text x={(lx0 + lx1) / 2} y={14} fill="#88C9F7" fontSize={12.5} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
            5-minute · 24 candles
          </text>
          <text x={(rx[0] + rx[1]) / 2} y={14} fill="#F7C325" fontSize={12.5} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
            1-hour · 2 candles
          </text>
        </svg>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="mt-5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-light">
        {INTRO_KICKER}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mx-auto mt-1.5 max-w-[600px] text-[34px] font-black leading-[1.06] tracking-tight sm:text-[36px]"
      >
        {INTRO_TITLE_LINE1}
        <br />
        {INTRO_TITLE_LINE2}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="mx-auto mt-2.5 max-w-[520px] text-[15px] leading-relaxed text-text-secondary">
        {INTRO_SUBTITLE}
      </motion.p>
      <div className="mx-auto mt-3.5 flex max-w-[560px] flex-wrap justify-center gap-2">
        {INTRO_CHIPS.map((c, i) => (
          <motion.div
            key={c}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.07, duration: 0.45 }}
            className="flex items-center gap-2 rounded-full border border-border-medium bg-brill-700 px-3.5 py-2 text-[13.5px] font-semibold text-[#dcdcdc]"
          >
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-blue" />
            {c}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
 * time-axis helper — noiseQuiz's two mini charts
 * ================================================================ */

function fmtSessionTime(mins: number): string {
  const h = (((9 * 60 + 15 + mins) % 1440) + 1440) % 1440;
  const hh = Math.floor(h / 60);
  const mm = h % 60;
  return `${hh % 12 || 12}:${String(mm).padStart(2, "0")}`;
}

function TimeAxis({ sc, n, stepMin, every, offsetMin = 0 }: { sc: BarChartScale; n: number; stepMin: number; every: number; offsetMin?: number }) {
  const ticks: ReactNode[] = [];
  for (let i = 0; i < n; i += every) {
    ticks.push(
      <text key={`ax${i}`} x={sc.x(i)} y={sc.H - 6} fill="#666" fontSize={9.5} fontFamily={MONO} textAnchor="middle">
        {fmtSessionTime(offsetMin + i * stepMin)}
      </text>,
    );
  }
  return <>{ticks}</>;
}

/* ================================================================
 * state
 * ================================================================ */

type Phase = "idle" | "hint" | "correct" | "wrong";

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
  tf: TfKey;
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
  tf: "5m",
};

function enterStep(state: LessonState, n: number): LessonState {
  return { ...state, step: n, phase: "idle", attempts: 0, lastAward: 0, sel: null, tap: null, tf: "5m" };
}

function isSceneReady(step: number, state: LessonState): boolean {
  switch (SCENE_TYPES[step]) {
    case "mcq":
    case "tfmcq":
      return state.sel != null;
    case "tap":
    case "tapGroup":
      return state.tap != null;
    default:
      return true;
  }
}

function evalSceneCorrect(step: number, state: LessonState): boolean {
  switch (step) {
    case 2:
      return state.sel === INTUITION_MCQ.correctIndex;
    case 4:
      return state.sel === COUNT_QUIZ.correctIndex;
    case 6:
      return state.tap != null && state.tap.idx === indexOfHigh(TAP_GROUP_BARS);
    case 7:
      return state.tap != null && state.tap.idx === 11;
    case 9:
      return state.sel === TF_EXPLORE.correctIndex;
    case 11:
      return state.sel === NOISE_QUIZ.correctIndex;
    case 13:
      return state.sel === MATCH_QUIZ.correctIndex;
    case 16:
      return state.sel === CONFLICT_QUIZ.correctIndex;
    case 18:
      return state.tap != null && state.tap.idx === BOSS_TAP.target;
    case 19:
      return state.sel === BOSS_DECIDE.correctIndex;
    default:
      return false;
  }
}

const FB_BY_STEP: Partial<Record<number, { hint: string; correct: string; wrong: string }>> = {
  2: INTUITION_MCQ.fb,
  4: COUNT_QUIZ.fb,
  6: TAP_HIGH.fb,
  7: TAP_CLOSE.fb,
  9: TF_EXPLORE.fb,
  11: NOISE_QUIZ.fb,
  13: MATCH_QUIZ.fb,
  16: CONFLICT_QUIZ.fb,
  18: BOSS_TAP.fb,
  19: BOSS_DECIDE.fb,
};

/** Real question text/options/answer per step, fed to the AI coach on a wrong attempt. */
const QUESTION_CONTEXT_BY_STEP: Partial<
  Record<number, { question: string; options?: string[]; correctAnswer?: string }>
> = {
  2: { question: INTUITION_MCQ.prompt, options: INTUITION_MCQ.options, correctAnswer: INTUITION_MCQ.options[INTUITION_MCQ.correctIndex] },
  4: { question: COUNT_QUIZ.prompt, options: COUNT_QUIZ.options, correctAnswer: COUNT_QUIZ.options[COUNT_QUIZ.correctIndex] },
  6: { question: TAP_HIGH.prompt },
  7: { question: TAP_CLOSE.prompt },
  9: { question: TF_EXPLORE.prompt, options: TF_EXPLORE.options, correctAnswer: TF_EXPLORE.options[TF_EXPLORE.correctIndex] },
  11: { question: NOISE_QUIZ.prompt, options: NOISE_QUIZ.options, correctAnswer: NOISE_QUIZ.options[NOISE_QUIZ.correctIndex] },
  13: { question: MATCH_QUIZ.prompt, options: MATCH_QUIZ.options, correctAnswer: MATCH_QUIZ.options[MATCH_QUIZ.correctIndex] },
  16: { question: CONFLICT_QUIZ.prompt, options: CONFLICT_QUIZ.options, correctAnswer: CONFLICT_QUIZ.options[CONFLICT_QUIZ.correctIndex] },
  18: { question: BOSS_TAP.prompt },
  19: { question: BOSS_DECIDE.prompt, options: BOSS_DECIDE.options, correctAnswer: BOSS_DECIDE.options[BOSS_DECIDE.correctIndex] },
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

export function TimeFramesLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const { collapsed, setCollapsed, coachPanelProps, notifyWrongAttempt } = useLessonCoach({
    lessonTitle: "Timeframes Explained",
    lessonTopic: "timeframes",
    suggestedChips: ["Which timeframe should I use?", "Why do candles look different zoomed in?", "Give me an example"],
  });

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
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

  function selectTf(tf: TfKey) {
    sound.tick();
    setState((s) => ({ ...s, tf }));
  }

  function tapChart(e: React.PointerEvent<SVGRectElement>, sc: BarChartScale) {
    if (resolved) return;
    const svg = svgRef.current;
    if (!svg) return;
    const loc = locateChartPoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
    setState((s) => ({ ...s, tap: loc }));
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
      setState((s) => ({ ...s, phase: "wrong", attempts: s.attempts + 1, lastAward: 5, qAnswered: s.qAnswered + 1 }));
      awardXp(5);
      notifyWrongAttemptForStep("explain");
    }
  }

  function goBack() {
    sound.tick();
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
    const n = step + 1;
    setState((s) => enterStep(s, n));
    if (n === TOTAL_STEPS) {
      sound.lessonComplete();
      setBurst((b) => ({ id: b.id + 1, count: 64 }));
      completeLesson({ lessonSlug: TIME_FRAMES_LESSON_SLUG, score: 100, xpEarned: TIME_FRAMES_LESSON_XP });
    }
  }

  function restart() {
    setState(initialState);
    setFloaters([]);
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
              <div className="mx-auto max-w-[760px]">
                <IntroLiveForm />
              </div>
            )}

            {/* ===== S1 HOOK ===== */}
            {step === 1 &&
              (() => {
                const one = BASE[3]!;
                const sc = autoScale([one], { W: 840, H: 380, padX: 60, padTop: 40, padBot: 34 });
                const cx = 300;
                const bw = 86;
                const color = candleBodyColor(one.c >= one.o);
                const top = sc.y(Math.max(one.o, one.c));
                const bot = sc.y(Math.min(one.o, one.c));
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HOOK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOOK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOOK.prompt}</p>
                    <ChartSvg sc={sc}>
                      <g className="candle-bar">
                        <line x1={cx} x2={cx} y1={sc.y(one.h)} y2={top} stroke={color} strokeWidth={4} strokeLinecap="round" />
                        <line x1={cx} x2={cx} y1={bot} y2={sc.y(one.l)} stroke={color} strokeWidth={4} strokeLinecap="round" />
                        <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(3, bot - top)} rx={3} fill={color} />
                      </g>
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.76 }}>
                        <text x={cx + 70} y={sc.padTop + 30} fill="#e9edf5" fontSize={14} fontWeight={800}>
                          this one candle =
                        </text>
                        <text x={cx + 70} y={sc.padTop + 54} fill="#88C9F7" fontSize={14} fontWeight={800} fontFamily={MONO}>
                          5 minutes of trading
                        </text>
                        <text x={cx + 70} y={sc.padTop + 92} fill="#8a8a8a" fontSize={13} fontWeight={700}>
                          on a 1-hour chart, the same
                        </text>
                        <text x={cx + 70} y={sc.padTop + 112} fill="#8a8a8a" fontSize={13} fontWeight={700}>
                          shape would hold 60 minutes
                        </text>
                        <text x={cx} y={sc.y(one.l) + 28} fill="#F7C325" fontSize={12} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
                          ⏱ 09:15 → 09:20
                        </text>
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S2 INTUITION (mcq) ===== */}
            {step === 2 &&
              (() => {
                const bars = BASE.slice(0, 26);
                const sc = autoScale(bars, { W: 840, H: 340, padTop: 34, padBot: 30 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{INTUITION_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INTUITION_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INTUITION_MCQ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={bars} stagger={20} />
                        <text x={sc.padX + 4} y={sc.padTop - 12} fill="#88C9F7" fontSize={12} fontWeight={800} fontFamily={MONO}>
                          5-minute chart
                        </text>
                      </ChartSvg>
                    </div>
                    <McqOptions options={INTUITION_MCQ.options} correctIndex={INTUITION_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S3 FIXED TIME (teach) ===== */}
            {step === 3 &&
              (() => {
                const sc = autoScale([FIXED_TIME_QUIET, FIXED_TIME_WILD], { W: 840, H: 380, padTop: 44, padBot: 40 });
                const mk = (b: CandleBar, cx: number, lbl: string, note: string) => {
                  const color = candleBodyColor(b.c >= b.o);
                  const top = sc.y(Math.max(b.o, b.c));
                  const bot = sc.y(Math.min(b.o, b.c));
                  return (
                    <g key={`q${cx}`} className="candle-bar">
                      <line x1={cx} x2={cx} y1={sc.y(b.h)} y2={top} stroke={color} strokeWidth={3.6} strokeLinecap="round" />
                      <line x1={cx} x2={cx} y1={bot} y2={sc.y(b.l)} stroke={color} strokeWidth={3.6} strokeLinecap="round" />
                      <rect x={cx - 35} y={top} width={70} height={Math.max(3, bot - top)} rx={3} fill={color} />
                      <text x={cx} y={sc.padTop - 14} fill="#e9edf5" fontSize={13} fontWeight={800} textAnchor="middle">
                        {lbl}
                      </text>
                      <text x={cx} y={sc.H - sc.padBot + 22} fill="#8a8a8a" fontSize={11.5} fontWeight={700} textAnchor="middle">
                        {note}
                      </text>
                    </g>
                  );
                };
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{FIXED_TIME.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{FIXED_TIME.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{FIXED_TIME.prompt}</p>
                    <ChartSvg sc={sc}>
                      {mk(FIXED_TIME_QUIET, 300, "quiet 5 min", "barely moved")}
                      {mk(FIXED_TIME_WILD, 560, "wild 5 min", "huge range")}
                      <text x={430} y={sc.H - 6} fill="#F7C325" fontSize={12.5} fontWeight={800} textAnchor="middle" fontFamily={MONO}>
                        both cover exactly 5 minutes
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S4 COUNT QUIZ (mcq) ===== */}
            {step === 4 &&
              (() => {
                const aggBar = aggregateBars(COUNT_QUIZ_BARS, 12)[0]!;
                const layout = computeGroupLayout(COUNT_QUIZ_BARS, aggBar, { W: 840, H: 320, padTop: 38, padBot: 30, gx0: 64, gx1: 560, ox: 730, obw: 54 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{COUNT_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{COUNT_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{COUNT_QUIZ.prompt}</p>
                    <div className="mb-5">
                      <GroupAggregateChart
                        groupBars={COUNT_QUIZ_BARS}
                        aggBar={aggBar}
                        layout={layout}
                        groupLabel="5-minute · 09:15 → 10:15"
                        aggLabel="1-hour"
                        mapLines={false}
                        noAnim
                        blurred={!resolved}
                        note="how many 5-minute candles merge into that one hour?"
                      />
                    </div>
                    <McqOptions options={COUNT_QUIZ.options} correctIndex={COUNT_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S5 AGGREGATE (teach) ===== */}
            {step === 5 &&
              (() => {
                const aggBar = aggregateBars(AGGREGATE_BARS, 12)[0]!;
                const layout = computeGroupLayout(AGGREGATE_BARS, aggBar);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{AGGREGATE_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{AGGREGATE_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{AGGREGATE_TEACH.prompt}</p>
                    <GroupAggregateChart groupBars={AGGREGATE_BARS} aggBar={aggBar} layout={layout} groupLabel="12 × 5-minute candles" aggLabel="1 × 1-hour candle" />
                  </div>
                );
              })()}

            {/* ===== S6 TAP HIGH (tapGroup) ===== */}
            {step === 6 &&
              (() => {
                const layout = computeGroupLayout(TAP_GROUP_BARS, TAP_GROUP_AGG);
                const target = indexOfHigh(TAP_GROUP_BARS);
                const highlight = resolved ? target : state.tap ? Math.max(0, Math.min(11, state.tap.idx)) : null;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_HIGH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_HIGH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_HIGH.prompt}</p>
                    <GroupAggregateChart
                      groupBars={TAP_GROUP_BARS}
                      aggBar={TAP_GROUP_AGG}
                      layout={layout}
                      groupLabel="12 × 5-minute candles"
                      aggLabel="1 × 1-hour candle"
                      mapLines={false}
                      highlight={highlight}
                      tap
                      svgRef={svgRef}
                      onTapDown={(e) => tapChart(e, layout.sc)}
                    />
                  </div>
                );
              })()}

            {/* ===== S7 TAP CLOSE (tapGroup) ===== */}
            {step === 7 &&
              (() => {
                const layout = computeGroupLayout(TAP_GROUP_BARS, TAP_GROUP_AGG);
                const highlight = resolved ? 11 : state.tap ? Math.max(0, Math.min(11, state.tap.idx)) : null;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_CLOSE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_CLOSE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_CLOSE.prompt}</p>
                    <GroupAggregateChart
                      groupBars={TAP_GROUP_BARS}
                      aggBar={TAP_GROUP_AGG}
                      layout={layout}
                      groupLabel="12 × 5-minute candles"
                      aggLabel="1 × 1-hour candle"
                      mapLines={false}
                      showLast={resolved}
                      highlight={highlight}
                      tap
                      svgRef={svgRef}
                      onTapDown={(e) => tapChart(e, layout.sc)}
                    />
                  </div>
                );
              })()}

            {/* ===== S8 SAME DATA (teach) ===== */}
            {step === 8 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{SAME_DATA.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SAME_DATA.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SAME_DATA.prompt}</p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Panel bars={BASE} label="5m" sub="96 candles" W={270} H={230} stagger={6} bw={4} />
                  <Panel bars={M15} label="15m" sub="32 candles" W={270} H={230} stagger={14} bw={8} />
                  <Panel bars={H1} label="1h" sub="8 candles" W={270} H={230} stagger={44} bw={22} accent="#F7C325" />
                </div>
              </div>
            )}

            {/* ===== S9 TF EXPLORE (tfmcq) ===== */}
            {step === 9 &&
              (() => {
                const bars = TF_BARS[state.tf];
                const sc = autoScale(bars, { W: 840, H: 340, padTop: 30, padBot: 30 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TF_EXPLORE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TF_EXPLORE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TF_EXPLORE.prompt}</p>
                    <TfPills tf={state.tf} onSelect={selectTf} />
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={bars} stagger={state.tf === "5m" ? 6 : state.tf === "15m" ? 14 : 44} keyPrefix={`tf${state.tf}`} />
                      </ChartSvg>
                    </div>
                    <McqOptions options={TF_EXPLORE.options} correctIndex={TF_EXPLORE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S10 NOISE TEACH ===== */}
            {step === 10 &&
              (() => {
                const bars = BASE.slice(36, 48);
                const sc = autoScale(bars, { W: 840, H: 340, padTop: 36, padBot: 30 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{NOISE_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{NOISE_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{NOISE_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <ChartCandles sc={sc} bars={bars} stagger={30} />
                      <text x={sc.padX + 4} y={sc.padTop - 14} fill="#ff8f8f" fontSize={12.5} fontWeight={800} fontFamily={MONO}>
                        5-minute · looks like a breakdown
                      </text>
                      <text x={sc.W / 2} y={sc.H - 8} fill="#777" fontSize={12} fontWeight={700} textAnchor="middle">
                        dozens of small signals — most of them noise
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S11 NOISE QUIZ (mcq) ===== */}
            {step === 11 &&
              (() => {
                const scL = autoScale(NOISE_QUIZ_SEG, { W: 400, H: 250, padX: 14, padTop: 34, padBot: 22 });
                const scR = autoScale(NOISE_QUIZ_TWO_H, { W: 400, H: 250, padX: 14, padTop: 34, padBot: 22 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{NOISE_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{NOISE_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{NOISE_QUIZ.prompt}</p>
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                      <div className="flex-1">
                        <div className="mb-1.5 whitespace-nowrap text-[12.5px]">
                          <span style={{ fontFamily: MONO, fontWeight: 800, color: "#ff8f8f" }}>15m</span>
                          <span className="font-semibold text-[#777]">{"  ·  downtrend · lower highs, lower lows"}</span>
                        </div>
                        <svg viewBox={`0 0 ${scL.W} ${scL.H}`} width="100%" className="block rounded-xl border border-border bg-black">
                          <ChartCandles sc={scL} bars={NOISE_QUIZ_SEG} stagger={9} bw={8} keyPrefix="nl" />
                          <TimeAxis sc={scL} n={NOISE_QUIZ_SEG.length} stepMin={15} every={9} />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1.5 whitespace-nowrap text-[12.5px]">
                          <span style={{ fontFamily: MONO, fontWeight: 800, color: "#F7C325" }}>1h</span>
                          <span className="font-semibold text-[#777]">{"  ·  5 earlier hours + the same 12"}</span>
                        </div>
                        <svg viewBox={`0 0 ${scR.W} ${scR.H}`} width="100%" className="block rounded-xl border border-border bg-black">
                          <rect
                            x={scR.x(9.5)}
                            y={scR.padTop}
                            width={scR.x1 - scR.x(9.5)}
                            height={scR.H - scR.padTop - scR.padBot}
                            rx={6}
                            fill="rgba(255,93,93,0.06)"
                            style={{ filter: "drop-shadow(0 0 6px rgba(255,93,93,0.12))" }}
                          />
                          <ChartCandles sc={scR} bars={NOISE_QUIZ_TWO_H} stagger={30} bw={20} keyPrefix="nr" />
                          <TimeAxis sc={scR} n={NOISE_QUIZ_TWO_H.length} stepMin={60} every={2} offsetMin={-12 * 60} />
                          {resolved ? (
                            <text x={scR.W / 2} y={scR.padTop - 4} fill="#88C9F7" fontSize={10.5} fontWeight={800} textAnchor="middle">
                              ← just a retracement in a bigger uptrend
                            </text>
                          ) : null}
                        </svg>
                      </div>
                    </div>
                    <McqOptions options={NOISE_QUIZ.options} correctIndex={NOISE_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S12 TF MENU (teach) ===== */}
            {step === 12 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{TF_MENU_TEACH.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TF_MENU_TEACH.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TF_MENU_TEACH.prompt}</p>
                <div className="grid gap-2.5">
                  {TF_MENU_ROWS.map((r, i) => (
                    <motion.div
                      key={r.tf}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="flex items-center gap-3.5 rounded-xl border border-border bg-brill-700 px-4 py-3.5"
                    >
                      <span style={{ fontFamily: MONO, color: r.color, minWidth: 88 }} className="text-sm font-extrabold">
                        {r.tf}
                      </span>
                      <span className="min-w-[150px] text-[14.5px] font-bold text-white">{r.who}</span>
                      <span className="text-[13px] text-[#8a8a8a]">{r.span}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== S13 MATCH QUIZ (mcq) ===== */}
            {step === 13 &&
              (() => {
                const sc = autoScale(H1, { W: 840, H: 280, padTop: 34, padBot: 28 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{MATCH_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{MATCH_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{MATCH_QUIZ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={H1} stagger={40} bw={26} />
                        <text x={sc.padX + 4} y={sc.padTop - 12} fill="#F7C325" fontSize={12} fontWeight={800} fontFamily={MONO}>
                          a higher-timeframe chart
                        </text>
                      </ChartSvg>
                    </div>
                    <McqOptions options={MATCH_QUIZ.options} correctIndex={MATCH_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S14 HTF CONTEXT (teach) ===== */}
            {step === 14 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{HTF_CONTEXT.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HTF_CONTEXT.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HTF_CONTEXT.prompt}</p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Panel bars={H1} label="1h" sub="which way?" W={400} H={250} stagger={40} bw={26} accent="#F7C325" />
                    <div className="mt-2 text-[12.5px] font-bold text-gold">↑ direction &amp; key levels</div>
                  </div>
                  <div className="flex-1">
                    <Panel bars={M15.slice(20, 32)} label="15m" sub="when exactly?" W={400} H={250} stagger={14} bw={22} />
                    <div className="mt-2 text-[12.5px] font-bold text-blue-light">↑ precise entry</div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== S15 TOP DOWN (teach) ===== */}
            {step === 15 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{TOP_DOWN.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TOP_DOWN.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TOP_DOWN.prompt}</p>
                <div className="grid gap-2.5">
                  {TOP_DOWN_STEPS.map((r, i) => (
                    <motion.div
                      key={r.n}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.11 }}
                      className={`flex items-center gap-3.5 rounded-xl border px-[1.125rem] py-4 ${i === 0 ? "border-gold/30 bg-gold-bg" : "border-border bg-brill-700"}`}
                    >
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-sm font-black text-brill-900" style={{ background: r.color }}>
                        {r.n}
                      </span>
                      <span style={{ fontFamily: MONO, color: r.color, minWidth: 78 }} className="text-sm font-extrabold">
                        {r.tf}
                      </span>
                      <span className="text-[14.5px] font-semibold text-[#dcdcdc]">{r.job}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== S16 CONFLICT QUIZ (mcq) ===== */}
            {step === 16 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{CONFLICT_QUIZ.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CONFLICT_QUIZ.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CONFLICT_QUIZ.prompt}</p>
                <div className="mb-5 flex flex-col gap-3 sm:flex-row">
                  <Panel bars={CONFLICT_QUIZ_UP} label="5m" sub="rallying" W={400} H={240} stagger={22} bw={11} accent="#22c55e" />
                  <Panel bars={CONFLICT_QUIZ_DAILY} label="Daily" sub="downtrend" W={400} H={240} stagger={12} accent="#ff8f8f" />
                </div>
                <McqOptions options={CONFLICT_QUIZ.options} correctIndex={CONFLICT_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S17 ALIGNMENT (teach) ===== */}
            {step === 17 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{ALIGNMENT_TEACH.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{ALIGNMENT_TEACH.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{ALIGNMENT_TEACH.prompt}</p>
                <div className="grid gap-2.5">
                  {ALIGNMENT_ROWS.map((r, i) => (
                    <motion.div
                      key={r.tf}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.11 }}
                      className="flex items-center gap-3.5 rounded-xl border border-blue/35 bg-blue-bgDark px-[1.125rem] py-3.5"
                    >
                      <span style={{ fontFamily: MONO, color: r.color, minWidth: 78 }} className="text-sm font-extrabold">
                        {r.tf}
                      </span>
                      <span className="flex-1 text-[14.5px] font-semibold text-[#dcdcdc]">{r.note}</span>
                      <span className="text-base font-black text-blue-light">✓</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.34 }}
                    className="mt-1 rounded-xl border border-gold/30 bg-gold-bg px-[1.125rem] py-3.5 text-sm font-bold text-gold"
                  >
                    {ALIGNMENT_SUMMARY}
                  </motion.div>
                </div>
              </div>
            )}

            {/* ===== S18 BOSS TAP ===== */}
            {step === 18 &&
              (() => {
                const sc = autoScale(BOSS_H1, { W: 840, H: 340, padTop: 38, padBot: 30 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_TAP.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_TAP.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_TAP.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <ChartCandles sc={sc} bars={BOSS_H1} stagger={40} bw={34} highlight={resolved ? BOSS_TAP.target : null} dimOthers={false} />
                      <text x={sc.padX + 4} y={sc.padTop - 14} fill="#F7C325" fontSize={12.5} fontWeight={800} fontFamily={MONO}>
                        1-hour chart · 8 candles
                      </text>
                      {state.tap && !resolved ? <TapRing sc={sc} bars={BOSS_H1} tap={state.tap} /> : null}
                      {resolved ? (
                        <text x={sc.x(BOSS_TAP.target)} y={sc.y(BOSS_H1[BOSS_TAP.target]!.l) + 22} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="middle">
                          the whole selloff
                        </text>
                      ) : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S19 BOSS DECIDE (mcq) ===== */}
            {step === 19 &&
              (() => {
                const sc = autoScale(BOSS_DECIDE_FULL, { W: 840, H: 320, padTop: 36, padBot: 30 });
                const bars = resolved ? BOSS_DECIDE_FULL : BOSS_DECIDE_PRE;
                const boughtIdx = BOSS_DECIDE_PRE.length - 1;
                const revealIdx = BOSS_DECIDE_PRE.length + 4;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_DECIDE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_DECIDE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_DECIDE.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <ChartCandles sc={sc} bars={bars} stagger={24} />
                        <text x={sc.padX + 4} y={sc.padTop - 14} fill="#F7C325" fontSize={12.5} fontWeight={800} fontFamily={MONO}>
                          1-hour context
                        </text>
                        <line x1={sc.padX} x2={sc.W - sc.padX} y1={sc.y(BOSS_DECIDE_FIB)} y2={sc.y(BOSS_DECIDE_FIB)} stroke="#88C9F7" strokeWidth={1.3} strokeDasharray="5 4" opacity={0.6} />
                        <text x={sc.W - sc.padX - 8} y={sc.y(BOSS_DECIDE_FIB) - 6} fill="#88C9F7" fontSize={10.5} fontWeight={800} textAnchor="end">
                          50% retracement
                        </text>
                        {resolved ? (
                          <text x={sc.x(boughtIdx)} y={sc.y(BOSS_DECIDE_PRE[boughtIdx]!.l) + 20} fill="#88C9F7" fontSize={11} fontWeight={800} textAnchor="middle">
                            bought here
                          </text>
                        ) : null}
                        {resolved ? (
                          <text x={sc.x(revealIdx)} y={sc.y(BOSS_DECIDE_CONT[4]!.h) - 12} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="middle">
                            uptrend continues ▲
                          </text>
                        ) : null}
                      </ChartSvg>
                    </div>
                    <McqOptions options={BOSS_DECIDE.options} correctIndex={BOSS_DECIDE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S20 SUMMARY ===== */}
            {step === 20 && (
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
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-gold/35 bg-brill-700 p-[1.125rem]">
                    <div className="flex items-center justify-center gap-1.5 text-[32px] font-black text-gold">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="#f7c325" stroke="#f7c325" strokeWidth={1.4} strokeLinejoin="round">
                        <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12z" />
                      </svg>
                      {TIME_FRAMES_LESSON_XP}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">XP earned</div>
                  </div>
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-blue/35 bg-brill-700 p-[1.125rem]">
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
