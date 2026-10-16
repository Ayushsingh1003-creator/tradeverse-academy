"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { AppShell, ThemeScope } from "@/components/layout/AppShell";
import { useSubscription } from "@/lib/hooks/useSubscription";
import { PRICING_URL } from "@/lib/pricingUrl";
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
    <ThemeScope>
      <AppShell>
        <div className="tvd-pagehead">
          <h1>Settings</h1>
          <p>Account, preferences, progress, and billing.</p>
        </div>

        <div className="tvd-cardstack">
          <div className="tvd-card">
            <h2>Account</h2>
            <p className="tvd-muted">{fullName}</p>
            <p className="tvd-muted">{email}</p>
            <Link href="/profile" className="tvd-btn" style={{ marginTop: 14 }}>
              Manage account
            </Link>
          </div>

          <div className="tvd-card">
            <h2>Preferences</h2>
            <div className="tvd-cardstack" style={{ gap: 10 }}>
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
              <label className="tvd-field">
                <span>Daily goal</span>
                <select
                  className="tvd-select"
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
              <label className="tvd-field">
                <span>Preferred trading style</span>
                <select
                  className="tvd-select"
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
            </div>
          </div>

          <div className="tvd-card">
            <h2>Progress</h2>
            <p className="tvd-muted">
              Total XP: {xp} · Lessons done: {lessonsCompleted.length} · Streak: {streak}
            </p>
            <button
              type="button"
              className="tvd-btn"
              data-tone="danger"
              style={{ marginTop: 14 }}
              onClick={() => {
                if (window.confirm("Reset all progress? This cannot be undone.")) reset();
              }}
            >
              Reset all progress
            </button>
          </div>

          <div className="tvd-card">
            <h2>Subscription</h2>
            <p className="tvd-muted">Currently on: {isPremium ? plan : "Free"}</p>
            {isPremium ? (
              <button
                type="button"
                className="tvd-btn"
                style={{ marginTop: 14 }}
                onClick={async () => {
                  const response = await fetch("/api/stripe/create-portal", { method: "POST" });
                  const data = await response.json();
                  if (data.url) window.location.href = data.url;
                }}
              >
                Manage subscription
              </button>
            ) : (
              <a
                href={PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="tvd-btn"
                data-tone="primary"
                style={{ marginTop: 14 }}
              >
                <Crown size={16} aria-hidden />
                Upgrade to Premium
              </a>
            )}
          </div>
        </div>
      </AppShell>
    </ThemeScope>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="tvd-toggle">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="tvd-switch"
        onClick={() => onChange(!checked)}
      >
        <i />
      </button>
    </div>
  );
}
