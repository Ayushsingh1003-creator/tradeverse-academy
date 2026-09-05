"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickChart,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LineChart,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useUserStore } from "@/lib/store";
import {
  DECK_CARDS,
  MINI_SERIES,
  deckCardXp,
  type DeckCard,
  type DeckIconKey,
} from "@/components/dashboard/shell/deckData";

const CARD_GAP = 16;

const ICONS: Record<DeckIconKey, typeof Clock> = {
  candle: CandlestickChart,
  clock: Clock,
  levels: LineChart,
  trend: TrendingUp,
  trophy: Trophy,
};

/** Candle sketch behind each card, drawn from the card's OHLC rows. */
function MiniChart({ art }: { art: DeckCard["art"] }) {
  const rows = MINI_SERIES[art];
  const W = 240;
  const H = 104;
  const pad = 12;
  const y = (v: number) => H - pad - (v / 100) * (H - 2 * pad);
  const step = W / (rows.length + 1);

  return (
    <svg className="tvd-mini" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      {art === "c" ? (
        <>
          <line x1="10" y1="26" x2="230" y2="26" stroke="var(--tv-mute)" strokeWidth="1.5" strokeDasharray="5 5" />
          <line x1="10" y1="76" x2="230" y2="76" stroke="var(--tv-mute)" strokeWidth="1.5" strokeDasharray="5 5" />
        </>
      ) : null}
      {art === "b" ? (
        <line x1="120" y1="8" x2="120" y2="96" stroke="var(--tv-line-hi)" strokeWidth="1.5" strokeDasharray="4 4" />
      ) : null}
      {art === "d" ? <line x1="12" y1="82" x2="228" y2="22" stroke="var(--tv-gold)" strokeWidth="2" /> : null}
      {art === "e" ? (
        <path
          d="M26 46 L74 26 L122 52 L170 26 L218 50"
          fill="none"
          stroke="var(--tv-blue)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ) : null}
      {rows.map((d, i) => {
        const cx = step * (i + 1);
        const color = d[3] >= d[0] ? "var(--tv-up)" : "var(--tv-down)";
        const top = y(Math.max(d[0], d[3]));
        const bottom = y(Math.min(d[0], d[3]));
        return (
          <g key={i}>
            <line x1={cx} y1={y(d[1])} x2={cx} y2={y(d[2])} stroke={color} strokeWidth="2.4" strokeLinecap="round" />
            <rect x={cx - 7} y={top} width="14" height={Math.max(3, bottom - top)} rx="3" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

type CardState = "done" | "now" | "open" | "boss";

export function LessonDeck() {
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);
  const deckRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const jumpedToNext = useRef(false);

  const nextSlug = useMemo(
    () => DECK_CARDS.find((c) => !lessonsCompleted.includes(c.slug))?.slug ?? null,
    [lessonsCompleted],
  );

  const go = useCallback((i: number, smooth = true) => {
    const deck = deckRef.current;
    if (!deck) return;
    const clamped = Math.max(0, Math.min(DECK_CARDS.length - 1, i));
    deck.scrollTo({ left: clamped * (deck.clientWidth + CARD_GAP), behavior: smooth ? "smooth" : "auto" });
    setIndex(clamped);
  }, []);

  // Open on the lesson the learner is actually up next on.
  useEffect(() => {
    if (jumpedToNext.current || !nextSlug) return;
    jumpedToNext.current = true;
    const target = DECK_CARDS.findIndex((c) => c.slug === nextSlug);
    if (target > 0) go(target, false);
  }, [go, nextSlug]);

  const onScroll = () => {
    const deck = deckRef.current;
    if (!deck) return;
    const i = Math.round(deck.scrollLeft / (deck.clientWidth + CARD_GAP));
    setIndex(Math.max(0, Math.min(DECK_CARDS.length - 1, i)));
  };

  return (
    <section className="tvd-deckwrap">
      <div className="tvd-deckhead">
        <h2>Lesson Deck</h2>
        <div className="tvd-arrows">
          <button
            type="button"
            className="tvd-arrow"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous lesson card"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="tvd-arrow"
            onClick={() => go(index + 1)}
            disabled={index === DECK_CARDS.length - 1}
            aria-label="Next lesson card"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        </div>
      </div>

      <div
        className="tvd-deck"
        ref={deckRef}
        tabIndex={0}
        role="group"
        aria-label="Lessons in this unit"
        onScroll={onScroll}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(index + 1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(index - 1);
          }
        }}
      >
        {DECK_CARDS.map((card) => {
          const done = lessonsCompleted.includes(card.slug);
          const isNext = card.slug === nextSlug;
          const state: CardState = done ? "done" : isNext ? "now" : card.boss ? "boss" : "open";
          const Icon = ICONS[card.icon];
          const xp = deckCardXp(card.slug);
          const cta = done ? "REVIEW" : isNext ? "START LESSON" : card.boss ? "TAKE UNIT TEST" : "START";

          return (
            <article className="tvd-lcard" key={card.slug} data-s={state}>
              <div className="tvd-art">
                <span className="tvd-badge">{card.badge}</span>
                <span className="tvd-ico">
                  {done ? <Check size={19} aria-hidden /> : <Icon size={19} aria-hidden />}
                </span>
                <MiniChart art={card.art} />
              </div>
              <div className="tvd-lbody">
                <div>
                  <div className="tvd-eyebrow">{done ? "Completed" : isNext ? "Up next" : card.eyebrow}</div>
                  <h3>{card.title}</h3>
                </div>
                <p className="tvd-blurb">{card.blurb}</p>
                <div className="tvd-meta">
                  <span>{card.minutes} min</span>
                  {card.note ? <span>{card.note}</span> : null}
                  <span>+{xp} XP</span>
                </div>
                <Link href={`/learn/${card.slug}`} className="tvd-cta">
                  {cta}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="tvd-dots" role="tablist" aria-label="Lesson card">
        {DECK_CARDS.map((card, i) => (
          <button
            key={card.slug}
            type="button"
            role="tab"
            aria-current={i === index}
            aria-label={`Lesson ${i + 1}: ${card.title}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </section>
  );
}
