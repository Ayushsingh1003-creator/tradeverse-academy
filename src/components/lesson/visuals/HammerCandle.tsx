"use client";

import { useEffect, useState } from "react";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { CANDLE_BEAR, CANDLE_BULL } from "@/lib/candleColors";
import { sound } from "@/lib/sounds";

const NARRATION: Record<number, string> = {
  0: "Walk through how a hammer forms after selling pressure — tap Next →.",
  1: "Bearish candles lead into the reversal zone — sellers had control.",
  2: "Candle 3 opens near the top of the range.",
  3: "Sellers hit the market and push price sharply lower.",
  4: "Buyers step in hard, reject the lows, and leave a long lower wick.",
  5: "Small body near the top = hammer head. Long wick below = rejection handle.",
  6: "Hammer: a potential bullish reversal after a downtrend.",
};

type Props = {
  onPlaybackActiveChange?: (blocksLessonContinue: boolean) => void;
};

export function HammerCandle({ onPlaybackActiveChange }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    onPlaybackActiveChange?.(step < 6);
  }, [step, onPlaybackActiveChange]);

  const next = () => {
    sound.tick();
    setStep((s) => Math.min(6, s + 1));
  };

  const replay = () => {
    sound.tick();
    setStep(0);
  };

  return (
    <div className="flex w-full max-w-2xl flex-col items-stretch gap-4">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-slate-900/40 p-2 md:p-4">
        <svg
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto block h-[min(70vh,400px)] w-full max-w-full"
          role="img"
          aria-label="Hammer candle story"
        >
          <defs>
            <linearGradient id="hammerBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="400" height="300" fill="url(#hammerBg)" />

          {[48, 92, 136, 180, 224].map((y) => (
            <line key={y} x1="44" y1={y} x2="388" y2={y} stroke="#334155" strokeWidth="1" strokeDasharray="4 5" opacity="0.55" />
          ))}
          <text x="6" y="52" fill="#64748b" fontSize="11">
            $105
          </text>
          <text x="6" y="96" fill="#64748b" fontSize="11">
            $101
          </text>
          <text x="6" y="140" fill="#64748b" fontSize="11">
            $99
          </text>
          <text x="6" y="232" fill="#f87171" fontSize="11">
            $87
          </text>

          {step >= 1 ? (
            <g>
              <CandlestickSvg cx={70} bodyWidth={32} ohlc={{ o: 52, h: 36, l: 148, c: 128 }} bodyRx={3} wickWidth={2.5} />
              <text x="70" y="166" fill="#fca5a5" fontSize="10" textAnchor="middle">
                Candle 1
              </text>
              <CandlestickSvg cx={132} bodyWidth={32} ohlc={{ o: 82, h: 64, l: 178, c: 164 }} bodyRx={3} wickWidth={2.5} />
              <text x="132" y="194" fill="#fca5a5" fontSize="10" textAnchor="middle">
                Candle 2
              </text>
            </g>
          ) : null}

          {step >= 2 ? (
            <g>
              <line x1="248" y1="104" x2="286" y2="104" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
              <text x="268" y="95" fill="#f8fafc" fontSize="10" textAnchor="middle">
                Open
              </text>
            </g>
          ) : null}

          {step >= 3 ? (
            <g>
              {/* Step 3: sellers drive price from OPEN down to LOW — show a full red bearish body */}
              {step === 3 ? (
                <>
                  <CandlestickSvg
                    cx={268}
                    bodyWidth={38}
                    ohlc={{ o: 104, h: 104, l: 278, c: 278 }}
                    bodyRx={4}
                    className="animate-fade-in-soft"
                  />
                  <line
                    x1="248"
                    y1="278"
                    x2="286"
                    y2="278"
                    stroke="#f8fafc"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <text x="296" y="282" fill="#f8fafc" fontSize="10">
                    Low
                  </text>
                </>
              ) : (
                <line x1="268" y1="104" x2="268" y2="278" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />
              )}
              <line x1="228" y1="242" x2="268" y2="242" stroke={CANDLE_BEAR} strokeWidth="2" />
              <polygon points="268,242 260,237 260,247" fill={CANDLE_BEAR} />
            </g>
          ) : null}

          {step >= 3 && step < 5 ? (
            <g>
              <rect x="228" y="238" width="80" height="34" fill="rgba(239,68,68,0.14)" stroke={CANDLE_BEAR} strokeWidth="1" strokeDasharray="3 2" rx="4" />
              <text x="268" y="256" fill="#fca5a5" fontSize="9" textAnchor="middle">
                Sellers pushed HERE
              </text>
              {step >= 4 ? (
                <text x="268" y="268" fill="#88C9F7" fontSize="9" textAnchor="middle">
                  Buyers rejected it ↑
                </text>
              ) : null}
            </g>
          ) : null}

          {step >= 4 ? (
            <g>
              <CandlestickSvg
                cx={268}
                bodyWidth={38}
                ohlc={{ o: 108, h: 92, l: 228, c: 76 }}
                bodyRx={4}
                className="animate-fade-in-soft"
              />
              <text x="118" y="206" fill="#88C9F7" fontSize="11">
                Buyers stepped in ↑
              </text>
            </g>
          ) : null}

          {step >= 5 ? (
            <g>
              <line x1="318" y1="92" x2="289" y2="92" stroke="#456DFF" strokeWidth="1.2" strokeDasharray="3 2" />
              <text x="324" y="96" fill="#88C9F7" fontSize="12" fontWeight="700">
                HEAD
              </text>
              <line x1="318" y1="188" x2="273" y2="188" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2" />
              <text x="324" y="192" fill="#cbd5e1" fontSize="12" fontWeight="600">
                HANDLE
              </text>
            </g>
          ) : null}

          {step >= 6 ? (
            <g>
              <circle cx="268" cy="158" r="92" fill="none" stroke="#F7C325" strokeWidth="2.5" className="animate-hammer-ring" opacity="0.95" />
              <text x="268" y="28" fill="#F7C325" fontSize="14" fontWeight="800" textAnchor="middle">
                🔨 HAMMER
              </text>
              <text x="268" y="46" fill="#94a3b8" fontSize="10" textAnchor="middle">
                Potential reversal signal
              </text>
            </g>
          ) : null}
        </svg>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl border border-slate-600/80 bg-slate-950/90 px-3 py-2.5 text-center text-xs leading-snug text-slate-200 shadow-lg md:text-sm">
          {NARRATION[step]}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {step < 6 ? (
          <button
            type="button"
            onClick={next}
            className="min-h-[48px] rounded-2xl bg-accent px-8 py-3 text-base font-bold text-slate-900 shadow-lg shadow-accent/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            Next →
          </button>
        ) : (
          <button
            type="button"
            onClick={replay}
            className="min-h-[48px] rounded-2xl border-2 border-accent bg-accent/15 px-8 py-3 text-base font-bold text-accent shadow-inner transition hover:bg-accent/25 active:scale-[0.98]"
          >
            ↺ Replay story
          </button>
        )}
      </div>
    </div>
  );
}
