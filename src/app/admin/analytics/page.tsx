import { db } from "@/lib/db";

export default async function AdminAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  since.setHours(0, 0, 0, 0);

  const [usersTotal, usersWeek, progressWeek, commentsTotal, enrollmentsTotal] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: since } } }),
    db.lessonProgress.count({
      where: { completed: true, completedAt: { gte: since } },
    }),
    db.lessonComment.count(),
    db.liveCohortEnrollment.count(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={usersTotal} />
        <StatCard label="New users (7d)" value={usersWeek} />
        <StatCard label="Lessons completed (7d)" value={progressWeek} />
        <StatCard label="Lesson comments" value={commentsTotal} />
        <StatCard label="Cohort enrollments" value={enrollmentsTotal} />
      </div>
      <p className="mt-6 text-sm text-[#666]">Metrics are read directly from the database (SQLite in dev).</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-5">
      <p className="text-xs uppercase tracking-wider text-[#666]">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}
