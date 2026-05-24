"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import SwiperCore from "swiper";
import { EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { useUserStore } from "@/lib/store";
import { LESSONS, type Lesson } from "@/lib/data/lessons";

const CARDS = [
  {
    id: "c1",
    title: "Candlestick Foundations",
    levelLabel: "LEVEL 1",
    levelTitle: "Reading Candles",
    accentColor: "#456DFF",
    accentDark: "#1A2A6A",
    emoji: "🕯️",
    recommended: false,
    lessonSlugs: ["what-is-a-candlestick", "bullish-vs-bearish-candles"],
    startHref: "/learn/what-is-a-candlestick",
  },
  {
    id: "c2",
    title: "Hammer & Shooting Star",
    levelLabel: "LEVEL 2",
    levelTitle: "Reversal Signals",
    accentColor: "#8B5CF6",
    accentDark: "#2D1B5A",
    emoji: "🔨",
    recommended: true,
    lessonSlugs: ["hammer-shooting-star"],
    startHref: "/learn/hammer-shooting-star",
  },
  {
    id: "c3",
    title: "Support & Resistance",
    levelLabel: "LEVEL 3",
    levelTitle: "Price Structure",
    accentColor: "#F59E0B",
    accentDark: "#4A2E00",
    emoji: "🎯",
    recommended: true,
    lessonSlugs: ["support-and-resistance", "trend-analysis"],
    startHref: "/learn/support-and-resistance",
  },
  {
    id: "c4",
    title: "RSI & Momentum",
    levelLabel: "LEVEL 1",
    levelTitle: "Momentum Indicators",
    accentColor: "#10B981",
    accentDark: "#052E1A",
    emoji: "📊",
    recommended: false,
    lessonSlugs: ["rsi-basics"],
    startHref: "/learn/rsi-basics",
  },
  {
    id: "c5",
    title: "Risk Management",
    levelLabel: "LEVEL 1",
    levelTitle: "Capital Protection",
    accentColor: "#EF4444",
    accentDark: "#3A0A0A",
    emoji: "🛡️",
    recommended: false,
    lessonSlugs: ["support-and-resistance"],
    startHref: "/courses",
  },
] as const;

function MiniChart({ accent }: { accent: string }) {
  const id = accent.replace("#", "sg");
  return (
    <div className="relative flex h-[160px] w-full items-center justify-center overflow-hidden">
      <svg viewBox="0 0 260 120" className="w-full max-w-[260px] overflow-visible">
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${id}`}>
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[25, 55, 85].map((y) => (
          <line key={y} x1="0" y1={y} x2="260" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <path
          d="M0,105 L30,85 L65,95 L95,70 L125,60 L155,48 L185,35 L215,24 L245,14 L260,10 L260,120 L0,120Z"
          fill={`url(#area-${id})`}
        />
        <path
          d="M0,105 L30,85 L65,95 L95,70 L125,60 L155,48 L185,35 L215,24 L245,14 L260,10"
          fill="none"
          stroke={accent}
          strokeWidth="2"
          filter={`url(#glow-${id})`}
          strokeLinecap="round"
        />
        {[
          { x: 30, o: 85, c: 72, h: 66, l: 90 },
          { x: 65, o: 72, c: 80, h: 66, l: 84 },
          { x: 95, o: 80, c: 65, h: 59, l: 84 },
          { x: 125, o: 65, c: 55, h: 48, l: 68 },
          { x: 155, o: 55, c: 44, h: 38, l: 58 },
          { x: 185, o: 44, c: 32, h: 26, l: 47 },
          { x: 215, o: 32, c: 22, h: 16, l: 35 },
          { x: 245, o: 22, c: 12, h: 8, l: 25 },
        ].map((c, i) => (
          <g key={i} className="candle-bar" style={{ animationDelay: `${i * 0.07}s` }}>
            <line
              x1={c.x}
              y1={c.h}
              x2={c.x}
              y2={c.l}
              stroke={c.c < c.o ? accent : "#FF5D5D"}
              strokeWidth="1.5"
              opacity="0.7"
            />
            <rect
              x={c.x - 5}
              y={Math.min(c.o, c.c)}
              width="10"
              height={Math.max(2, Math.abs(c.o - c.c))}
              rx="1.5"
              fill={c.c < c.o ? accent : "#FF5D5D"}
              opacity="0.9"
            />
          </g>
        ))}
        <circle cx="260" cy="10" r="4" fill={accent}>
          <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="260" cy="10" r="10" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        <rect x="210" y="1" width="46" height="16" rx="4" fill={accent} opacity="0.9" />
        <text x="233" y="12" fill="white" fontSize="9" fontWeight="700" textAnchor="middle">
          +12.4%
        </text>
      </svg>
    </div>
  );
}

function LessonRow({
  title,
  isNext,
  accent,
  done,
}: {
  title: string;
  isNext: boolean;
  accent: string;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-white/[0.06] py-2.5 first:border-0">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm"
        style={{
          background: isNext ? `${accent}22` : "rgba(255,255,255,0.04)",
          border: isNext ? `1.5px solid ${accent}55` : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isNext ? `0 0 10px ${accent}22` : "none",
        }}
      >
        {done ? "✓" : isNext ? "→" : "○"}
      </div>
      <span
        className="flex-1 text-sm"
        style={{
          color: done ? "#88C9F7" : isNext ? "white" : "rgba(255,255,255,0.35)",
          fontWeight: isNext ? 600 : 400,
        }}
      >
        {title}
      </span>
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{
          background: done ? accent : isNext ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      />
    </div>
  );
}

export default function CourseCardStack() {
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);
  const swiperRef = useRef<SwiperCore | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const goTo = (idx: number) => {
    swiperRef.current?.slideTo(idx);
  };

  return (
    <div className="min-w-0 w-full max-w-full">
      <p className="mb-4 text-[15px] font-semibold text-[rgba(255,255,255,0.5)]">Jump back in</p>

      <div
        className="min-w-0 max-w-full overflow-x-clip"
        style={{ perspective: "1200px", WebkitPerspective: "1200px" }}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => setActiveIdx(swiper.activeIndex)}
          modules={[EffectCoverflow]}
          effect="coverflow"
          grabCursor
          centeredSlides
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.06 },
            900: { slidesPerView: 1.08 },
          }}
          speed={400}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2,
            scale: 1,
            slideShadows: false,
          }}
          className="course-deck-swiper"
          style={{ overflow: "visible" }}
        >
          {CARDS.map((card) => {
            const cardLessons: Lesson[] = card.lessonSlugs
              .map((slug) => LESSONS.find((l) => l.slug === slug))
              .filter((l): l is Lesson => Boolean(l));
            const nextLesson = cardLessons.find((l) => !lessonsCompleted.includes(l.slug));
            const allDone = cardLessons.length > 0 && cardLessons.every((l) => lessonsCompleted.includes(l.slug));

            return (
              <SwiperSlide key={card.id}>
                <div
                  className="mx-auto w-full max-w-[556px] overflow-hidden rounded-[20px]"
                  style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: "#1A1A1A",
                  }}
                >
                  <div
                    style={{
                      background: `linear-gradient(180deg, ${card.accentDark} 0%, #111 100%)`,
                      position: "relative",
                      padding: 0,
                    }}
                  >
                    {card.recommended ? (
                      <div
                        className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ background: card.accentColor, opacity: 0.9 }}
                      >
                        Recommended
                      </div>
                    ) : null}

                    <div className="relative h-[160px] w-full">
                      <MiniChart accent={card.accentColor} />
                      <div
                        className="animate-float absolute left-5 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${card.accentColor}33, ${card.accentColor}11)`,
                          border: `1.5px solid ${card.accentColor}44`,
                        }}
                      >
                        {card.emoji}
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-4">
                    <p
                      className="mb-1 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: card.accentColor }}
                    >
                      {card.levelLabel} · {card.levelTitle}
                    </p>

                    <h3 className="mb-4 text-[22px] font-black leading-tight text-white">{card.title}</h3>

                    <div className="mb-5">
                      {cardLessons.slice(0, 2).map((lesson) => (
                        <LessonRow
                          key={lesson.slug}
                          title={lesson.title}
                          isNext={lesson === nextLesson}
                          accent={card.accentColor}
                          done={lessonsCompleted.includes(lesson.slug)}
                        />
                      ))}
                    </div>

                    <Link
                      href={nextLesson ? `/learn/${nextLesson.slug}` : card.startHref}
                      className="block w-full rounded-[60px] py-[13px] text-center text-[15px] font-bold text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
                      style={{
                        background: card.accentColor,
                        boxShadow: `0 4px 20px ${card.accentColor}44`,
                      }}
                    >
                      {allDone ? "Review" : nextLesson ? "Start" : "Continue →"}
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <div className="mt-5 flex min-w-0 gap-1.5 sm:gap-2">
        {CARDS.map((card, i) => {
          const isActive = i === activeIdx;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => goTo(i)}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[14px] px-0.5 py-2.5 transition-all duration-200 sm:gap-1.5 sm:py-3"
              style={{
                background: isActive ? `${card.accentColor}18` : "rgba(255,255,255,0.04)",
                border: isActive ? `2px solid ${card.accentColor}88` : "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                boxShadow: isActive ? `inset 0 0 12px ${card.accentColor}15` : "none",
              }}
            >
              <span className="text-xl">{card.emoji}</span>
              <span
                className="line-clamp-2 w-full max-w-full break-words text-center text-[9px] leading-tight sm:text-[10px]"
                style={{
                  color: isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.35)",
                  fontWeight: isActive ? 600 : 400,
                }}
                title={card.title}
              >
                {card.title.split(" ").slice(0, 2).join(" ")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
