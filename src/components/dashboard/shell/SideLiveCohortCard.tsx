"use client";

import Link from "next/link";

export function SideLiveCohortCard() {
  return (
    <div className="tvd-card tvd-promo">
      <h5 className="tvd-cardh">Live Cohort</h5>
      <b>Learn live with a mentor</b>
      <p>Instructor-led sessions with real market walkthroughs.</p>
      <Link href="/live-classes">
        <span className="tvd-cta2">Coming Soon</span>
      </Link>
    </div>
  );
}
