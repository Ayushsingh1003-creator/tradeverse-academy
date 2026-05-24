import Link from "next/link";
import { db } from "@/lib/db";

type RecentUser = {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  xp: number;
  streak: number;
  createdAt: Date;
};

export default async function AdminDashboardPage() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const settled = await Promise.allSettled([
    db.user.count(),
    db.user.count({ where: { lastActiveDate: { gte: start } } }),
    db.lessonProgress.count({
      where: {
        completed: true,
        completedAt: { gte: start },
      },
    }),
    db.subscription.count({ where: { status: "active" } }),
    db.user.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        xp: true,
        streak: true,
        createdAt: true,
      },
    }),
    db.liveCohort.count(),
    db.libraryCourse.count(),
  ]);

  const num = (i: number, fallback = 0) => (settled[i]?.status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<number>).value : fallback);
  const totalUsers = num(0);
  const activeToday = num(1);
  const lessonsToday = num(2);
  const activeSubs = num(3);
  const cohortCount = num(5);
  const libraryCount = num(6);
  const recentUsers: RecentUser[] =
    settled[4]?.status === "fulfilled" ? (settled[4] as PromiseFulfilledResult<RecentUser[]>).value : [];
  const mrr = activeSubs * 19;

  const stats = [
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: "👥", color: "#456DFF" },
    { label: "Active Today", value: activeToday.toLocaleString(), icon: "⚡", color: "#F7C325" },
    { label: "Lessons Today", value: lessonsToday.toLocaleString(), icon: "📚", color: "#10B981" },
    { label: "MRR (est.)", value: `$${mrr.toLocaleString()}`, icon: "💰", color: "#8B5CF6" },
    { label: "Live Cohorts", value: String(cohortCount), icon: "🎓", color: "#F59E0B" },
    { label: "Library Courses", value: String(libraryCount), icon: "🎬", color: "#EF4444" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-black">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-4">
            <div className="mb-2 text-2xl">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="mt-1 text-xs text-[#666]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/admin/live-cohort/new" className="rounded-xl bg-[#456DFF] px-4 py-2.5 text-sm font-semibold text-white">
          + New Live Cohort
        </Link>
        <Link
          href="/admin/library/new"
          className="rounded-xl border border-white/10 bg-[#1E1E1E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          + Add Library Course
        </Link>
        <Link
          href="/admin/courses"
          className="rounded-xl border border-white/10 bg-[#1E1E1E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
        >
          Manage Courses
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="font-bold">Recent Signups</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-[#555]">
              <th className="px-5 py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Plan</th>
              <th className="py-3">XP</th>
              <th className="py-3">Streak</th>
              <th className="py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="py-3 text-[#999]">{u.email}</td>
                <td className="py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      u.isPremium ? "bg-[#456DFF]/20 text-[#88C9F7]" : "bg-white/[0.06] text-[#666]"
                    }`}
                  >
                    {u.isPremium ? "Premium" : "Free"}
                  </span>
                </td>
                <td className="py-3 text-[#F7C325]">{u.xp}</td>
                <td className="py-3">🔥 {u.streak}</td>
                <td className="py-3 text-[#555]">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
