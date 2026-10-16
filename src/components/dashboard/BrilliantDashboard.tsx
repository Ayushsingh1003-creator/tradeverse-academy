"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusBar } from "@/components/dashboard/shell/StatusBar";
import { UnitBanner } from "@/components/dashboard/shell/UnitBanner";
import { LessonDeck } from "@/components/dashboard/shell/LessonDeck";
import { DailyWarmUp } from "@/components/dashboard/shell/DailyWarmUp";
import { SideStreakCard } from "@/components/dashboard/shell/SideStreakCard";
import { SideLeaderboardCard } from "@/components/dashboard/shell/SideLeaderboardCard";
import { SideLiveCohortCard } from "@/components/dashboard/shell/SideLiveCohortCard";
import { LearningAskCard } from "@/components/dashboard/LearningAskCard";

export function BrilliantDashboard() {
  return (
    <AppShell
      side={
        <>
          <StatusBar />
          <SideStreakCard />
          <SideLeaderboardCard />
          <SideLiveCohortCard />
        </>
      }
    >
      <LearningAskCard />

      <div className="tvd-srule">
        <h2>Your Progress</h2>
        <i />
      </div>
      <UnitBanner />
      <LessonDeck />

      <div className="tvd-srule">
        <h2>Daily warm-up</h2>
        <i />
      </div>
      <DailyWarmUp />
    </AppShell>
  );
}
