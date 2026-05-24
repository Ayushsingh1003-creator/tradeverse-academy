"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignedIn, SignedOut, SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import { getClientAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";
import { LiveCohortNavButton } from "@/components/layout/LiveCohortNavButton";
import { isNavLinkActive } from "@/components/layout/NavLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CLERK_AFTER_SIGN_OUT_URL } from "@/lib/clerkUrls";

export function MobileMenu({ streak, xp, clerkEnabled }: { streak: number; xp: number; clerkEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const showAdmin =
    clerkEnabled &&
    isLoaded &&
    isAdminEmail(user?.primaryEmailAddress?.emailAddress, getClientAdminAllowlist());

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded-2xl border border-border px-3 py-2 md:hidden" aria-label="Open menu">
        ☰
      </button>
      {open ? <div className="fixed inset-0 z-[145] bg-slate-950/60" onClick={() => setOpen(false)} aria-hidden /> : null}
      <aside
        className={`fixed right-0 top-0 z-[150] flex h-full w-72 flex-col border-l border-border bg-surface p-5 transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard#streak"
              onClick={() => setOpen(false)}
              className="text-sm text-text-muted no-underline hover:text-white"
            >
              🔥 {streak} day streak
            </Link>
            <Link href="/xp/history" onClick={() => setOpen(false)} className="text-sm text-text-muted no-underline hover:text-text-primary" aria-label="XP history">
              ⚡ {xp} XP
            </Link>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-2xl border border-border px-3 py-1">
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
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "text-white"
                  : "text-[#F7C325]"
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
          {clerkEnabled ? (
            <>
              <SignedIn>
                <div className="mt-3 flex items-center gap-2">
                  <UserButton afterSignOutUrl={CLERK_AFTER_SIGN_OUT_URL} />
                  <span className="text-sm text-text-muted">Account</span>
                </div>
                <SignOutButton redirectUrl={CLERK_AFTER_SIGN_OUT_URL}>
                  <button type="button" className="mt-4 w-full rounded-2xl border border-border px-4 py-3 text-left">
                    Sign Out
                  </button>
                </SignOutButton>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="mt-3 block w-full rounded-2xl bg-[#456DFF] py-3 text-center text-sm font-semibold text-white"
                >
                  Start Free
                </Link>
              </SignedOut>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}
