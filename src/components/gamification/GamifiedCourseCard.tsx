"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Course } from "@/lib/data/courses";

const ACCENT_STYLES = [
  "border-[#01c3a8]/45 shadow-[0_0_28px_rgba(1,195,168,0.12)]",
  "border-[#456DFF]/45 shadow-[0_0_28px_rgba(69,109,255,0.12)]",
  "border-[#ffb741]/45 shadow-[0_0_28px_rgba(255,183,65,0.12)]",
  "border-[#a63d2a]/45 shadow-[0_0_28px_rgba(166,61,42,0.12)]",
] as const;

interface Props {
  course: Course;
  index: number;
  completedCount?: number;
}

export function GamifiedCourseCard({ course, index, completedCount = 0 }: Props) {
  const total = course.lessonSlugs.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const accent = ACCENT_STYLES[index % ACCENT_STYLES.length];

  return (
    <Link href={`/courses/${course.slug}`} className="group shrink-0 no-underline">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={`relative w-[210px] overflow-hidden rounded-2xl border bg-[#1A1F28] p-4 transition-colors ${accent}`}
      >
        {course.premium ? (
          <span className="absolute right-2 top-2 z-10 rounded-full border border-[#D4A017]/40 bg-[#D4A017]/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#F7C325]">
            PREMIUM
          </span>
        ) : null}

        <div className="mb-3 flex h-[100px] items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(135deg,#101A31_0%,#1B2D5F_100%)] text-[42px]">
          {course.illustrationEmoji}
        </div>

        <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-white">{course.title}</p>
        <p className="mt-1 text-xs text-white/45">{total} lessons</p>

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[10px] font-medium uppercase tracking-wide text-white/40">
            <span>Progress</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#456DFF] to-[#88C9F7]"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-white/35">
            {completedCount > 0 ? `${completedCount}/${total} complete` : "Start learning"}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
