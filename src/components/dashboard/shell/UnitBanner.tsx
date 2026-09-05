"use client";

import Link from "next/link";
import { useUserStore } from "@/lib/store";
import { DECK_CARDS, DECK_COURSE } from "@/components/dashboard/shell/deckData";

export function UnitBanner() {
  const lessonsCompleted = useUserStore((s) => s.lessonsCompleted);
  const cleared = DECK_CARDS.filter((c) => lessonsCompleted.includes(c.slug)).length;
  const pct = Math.round((cleared / DECK_CARDS.length) * 100);

  return (
    <div className="tvd-unit">
      <div style={{ minWidth: 0 }}>
        <small>
          Unit 1 · {cleared} of {DECK_CARDS.length} lessons cleared
        </small>
        <b>{DECK_COURSE.title}</b>
        <div className="tvd-unitbar">
          <i style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Link href={`/courses/${DECK_COURSE.slug}`}>Continue</Link>
    </div>
  );
}
