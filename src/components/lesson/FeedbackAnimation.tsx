"use client";

import { motion } from "framer-motion";

export function FeedbackAnimation({ correct, explanation }: { correct: boolean; explanation: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 rounded-lg border p-4 ${correct ? "border-[#456DFF]/50 bg-[rgba(69,109,255,0.15)]" : "border-error bg-red-500/10"}`}
    >
      <p className="text-sm font-semibold">{correct ? "+50 XP · Correct" : "Not quite"}</p>
      <p className="mt-1 text-sm text-text-muted">{explanation}</p>
    </motion.div>
  );
}
