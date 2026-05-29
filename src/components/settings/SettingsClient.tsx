"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { useUserStore } from "@/lib/store";

const readBool = (key: string, fallback = true) => {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(key);
  if (value == null) return fallback;
  return value === "true";
};

export function SettingsClient({ fullName, email }: { fullName: string; email: string }) {
  const { xp, streak, lessonsCompleted, reset } = useUserStore();
  const [sounds, setSounds] = useState(true);
  const [xpAnim, setXpAnim] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [dailyGoal, setDailyGoal] = useState("1 lesson");
  const [tradingStyle, setTradingStyle] = useState("All");
  const { isPremium, plan } = useSubscription();

  useEffect(() => {
    setSounds(readBool("tv_sounds"));
    setXpAnim(readBool("tv_xp_anim"));
    setEmailReminders(readBool("tv_email_reminders"));
    setDailyGoal(window.localStorage.getItem("tv_daily_goal") ?? "1 lesson");
    setTradingStyle(window.localStorage.getItem("tv_style") ?? "All");
  }, []);

  const persist = (key: string, value: string) => window.localStorage.setItem(key, value);

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
          <h2 className="text-xl font-semibold">Account</h2>
          <p className="mt-2 text-sm text-text-muted">{fullName}</p>
          <p className="text-sm text-text-muted">{email}</p>
          <Link href="/profile" className="mt-4 inline-block rounded-2xl border border-border px-4 py-2">
            Manage Account
          </Link>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-xl font-semibold">Preferences</h2>
          <Toggle
            label="Sound effects"
            checked={sounds}
            onChange={(value) => {
              setSounds(value);
              persist("tv_sounds", String(value));
            }}
          />
          <Toggle
            label="Show XP animations"
            checked={xpAnim}
            onChange={(value) => {
              setXpAnim(value);
              persist("tv_xp_anim", String(value));
            }}
          />
          <Toggle
            label="Email reminders"
            checked={emailReminders}
            onChange={(value) => {
              setEmailReminders(value);
              persist("tv_email_reminders", String(value));
            }}
          />
          <label className="block">
            <span className="mb-1 block text-sm text-text-muted">Daily goal</span>
            <select
              className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3"
              value={dailyGoal}
              onChange={(event) => {
                setDailyGoal(event.target.value);
                persist("tv_daily_goal", event.target.value);
              }}
            >
              <option>1 lesson</option>
              <option>2 lessons</option>
              <option>3 lessons</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-text-muted">Preferred trading style</span>
            <select
              className="w-full rounded-2xl border border-border bg-surface2 px-4 py-3"
              value={tradingStyle}
              onChange={(event) => {
                setTradingStyle(event.target.value);
                persist("tv_style", event.target.value);
              }}
            >
              <option>Day Trading</option>
              <option>Swing Trading</option>
              <option>Long-term Investing</option>
              <option>All</option>
            </select>
          </label>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Progress</h2>
          <p className="mt-2 text-sm text-text-muted">
            Total XP: {xp} · Lessons done: {lessonsCompleted.length} · Streak: {streak}
          </p>
          <button
            onClick={() => {
              if (window.confirm("Reset all progress? This cannot be undone.")) reset();
            }}
            className="mt-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-200"
          >
            Reset all progress
          </button>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold">Subscription</h2>
          <p className="mt-2 text-sm text-text-muted">Currently on: {isPremium ? plan : "Free"}</p>
          {isPremium ? (
            <button
              onClick={async () => {
                const response = await fetch("/api/stripe/create-portal", { method: "POST" });
                const data = await response.json();
                if (data.url) window.location.href = data.url;
              }}
              className="mt-4 rounded-2xl border border-border px-6 py-3"
            >
              Manage subscription
            </button>
          ) : (
            <Link href="/pricing" className="mt-4 inline-block rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">
              Upgrade to Premium
            </Link>
          )}
        </Card>
      </section>
    </main>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-2xl border border-border bg-surface2 px-4 py-3">
      <span>{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`h-7 w-12 rounded-full p-1 transition ${checked ? "bg-accent" : "bg-slate-600"}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </label>
  );
}
