import { notFound } from "next/navigation";
import { EnrollButton } from "@/components/live-classes/EnrollButton";
import { LiveClassesPageShell } from "@/components/live-classes/LiveClassesPageShell";
import { LiveClassCurriculum } from "@/components/live-classes/LiveClassCurriculum";
import { LiveClassSamplePlayer } from "@/components/live-classes/LiveClassSamplePlayer";
import { Card } from "@/components/ui/Card";
import { getLiveClassBySlugFromDb } from "@/lib/queries/contentFromDb";

export const revalidate = 120;

export default async function LiveClassDetailPage({ params }: { params: { slug: string } }) {
  const course = await getLiveClassBySlugFromDb(params.slug);
  if (!course) notFound();

  return (
    <LiveClassesPageShell>
      <div className="tvd-cardstack">
        <div className="tvd-card">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="tvd-eyebrow">{course.level}</p>
              <h1 style={{ marginTop: 8, fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.1 }}>{course.title}</h1>
              <p className="tvd-muted" style={{ marginTop: 6 }}>{course.subtitle}</p>
              <p className="tvd-muted" style={{ marginTop: 14 }}>{course.description}</p>
              <div className="tvd-cmeta" style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
                <span>Instructor: {course.instructorName}</span>
                <span>Starts: {course.startDate}</span>
                <span>Duration: {course.durationWeeks} weeks</span>
                <span>Schedule: {course.schedule}</span>
                <span>Seats left: {course.seatsLeft}/{course.seats}</span>
                <span>Price: {course.priceLabel}</span>
              </div>
            </div>
            <div style={{ borderRadius: 17, border: "1px solid var(--tv-line)", background: "var(--tv-sunk)", padding: 16 }}>
              <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.02em" }}>{course.priceLabel}</p>
              <p className="tvd-muted" style={{ marginTop: 4, fontSize: 12 }}>One-time enrollment fee</p>
              <EnrollButton courseSlug={course.slug} className="mt-4 w-full" />
              <p className="tvd-muted" style={{ marginTop: 12, fontSize: 12 }}>
                Enrollment is processed securely via Stripe.
              </p>
            </div>
          </div>
        </div>

        <div className="tvd-card">
          <h2>Sample Class</h2>
          <p className="tvd-muted" style={{ marginBottom: 12 }}>
            Watch this intro to evaluate the teaching style before enrolling.
          </p>
          <LiveClassSamplePlayer youtubeVideoId={course.sampleYoutubeVideoId} title={course.title} />
        </div>

        <div className="tvd-card">
          <h2>Curriculum</h2>
          <LiveClassCurriculum curriculum={course.curriculum} />
        </div>

        <div className="tvd-card">
          <h2>Instructor</h2>
          <p className="tvd-muted">{course.instructorBio}</p>
          <EnrollButton courseSlug={course.slug} className="mt-4" />
        </div>
      </div>
    </LiveClassesPageShell>
  );
}
