"use client";

import { useEffect, useState } from "react";
import { DashboardRail } from "@/components/dashboard/shell/DashboardRail";
import { StatusBar } from "@/components/dashboard/shell/StatusBar";
import { UnitBanner } from "@/components/dashboard/shell/UnitBanner";
import { LessonDeck } from "@/components/dashboard/shell/LessonDeck";
import { DailyWarmUp } from "@/components/dashboard/shell/DailyWarmUp";
import { SideStreakCard } from "@/components/dashboard/shell/SideStreakCard";
import { SideLeaderboardCard } from "@/components/dashboard/shell/SideLeaderboardCard";
import { SideLiveCohortCard } from "@/components/dashboard/shell/SideLiveCohortCard";
import { DashboardIntro } from "@/components/dashboard/shell/DashboardIntro";
import { LearningAskCard } from "@/components/dashboard/LearningAskCard";

const RAIL_KEY = "tv-dash-rail";

export function BrilliantDashboard() {
  const [mini, setMini] = useState(false);
  /** The intro runs on every load of the dashboard, until it ends or is skipped. */
  const [introPlaying, setIntroPlaying] = useState(true);

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
    <div className="tvd-app" data-rail={mini ? "mini" : undefined}>
      {introPlaying ? <DashboardIntro onDone={() => setIntroPlaying(false)} /> : null}

      <DashboardRail mini={mini} onToggleMini={toggleRail} />

      <main className="tvd-center">
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
      </main>

      <aside className="tvd-side">
        <StatusBar />
        <SideStreakCard />
        <SideLeaderboardCard />
        <SideLiveCohortCard />
      </aside>
    </div>
  );
}
