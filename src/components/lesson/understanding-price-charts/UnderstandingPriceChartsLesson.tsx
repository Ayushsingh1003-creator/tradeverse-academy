"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import { geo, shuffle, seriesX, lineChartGeo, type CandleGeo } from "./geometry";
import { PRICE_CHARTS_LESSON_SLUG, PRICE_CHARTS_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  AXIS_INFO,
  MCQ_QUESTION,
  READ_SERIES,
  S4_SERIES,
  S4_MAX_INDEX,
  LC_SERIES,
  LINE_TEACH_CAPTIONS,
  T3_ROUNDS,
  TREND_OPTIONS,
  TREND_DEFS,
  S8_ROUNDS,
  LVC_BARS,
  LVC_CAPTIONS,
  MATCH_PAIRS,
  seriesForMatch,
  BUILD_INITIAL,
  SP_ROUNDS,
  RECAP_ITEMS,
  seriesFor,
  strokeFor,
  type AxisKey,
  type TrendId,
  type ChartMode,
  type LineTeachKey,
  type MatchId,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";

type Feedback = { ok: boolean; text: string } | null;

type LessonState = {
  step: number;
  xp: number;
  axis: { active: AxisKey | null; seen: Partial<Record<AxisKey, boolean>>; awarded: Partial<Record<AxisKey, boolean>> };
  mcq: { picked: number | null; ok: boolean; wrongSet: Record<number, boolean> };
  read: { idx: number; moved: boolean };
  s4: { ok: boolean; wrongIdx: number | null; okIdx: number | null; fb: Feedback };
  lineTeach: { connected: boolean; seen: Partial<Record<LineTeachKey, boolean>>; awarded: Partial<Record<LineTeachKey, boolean>> };
  t3: { round: number; fb: Feedback };
  trend: { active: TrendId | null; seen: Partial<Record<TrendId, boolean>>; awarded: Partial<Record<TrendId, boolean>> };
  s8: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
  lvc: { mode: ChartMode; seen: Partial<Record<ChartMode, boolean>>; awarded: Partial<Record<ChartMode, boolean>> };
  match: { picked: { side: "L" | "R"; id: MatchId } | null; matched: Partial<Record<MatchId, boolean>>; wrong: [MatchId, MatchId] | null };
  build: { p1: number; p2: number; p3: number; done: boolean };
  sp: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
};

const initialState: LessonState = {
  step: 0,
  xp: 0,
  axis: { active: null, seen: {}, awarded: {} },
  mcq: { picked: null, ok: false, wrongSet: {} },
  read: { idx: 4, moved: false },
  s4: { ok: false, wrongIdx: null, okIdx: null, fb: null },
  lineTeach: { connected: false, seen: {}, awarded: {} },
  t3: { round: 0, fb: null },
  trend: { active: null, seen: {}, awarded: {} },
  s8: { round: 0, fb: null, wrongIdx: null, okIdx: null },
  lvc: { mode: "line", seen: {}, awarded: {} },
  match: { picked: null, matched: {}, wrong: null },
  build: { ...BUILD_INITIAL, done: false },
  sp: { round: 0, fb: null, wrongIdx: null, okIdx: null },
};

/* ---------- tiny icons ---------- */

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

function OpenCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth={2}>
      <circle cx={12} cy={12} r={8} />
    </svg>
  );
}

