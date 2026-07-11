"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { useScrollCtaIntoView } from "@/lib/hooks/useScrollCtaIntoView";
import { geo, type CandleGeo } from "./geometry";
import { MEANING_LESSON_SLUG, MEANING_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  MCQ_QUESTION,
  MOMENTUM_CANDLES,
  MOMENTUM_ANS,
  MOMENTUM_CORRECT_TEXT,
  MOMENTUM_WRONG_TEXT,
  WICK_MEANING,
  PREDICT_ROUNDS,
  SIGNAL_CARDS,
  IDENTIFY_ROUNDS,
  CONTEXT_INFO,
  MATCH_PAIRS,
  MATCH_RIGHT_ORDER,
  BUILD_HAMMER_INITIAL,
  BUILD_HAMMER_STORY,
  FINAL_SPOT_ROUNDS,
  RECAP_ITEMS,
  type WickKey,
  type SignalId,
  type ContextMode,
  type PredictAns,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";

type Feedback = { ok: boolean; text: string } | null;

type LessonState = {
  step: number;
  xp: number;
  battle: { val: number; buy: boolean; sell: boolean };
  mcq: { picked: number | null; ok: boolean; wrongSet: Record<number, boolean> };
  conviction: { pct: number; strongSeen: boolean };
  momentum: { ok: boolean; wrongIdx: number | null; okIdx: number | null; fb: Feedback };
  wick: { active: WickKey | null; seen: Partial<Record<WickKey, boolean>>; awarded: Partial<Record<WickKey, boolean>> };
  predict: { round: number; fb: Feedback };
  signals: { active: SignalId | null; awarded: Partial<Record<SignalId, boolean>> };
  identify: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
  context: { mode: ContextMode | null; seen: Partial<Record<ContextMode, boolean>> };
  match: { picked: { side: "L" | "R"; id: SignalId } | null; matched: Partial<Record<SignalId, boolean>>; wrong: [SignalId, SignalId] | null };
  buildHammer: { o: number; h: number; l: number; c: number; done: boolean };
  finalSpot: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
};

const initialState: LessonState = {
  step: 0,
  xp: 0,
  battle: { val: 50, buy: false, sell: false },
  mcq: { picked: null, ok: false, wrongSet: {} },
  conviction: { pct: 20, strongSeen: false },
  momentum: { ok: false, wrongIdx: null, okIdx: null, fb: null },
  wick: { active: null, seen: {}, awarded: {} },
  predict: { round: 0, fb: null },
  signals: { active: null, awarded: {} },
  identify: { round: 0, fb: null, wrongIdx: null, okIdx: null },
  context: { mode: null, seen: {} },
  match: { picked: null, matched: {}, wrong: null },
  buildHammer: { ...BUILD_HAMMER_INITIAL },
  finalSpot: { round: 0, fb: null, wrongIdx: null, okIdx: null },
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

function BulbIcon({ size = 18, color = "#f7c325" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.6 4.6 0 0 1 8.91 14" />
    </svg>
  );
}

/* ---------- shared candle SVG bits ---------- */

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

function beginPercentSlide(onChange: (v: number) => void) {
  return (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const update = (clientX: number) => {
      const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange(Math.round(t * 100));
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

export function WhatCandlesTellYouLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const floaterId = useRef(0);
  const matchOrderRef = useRef<SignalId[] | null>(null);
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

  function matchOrder(): SignalId[] {
    if (!matchOrderRef.current) matchOrderRef.current = MATCH_RIGHT_ORDER;
    return matchOrderRef.current;
  }

  function canContinue(): boolean {
    switch (step) {
      case 2:
        return state.mcq.ok;
      case 4:
        return state.momentum.ok;
      case 6:
        return state.predict.round >= PREDICT_ROUNDS.length;
      case 8:
        return state.identify.round >= IDENTIFY_ROUNDS.length;
      case 10:
        return Object.keys(state.match.matched).length === MATCH_PAIRS.length;
      case 11:
        return state.buildHammer.done;
      case 12:
        return state.finalSpot.round >= FINAL_SPOT_ROUNDS.length;
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
      completeLesson({ lessonSlug: MEANING_LESSON_SLUG, score: 100, xpEarned: MEANING_LESSON_XP });
    }
  }

  function restart() {
    matchOrderRef.current = null;
    setState(initialState);
  }

  /* ---------- handlers ---------- */

  function setBattle(v: number) {
    const prev = state.battle;
    const wasBull = prev.val > 50;
    const isBull = v > 50;
    if (isBull !== wasBull && v !== 50) sound.tick();
    const next = { ...prev, val: v };
    let give = 0;
    if (v >= 75 && !next.buy) {
      next.buy = true;
      give += 10;
    }
    if (v <= 25 && !next.sell) {
      next.sell = true;
      give += 10;
    }
    setState((s) => ({ ...s, battle: next }));
    if (give) award(give);
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

  function setConviction(v: number) {
    const next = { ...state.conviction, pct: v };
    let give = 0;
    if (v >= 82 && !next.strongSeen) {
      next.strongSeen = true;
      give = 10;
    }
    setState((s) => ({ ...s, conviction: next }));
    if (give) award(give);
    else sound.tick();
  }

  function tapMomentum(i: number) {
    if (state.momentum.ok) return;
    if (i === MOMENTUM_ANS) {
      setState((s) => ({ ...s, momentum: { ok: true, okIdx: i, wrongIdx: null, fb: { ok: true, text: MOMENTUM_CORRECT_TEXT } } }));
      award(20, { burst: 70 });
    } else {
      sound.wrong();
      setState((s) => ({ ...s, momentum: { ok: false, wrongIdx: i, okIdx: null, fb: { ok: false, text: MOMENTUM_WRONG_TEXT } } }));
      window.setTimeout(() => setState((s) => ({ ...s, momentum: { ...s.momentum, wrongIdx: null } })), 500);
    }
  }

  function tapWick(id: WickKey) {
    sound.tick();
    const already = !!state.wick.awarded[id];
    setState((s) => ({
      ...s,
      wick: { active: id, seen: { ...s.wick.seen, [id]: true }, awarded: already ? s.wick.awarded : { ...s.wick.awarded, [id]: true } },
    }));
    if (!already) award(5, { silent: true });
  }

  function answerPredict(kind: PredictAns) {
    const r = PREDICT_ROUNDS[state.predict.round];
    if (!r) return;
    if (kind === r.ans) {
      const next = state.predict.round + 1;
      setState((s) => ({ ...s, predict: { round: s.predict.round, fb: { ok: true, text: r.hint } } }));
      award(20);
      window.setTimeout(() => setState((s) => ({ ...s, predict: { round: next, fb: null } })), 1300);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, predict: { ...s.predict, fb: { ok: false, text: "Not quite — " + r.hint } } }));
    }
  }

  function tapSignal(id: SignalId) {
    sound.tick();
    const already = !!state.signals.awarded[id];
    setState((s) => ({ ...s, signals: { active: id, awarded: already ? s.signals.awarded : { ...s.signals.awarded, [id]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function tapIdentify(idx: number) {
    const r = IDENTIFY_ROUNDS[state.identify.round];
    if (!r || state.identify.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.identify.round + 1;
      setState((s) => ({ ...s, identify: { ...s.identify, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === IDENTIFY_ROUNDS.length ? { burst: 70 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, identify: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1300);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, identify: { ...s.identify, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, identify: { ...s.identify, wrongIdx: null } })), 500);
    }
  }

  function setContextMode(mode: ContextMode) {
    sound.tick();
    const already = !!state.context.seen[mode];
    setState((s) => ({ ...s, context: { mode, seen: already ? s.context.seen : { ...s.context.seen, [mode]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function pickMatchCard(side: "L" | "R", id: SignalId) {
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
      const wrong: [SignalId, SignalId] = [st.picked.id, id];
      setState((s) => ({ ...s, match: { ...s.match, picked: null, wrong } }));
      window.setTimeout(() => setState((s) => ({ ...s, match: { ...s.match, wrong: null } })), 480);
    }
  }

  function setBuildHammer(key: "o" | "h" | "l" | "c", v: number) {
    const next = { ...state.buildHammer, [key]: v };
    const bull = next.c >= next.o;
    const body = Math.abs(next.c - next.o);
    const bodyTop = Math.max(next.o, next.c);
    const bodyBot = Math.min(next.o, next.c);
    const upper = next.h - bodyTop;
    const lower = bodyBot - next.l;
    const allDone = bull && body <= 14 && bodyBot >= 58 && lower >= 26 && upper <= 10;
    if (allDone && !next.done) {
      next.done = true;
      setState((s) => ({ ...s, buildHammer: next }));
      award(40, { burst: 90 });
      return;
    }
    if (!allDone) next.done = false;
    setState((s) => ({ ...s, buildHammer: next }));
    sound.tick();
  }

  function tapFinalSpot(idx: number) {
    const r = FINAL_SPOT_ROUNDS[state.finalSpot.round];
    if (!r || state.finalSpot.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.finalSpot.round + 1;
      setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === FINAL_SPOT_ROUNDS.length ? { burst: 80 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, finalSpot: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1300);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, wrongIdx: null } })), 500);
    }
  }

  /* ---------- derived geometry ---------- */

  const battleGeo = geo(50, 88, 14, state.battle.val, 220, 280, 60, 26);
  const battleOpenY = +(26 + (1 - 50 / 100) * 228).toFixed(1);
  const battleBullish = state.battle.val > 50;
  const battleBearish = state.battle.val < 50;

  const convClose = 50 + state.conviction.pct * 0.44;
  const convGeo = geo(50, convClose + 6, 44, convClose, 200, 280, 60, 24);
  let convTier: { label: string; desc: string; color: string; bg: string; border: string };
  if (state.conviction.pct < 25) {
    convTier = {
      label: "Weak / hesitant",
      desc: "A tiny body. Buyers barely edged ahead — the move lacks conviction and could easily reverse.",
      color: "#94a3b8",
      bg: "rgba(148,163,184,.08)",
      border: "rgba(148,163,184,.3)",
    };
  } else if (state.conviction.pct < 62) {
    convTier = {
      label: "Moderate push",
      desc: "A healthy body. Buyers were clearly in control, but not overwhelmingly so.",
      color: "#88c9f7",
      bg: "rgba(136,201,247,.08)",
      border: "rgba(136,201,247,.3)",
    };
  } else {
    convTier = {
      label: "Strong conviction",
      desc: "A long, dominant body. Buyers steamrolled the session — powerful, decisive momentum.",
      color: "#22c55e",
      bg: "rgba(34,197,94,.1)",
      border: "rgba(34,197,94,.35)",
    };
  }

  const wickGeo = geo(38, 90, 12, 64, 200, 320, 60, 24);
  const predictRound = PREDICT_ROUNDS[Math.min(state.predict.round, PREDICT_ROUNDS.length - 1)]!;
  const predictGeo = geo(predictRound.o, predictRound.h, predictRound.l, predictRound.c, 150, 260, 46, 20);
  const activeSignal = SIGNAL_CARDS.find((s) => s.id === state.signals.active) ?? null;
  const identifyRound = IDENTIFY_ROUNDS[Math.min(state.identify.round, IDENTIFY_ROUNDS.length - 1)]!;

  const ctxKey = state.context.mode ?? "none";
  const ctxInfo = CONTEXT_INFO[ctxKey];
  const ctxGeo = geo(ctxInfo.candle.o, ctxInfo.candle.h, ctxInfo.candle.l, ctxInfo.candle.c, 360, 240, 24, 20);
  const ctxLineY = (p: number) => +(20 + (1 - p / 100) * 200).toFixed(1);
  const ctxXs = [10, 54, 98, 142, 186, 230, 274];
  const ctxLinePoints = ctxInfo.series.map((p, i) => `${ctxXs[i]},${ctxLineY(p)}`).join(" ");

  const matchedCount = Object.keys(state.match.matched).length;

  const buildGeo = geo(state.buildHammer.o, state.buildHammer.h, state.buildHammer.l, state.buildHammer.c, 200, 320, 60, 20);
  const buildBull = state.buildHammer.c >= state.buildHammer.o;
  const buildBody = Math.abs(state.buildHammer.c - state.buildHammer.o);
  const buildBodyTop = Math.max(state.buildHammer.o, state.buildHammer.c);
  const buildBodyBot = Math.min(state.buildHammer.o, state.buildHammer.c);
  const buildUpper = state.buildHammer.h - buildBodyTop;
  const buildLower = buildBodyBot - state.buildHammer.l;

  const finalSpotRound = FINAL_SPOT_ROUNDS[Math.min(state.finalSpot.round, FINAL_SPOT_ROUNDS.length - 1)]!;

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
            {step === 0 && (
              <div className="mx-auto max-w-[760px] text-center">
                <svg width={240} height={200} viewBox="0 0 240 200" className="mx-auto mb-5 block">
                  <motion.line
                    x1={46}
                    y1={40}
                    x2={46}
                    y2={150}
                    stroke="#ef4444"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  />
                  <motion.rect
                    x={30}
                    y={70}
                    width={32}
                    height={46}
                    rx={6}
                    fill="#ef4444"
                    style={{ transformOrigin: "46px 116px" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.line
                    x1={120}
                    y1={24}
                    x2={120}
                    y2={70}
                    stroke="#22c55e"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  />
                  <motion.rect
                    x={104}
                    y={70}
                    width={32}
                    height={92}
                    rx={6}
                    fill="#22c55e"
                    style={{ transformOrigin: "120px 162px" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.line
                    x1={120}
                    y1={162}
                    x2={120}
                    y2={182}
                    stroke="#22c55e"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  />
                  <motion.line
                    x1={194}
                    y1={30}
                    x2={194}
                    y2={150}
                    stroke="#22c55e"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                  <motion.rect
                    x={178}
                    y={120}
                    width={32}
                    height={24}
                    rx={6}
                    fill="#22c55e"
                    style={{ transformOrigin: "194px 144px" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </svg>
                <div className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-blue-light">WHAT CANDLES TELL YOU</div>
                <h1 className="mb-3.5 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[40px]">
                  A candle isn&apos;t just a shape.
                  <br />
                  It&apos;s a battle.
                </h1>
                <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-relaxed text-text-secondary">
                  You already know a candle&apos;s parts. Now learn what they <i>mean</i> — who was winning, who fought back, and what the
                  market might do next. Learn a little, then read one yourself.
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { icon: <path d="M3 17 9 11l4 4 8-8M15 7h6v6" />, label: "Momentum" },
                    { icon: <path d="M12 3v6m-4-2 4-4 4 4M6 21h12" />, label: "Rejection" },
                    { icon: <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />, label: "Named signals" },
                    { icon: <path d="M3 12h4l3 8 4-16 3 8h4" />, label: "Context" },
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
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · BUYERS vs SELLERS</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Every candle is a tug-of-war</h2>
                <p className="mx-auto mb-5.5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Buyers push price up, sellers push it down. Whoever wins by the close decides the candle&apos;s colour — and how far
                  they win by decides its size. Drag the rope.
                </p>
                <div className="grid items-center gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[260px_1fr]">
                  <div>
                    <svg width={220} height={280} viewBox="0 0 220 280" className="mx-auto block" style={{ overflow: "visible" }}>
                      <line x1={14} y1={battleOpenY} x2={206} y2={battleOpenY} stroke="#666" strokeWidth={1.4} strokeDasharray="5 5" />
                      <text x={16} y={battleOpenY - 6} fill="#999" fontSize={11} fontWeight={700}>
                        OPEN
                      </text>
                      <CandleShape g={{ ...battleGeo, cx: 110, bodyX: 80, bw: 60 }} wickWidth={5} />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs font-extrabold">
                      <span className="text-[#22c55e]">BUYERS</span>
                      <span className="text-[#ef4444]">SELLERS</span>
                    </div>
                    <div className="relative mb-3.5 flex h-[18px] overflow-hidden rounded-[9px]">
                      <div className="h-full transition-all duration-100" style={{ width: `${state.battle.val}%`, background: "linear-gradient(90deg,#15803d,#22c55e)" }} />
                      <div className="h-full flex-1 transition-all duration-100" style={{ background: "linear-gradient(90deg,#ef4444,#991b1b)" }} />
                    </div>
                    <div className="mb-2 text-[13px] font-bold text-text-secondary">DRAG THE ROPE</div>
                    <div
                      onPointerDown={beginPercentSlide(setBattle)}
                      className="relative mb-4.5 flex h-[26px] cursor-grab touch-none select-none items-center"
                    >
                      <div className="absolute left-0 right-0 h-2.5 rounded-md bg-brill-600" />
                      <div
                        className="absolute flex h-[28px] w-[28px] items-center justify-center rounded-full border-[3px] border-blue bg-white shadow-[0_2px_10px_rgba(0,0,0,.5),0_0_16px_rgba(69,109,255,.5)]"
                        style={{ left: `${state.battle.val}%`, transform: "translateX(-14px)" }}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#456dff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                          <path d="m9 18-6-6 6-6" />
                          <path d="m15 6 6 6-6 6" />
                        </svg>
                      </div>
                    </div>
                    <div className="mb-3.5 flex gap-2.5">
                      <div className={`flex-1 rounded-xl border px-3.5 py-3 transition-all ${state.battle.buy ? "border-blue/60 bg-blue-bgDark" : "border-border bg-brill-700"}`}>
                        <div className="flex items-center gap-2">
                          {state.battle.buy ? <CheckIcon color="#88c9f7" size={18} /> : <OpenCircleIcon size={18} />}
                          <span className="text-[12.5px] font-bold text-white">Let buyers dominate</span>
                        </div>
                      </div>
                      <div className={`flex-1 rounded-xl border px-3.5 py-3 transition-all ${state.battle.sell ? "border-blue/60 bg-blue-bgDark" : "border-border bg-brill-700"}`}>
                        <div className="flex items-center gap-2">
                          {state.battle.sell ? <CheckIcon color="#88c9f7" size={18} /> : <OpenCircleIcon size={18} />}
                          <span className="text-[12.5px] font-bold text-white">Let sellers dominate</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border-subtle bg-brill-700 px-3.5 py-3 text-[13px] leading-relaxed text-[#ccc]">
                      <b style={{ color: battleGeo.color }}>{battleBullish ? "BUYERS WIN" : battleBearish ? "SELLERS WIN" : "DEAD EVEN"}</b>{" "}
                      —{" "}
                      {battleBullish
                        ? "close finished above the open — a green candle. Push further for a bigger win."
                        : battleBearish
                          ? "close finished below the open — a red candle. Push further for a bigger win."
                          : "open equals close: a doji. Nobody won this round."}
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
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · BODY SIZE = CONVICTION</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">A bigger body means a stronger push</h2>
                <p className="mx-auto mb-5.5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Colour tells you <i>who</i> won. Body size tells you <i>by how much</i>. A long body is a confident, one-sided move; a
                  tiny body is a hesitant, near-even fight. Grow the body.
                </p>
                <div className="grid items-center gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[260px_1fr]">
                  <div className="flex justify-center">
                    <svg width={200} height={280} viewBox="0 0 200 280" style={{ overflow: "visible" }}>
                      <CandleShape g={{ ...convGeo, cx: 100, bodyX: 70, bw: 60 }} wickWidth={5} />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-2 text-[13px] font-bold text-text-secondary">DRAG TO GROW THE BODY</div>
                    <div
                      onPointerDown={beginPercentSlide(setConviction)}
                      className="relative mb-5 flex h-[26px] cursor-grab touch-none select-none items-center"
                    >
                      <div className="absolute left-0 right-0 h-2.5 rounded-md bg-brill-600" />
                      <div
                        className="absolute left-0 h-2.5 rounded-md"
                        style={{ width: `${state.conviction.pct}%`, background: "linear-gradient(90deg,#15803d,#22c55e)" }}
                      />
                      <div
                        className="absolute h-[26px] w-[26px] rounded-full border-[3px] border-[#22c55e] bg-white shadow-[0_2px_10px_rgba(0,0,0,.5)]"
                        style={{ left: `${state.conviction.pct}%`, transform: "translateX(-13px)" }}
                      />
                    </div>
                    <div
                      key={convTier.label}
                      className="animate-pop-in rounded-2xl border px-[18px] py-4"
                      style={{ background: convTier.bg, borderColor: convTier.border }}
                    >
                      <div className="mb-0.5 text-lg font-black" style={{ color: convTier.color }}>
                        {convTier.label}
                      </div>
                      <div className="text-[13.5px] leading-relaxed text-[#ccc]">{convTier.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · READ THE MOMENTUM</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Which candle shows the strongest buying?</h2>
                <p className="mb-5.5 text-[15px] text-text-secondary">Biggest green body = most conviction. Tap it.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {MOMENTUM_CANDLES.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 84, 200, 34, 16);
                    const ok = state.momentum.okIdx === i;
                    const wrong = state.momentum.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapMomentum(i)}
                        className={`cursor-pointer rounded-[18px] border-2 bg-black px-2 py-4 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={84} height={200} viewBox="0 0 84 200">
                          <CandleShape g={{ ...g, cx: 42, bodyX: g.bodyX, bw: 34 }} wickWidth={5} bodyRx={6} />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4.5 min-h-[48px]">
                  <FeedbackBanner center fb={state.momentum.fb} />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · WICKS ARE REJECTION</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">A long wick means someone fought back — hard</h2>
                <p className="mx-auto mb-5.5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Price reached that extreme, then got shoved away before the close. The longer the wick, the more forceful the
                  rejection. Tap each wick to see who did the shoving.
                </p>
                <div className="grid items-center gap-6 rounded-[22px] border border-border bg-black p-6 md:grid-cols-[240px_1fr]">
                  <div className="flex justify-center">
                    <svg width={200} height={320} viewBox="0 0 200 320" style={{ overflow: "visible" }}>
                      <rect
                        onClick={() => tapWick("upper")}
                        x={45}
                        y={wickGeo.upY1 - 4}
                        width={110}
                        height={Math.max(10, wickGeo.upY2 - wickGeo.upY1 + 8)}
                        rx={7}
                        fill={state.wick.active === "upper" ? "rgba(69,109,255,.2)" : "rgba(255,255,255,.02)"}
                        stroke={state.wick.active === "upper" ? "#456dff" : "rgba(255,255,255,.16)"}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        style={{ cursor: "pointer", transition: "all .2s" }}
                      />
                      <rect
                        onClick={() => tapWick("lower")}
                        x={45}
                        y={wickGeo.loY1 - 4}
                        width={110}
                        height={Math.max(10, wickGeo.loY2 - wickGeo.loY1 + 8)}
                        rx={7}
                        fill={state.wick.active === "lower" ? "rgba(69,109,255,.2)" : "rgba(255,255,255,.02)"}
                        stroke={state.wick.active === "lower" ? "#456dff" : "rgba(255,255,255,.16)"}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        style={{ cursor: "pointer", transition: "all .2s" }}
                      />
                      <g style={{ pointerEvents: "none" }}>
                        <line x1={100} y1={wickGeo.upY1} x2={100} y2={wickGeo.upY2} stroke="#22c55e" strokeWidth={6} strokeLinecap="round" />
                        <line x1={100} y1={wickGeo.loY1} x2={100} y2={wickGeo.loY2} stroke="#22c55e" strokeWidth={6} strokeLinecap="round" />
                        <rect x={70} y={wickGeo.bodyY} width={60} height={wickGeo.bodyH} rx={8} fill="#22c55e" />
                      </g>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className={`rounded-2xl border px-[17px] py-[15px] transition-all ${state.wick.active === "upper" ? "border-blue/50" : "border-border-subtle"} bg-brill-700`}>
                      <div className="mb-0.5 flex items-center gap-2 text-sm font-extrabold text-white">
                        <span className="h-[9px] w-[9px] rounded-full bg-blue-light" />
                        Upper wick
                      </div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">
                        {state.wick.seen.upper ? WICK_MEANING.upper : "Tap the wick above the body to reveal who fought back."}
                      </div>
                    </div>
                    <div className={`rounded-2xl border px-[17px] py-[15px] transition-all ${state.wick.active === "lower" ? "border-blue/50" : "border-border-subtle"} bg-brill-700`}>
                      <div className="mb-0.5 flex items-center gap-2 text-sm font-extrabold text-white">
                        <span className="h-[9px] w-[9px] rounded-full bg-blue-light" />
                        Lower wick
                      </div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">
                        {state.wick.seen.lower ? WICK_MEANING.lower : "Tap the wick below the body to reveal who fought back."}
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-2xl border border-blue/20 bg-[#0d0d0d] px-4 py-3.5 text-[13px] leading-relaxed text-[#cdd]">
                      <BulbIcon />
                      <span>Rejection often flips momentum — the side that fought back is taking control.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="mx-auto max-w-[640px] text-center">
                <SectionEyebrow tone="gold">
                  CHALLENGE · PREDICT THE NEXT MOVE · ROUND {Math.min(state.predict.round + 1, PREDICT_ROUNDS.length)}/{PREDICT_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">What happens next?</h2>
                <p className="mb-5 text-[15px] text-text-secondary">Who just grabbed control? Where does momentum lean?</p>
                <div className="mb-5.5 flex justify-center">
                  <div key={state.predict.round} className="animate-pop-in rounded-[20px] border border-border bg-black px-10 py-5.5">
                    <svg width={150} height={260} viewBox="0 0 150 260">
                      <CandleShape g={{ ...predictGeo, cx: 75, bodyX: predictGeo.bodyX, bw: 46 }} wickWidth={5} bodyRx={7} />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => answerPredict("up")}
                    className="flex max-w-[230px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17 9 11l4 4 8-8" />
                      <path d="M15 7h6v6" />
                    </svg>
                    Bounce up
                  </button>
                  <button
                    type="button"
                    onClick={() => answerPredict("down")}
                    className="flex max-w-[230px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7 9 13l4-4 8 8" />
                      <path d="M15 17h6v-6" />
                    </svg>
                    Drop down
                  </button>
                </div>
                <div className="mt-4.5 min-h-[52px]">
                  <FeedbackBanner center fb={state.predict.fb} />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="mx-auto max-w-[900px]">
                <SectionEyebrow>LEARN · THE NAMED SIGNALS</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Four shapes worth knowing by name</h2>
                <p className="mx-auto mb-4.5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Traders gave the most telling candles names. Tap each to learn its story.
                </p>
                <div className="mb-4.5 flex flex-wrap justify-center gap-3.5">
                  {SIGNAL_CARDS.map((sig) => {
                    const g = geo(sig.o, sig.h, sig.l, sig.c, 70, 160, 30, 14);
                    const on = state.signals.active === sig.id;
                    return (
                      <button
                        key={sig.id}
                        type="button"
                        onClick={() => tapSignal(sig.id)}
                        className={`w-[160px] rounded-[18px] border-2 bg-black px-2.5 pb-3.5 pt-4 transition-all hover:-translate-y-1 ${on ? "border-gold" : "border-border"}`}
                      >
                        <svg width={70} height={160} viewBox="0 0 70 160" className="mx-auto mb-2 block">
                          <CandleShape g={{ ...g, cx: 35, bodyX: g.bodyX, bw: 30 }} wickWidth={5} bodyRx={5} />
                        </svg>
                        <div className={`text-[13px] font-extrabold ${on ? "text-gold" : "text-[#ccc]"}`}>{sig.name}</div>
                      </button>
                    );
                  })}
                </div>
                <div key={activeSignal?.id ?? "none"} className="mx-auto min-h-[74px] max-w-[600px] animate-pop-in rounded-2xl border border-border-subtle bg-brill-700 px-5 py-4 text-center">
                  <div className="mb-0.5 text-[15px] font-extrabold text-gold">{activeSignal ? activeSignal.title : "Tap a candle to reveal its name"}</div>
                  <div className="text-sm leading-relaxed text-[#ccc]">
                    {activeSignal ? activeSignal.sub : "Each of these shapes carries a specific message about who is winning."}
                  </div>
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">
                  CHALLENGE · NAME THAT CANDLE · ROUND {Math.min(state.identify.round + 1, IDENTIFY_ROUNDS.length)}/{IDENTIFY_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">{identifyRound.prompt}</h2>
                <p className="mb-5.5 text-[15px] text-text-secondary">Tap the one that matches.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {identifyRound.candles.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 84, 180, 34, 16);
                    const ok = state.identify.okIdx === i;
                    const wrong = state.identify.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapIdentify(i)}
                        className={`cursor-pointer rounded-[18px] border-2 bg-black px-2 py-4 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={84} height={180} viewBox="0 0 84 180">
                          <CandleShape g={{ ...g, cx: 42, bodyX: g.bodyX, bw: 34 }} wickWidth={5} bodyRx={6} />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4.5 min-h-[48px]">
                  <FeedbackBanner center fb={state.identify.fb} />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="mx-auto max-w-[900px]">
                <SectionEyebrow>LEARN · CONTEXT CHANGES EVERYTHING</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">The same candle can mean opposite things</h2>
                <p className="mx-auto mb-5.5 max-w-[580px] text-center text-[15px] text-text-secondary">
                  A signal only matters relative to what came before it. See how one hammer-shaped candle reads differently after a fall
                  versus after a climb.
                </p>
                <div className="grid items-center gap-6 rounded-[22px] border border-border bg-black p-6 md:grid-cols-[1fr_320px]">
                  <div className="flex justify-center">
                    <svg width={360} height={240} viewBox="0 0 360 240" style={{ overflow: "visible" }}>
                      <polyline points={ctxLinePoints} fill="none" stroke="rgba(136,201,247,.5)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                      <line x1={320} y1={ctxGeo.upY1} x2={320} y2={ctxGeo.upY2} stroke={ctxGeo.color} strokeWidth={7} strokeLinecap="round" />
                      <line x1={320} y1={ctxGeo.loY1} x2={320} y2={ctxGeo.loY2} stroke={ctxGeo.color} strokeWidth={7} strokeLinecap="round" />
                      <rect x={308} y={ctxGeo.bodyY} width={24} height={ctxGeo.bodyH} rx={5} fill={ctxGeo.color} />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContextMode("bottom")}
                        className={`flex-1 rounded-[11px] border-2 py-2.5 text-[13px] font-extrabold transition-all ${
                          state.context.mode === "bottom" ? "border-blue bg-blue-bgDark text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                        }`}
                      >
                        After a fall
                      </button>
                      <button
                        type="button"
                        onClick={() => setContextMode("top")}
                        className={`flex-1 rounded-[11px] border-2 py-2.5 text-[13px] font-extrabold transition-all ${
                          state.context.mode === "top" ? "border-blue bg-blue-bgDark text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                        }`}
                      >
                        After a climb
                      </button>
                    </div>
                    <div key={ctxKey} className="min-h-[120px] animate-pop-in rounded-2xl border border-border-subtle bg-brill-700 px-[18px] py-4">
                      <div className="mb-1.5 text-base font-black text-gold">{ctxInfo.title}</div>
                      <div className="text-[13.5px] leading-relaxed text-[#ccc]">{ctxInfo.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow tone="gold">CHALLENGE · SIGNAL → MEANING</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Match each signal to what it&apos;s telling you</h2>
                <p className="mb-6 text-center text-[15px] text-text-secondary">
                  Tap a candle, then tap the meaning that fits it. {matchedCount} of {MATCH_PAIRS.length} matched.
                </p>
                <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
                  <div className="flex flex-col gap-3">
                    {MATCH_PAIRS.map((p) => {
                      const g = geo(p.o, p.h, p.l, p.c, 46, 82, 22, 9);
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
                          <svg width={46} height={82} viewBox="0 0 46 82" className="shrink-0">
                            <CandleShape g={{ ...g, cx: 23, bodyX: g.bodyX, bw: 22 }} wickWidth={4} bodyRx={4} />
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
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Build a hammer</h2>
                <p className="mb-5 text-center text-[15px] text-text-secondary">
                  &quot;{BUILD_HAMMER_STORY}&quot; Move the sliders until every check turns blue.
                </p>
                <div className="grid gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[260px_1fr]">
                  <div className="flex items-center justify-center">
                    <svg width={200} height={320} viewBox="0 0 200 320" style={{ overflow: "visible" }}>
                      <line x1={10} y1={20} x2={190} y2={20} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <line x1={10} y1={160} x2={190} y2={160} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <line x1={10} y1={300} x2={190} y2={300} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <CandleShape g={buildGeo} wickWidth={6} />
                    </svg>
                  </div>
                  <div>
                    {(
                      [
                        { k: "h" as const, name: "High", fill: "linear-gradient(90deg,#3860be,#88c9f7)", thumb: "#88c9f7" },
                        { k: "o" as const, name: "Open", fill: "linear-gradient(90deg,#4a4a4a,#999)", thumb: "#999" },
                        { k: "c" as const, name: "Close", fill: "linear-gradient(90deg,#3860be,#456dff)", thumb: "#456dff" },
                        { k: "l" as const, name: "Low", fill: "linear-gradient(90deg,#4a4a4a,#94a3b8)", thumb: "#94a3b8" },
                      ] as const
                    ).map((sl) => (
                      <div key={sl.k} className="mb-4">
                        <div className="mb-1.5 flex justify-between text-xs font-bold">
                          <span className="text-[#ccc]">{sl.name}</span>
                          <span className="font-mono text-[#ccc]">{state.buildHammer[sl.k]}</span>
                        </div>
                        <div
                          onPointerDown={beginPercentSlide((v) => setBuildHammer(sl.k, v))}
                          className="relative flex h-[22px] cursor-grab touch-none select-none items-center"
                        >
                          <div className="absolute left-0 right-0 h-2 rounded-md bg-brill-600" />
                          <div className="absolute left-0 h-2 rounded-md" style={{ width: `${state.buildHammer[sl.k]}%`, background: sl.fill }} />
                          <div
                            className="absolute h-[22px] w-[22px] rounded-full border-[3px] bg-white shadow-[0_2px_8px_rgba(0,0,0,.5)]"
                            style={{ left: `${state.buildHammer[sl.k]}%`, borderColor: sl.thumb, transform: "translateX(-11px)" }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="mt-4.5 flex flex-col gap-2">
                      {[
                        { label: "Small body near the top", ok: buildBody <= 14 && buildBodyBot >= 58 && buildBull },
                        { label: "Long lower wick", ok: buildLower >= 26 },
                        { label: "Little to no upper wick", ok: buildUpper <= 10 },
                      ].map((ck) => (
                        <div
                          key={ck.label}
                          className={`flex items-center gap-2.5 rounded-[11px] border px-3.5 py-2.5 transition-all ${ck.ok ? "border-blue/50 bg-blue-bgDark" : "border-border-subtle bg-brill-700"}`}
                        >
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
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">
                  FINAL CHALLENGE · ROUND {Math.min(state.finalSpot.round + 1, FINAL_SPOT_ROUNDS.length)}/{FINAL_SPOT_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">{finalSpotRound.prompt}</h2>
                <p className="mb-5.5 text-[15px] text-text-secondary">Read the story, then tap.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {finalSpotRound.candles.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 84, 180, 34, 16);
                    const ok = state.finalSpot.okIdx === i;
                    const wrong = state.finalSpot.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapFinalSpot(i)}
                        className={`cursor-pointer rounded-[18px] border-2 bg-black px-2 py-4 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={84} height={180} viewBox="0 0 84 180">
                          <CandleShape g={{ ...g, cx: 42, bodyX: g.bodyX, bw: 34 }} wickWidth={5} bodyRx={6} />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4.5 min-h-[48px]">
                  <FeedbackBanner center fb={state.finalSpot.fb} />
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
                  <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx={12} cy={12} r={3} fill="#fff" stroke="none" />
                  </svg>
                </motion.div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-gold">BADGE UNLOCKED</div>
                <h1 className="mb-1.5 text-[32px] font-black sm:text-[34px]">Candle Reader</h1>
                <p className="mb-6 text-base text-text-secondary">
                  You can read the story behind the shape. You&apos;ve finished Candlestick Essentials — patterns come next.
                </p>
                <div className="mb-6 flex justify-center gap-3.5">
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-gold/35 bg-brill-700 p-4.5">
                    <div className="flex items-center justify-center gap-1.5 text-[32px] font-black text-gold">
                      <svg width={24} height={24} viewBox="0 0 24 24" fill="#f7c325" stroke="#f7c325" strokeWidth={1.4} strokeLinejoin="round">
                        <path d="M13 2 4.5 13.5H11l-1 8.5 9-12H12z" />
                      </svg>
                      {MEANING_LESSON_XP}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">XP earned</div>
                  </div>
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-blue/35 bg-brill-700 p-4.5">
                    <div className="text-[32px] font-black text-blue">5</div>
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
      <footer className="relative z-10 flex items-center justify-between border-t border-border-subtle bg-brill-800/70 px-4 py-4 backdrop-blur-md md:px-6">
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
