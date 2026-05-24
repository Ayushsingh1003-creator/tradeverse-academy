"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

const velocity = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  xp: 40 + Math.round(Math.sin(i / 4) * 20 + Math.random() * 15),
  prev: 35 + Math.round(Math.cos(i / 5) * 18),
}));

const radar = [
  { concept: "Candles", now: 72, past: 55 },
  { concept: "Trend", now: 68, past: 60 },
  { concept: "S/R", now: 80, past: 70 },
  { concept: "RSI", now: 55, past: 50 },
  { concept: "MACD", now: 62, past: 58 },
  { concept: "Risk", now: 88, past: 82 },
  { concept: "Patterns", now: 50, past: 45 },
  { concept: "Sizing", now: 74, past: 68 },
];

const accuracy = Array.from({ length: 60 }).map((_, i) => ({
  day: i + 1,
  pct: 55 + Math.round(Math.random() * 35),
  roll: 62 + Math.round(Math.sin(i / 8) * 8),
}));

const minutes = Array.from({ length: 30 }).map((_, i) => ({
  day: `D${i + 1}`,
  min: Math.round(10 + Math.random() * 45),
}));

const ranks = Array.from({ length: 12 }).map((_, i) => ({
  week: `W${i + 1}`,
  rank: 40 - i * 2 + Math.round(Math.random() * 4),
}));

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <h1 className="text-3xl font-bold">Your learning analytics</h1>

        <Card>
          <h2 className="text-lg font-semibold">Learning velocity</h2>
          <p className="mt-1 text-sm text-text-muted">XP per day vs previous 30 days — you are learning ~12% faster than last month.</p>
          <div className="mt-4 h-72 min-h-[288px] min-w-0">
            <ResponsiveContainer width="100%" height={288}>
              <LineChart data={velocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                <Legend />
                <Line type="monotone" dataKey="xp" name="This month" stroke="#F7C325" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="prev" name="Prior month" stroke="#64748b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Concept mastery</h2>
          <p className="mt-1 text-sm text-text-muted">Radar shows current vs 30 days ago (sample from practice performance).</p>
          <div className="mt-4 h-96 min-h-[384px] min-w-0">
            <ResponsiveContainer width="100%" height={384}>
              <RadarChart data={radar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="concept" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Radar name="Now" dataKey="now" stroke="#F7C325" fill="#F7C325" fillOpacity={0.35} />
                <Radar name="30d ago" dataKey="past" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} />
                <Legend />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Practice accuracy</h2>
          <p className="mt-1 text-sm text-text-muted">Daily % with 7-day rolling average (sample).</p>
          <div className="mt-4 h-72 min-h-[288px] min-w-0">
            <ResponsiveContainer width="100%" height={288}>
              <LineChart data={accuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" hide />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                <Legend />
                <Line type="monotone" dataKey="pct" name="Session %" stroke="#456DFF" strokeWidth={1} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="roll" name="7d avg" stroke="#F7C325" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Time spent learning</h2>
          <p className="mt-1 text-sm text-text-muted">Minutes per day (sample). Total this month vs last month shown in dashboard.</p>
          <div className="mt-4 h-64 min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart data={minutes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                <Bar dataKey="min" fill="#F7C325" radius={[4, 4, 0, 0]} name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Predicted mastery</h2>
          <p className="mt-2 text-text-muted">
            At your current pace, you could complete <strong>Trading Foundations</strong> in roughly <strong>12 days</strong>. Technical Analysis readiness
            in about <strong>3 weeks</strong> (illustrative — wire to real progress in production).
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Weekly league rank</h2>
          <p className="mt-1 text-sm text-text-muted">Rank over the last 12 weeks (sample).</p>
          <div className="mt-4 h-64 min-h-[256px] min-w-0">
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={ranks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} />
                <YAxis reversed domain={[1, 50]} stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="rank" stroke="#F7C325" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </main>
  );
}
