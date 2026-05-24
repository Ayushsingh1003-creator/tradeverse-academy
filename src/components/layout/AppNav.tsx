"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/layout/NavLink";
import { useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { CLERK_AFTER_SIGN_OUT_URL } from "@/lib/clerkUrls";
import { getClientAdminAllowlist, isAdminEmail } from "@/lib/admin/adminAllowlist";
import { LiveCohortNavButton } from "@/components/layout/LiveCohortNavButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { StreakNavLink } from "@/components/layout/StreakNavLink";
import { useUserStore } from "@/lib/store";

const clerkEnabled =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("REPLACE_ME");

export function AppNav() {
  const hydrate = useUserStore((state) => state.hydrate);
  const hydrated = useUserStore((state) => state.hydrated);
  const streak = useUserStore((state) => state.streak);
  const xp = useUserStore((state) => state.xp);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const navAdminEmails = getClientAdminAllowlist();
  const showAdmin =
    clerkEnabled &&
    isLoaded &&
    isAdminEmail(user?.primaryEmailAddress?.emailAddress, navAdminEmails);
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (hydrated) return;
    if (isClerkConfigured() && isSignedIn) return;
    hydrate();
  }, [hydrated, hydrate, isSignedIn]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#141414]"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1200px] items-center gap-0 px-5">
        <Link
          href="/dashboard"
          className="mr-8 flex items-center no-underline"
        >
          <Image
            src="/images/app-logo.png"
            alt="Tradeverse Academy"
            width={48}
            height={48}
            priority
            className="h-9 w-9 object-contain"
          />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <NavLink href="/dashboard">Home</NavLink>
          <NavLink href="/courses">Courses</NavLink>
          <NavLink href="/library">Library</NavLink>
          <LiveCohortNavButton />
          {showAdmin ? (
            <Link
              href="/admin"
              className={`text-sm font-semibold no-underline transition-colors ${
                adminActive ? "text-white" : "text-[#F7C325] hover:text-[#ffd45c]"
              }`}
            >
              Admin
            </Link>
          ) : null}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="hidden items-center gap-2 md:flex">
            <StreakNavLink streak={streak} />
            <Link
              href="/xp/history"
              className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-3 py-1.5 no-underline transition-colors hover:bg-[rgba(255,255,255,0.12)]"
              aria-label="XP history"
            >
              <span className="text-sm text-[#F7C325]">⚡</span>
              <span className="text-sm font-bold text-white">{xp}</span>
            </Link>
          </div>

          {clerkEnabled ? (
            <>
              <SignedIn>
                <span className="[&_.cl-userButtonTrigger]:h-[34px] [&_.cl-userButtonTrigger]:w-[34px]">
                  <UserButton afterSignOutUrl={CLERK_AFTER_SIGN_OUT_URL} />
                </span>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm md:inline-block"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="hidden rounded-full bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A4AE8] md:inline-block"
                >
                  Start Free
                </Link>
              </SignedOut>
            </>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-full border border-[rgba(255,255,255,0.12)] px-4 py-2 text-sm md:inline-block">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="hidden rounded-full bg-[#456DFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2A4AE8] md:inline-block"
              >
                Start Free
              </Link>
            </>
          )}

          <MobileMenu streak={streak} xp={xp} clerkEnabled={clerkEnabled} />
        </div>
      </nav>
    </header>
  );
}
