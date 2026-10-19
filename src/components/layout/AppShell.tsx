"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AppRail } from "@/components/layout/AppRail";

const RAIL_KEY = "tv-dash-rail";

/**
 * The themed three-column app shell: collapsible left rail, scrolling centre
 * column, and an optional right rail. Each column scrolls independently, so
 * the rails hold still while the centre moves.
 *
 * Authenticated app pages wrap their content in this. Public marketing, auth
 * and the full-bleed lesson player keep their own layout and take the theme
 * tokens only.
 */
export function AppShell({
  children,
  side,
  overlay,
}: {
  children: ReactNode;
  /** Right-rail content. Omit for a two-column layout. */
  side?: ReactNode;
  /** Rendered above the grid — for full-screen overlays such as the intro. */
  overlay?: ReactNode;
}) {
  const [mini, setMini] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(RAIL_KEY) === "mini") setMini(true);
    } catch {
      /* storage blocked — rail just starts expanded */
    }
  }, []);

  const toggleRail = () => {
    setMini((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(RAIL_KEY, next ? "mini" : "full");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className="tvd-app" data-rail={mini ? "mini" : undefined} data-no-side={side ? undefined : ""}>
      {overlay}
      <AppRail mini={mini} onToggleMini={toggleRail} />
      <main className="tvd-center">{children}</main>
      {side ? <aside className="tvd-side">{side}</aside> : null}
    </div>
  );
}

/** Wraps a whole page in the theme scope. Pair with AppShell for app pages. */
export function ThemeScope({ children }: { children: ReactNode }) {
  return <div className="tvapp min-w-0">{children}</div>;
}
