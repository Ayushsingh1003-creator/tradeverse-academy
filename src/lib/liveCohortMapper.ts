import type { LiveClassCourse, LiveClassCurriculumModule } from "@/lib/data/liveClasses";
import type { LiveCohort } from "@/lib/db/schema";

export function mapLiveCohortRow(row: LiveCohort): LiveClassCourse {
  let curriculum: LiveClassCurriculumModule[] = [];
  try {
    curriculum = JSON.parse(row.curriculumJson) as LiveClassCurriculumModule[];
  } catch {
    curriculum = [];
  }
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    tags = [];
  }
  const currency = row.currency === "USD" ? "USD" : "INR";
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    instructorName: row.instructorName,
    instructorBio: row.instructorBio,
    startDate: row.startDate,
    durationWeeks: row.durationWeeks,
    schedule: row.schedule,
    priceLabel: row.priceLabel,
    priceAmount: row.priceAmount,
    currency,
    stripePriceId: row.stripePriceId ?? "",
    sampleYoutubeVideoId: row.sampleYoutubeVideoId,
    heroImageUrl: row.heroImageUrl,
    curriculum,
    seats: row.seats,
    seatsLeft: row.seatsLeft,
    level: row.level as LiveClassCourse["level"],
    tags,
  };
}
