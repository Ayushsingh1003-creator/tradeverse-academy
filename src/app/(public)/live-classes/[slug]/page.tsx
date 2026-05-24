import { notFound } from "next/navigation";
import { PublicNav } from "@/components/layout/PublicNav";
import { EnrollButton } from "@/components/live-classes/EnrollButton";
import { LiveClassCurriculum } from "@/components/live-classes/LiveClassCurriculum";
import { LiveClassSamplePlayer } from "@/components/live-classes/LiveClassSamplePlayer";
import { Card } from "@/components/ui/Card";
import { getLiveClassBySlugFromDb } from "@/lib/queries/contentFromDb";

export const revalidate = 120;

export default async function LiveClassDetailPage({ params }: { params: { slug: string } }) {
  const course = await getLiveClassBySlugFromDb(params.slug);
  if (!course) notFound();

  return (
    <main className="min-h-screen bg-background">
      <PublicNav />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <Card>
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{course.level}</p>
              <h1 className="mt-2 text-3xl font-extrabold text-white">{course.title}</h1>
              <p className="mt-1 text-sm text-text-muted">{course.subtitle}</p>
              <p className="mt-4 text-sm text-text-muted">{course.description}</p>
              <div className="mt-4 grid gap-2 text-sm text-text-muted md:grid-cols-2">
                <span>Instructor: {course.instructorName}</span>
                <span>Starts: {course.startDate}</span>
                <span>Duration: {course.durationWeeks} weeks</span>
                <span>Schedule: {course.schedule}</span>
                <span>Seats left: {course.seatsLeft}/{course.seats}</span>
                <span>Price: {course.priceLabel}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-lg font-extrabold text-white">{course.priceLabel}</p>
              <p className="mt-1 text-xs text-text-muted">One-time enrollment fee</p>
              <EnrollButton courseSlug={course.slug} className="mt-4 w-full" />
              <p className="mt-3 text-xs text-text-muted">
                Enrollment is processed securely via Stripe.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-white">Sample Class</h2>
          <p className="mb-3 text-sm text-text-muted">
            Watch this intro to evaluate the teaching style before enrolling.
          </p>
          <LiveClassSamplePlayer youtubeVideoId={course.sampleYoutubeVideoId} title={course.title} />
        </Card>

        <Card>
          <h2 className="mb-3 text-xl font-bold text-white">Curriculum</h2>
          <LiveClassCurriculum curriculum={course.curriculum} />
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-white">Instructor</h2>
          <p className="mt-2 text-sm text-text-muted">{course.instructorBio}</p>
          <EnrollButton courseSlug={course.slug} className="mt-4" />
        </Card>
      </section>
    </main>
  );
}
