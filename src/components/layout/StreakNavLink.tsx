"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StreakNavLink({ streak }: { streak: number }) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  return (
    <Link
      href="/dashboard#streak"
      onClick={(e) => {
        if (!onDashboard) return;
        e.preventDefault();
        document.getElementById("streak")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 no-underline transition-colors hover:bg-[rgba(255,255,255,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#456DFF]"
      aria-label={`${streak} day streak — view details`}
    >
      <span className="text-sm" aria-hidden>
        🔥
      </span>
      <span className="text-sm font-bold text-white">{streak}</span>
    </Link>
  );
}