function TrendIcon({ kind, color, size = 22 }: { kind: TrendId; color: string; size?: number }) {
  const paths =
    kind === "up"
      ? ["M3 17 9 11l4 4 8-8", "M15 7h6v6"]
      : kind === "down"
        ? ["M3 7 9 13l4-4 8 8", "M15 17h6v-6"]
        : ["M3 12h18", "m17 8 4 4-4 4"];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/* ---------- shared candle / line-chart SVG bits ---------- */

function CandleShape({ g, wickWidth = 6, bodyRx = 8 }: { g: CandleGeo; wickWidth?: number; bodyRx?: number }) {
  return (
    <>
      <line x1={g.cx} y1={g.upY1} x2={g.cx} y2={g.upY2} stroke={g.color} strokeWidth={wickWidth} strokeLinecap="round" />
      <line x1={g.cx} y1={g.loY1} x2={g.cx} y2={g.loY2} stroke={g.color} strokeWidth={wickWidth} strokeLinecap="round" />
      <rect x={g.bodyX} y={g.bodyY} width={g.bw} height={g.bodyH} rx={bodyRx} fill={g.color} />
    </>
  );
}

function FeedbackBanner({ fb, center = false }: { fb: Feedback; center?: boolean }) {
  if (!fb) return null;
  return (
    <div
      className={`inline-flex animate-pop-in items-center gap-2.5 rounded-xl border px-5 py-3 text-left text-sm font-medium text-white ${
        fb.ok ? "border-blue/40 bg-blue-bg" : "border-wrong/40 bg-wrong-bg"
      } ${center ? "mx-auto" : ""}`}
    >
      <span className="shrink-0">{fb.ok ? <CheckIcon size={18} /> : <XIcon size={18} />}</span>
      <span>{fb.text}</span>
    </div>
  );
}

function SectionEyebrow({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "gold" }) {
  return (
    <div className={`mb-2 text-center text-[11px] font-extrabold tracking-[0.14em] ${tone === "gold" ? "text-gold" : "text-blue-light"}`}>
      {children}
    </div>
  );
}

/* ---------- drag helpers ---------- */

function beginSlide(min: number, max: number, onChange: (v: number) => void) {
  return (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = (clientX: number) => {
      const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange(Math.round(min + t * (max - min)));
    };
    update(e.clientX);
    const move = (ev: PointerEvent) => update(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
}

/* ================================================================== */

export function UnderstandingPriceChartsLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const floaterId = useRef(0);
  const matchOrderRef = useRef<MatchId[] | null>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const step = state.step;
  const meta = SECTION_META[step]!;

  function award(amt: number, opts: { silent?: boolean; burst?: number } = {}) {
    setState((s) => ({ ...s, xp: s.xp + amt }));
    const id = ++floaterId.current;
    setFloaters((f) => [...f, { id, amt }]);
    window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== id)), 1000);
    if (!opts.silent) sound.correct();
    if (opts.burst) setBurst((b) => ({ id: b.id + 1, count: opts.burst! }));
  }

  function matchOrder(): MatchId[] {
    if (!matchOrderRef.current) matchOrderRef.current = shuffle(MATCH_PAIRS.map((p) => p.id));
    return matchOrderRef.current;
  }

  function canContinue(): boolean {
    switch (step) {
      case 2:
        return state.mcq.ok;
      case 4:
        return state.s4.ok;
      case 6:
        return state.t3.round >= T3_ROUNDS.length;
      case 8:
        return state.s8.round >= S8_ROUNDS.length;
      case 10:
        return Object.keys(state.match.matched).length === MATCH_PAIRS.length;
      case 11:
        return state.build.done;
      case 12:
        return state.sp.round >= SP_ROUNDS.length;
      default:
        return true;
    }
  }

  function goBack() {
    sound.tick();
    if (step === 0) {
      router.push(BACK_HREF);
      return;
    }
    setState((s) => ({ ...s, step: Math.max(0, s.step - 1) }));
  }

  function exitLesson() {
    sound.tick();
    router.push(BACK_HREF);
  }

  function goNext() {
    if (step === TOTAL_STEPS) {
      restart();
      return;
    }
    if (!canContinue()) return;
    sound.tick();
    const n = step + 1;
    setState((s) => ({ ...s, step: n }));
    if (n === TOTAL_STEPS) {
      sound.lessonComplete();
      setBurst((b) => ({ id: b.id + 1, count: 64 }));
      completeLesson({ lessonSlug: PRICE_CHARTS_LESSON_SLUG, score: 100, xpEarned: PRICE_CHARTS_LESSON_XP });
    }
  }

  function restart() {
    matchOrderRef.current = null;
    setState(initialState);
  }

  /* ---------- handlers ---------- */

  function tapAxis(id: AxisKey) {
    sound.tick();
    const already = !!state.axis.awarded[id];
    setState((s) => ({
      ...s,
      axis: { active: id, seen: { ...s.axis.seen, [id]: true }, awarded: already ? s.axis.awarded : { ...s.axis.awarded, [id]: true } },
    }));
    if (!already) award(5, { silent: true });
  }

  function pickMcq(i: number) {
    if (state.mcq.ok) return;
    const opt = MCQ_QUESTION.options[i]!;
    if (opt.correct) {
      setState((s) => ({ ...s, mcq: { picked: i, ok: true, wrongSet: s.mcq.wrongSet } }));
      award(25);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, mcq: { picked: i, ok: false, wrongSet: { ...s.mcq.wrongSet, [i]: true } } }));
    }
  }

  function setRead(idx: number) {
    const moved = state.read.moved;
    setState((s) => ({ ...s, read: { idx, moved: true } }));
    if (!moved) award(10);
    else sound.tick();
  }

  function tapS4(i: number) {
    if (state.s4.ok) return;
    if (i === S4_MAX_INDEX) {
      setState((s) => ({
        ...s,
        s4: { ok: true, okIdx: i, wrongIdx: null, fb: { ok: true, text: "Correct — that point sits highest on the price axis, so price closed highest there." } },
      }));
      award(20, { burst: 70 });
    } else {
      sound.wrong();
      setState((s) => ({
        ...s,
        s4: { ...s.s4, wrongIdx: i, okIdx: null, fb: { ok: false, text: "Not the highest. Follow each dot up the price axis and find the tallest." } },
      }));
      window.setTimeout(() => setState((s) => ({ ...s, s4: { ...s.s4, wrongIdx: null } })), 500);
    }
  }

  function setLineTeach(connected: boolean) {
    sound.tick();
    const key: LineTeachKey = connected ? "line" : "dots";
    const already = !!state.lineTeach.awarded[key];
    setState((s) => ({
      ...s,
      lineTeach: { connected, seen: { ...s.lineTeach.seen, [key]: true }, awarded: already ? s.lineTeach.awarded : { ...s.lineTeach.awarded, [key]: true } },
    }));
    if (!already) award(5, { silent: true });
  }

  function answerT3(kind: TrendId) {
    const r = T3_ROUNDS[state.t3.round];
    if (!r) return;
    if (kind === r.ans) {
      const next = state.t3.round + 1;
      setState((s) => ({ ...s, t3: { round: s.t3.round, fb: { ok: true, text: r.hint } } }));
      award(20);
      window.setTimeout(() => setState((s) => ({ ...s, t3: { round: next, fb: null } })), 1200);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, t3: { ...s.t3, fb: { ok: false, text: "Look again — " + r.hint } } }));
    }
  }

  function tapTrend(id: TrendId) {
    sound.tick();
    const already = !!state.trend.awarded[id];
    setState((s) => ({ ...s, trend: { active: id, seen: { ...s.trend.seen, [id]: true }, awarded: already ? s.trend.awarded : { ...s.trend.awarded, [id]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function tapS8(idx: number) {
    const r = S8_ROUNDS[state.s8.round];
    if (!r || state.s8.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.s8.round + 1;
      setState((s) => ({ ...s, s8: { ...s.s8, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === S8_ROUNDS.length ? { burst: 70 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, s8: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1300);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, s8: { ...s.s8, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, s8: { ...s.s8, wrongIdx: null } })), 500);
    }
  }

  function setLvc(mode: ChartMode) {
    sound.tick();
    const already = !!state.lvc.awarded[mode];
    setState((s) => ({ ...s, lvc: { mode, seen: { ...s.lvc.seen, [mode]: true }, awarded: already ? s.lvc.awarded : { ...s.lvc.awarded, [mode]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function pickMatchCard(side: "L" | "R", id: MatchId) {
    const st = state.match;
    if (st.matched[id]) return;
    sound.tick();
    if (!st.picked) {
      setState((s) => ({ ...s, match: { ...s.match, picked: { side, id } } }));
      return;
    }
    if (st.picked.side === side) {
      setState((s) => ({ ...s, match: { ...s.match, picked: { side, id } } }));
      return;
    }
    if (st.picked.id === id) {
      const matched = { ...st.matched, [id]: true };
      const done = Object.keys(matched).length === MATCH_PAIRS.length;
      setState((s) => ({ ...s, match: { picked: null, matched, wrong: null } }));
      award(20, done ? { burst: 90 } : {});
    } else {
      sound.wrong();
      const wrong: [MatchId, MatchId] = [st.picked.id, id];
      setState((s) => ({ ...s, match: { ...s.match, picked: null, wrong } }));
      window.setTimeout(() => setState((s) => ({ ...s, match: { ...s.match, wrong: null } })), 480);
    }
  }

  function setBuild(key: "p1" | "p2" | "p3", v: number) {
    const next = { ...state.build, [key]: v };
    const rise1 = next.p2 - next.p1 >= 10;
    const rise2 = next.p3 - next.p2 >= 10;
    const allDone = rise1 && rise2;
    if (allDone && !next.done) {
      next.done = true;
      setState((s) => ({ ...s, build: next }));
      award(40, { burst: 90 });
      return;
    }
    if (!allDone) next.done = false;
    setState((s) => ({ ...s, build: next }));
    sound.tick();
  }

  function tapSp(idx: number) {
    const r = SP_ROUNDS[state.sp.round];
    if (!r || state.sp.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.sp.round + 1;
      setState((s) => ({ ...s, sp: { ...s.sp, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === SP_ROUNDS.length ? { burst: 80 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, sp: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1300);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, sp: { ...s.sp, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, sp: { ...s.sp, wrongIdx: null } })), 500);
    }
  }

  /* ---------- derived geometry ---------- */

  const readChart = lineChartGeo(READ_SERIES, 560, 260, 46, 16, 46);
  const readDot = readChart.dots[state.read.idx]!;
  const readPct = +((state.read.idx / (READ_SERIES.length - 1)) * 100).toFixed(1);

  const s4Chart = lineChartGeo(S4_SERIES, 520, 260, 40, 16, 50);

  const lcChart = lineChartGeo(LC_SERIES, 520, 240, 40, 14, 44);

  const t3Round = T3_ROUNDS[Math.min(state.t3.round, T3_ROUNDS.length - 1)]!;
  const t3Chart = lineChartGeo(t3Round.series, 360, 180, 30, 12, 30);

  const activeTrendDef = TREND_DEFS.find((t) => t.id === state.trend.active) ?? null;

  const s8Round = S8_ROUNDS[Math.min(state.s8.round, S8_ROUNDS.length - 1)]!;

  const lvcAllV: number[] = [];
  LVC_BARS.forEach((b) => lvcAllV.push(b.h, b.l));
  const lvcMin = Math.min(...lvcAllV);
  const lvcMax = Math.max(...lvcAllV);
  const lvcW = 520;
  const lvcH = 250;
  const lvcPad = 20;
  const lvcCloseChart = lineChartGeo(
    LVC_BARS.map((b) => b.c),
    lvcW,
    lvcH,
    lvcPad,
    lvcPad,
    lvcPad,
    lvcMin,
    lvcMax,
  );

  const matchedCount = Object.keys(state.match.matched).length;

  const buildChart = lineChartGeo([state.build.p1, state.build.p2, state.build.p3], 380, 240, 30, 14, 40, 0, 100);
  const buildRise1 = state.build.p2 - state.build.p1 >= 10;
  const buildRise2 = state.build.p3 - state.build.p2 >= 10;
  const buildColor = state.build.done ? "#22c55e" : "#456dff";

  const spRound = SP_ROUNDS[Math.min(state.sp.round, SP_ROUNDS.length - 1)]!;

  const ctaDisabled = !canContinue();
  useScrollCtaIntoView(ctaRef, ctaDisabled);
  const ctaLabel = step === 0 ? "Start lesson" : step === TOTAL_STEPS ? "Restart lesson" : step === 12 ? "Finish" : "Continue";
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  /* ================================================================ */

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-brill-800 text-white">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px)",
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
      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-28 pt-[100px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            {step === 0 && (
              <div className="mx-auto max-w-[760px] text-center">
                <svg width={220} height={160} viewBox="0 0 260 180" className="mx-auto mb-5 block">
                  <line x1={34} y1={18} x2={34} y2={150} stroke="rgba(255,255,255,.25)" strokeWidth={2} strokeLinecap="round" />
                  <line x1={34} y1={150} x2={240} y2={150} stroke="rgba(255,255,255,.25)" strokeWidth={2} strokeLinecap="round" />
                  <path d="M34 12 l-4 8 h8 z" fill="rgba(255,255,255,.35)" />
                  <path d="M246 150 l-8 -4 v8 z" fill="rgba(255,255,255,.35)" />
                  <motion.path
                    d="M46,128 L76,110 L106,120 L136,86 L166,96 L196,58 L226,40"
                    fill="none"
                    stroke="#456dff"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.circle
                    cx={226}
                    cy={40}
                    r={5}
                    fill="#88c9f7"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.4 }}
                  />
                </svg>
                <div className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-blue-light">UNDERSTANDING PRICE CHARTS</div>
                <h1 className="mb-3.5 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[40px]">
                  Before the candles,
                  <br />
                  learn to read the chart.
                </h1>
                <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-relaxed text-text-secondary">
                  A chart is just price drawn against time. Get comfortable with the axes, points and trends first — then every candle you
                  meet later will make instant sense.
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { icon: <path d="M4 4v16h16" />, label: "The two axes" },
                    { icon: <path d="M4 14l5-5 4 4 7-7" />, label: "Reading a line" },
                    { icon: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>, label: "Trends" },
                    { icon: <><rect x={8} y={5} width={8} height={14} rx={2} /><path d="M12 2v3M12 19v3" /></>, label: "Line vs candle" },
                  ].map((chip) => (
                    <div
                      key={chip.label}
                      className="flex items-center gap-2 rounded-xl border border-border bg-brill-700 px-4 py-2.5 text-[13px] font-semibold text-text-secondary"
                    >
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#88c9f7" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                        {chip.icon}
                      </svg>
                      {chip.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto max-w-[860px]">
                <SectionEyebrow>LEARN · THE TWO AXES</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">A chart has just two directions</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Time runs left to right. Price runs bottom to top. Every dot on a chart is simply &quot;this price, at this time.&quot;
                  Tap each axis to see what it measures.
                </p>
                <div className="grid items-center gap-6 rounded-[22px] border border-border bg-black p-6 md:grid-cols-[320px_1fr]">
                  <div className="flex justify-center">
                    <svg width={280} height={240} viewBox="0 0 320 270" style={{ overflow: "visible" }}>
                      <rect
                        onClick={() => tapAxis("y")}
                        x={0}
                        y={10}
                        width={44}
                        height={220}
                        rx={6}
                        fill={state.axis.active === "y" ? "rgba(69,109,255,.18)" : "rgba(255,255,255,.02)"}
                        stroke={state.axis.active === "y" ? "#456dff" : "rgba(255,255,255,.16)"}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        style={{ cursor: "pointer", transition: "all .2s" }}
                      />
                      <rect
                        onClick={() => tapAxis("x")}
                        x={44}
                        y={222}
                        width={256}
                        height={40}
                        rx={6}
                        fill={state.axis.active === "x" ? "rgba(69,109,255,.18)" : "rgba(255,255,255,.02)"}
                        stroke={state.axis.active === "x" ? "#456dff" : "rgba(255,255,255,.16)"}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        style={{ cursor: "pointer", transition: "all .2s" }}
                      />
                      <g style={{ pointerEvents: "none" }}>
                        <line x1={52} y1={16} x2={52} y2={222} stroke="rgba(255,255,255,.4)" strokeWidth={2} strokeLinecap="round" />
                        <line x1={52} y1={222} x2={300} y2={222} stroke="rgba(255,255,255,.4)" strokeWidth={2} strokeLinecap="round" />
                        <path d="M52 10 l-4 8 h8 z" fill="rgba(255,255,255,.5)" />
                        <path d="M306 222 l-8 -4 v8 z" fill="rgba(255,255,255,.5)" />
                        <polyline points="70,190 110,160 150,172 190,120 230,132 270,84" fill="none" stroke="#456dff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
                        <text x={16} y={120} fill={state.axis.active === "y" ? "#88c9f7" : "#888"} fontSize={12} fontWeight={800} transform="rotate(-90 16 120)">
                          PRICE
                        </text>
                        <text x={150} y={250} fill={state.axis.active === "x" ? "#88c9f7" : "#888"} fontSize={12} fontWeight={800} textAnchor="middle">
                          TIME
                        </text>
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className={`rounded-2xl border px-[17px] py-[15px] transition-all ${state.axis.active === "y" ? "border-blue/50" : "border-border-subtle"} bg-brill-700`}>
                      <div className="mb-0.5 flex items-center gap-2 text-sm font-extrabold text-white">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#88c9f7" strokeWidth={2.4} strokeLinecap="round">
                          <path d="M12 20V4M6 10l6-6 6 6" />
                        </svg>
                        {AXIS_INFO.y.name}
                      </div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">{state.axis.seen.y ? AXIS_INFO.y.revealed : AXIS_INFO.y.prompt}</div>
                    </div>
                    <div className={`rounded-2xl border px-[17px] py-[15px] transition-all ${state.axis.active === "x" ? "border-blue/50" : "border-border-subtle"} bg-brill-700`}>
                      <div className="mb-0.5 flex items-center gap-2 text-sm font-extrabold text-white">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#88c9f7" strokeWidth={2.4} strokeLinecap="round">
                          <path d="M4 12h16M14 6l6 6-6 6" />
                        </svg>
                        {AXIS_INFO.x.name}
                      </div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">{state.axis.seen.x ? AXIS_INFO.x.revealed : AXIS_INFO.x.prompt}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-[640px] text-center">
                <SectionEyebrow tone="gold">QUICK CHECK</SectionEyebrow>
                <h2 className="mb-6 text-2xl font-extrabold sm:text-[26px]">{MCQ_QUESTION.question}</h2>
                <div className="flex flex-col gap-2.5 text-left">
                  {MCQ_QUESTION.options.map((o, i) => {
                    const solved = state.mcq.ok;
                    const showRight = solved && o.correct;
                    const wrong = !!state.mcq.wrongSet[i];
                    return (
                      <button
                        key={o.text}
                        type="button"
                        onClick={() => pickMcq(i)}
                        disabled={solved}
                        className={`flex items-center gap-3 rounded-2xl border-2 px-[18px] py-4 text-left text-[15px] font-semibold text-white transition-all ${
                          showRight ? "border-blue bg-blue-bgDark" : wrong && !solved ? "border-wrong/50 bg-wrong-bg" : "border-border bg-brill-700"
                        } ${solved ? "cursor-default" : "cursor-pointer hover:translate-x-1"} ${wrong && !solved ? "animate-wrong-shake" : showRight ? "animate-pop-in" : ""}`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] ${
                            showRight ? "border-blue bg-blue" : wrong ? "border-wrong bg-wrong" : "border-border-strong bg-transparent"
                          }`}
                        >
                          {showRight ? <CheckIcon size={15} /> : wrong ? <XIcon size={14} /> : null}
                        </span>
                        {o.text}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 min-h-[46px]">
                  <FeedbackBanner center fb={state.mcq.picked != null ? { ok: state.mcq.ok, text: MCQ_QUESTION.options[state.mcq.picked]!.why } : null} />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-[860px]">
                <SectionEyebrow>LEARN · READING A POINT</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Every point answers &quot;when&quot; and &quot;how much&quot;</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Slide the marker along the chart. Read straight down for the day, straight across for the price. That&apos;s all a chart
                  ever asks you to do.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6">
                  <div className="flex justify-center">
                    <svg width={520} height={220} viewBox="0 0 560 260" style={{ overflow: "visible", maxWidth: "100%" }}>
                      <line x1={46} y1={16} x2={46} y2={214} stroke="rgba(255,255,255,.25)" strokeWidth={1.6} />
                      <line x1={46} y1={214} x2={540} y2={214} stroke="rgba(255,255,255,.25)" strokeWidth={1.6} />
                      <polyline points={readChart.pts} fill="none" stroke="#456dff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      <line x1={readDot.cx} y1={16} x2={readDot.cx} y2={214} stroke="rgba(247,195,37,.5)" strokeWidth={1.5} strokeDasharray="4 4" />
                      <line x1={46} y1={readDot.cy} x2={readDot.cx} y2={readDot.cy} stroke="rgba(247,195,37,.5)" strokeWidth={1.5} strokeDasharray="4 4" />
                      {readChart.dots.map((d) => (
                        <circle key={d.i} cx={d.cx} cy={d.cy} r={3.5} fill="#2a4ae8" />
                      ))}
                      <circle cx={readDot.cx} cy={readDot.cy} r={7} fill="#f7c325" stroke="#141414" strokeWidth={2} />
                    </svg>
                  </div>
                  <div className="mt-2 grid gap-4 md:grid-cols-2">
                    <div className="flex justify-center gap-3.5">
                      <div className="rounded-xl border border-border-subtle bg-brill-700 px-5 py-2.5 text-center">
                        <div className="text-[11px] font-bold text-text-muted">TIME</div>
                        <div className="text-xl font-black text-white">Day {state.read.idx + 1}</div>
                      </div>
                      <div className="rounded-xl border border-gold/30 bg-gold-bg px-5 py-2.5 text-center">
                        <div className="text-[11px] font-bold text-gold/80">PRICE</div>
                        <div className="text-xl font-black text-gold">₹{READ_SERIES[state.read.idx]}</div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="mb-1.5 text-xs font-bold text-text-secondary">DRAG THE MARKER</div>
                      <div onPointerDown={beginSlide(0, READ_SERIES.length - 1, setRead)} className="relative flex h-[24px] cursor-grab touch-none select-none items-center">
                        <div className="absolute left-0 right-0 h-2 rounded-md bg-brill-600" />
                        <div className="absolute left-0 h-2 rounded-md" style={{ width: `${readPct}%`, background: "linear-gradient(90deg,#c49b10,#f7c325)" }} />
                        <div
                          className="absolute h-6 w-6 rounded-full border-[3px] border-gold bg-white shadow-[0_2px_8px_rgba(0,0,0,.5)]"
                          style={{ left: `${readPct}%`, transform: "translateX(-12px)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-[720px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · READ THE CHART</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Tap the day price closed highest</h2>
                <p className="mb-4.5 text-[15px] text-text-secondary">Click the point that sits highest on the price axis.</p>
                <div className="flex justify-center rounded-[22px] border border-border bg-black p-5">
                  <svg width={480} height={230} viewBox="0 0 520 260" style={{ overflow: "visible", maxWidth: "100%" }}>
                    <line x1={40} y1={16} x2={40} y2={210} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                    <line x1={40} y1={210} x2={500} y2={210} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                    <polyline points={s4Chart.pts} fill="none" stroke="#456dff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    {s4Chart.dots.map((d) => {
                      const ok = state.s4.okIdx === d.i;
                      const wrong = state.s4.wrongIdx === d.i;
                      return (
                        <circle
                          key={d.i}
                          onClick={() => tapS4(d.i)}
                          cx={d.cx}
                          cy={d.cy}
                          r={ok ? 9 : 6}
                          fill={ok ? "#456dff" : wrong ? "#ff5d5d" : "#2a4ae8"}
                          stroke={ok ? "#88c9f7" : wrong ? "#ff5d5d" : "#141414"}
                          strokeWidth={2.5}
                          className={wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}
                          style={{ cursor: "pointer", transition: "all .15s" }}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="mt-4 min-h-[46px]">
                  <FeedbackBanner center fb={state.s4.fb} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · THE LINE CHART</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Join the closing prices — you get a line</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  The simplest chart plots one price per period — usually the close — then connects the dots. It shows direction at a
                  glance, but hides what happened in between.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6">
                  <div className="mb-4 flex justify-center">
                    <svg width={480} height={210} viewBox="0 0 520 240" style={{ overflow: "visible", maxWidth: "100%" }}>
                      <line x1={40} y1={14} x2={40} y2={196} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      <line x1={40} y1={196} x2={500} y2={196} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      {state.lineTeach.connected && (
                        <motion.polyline
                          points={lcChart.pts}
                          fill="none"
                          stroke="#456dff"
                          strokeWidth={3.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.35 }}
                        />
                      )}
                      {lcChart.dots.map((d) => (
                        <circle key={d.i} cx={d.cx} cy={d.cy} r={5} fill="#88c9f7" />
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLineTeach(false)}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all ${
                        !state.lineTeach.connected ? "border-blue bg-blue-row text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      1 · Closing prices
                    </button>
                    <button
                      type="button"
                      onClick={() => setLineTeach(true)}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all ${
                        state.lineTeach.connected ? "border-blue bg-blue-row text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      2 · Connect the line
                    </button>
                  </div>
                  <div key={String(state.lineTeach.connected)} className="mx-auto mt-3.5 max-w-[520px] animate-pop-in text-center text-[13.5px] leading-relaxed text-[#ccc]">
                    {state.lineTeach.connected ? LINE_TEACH_CAPTIONS.line : LINE_TEACH_CAPTIONS.dots}
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="mx-auto max-w-[640px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · WHICH WAY? · ROUND {Math.min(state.t3.round + 1, T3_ROUNDS.length)}/{T3_ROUNDS.length}</SectionEyebrow>
                <h2 className="mb-5 text-2xl font-extrabold sm:text-[26px]">Which way is price heading?</h2>
                <div className="mb-5 flex justify-center">
                  <div key={state.t3.round} className="animate-pop-in rounded-[20px] border border-border bg-black p-5">
                    <svg width={320} height={160} viewBox="0 0 360 180">
                      <line x1={30} y1={12} x2={30} y2={150} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      <line x1={30} y1={150} x2={346} y2={150} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      <polyline points={t3Chart.pts} fill="none" stroke="#456dff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-3">
                  {TREND_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => answerT3(o.id)}
                      className="flex max-w-[170px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-border-strong bg-brill-700 px-2.5 py-3.5 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5"
                    >
                      <TrendIcon kind={o.id} color={strokeFor(o.id)} size={26} />
                      {o.label}
                    </button>
                  ))}
                </div>
                <div className="mt-4 min-h-[52px]">
                  <FeedbackBanner center fb={state.t3.fb} />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="mx-auto max-w-[900px]">
                <SectionEyebrow>LEARN · THE THREE TRENDS</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Price only ever does three things</h2>
                <p className="mx-auto mb-5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Up, down, or sideways. Naming the trend is the first decision every trader makes. Tap each to learn its tell.
                </p>
                <div className="mb-4.5 flex flex-wrap justify-center gap-3.5">
                  {TREND_DEFS.map((t) => {
                    const on = state.trend.active === t.id;
                    const chart = lineChartGeo(t.series, 180, 90, 12, 10, 12);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => tapTrend(t.id)}
                        className={`w-[220px] rounded-[18px] border-2 bg-black px-3.5 pb-3.5 pt-4 transition-all hover:-translate-y-1 ${on ? "border-gold" : "border-border"}`}
                      >
                        <svg width={180} height={90} viewBox="0 0 180 90" className="mx-auto mb-2 block">
                          <polyline points={chart.pts} fill="none" stroke={t.stroke} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className={`text-sm font-extrabold ${on ? "text-gold" : "text-[#ccc]"}`}>{t.name}</div>
                      </button>
                    );
                  })}
                </div>
                <div key={state.trend.active ?? "none"} className="mx-auto min-h-[70px] max-w-[620px] animate-pop-in rounded-2xl border border-border-subtle bg-brill-700 px-5 py-4 text-center">
                  <div className="mb-0.5 text-[15px] font-extrabold text-gold">{activeTrendDef ? activeTrendDef.title : "Tap a chart to learn its name"}</div>
                  <div className="text-sm leading-relaxed text-[#ccc]">{activeTrendDef ? activeTrendDef.sub : "Every chart you will ever see is one of these three at any moment."}</div>
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="mx-auto max-w-[820px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · SPOT THE TREND · ROUND {Math.min(state.s8.round + 1, S8_ROUNDS.length)}/{S8_ROUNDS.length}</SectionEyebrow>
                <h2 className="mb-5 text-2xl font-extrabold sm:text-[26px]">{s8Round.prompt}</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {s8Round.kinds.map((kind, i) => {
                    const chart = lineChartGeo(seriesFor(kind, (i % 2) as 0 | 1), 170, 100, 14, 12, 14);
                    const ok = state.s8.okIdx === i;
                    const wrong = state.s8.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapS8(i)}
                        className={`cursor-pointer rounded-2xl border-2 bg-black p-3.5 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={170} height={100} viewBox="0 0 170 100">
                          <polyline points={chart.pts} fill="none" stroke={strokeFor(kind)} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 min-h-[46px]">
                  <FeedbackBanner center fb={state.s8.fb} />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="mx-auto max-w-[860px]">
                <SectionEyebrow>LEARN · LINE VS CANDLESTICK</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Same prices — candles just show more</h2>
                <p className="mx-auto mb-6 max-w-[580px] text-center text-[15px] text-text-secondary">
                  A line joins only the closes. A candlestick chart, over the exact same days, also reveals each day&apos;s open, high and
                  low — the full story. Toggle between them.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6">
                  <div className="mb-4 flex justify-center">
                    <svg width={480} height={220} viewBox={`0 0 ${lvcW} ${lvcH}`} style={{ overflow: "visible", maxWidth: "100%" }}>
                      <line x1={40} y1={14} x2={40} y2={lvcH - 44} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      <line x1={40} y1={lvcH - 44} x2={500} y2={lvcH - 44} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      {state.lvc.mode === "line" && (
                        <g>
                          <motion.polyline
                            points={lvcCloseChart.pts}
                            fill="none"
                            stroke="#456dff"
                            strokeWidth={3.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.35 }}
                          />
                          {lvcCloseChart.dots.map((d) => (
                            <circle key={d.i} cx={d.cx} cy={d.cy} r={5} fill="#88c9f7" />
                          ))}
                        </g>
                      )}
                      {state.lvc.mode === "candle" &&
                        LVC_BARS.map((b, i) => {
                          const cx = seriesX(i, LVC_BARS.length, lvcW, lvcPad);
                          const bw = 22;
                          const g = geo(b.o, b.h, b.l, b.c, lvcW, lvcH, bw, lvcPad, lvcMin, lvcMax);
                          return <CandleShape key={i} g={{ ...g, cx, bodyX: +(cx - bw / 2).toFixed(1) }} wickWidth={3} bodyRx={3} />;
                        })}
                    </svg>
                  </div>
                  <div className="flex justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setLvc("line")}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all ${
                        state.lvc.mode === "line" ? "border-blue bg-blue-row text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      Line chart
                    </button>
                    <button
                      type="button"
                      onClick={() => setLvc("candle")}
                      className={`rounded-xl border-2 px-5 py-2.5 text-sm font-extrabold transition-all ${
                        state.lvc.mode === "candle" ? "border-blue bg-blue-row text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      Candlestick chart
                    </button>
                  </div>
                  <div key={state.lvc.mode} className="mx-auto mt-3.5 max-w-[540px] animate-pop-in text-center text-[13.5px] leading-relaxed text-[#ccc]">
                    {LVC_CAPTIONS[state.lvc.mode]}
                  </div>
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow tone="gold">CHALLENGE · SHAPE → MEANING</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Match each chart shape to what it means</h2>
                <p className="mb-6 text-center text-[15px] text-text-secondary">Tap a chart, then tap the meaning that fits it. {matchedCount} of {MATCH_PAIRS.length} matched.</p>
                <div className="grid gap-6 md:grid-cols-[1fr_1.25fr]">
                  <div className="flex flex-col gap-3">
                    {MATCH_PAIRS.map((p) => {
                      const chart = lineChartGeo(seriesForMatch(p.kind), 70, 44, 6, 6, 6);
                      const done = !!state.match.matched[p.id];
                      const sel = state.match.picked?.side === "L" && state.match.picked.id === p.id;
                      const wrong = state.match.wrong?.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => pickMatchCard("L", p.id)}
                          className={`flex cursor-pointer items-center gap-3.5 rounded-2xl border-2 px-4 py-3 transition-all hover:translate-x-1 ${
                            done ? "border-blue bg-blue-bgDark opacity-55" : sel ? "border-gold bg-gold-bg" : wrong ? "border-wrong" : "border-border-subtle bg-brill-700"
                          } ${wrong ? "animate-wrong-shake" : done ? "animate-pop-in" : ""}`}
                        >
                          <svg width={70} height={44} viewBox="0 0 70 44" className="shrink-0">
                            <polyline points={chart.pts} fill="none" stroke={strokeFor(p.kind === "spike" ? "side" : p.kind)} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className={`text-[13px] font-bold ${done ? "text-blue-light" : "text-white"}`}>{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-3">
                    {matchOrder().map((id) => {
                      const p = MATCH_PAIRS.find((x) => x.id === id)!;
                      const done = !!state.match.matched[id];
                      const sel = state.match.picked?.side === "R" && state.match.picked.id === id;
                      const wrong = state.match.wrong?.includes(id);
                      return (
                        <div
                          key={id}
                          onClick={() => pickMatchCard("R", id)}
                          className={`cursor-pointer rounded-2xl border-2 px-[18px] py-3.5 transition-all hover:-translate-x-1 ${
                            done ? "border-blue bg-blue-bgDark opacity-55" : sel ? "border-gold bg-gold-bg" : wrong ? "border-wrong" : "border-border-subtle bg-brill-700"
                          } ${wrong ? "animate-wrong-shake" : done ? "animate-pop-in" : ""}`}
                        >
                          <div className={`text-sm font-bold ${done ? "text-blue-light" : "text-white"}`}>{p.title}</div>
                          <div className="mt-0.5 text-xs text-text-secondary">{p.sub}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 11 && (
              <div className="mx-auto max-w-[860px]">
                <SectionEyebrow tone="gold">CHALLENGE · BUILD IT</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Build an uptrend</h2>
                <p className="mb-5 text-center text-[15px] text-text-secondary">
                  Set three daily closes so each one is clearly higher than the last — a rising staircase. Every check turns blue when
                  it&apos;s a real uptrend.
                </p>
                <div className="grid gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[1fr_300px]">
                  <div className="flex items-center justify-center">
                    <svg width={340} height={210} viewBox="0 0 380 240" style={{ overflow: "visible" }}>
                      <line x1={30} y1={14} x2={30} y2={200} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      <line x1={30} y1={200} x2={366} y2={200} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      <polyline points={buildChart.pts} fill="none" stroke={buildColor} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                      {buildChart.dots.map((d) => (
                        <circle key={d.i} cx={d.cx} cy={d.cy} r={6} fill={buildColor} />
                      ))}
                    </svg>
                  </div>
                  <div>
                    {(
                      [
                        { k: "p1" as const, name: "Day 1 close" },
                        { k: "p2" as const, name: "Day 2 close" },
                        { k: "p3" as const, name: "Day 3 close" },
                      ] as const
                    ).map((sl) => (
                      <div key={sl.k} className="mb-4">
                        <div className="mb-1.5 flex justify-between text-xs font-bold">
                          <span className="text-[#ccc]">{sl.name}</span>
                          <span className="font-mono text-blue-light">₹{100 + state.build[sl.k]}</span>
                        </div>
                        <div onPointerDown={beginSlide(0, 100, (v) => setBuild(sl.k, v))} className="relative flex h-[22px] cursor-grab touch-none select-none items-center">
                          <div className="absolute left-0 right-0 h-2 rounded-md bg-brill-600" />
                          <div className="absolute left-0 h-2 rounded-md" style={{ width: `${state.build[sl.k]}%`, background: "linear-gradient(90deg,#3860be,#456dff)" }} />
                          <div
                            className="absolute h-[22px] w-[22px] rounded-full border-[3px] border-blue bg-white shadow-[0_2px_8px_rgba(0,0,0,.5)]"
                            style={{ left: `${state.build[sl.k]}%`, transform: "translateX(-11px)" }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="mt-3.5 flex flex-col gap-2.5">
                      {[
                        { label: "Day 2 closes above Day 1", ok: buildRise1 },
                        { label: "Day 3 closes above Day 2", ok: buildRise2 },
                      ].map((ck) => (
                        <div key={ck.label} className={`flex items-center gap-2.5 rounded-[11px] border px-3.5 py-2.5 transition-all ${ck.ok ? "border-blue/50 bg-blue-bgDark" : "border-border-subtle bg-brill-700"}`}>
                          {ck.ok ? <CheckIcon color="#88c9f7" size={18} /> : <OpenCircleIcon size={18} />}
                          <span className={`text-[13px] font-semibold ${ck.ok ? "text-white" : "text-text-secondary"}`}>{ck.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 12 && (
              <div className="mx-auto max-w-[820px] text-center">
                <SectionEyebrow tone="gold">FINAL CHALLENGE · ROUND {Math.min(state.sp.round + 1, SP_ROUNDS.length)}/{SP_ROUNDS.length}</SectionEyebrow>
                <h2 className="mb-5 text-2xl font-extrabold sm:text-[26px]">{spRound.prompt}</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {spRound.kinds.map((kind, i) => {
                    const chart = lineChartGeo(seriesFor(kind, (i % 2) as 0 | 1), 170, 100, 14, 12, 14);
                    const ok = state.sp.okIdx === i;
                    const wrong = state.sp.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapSp(i)}
                        className={`cursor-pointer rounded-2xl border-2 bg-black p-3.5 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={170} height={100} viewBox="0 0 170 100">
                          <polyline points={chart.pts} fill="none" stroke={strokeFor(kind)} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4.5 min-h-[48px]">
                  <FeedbackBanner center fb={state.sp.fb} />
                </div>
              </div>
            )}

            {step === 13 && (
              <div className="mx-auto max-w-[560px] text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.7 }}
                  className="mx-auto mb-5 flex h-[120px] w-[120px] items-center justify-center rounded-[30px] shadow-gold-glow"
                  style={{ background: "linear-gradient(135deg,#f7c325,#c49b10)" }}
                >
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4v16h16" />
                    <path d="M7 14l4-4 3 3 5-6" />
                  </svg>
                </motion.div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-gold">BADGE UNLOCKED</div>
                <h1 className="mb-1.5 text-[32px] font-black sm:text-[34px]">Chart Navigator</h1>
                <p className="mb-6 text-base text-text-secondary">You can read any price chart at a glance. Next up: the anatomy of a candlestick.</p>
                <div className="mb-6 flex justify-center gap-3.5">
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-gold/35 bg-brill-700 p-4.5">
                    <div className="flex items-center justify-center gap-1.5 text-[32px] font-black text-gold">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="#f7c325" stroke="#f7c325" strokeWidth={1.4} strokeLinejoin="round">
                        <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12z" />
                      </svg>
                      {PRICE_CHARTS_LESSON_XP}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">XP earned</div>
                  </div>
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-blue/35 bg-brill-700 p-4.5">
                    <div className="text-[32px] font-black text-blue">{RECAP_ITEMS.length}</div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">concepts mastered</div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {RECAP_ITEMS.map((t) => (
                    <div key={t} className="flex items-center gap-1.5 rounded-full border border-border bg-brill-700 px-3.5 py-2 text-[13px] text-[#ccc]">
                      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-border-subtle bg-brill-800/70 px-4 py-4 backdrop-blur-md md:px-6">
        <div className="text-[13px] font-semibold text-text-muted">
          {step === TOTAL_STEPS ? "Lesson complete" : `Section ${step + 1} of ${TOTAL_STEPS + 1}`}
        </div>
        <div className="flex items-center gap-3">
          <button
            ref={ctaRef}
            type="button"
            onClick={goNext}
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
