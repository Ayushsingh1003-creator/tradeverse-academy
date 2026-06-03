import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { LibraryCourse } from "@/lib/data/library";
import { computeLibraryCourseCardProgress } from "./libraryCourseProgress";

const sampleCourse: LibraryCourse = {
  id: "c1",
  slug: "test-course",
  title: "Test",
  description: "Desc",
  thumbnailUrl: "https://example.com/t.jpg",
  level: "Beginner",
  tags: [],
  estimatedDurationMin: 10,
  videos: [
    {
      id: "v1",
      youtubeVideoId: "a",
      title: "Video 1",
      description: "",
      thumbnailUrl: "",
      duration: "5:00",
      publishedAt: "2026-01-01",
      tags: [],
    },
    {
      id: "l1",
      type: "learn",
      learnSlug: "lesson-a",
      youtubeVideoId: "",
      title: "Learn 1",
      description: "",
      thumbnailUrl: "",
      duration: "",
      publishedAt: "2026-01-01",
      tags: [],
    },
    {
      id: "v2",
      youtubeVideoId: "b",
      title: "Video 2",
      description: "",
      thumbnailUrl: "",
      duration: "5:00",
      publishedAt: "2026-01-02",
      tags: [],
    },
  ],
};

describe("computeLibraryCourseCardProgress", () => {
  it("counts reached videos and completed learn lessons", () => {
    const progress = computeLibraryCourseCardProgress(sampleCourse, {
      lastVideoId: "v2",
      practiceSummary: {
        learnItemCount: 1,
        lessonCompletedCount: 1,
        practicedCount: 0,
        totalPracticeCorrect: 0,
        totalPracticeQuestions: 0,
        practiceScorePercent: null,
        entries: [
          {
            learnSlug: "lesson-a",
            libraryItemId: "l1",
            title: "Learn 1",
            practiceCorrect: 0,
            practiceTotal: 0,
            lessonCompleted: true,
            practicePercent: null,
          },
        ],
      },
    });

    assert.equal(progress.completedCount, 3);
    assert.equal(progress.percent, 100);
    assert.equal(progress.statusLabel, "Completed");
  });

  it("returns zero progress when not started", () => {
    const progress = computeLibraryCourseCardProgress(sampleCourse);
    assert.equal(progress.completedCount, 0);
    assert.equal(progress.percent, 0);
    assert.equal(progress.statusLabel, "Start course");
  });
});
