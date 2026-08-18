import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAILY_CHALLENGE_CATALOG,
  DAILY_CHALLENGE_COUNT,
  dailyChallengeIdForDate,
  getDailyChallengeById,
  localDayOfYear,
} from "./dailyChallenge";

describe("dailyChallenge", () => {
  it("catalog has unique ids (shuffled assignment)", () => {
    assert.ok(DAILY_CHALLENGE_COUNT > 0);
    assert.equal(DAILY_CHALLENGE_CATALOG.length, DAILY_CHALLENGE_COUNT);
    const ids = DAILY_CHALLENGE_CATALOG.map((c) => c.dailyChallengeId);
    assert.equal(new Set(ids).size, DAILY_CHALLENGE_COUNT);
    const firstLessonMcq = DAILY_CHALLENGE_CATALOG.find(
      (c) => c.lessonSlug === "what-is-the-market" && c.questionId === "wm-p5",
    );
    assert.ok(firstLessonMcq);
    assert.notEqual(firstLessonMcq!.dailyChallengeId, 1);
  });

  it("maps id lookup for every catalog entry", () => {
    for (const item of DAILY_CHALLENGE_CATALOG) {
      assert.deepEqual(getDailyChallengeById(item.dailyChallengeId), item);
    }
  });

  it("uses (dayOfYear % count) + 1", () => {
    const jan1 = new Date(2026, 0, 1);
    assert.equal(localDayOfYear(jan1), 1);
    assert.equal(dailyChallengeIdForDate(jan1), (1 % DAILY_CHALLENGE_COUNT) + 1);

    const day115 = new Date(2026, 3, 25);
    assert.equal(localDayOfYear(day115), 115);
    assert.equal(dailyChallengeIdForDate(day115), (115 % DAILY_CHALLENGE_COUNT) + 1);

    const dec31 = new Date(2026, 11, 31);
    assert.equal(dailyChallengeIdForDate(dec31), (365 % DAILY_CHALLENGE_COUNT) + 1);
  });
});
