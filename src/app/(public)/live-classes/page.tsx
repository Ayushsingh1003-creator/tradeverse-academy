import { LiveClassCard } from "@/components/live-classes/LiveClassCard";
import { LiveClassesPageShell } from "@/components/live-classes/LiveClassesPageShell";
import { getLiveClassesFromDb } from "@/lib/queries/contentFromDb";

export const revalidate = 120;

export default async function LiveClassesPage() {
  const courses = await getLiveClassesFromDb();

  return (
    <LiveClassesPageShell>
      <div className="tvd-pagehead">
        <h1>Live Cohort</h1>
        <p>
          Join live cohort-based classes with structured curriculum, instructor support, and practical trading
          execution frameworks.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="tvd-card" style={{ padding: "56px 24px", textAlign: "center", marginTop: 18 }}>
          <div className="tvd-eyebrow">Stay tuned</div>
          <h2 style={{ marginTop: 8, fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>
            No upcoming live classes
          </h2>
          <p className="tvd-muted" style={{ margin: "10px auto 0", maxWidth: 420 }}>
            New cohorts are on the way. Check back soon for live sessions with structured curriculum and instructor
            support.
          </p>
        </div>
      ) : (
        <div className="tvd-grid" style={{ marginTop: 18 }}>
          {courses.map((course) => (
            <LiveClassCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </LiveClassesPageShell>
  );
}
