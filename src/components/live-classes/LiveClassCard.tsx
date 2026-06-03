import Link from "next/link";
import type { LiveClassCourse } from "@/lib/data/liveClasses";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function LiveClassCard({ course }: { course: LiveClassCourse }) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <img src={course.heroImageUrl} alt={course.title} className="h-44 w-full rounded-xl object-cover" loading="lazy" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">{course.level}</p>
        <h3 className="mt-1 text-lg font-bold text-white">{course.title}</h3>
        <p className="mt-1 text-xs text-text-muted">{course.subtitle}</p>
      </div>
      <p className="text-sm text-text-muted">{course.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
        <span>Starts: {course.startDate}</span>
        <span>Duration: {course.durationWeeks} weeks</span>
        <span>Schedule: {course.schedule}</span>
        <span>Seats left: {course.seatsLeft}/{course.seats}</span>
      </div>

      <div className="mt-auto">
        <p className="mb-3 text-lg font-extrabold text-white">{course.priceLabel}</p>
        <div className="flex gap-2">
          <Link
            href={`/live-classes/${course.slug}`}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm text-white no-underline transition-colors hover:bg-white/5"
          >
            View Details
          </Link>
          <Button asChild size="sm">
            <Link href={`/live-classes/${course.slug}`}>Enroll</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
