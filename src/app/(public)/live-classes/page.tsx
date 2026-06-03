import { LiveClassCard } from "@/components/live-classes/LiveClassCard";
import { LiveClassesPageShell } from "@/components/live-classes/LiveClassesPageShell";
import { getLiveClassesFromDb } from "@/lib/queries/contentFromDb";

export const revalidate = 120;

export default async function LiveClassesPage() {
  const courses = await getLiveClassesFromDb();

  return (
    <LiveClassesPageShell>
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Live Cohort</h1>
        <p className="max-w-3xl text-sm text-text-muted">
          Join live cohort-based classes with structured curriculum, instructor support, and practical trading execution frameworks.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <LiveClassCard key={course.id} course={course} />
        ))}
      </div>
    </LiveClassesPageShell>
  );
}
