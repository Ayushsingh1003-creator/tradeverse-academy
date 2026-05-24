import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeServerClientStreakState } from "./mergeServerStreak";

describe("mergeServerClientStreakState", () => {
  it("leaves client when both dates null", () => {
    assert.deepEqual(mergeServerClientStreakState(5, null, 0, null), {
      streak: 5,
      lastActiveDate: null,
    });
  });

  it("prefers server when client date null", () => {
    assert.deepEqual(mergeServerClientStreakState(0, null, 8, "2026-05-10"), {
      streak: 8,
      lastActiveDate: "2026-05-10",
    });
  });

  it("prefers client when server date null", () => {
    assert.deepEqual(mergeServerClientStreakState(7, "2026-05-09", 0, null), {
      streak: 7,
      lastActiveDate: "2026-05-09",
    });
  });

  it("prefers newer server calendar day", () => {
    assert.deepEqual(mergeServerClientStreakState(3, "2026-05-01", 10, "2026-05-04"), {
      streak: 10,
      lastActiveDate: "2026-05-04",
    });
  });

  it("prefers newer client calendar day", () => {
    assert.deepEqual(mergeServerClientStreakState(8, "2026-05-04", 3, "2026-05-01"), {
      streak: 8,
      lastActiveDate: "2026-05-04",
    });
  });

  it("same day uses max streak", () => {
    assert.deepEqual(mergeServerClientStreakState(7, "2026-05-04", 8, "2026-05-04"), {
      streak: 8,
      lastActiveDate: "2026-05-04",
    });
    assert.deepEqual(mergeServerClientStreakState(9, "2026-05-04", 4, "2026-05-04"), {
      streak: 9,
      lastActiveDate: "2026-05-04",
    });
  });
});
