"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { useShowAdminNav } from "@/lib/admin/useShowAdminNav";
import { LiveCohortNavButton } from "@/components/layout/LiveCohortNavButton";
import { isNavLinkActive } from "@/components/layout/NavLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function MobileMenu({ streak, xp }: { streak: number; xp: number }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthSession();
  const isSignedIn = Boolean(user?.id);
  const showAdmin = useShowAdminNav();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const drawer =
    open && mounted
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[145] bg-slate-950/60 md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <aside
              className="fixed right-0 top-0 z-[150] flex h-full w-72 flex-col border-l border-border bg-surface p-5 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/dashboard#streak"
                    onClick={() => setOpen(false)}
                    className="text-sm text-text-muted no-underline hover:text-white"
                  >
                    🔥 {streak} day streak
                  </Link>
                  <Link
                    href="/xp/history"
                    onClick={() => setOpen(false)}
                    className="text-sm text-text-muted no-underline hover:text-text-primary"
                    aria-label="XP history"
                  >
                    ⚡ {xp} XP
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="shrink-0 rounded-2xl border border-border px-3 py-1"
                  aria-label="Close menu"
                >
                  X
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Main</p>
                <Link
                  onClick={() => setOpen(false)}
                  href="/dashboard"
                  className={isNavLinkActive(pathname, "/dashboard") ? "font-semibold text-white" : undefined}
                >
                  Home
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  href="/courses"
                  className={isNavLinkActive(pathname, "/courses") ? "font-semibold text-white" : undefined}
                >
                  Courses
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  href="/library"
                  className={isNavLinkActive(pathname, "/library") ? "font-semibold text-white" : undefined}
                >
                  Library
                </Link>
                <div onClick={() => setOpen(false)} className="w-fit">
                  <LiveCohortNavButton />
                </div>
                {showAdmin ? (
                  <Link
                    onClick={() => setOpen(false)}
                    href="/admin"
                    className={`font-semibold ${
                      pathname === "/admin" || pathname.startsWith("/admin/") ? "text-white" : "text-[#F7C325]"
                    }`}
                  >
                    Admin
                  </Link>
                ) : null}
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">More</p>
                <Link onClick={() => setOpen(false)} href="/leaderboard">
                  Leaderboard
                </Link>
                <Link onClick={() => setOpen(false)} href="/simulator">
                  Simulator
                </Link>
                <Link onClick={() => setOpen(false)} href="/analytics">
                  Analytics
                </Link>
                <Link onClick={() => setOpen(false)} href="/community">
                  Community
                </Link>
                <Link onClick={() => setOpen(false)} href="/live">
                  Live
                </Link>
                <Link onClick={() => setOpen(false)} href="/marketplace">
                  Marketplace
                </Link>
                <Link onClick={() => setOpen(false)} href="/teams">
                  Teams
                </Link>
                <Link onClick={() => setOpen(false)} href="/profile">
                  Profile
                </Link>
                <Link onClick={() => setOpen(false)} href="/settings">
                  Settings
                </Link>
              </nav>
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs text-text-muted">Appearance</p>
                <ThemeToggle />
                {!isSignedIn ? (
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="mt-3 block w-full rounded-2xl bg-[#456DFF] py-3 text-center text-sm font-semibold text-white"
                  >
                    Start Free
                  </Link>
                ) : null}
              </div>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-border px-3 py-2 md:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        ☰
      </button>
      {drawer}
    </>
  );
}
