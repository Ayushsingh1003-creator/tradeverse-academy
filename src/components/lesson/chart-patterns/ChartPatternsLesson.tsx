"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { useLessonCoach } from "@/lib/hooks/useLessonCoach";
import { LessonCoachDock } from "@/components/lesson/LessonCoachPanel";
import { sound } from "@/lib/sounds";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import {
  locatePatternPoint,
  miniShapePolylinePoints,
  miniSlopeLine,
  patternAnchorX,
  patternCandleColor,
  patternCandleData,
  patternScale,
  placeMarkLabel,
  type PatternPoint,
  type PatternScale,
  type PatternShape,
} from "./geometry";
import { CHART_PATTERNS_LESSON_SLUG, CHART_PATTERNS_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  SCENE_TYPES,
  type MiniCardConfig,
  INTRO_KICKER,
  INTRO_TITLE_LINE1,
  INTRO_TITLE_LINE2,
  INTRO_SUBTITLE,
  INTRO_CHIPS,
  HOOK,
  WHATIS,
  INTUITION_MCQ,
  SUPPLY_DEMAND,
  WHY_FORM,
  REVERSAL_INTRO,
  REVERSAL_CARDS_ROW1,
  REVERSAL_CARDS_ROW2,
  DOUBLE_TOP,
  DOUBLE_BOTTOM,
  TAP_NECKLINE,
  HEAD_SHOULDERS,
  INV_HS,
  TRIPLES,
  TRIPLES_CARDS,
  ID_REVERSAL_MCQ,
  CONTIN_INTRO,
  CONTIN_CARDS_ROW1,
  CONTIN_CARDS_ROW2,
  FLAGS_PENNANTS,
  FLAGS_PENNANTS_CARDS,
  TRIANGLES,
  TRIANGLES_CARDS,
  RECTANGLES,
  ID_CONTIN_MCQ,
  PSYCHOLOGY,
  CONTEXT,
  CONTEXT_ROWS,
  CONTEXT_QUIZ_MCQ,
  CONTEXT_QUIZ_CARDS,
  BREAKOUTS,
  CANDLE_OPTIONS,
  FALSE_BREAK,
  FAILURE,
  FAILURE_ROWS,
  FAILURE_NOTE,
  HOW_TO,
  HOW_TO_STEPS,
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
 * decorative intro chart — three head-and-shoulders pivot rings
 * ================================================================ */

const INTRO_DOTS: Array<{ px: number; py: number; color: string; delay: number }> = [
  { px: 23, py: 42, color: "#88C9F7", delay: 1.4 },
  { px: 51, py: 16, color: "#F7C325", delay: 1.52 },
  { px: 79, py: 30, color: "#88C9F7", delay: 1.64 },
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
 * pattern-space chart primitives
 * ================================================================ */

function PatternGrid({ sc }: { sc: PatternScale }) {
  return (
    <>
      {[0, 1, 2, 3].map((i) => {
        const y = sc.padTop + ((sc.H - sc.padTop - sc.padBot) * i) / 3;
        return <line key={i} x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="rgba(255,255,255,0.055)" strokeWidth={1} />;
      })}
    </>
  );
}

function PatternChartSvg({
  sc,
  svgRef,
  tapHit,
  children,
}: {
  sc: PatternScale;
  svgRef?: React.Ref<SVGSVGElement>;
  tapHit?: (e: React.PointerEvent<SVGRectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <svg ref={svgRef} viewBox={`0 0 ${sc.W} ${sc.H}`} width="100%" className="block touch-none select-none rounded-2xl border border-border bg-black">
      <PatternGrid sc={sc} />
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

function PatternCandles({ sc, shape, dense, upToPt, noAnim }: { sc: PatternScale; shape: PatternShape; dense?: boolean; upToPt?: number; noAnim?: boolean }) {
  const d = patternCandleData(shape, dense);
  const lim = upToPt != null ? d.anchorIdx[Math.min(upToPt, d.anchorIdx.length - 1)]! : d.total - 1;
  const span = sc.X(100) - sc.X(0);
  const bw = Math.max(3.4, (span / d.total) * 0.62);
  const sw = Math.max(1.3, bw * 0.22);
  return (
    <>
      {d.bars.slice(0, lim + 1).map((b, i) => {
        const cx = sc.X(((i + 0.5) / d.total) * 100);
        const color = patternCandleColor(b);
        const yT = sc.Y(Math.min(b.o, b.c));
        const yB = sc.Y(Math.max(b.o, b.c));
        return (
          <g key={i} className={noAnim ? undefined : "candle-bar"} style={noAnim ? undefined : { animationDelay: `${Math.min(i * 15, 740)}ms` }}>
            <line x1={cx} x2={cx} y1={sc.Y(b.h)} y2={yT} stroke={color} strokeWidth={sw} strokeLinecap="round" />
            <line x1={cx} x2={cx} y1={yB} y2={sc.Y(b.l)} stroke={color} strokeWidth={sw} strokeLinecap="round" />
            <rect x={cx - bw / 2} y={yT} width={bw} height={Math.max(1.8, yB - yT)} rx={1.6} fill={color} />
          </g>
        );
      })}
    </>
  );
}

function PatternLevel({
  sc,
  py,
  label,
  color = "#456DFF",
  x1 = 0,
  x2 = 100,
  below,
  right,
  glow,
  dash = "6 4",
  sw = 2.2,
  gate = true,
  animZones,
}: {
  sc: PatternScale;
  py: number;
  label?: string;
  color?: string;
  x1?: number;
  x2?: number;
  below?: boolean;
  right?: boolean;
  glow?: boolean;
  dash?: string;
  sw?: number;
  gate?: boolean;
  animZones: boolean;
}) {
  const y = sc.Y(py);
  const lineStyle = glow ? { filter: `drop-shadow(0 0 7px ${color})` } : undefined;
  const labelW = label ? label.length * 6.6 + 18 : 0;
  const lx = right ? sc.X(x2) - labelW - 6 : sc.X(x1) + 8;
  const ly = below ? y + 6 : y - 26;
  const textColor = color === "#F7C325" ? "#141414" : "#fff";
  const content = (
    <>
      <line x1={sc.X(x1)} x2={sc.X(x2)} y1={y} y2={y} stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" style={lineStyle} />
      {label ? (
        <>
          <rect x={lx} y={ly} width={labelW} height={20} rx={5} fill={color} />
          <text x={lx + 9} y={ly + 14} fill={textColor} fontSize={11} fontWeight={800} letterSpacing="0.03em">
            {label}
          </text>
        </>
      ) : null}
    </>
  );
  if (gate === false) return <g>{content}</g>;
  return (
    <motion.g
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: animZones ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.g>
  );
}

function PatternSlope({
  sc,
  p1,
  p2,
  stroke = "#456DFF",
  dash = "6 4",
  sw = 2.2,
  glow,
  label,
  below,
  gate = true,
  animZones,
}: {
  sc: PatternScale;
  p1: [number, number];
  p2: [number, number];
  stroke?: string;
  dash?: string;
  sw?: number;
  glow?: boolean;
  label?: string;
  below?: boolean;
  gate?: boolean;
  animZones: boolean;
}) {
  const lineStyle = glow ? { filter: `drop-shadow(0 0 7px ${stroke})` } : undefined;
  const labelW = label ? label.length * 6.6 + 18 : 0;
  const lx = sc.X(p1[0]) + 6;
  const ly = sc.Y(p1[1]) + (below ? 8 : -26);
  const textColor = stroke === "#F7C325" ? "#141414" : "#fff";
  const content = (
    <>
      <line x1={sc.X(p1[0])} y1={sc.Y(p1[1])} x2={sc.X(p2[0])} y2={sc.Y(p2[1])} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round" style={lineStyle} />
      {label ? (
        <>
          <rect x={lx} y={ly} width={labelW} height={20} rx={5} fill={stroke} />
          <text x={lx + 9} y={ly + 14} fill={textColor} fontSize={11} fontWeight={800}>
            {label}
          </text>
        </>
      ) : null}
    </>
  );
  if (gate === false) return <g>{content}</g>;
  return (
    <motion.g
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: animZones ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {content}
    </motion.g>
  );
}

function PatternDot({ sc, px, py, label, color = "#88C9F7", below }: { sc: PatternScale; px: number; py: number; label?: string; color?: string; below?: boolean }) {
  const x = sc.X(px);
  const y = sc.Y(py);
  return (
    <g>
      <circle cx={x} cy={y} r={6.5} fill="none" stroke={color} strokeWidth={2.4} />
      <circle cx={x} cy={y} r={2.5} fill={color} />
      {label ? (
        <text x={x} y={y + (below ? 22 : -14)} fill={color} fontSize={10.5} fontWeight={800} textAnchor="middle" letterSpacing="0.04em">
          {label}
        </text>
      ) : null}
    </g>
  );
}

function TapMarkerPattern({ sc, point }: { sc: PatternScale; point: PatternPoint }) {
  const y = sc.Y(Math.max(0, Math.min(100, point.py)));
  const x = Math.max(sc.padX, Math.min(sc.W - sc.padX, point.x));
  return (
    <g>
      <line x1={sc.padX} x2={sc.W - sc.padX} y1={y} y2={y} stroke="#88C9F7" strokeWidth={1.4} strokeDasharray="5 4" />
      <circle cx={x} cy={y} r={9} fill="rgba(136,201,247,0.25)" stroke="#88C9F7" strokeWidth={2} />
      <circle cx={x} cy={y} r={2.5} fill="#fff" />
    </g>
  );
}

function MiniPatternCard({ cfg }: { cfg: MiniCardConfig }) {
  const W = cfg.W ?? 280;
  const H = cfg.H ?? 150;
  const pad = 12;
  const sc: PatternScale = {
    W,
    H,
    padX: pad,
    padTop: pad + 6,
    padBot: pad,
    X: (px) => pad + (W - 2 * pad) * (px / 100),
    Y: (py) => pad + 6 + (H - pad - pad - 6) * (py / 100),
  };
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[12.5px] font-extrabold" style={{ color: cfg.accent ?? "#88C9F7" }}>
        {cfg.title}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block rounded-[10px] border border-border bg-black">
        <PatternCandles sc={sc} shape={cfg.shape} dense={false} />
        {(cfg.levels ?? []).map((L, i) => (
          <line key={`L${i}`} x1={sc.X(L.x1 ?? 0)} x2={sc.X(L.x2 ?? 100)} y1={sc.Y(L.y)} y2={sc.Y(L.y)} stroke={L.color ?? "#456DFF"} strokeWidth={1.8} strokeDasharray="5 3" />
        ))}
        {(cfg.slopes ?? []).map((S, i) => {
          const { x1, y1, x2, y2 } = miniSlopeLine(cfg.shape, sc, S);
          return <line key={`S${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={S.color ?? "#456DFF"} strokeWidth={1.8} strokeDasharray="5 3" />;
        })}
        {(cfg.marks ?? []).map((M, i) => {
          const placed = placeMarkLabel(cfg.shape, sc, M);
          return (
            <g key={`M${i}`}>
              <circle cx={placed.ring.cx} cy={placed.ring.cy} r={6} fill="rgba(247,195,37,0.18)" stroke={placed.ring.color} strokeWidth={2} />
              {placed.label ? (
                <>
                  <rect x={placed.label.x} y={placed.label.y} width={placed.label.w} height={placed.label.h} rx={3} fill="rgba(0,0,0,0.82)" />
                  <text x={placed.label.x + placed.label.w / 2} y={placed.label.y + 9.5} fill={placed.label.color} fontSize={9} fontWeight={900} textAnchor="middle">
                    {placed.label.text}
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
        {cfg.shapeOutline && cfg.shapeOutline.length ? (
          <polyline
            points={miniShapePolylinePoints(cfg.shape, sc, cfg.shapeOutline)}
            fill="none"
            stroke="rgba(255,255,255,0.34)"
            strokeWidth={1.4}
            strokeDasharray="4 3"
            strokeLinejoin="round"
          />
        ) : null}
      </svg>
      {cfg.note ? <div className="mt-1.5 text-[11.5px] leading-snug text-[#8a8a8a]">{cfg.note}</div> : null}
    </div>
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

function CandleOptions({ sel, phase, onSelect }: { sel: number | null; phase: Phase; onSelect: (i: number) => void }) {
  const locked = phase === "correct" || phase === "wrong";
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {CANDLE_OPTIONS.map((o, idx) => {
        const chosen = sel === idx;
        const rightReveal = locked && idx === FALSE_BREAK.correctIndex;
        const wrongChosen = phase === "wrong" && chosen && idx !== FALSE_BREAK.correctIndex;
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
  tap: PatternPoint | null;
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
    case 3:
      return state.sel === INTUITION_MCQ.correctIndex;
    case 9:
      return !!state.tap && state.tap.py >= TAP_NECKLINE.pyMin && state.tap.py <= TAP_NECKLINE.pyMax;
    case 13:
      return state.sel === ID_REVERSAL_MCQ.correctIndex;
    case 18:
      return state.sel === ID_CONTIN_MCQ.correctIndex;
    case 21:
      return state.sel === CONTEXT_QUIZ_MCQ.correctIndex;
    case 23:
      return state.sel === FALSE_BREAK.correctIndex;
    case 26:
      return !!state.tap && state.tap.py >= BOSS_TAP.pyMin && state.tap.py <= BOSS_TAP.pyMax;
    case 27:
      return state.sel === BOSS_DECIDE.correctIndex;
    default:
      return false;
  }
}

const FB_BY_STEP: Partial<Record<number, { hint: string; correct: string; wrong: string }>> = {
  3: INTUITION_MCQ.fb,
  9: TAP_NECKLINE.fb,
  13: ID_REVERSAL_MCQ.fb,
  18: ID_CONTIN_MCQ.fb,
  21: CONTEXT_QUIZ_MCQ.fb,
  23: FALSE_BREAK.fb,
  26: BOSS_TAP.fb,
  27: BOSS_DECIDE.fb,
};

/** Real question text/options/answer per step, fed to the AI coach on a wrong attempt. */
const QUESTION_CONTEXT_BY_STEP: Partial<
  Record<number, { question: string; options?: string[]; correctAnswer?: string }>
> = {
  3: { question: INTUITION_MCQ.prompt, options: INTUITION_MCQ.options, correctAnswer: INTUITION_MCQ.options[INTUITION_MCQ.correctIndex] },
  9: { question: TAP_NECKLINE.prompt },
  13: { question: ID_REVERSAL_MCQ.prompt, options: ID_REVERSAL_MCQ.options, correctAnswer: ID_REVERSAL_MCQ.options[ID_REVERSAL_MCQ.correctIndex] },
  18: { question: ID_CONTIN_MCQ.prompt, options: ID_CONTIN_MCQ.options, correctAnswer: ID_CONTIN_MCQ.options[ID_CONTIN_MCQ.correctIndex] },
  21: { question: CONTEXT_QUIZ_MCQ.prompt, options: CONTEXT_QUIZ_MCQ.options, correctAnswer: CONTEXT_QUIZ_MCQ.options[CONTEXT_QUIZ_MCQ.correctIndex] },
  23: {
    question: FALSE_BREAK.prompt,
    options: CANDLE_OPTIONS.map((o) => o.label),
    correctAnswer: CANDLE_OPTIONS[FALSE_BREAK.correctIndex]?.label,
  },
  26: { question: BOSS_TAP.prompt },
  27: { question: BOSS_DECIDE.prompt, options: BOSS_DECIDE.options, correctAnswer: BOSS_DECIDE.options[BOSS_DECIDE.correctIndex] },
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

export function ChartPatternsLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);
  const { collapsed, setCollapsed, coachPanelProps, notifyWrongAttempt } = useLessonCoach({
    lessonTitle: "Chart Patterns",
    lessonTopic: "chart-patterns",
    suggestedChips: ["What's a double top?", "How do I confirm a breakout?", "Give me an example"],
  });

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const [animZones, setAnimZones] = useState(false);
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

  useEffect(() => {
    setAnimZones(false);
    const t = window.setTimeout(() => setAnimZones(true), 780);
    return () => window.clearTimeout(t);
  }, [step]);

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

  function tapChart(e: React.PointerEvent<SVGRectElement>, sc: PatternScale) {
    if (resolved) return;
    const svg = svgRef.current;
    if (!svg) return;
    const loc = locatePatternPoint(e.clientX, e.clientY, svg.getBoundingClientRect(), sc);
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
      completeLesson({ lessonSlug: CHART_PATTERNS_LESSON_SLUG, score: 100, xpEarned: CHART_PATTERNS_LESSON_XP });
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
          collapsed ? "pl-5" : "pl-[calc(1.25rem+min(150px,42.5vw))]"
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
                  {(() => {
                    const sc = patternScale({ W: 600, H: 190, padX: 20, padTop: 22, padBot: 22 });
                    return (
                      <svg viewBox={`0 0 ${sc.W} ${sc.H}`} width="100%" className="block">
                        <motion.line
                          x1={sc.X(2)}
                          x2={sc.X(99)}
                          y1={sc.Y(60)}
                          y2={sc.Y(60)}
                          stroke="#456DFF"
                          strokeWidth={3.4}
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <PatternCandles sc={sc} shape="hs" />
                        {INTRO_DOTS.map((d, i) => (
                          <motion.circle
                            key={i}
                            cx={sc.X(patternAnchorX("hs", d.px))}
                            cy={sc.Y(d.py)}
                            r={9}
                            fill="none"
                            stroke={d.color}
                            strokeWidth={3}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: d.delay, duration: 0.35 }}
                          />
                        ))}
                        <motion.text
                          x={sc.X(4)}
                          y={sc.Y(60) - 10}
                          fill="#88C9F7"
                          fontSize={12}
                          fontWeight={900}
                          letterSpacing="0.06em"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.3 }}
                        >
                          NECKLINE
                        </motion.text>
                      </svg>
                    );
                  })()}
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
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HOOK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOOK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOOK.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={21} label="CEILING · tried twice" color="#FF5D5D" glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("dtop", 26)} py={22} color="#ff8f8f" />
                      <PatternDot sc={sc} px={patternAnchorX("dtop", 66)} py={20} color="#ff8f8f" />
                      <PatternLevel sc={sc} py={52} label="NECKLINE" color="#456DFF" below right animZones={animZones} />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S2 WHATIS ===== */}
            {step === 2 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{WHATIS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WHATIS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WHATIS.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={21} label="sellers here" color="#FF5D5D" glow animZones={animZones} />
                      <PatternLevel sc={sc} py={52} label="buyers here" color="#456DFF" below right glow animZones={animZones} />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S3 INTUITION (mcq) ===== */}
            {step === 3 &&
              (() => {
                const sc = patternScale();
                const hs = INTUITION_MCQ.hiddenFrom;
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{INTUITION_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INTUITION_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INTUITION_MCQ.prompt}</p>
                    <div className="mb-5">
                      <PatternChartSvg sc={sc}>
                        <PatternCandles sc={sc} shape="dtop" upToPt={resolved ? undefined : 9} />
                        <PatternLevel sc={sc} py={21} label="same ceiling, twice" color="#FF5D5D" gate={false} glow animZones={animZones} />
                        {!resolved && (
                          <rect
                            x={sc.X(hs)}
                            y={sc.padTop}
                            width={sc.W - sc.padX - sc.X(hs)}
                            height={sc.H - sc.padTop - sc.padBot}
                            fill="rgba(255,255,255,0.03)"
                            stroke="rgba(255,255,255,0.16)"
                            strokeDasharray="6 5"
                            rx={6}
                          />
                        )}
                        {resolved ? (
                          <text x={sc.W - sc.padX - 4} y={sc.Y(10)} fill="#ff8f8f" fontSize={11.5} fontWeight={800} textAnchor="end">
                            sellers took over ↓
                          </text>
                        ) : (
                          <text x={(sc.X(hs) + sc.W - sc.padX) / 2} y={sc.padTop + 36} fill="#888" fontSize={30} fontWeight={900} textAnchor="middle">
                            ?
                          </text>
                        )}
                      </PatternChartSvg>
                    </div>
                    <McqOptions options={INTUITION_MCQ.options} correctIndex={INTUITION_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S4 SUPPLY & DEMAND ===== */}
            {step === 4 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{SUPPLY_DEMAND.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{SUPPLY_DEMAND.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{SUPPLY_DEMAND.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dbot" />
                      <PatternLevel sc={sc} py={79} label="DEMAND · buyers step in" color="#456DFF" below glow animZones={animZones} />
                      <PatternLevel sc={sc} py={48} label="SUPPLY · sellers press" color="#FF5D5D" glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("dbot", 26)} py={78} color="#88C9F7" below />
                      <PatternDot sc={sc} px={patternAnchorX("dbot", 66)} py={80} color="#88C9F7" below />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S5 WHY FORM ===== */}
            {step === 5 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{WHY_FORM.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{WHY_FORM.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{WHY_FORM.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={21} color="#FF5D5D" glow animZones={animZones} />
                      <text x={sc.X(patternAnchorX("dtop", 26))} y={sc.Y(21) - 18} fill="#ff8f8f" fontSize={11} fontWeight={800} textAnchor="middle">
                        1st failure
                      </text>
                      <text x={sc.X(patternAnchorX("dtop", 66))} y={sc.Y(20) - 18} fill="#ff8f8f" fontSize={11} fontWeight={800} textAnchor="middle">
                        2nd failure → doubt
                      </text>
                      <text x={sc.X(patternAnchorX("dtop", 90))} y={sc.Y(70) + 24} fill="#94a3b8" fontSize={11} fontWeight={800} textAnchor="middle">
                        sellers take control
                      </text>
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S6 REVERSAL INTRO ===== */}
            {step === 6 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{REVERSAL_INTRO.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{REVERSAL_INTRO.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{REVERSAL_INTRO.prompt}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {REVERSAL_CARDS_ROW1.map((c) => (
                      <MiniPatternCard key={c.title} cfg={c} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {REVERSAL_CARDS_ROW2.map((c) => (
                      <MiniPatternCard key={c.title} cfg={c} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S7 DOUBLE TOP ===== */}
            {step === 7 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{DOUBLE_TOP.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DOUBLE_TOP.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DOUBLE_TOP.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={21} label="resistance" color="#FF5D5D" glow animZones={animZones} />
                      <PatternLevel sc={sc} py={52} label="NECKLINE — break completes it" color="#456DFF" below right glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("dtop", 26)} py={22} label="peak 1" color="#ff8f8f" />
                      <PatternDot sc={sc} px={patternAnchorX("dtop", 66)} py={20} label="peak 2" color="#ff8f8f" />
                      <text x={sc.X(patternAnchorX("dtop", 46))} y={sc.Y(9)} fill="#5b6b8c" fontSize={26} fontWeight={900} textAnchor="middle">
                        M
                      </text>
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S8 DOUBLE BOTTOM ===== */}
            {step === 8 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{DOUBLE_BOTTOM.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{DOUBLE_BOTTOM.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{DOUBLE_BOTTOM.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dbot" />
                      <PatternLevel sc={sc} py={79} label="support" color="#456DFF" below glow animZones={animZones} />
                      <PatternLevel sc={sc} py={48} label="NECKLINE — break completes it" color="#F7C325" glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("dbot", 26)} py={78} label="low 1" color="#88C9F7" below />
                      <PatternDot sc={sc} px={patternAnchorX("dbot", 66)} py={80} label="low 2" color="#88C9F7" below />
                      <text x={sc.X(patternAnchorX("dbot", 46))} y={sc.Y(95)} fill="#5b6b8c" fontSize={26} fontWeight={900} textAnchor="middle">
                        W
                      </text>
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S9 TAP NECKLINE ===== */}
            {step === 9 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{TAP_NECKLINE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TAP_NECKLINE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TAP_NECKLINE.prompt}</p>
                    <PatternChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <PatternCandles sc={sc} shape="dtop" noAnim />
                      {resolved ? <PatternLevel sc={sc} py={52} label="NECKLINE" color="#456DFF" below right glow gate={false} animZones={animZones} /> : null}
                      {resolved && state.phase === "wrong" ? (
                        <PatternLevel sc={sc} py={21} label="peaks — not the neckline" color="#FF5D5D" gate={false} animZones={animZones} />
                      ) : null}
                      {state.tap ? <TapMarkerPattern sc={sc} point={state.tap} /> : null}
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S10 HEAD & SHOULDERS ===== */}
            {step === 10 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{HEAD_SHOULDERS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HEAD_SHOULDERS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HEAD_SHOULDERS.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="hs" />
                      <PatternLevel sc={sc} py={60} label="NECKLINE" color="#456DFF" below right glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("hs", 23)} py={42} label="shoulder" color="#88C9F7" />
                      <PatternDot sc={sc} px={patternAnchorX("hs", 51)} py={16} label="HEAD" color="#F7C325" />
                      <PatternDot sc={sc} px={patternAnchorX("hs", 79)} py={30} label="shoulder" color="#88C9F7" />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S11 INVERSE H&S ===== */}
            {step === 11 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{INV_HS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{INV_HS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{INV_HS.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="ihs" />
                      <PatternLevel sc={sc} py={40} label="NECKLINE" color="#F7C325" glow animZones={animZones} />
                      <PatternDot sc={sc} px={patternAnchorX("ihs", 23)} py={58} label="shoulder" color="#88C9F7" below />
                      <PatternDot sc={sc} px={patternAnchorX("ihs", 51)} py={84} label="HEAD" color="#F7C325" below />
                      <PatternDot sc={sc} px={patternAnchorX("ihs", 79)} py={70} label="shoulder" color="#88C9F7" below />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S12 TRIPLES ===== */}
            {step === 12 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{TRIPLES.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TRIPLES.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TRIPLES.prompt}</p>
                <div className="flex gap-3">
                  {TRIPLES_CARDS.map((c) => (
                    <MiniPatternCard key={c.title} cfg={c} />
                  ))}
                </div>
              </div>
            )}

            {/* ===== S13 IDENTIFY REVERSAL (mcq) ===== */}
            {step === 13 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{ID_REVERSAL_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{ID_REVERSAL_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{ID_REVERSAL_MCQ.prompt}</p>
                    <div className="mb-5">
                      <PatternChartSvg sc={sc}>
                        <PatternCandles sc={sc} shape="hs" noAnim />
                        {resolved ? <PatternLevel sc={sc} py={60} label="NECKLINE" color="#456DFF" below right gate={false} animZones={animZones} /> : null}
                        {resolved ? <PatternDot sc={sc} px={patternAnchorX("hs", 23)} py={42} label="shoulder" color="#88C9F7" /> : null}
                        {resolved ? <PatternDot sc={sc} px={patternAnchorX("hs", 51)} py={16} label="HEAD" color="#F7C325" /> : null}
                        {resolved ? <PatternDot sc={sc} px={patternAnchorX("hs", 79)} py={30} label="shoulder" color="#88C9F7" /> : null}
                      </PatternChartSvg>
                    </div>
                    <McqOptions options={ID_REVERSAL_MCQ.options} correctIndex={ID_REVERSAL_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S14 CONTINUATION INTRO ===== */}
            {step === 14 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{CONTIN_INTRO.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CONTIN_INTRO.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CONTIN_INTRO.prompt}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    {CONTIN_CARDS_ROW1.map((c) => (
                      <MiniPatternCard key={c.title} cfg={c} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    {CONTIN_CARDS_ROW2.map((c) => (
                      <MiniPatternCard key={c.title} cfg={c} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S15 FLAGS & PENNANTS ===== */}
            {step === 15 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{FLAGS_PENNANTS.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{FLAGS_PENNANTS.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{FLAGS_PENNANTS.prompt}</p>
                <div className="flex gap-3">
                  {FLAGS_PENNANTS_CARDS.map((c) => (
                    <MiniPatternCard key={c.title} cfg={c} />
                  ))}
                </div>
              </div>
            )}

            {/* ===== S16 TRIANGLES ===== */}
            {step === 16 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{TRIANGLES.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{TRIANGLES.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{TRIANGLES.prompt}</p>
                <div className="flex gap-3">
                  {TRIANGLES_CARDS.map((c) => (
                    <MiniPatternCard key={c.title} cfg={c} />
                  ))}
                </div>
              </div>
            )}

            {/* ===== S17 RECTANGLES ===== */}
            {step === 17 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{RECTANGLES.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{RECTANGLES.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{RECTANGLES.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="rect" />
                      <PatternLevel sc={sc} py={29} label="ceiling" color="#FF5D5D" glow animZones={animZones} />
                      <PatternLevel sc={sc} py={67} label="floor" color="#456DFF" below glow animZones={animZones} />
                      <text x={sc.X(patternAnchorX("rect", 90))} y={sc.Y(18)} fill="#22c55e" fontSize={11.5} fontWeight={800} textAnchor="middle">
                        break ▲
                      </text>
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S18 IDENTIFY CONTINUATION (mcq) ===== */}
            {step === 18 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{ID_CONTIN_MCQ.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{ID_CONTIN_MCQ.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{ID_CONTIN_MCQ.prompt}</p>
                    <div className="mb-5">
                      <PatternChartSvg sc={sc}>
                        <PatternCandles sc={sc} shape="ascTri" noAnim />
                        {resolved ? <PatternLevel sc={sc} py={24} label="flat ceiling" color="#FF5D5D" gate={false} glow animZones={animZones} /> : null}
                        {resolved ? (
                          <PatternSlope sc={sc} p1={[8, 58]} p2={[70, 32]} label="rising lows" below gate={false} glow animZones={animZones} />
                        ) : null}
                      </PatternChartSvg>
                    </div>
                    <McqOptions options={ID_CONTIN_MCQ.options} correctIndex={ID_CONTIN_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S19 PSYCHOLOGY ===== */}
            {step === 19 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{PSYCHOLOGY.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{PSYCHOLOGY.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{PSYCHOLOGY.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={21} color="#FF5D5D" glow animZones={animZones} />
                      <text x={sc.X(patternAnchorX("dtop", 26))} y={sc.Y(21) - 18} fill="#ff8f8f" fontSize={11} fontWeight={800} textAnchor="middle">
                        sellers defend
                      </text>
                      <text x={sc.X(patternAnchorX("dtop", 66))} y={sc.Y(20) - 18} fill="#ff8f8f" fontSize={11} fontWeight={800} textAnchor="middle">
                        buyers give up
                      </text>
                      <PatternLevel sc={sc} py={52} label="everyone watches this level" color="#456DFF" below right glow animZones={animZones} />
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S20 CONTEXT ===== */}
            {step === 20 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{CONTEXT.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CONTEXT.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CONTEXT.prompt}</p>
                <div className="grid gap-2.5">
                  {CONTEXT_ROWS.map((r, i) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.09 }}
                      className="flex items-center gap-3.5 rounded-xl border border-border bg-brill-700 px-[18px] py-[15px]"
                    >
                      <span className="min-w-[150px] font-mono text-[13px] font-extrabold" style={{ color: r.color }}>
                        {r.label}
                      </span>
                      <span className="text-sm text-[#cfcfcf]">{r.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== S21 CONTEXT QUIZ (mcq) ===== */}
            {step === 21 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow tone="gold">{CONTEXT_QUIZ_MCQ.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{CONTEXT_QUIZ_MCQ.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{CONTEXT_QUIZ_MCQ.prompt}</p>
                <div className="mb-5 flex gap-3">
                  {CONTEXT_QUIZ_CARDS.map((c) => (
                    <MiniPatternCard key={c.title} cfg={c} />
                  ))}
                </div>
                <McqOptions options={CONTEXT_QUIZ_MCQ.options} correctIndex={CONTEXT_QUIZ_MCQ.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
              </div>
            )}

            {/* ===== S22 BREAKOUTS ===== */}
            {step === 22 &&
              (() => {
                const sc = patternScale();
                const bx = patternAnchorX("dtop", 82);
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow>{BREAKOUTS.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BREAKOUTS.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BREAKOUTS.prompt}</p>
                    <PatternChartSvg sc={sc}>
                      <PatternCandles sc={sc} shape="dtop" />
                      <PatternLevel sc={sc} py={52} label="NECKLINE" color="#456DFF" below right glow animZones={animZones} />
                      <circle cx={sc.X(bx)} cy={sc.Y(52)} r={12} fill="none" stroke="#ff8f8f" strokeWidth={2.5} style={{ filter: "drop-shadow(0 0 7px rgba(255,93,93,.6))" }} />
                      <text x={sc.X(bx)} y={sc.Y(52) - 22} fill="#ff8f8f" fontSize={12} fontWeight={800} textAnchor="middle">
                        CONFIRMED BREAK ↓
                      </text>
                      <text x={sc.X(patternAnchorX("dtop", 58))} y={sc.Y(28)} fill="#8a8a8a" fontSize={11} fontWeight={700} textAnchor="middle">
                        entering here = anticipating
                      </text>
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S23 FALSE BREAK (candle) ===== */}
            {step === 23 &&
              (() => {
                const sc = patternScale({ H: 300 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{FALSE_BREAK.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{FALSE_BREAK.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{FALSE_BREAK.prompt}</p>
                    <div className="mb-5">
                      <PatternChartSvg sc={sc}>
                        <PatternCandles sc={sc} shape="dtop" upToPt={resolved ? undefined : 10} noAnim />
                        <PatternLevel sc={sc} py={52} label="NECKLINE" color="#456DFF" below right gate={false} glow animZones={animZones} />
                        {!resolved && (
                          <rect
                            x={sc.X(84)}
                            y={sc.padTop}
                            width={sc.W - sc.padX - sc.X(84)}
                            height={sc.H - sc.padTop - sc.padBot}
                            fill="rgba(255,255,255,0.03)"
                            stroke="rgba(255,255,255,0.16)"
                            strokeDasharray="5 4"
                            rx={5}
                          />
                        )}
                        {resolved ? (
                          <text x={sc.W - sc.padX - 4} y={sc.Y(10)} fill="#ff8f8f" fontSize={11.5} fontWeight={800} textAnchor="end">
                            break confirmed ↓
                          </text>
                        ) : (
                          <text x={(sc.X(84) + sc.W - sc.padX) / 2} y={sc.padTop + 32} fill="#888" fontSize={26} fontWeight={900} textAnchor="middle">
                            ?
                          </text>
                        )}
                      </PatternChartSvg>
                    </div>
                    <CandleOptions sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S24 FAILURE ===== */}
            {step === 24 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{FAILURE.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{FAILURE.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{FAILURE.prompt}</p>
                <div className="grid gap-2.5">
                  {FAILURE_ROWS.map((r, i) => (
                    <motion.div
                      key={r.label}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.09 }}
                      className="flex items-center gap-3.5 rounded-xl border border-border bg-brill-700 px-[18px] py-[15px]"
                    >
                      <span className="min-w-[140px] font-mono text-[13px] font-extrabold" style={{ color: r.color }}>
                        {r.label}
                      </span>
                      <span className="text-sm text-[#cfcfcf]">{r.text}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.38 }}
                    className="mt-1 rounded-xl border border-gold/30 bg-gold-bg px-[18px] py-3.5 text-sm font-bold text-gold"
                  >
                    {FAILURE_NOTE}
                  </motion.div>
                </div>
              </div>
            )}

            {/* ===== S25 HOW TO ===== */}
            {step === 25 && (
              <div className="mx-auto max-w-[880px]">
                <SectionEyebrow>{HOW_TO.kicker}</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{HOW_TO.title}</h2>
                <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{HOW_TO.prompt}</p>
                <div className="grid gap-2.5">
                  {HOW_TO_STEPS.map((s, i) => (
                    <motion.div
                      key={s.n}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.09 }}
                      className={`flex items-center gap-3.5 rounded-xl border px-[18px] py-3.5 ${i === 0 ? "border-gold/30 bg-gold-bg" : "border-border bg-brill-700"}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-black text-[#0a0a0a]" style={{ background: s.color }}>
                        {s.n}
                      </span>
                      <span className="min-w-[104px] font-mono text-[13.5px] font-extrabold" style={{ color: s.color }}>
                        {s.label}
                      </span>
                      <span className="text-sm text-[#cfcfcf]">{s.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== S26 BOSS TAP ===== */}
            {step === 26 &&
              (() => {
                const sc = patternScale();
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_TAP.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_TAP.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_TAP.prompt}</p>
                    <PatternChartSvg sc={sc} svgRef={svgRef} tapHit={(e) => tapChart(e, sc)}>
                      <PatternCandles sc={sc} shape="ihs" noAnim />
                      {resolved ? <PatternLevel sc={sc} py={40} label="NECKLINE" color="#F7C325" glow gate={false} animZones={animZones} /> : null}
                      {resolved ? <PatternDot sc={sc} px={patternAnchorX("ihs", 23)} py={58} color="#88C9F7" below /> : null}
                      {resolved ? <PatternDot sc={sc} px={patternAnchorX("ihs", 51)} py={84} label="head" color="#F7C325" below /> : null}
                      {resolved ? <PatternDot sc={sc} px={patternAnchorX("ihs", 79)} py={70} color="#88C9F7" below /> : null}
                      {state.tap ? <TapMarkerPattern sc={sc} point={state.tap} /> : null}
                    </PatternChartSvg>
                  </div>
                );
              })()}

            {/* ===== S27 BOSS DECIDE (mcq) ===== */}
            {step === 27 &&
              (() => {
                const sc = patternScale({ H: 300 });
                return (
                  <div className="mx-auto max-w-[880px]">
                    <SectionEyebrow tone="gold">{BOSS_DECIDE.kicker}</SectionEyebrow>
                    <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">{BOSS_DECIDE.title}</h2>
                    <p className="mx-auto mb-6 max-w-[640px] text-center text-[15px] text-text-secondary">{BOSS_DECIDE.prompt}</p>
                    <div className="mb-5">
                      <PatternChartSvg sc={sc}>
                        <PatternCandles sc={sc} shape="ihsExt" upToPt={resolved ? undefined : 14} noAnim />
                        <PatternLevel sc={sc} py={40} label="NECKLINE" color="#F7C325" gate={false} glow animZones={animZones} />
                        {resolved ? (
                          <text x={sc.X(patternAnchorX("ihsExt", 104))} y={sc.Y(6)} fill="#22c55e" fontSize={12} fontWeight={800} textAnchor="middle">
                            +₹420 ▲
                          </text>
                        ) : null}
                        {resolved ? (
                          <PatternLevel sc={sc} py={70} label="STOP · below right shoulder" color="#ff8f8f" below right gate={false} animZones={animZones} />
                        ) : null}
                      </PatternChartSvg>
                    </div>
                    <McqOptions options={BOSS_DECIDE.options} correctIndex={BOSS_DECIDE.correctIndex} sel={state.sel} phase={state.phase} onSelect={selectOption} />
                  </div>
                );
              })()}

            {/* ===== S28 SUMMARY ===== */}
            {step === 28 && (
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
                      {CHART_PATTERNS_LESSON_XP}
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

      <LessonCoachDock {...coachPanelProps} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
    </div>
  );
}
