"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { PageLoader } from "@/components/ui/Loader";
import { useUserStore } from "@/lib/store";

const BrilliantDashboard = dynamic(
  () => import("@/components/dashboard/BrilliantDashboard").then((m) => m.BrilliantDashboard),
  { loading: () => <PageLoader className="min-h-[50vh]" /> },
);

export function DashboardPageClient() {
  const hydrated = useUserStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined" || window.location.hash !== "#streak") return;
    const el = document.getElementById("streak");
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [hydrated]);

  return (
    <>
      <AppNav />
      {!hydrated ? (
        <PageLoader className="min-h-[50vh]" label="Loading your dashboard…" />
      ) : (
        <BrilliantDashboard />
      )}
    </>
  );
}
