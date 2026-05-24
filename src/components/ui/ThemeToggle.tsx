"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    return;
  }
  root.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (window.localStorage.getItem("tv_theme") as Theme | null) ?? "system";
    setTheme(stored === "light" || stored === "dark" || stored === "system" ? stored : "system");
    applyTheme(stored === "light" || stored === "dark" || stored === "system" ? stored : "system");
  }, []);

  const cycle = () => {
    const order: Theme[] = ["dark", "light", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
    window.localStorage.setItem("tv_theme", next);
    applyTheme(next);
  };

  const icon2 = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "💻";

  return (
    <button
      type="button"
      title={`Theme: ${theme}`}
      onClick={cycle}
      className="rounded-2xl border border-border px-3 py-2 text-sm"
      aria-label="Toggle color theme"
    >
      {icon2}
    </button>
  );
}
