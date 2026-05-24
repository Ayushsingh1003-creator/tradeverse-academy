import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { removeEnrollment, setEnrollmentAttended, setEnrollmentPaid } from "../../actions";

export default async function CohortEnrollmentsPage({ params }: { params: { id: string } }) {
  const cohort = await db.liveCohort.findUnique({
    where: { id: params.id },
    include: { enrollments: { orderBy: { enrolledAt: "desc" } } },
  });
  if (!cohort) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/live-cohort/${cohort.id}`} className="text-sm text-[#666] hover:text-white">
            ← Edit cohort
          </Link>
          <h1 className="mt-2 text-2xl font-black">Enrollments · {cohort.title}</h1>
          <p className="mt-1 text-sm text-[#666]">
            {cohort.enrollments.length} enrolled · {cohort.seatsLeft} seats left (of {cohort.seats})
          </p>
        </div>
        <Link
          href={`/live-classes/${cohort.slug}`}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          View public page
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06] text-left text-[11px] uppercase tracking-wider text-[#555]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Enrolled</th>
              <th className="py-3">Paid</th>
              <th className="py-3">Attended</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cohort.enrollments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#666]">
                  No enrollments yet.
                </td>
              </tr>
            ) : (
              cohort.enrollments.map((e) => (
                <tr key={e.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="py-3 text-[#999]">{e.email}</td>
                  <td className="py-3 text-[#666]">{new Date(e.enrolledAt).toLocaleString()}</td>
                  <td className="py-3">
                    <form action={setEnrollmentPaid.bind(null, e.id, cohort.id, !e.paid)}>
                      <button
                        type="submit"
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          e.paid ? "bg-[#22C55E]/20 text-[#4ade80]" : "bg-white/[0.06] text-[#666]"
                        }`}
                      >
                        {e.paid ? "Paid" : "Unpaid"}
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={setEnrollmentAttended.bind(null, e.id, cohort.id, !e.attended)}>
                      <button
                        type="submit"
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          e.attended ? "bg-[#456DFF]/20 text-[#88C9F7]" : "bg-white/[0.06] text-[#666]"
                        }`}
                      >
                        {e.attended ? "Attended" : "Pending"}
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    <form action={removeEnrollment.bind(null, e.id, cohort.id)}>
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
