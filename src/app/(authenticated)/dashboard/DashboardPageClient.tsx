"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAuthSession } from "@/components/providers/AuthSessionProvider";
import { PageLoader } from "@/components/ui/Loader";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { useUserStore } from "@/lib/store";

const BrilliantDashboard = dynamic(
  () => import("@/components/dashboard/BrilliantDashboard").then((m) => m.BrilliantDashboard),
  { loading: () => <PageLoader className="min-h-[50vh]" /> },
);

export function DashboardPageClient() {
  const hydrate = useUserStore((state) => state.hydrate);
  const hydrated = useUserStore((state) => state.hydrated);
  const { user } = useAuthSession();
  const isSignedIn = Boolean(user?.id);

  // Was AppNav's job before the top nav moved into the left rail: signed-in
  // accounts are hydrated by AuthSessionHydration instead.
  useEffect(() => {
    if (hydrated) return;
    if (isAuthConfigured() && isSignedIn) return;
    hydrate();
  }, [hydrated, hydrate, isSignedIn]);

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

  return !hydrated ? (
    <PageLoader className="min-h-[50vh]" label="Loading your dashboard…" />
  ) : (
    <BrilliantDashboard />
  );
}
