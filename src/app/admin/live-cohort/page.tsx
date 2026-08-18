import Link from "next/link";
import { db } from "@/lib/db";
import type { LiveCohort } from "@/lib/db/schema";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-green-500/20 text-green-400",
    draft: "bg-[#333] text-[#888]",
    completed: "bg-blue-500/20 text-blue-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}

export default async function AdminLiveCohortPage() {
  const cohorts = (await db.liveCohort.findMany({
    orderBy: { createdAt: "desc" },
  })) as LiveCohort[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black">Live Cohorts</h1>
        <Link href="/admin/live-cohort/new" className="rounded-xl bg-[#456DFF] px-4 py-2.5 text-sm font-semibold text-white">
          + New Cohort
        </Link>
      </div>

      <div className="space-y-3">
        {cohorts.length === 0 ? (
          <p className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-8 text-center text-[#666]">
            No cohorts yet.{" "}
            <Link href="/admin/live-cohort/new" className="text-[#456DFF] hover:underline">
              Create one
            </Link>
          </p>
        ) : null}
        {cohorts.map((c) => {
          const enrolled = Math.max(0, c.seats - c.seatsLeft);
          const fillPct = c.seats > 0 ? Math.round((enrolled / c.seats) * 100) : 0;
          return (
            <div key={c.id} className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{c.title}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-sm text-[#666]">
                  {c.instructorName} · Starts {c.startDate} · {c.schedule}
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full bg-[#456DFF]" style={{ width: `${fillPct}%` }} />
                  </div>
                  <span className="text-xs text-[#666]">
                    {enrolled}/{c.seats} enrolled ({c.seatsLeft} left)
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-[#F7C325]">{c.priceLabel}</span>
                <Link
                  href={`/admin/live-cohort/${c.id}`}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/[0.05]"
                >
                  Edit
                </Link>
                <Link
                  href={`/admin/live-cohort/${c.id}/enrollments`}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/[0.05]"
                >
                  Enrollments
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
