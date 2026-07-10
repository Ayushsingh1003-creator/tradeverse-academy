"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { candleBodyColor } from "@/lib/candleColors";
import { geo, shuffle, linePoints, type CandleGeo } from "./geometry";
import { INTRO_LESSON_SLUG, INTRO_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  MARKET_START_PRICE,
  MARKET_MIN_PRICE,
  MARKET_MAX_PRICE,
  MCQ_QUESTION,
  RECORD_SERIES,
  UP_DOWN_ROUNDS,
  NC_SAMPLE,
  NC_LABELS,
  NC_CAPTIONS,
  S6_COPY,
  GR_CARDS,
  SPOT_UP_DAY_ROUNDS,
  BUILD_CHART_BARS,
  MATCH_PAIRS,
  SORT_DECK,
  FINAL_SPOT_ROUNDS,
  BADGE_TITLE,
  BADGE_SUBTITLE,
  LESSONS_DONE_LABEL,
  ROADMAP_ITEMS,
  type UpDown,
  type NcMode,
  type GrId,
  type MatchId,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";

type Feedback = { ok: boolean; text: string } | null;

type LessonState = {
  step: number;
  xp: number;
  market: { price: number; hist: number[]; last: number; boughtSeen: boolean; soldSeen: boolean };
  mcq: { picked: number | null; ok: boolean; wrongSet: Record<number, boolean> };
  record: { revealed: number; done: boolean };
  upDown: { round: number; fb: Feedback };
  numberCandle: { mode: NcMode; awarded: Partial<Record<NcMode, boolean>> };
  showsMore: { ok: boolean; okKey: "b" | null; wrongKey: "a" | null; fb: Feedback };
  greenRed: { awarded: Partial<Record<GrId, boolean>> };
  spotUpDay: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
  buildChart: { shown: number; done: boolean };
  match: { picked: { side: "L" | "R"; id: MatchId } | null; matched: Partial<Record<MatchId, boolean>>; wrong: [MatchId, MatchId] | null };
  sort: { idx: number; wrong: boolean; fb: Feedback };
  finalSpot: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
};

const initialState: LessonState = {
  step: 0,
  xp: 0,
  market: { price: MARKET_START_PRICE, hist: [MARKET_START_PRICE], last: 0, boughtSeen: false, soldSeen: false },
  mcq: { picked: null, ok: false, wrongSet: {} },
  record: { revealed: 1, done: false },
  upDown: { round: 0, fb: null },
  numberCandle: { mode: "number", awarded: {} },
  showsMore: { ok: false, okKey: null, wrongKey: null, fb: null },
  greenRed: { awarded: {} },
  spotUpDay: { round: 0, fb: null, wrongIdx: null, okIdx: null },
  buildChart: { shown: 1, done: false },
  match: { picked: null, matched: {}, wrong: null },
  sort: { idx: 0, wrong: false, fb: null },
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

function UpIcon({ color = "#22c55e", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function DownIcon({ color = "#ef4444", size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12l7 7 7-7" />
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

/* ================================================================== */

export function IntroductionToCandlestickEssentialsLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const floaterId = useRef(0);
  const matchOrderRef = useRef<MatchId[] | null>(null);

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
        return state.upDown.round >= UP_DOWN_ROUNDS.length;
      case 6:
        return state.showsMore.ok;
      case 8:
        return state.spotUpDay.round >= SPOT_UP_DAY_ROUNDS.length;
      case 10:
        return Object.keys(state.match.matched).length === MATCH_PAIRS.length;
      case 11:
        return state.sort.idx >= SORT_DECK.length;
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
      completeLesson({ lessonSlug: INTRO_LESSON_SLUG, score: 100, xpEarned: INTRO_LESSON_XP });
    }
  }

  function restart() {
    matchOrderRef.current = null;
    setState(initialState);
  }

  /* ---------- handlers ---------- */

  function moveMarket(dir: 1 | -1) {
    sound.tick();
    const st = state.market;
    const stepAmt = Math.floor(Math.random() * 4) + 1;
    const price = Math.max(MARKET_MIN_PRICE, Math.min(MARKET_MAX_PRICE, st.price + dir * stepAmt));
    const hist = [...st.hist, price].slice(-24);
    let give = 0;
    let boughtSeen = st.boughtSeen;
    let soldSeen = st.soldSeen;
    if (dir > 0 && !st.boughtSeen) {
      boughtSeen = true;
      give += 5;
    }
    if (dir < 0 && !st.soldSeen) {
      soldSeen = true;
      give += 5;
    }
    setState((s) => ({ ...s, market: { price, hist, last: price - st.price, boughtSeen, soldSeen } }));
    if (give) award(give, { silent: true });
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

  function recordDay() {
    const st = state.record;
    if (st.revealed >= RECORD_SERIES.length) return;
    sound.tick();
    const revealed = st.revealed + 1;
    const done = revealed >= RECORD_SERIES.length;
    const give = done && !st.done ? 10 : 0;
    setState((s) => ({ ...s, record: { revealed, done: done || st.done } }));
    if (give) award(give);
  }

  function answerUpDown(kind: UpDown) {
    const r = UP_DOWN_ROUNDS[state.upDown.round];
    if (!r) return;
    const hint =
      r.ans === "up"
        ? `Today's ₹${r.b} is above yesterday's ₹${r.a} — price went up.`
        : `Today's ₹${r.b} is below yesterday's ₹${r.a} — price went down.`;
    if (kind === r.ans) {
      const next = state.upDown.round + 1;
      setState((s) => ({ ...s, upDown: { round: s.upDown.round, fb: { ok: true, text: hint } } }));
      award(20);
      window.setTimeout(() => setState((s) => ({ ...s, upDown: { round: next, fb: null } })), 1200);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, upDown: { ...s.upDown, fb: { ok: false, text: "Look again — " + hint } } }));
    }
  }

  function setNumberCandle(mode: NcMode) {
    sound.tick();
    const already = !!state.numberCandle.awarded[mode];
    setState((s) => ({ ...s, numberCandle: { mode, awarded: already ? s.numberCandle.awarded : { ...s.numberCandle.awarded, [mode]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function tapShowsMore(key: "a" | "b") {
    if (state.showsMore.ok) return;
    if (key === "b") {
      setState((s) => ({
        ...s,
        showsMore: { ok: true, okKey: "b", wrongKey: null, fb: { ok: true, text: S6_COPY.correctFb } },
      }));
      award(20, { burst: 60 });
    } else {
      sound.wrong();
      setState((s) => ({ ...s, showsMore: { ok: false, okKey: null, wrongKey: "a", fb: { ok: false, text: S6_COPY.wrongFb } } }));
      window.setTimeout(() => setState((s) => ({ ...s, showsMore: { ...s.showsMore, wrongKey: null } })), 500);
    }
  }

  function tapGreenRed(id: GrId) {
    sound.tick();
    const already = !!state.greenRed.awarded[id];
    setState((s) => ({ ...s, greenRed: { awarded: already ? s.greenRed.awarded : { ...s.greenRed.awarded, [id]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function tapSpotUpDay(idx: number) {
    const r = SPOT_UP_DAY_ROUNDS[state.spotUpDay.round];
    if (!r || state.spotUpDay.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.spotUpDay.round + 1;
      setState((s) => ({ ...s, spotUpDay: { ...s.spotUpDay, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === SPOT_UP_DAY_ROUNDS.length ? { burst: 70 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, spotUpDay: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1250);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, spotUpDay: { ...s.spotUpDay, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, spotUpDay: { ...s.spotUpDay, wrongIdx: null } })), 500);
    }
  }

  function addChartCandle() {
    const st = state.buildChart;
    if (st.shown >= BUILD_CHART_BARS.length) return;
    sound.tick();
    const shown = st.shown + 1;
    const done = shown >= BUILD_CHART_BARS.length;
    const give = done && !st.done ? 10 : 0;
    setState((s) => ({ ...s, buildChart: { shown, done: done || st.done } }));
    if (give) award(give);
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

  function sortAnswer(kind: UpDown) {
    const st = state.sort;
    const cur = SORT_DECK[st.idx];
    if (!cur) return;
    const isUp = cur.c >= cur.o;
    const correct = (kind === "up") === isUp;
    if (correct) {
      const next = st.idx + 1;
      const done = next >= SORT_DECK.length;
      setState((s) => ({ ...s, sort: { idx: next, wrong: false, fb: { ok: true, text: isUp ? "Up day — green." : "Down day — red." } } }));
      award(10, done ? { burst: 80 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, sort: { ...s.sort, fb: null } })), 900);
    } else {
      sound.wrong();
      setState((s) => ({
        ...s,
        sort: { ...st, wrong: true, fb: { ok: false, text: isUp ? "That's green — it closed up. Try the Up pile." : "That's red — it closed down. Try the Down pile." } },
      }));
      window.setTimeout(() => setState((s) => ({ ...s, sort: { ...s.sort, wrong: false } })), 500);
    }
  }

  function tapFinalSpot(idx: number) {
    const r = FINAL_SPOT_ROUNDS[state.finalSpot.round];
    if (!r || state.finalSpot.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.finalSpot.round + 1;
      setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === FINAL_SPOT_ROUNDS.length ? { burst: 80 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, finalSpot: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1250);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, finalSpot: { ...s.finalSpot, wrongIdx: null } })), 500);
    }
  }

  /* ---------- derived geometry ---------- */

  const marketChart = linePoints(state.market.hist.length > 1 ? state.market.hist : [state.market.price, state.market.price], 480, 90, 10, 10, 10);

  const recordShown = RECORD_SERIES.slice(0, state.record.revealed);
  const recordChart = linePoints(recordShown.length > 1 ? recordShown : [recordShown[0]!, recordShown[0]!], 500, 220, 40, 14, 40);
  const recordFull = state.record.revealed >= RECORD_SERIES.length;

  const upDownRound = UP_DOWN_ROUNDS[Math.min(state.upDown.round, UP_DOWN_ROUNDS.length - 1)]!;
  const upDownChart = linePoints([upDownRound.a, upDownRound.b], 220, 150, 24, 10, 30);

  const ncGeo = geo(NC_SAMPLE.o, NC_SAMPLE.h, NC_SAMPLE.l, NC_SAMPLE.c, 200, 220, 40, 14);

  const spotUpDayRound = SPOT_UP_DAY_ROUNDS[Math.min(state.spotUpDay.round, SPOT_UP_DAY_ROUNDS.length - 1)]!;

  const buildChartFull = state.buildChart.shown >= BUILD_CHART_BARS.length;
  const buildChartCandles = (() => {
    const N = BUILD_CHART_BARS.length;
    const allV: number[] = [];
    BUILD_CHART_BARS.forEach((b) => allV.push(b.h, b.l));
    const min = Math.min(...allV);
    const max = Math.max(...allV);
    const W = 500,
      H = 230,
      px = 46,
      pt = 16,
      pb = 40,
      bw = 26;
    const X = (i: number) => +(px + (i * (W - 2 * px)) / (N - 1)).toFixed(1);
    const Y = (v: number) => +(pt + (1 - (v - min) / (max - min)) * (H - pt - pb)).toFixed(1);
    return BUILD_CHART_BARS.slice(0, state.buildChart.shown).map((b, i) => {
      const bull = b.c >= b.o;
      const bt = Y(Math.max(b.o, b.c));
      const bb = Y(Math.min(b.o, b.c));
      return {
        x: X(i),
        color: candleBodyColor(bull),
        upY1: Y(b.h),
        upY2: bt,
        loY1: bb,
        loY2: Y(b.l),
        bx: +(X(i) - bw / 2).toFixed(1),
        by: bt,
        bw,
        bh: +Math.max(3, bb - bt).toFixed(1),
      };
    });
  })();

  const matchedCount = Object.keys(state.match.matched).length;
  const matchById: Record<MatchId, (typeof MATCH_PAIRS)[number]> = Object.fromEntries(MATCH_PAIRS.map((p) => [p.id, p])) as Record<
    MatchId,
    (typeof MATCH_PAIRS)[number]
  >;

  const sortIdx = Math.min(state.sort.idx, SORT_DECK.length - 1);
  const sortCurrent = SORT_DECK[sortIdx]!;
  const sortGeo = geo(sortCurrent.o, sortCurrent.h, sortCurrent.l, sortCurrent.c, 120, 200, 60, 16);

  const finalSpotRound = FINAL_SPOT_ROUNDS[Math.min(state.finalSpot.round, FINAL_SPOT_ROUNDS.length - 1)]!;

  const ctaDisabled = !canContinue();
  const ctaLabel = step === 0 ? "Start lesson" : step === TOTAL_STEPS ? "Restart lesson" : step === TOTAL_STEPS - 1 ? "Finish" : "Continue";
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
            {/* ===== S0 WELCOME ===== */}
            {step === 0 && (
              <div className="mx-auto max-w-[760px] text-center">
                <svg width={220} height={160} viewBox="0 0 250 180" className="mx-auto mb-5 block">
                  {[
                    { x: 40, o: 40, h: 30, l: 60, c: 70, bull: false },
                    { x: 90, o: 30, h: 20, l: 55, c: 45, bull: true },
                    { x: 140, o: 20, h: 15, l: 47, c: 35, bull: true },
                    { x: 190, o: 46, h: 40, l: 60, c: 70, bull: false },
                  ].map((cd, i) => (
                    <motion.g key={i}>
                      <motion.line
                        x1={cd.x}
                        y1={cd.h}
                        x2={cd.x}
                        y2={cd.l}
                        stroke={cd.bull ? "#22c55e" : "#ef4444"}
                        strokeWidth={5}
                        strokeLinecap="round"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
                      />
                      <motion.rect
                        x={cd.x - 14}
                        y={Math.min(cd.o, cd.c)}
                        width={28}
                        height={Math.max(6, Math.abs(cd.c - cd.o))}
                        rx={5}
                        fill={cd.bull ? "#22c55e" : "#ef4444"}
                        style={{ transformOrigin: `${cd.x}px ${Math.max(cd.o, cd.c)}px` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: 0.15 + i * 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </motion.g>
                  ))}
                </svg>
                <div className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-blue-light">CANDLESTICK ESSENTIALS · LESSON 1</div>
                <h1 className="mb-3.5 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[40px]">
                  Welcome. Let&apos;s learn
                  <br />
                  to read the market.
                </h1>
                <p className="mx-auto mb-7 max-w-[520px] text-[17px] leading-relaxed text-text-secondary">
                  No experience needed. In a few minutes you&apos;ll understand what those coloured bars actually are — starting from
                  the very first question: why does a price move at all?
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { icon: <><path d="M16 8a4 4 0 1 0-8 0" /><path d="M4 20a8 8 0 0 1 16 0" /></>, label: "Buyers vs sellers" },
                    { icon: <><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 4-6" /></>, label: "Why price moves" },
                    { icon: <><rect x={8} y={5} width={8} height={14} rx={2} /><path d="M12 2v3M12 19v3" /></>, label: "What a candle is" },
                    { icon: <path d="M5 12l5 5L20 7" />, label: "Green vs red" },
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

            {/* ===== S1 LEARN · WHAT IS PRICE? ===== */}
            {step === 1 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · WHAT IS PRICE?</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Price is a tug-of-war, settled every second</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  A price is simply what buyers and sellers currently agree on. More buyers than sellers? It rises. More sellers? It
                  falls. Press the buttons and move the market yourself.
                </p>
                <div className="rounded-3xl border border-border bg-black p-6 sm:p-7">
                  <div className="mb-1.5 flex items-center justify-center gap-2.5">
                    <div className="text-[44px] font-black tabular-nums text-white">₹{state.market.price}</div>
                    <div
                      className="flex items-center text-base font-extrabold"
                      style={{ color: state.market.last > 0 ? "#22c55e" : state.market.last < 0 ? "#ef4444" : "#666" }}
                    >
                      {state.market.last !== 0 && (state.market.last > 0 ? <UpIcon size={16} /> : <DownIcon size={16} />)}
                      {state.market.last === 0 ? "—" : (state.market.last > 0 ? "+" : "") + state.market.last}
                    </div>
                  </div>
                  <div className="mb-5 flex justify-center">
                    <svg width={480} height={90} viewBox="0 0 480 90" className="max-w-full">
                      <polyline points={marketChart.pts} fill="none" stroke="#456dff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex justify-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => moveMarket(1)}
                      className="flex max-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#22c55e]/45 bg-[#22c55e]/10 px-4 py-4 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      <UpIcon />
                      Buyers step in
                    </button>
                    <button
                      type="button"
                      onClick={() => moveMarket(-1)}
                      className="flex max-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#ef4444]/45 bg-[#ef4444]/10 px-4 py-4 text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
                    >
                      <DownIcon />
                      Sellers step in
                    </button>
                  </div>
                  <div className="mt-4 text-center text-[13px] text-[#ccc]">
                    {state.market.boughtSeen && state.market.soldSeen
                      ? "That's the market: every price is just the running score of this tug-of-war."
                      : "Press each side and watch the price — and the little chart — react."}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S2 QUIZ · MCQ ===== */}
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

            {/* ===== S3 LEARN · PRICE OVER TIME ===== */}
            {step === 3 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · PRICE OVER TIME</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Record the price each day — you get history</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  A single price is only &quot;now&quot;. Traders write down the closing price every day so they can see where things
                  are heading. Tap to record each day and watch the story build.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6 text-center sm:p-7">
                  <div className="mb-4 flex justify-center">
                    <svg width={500} height={220} viewBox="0 0 500 220" className="max-w-full" style={{ overflow: "visible" }}>
                      <line x1={40} y1={14} x2={40} y2={180} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      <line x1={40} y1={180} x2={480} y2={180} stroke="rgba(255,255,255,.22)" strokeWidth={1.6} />
                      <polyline points={recordChart.pts} fill="none" stroke="#456dff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      {recordChart.dots.map((d, i) => (
                        <circle key={i} cx={d.cx} cy={d.cy} r={5} fill="#88c9f7" className="animate-pop-in" />
                      ))}
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={recordDay}
                    disabled={recordFull}
                    className={`rounded-xl border-2 px-6 py-3 text-sm font-extrabold transition-all ${
                      recordFull ? "cursor-default border-border-subtle bg-brill-900 text-text-muted" : "cursor-pointer border-blue bg-blue-bgDark text-white"
                    }`}
                  >
                    {recordFull ? "All 7 days recorded" : `Record day ${state.record.revealed + 1}`}
                  </button>
                  <div key={state.record.revealed} className="mt-3.5 animate-pop-in text-[13.5px] leading-relaxed text-[#ccc]">
                    {recordFull
                      ? "Seven closes in a row — now you can see the price is drifting upward. That's the power of tracking over time."
                      : "Each tap adds one day's closing price. One point tells you little; a run of them tells a story."}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S4 QUIZ · UP OR DOWN ===== */}
            {step === 4 && (
              <div className="mx-auto max-w-[600px] text-center">
                <SectionEyebrow tone="gold">
                  CHALLENGE · UP OR DOWN? · ROUND {Math.min(state.upDown.round + 1, UP_DOWN_ROUNDS.length)}/{UP_DOWN_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Did price go up or down?</h2>
                <p className="mb-4 text-[15px] text-text-secondary">
                  From yesterday&apos;s ₹{upDownRound.a} to today&apos;s ₹{upDownRound.b}.
                </p>
                <div className="mb-5 flex justify-center">
                  <div key={state.upDown.round} className="animate-pop-in rounded-[18px] border border-border bg-black px-7 py-5">
                    <svg width={220} height={150} viewBox="0 0 220 150">
                      <line x1={24} y1={10} x2={24} y2={120} stroke="rgba(255,255,255,.18)" strokeWidth={1.4} />
                      <line x1={24} y1={120} x2={210} y2={120} stroke="rgba(255,255,255,.18)" strokeWidth={1.4} />
                      <polyline points={upDownChart.pts} fill="none" stroke="#456dff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={upDownChart.dots[0]!.cx} cy={upDownChart.dots[0]!.cy} r={6} fill="#88c9f7" />
                      <circle cx={upDownChart.dots[1]!.cx} cy={upDownChart.dots[1]!.cy} r={6} fill="#f7c325" />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => answerUpDown("up")}
                    className="flex max-w-[210px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <UpIcon size={28} />
                    Went up
                  </button>
                  <button
                    type="button"
                    onClick={() => answerUpDown("down")}
                    className="flex max-w-[210px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <DownIcon size={28} />
                    Went down
                  </button>
                </div>
                <div className="mt-4 min-h-[46px]">
                  <FeedbackBanner center fb={state.upDown.fb} />
                </div>
              </div>
            )}

            {/* ===== S5 LEARN · WHY A CANDLE? ===== */}
            {step === 5 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · WHY A CANDLE?</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">One number hides the whole day&apos;s fight</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  A closing price tells you where the day ended — but not how it got there. A candlestick captures the entire day in
                  one shape. Toggle to compare.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6 sm:p-7">
                  <div className="mb-4 flex h-[220px] items-center justify-center">
                    {state.numberCandle.mode === "number" ? (
                      <div key="number" className="animate-pop-in text-center">
                        <div className="text-[64px] font-black text-blue-light">₹{NC_LABELS.close}</div>
                        <div className="mt-1 text-[13px] font-semibold text-text-muted">closing price — that&apos;s all you get</div>
                      </div>
                    ) : (
                      <svg key="candle" width={200} height={220} viewBox="0 0 200 220" className="animate-pop-in" style={{ overflow: "visible" }}>
                        <line x1={70} y1={ncGeo.hy} x2={180} y2={ncGeo.hy} stroke="#555" strokeWidth={1.2} strokeDasharray="4 4" />
                        <text x={100} y={ncGeo.hy - 4} fill="#999" fontSize={11} fontWeight={700}>
                          high ₹{NC_LABELS.high}
                        </text>
                        <line x1={70} y1={ncGeo.openY} x2={180} y2={ncGeo.openY} stroke="#555" strokeWidth={1.2} strokeDasharray="4 4" />
                        <text x={100} y={ncGeo.openY - 4} fill="#999" fontSize={11} fontWeight={700}>
                          open ₹{NC_LABELS.open}
                        </text>
                        <line x1={70} y1={ncGeo.closeY} x2={180} y2={ncGeo.closeY} stroke="#88c9f7" strokeWidth={1.2} strokeDasharray="4 4" />
                        <text x={100} y={ncGeo.closeY - 4} fill="#88c9f7" fontSize={11} fontWeight={700}>
                          close ₹{NC_LABELS.close}
                        </text>
                        <line x1={70} y1={ncGeo.ly} x2={180} y2={ncGeo.ly} stroke="#555" strokeWidth={1.2} strokeDasharray="4 4" />
                        <text x={100} y={ncGeo.ly - 4} fill="#999" fontSize={11} fontWeight={700}>
                          low ₹{NC_LABELS.low}
                        </text>
                        <CandleShape g={{ ...ncGeo, cx: 50, bodyX: 34 }} />
                      </svg>
                    )}
                  </div>
                  <div className="flex justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setNumberCandle("number")}
                      className={`rounded-xl border-2 px-[22px] py-[11px] text-sm font-extrabold transition-all ${
                        state.numberCandle.mode === "number" ? "border-blue bg-blue-bgDark text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      Just a number
                    </button>
                    <button
                      type="button"
                      onClick={() => setNumberCandle("candle")}
                      className={`rounded-xl border-2 px-[22px] py-[11px] text-sm font-extrabold transition-all ${
                        state.numberCandle.mode === "candle" ? "border-blue bg-blue-bgDark text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                      }`}
                    >
                      The whole candle
                    </button>
                  </div>
                  <div key={state.numberCandle.mode} className="mx-auto mt-3.5 max-w-[520px] animate-pop-in text-center text-[13.5px] leading-relaxed text-[#ccc]">
                    {NC_CAPTIONS[state.numberCandle.mode]}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S6 QUIZ · WHICH SHOWS MORE ===== */}
            {step === 6 && (
              <div className="mx-auto max-w-[640px] text-center">
                <SectionEyebrow tone="gold">QUICK CHECK</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Which one tells you more about the day?</h2>
                <p className="mb-6 text-[15px] text-text-secondary">Tap the picture that carries the most information.</p>
                <div className="flex justify-center gap-5">
                  <button
                    type="button"
                    onClick={() => tapShowsMore("a")}
                    className={`w-[200px] rounded-[18px] border-2 bg-black px-2 py-5 transition-all hover:-translate-y-1 ${
                      state.showsMore.wrongKey === "a" ? "border-wrong animate-wrong-shake" : "border-border"
                    }`}
                  >
                    <svg width={80} height={150} viewBox="0 0 80 150" className="mx-auto block">
                      <circle cx={40} cy={75} r={8} fill="#88c9f7" />
                    </svg>
                    <div className="text-[13px] font-extrabold text-[#ccc]">A single price dot</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => tapShowsMore("b")}
                    className={`w-[200px] rounded-[18px] border-2 bg-black px-2 py-5 transition-all hover:-translate-y-1 ${
                      state.showsMore.okKey === "b" ? "border-blue animate-pulse" : "border-border"
                    }`}
                  >
                    <svg width={80} height={150} viewBox="0 0 80 150" className="mx-auto block">
                      <line x1={40} y1={14} x2={40} y2={44} stroke="#22c55e" strokeWidth={5} strokeLinecap="round" />
                      <rect x={26} y={44} width={28} height={62} rx={5} fill="#22c55e" />
                      <line x1={40} y1={106} x2={40} y2={138} stroke="#22c55e" strokeWidth={5} strokeLinecap="round" />
                    </svg>
                    <div className="text-[13px] font-extrabold text-[#ccc]">A full candlestick</div>
                  </button>
                </div>
                <div className="mt-4.5 min-h-[46px]">
                  <FeedbackBanner center fb={state.showsMore.fb} />
                </div>
              </div>
            )}

            {/* ===== S7 LEARN · GREEN vs RED ===== */}
            {step === 7 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · THE UNIVERSAL COLOURS</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Green means up. Red means down.</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  This is the one rule every trader on earth shares. If a candle closed higher than it opened, it&apos;s green. Lower,
                  and it&apos;s red. Tap each to confirm.
                </p>
                <div className="flex flex-wrap justify-center gap-5">
                  {GR_CARDS.map((c) => {
                    const g = geo(c.sample.o, c.sample.h, c.sample.l, c.sample.c, 70, 150, 30, 14);
                    const on = !!state.greenRed.awarded[c.id];
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => tapGreenRed(c.id)}
                        className={`w-[260px] rounded-[20px] border-2 bg-black px-[18px] pb-4.5 pt-5.5 transition-all hover:-translate-y-1 ${
                          on ? "border-blue" : "border-border"
                        }`}
                      >
                        <svg width={70} height={150} viewBox="0 0 70 150" className="mx-auto mb-2.5 block">
                          <CandleShape g={{ ...g, cx: 35, bodyX: g.bodyX, bw: 30 }} />
                        </svg>
                        <div className={`text-center text-[15px] font-extrabold ${on ? "text-blue-light" : "text-white"}`}>{c.name}</div>
                        <div className="mt-1.5 min-h-[38px] text-center text-[12.5px] leading-relaxed text-[#aaa]">
                          {on ? c.detail : "Tap to reveal"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===== S8 QUIZ · SPOT THE UP DAY ===== */}
            {step === 8 && (
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">
                  CHALLENGE · SPOT IT · ROUND {Math.min(state.spotUpDay.round + 1, SPOT_UP_DAY_ROUNDS.length)}/{SPOT_UP_DAY_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-6 text-2xl font-extrabold sm:text-[26px]">{spotUpDayRound.prompt}</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {spotUpDayRound.candles.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 80, 170, 32, 16);
                    const ok = state.spotUpDay.okIdx === i;
                    const wrong = state.spotUpDay.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapSpotUpDay(i)}
                        className={`cursor-pointer rounded-[18px] border-2 bg-black px-2 py-4 transition-all hover:-translate-y-1 ${
                          ok ? "border-blue" : wrong ? "border-wrong" : "border-border"
                        } ${wrong ? "animate-wrong-shake" : ok ? "animate-pulse" : ""}`}
                      >
                        <svg width={80} height={170} viewBox="0 0 80 170">
                          <CandleShape g={{ ...g, cx: 40, bodyX: g.bodyX, bw: 32 }} wickWidth={5} bodyRx={6} />
                        </svg>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4.5 min-h-[48px]">
                  <FeedbackBanner center fb={state.spotUpDay.fb} />
                </div>
              </div>
            )}

            {/* ===== S9 LEARN · CANDLES BUILD A CHART ===== */}
            {step === 9 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · A CHART IS MANY CANDLES</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">One candle per day, side by side</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  String a candle for each day together and you have a candlestick chart — the view traders stare at all day. Add the
                  days one at a time.
                </p>
                <div className="rounded-[22px] border border-border bg-black p-6 text-center sm:p-7">
                  <div className="mb-4 flex justify-center">
                    <svg width={500} height={230} viewBox="0 0 500 230" className="max-w-full" style={{ overflow: "visible" }}>
                      <line x1={34} y1={14} x2={34} y2={196} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      <line x1={34} y1={196} x2={486} y2={196} stroke="rgba(255,255,255,.2)" strokeWidth={1.4} />
                      {buildChartCandles.map((cd, i) => (
                        <g key={i} className="animate-pop-in">
                          <line x1={cd.x} y1={cd.upY1} x2={cd.x} y2={cd.upY2} stroke={cd.color} strokeWidth={4} strokeLinecap="round" />
                          <line x1={cd.x} y1={cd.loY1} x2={cd.x} y2={cd.loY2} stroke={cd.color} strokeWidth={4} strokeLinecap="round" />
                          <rect x={cd.bx} y={cd.by} width={cd.bw} height={cd.bh} rx={4} fill={cd.color} />
                        </g>
                      ))}
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={addChartCandle}
                    disabled={buildChartFull}
                    className={`rounded-xl border-2 px-6 py-3 text-sm font-extrabold transition-all ${
                      buildChartFull ? "cursor-default border-border-subtle bg-brill-900 text-text-muted" : "cursor-pointer border-blue bg-blue-bgDark text-white"
                    }`}
                  >
                    {buildChartFull ? "A full week of candles" : `Add day ${state.buildChart.shown + 1}`}
                  </button>
                  <div key={state.buildChart.shown} className="mt-3.5 animate-pop-in text-[13.5px] leading-relaxed text-[#ccc]">
                    {buildChartFull
                      ? "Seven candles, seven days — that's a candlestick chart. Every lesson from here reads charts exactly like this."
                      : "Each candle is one day. Keep adding and watch a real chart take shape."}
                  </div>
                </div>
              </div>
            )}

            {/* ===== S10 QUIZ · MATCH IT ===== */}
            {step === 10 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow tone="gold">CHALLENGE · MATCH IT</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Match each candle to what it says</h2>
                <p className="mb-6 text-center text-[15px] text-text-secondary">
                  Tap a candle, then tap the meaning that fits it. {matchedCount} of {MATCH_PAIRS.length} matched.
                </p>
                <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
                  <div className="flex flex-col gap-3">
                    {MATCH_PAIRS.map((p) => {
                      const g = geo(p.o, p.h, p.l, p.c, 46, 80, 22, 9);
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
                          <svg width={46} height={80} viewBox="0 0 46 80" className="shrink-0">
                            <CandleShape g={{ ...g, cx: 23, bodyX: g.bodyX, bw: 22 }} wickWidth={4} bodyRx={4} />
                          </svg>
                          <span className={`text-[13px] font-bold ${done ? "text-blue-light" : "text-white"}`}>{p.name}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex flex-col gap-3">
                    {matchOrder().map((id) => {
                      const p = matchById[id];
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

            {/* ===== S11 QUIZ · SORT THE DECK ===== */}
            {step === 11 && (
              <div className="mx-auto max-w-[680px] text-center">
                <SectionEyebrow tone="gold">
                  CHALLENGE · SORT THE DECK · {Math.min(state.sort.idx, SORT_DECK.length)} of {SORT_DECK.length} sorted
                </SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Up day or down day?</h2>
                <p className="mb-5 text-[15px] text-text-secondary">Look at this candle and drop it in the right pile.</p>
                <div className="mb-5.5 flex justify-center">
                  <div key={sortIdx} className={`rounded-[20px] border border-border bg-black px-10 py-5 ${state.sort.wrong ? "animate-wrong-shake" : "animate-pop-in"}`}>
                    <svg width={120} height={200} viewBox="0 0 120 200">
                      <CandleShape g={{ ...sortGeo, cx: 60, bodyX: sortGeo.bodyX }} wickWidth={6} bodyRx={8} />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => sortAnswer("up")}
                    className="flex max-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-4 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <UpIcon />
                    Up pile
                  </button>
                  <button
                    type="button"
                    onClick={() => sortAnswer("down")}
                    className="flex max-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-4 text-base font-extrabold text-white transition-transform hover:-translate-y-0.5"
                  >
                    <DownIcon />
                    Down pile
                  </button>
                </div>
                <div className="mt-4 min-h-[40px]">
                  <FeedbackBanner center fb={state.sort.fb} />
                </div>
              </div>
            )}

            {/* ===== S12 QUIZ · PROVE IT (FINAL) ===== */}
            {step === 12 && (
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">
                  FINAL CHALLENGE · ROUND {Math.min(state.finalSpot.round + 1, FINAL_SPOT_ROUNDS.length)}/{FINAL_SPOT_ROUNDS.length}
                </SectionEyebrow>
                <h2 className="mb-6 text-2xl font-extrabold sm:text-[26px]">{finalSpotRound.prompt}</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {finalSpotRound.candles.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 80, 170, 32, 16);
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
                        <svg width={80} height={170} viewBox="0 0 80 170">
                          <CandleShape g={{ ...g, cx: 40, bodyX: g.bodyX, bw: 32 }} wickWidth={5} bodyRx={6} />
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

            {/* ===== S13 COMPLETE ===== */}
            {step === 13 && (
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
                      {INTRO_LESSON_XP}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">XP earned</div>
                  </div>
                  <div className="max-w-[150px] flex-1 rounded-2xl border border-blue/35 bg-brill-700 p-4.5">
                    <div className="text-[32px] font-black text-blue">{LESSONS_DONE_LABEL}</div>
                    <div className="mt-0.5 text-xs font-semibold text-text-secondary">lessons done</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  {ROADMAP_ITEMS.map((r) => (
                    <div
                      key={r.title}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        r.done ? "border-blue/35 bg-blue-bgDark" : "border-border-subtle bg-brill-700"
                      }`}
                    >
                      <div
                        className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg ${r.done ? "bg-blue" : "bg-white/5"}`}
                      >
                        {r.done ? <CheckIcon size={15} /> : <span className="h-2 w-2 rounded-full bg-[#555]" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-extrabold ${r.done ? "text-white" : "text-text-muted"}`}>{r.title}</div>
                      </div>
                      <div className={`text-[11px] font-bold tracking-[0.08em] ${r.done ? "text-blue-light" : "text-text-muted"}`}>
                        {r.done ? "DONE" : "NEXT"}
                      </div>
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
        <button
          type="button"
          onClick={goNext}
          disabled={ctaDisabled}
          className={`min-w-[150px] rounded-full px-7 py-3 text-[15px] font-extrabold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            step === TOTAL_STEPS ? "bg-gradient-to-r from-gold to-gold-dark shadow-gold-glow" : "bg-blue hover:bg-blue-dark"
          }`}
        >
          {ctaLabel}
        </button>
      </footer>
    </div>
  );
}
