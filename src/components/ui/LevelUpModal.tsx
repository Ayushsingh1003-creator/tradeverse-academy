"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Confetti } from "@/components/ui/Confetti";
import { Button } from "@/components/ui/Button";
import { getLevelTitle, xpForLevel } from "@/lib/progression";
import { sound } from "@/lib/sounds";

function levelAccent(level: number): string {
  if (level >= 45) return "#FB7185";
  if (level >= 35) return "#A78BFA";
  if (level >= 25) return "#22D3EE";
  if (level >= 15) return "#F7C325";
  if (level >= 8) return "#456DFF";
  return "#88C9F7";
}

export function LevelUpModal({
  open,
  level,
  onClose,
}: {
  open: boolean;
  level: number;
  onClose: () => void;
}) {
  const title = getLevelTitle(level);
  const accent = levelAccent(level);
  const nextXp = xpForLevel(level);

  useEffect(() => {
    if (!open) return;
    sound.levelUp();
    const timeout = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timeout);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal
          aria-labelledby="level-up-title"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[#0a0a0a]/80 backdrop-blur-sm"
            aria-hidden
          />

          <Confetti active count={56} />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] border border-white/10 bg-[#171717] text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_64px_rgba(0,0,0,0.55)]"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#456DFF] to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
              style={{ background: accent }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[#456DFF]/25 blur-3xl"
              aria-hidden
            />

            <div className="relative px-8 pb-8 pt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#F7C325]">
                Milestone reached
              </p>

              <div className="relative mx-auto mt-6 flex h-[120px] w-[120px] items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: `${accent}55` }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div
                  className="absolute inset-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 25%, ${accent}44, transparent 55%), linear-gradient(160deg, #2a2a2a, #141414)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 32px ${accent}33`,
                  }}
                />
                <span
                  className="relative text-5xl font-black tabular-nums text-white"
                  style={{ textShadow: `0 0 24px ${accent}88` }}
                >
                  {level}
                </span>
              </div>

              <h2
                id="level-up-title"
                className="mt-6 text-2xl font-extrabold tracking-tight text-white"
              >
                Level Up
              </h2>
              <p className="mt-2 text-base font-semibold" style={{ color: accent }}>
                {title}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#999]">
                You&apos;ve unlocked a new rank. Keep learning to reach the next tier —{" "}
                <span className="text-[#88C9F7]">{nextXp} XP</span> to level {level + 1}.
              </p>

              <Button
                type="button"
                className="mt-7 h-11 w-full rounded-full bg-[#456DFF] text-sm font-semibold text-white shadow-[0_4px_24px_rgba(69,109,255,0.35)] hover:bg-[#2A4AE8]"
                onClick={onClose}
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
