"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MENTOR_AVATAR_ALT, MENTOR_NAME } from "@/lib/mentorPersona";
import type { MentorVisualState } from "@/components/lesson/MentorAvatar3D";

const MentorAvatar3D = dynamic(
  () => import("@/components/lesson/MentorAvatar3D").then((m) => m.MentorAvatar3D),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-[rgba(255,255,255,0.06)]" />,
  },
);

function MentorPosterFallback() {
  return (
    <div
      role="img"
      aria-label={MENTOR_AVATAR_ALT}
      className="flex h-[200px] w-full flex-col items-center justify-center rounded-xl border border-[rgba(69,109,255,0.25)] bg-[linear-gradient(160deg,#1a2744_0%,#0f172a_45%,#1e1e1e_100%)]"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[rgba(69,109,255,0.35)] text-2xl font-black tracking-tight text-white shadow-[0_0_24px_rgba(69,109,255,0.35)]">
        {MENTOR_NAME.slice(0, 2).toUpperCase()}
      </div>
      <p className="mt-3 text-center text-xs text-[#88c9f7]">Reduced motion — static mentor</p>
    </div>
  );
}

export function MentorAvatarPanel({ state }: { state: MentorVisualState }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  if (reducedMotion) {
    return <MentorPosterFallback />;
  }

  return (
    <div
      role="img"
      aria-label={MENTOR_AVATAR_ALT}
      className="h-[200px] w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a]"
    >
      <MentorAvatar3D state={state} />
    </div>
  );
}
