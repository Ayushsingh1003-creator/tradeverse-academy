"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { XPFloatProvider } from "@/components/ui/XPFloatManager";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { todayLocalISO } from "@/lib/streak";
import { useUserStore } from "@/lib/store";

const LevelUpModal = dynamic(
  () => import("@/components/ui/LevelUpModal").then((mod) => mod.LevelUpModal),
  { ssr: false },
);

const PushPermissionBanner = dynamic(
  () => import("@/components/ui/PushPermissionBanner").then((mod) => mod.PushPermissionBanner),
  { ssr: false },
);

function AppEvents() {
  const hydrate = useUserStore((state) => state.hydrate);
  const pendingLevelUp = useUserStore((state) => state.pendingLevelUp);
  const clearLevelUp = useUserStore((state) => state.clearLevelUp);
  const hydrated = useUserStore((state) => state.hydrated);
  const dailyChallengeDoneDate = useUserStore((state) => state.dailyChallengeDoneDate);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    // With Clerk, ClerkUserHydration loads the correct per-account store.
    if (!isAuthConfigured()) hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (pendingLevelUp != null) setLevelUpOpen(true);
  }, [pendingLevelUp]);

  useEffect(() => {
    if (!hydrated) return;
    const today = todayLocalISO();
    if (dailyChallengeDoneDate !== today) {
      push("📅 Don't forget your daily challenge!", "info");
    }
  }, [dailyChallengeDoneDate, hydrated, push]);

  return (
    <LevelUpModal
      open={levelUpOpen}
      level={pendingLevelUp ?? 1}
      onClose={() => {
        setLevelUpOpen(false);
        clearLevelUp();
      }}
    />
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <XPFloatProvider>
        {children}
        <AppEvents />
        <PushPermissionBanner />
      </XPFloatProvider>
    </ToastProvider>
  );
}
