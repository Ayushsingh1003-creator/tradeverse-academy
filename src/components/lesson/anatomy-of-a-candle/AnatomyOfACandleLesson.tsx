"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import { useLessonCoach } from "@/lib/hooks/useLessonCoach";
import { LessonCoachDock } from "@/components/lesson/LessonCoachPanel";
import { formatPrice, locatePoint, singleCandleScale, type CandleBar, type PricePoint, type SingleCandleScale } from "./geometry";
import { ANATOMY_LESSON_SLUG, ANATOMY_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  SCENE_TYPES,
  A,
  A_MIN,
  A_MAX,
  B,
  B_MIN,
  B_MAX,
  C,
  C_MIN,
  C_MAX,
  BOSS,
  BOSS_MIN,
  BOSS_MAX,
  HOOK_PATH,
  WHY,
  WHY_MIN,
  WHY_MAX,
  INTRO_KICKER,
  INTRO_TITLE_LINE1,
  INTRO_TITLE_LINE2,
  INTRO_SUBTITLE,
  INTRO_CHIPS,
  HOOK,
  INTUITION_MCQ,
  WHY_CANDLE,
  FOUR_POINTS,
  TAP_CLOSE,
  TAP_LOW,
  ANATOMY_TEACH,
  BULLBEAR,
  BULLBEAR_QUIZ,
  BODY_TEACH,
  CANDLE_OPTIONS,
  BODY_COMPARE,
  WICKS_TEACH,
  WICK_MEANING,
  TAP_REJECTION,
  READING_TEACH,
  READING_QUIZ,
  BOSS_IDENTIFY,
  BOSS_TAP,
  BOSS_DECIDE,
  BADGE_TITLE,
  BADGE_SUBTITLE,
  CHECKLIST_ITEMS,
  type CandleKind,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";

/* ================================================================
 * tiny icons
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
      <span className="shrink-0">{fb.tone === "correct" ? <CheckIcon size={18} /> : fb.tone === "wrong" ? <XIcon size={18} /> : <CheckIcon size={18} />}</span>
      <span>{fb.text}</span>
    </div>
  );
}

/* ================================================================
 * chart primitives
 * ================================================================ */

function ChartGrid({ sc }: { sc: SingleCandleScale }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const p = sc.min + ((sc.max - sc.min) * i) / 4;
        const y = sc.y(p);
        return (
          <g key={i}>
            <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={sc.W - sc.padX + 7} y={y + 4} fill="#5c5c5c" fontSize={11} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
              {Math.round(p).toLocaleString("en-IN")}
            </text>
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
  sc: SingleCandleScale;
  svgRef?: React.Ref<SVGSVGElement>;
  tapHit?: (e: React.PointerEvent<SVGRectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${sc.W} ${sc.H}`} width="100%" className="block touch-none select-none rounded-2xl border border-border bg-black">
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

function BCandle({
  sc,
  cx,
  bar,
  bw,
  glow,
  thin,
  noAnim,
  delay = 0,
}: {
  sc: SingleCandleScale;
  cx: number;
  bar: CandleBar;
  bw: number;
  glow?: boolean;
  thin?: boolean;
  noAnim?: boolean;
  delay?: number;
}) {
  const bull = bar.c >= bar.o;
  const color = bull ? "#22c55e" : "#ef4444";
  const top = sc.y(Math.max(bar.o, bar.c));
  const bot = sc.y(Math.min(bar.o, bar.c));
  return (
    <motion.g
      initial={noAnim ? undefined : { opacity: 0, y: 8 }}
      animate={noAnim ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={glow ? { filter: "drop-shadow(0 0 10px rgba(255,255,255,.12))" } : undefined}
    >
      <line x1={cx} x2={cx} y1={sc.y(bar.h)} y2={top} stroke={color} strokeWidth={thin ? 2.4 : 3.4} strokeLinecap="round" />
      <line x1={cx} x2={cx} y1={bot} y2={sc.y(bar.l)} stroke={color} strokeWidth={thin ? 2.4 : 3.4} strokeLinecap="round" />
      <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(3, bot - top)} rx={3} fill={color} />
    </motion.g>
  );
}

function TapMarker({ sc, point }: { sc: SingleCandleScale; point: PricePoint }) {
  const cx = sc.W / 2;
  const y = sc.y(point.price);
  return (
    <g>
      <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="5 4" />
      <circle cx={cx} cy={y} r={9} fill="rgba(136,201,247,0.25)" stroke="#88C9F7" strokeWidth={2} />
      <circle cx={cx} cy={y} r={2.5} fill="#fff" />
    </g>
  );
}

function Guide({
  sc,
  price,
  text,
  fill,
  textColor,
  side,
}: {
  sc: SingleCandleScale;
  price: number;
  text: string;
  fill: string;
  textColor: string;
  side: "left" | "right";
}) {
  const y = sc.y(price);
  const w = text.length * 7.2 + 22;
  const lx = side === "left" ? sc.padX + 8 : sc.W - sc.padX - 8 - w;
  return (
    <g>
      <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke={fill} strokeWidth={1.3} strokeDasharray="5 4" opacity={0.55} />
      <rect x={lx} y={y - 11} width={w} height={22} rx={5} fill={fill} />
      <text x={lx + 11} y={y + 5} fill={textColor} fontSize={12} fontWeight={800}>
        {text}
      </text>
    </g>
  );
}

function Brace({
  sc,
  cx,
  priceHi,
  priceLo,
  text,
  color,
  side,
}: {
  sc: SingleCandleScale;
  cx: number;
  priceHi: number;
  priceLo: number;
  text: string;
  color: string;
  side: "left" | "right";
}) {
  const x = side === "left" ? cx - 70 : cx + 70;
  const y1 = sc.y(priceHi);
  const y2 = sc.y(priceLo);
  const ym = (y1 + y2) / 2;
  const dir = side === "left" ? -1 : 1;
  const w = text.length * 7.2 + 16;
  const labelX = side === "left" ? x - 4 - w : x + 4;
  return (
    <g>
      <path d={`M${cx + dir * 46} ${y1} L${x} ${y1} L${x} ${y2} L${cx + dir * 46} ${y2}`} fill="none" stroke={color} strokeWidth={1.6} />
      <rect x={labelX} y={ym - 11} width={w} height={22} rx={5} fill={color} />
      <text x={labelX + 8} y={ym + 5} fill="#0a0a0a" fontSize={12} fontWeight={800}>
        {text}
      </text>
    </g>
  );
}

function LeaderStack({
  sc,
  cx,
  bw,
  rows,
}: {
  sc: SingleCandleScale;
  cx: number;
  bw: number;
  rows: Array<{ key: string; price: number; text: string; show: boolean }>;
}) {
  const boxX = sc.W - sc.padX - 146;
  const boxW = 136;
  return (
    <>
      {rows.map((r) => {
        if (!r.show) return null;
        const rowY = Math.max(sc.padTop + 12, Math.min(sc.H - sc.padBot - 12, sc.y(r.price)));
        const priceY = sc.y(r.price);
        const startX = cx + bw / 2 + 4;
        return (
          <motion.g key={r.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <line x1={startX} y1={priceY} x2={boxX - 6} y2={rowY} stroke="#88C9F7" strokeWidth={1.3} strokeDasharray="4 3" opacity={0.75} />
            <circle cx={startX} cy={priceY} r={3.5} fill="#88C9F7" />
            <rect x={boxX} y={rowY - 11} width={boxW} height={23} rx={5} fill="#88C9F7" />
            <text x={boxX + 10} y={rowY + 6} fill="#0a0a0a" fontSize={11.5} fontWeight={800}>
              {r.text}
            </text>
          </motion.g>
        );
      })}
    </>
  );
}

function FormingCandleShape({
  sc,
  cx,
  bw,
  formState,
  openPrice,
}: {
  sc: SingleCandleScale;
  cx: number;
  bw: number;
  formState: FormingState;
  openPrice: number;
}) {
  const { price, high, low, done } = formState;
  const bull = price >= openPrice;
  const color = bull ? "#22c55e" : "#ef4444";
  const top = sc.y(Math.max(openPrice, price));
  const bot = sc.y(Math.min(openPrice, price));
  const priceY = sc.y(price);
  const dashEnd = sc.W - sc.padX - 64;
  return (
    <g>
      <line x1={cx} x2={cx} y1={sc.y(high)} y2={top} stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <line x1={cx} x2={cx} y1={bot} y2={sc.y(low)} stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <rect x={cx - bw / 2} y={top} width={bw} height={Math.max(3, bot - top)} rx={3} fill={color} style={done ? { filter: "drop-shadow(0 0 10px rgba(255,255,255,.12))" } : undefined} />
      {!done ? (
        <>
          <line x1={cx + bw / 2} x2={dashEnd} y1={priceY} y2={priceY} stroke={color} strokeWidth={1.4} strokeDasharray="5 4" opacity={0.85} />
          <circle cx={cx} cy={priceY} r={4} fill="#fff" stroke={color} strokeWidth={2} />
          <rect x={dashEnd} y={priceY - 11} width={64} height={22} rx={5} fill={color} />
          <text x={dashEnd + 8} y={priceY + 5} fill="#0a0a0a" fontSize={10.5} fontWeight={800}>
            {formatPrice(price)}
          </text>
        </>
      ) : null}
    </g>
  );
}

function MiniCandle({ kind }: { kind: CandleKind }) {
  const W = 60;
  const H = 96;
  const cx = 30;
  let bodyTop: number;
  let bodyBot: number;
  let wickTop: number;
  let wickBot: number;
  let color: string;
  if (kind === "bull") {
    color = "#22c55e";
    wickTop = 8;
    wickBot = 88;
    bodyTop = 18;
    bodyBot = 78;
  } else if (kind === "hammer") {
    color = "#22c55e";
    wickTop = 8;
    wickBot = 90;
    bodyTop = 14;
    bodyBot = 34;
  } else if (kind === "bear") {
    color = "#ef4444";
    wickTop = 8;
    wickBot = 90;
    bodyTop = 16;
    bodyBot = 80;
  } else {
    color = "#94a3b8";
    wickTop = 12;
    wickBot = 84;
    bodyTop = 46;
    bodyBot = 52;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={46} height={74} className="block">
      <line x1={cx} x2={cx} y1={wickTop} y2={wickBot} stroke={color} strokeWidth={3} strokeLinecap="round" />
      <rect x={cx - 14} y={bodyTop} width={28} height={Math.max(3, bodyBot - bodyTop)} rx={3} fill={color} />
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

function CandleOptions({ correctIndex, sel, phase, onSelect }: { correctIndex: number; sel: number | null; phase: Phase; onSelect: (i: number) => void }) {
  const locked = phase === "correct" || phase === "wrong";
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {CANDLE_OPTIONS.map((o, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== correctIndex;
        return (
          <button
            key={o.kind}
            type="button"
            disabled={locked}
            onClick={() => onSelect(idx)}
            className={`flex flex-col items-center gap-2 rounded-xl border-[1.5px] px-1.5 pb-3 pt-4 transition-all ${
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

/* ================================================================
 * whyCandle race — dual line-vs-candles build-up animation
 * ================================================================ */

type WhyRaceState = { n: number; frac: number; done: boolean };

function useWhyRace(active: boolean, bars: CandleBar[]): WhyRaceState {
  const [state, setState] = useState<WhyRaceState>({ n: 0, frac: 0, done: false });
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const n = bars.length;
    const perCandle = 420;
    const total = n * perCandle;

    function runCycle() {
      if (cancelled) return;
      const t0 = performance.now();
      setState({ n: 0, frac: 0, done: false });
      function tick(now: number) {
        if (cancelled) return;
        const el = now - t0;
        if (el >= total) {
          setState({ n, frac: 0, done: true });
          timeoutId = setTimeout(runCycle, 1400);
          return;
        }
        const idx = Math.min(n - 1, Math.floor(el / perCandle));
        const frac = (el - idx * perCandle) / perCandle;
        setState({ n: idx, frac, done: false });
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }
    runCycle();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [active, bars]);
  return state;
}

function WhyCandleRace({ active }: { active: boolean }) {
  const race = useWhyRace(active, WHY);
  const W = 840;
  const H = 380;
  const padTop = 40;
  const padBot = 44;
  const n = WHY.length;
  const y = (p: number) => padTop + (H - padTop - padBot) * (1 - (p - WHY_MIN) / (WHY_MAX - WHY_MIN));
  const lx0 = 70;
  const lx1 = 352;
  const cx0 = 470;
  const cx1 = 780;
  const lineX = (i: number) => lx0 + (lx1 - lx0) * ((i + 0.5) / n);
  const candX = (i: number) => cx0 + (cx1 - cx0) * ((i + 0.5) / n);
  const bw = Math.min(((cx1 - cx0) / n) * 0.5, 20);
  const done = race.done;
  const shown = done ? n : race.n + 1;
  const curFrac = done ? 1 : race.frac;

  const closeAt = (i: number): number => {
    if (i < race.n || done) return WHY[i]!.c;
    if (i > race.n) return WHY[Math.max(0, i - 1)]?.c ?? WHY[0]!.o;
    const b = WHY[i]!;
    return b.o + (b.c - b.o) * curFrac;
  };
  const pathPts: string[] = [];
  for (let i = 0; i < shown; i++) pathPts.push(`${lineX(i)} ${y(closeAt(i))}`);
  const pathD = pathPts.length ? `M${pathPts.join(" L")}` : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block rounded-2xl border border-border bg-black">
      <text x={(lx0 + lx1) / 2} y={20} fill="#88C9F7" fontSize={12} fontWeight={800} textAnchor="middle">
        LINE CHART · closes only
      </text>
      <text x={(cx0 + cx1) / 2} y={20} fill="#e9edf5" fontSize={12} fontWeight={800} textAnchor="middle">
        CANDLES · full OHLC
      </text>
      {pathD ? <path d={pathD} fill="none" stroke="#88C9F7" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {Array.from({ length: shown }, (_, i) => (
        <circle key={`ld${i}`} cx={lineX(i)} cy={y(closeAt(i))} r={3.5} fill="#88C9F7" />
      ))}
      {Array.from({ length: shown }, (_, i) => {
        const b = WHY[i]!;
        const isLive = !done && i === race.n;
        const liveC = isLive ? closeAt(i) : b.c;
        const liveH = isLive ? Math.max(b.o, liveC, b.h * curFrac + b.o * (1 - curFrac)) : b.h;
        const liveL = isLive ? Math.min(b.o, liveC, b.l * curFrac + b.o * (1 - curFrac)) : b.l;
        const bull = liveC >= b.o;
        const col = bull ? "#22c55e" : "#ef4444";
        const top = y(Math.max(b.o, liveC));
        const bot = y(Math.min(b.o, liveC));
        return (
          <g key={`cd${i}`}>
            <line x1={candX(i)} x2={candX(i)} y1={y(isLive ? liveH : b.h)} y2={top} stroke={col} strokeWidth={2.2} strokeLinecap="round" />
            <line x1={candX(i)} x2={candX(i)} y1={bot} y2={y(isLive ? liveL : b.l)} stroke={col} strokeWidth={2.2} strokeLinecap="round" />
            <rect x={candX(i) - bw / 2} y={top} width={bw} height={Math.max(2, bot - top)} rx={2} fill={col} />
          </g>
        );
      })}
      {Array.from({ length: shown }, (_, i) => (
        <line key={`conn${i}`} x1={lineX(i)} x2={candX(i)} y1={y(closeAt(i))} y2={y(closeAt(i))} stroke="#5b6b8c" strokeWidth={1.2} strokeDasharray="3 4" opacity={0.65} />
      ))}
    </svg>
  );
}

/* ================================================================
 * hook scene — animated self-forming candle
 * ================================================================ */

type FormingState = {
  price: number;
  high: number;
  low: number;
  done: boolean;
  markOpen: boolean;
  markLow: boolean;
  markHigh: boolean;
  markClose: boolean;
};

function useFormingCandle(active: boolean, path: number[]): FormingState {
  const [state, setState] = useState<FormingState>(() => ({
    price: path[0]!,
    high: path[0]!,
    low: path[0]!,
    done: false,
    markOpen: true,
    markLow: false,
    markHigh: false,
    markClose: false,
  }));
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let rafId = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const segDur = 260;
    const total = segDur * (path.length - 1);
    const lowIdx = path.indexOf(Math.min(...path));
    const highIdx = path.indexOf(Math.max(...path));

    function runCycle() {
      if (cancelled) return;
      const t0 = performance.now();
      setState({ price: path[0]!, high: path[0]!, low: path[0]!, done: false, markOpen: true, markLow: false, markHigh: false, markClose: false });
      function tick(now: number) {
        if (cancelled) return;
        const el = now - t0;
        if (el >= total) {
          setState({ price: path[path.length - 1]!, high: Math.max(...path), low: Math.min(...path), done: true, markOpen: true, markLow: true, markHigh: true, markClose: true });
          timeoutId = setTimeout(runCycle, 1000);
          return;
        }
        const segF = el / segDur;
        const idx = Math.min(path.length - 2, Math.floor(segF));
        const frac = segF - idx;
        const cur = path[idx]! + (path[idx + 1]! - path[idx]!) * frac;
        const seen = path.slice(0, idx + 1).concat([cur]);
        setState((s) => ({ ...s, price: cur, high: Math.max(...seen), low: Math.min(...seen), markLow: idx >= lowIdx, markHigh: idx >= highIdx }));
        rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }
    runCycle();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [active, path]);
  return state;
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
  tap: PricePoint | null;
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
};

function enterStep(state: LessonState, n: number): LessonState {
  return { ...state, step: n, phase: "idle", attempts: 0, lastAward: 0, sel: null, tap: null };
}

function isSceneReady(step: number, state: LessonState): boolean {
  switch (SCENE_TYPES[step]) {
    case "mcq":
    case "candle":
      return state.sel != null;
    case "tap":
      return state.tap != null;
    default:
      return true;
  }
}

function evalSceneCorrect(step: number, state: LessonState): boolean {
  switch (step) {
    case 2:
      return state.sel === INTUITION_MCQ.correctIndex;
    case 5:
      return !!state.tap && state.tap.price >= TAP_CLOSE.priceMin && state.tap.price <= TAP_CLOSE.priceMax;
    case 6:
      return !!state.tap && state.tap.price <= TAP_LOW.priceMax;
    case 9:
      return state.sel === BULLBEAR_QUIZ.correctIndex;
    case 11:
      return state.sel === BODY_COMPARE.correctIndex;
    case 14:
      return !!state.tap && state.tap.price >= TAP_REJECTION.priceMin;
    case 16:
      return state.sel === READING_QUIZ.correctIndex;
    case 17:
      return state.sel === BOSS_IDENTIFY.correctIndex;
    case 18:
      return !!state.tap && state.tap.price >= BOSS_TAP.priceMin && state.tap.price <= BOSS_TAP.priceMax;
    case 19:
      return state.sel === BOSS_DECIDE.correctIndex;
    default:
      return false;
  }
}

const FB_BY_STEP: Partial<Record<number, { hint: string; correct: string; wrong: string }>> = {
  2: INTUITION_MCQ.fb,
  5: TAP_CLOSE.fb,
  6: TAP_LOW.fb,
  9: BULLBEAR_QUIZ.fb,
  11: BODY_COMPARE.fb,
  14: TAP_REJECTION.fb,
  16: READING_QUIZ.fb,
  17: BOSS_IDENTIFY.fb,
  18: BOSS_TAP.fb,
  19: BOSS_DECIDE.fb,
};

/** Real question text/options/answer per step, fed to the AI coach on a wrong attempt. */
const QUESTION_CONTEXT_BY_STEP: Partial<
  Record<number, { question: string; options?: string[]; correctAnswer?: string }>
> = {
  2: { question: INTUITION_MCQ.prompt, options: INTUITION_MCQ.options, correctAnswer: INTUITION_MCQ.options[INTUITION_MCQ.correctIndex] },
  5: { question: TAP_CLOSE.prompt },
  6: { question: TAP_LOW.prompt },
  9: { question: BULLBEAR_QUIZ.prompt, options: BULLBEAR_QUIZ.options, correctAnswer: BULLBEAR_QUIZ.options[BULLBEAR_QUIZ.correctIndex] },
  11: {
    question: BODY_COMPARE.prompt,
    options: CANDLE_OPTIONS.map((o) => o.label),
    correctAnswer: CANDLE_OPTIONS[BODY_COMPARE.correctIndex]?.label,
  },
  14: { question: TAP_REJECTION.prompt },
  16: { question: READING_QUIZ.prompt, options: READING_QUIZ.options, correctAnswer: READING_QUIZ.options[READING_QUIZ.correctIndex] },
  17: {
    question: BOSS_IDENTIFY.prompt,
    options: CANDLE_OPTIONS.map((o) => o.label),
    correctAnswer: CANDLE_OPTIONS[BOSS_IDENTIFY.correctIndex]?.label,
  },
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

export function AnatomyOfACandleLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const { collapsed, setCollapsed, coachPanelProps, notifyWrongAttempt } = useLessonCoach({
    lessonTitle: "Anatomy of a Candlestick",
    lessonTopic: "candlestick-anatomy",
    suggestedChips: ["What's a wick?", "Bullish vs bearish?", "Give me an example"],
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

  const forming = useFormingCandle(step === 1, HOOK_PATH);

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

  function tapChart(e: React.PointerEvent<SVGRectElement>, sc: SingleCandleScale) {
    if (resolved) return;
    const svg = svgRef.current;
    if (!svg) return;
    const loc = locatePoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
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
      completeLesson({ lessonSlug: ANATOMY_LESSON_SLUG, score: 100, xpEarned: ANATOMY_LESSON_XP });
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
              <div className="mx-auto max-w-[760px] text-center">
                <div className="mx-auto mb-6 max-w-[300px]">
                  <svg viewBox="0 0 260 320" width="100%" className="block">
                    <motion.line
                      x1={130}
                      x2={130}
                      y1={22}
                      y2={70}
                      stroke="#22C55E"
                      strokeWidth={5}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55, duration: 0.4 }}
                    />
                    <motion.line
                      x1={130}
                      x2={130}
                      y1={236}
                      y2={300}
                      stroke="#22C55E"
                      strokeWidth={5}
                      strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55, duration: 0.4 }}
                    />
                    <motion.rect
                      x={98}
                      y={70}
                      width={64}
                      height={166}
                      rx={6}
                      fill="#22C55E"
                      style={{ transformOrigin: "130px 236px" }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.5 }}>
                      <line x1={130} x2={236} y1={22} y2={22} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
                      <text x={180} y={18} fill="#88C9F7" fontSize={13} fontWeight={800}>
                        HIGH
                      </text>
                      <line x1={162} x2={236} y1={70} y2={70} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
                      <text x={180} y={66} fill="#88C9F7" fontSize={13} fontWeight={800}>
                        CLOSE
                      </text>
                      <line x1={162} x2={236} y1={236} y2={236} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
                      <text x={180} y={252} fill="#88C9F7" fontSize={13} fontWeight={800}>
                        OPEN
                      </text>
                      <line x1={130} x2={236} y1={300} y2={300} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="4 3" opacity={0.7} />
                      <text x={186} y={296} fill="#88C9F7" fontSize={13} fontWeight={800}>
                        LOW
                      </text>
                    </motion.g>
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.5 }}>
                      <text x={130} y={158} fill="#0a0a0a" fontSize={12} fontWeight={900} textAnchor="middle" transform="rotate(-90 130 158)">
                        BODY
                      </text>
                    </motion.g>
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
                const sc = singleCandleScale(A_MIN, A_MAX);
                const rows = [
                  { key: "h", price: A.h, text: `HIGH ${formatPrice(A.h)}`, show: forming.markHigh },
                  { key: "c", price: A.c, text: `CLOSE ${formatPrice(A.c)}`, show: forming.markClose },
                  { key: "o", price: A.o, text: `OPEN ${formatPrice(A.o)}`, show: forming.markOpen },
                  { key: "l", price: A.l, text: `LOW ${formatPrice(A.l)}`, show: forming.markLow },
                ];
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HOOK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOOK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOOK.prompt}</p>
                    <ChartSvg sc={sc}>
                      <FormingCandleShape sc={sc} cx={sc.W / 2} bw={80} formState={forming} openPrice={A.o} />
                      <LeaderStack sc={sc} cx={sc.W / 2} bw={80} rows={rows} />
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S2 INTUITION (mcq) ===== */}
            {step === 2 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{INTUITION_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INTUITION_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INTUITION_MCQ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} glow />
                        <text x={sc.W / 2} y={sc.y(22485)} fill="#22c55e" fontSize={14} fontWeight={800} textAnchor="middle">
                          GREEN · closed higher
                        </text>
                      </ChartSvg>
                    </div>
                    <McqOptions options={INTUITION_MCQ.options} correctIndex={INTUITION_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S3 WHY CANDLE ===== */}
            {step === 3 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{WHY_CANDLE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WHY_CANDLE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WHY_CANDLE.prompt}</p>
                <WhyCandleRace active={step === 3} />
              </div>
            )}

            {/* ===== S4 FOUR POINTS ===== */}
            {step === 4 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{FOUR_POINTS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{FOUR_POINTS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{FOUR_POINTS.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} glow />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
                        <Guide sc={sc} price={A.h} text={`HIGH ${formatPrice(A.h)}`} fill="#F7C325" textColor="#0a0a0a" side="right" />
                        <Guide sc={sc} price={A.c} text={`CLOSE ${formatPrice(A.c)}`} fill="#456DFF" textColor="#fff" side="left" />
                        <Guide sc={sc} price={A.o} text={`OPEN ${formatPrice(A.o)}`} fill="#88C9F7" textColor="#0a0a0a" side="left" />
                        <Guide sc={sc} price={A.l} text={`LOW ${formatPrice(A.l)}`} fill="#94a3b8" textColor="#0a0a0a" side="right" />
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S5 TAP CLOSE ===== */}
            {step === 5 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_CLOSE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_CLOSE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_CLOSE.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} noAnim />
                      {resolved ? <Guide sc={sc} price={A.c} text="CLOSE" fill="#456DFF" textColor="#fff" side="left" /> : null}
                      {resolved && state.phase === "wrong" ? <Guide sc={sc} price={A.h} text="HIGH (not close)" fill="#F7C325" textColor="#0a0a0a" side="right" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S6 TAP LOW ===== */}
            {step === 6 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_LOW.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_LOW.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_LOW.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} noAnim />
                      {resolved ? <Guide sc={sc} price={A.l} text="LOW" fill="#94a3b8" textColor="#0a0a0a" side="right" /> : null}
                      {resolved && state.phase === "wrong" ? <Guide sc={sc} price={A.o} text="OPEN (not low)" fill="#88C9F7" textColor="#0a0a0a" side="left" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S7 ANATOMY ===== */}
            {step === 7 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{ANATOMY_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{ANATOMY_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{ANATOMY_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} glow />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
                        <Brace sc={sc} cx={sc.W / 2} priceHi={A.c} priceLo={A.o} text="BODY · open→close" color="#456DFF" side="right" />
                        <Brace sc={sc} cx={sc.W / 2} priceHi={A.h} priceLo={A.c} text="upper wick" color="#F7C325" side="left" />
                        <Brace sc={sc} cx={sc.W / 2} priceHi={A.o} priceLo={A.l} text="lower wick" color="#F7C325" side="left" />
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S8 BULLBEAR ===== */}
            {step === 8 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{BULLBEAR.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BULLBEAR.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BULLBEAR.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={300} bar={BULLBEAR.bull} bw={72} />
                      <BCandle sc={sc} cx={560} bar={BULLBEAR.bear} bw={72} delay={0.08} />
                      <text x={300} y={sc.y(22470)} fill="#22c55e" fontSize={13} fontWeight={800} textAnchor="middle">
                        BULLISH
                      </text>
                      <text x={300} y={sc.y(22045)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        close &gt; open
                      </text>
                      <text x={560} y={sc.y(22470)} fill="#ef4444" fontSize={13} fontWeight={800} textAnchor="middle">
                        BEARISH
                      </text>
                      <text x={560} y={sc.y(22045)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        close &lt; open
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S9 BULLBEAR QUIZ (mcq) ===== */}
            {step === 9 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BULLBEAR_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BULLBEAR_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BULLBEAR_QUIZ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <BCandle sc={sc} cx={300} bar={BULLBEAR_QUIZ.candleA} bw={72} />
                        <BCandle sc={sc} cx={560} bar={BULLBEAR_QUIZ.candleB} bw={72} delay={0.08} />
                        <text x={300} y={sc.y(22470)} fill="#e9edf5" fontSize={14} fontWeight={800} textAnchor="middle">
                          A
                        </text>
                        <text x={560} y={sc.y(22470)} fill="#e9edf5" fontSize={14} fontWeight={800} textAnchor="middle">
                          B
                        </text>
                      </ChartSvg>
                    </div>
                    <McqOptions options={BULLBEAR_QUIZ.options} correctIndex={BULLBEAR_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S10 BODY TEACH ===== */}
            {step === 10 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{BODY_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BODY_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BODY_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={300} bar={BODY_TEACH.big} bw={72} />
                      <BCandle sc={sc} cx={560} bar={BODY_TEACH.small} bw={72} delay={0.08} />
                      <text x={300} y={sc.y(22470)} fill="#22c55e" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        LARGE body
                      </text>
                      <text x={300} y={sc.y(22045)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        strong conviction
                      </text>
                      <text x={560} y={sc.y(22470)} fill="#e9edf5" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        SMALL body
                      </text>
                      <text x={560} y={sc.y(22045)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        indecision
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S11 BODY COMPARE (candle) ===== */}
            {step === 11 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{BODY_COMPARE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BODY_COMPARE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BODY_COMPARE.prompt}</p>
                <CandleOptions correctIndex={BODY_COMPARE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S12 WICKS TEACH ===== */}
            {step === 12 &&
              (() => {
                const sc = singleCandleScale(B_MIN, B_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{WICKS_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WICKS_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WICKS_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={300} bar={WICKS_TEACH.up} bw={70} />
                      <BCandle sc={sc} cx={560} bar={C} bw={70} delay={0.08} />
                      <text x={300} y={sc.y(22505)} fill="#F7C325" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        long UPPER wick
                      </text>
                      <text x={300} y={sc.y(22150)} fill="#ff8f8f" fontSize={11} fontWeight={700} textAnchor="middle">
                        sellers rejected highs
                      </text>
                      <text x={560} y={sc.y(22505)} fill="#e9edf5" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        long LOWER wick
                      </text>
                      <text x={560} y={sc.y(22150)} fill="#22c55e" fontSize={11} fontWeight={700} textAnchor="middle">
                        buyers rejected lows
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S13 WICK MEANING ===== */}
            {step === 13 &&
              (() => {
                const sc = singleCandleScale(B_MIN, B_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{WICK_MEANING.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WICK_MEANING.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WICK_MEANING.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={300} bar={WICK_MEANING.short} bw={70} />
                      <BCandle sc={sc} cx={560} bar={WICK_MEANING.long} bw={70} delay={0.08} />
                      <text x={300} y={sc.y(22505)} fill="#22c55e" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        SHORT wick
                      </text>
                      <text x={300} y={sc.y(22150)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        closed near its high
                      </text>
                      <text x={560} y={sc.y(22505)} fill="#F7C325" fontSize={12.5} fontWeight={800} textAnchor="middle">
                        LONG wick
                      </text>
                      <text x={560} y={sc.y(22150)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        pushed up, forced back
                      </text>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S14 TAP REJECTION ===== */}
            {step === 14 &&
              (() => {
                const sc = singleCandleScale(B_MIN, B_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_REJECTION.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_REJECTION.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_REJECTION.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={B} bw={80} noAnim />
                      {resolved ? <Brace sc={sc} cx={sc.W / 2} priceHi={B.h} priceLo={B.c} text="REJECTED HERE" color="#F7C325" side="right" /> : null}
                      {resolved && state.phase === "wrong" ? <Brace sc={sc} cx={sc.W / 2} priceHi={B.c} priceLo={B.o} text="body (settled)" color="#5b6b8c" side="left" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S15 READING TEACH ===== */}
            {step === 15 &&
              (() => {
                const sc = singleCandleScale(A_MIN, A_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{READING_TEACH.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{READING_TEACH.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{READING_TEACH.prompt}</p>
                    <ChartSvg sc={sc}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={A} bw={80} glow />
                      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}>
                        {READING_TEACH.questions.map((q) => (
                          <text key={q.text} x={sc.W / 2 + 80} y={sc.y(q.price)} fill={q.color} fontSize={13} fontWeight={800}>
                            {q.text}
                          </text>
                        ))}
                      </motion.g>
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S16 READING QUIZ (mcq) ===== */}
            {step === 16 &&
              (() => {
                const sc = singleCandleScale(C_MIN, C_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{READING_QUIZ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{READING_QUIZ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{READING_QUIZ.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <BCandle sc={sc} cx={sc.W / 2} bar={C} bw={80} glow />
                        <text x={sc.W / 2 - 80} y={sc.y(22300)} fill="#22c55e" fontSize={12} fontWeight={700} textAnchor="end">
                          small green body
                        </text>
                        <text x={sc.W / 2 - 58} y={sc.y(22230)} fill="#F7C325" fontSize={12} fontWeight={700} textAnchor="end">
                          long lower wick
                        </text>
                      </ChartSvg>
                    </div>
                    <McqOptions options={READING_QUIZ.options} correctIndex={READING_QUIZ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S17 BOSS IDENTIFY (candle) ===== */}
            {step === 17 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{BOSS_IDENTIFY.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_IDENTIFY.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_IDENTIFY.prompt}</p>
                <CandleOptions correctIndex={BOSS_IDENTIFY.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S18 BOSS TAP ===== */}
            {step === 18 &&
              (() => {
                const sc = singleCandleScale(BOSS_MIN, BOSS_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_TAP.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_TAP.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_TAP.prompt}</p>
                    <ChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <BCandle sc={sc} cx={sc.W / 2} bar={BOSS} bw={80} noAnim />
                      {resolved ? <Guide sc={sc} price={BOSS.c} text="CLOSE" fill="#456DFF" textColor="#fff" side="left" /> : null}
                      {state.tap ? <TapMarker sc={sc} point={state.tap} /> : null}
                    </ChartSvg>
                  </div>
                );
              })()}

            {/* ===== S19 BOSS DECIDE (mcq) ===== */}
            {step === 19 &&
              (() => {
                const sc = singleCandleScale(BOSS_MIN, BOSS_MAX);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_DECIDE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_DECIDE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_DECIDE.prompt}</p>
                    <div className="mb-5">
                      <ChartSvg sc={sc}>
                        <BCandle sc={sc} cx={sc.W / 2} bar={BOSS} bw={80} glow />
                        {resolved ? <Brace sc={sc} cx={sc.W / 2} priceHi={BOSS.c} priceLo={BOSS.o} text="big green body" color="#22c55e" side="right" /> : null}
                        {resolved ? (
                          <text x={sc.W / 2} y={sc.y(22505)} fill="#22c55e" fontSize={13} fontWeight={800} textAnchor="middle">
                            closed near the high
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
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <line x1={12} y1={2} x2={12} y2={7} />
                    <rect x={8} y={7} width={8} height={10} rx={2} fill="#fff" stroke="none" />
                    <line x1={12} y1={17} x2={12} y2={22} />
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
                      {ANATOMY_LESSON_XP}
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
