"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@/components/layout/NavLink";
import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { useShowAdminNav } from "@/lib/admin/useShowAdminNav";
import { LiveCohortNavButton } from "@/components/layout/LiveCohortNavButton";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { StreakNavLink } from "@/components/layout/StreakNavLink";
import { AuthUserMenu } from "@/components/auth/AuthUserMenu";
import { useUserStore } from "@/lib/store";

export function AppNav() {
  const hydrate = useUserStore((state) => state.hydrate);
  const hydrated = useUserStore((state) => state.hydrated);
  const streak = useUserStore((state) => state.streak);
  const xp = useUserStore((state) => state.xp);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const isSignedIn = Boolean(user?.id);
  const showAdmin = useShowAdminNav();
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (hydrated) return;
    if (isAuthConfigured() && isSignedIn) return;
    hydrate();
  }, [hydrated, hydrate, isSignedIn]);

  return (
    <header
      className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.08)] bg-[#141414]"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <nav className="mx-auto flex h-[52px] max-w-[1200px] items-center gap-0 px-5">
        <Link href="/dashboard" className="mr-8 flex items-center no-underline">
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

          <AuthUserMenu />

          <MobileMenu streak={streak} xp={xp} />
        </div>
      </nav>
    </header>
  );
}
