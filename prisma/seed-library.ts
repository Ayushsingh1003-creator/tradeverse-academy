import { PrismaClient } from "@prisma/client";
import { getLibraryCourses } from "../src/lib/data/library";
import { getLiveClasses } from "../src/lib/data/liveClasses";

const db = new PrismaClient();

async function main() {
  const courses = getLibraryCourses();
  for (let i = 0; i < courses.length; i += 1) {
    const course = courses[i]!;
    const dbCourse = await db.libraryCourse.upsert({
      where: { slug: course.slug },
      update: {
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        tags: JSON.stringify(course.tags),
        estimatedDurationMin: course.estimatedDurationMin,
        order: i,
        published: true,
      },
      create: {
        slug: course.slug,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        level: course.level,
        tags: JSON.stringify(course.tags),
        estimatedDurationMin: course.estimatedDurationMin,
        published: true,
        order: i,
      },
    });

    await db.libraryVideo.deleteMany({ where: { courseId: dbCourse.id } });
    for (const [vi, video] of course.videos.entries()) {
      await db.libraryVideo.create({
        data: {
          id: video.id,
          courseId: dbCourse.id,
          youtubeVideoId: video.youtubeVideoId,
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          publishedAt: video.publishedAt,
          tags: JSON.stringify(video.tags),
          order: vi,
        },
      });
    }
  }

  for (const cls of getLiveClasses()) {
    await db.liveCohort.upsert({
      where: { slug: cls.slug },
      update: {
        title: cls.title,
        subtitle: cls.subtitle,
        description: cls.description,
        instructorName: cls.instructorName,
        instructorBio: cls.instructorBio,
        startDate: cls.startDate,
        durationWeeks: cls.durationWeeks,
        schedule: cls.schedule,
        priceLabel: cls.priceLabel,
        priceAmount: cls.priceAmount,
        currency: cls.currency,
        stripePriceId: cls.stripePriceId || null,
        sampleYoutubeVideoId: cls.sampleYoutubeVideoId,
        heroImageUrl: cls.heroImageUrl,
        curriculumJson: JSON.stringify(cls.curriculum),
        seats: cls.seats,
        seatsLeft: cls.seatsLeft,
        level: cls.level,
        tags: JSON.stringify(cls.tags),
        status: "published",
      },
      create: {
        slug: cls.slug,
        title: cls.title,
        subtitle: cls.subtitle,
        description: cls.description,
        instructorName: cls.instructorName,
        instructorBio: cls.instructorBio,
        startDate: cls.startDate,
        durationWeeks: cls.durationWeeks,
        schedule: cls.schedule,
        priceLabel: cls.priceLabel,
        priceAmount: cls.priceAmount,
        currency: cls.currency,
        stripePriceId: cls.stripePriceId || null,
        sampleYoutubeVideoId: cls.sampleYoutubeVideoId,
        heroImageUrl: cls.heroImageUrl,
        curriculumJson: JSON.stringify(cls.curriculum),
        seats: cls.seats,
        seatsLeft: cls.seatsLeft,
        level: cls.level,
        tags: JSON.stringify(cls.tags),
        status: "published",
      },
    });
  }

  console.log("Seeded library courses + live cohorts");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
