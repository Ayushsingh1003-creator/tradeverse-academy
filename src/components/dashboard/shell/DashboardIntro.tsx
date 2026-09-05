"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CandlestickChart, Clock, LineChart, TrendingUp, Trophy } from "lucide-react";
import { DECK_CARDS, deckCardXp, type DeckIconKey } from "@/components/dashboard/shell/deckData";

const ICONS: Record<DeckIconKey, typeof Clock> = {
  candle: CandlestickChart,
  clock: Clock,
  levels: LineChart,
  trend: TrendingUp,
  trophy: Trophy,
};

/** The card that rises and flips — the lesson the deck opens on. */
const HERO = 2;
const FAN = [-28, -14, 0, 14, 28];
const STACK = [-3, -1.5, 0, 1.5, 3];
const SPARK_COUNT = 14;
const RUN_MS = 3600;
const REDUCED_RUN_MS = 1400;
const FADE_MS = 680;

/** Deterministic jitter — keeps server and client markup identical. */
function jitter(i: number) {
  const v = Math.sin(i * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

const SPARKS = Array.from({ length: SPARK_COUNT }, (_, i) => {
  const angle = (i / SPARK_COUNT) * Math.PI * 2;
  const dist = 80 + jitter(i) * 46;
  return {
    dx: `${Math.round(Math.cos(angle) * dist)}px`,
    dy: `${Math.round(-Math.sin(angle) * dist)}px`,
    color: i % 3 === 0 ? "var(--tv-gold)" : i % 3 === 1 ? "var(--tv-up)" : "var(--tv-blue)",
    delay: `${(2.22 + jitter(i + 99) * 0.12).toFixed(2)}s`,
  };
});

function CardFace({ index }: { index: number }) {
  const card = DECK_CARDS[index];
  const Icon = ICONS[card.icon];
  return (
    <>
      <div className="tvd-dart">
        <Icon size={29} aria-hidden />
      </div>
      <div className="tvd-dlab">{card.badge}</div>
      <div className="tvd-dname">{card.title}</div>
      <div className="tvd-dxp">+{deckCardXp(card.slug)} XP</div>
    </>
  );
}

export function DashboardIntro({ onDone }: { onDone: () => void }) {
  const [closing, setClosing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const endedRef = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const runMs = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? REDUCED_RUN_MS : RUN_MS;

    const end = () => {
      if (endedRef.current) return;
      endedRef.current = true;
      setClosing(true);
      window.setTimeout(() => doneRef.current(), FADE_MS);
    };

    const timer = window.setTimeout(end, runMs);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " ") {
        e.preventDefault();
        end();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const skip = () => {
    if (endedRef.current) return;
    endedRef.current = true;
    setClosing(true);
    window.setTimeout(() => doneRef.current(), FADE_MS);
  };

  const cards = reduced ? [HERO] : DECK_CARDS.map((_, i) => i);

  return (
    <div
      className="tvd-splash"
      data-done={closing ? "" : undefined}
      role="status"
      aria-label="Tradeverse Academy loading"
      onClick={(e) => {
        if (e.target === e.currentTarget) skip();
      }}
    >
      <div className="tvd-frame">
        <div
          className="tvd-tablerow"
          onClick={(e) => {
            if (e.target === e.currentTarget) skip();
          }}
        >
          <div className="tvd-shadowpool" aria-hidden />
          {reduced ? null : <div className="tvd-ring" aria-hidden />}

          {cards.map((i) => {
            const isHero = i === HERO;
            return (
              <div
                key={DECK_CARDS[i].slug}
                className={isHero ? "tvd-dcard tvd-hero" : "tvd-dcard"}
                style={
                  {
                    "--tvd-fan": `${FAN[i]}deg`,
                    "--tvd-stack": `${STACK[i]}deg`,
                    zIndex: isHero ? 3 : 1,
                    animationDelay: `${(0.1 + i * 0.09).toFixed(2)}s, 1.02s`,
                  } as CSSProperties
                }
                aria-hidden
              >
                {isHero ? (
                  <div className="tvd-flipper">
                    <div className="tvd-dface">
                      <CardFace index={i} />
                    </div>
                    <div className="tvd-dface tvd-front">
                      <CandlestickChart size={56} aria-hidden />
                      {reduced ? null : <span className="tvd-sheen" />}
                    </div>
                  </div>
                ) : (
                  <div className="tvd-dface">
                    <CardFace index={i} />
                  </div>
                )}
              </div>
            );
          })}

          {reduced
            ? null
            : SPARKS.map((s, i) => (
                <i
                  key={i}
                  className="tvd-spark"
                  aria-hidden
                  style={
                    {
                      "--tvd-dx": s.dx,
                      "--tvd-dy": s.dy,
                      background: s.color,
                      animationDelay: s.delay,
                    } as CSSProperties
                  }
                />
              ))}
        </div>

        <div className="tvd-titlerow">
          <div className="tvd-word">
            Tradeverse<span className="tvd-worddot">.</span>
          </div>
          <div className="tvd-subline">
            <i aria-hidden />
            UNIT 1 · {DECK_CARDS.length === 5 ? "FIVE" : DECK_CARDS.length} LESSONS DEALT
            <i aria-hidden />
          </div>
        </div>
      </div>

      <button type="button" className="tvd-skip" onClick={skip}>
        Skip intro
      </button>
    </div>
  );
}
