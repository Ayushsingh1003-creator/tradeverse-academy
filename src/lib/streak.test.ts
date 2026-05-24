import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeNewStreak,
  isStreakBroken,
  todayLocalISO,
  yesterdayLocalISO,
} from "./streak";

describe("computeNewStreak", () => {
  const today = "2026-05-20";
  const yesterday = "2026-05-19";

  it("starts at 1 when never active", () => {
    assert.deepEqual(computeNewStreak(null, today, 0), {
      newStreak: 1,
      changed: true,
      broken: false,
    });
  });

  it("does not change on same calendar day", () => {
    assert.deepEqual(computeNewStreak(today, today, 5), {
      newStreak: 5,
      changed: false,
      broken: false,
    });
  });

  it("increments when last active was yesterday", () => {
    assert.deepEqual(computeNewStreak(yesterday, today, 4), {
      newStreak: 5,
      changed: true,
      broken: false,
    });
  });

  it("resets to 1 when gap is more than one day", () => {
    assert.deepEqual(computeNewStreak("2026-05-17", today, 10), {
      newStreak: 1,
      changed: true,
      broken: true,
    });
  });
});

describe("isStreakBroken", () => {
  it("is false with no prior activity", () => {
    assert.equal(isStreakBroken(null), false);
  });

  it("is false for today or yesterday", () => {
    const today = todayLocalISO();
    const yesterday = yesterdayLocalISO();
    assert.equal(isStreakBroken(today), false);
    assert.equal(isStreakBroken(yesterday), false);
  });

  it("is true when last activity was two or more days ago", () => {
    assert.equal(isStreakBroken("2020-01-01"), true);
  });
});
