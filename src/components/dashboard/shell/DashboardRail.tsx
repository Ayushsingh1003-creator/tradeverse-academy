"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  GraduationCap,
  Library,
  Moon,
  Radio,
  Shield,
  Sun,
  Trophy,
  User,
} from "lucide-react";
import { isNavLinkActive } from "@/components/layout/NavLink";
import { useShowAdminNav } from "@/lib/admin/useShowAdminNav";

type Theme = "light" | "dark";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Home", Icon: GraduationCap },
  { href: "/courses", label: "Courses", Icon: BookOpen },
  { href: "/library", label: "Library", Icon: Library },
  { href: "/live-classes", label: "Live Cohort", Icon: Radio },
] as const;

const SECONDARY_NAV = [
  { href: "/leaderboard", label: "Leaderboard", Icon: Trophy },
  { href: "/profile", label: "Profile", Icon: User },
] as const;

/** Reads/writes the same `tv_theme` key the root layout boots the app with. */
function useAppTheme(): [Theme, (next: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("tv_theme", next);
    } catch {
      /* storage blocked — the attribute still applies for this session */
    }
  };

  return [theme, apply];
}

export function DashboardRail({ mini, onToggleMini }: { mini: boolean; onToggleMini: () => void }) {
  const pathname = usePathname() ?? "";
  const showAdmin = useShowAdminNav();
  const [theme, setTheme] = useAppTheme();

  return (
    <nav className="tvd-rail" aria-label="Main">
      <div className="tvd-railtop">
        <Link href="/dashboard" className="tvd-logo" aria-label="Tradeverse home">
          <span className="tvd-glyph">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-full w-full object-contain" priority />
          </span>
          <span className="tvd-wm">Tradeverse</span>
        </Link>
        <button
          type="button"
          className="tvd-collapse"
          onClick={onToggleMini}
          aria-expanded={!mini}
          aria-label={mini ? "Expand menu" : "Collapse menu"}
          title={mini ? "Expand menu" : "Collapse menu"}
        >
          <ChevronLeft size={16} strokeWidth={2.4} aria-hidden />
        </button>
      </div>

      {PRIMARY_NAV.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          prefetch
          className="tvd-nav"
          title={label}
          aria-current={isNavLinkActive(pathname, href) ? "page" : undefined}
        >
          <Icon size={21} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}

      <div className="tvd-railsep" aria-hidden />

      {SECONDARY_NAV.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          prefetch
          className="tvd-nav"
          title={label}
          aria-current={isNavLinkActive(pathname, href) ? "page" : undefined}
        >
          <Icon size={21} aria-hidden />
          <span>{label}</span>
        </Link>
      ))}

      {showAdmin ? (
        <Link
          href="/admin"
          className="tvd-nav"
          data-admin=""
          title="Admin"
          aria-current={isNavLinkActive(pathname, "/admin") ? "page" : undefined}
        >
          <Shield size={21} aria-hidden />
          <span>Admin</span>
        </Link>
      ) : null}

      <div className="tvd-railfoot">
        <div className="tvd-themetoggle" role="group" aria-label="Theme">
          <button type="button" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>
            <Sun size={15} aria-hidden />
            <span>Light</span>
          </button>
          <button type="button" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>
            <Moon size={15} aria-hidden />
            <span>Dark</span>
          </button>
        </div>

        <div className="tvd-pro">
          <a href="https://www.tradeversejournal.com/pricing" target="_blank" rel="noopener noreferrer">
            <span>Upgrade</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
