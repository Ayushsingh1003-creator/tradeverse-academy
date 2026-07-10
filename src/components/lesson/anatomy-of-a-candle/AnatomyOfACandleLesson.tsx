"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Confetti } from "@/components/ui/Confetti";
import { useUserStore } from "@/lib/store";
import { sound } from "@/lib/sounds";
import { geo, shuffle, type CandleGeo } from "./geometry";
import { ANATOMY_LESSON_SLUG, ANATOMY_LESSON_XP } from "./constants";
import {
  SECTION_META,
  TOTAL_STEPS,
  TIMEFRAME_WORDS,
  MCQ_QUESTION,
  OHLC_INFO,
  WICK_INFO,
  WHO_WON_ROUNDS,
  READING_SHAPES,
  MATCH_PAIRS,
  SPOT_IT_ROUNDS,
  RECAP_ITEMS,
  type OhlcKey,
  type WickKey,
  type ShapeId,
  type Timeframe,
} from "./data";

const COURSE_LABEL = "CANDLESTICK ESSENTIALS";
const BACK_HREF = "/courses/candlestick-essentials";

type Feedback = { ok: boolean; text: string } | null;
type LabelId = "High" | "Close" | "Open" | "Low";

type LessonState = {
  step: number;
  xp: number;
  tf: Timeframe;
  mcq: { picked: number | null; ok: boolean; wrongSet: Record<number, boolean> };
  ohlc: { active: OhlcKey; awarded: Partial<Record<OhlcKey, boolean>> };
  wick: { active: WickKey | null; seen: Partial<Record<WickKey, boolean>>; awarded: Partial<Record<WickKey, boolean>> };
  shape: { active: ShapeId | null; awarded: Partial<Record<ShapeId, boolean>> };
  bodyColour: { close: number; bull: boolean; bear: boolean };
  whoWon: { round: number; fb: Feedback };
  hotspot: { task: number; fb: Feedback; hit: WickKey | null };
  label: { placed: Record<LabelId, boolean>; picked: LabelId | null; wrong: LabelId | null; fb: Feedback };
  build: { o: number; h: number; l: number; c: number; done: boolean };
  match: { picked: { side: "L" | "R"; id: ShapeId } | null; matched: Partial<Record<ShapeId, boolean>>; wrong: [ShapeId, ShapeId] | null };
  spotIt: { round: number; fb: Feedback; wrongIdx: number | null; okIdx: number | null };
};

const initialState: LessonState = {
  step: 0,
  xp: 0,
  tf: "day",
  mcq: { picked: null, ok: false, wrongSet: {} },
  ohlc: { active: "open", awarded: {} },
  wick: { active: null, seen: {}, awarded: {} },
  shape: { active: null, awarded: {} },
  bodyColour: { close: 50, bull: false, bear: false },
  whoWon: { round: 0, fb: null },
  hotspot: { task: 0, fb: null, hit: null },
  label: { placed: {} as Record<LabelId, boolean>, picked: null, wrong: null, fb: null },
  build: { o: 40, h: 55, l: 36, c: 50, done: false },
  match: { picked: null, matched: {}, wrong: null },
  spotIt: { round: 0, fb: null, wrongIdx: null, okIdx: null },
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

export function AnatomyOfACandleLesson() {
  const router = useRouter();
  const completeLesson = useUserStore((s) => s.completeLesson);

  const [state, setState] = useState<LessonState>(initialState);
  const [floaters, setFloaters] = useState<{ id: number; amt: number }[]>([]);
  const [burst, setBurst] = useState<{ id: number; count: number }>({ id: 0, count: 0 });
  const floaterId = useRef(0);
  const matchOrderRef = useRef<ShapeId[] | null>(null);

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

  function matchOrder(): ShapeId[] {
    if (!matchOrderRef.current) matchOrderRef.current = shuffle(MATCH_PAIRS.map((p) => p.id));
    return matchOrderRef.current;
  }

  function canContinue(): boolean {
    switch (step) {
      case 2:
        return state.mcq.ok;
      case 4:
        return Object.keys(state.label.placed).length === 4;
      case 6:
        return state.whoWon.round >= 3;
      case 8:
        return state.hotspot.task >= 2;
      case 10:
        return Object.keys(state.match.matched).length === 4;
      case 11:
        return state.build.done;
      case 12:
        return state.spotIt.round >= 3;
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
      completeLesson({ lessonSlug: ANATOMY_LESSON_SLUG, score: 100, xpEarned: ANATOMY_LESSON_XP });
    }
  }

  function restart() {
    matchOrderRef.current = null;
    setState(initialState);
  }

  /* ---------- handlers ---------- */

  function setTf(id: Timeframe) {
    sound.tick();
    setState((s) => ({ ...s, tf: id }));
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

  function tapOhlc(id: OhlcKey) {
    sound.tick();
    const already = !!state.ohlc.awarded[id];
    setState((s) => ({ ...s, ohlc: { active: id, awarded: already ? s.ohlc.awarded : { ...s.ohlc.awarded, [id]: true } } }));
    if (!already) award(5, { silent: true });
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

  function tapShape(id: ShapeId) {
    sound.tick();
    const already = !!state.shape.awarded[id];
    setState((s) => ({ ...s, shape: { active: id, awarded: already ? s.shape.awarded : { ...s.shape.awarded, [id]: true } } }));
    if (!already) award(5, { silent: true });
  }

  function setBodyColourClose(v: number) {
    const prev = state.bodyColour;
    const wasBull = prev.close > 50;
    const isBull = v > 50;
    if (isBull !== wasBull && v !== 50) sound.tick();
    const next = { ...prev, close: v };
    let give = 0;
    if (v >= 62 && !next.bull) {
      next.bull = true;
      give += 10;
    }
    if (v <= 38 && !next.bear) {
      next.bear = true;
      give += 10;
    }
    setState((s) => ({ ...s, bodyColour: next }));
    if (give) award(give);
  }

  function answerWhoWon(kind: "bull" | "bear") {
    const r = WHO_WON_ROUNDS[state.whoWon.round];
    if (!r) return;
    if (kind === r.ans) {
      const next = state.whoWon.round + 1;
      setState((s) => ({ ...s, whoWon: { round: s.whoWon.round, fb: { ok: true, text: r.hint } } }));
      award(20);
      window.setTimeout(() => setState((s) => ({ ...s, whoWon: { round: next, fb: null } })), 1200);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, whoWon: { ...s.whoWon, fb: { ok: false, text: "Look again — " + r.hint } } }));
    }
  }

  function tapHotspot(zone: WickKey) {
    const task = state.hotspot.task;
    const want: WickKey = task === 0 ? "upper" : "lower";
    if (zone === want) {
      const next = task + 1;
      const text =
        task === 0
          ? "Yes — the upper wick shows the highest price buyers reached."
          : "Exactly — the lower wick marks the lowest price sellers pushed to.";
      setState((s) => ({ ...s, hotspot: { task, hit: zone, fb: { ok: true, text } } }));
      award(20);
      window.setTimeout(() => setState((s) => ({ ...s, hotspot: { task: next, hit: null, fb: null } })), 1200);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, hotspot: { ...s.hotspot, fb: { ok: false, text: `That's the ${zone} wick. Find the ${want} one.` } } }));
    }
  }

  function pickLabelChip(id: LabelId) {
    if (state.label.placed[id]) return;
    sound.tick();
    setState((s) => ({ ...s, label: { ...s.label, picked: s.label.picked === id ? null : id } }));
  }

  function setDragLabel(id: LabelId) {
    if (!state.label.placed[id]) setState((s) => ({ ...s, label: { ...s.label, picked: id } }));
  }

  function placeLabelSlot(id: LabelId) {
    const picked = state.label.picked;
    if (!picked || state.label.placed[id]) return;
    if (picked === id) {
      const done = Object.keys(state.label.placed).length + 1 === 4;
      setState((s) => ({
        ...s,
        label: { placed: { ...s.label.placed, [id]: true }, picked: null, wrong: null, fb: { ok: true, text: `${id} — nailed it.` } },
      }));
      award(15, done ? { burst: 48 } : {});
      if (done) {
        window.setTimeout(
          () => setState((s) => ({ ...s, label: { ...s.label, fb: { ok: true, text: "Fully labelled. That's the whole anatomy!" } } })),
          50,
        );
      }
    } else {
      sound.wrong();
      setState((s) => ({ ...s, label: { ...s.label, wrong: id, fb: { ok: false, text: `Not quite — that spot isn't the ${picked}.` } } }));
      window.setTimeout(() => setState((s) => ({ ...s, label: { ...s.label, wrong: null } })), 500);
    }
  }

  function setBuildValue(key: "o" | "h" | "l" | "c", v: number) {
    const next = { ...state.build, [key]: v };
    const bull = next.c > next.o;
    const body = Math.abs(next.c - next.o);
    const upper = next.h - Math.max(next.o, next.c);
    const lower = Math.min(next.o, next.c) - next.l;
    const allDone = bull && body >= 8 && upper >= 18 && lower <= 8;
    if (allDone && !next.done) {
      next.done = true;
      setState((s) => ({ ...s, build: next }));
      award(40, { burst: 64 });
      return;
    }
    if (!allDone) next.done = false;
    setState((s) => ({ ...s, build: next }));
    sound.tick();
  }

  function pickMatchCard(side: "L" | "R", id: ShapeId) {
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
      const done = Object.keys(matched).length === 4;
      setState((s) => ({ ...s, match: { picked: null, matched, wrong: null } }));
      award(20, done ? { burst: 48 } : {});
    } else {
      sound.wrong();
      const wrong: [ShapeId, ShapeId] = [st.picked.id, id];
      setState((s) => ({ ...s, match: { ...s.match, picked: null, wrong } }));
      window.setTimeout(() => setState((s) => ({ ...s, match: { ...s.match, wrong: null } })), 480);
    }
  }

  function tapSpotIt(idx: number) {
    const r = SPOT_IT_ROUNDS[state.spotIt.round];
    if (!r || state.spotIt.okIdx != null) return;
    if (idx === r.ans) {
      const next = state.spotIt.round + 1;
      setState((s) => ({ ...s, spotIt: { ...s.spotIt, okIdx: idx, fb: { ok: true, text: r.hint } } }));
      award(25, next === 3 ? { burst: 64 } : {});
      window.setTimeout(() => setState((s) => ({ ...s, spotIt: { round: next, fb: null, wrongIdx: null, okIdx: null } })), 1250);
    } else {
      sound.wrong();
      setState((s) => ({ ...s, spotIt: { ...s.spotIt, wrongIdx: idx, fb: { ok: false, text: "Not that one. " + r.hint } } }));
      window.setTimeout(() => setState((s) => ({ ...s, spotIt: { ...s.spotIt, wrongIdx: null } })), 500);
    }
  }

  /* ---------- derived geometry ---------- */

  const ohlcGeo = geo(38, 90, 14, 66, 220, 320, 60, 26);
  const labelGeo = geo(35, 92, 12, 68, 120, 360, 60, 30);
  const bodyColourGeo = geo(50, 88, 14, state.bodyColour.close, 240, 300, 64, 30);
  const whoWonRound = WHO_WON_ROUNDS[Math.min(state.whoWon.round, 2)]!;
  const whoWonGeo = geo(whoWonRound.o, whoWonRound.h, whoWonRound.l, whoWonRound.c, 150, 240, 46, 20);
  const wickGeo = geo(38, 90, 12, 64, 200, 320, 60, 24);
  const hotspotGeo = geo(35, 92, 12, 68, 220, 330, 60, 26);
  const buildGeo = geo(state.build.o, state.build.h, state.build.l, state.build.c, 200, 320, 60, 20);
  const spotItRound = SPOT_IT_ROUNDS[Math.min(state.spotIt.round, 2)]!;

  const labelSlots: Array<{ id: LabelId; top: number; dot: string }> = [
    { id: "High", top: Math.round(labelGeo.hy - 23), dot: "#94a3b8" },
    { id: "Close", top: Math.round(labelGeo.bodyY - 23), dot: "#88c9f7" },
    { id: "Open", top: Math.round(labelGeo.bodyY + labelGeo.bodyH - 23), dot: "#88c9f7" },
    { id: "Low", top: Math.round(labelGeo.ly - 23), dot: "#94a3b8" },
  ];

  const placedCount = Object.keys(state.label.placed).length;
  const matchedCount = Object.keys(state.match.matched).length;

  const ctaDisabled = !canContinue();
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
                <svg width={150} height={230} viewBox="0 0 150 230" className="mx-auto mb-5 block">
                  <motion.line
                    x1={75}
                    y1={8}
                    x2={75}
                    y2={52}
                    stroke="#22c55e"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                  <motion.rect
                    x={46}
                    y={52}
                    width={58}
                    height={104}
                    rx={9}
                    fill="#22c55e"
                    style={{ transformOrigin: "75px 156px" }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.line
                    x1={75}
                    y1={156}
                    x2={75}
                    y2={222}
                    stroke="#22c55e"
                    strokeWidth={5}
                    strokeLinecap="round"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  />
                </svg>
                <div className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-blue-light">THE ANATOMY OF A CANDLE</div>
                <h1 className="mb-3.5 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[40px]">
                  Every candle tells a
                  <br />
                  story. Learn to read it.
                </h1>
                <p className="mx-auto mb-7 max-w-[500px] text-[17px] leading-relaxed text-text-secondary">
                  New to charts? Perfect. We&apos;ll start from zero — what a candle even <i>is</i> — and build up one small idea at a
                  time. Learn a little, then try it yourself.
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { icon: <rect x={8} y={4} width={8} height={16} rx={2} />, label: "What a candle is" },
                    {
                      icon: (
                        <>
                          <line x1={12} y1={3} x2={12} y2={8} />
                          <rect x={9} y={8} width={6} height={8} rx={1.5} />
                          <line x1={12} y1={16} x2={12} y2={21} />
                        </>
                      ),
                      label: "The four prices",
                    },
                    { icon: <path d="M3 17 9 11l4 4 8-8M15 7h6v6" />, label: "Bull vs bear" },
                    {
                      icon: (
                        <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.6 4.6 0 0 1 8.91 14" />
                      ),
                      label: "What it means",
                    },
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
              <div className="mx-auto max-w-[900px]">
                <SectionEyebrow>LEARN · WHAT IS A CANDLE?</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">A candle is a picture of price over a slice of time</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Prices jump around constantly. A candlestick takes one chunk of time and squeezes all of that movement into a single,
                  readable shape.
                </p>
                <div className="grid gap-5 md:grid-cols-[1.15fr_1fr]">
                  <div className="flex flex-col rounded-[22px] border border-border bg-black p-6">
                    <div className="mb-2.5 text-xs font-bold text-text-muted">MESSY PRICE MOVEMENT&nbsp;&nbsp;→&nbsp;&nbsp;ONE CANDLE</div>
                    <svg viewBox="0 0 380 240" className="h-auto w-full flex-1">
                      <rect x={10} y={14} width={230} height={212} rx={10} fill="none" stroke="rgba(255,255,255,.12)" strokeWidth={1.5} strokeDasharray="5 6" />
                      <text x={18} y={34} fill="#666" fontSize={11} fontWeight={700}>
                        one time period
                      </text>
                      <polyline
                        points="24,150 46,120 66,138 88,92 110,110 132,70 156,104 178,58 200,86 224,64"
                        fill="none"
                        stroke="#88c9f7"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx={24} cy={150} r={4} fill="#94a3b8" />
                      <text x={16} y={172} fill="#94a3b8" fontSize={10} fontWeight={700}>
                        open
                      </text>
                      <circle cx={178} cy={58} r={4} fill="#22c55e" />
                      <text x={150} y={50} fill="#22c55e" fontSize={10} fontWeight={700}>
                        high
                      </text>
                      <circle cx={224} cy={64} r={4} fill="#88c9f7" />
                      <text x={214} y={56} fill="#88c9f7" fontSize={10} fontWeight={700}>
                        close
                      </text>
                      <path d="M250 120 h34 m0 0 l-8 -6 m8 6 l-8 6" fill="none" stroke="#456dff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                      <line x1={330} y1={30} x2={330} y2={70} stroke="#22c55e" strokeWidth={5} strokeLinecap="round" />
                      <rect x={312} y={70} width={36} height={96} rx={7} fill="#22c55e" />
                      <line x1={330} y1={166} x2={330} y2={210} stroke="#22c55e" strokeWidth={5} strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-border-subtle bg-brill-700 px-[17px] py-[15px]">
                      <div className="mb-0.5 text-sm font-extrabold text-white">1 candle = 1 time period</div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">
                        A minute, an hour, a day — <b className="text-[#ddd]">you</b> pick the period. Every candle on a chart covers the
                        same length of time.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border-subtle bg-brill-700 px-[17px] py-[15px]">
                      <div className="mb-0.5 text-sm font-extrabold text-white">It records four prices</div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">
                        Where price <b className="text-[#ddd]">opened</b>, the <b className="text-[#ddd]">highest</b> and{" "}
                        <b className="text-[#ddd]">lowest</b> it reached, and where it <b className="text-[#ddd]">closed</b>. That&apos;s
                        it.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-blue/25 bg-[#0d0d0d] px-[17px] py-[15px]">
                      <div className="mb-2.5 text-xs font-bold text-blue-light">TRY IT — pick a period</div>
                      <div className="mb-2.5 flex gap-2">
                        {(
                          [
                            { id: "min", label: "1 min" },
                            { id: "hour", label: "1 hour" },
                            { id: "day", label: "1 day" },
                          ] as const
                        ).map((p) => {
                          const on = state.tf === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setTf(p.id)}
                              className={`flex-1 rounded-[10px] border-[1.5px] py-2 text-[13px] font-extrabold transition-colors ${
                                on ? "border-blue bg-blue-row text-white" : "border-border-strong bg-brill-700 text-text-secondary"
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                      <div key={state.tf} className="animate-pop-in text-[13px] leading-relaxed text-[#ddd]">
                        Each candle here would sum up everything price did in {TIMEFRAME_WORDS[state.tf]}. Choose a shorter period for a
                        zoomed-in view, a longer one for the big picture.
                      </div>
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
                <SectionEyebrow>LEARN · THE FOUR PRICES (O·H·L·C)</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Every candle is built from four prices</h2>
                <p className="mx-auto mb-6 max-w-[540px] text-center text-[15px] text-text-secondary">
                  Open, High, Low, Close — remember them as <b className="text-white">OHLC</b>. Tap each one to see exactly where it lives
                  on the candle.
                </p>
                <div className="grid items-center gap-6 rounded-[22px] border border-border bg-black p-6 md:grid-cols-[300px_1fr]">
                  <div className="flex justify-center">
                    <svg width={220} height={320} viewBox="0 0 220 320" style={{ overflow: "visible" }}>
                      <line
                        x1={30}
                        y1={ohlcGeo.hy}
                        x2={210}
                        y2={ohlcGeo.hy}
                        stroke={state.ohlc.active === "high" ? "#22c55e" : "rgba(255,255,255,.1)"}
                        strokeWidth={1.4}
                        strokeDasharray="4 5"
                      />
                      <line
                        x1={30}
                        y1={ohlcGeo.ly}
                        x2={210}
                        y2={ohlcGeo.ly}
                        stroke={state.ohlc.active === "low" ? "#ef4444" : "rgba(255,255,255,.1)"}
                        strokeWidth={1.4}
                        strokeDasharray="4 5"
                      />
                      <CandleShape g={ohlcGeo} />
                      <circle
                        cx={110}
                        cy={{ open: ohlcGeo.openY, high: ohlcGeo.hy, low: ohlcGeo.ly, close: ohlcGeo.closeY }[state.ohlc.active]}
                        r={14}
                        fill="none"
                        stroke="#f7c325"
                        strokeWidth={3}
                        style={{ transition: "all .25s" }}
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-3.5 grid grid-cols-2 gap-2.5">
                      {(["open", "high", "low", "close"] as const).map((id) => {
                        const on = state.ohlc.active === id;
                        const info = OHLC_INFO[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => tapOhlc(id)}
                            className={`rounded-[13px] border-2 px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 ${
                              on ? "border-gold bg-gold-bg" : "border-border-subtle bg-brill-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-[9px] w-[9px] rounded-full" style={{ background: info.dot }} />
                              <span className={`text-[15px] font-extrabold ${on ? "text-gold" : "text-white"}`}>{info.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div key={state.ohlc.active} className="flex min-h-[78px] animate-pop-in items-center rounded-2xl border border-border-subtle bg-brill-700 px-[17px] py-[15px]">
                      <div>
                        <div className="mb-0.5 text-sm font-extrabold text-gold">{OHLC_INFO[state.ohlc.active].name}</div>
                        <div className="text-[13px] leading-relaxed text-[#ccc]">{OHLC_INFO[state.ohlc.active].text}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-[840px]">
                <SectionEyebrow tone="gold">CHALLENGE · LABEL THE CANDLE</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Drop each label onto the right spot</h2>
                <p className="mb-5 text-center text-[15px] text-text-secondary">
                  Tap a chip to pick it up, then tap its target — or drag it across. {placedCount} of 4 placed.
                </p>
                <div className="grid gap-5 rounded-3xl border border-border bg-black p-6 md:grid-cols-[300px_1fr]">
                  <div className="relative h-[360px]">
                    <svg width={120} height={360} viewBox="0 0 120 360" style={{ position: "absolute", left: 20, top: 0, overflow: "visible" }}>
                      <CandleShape g={{ ...labelGeo, cx: 60, bodyX: 30 }} />
                    </svg>
                    {labelSlots.map((slot) => {
                      const done = !!state.label.placed[slot.id];
                      const wrong = state.label.wrong === slot.id;
                      const armed = state.label.picked && !done;
                      return (
                        <div
                          key={slot.id}
                          onClick={() => placeLabelSlot(slot.id)}
                          onDrop={(e) => {
                            e.preventDefault();
                            placeLabelSlot(slot.id);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          className={`absolute right-0 flex h-[46px] w-[132px] cursor-pointer items-center gap-2 rounded-[11px] border-2 px-2.5 transition-all ${
                            done ? "border-solid border-blue bg-blue-row" : wrong ? "border-dashed border-wrong bg-wrong-bg" : armed ? "border-dashed border-blue/50 bg-blue-bgDark" : "border-dashed border-border-strong bg-white/[0.02]"
                          } ${wrong ? "animate-wrong-shake" : done ? "animate-pop-in" : ""}`}
                          style={{ top: slot.top }}
                        >
                          <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: done ? "#456dff" : slot.dot }} />
                          <span className={`text-sm font-extrabold ${done ? "text-white" : "text-text-muted"}`}>{done ? slot.id : "?"}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div className="mb-3 text-xs font-bold text-text-secondary">LABELS — {4 - placedCount} left</div>
                    <div className="flex flex-wrap gap-2.5">
                      {labelSlots.map((slot) => {
                        const done = !!state.label.placed[slot.id];
                        const sel = state.label.picked === slot.id;
                        return (
                          <div
                            key={slot.id}
                            draggable={!done}
                            onDragStart={() => setDragLabel(slot.id)}
                            onClick={() => pickLabelChip(slot.id)}
                            className={`select-none rounded-xl border-2 px-[18px] py-3 text-[15px] font-extrabold transition-all hover:-translate-y-0.5 ${
                              done ? "cursor-default border-border-strong bg-brill-700 text-text-muted opacity-35" : sel ? "cursor-grab border-blue bg-blue-row text-white" : "cursor-grab border-border-strong bg-brill-700 text-white"
                            }`}
                          >
                            {slot.id}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-5 flex gap-2.5 rounded-2xl border border-border-subtle bg-brill-700 px-4 py-3.5 text-[13px] leading-relaxed text-[#bbb]">
                      <BulbIcon />
                      <span>
                        This is a <b className="text-[#22c55e]">bullish</b> candle, so the <b className="text-white">close</b> sits above
                        the <b className="text-white">open</b>. The wick tips are the <b className="text-white">high</b> and{" "}
                        <b className="text-white">low</b>.
                      </span>
                    </div>
                    <div className="mt-3 min-h-[24px]">
                      {state.label.fb && (
                        <div className={`flex animate-pop-in items-center gap-2 text-sm font-bold ${state.label.fb.ok ? "text-blue-light" : "text-wrong"}`}>
                          <span>{state.label.fb.ok ? <CheckIcon size={16} color="#456dff" /> : <XIcon size={16} color="#ff5d5d" />}</span>
                          {state.label.fb.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · THE BODY &amp; ITS COLOUR</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">The colour tells you who won</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  The thick part is the <b className="text-white">body</b> — the gap between open and close. If price closed{" "}
                  <b className="text-[#22c55e]">higher</b> than it opened, the candle is green. If it closed{" "}
                  <b className="text-[#ef4444]">lower</b>, it&apos;s red. Drag the close price and watch it flip.
                </p>
                <div className="grid items-center gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[280px_1fr]">
                  <div>
                    <svg width={240} height={300} viewBox="0 0 240 300" className="mx-auto block" style={{ overflow: "visible" }}>
                      <line x1={16} y1={bodyColourGeo.openY} x2={224} y2={bodyColourGeo.openY} stroke="#666" strokeWidth={1.5} strokeDasharray="5 5" />
                      <text x={20} y={bodyColourGeo.openY - 6} fill="#999" fontSize={12} fontWeight={700}>
                        OPEN 50
                      </text>
                      <CandleShape g={{ ...bodyColourGeo, cx: 120, bodyX: 88, bw: 64 }} wickWidth={5} />
                      <line x1={192} y1={bodyColourGeo.closeY} x2={212} y2={bodyColourGeo.closeY} stroke="#88c9f7" strokeWidth={2} />
                      <text x={196} y={bodyColourGeo.closeY - 6} fill="#88c9f7" fontSize={12} fontWeight={800}>
                        CLOSE {state.bodyColour.close}
                      </text>
                    </svg>
                  </div>
                  <div>
                    <div className="mb-2.5 text-[13px] font-bold text-text-secondary">DRAG THE CLOSE PRICE</div>
                    <div
                      onPointerDown={beginPercentSlide(setBodyColourClose)}
                      className="relative mb-1.5 flex h-[26px] cursor-grab touch-none select-none items-center"
                    >
                      <div className="absolute left-0 right-0 h-2.5 rounded-md bg-brill-600" />
                      <div
                        className="absolute left-0 h-2.5 rounded-md"
                        style={{ width: `${state.bodyColour.close}%`, background: "linear-gradient(90deg,#3860be,#456dff,#88c9f7)" }}
                      />
                      <div
                        className="absolute h-[26px] w-[26px] rounded-full border-[3px] border-blue bg-white shadow-[0_2px_10px_rgba(0,0,0,.5),0_0_16px_rgba(69,109,255,.5)]"
                        style={{ left: `${state.bodyColour.close}%`, transform: "translateX(-13px)" }}
                      />
                    </div>
                    <div className="mb-5 flex justify-between text-[11px] font-semibold text-text-muted">
                      <span>0</span>
                      <span>50 (open)</span>
                      <span>100</span>
                    </div>
                    <div className="flex gap-2.5">
                      <div className={`flex-1 rounded-xl border px-3.5 py-3 transition-all ${state.bodyColour.bull ? "border-blue/60 bg-blue-bgDark" : "border-border bg-brill-700"}`}>
                        <div className="flex items-center gap-2">
                          {state.bodyColour.bull ? <CheckIcon color="#88c9f7" size={20} /> : <OpenCircleIcon size={20} />}
                          <span className="text-[13px] font-bold text-white">Make it bullish</span>
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">close above the open</div>
                      </div>
                      <div className={`flex-1 rounded-xl border px-3.5 py-3 transition-all ${state.bodyColour.bear ? "border-blue/60 bg-blue-bgDark" : "border-border bg-brill-700"}`}>
                        <div className="flex items-center gap-2">
                          {state.bodyColour.bear ? <CheckIcon color="#88c9f7" size={20} /> : <OpenCircleIcon size={20} />}
                          <span className="text-[13px] font-bold text-white">Make it bearish</span>
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">close below the open</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-border-subtle bg-brill-700 px-3.5 py-3 text-[13px] leading-relaxed text-[#ccc]">
                      <b style={{ color: bodyColourGeo.color }}>
                        {state.bodyColour.close > 50 ? "BULLISH" : state.bodyColour.close < 50 ? "BEARISH" : "DOJI"}
                      </b>{" "}
                      —{" "}
                      {state.bodyColour.close > 50
                        ? "the close is above the open, so buyers won."
                        : state.bodyColour.close < 50
                          ? "the close is below the open, so sellers won."
                          : "open equals close — a perfect standoff."}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="mx-auto max-w-[640px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · WHO WON? · ROUND {Math.min(state.whoWon.round + 1, 3)}/3</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">Read the candle. Who was in control?</h2>
                <p className="mb-5 text-[15px] text-text-secondary">Green body = buyers won the session. Red body = sellers won.</p>
                <div className="mb-6 flex justify-center">
                  <div key={state.whoWon.round} className="animate-pop-in rounded-[20px] border border-border bg-black px-10 py-5">
                    <svg width={150} height={240} viewBox="0 0 150 240">
                      <CandleShape g={{ ...whoWonGeo, cx: 75, bodyX: whoWonGeo.bodyX, bw: 46 }} wickWidth={5} bodyRx={7} />
                    </svg>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => answerWhoWon("bull")}
                    className="flex max-w-[230px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#22c55e]/40 bg-[#22c55e]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17 9 11l4 4 8-8" />
                      <path d="M15 7h6v6" />
                    </svg>
                    Buyers won
                  </button>
                  <button
                    type="button"
                    onClick={() => answerWhoWon("bear")}
                    className="flex max-w-[230px] flex-1 flex-col items-center gap-1.5 rounded-2xl border-2 border-[#ef4444]/40 bg-[#ef4444]/10 px-4 py-[18px] text-base font-extrabold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 7 9 13l4-4 8 8" />
                      <path d="M15 17h6v-6" />
                    </svg>
                    Sellers won
                  </button>
                </div>
                <div className="mt-4 min-h-[52px]">
                  <FeedbackBanner center fb={state.whoWon.fb} />
                </div>
              </div>
            )}

            {step === 7 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow>LEARN · THE WICKS</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">The thin lines are prices the market rejected</h2>
                <p className="mx-auto mb-6 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Those spikes above and below the body are <b className="text-white">wicks</b> (also called shadows). They mark the
                  extremes price reached before snapping back. Tap each wick to learn what it means.
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
                        <CandleShape g={{ ...wickGeo, cx: 100, bodyX: 70, bw: 60 }} />
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
                        {state.wick.seen.upper ? WICK_INFO.upper : "Tap the wick above the body to reveal what it means."}
                      </div>
                    </div>
                    <div className={`rounded-2xl border px-[17px] py-[15px] transition-all ${state.wick.active === "lower" ? "border-blue/50" : "border-border-subtle"} bg-brill-700`}>
                      <div className="mb-0.5 flex items-center gap-2 text-sm font-extrabold text-white">
                        <span className="h-[9px] w-[9px] rounded-full bg-blue-light" />
                        Lower wick
                      </div>
                      <div className="text-[13px] leading-relaxed text-text-secondary">
                        {state.wick.seen.lower ? WICK_INFO.lower : "Tap the wick below the body to reveal what it means."}
                      </div>
                    </div>
                    <div className="flex gap-2.5 rounded-2xl border border-blue/20 bg-[#0d0d0d] px-4 py-3.5 text-[13px] leading-relaxed text-[#cdd]">
                      <BulbIcon />
                      <span>Long wick = a strong rejection. The market tried that price and got pushed straight back.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 8 && (
              <div className="mx-auto max-w-[760px] text-center">
                <SectionEyebrow tone="gold">CHALLENGE · FIND THE WICK</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">{state.hotspot.task === 0 ? "Tap the UPPER wick" : "Now tap the LOWER wick"}</h2>
                <p className="mb-2 text-[15px] text-text-secondary">Click directly on the wick.</p>
                <div className="my-3.5 flex justify-center">
                  <svg width={220} height={330} viewBox="0 0 220 330" style={{ overflow: "visible" }}>
                    <rect
                      onClick={() => tapHotspot("upper")}
                      x={40}
                      y={hotspotGeo.upY1 - 4}
                      width={140}
                      height={Math.max(10, hotspotGeo.upY2 - hotspotGeo.upY1 + 8)}
                      rx={8}
                      fill={state.hotspot.hit === "upper" ? "rgba(69,109,255,.25)" : "rgba(255,255,255,.02)"}
                      stroke={state.hotspot.hit === "upper" ? "#456dff" : "rgba(255,255,255,.18)"}
                      strokeWidth={2}
                      strokeDasharray="6 5"
                      style={{ cursor: "pointer", transition: "all .2s" }}
                    />
                    <rect
                      onClick={() => tapHotspot("lower")}
                      x={40}
                      y={hotspotGeo.loY1 - 4}
                      width={140}
                      height={Math.max(10, hotspotGeo.loY2 - hotspotGeo.loY1 + 8)}
                      rx={8}
                      fill={state.hotspot.hit === "lower" ? "rgba(69,109,255,.25)" : "rgba(255,255,255,.02)"}
                      stroke={state.hotspot.hit === "lower" ? "#456dff" : "rgba(255,255,255,.18)"}
                      strokeWidth={2}
                      strokeDasharray="6 5"
                      style={{ cursor: "pointer", transition: "all .2s" }}
                    />
                    <g style={{ pointerEvents: "none" }}>
                      <CandleShape g={hotspotGeo} />
                    </g>
                  </svg>
                </div>
                <div className="min-h-[48px]">
                  <FeedbackBanner center fb={state.hotspot.fb} />
                </div>
              </div>
            )}

            {step === 9 && (
              <div className="mx-auto max-w-[900px]">
                <SectionEyebrow>LEARN · READING THE SHAPE</SectionEyebrow>
                <h2 className="mb-1.5 text-center text-2xl font-extrabold sm:text-[27px]">Now put it together — the shape is the story</h2>
                <p className="mx-auto mb-5 max-w-[560px] text-center text-[15px] text-text-secondary">
                  Body size and wick length reveal the fight between buyers and sellers. Tap each candle to hear what it&apos;s saying.
                </p>
                <div className="mb-4.5 flex flex-wrap justify-center gap-3.5">
                  {READING_SHAPES.map((sh) => {
                    const g = geo(sh.o, sh.h, sh.l, sh.c, 70, 150, 30, 14);
                    const on = state.shape.active === sh.id;
                    return (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => tapShape(sh.id)}
                        className={`w-[150px] rounded-[18px] border-2 bg-black px-2.5 pb-3.5 pt-4 transition-all hover:-translate-y-1 ${on ? "border-gold" : "border-border"}`}
                      >
                        <svg width={70} height={150} viewBox="0 0 70 150" className="mx-auto mb-2 block">
                          <CandleShape g={{ ...g, cx: 35, bodyX: g.bodyX, bw: 30 }} wickWidth={5} bodyRx={5} />
                        </svg>
                        <div className={`text-[13px] font-extrabold ${on ? "text-gold" : "text-[#ccc]"}`}>{sh.name}</div>
                      </button>
                    );
                  })}
                </div>
                <div key={state.shape.active ?? "none"} className="mx-auto min-h-[74px] max-w-[600px] animate-pop-in rounded-2xl border border-border-subtle bg-brill-700 px-5 py-4 text-center">
                  <div className="mb-0.5 text-[15px] font-extrabold text-gold">
                    {state.shape.active ? READING_SHAPES.find((s) => s.id === state.shape.active)!.title : "Tap a candle to reveal its story"}
                  </div>
                  <div className="text-sm leading-relaxed text-[#ccc]">
                    {state.shape.active ? READING_SHAPES.find((s) => s.id === state.shape.active)!.sub : "Each shape below is a different balance of buyers and sellers."}
                  </div>
                </div>
              </div>
            )}

            {step === 10 && (
              <div className="mx-auto max-w-[820px]">
                <SectionEyebrow tone="gold">CHALLENGE · SHAPE → MEANING</SectionEyebrow>
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Match each shape to the story it tells</h2>
                <p className="mb-6 text-center text-[15px] text-text-secondary">
                  Tap a candle, then tap the meaning that fits it. {matchedCount} of 4 matched.
                </p>
                <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
                  <div className="flex flex-col gap-3">
                    {MATCH_PAIRS.map((p) => {
                      const g = geo(p.o, p.h, p.l, p.c, 46, 78, 22, 8);
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
                          <svg width={46} height={78} viewBox="0 0 46 78" className="shrink-0">
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
                <h2 className="mb-1 text-center text-2xl font-extrabold sm:text-[26px]">Build the candle the story describes</h2>
                <p className="mb-5 text-center text-[15px] text-text-secondary">
                  &quot;Buyers pushed hard, got <b className="text-white">rejected at the highs</b>, but still closed up.&quot; Move the
                  four sliders until every check turns blue.
                </p>
                <div className="grid gap-6 rounded-3xl border border-border bg-black p-6 md:grid-cols-[260px_1fr]">
                  <div className="flex items-center justify-center">
                    <svg width={200} height={320} viewBox="0 0 200 320" style={{ overflow: "visible" }}>
                      <line x1={10} y1={20} x2={190} y2={20} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <line x1={10} y1={160} x2={190} y2={160} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <line x1={10} y1={300} x2={190} y2={300} stroke="rgba(255,255,255,.05)" strokeWidth={1} />
                      <CandleShape g={buildGeo} />
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
                          <span className="font-mono text-[#ccc]">{state.build[sl.k]}</span>
                        </div>
                        <div
                          onPointerDown={beginPercentSlide((v) => setBuildValue(sl.k, v))}
                          className="relative flex h-[22px] cursor-grab touch-none select-none items-center"
                        >
                          <div className="absolute left-0 right-0 h-2 rounded-md bg-brill-600" />
                          <div className="absolute left-0 h-2 rounded-md" style={{ width: `${state.build[sl.k]}%`, background: sl.fill }} />
                          <div
                            className="absolute h-[22px] w-[22px] rounded-full border-[3px] bg-white shadow-[0_2px_8px_rgba(0,0,0,.5)]"
                            style={{ left: `${state.build[sl.k]}%`, borderColor: sl.thumb, transform: "translateX(-11px)" }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="mt-4.5 flex flex-col gap-2">
                      {[
                        { label: "Bullish body (closes up)", ok: state.build.c > state.build.o && Math.abs(state.build.c - state.build.o) >= 8 },
                        { label: "Long upper wick (rejection)", ok: state.build.h - Math.max(state.build.o, state.build.c) >= 18 },
                        { label: "Little to no lower wick", ok: Math.min(state.build.o, state.build.c) - state.build.l <= 8 },
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
                <SectionEyebrow tone="gold">FINAL CHALLENGE · ROUND {Math.min(state.spotIt.round + 1, 3)}/3</SectionEyebrow>
                <h2 className="mb-1 text-2xl font-extrabold sm:text-[26px]">{spotItRound.prompt}</h2>
                <p className="mb-6 text-[15px] text-text-secondary">Tap the candle that fits.</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {spotItRound.candles.map((cd, i) => {
                    const g = geo(cd.o, cd.h, cd.l, cd.c, 84, 180, 34, 16);
                    const ok = state.spotIt.okIdx === i;
                    const wrong = state.spotIt.wrongIdx === i;
                    return (
                      <div
                        key={i}
                        onClick={() => tapSpotIt(i)}
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
                  <FeedbackBanner center fb={state.spotIt.fb} />
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
                    <line x1={12} y1={2} x2={12} y2={7} />
                    <rect x={8} y={7} width={8} height={10} rx={2} fill="#fff" stroke="none" />
                    <line x1={12} y1={17} x2={12} y2={22} />
                  </svg>
                </motion.div>
                <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-gold">BADGE UNLOCKED</div>
                <h1 className="mb-1.5 text-[32px] font-black sm:text-[34px]">Candle Anatomist</h1>
                <p className="mb-6 text-base text-text-secondary">You can dissect any candle on sight. Onto reading patterns next.</p>
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
