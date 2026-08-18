import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldResumeLessonToCompletionSplash } from "./libraryLearnResume";

test("resumes when library progress marks lesson completed", () => {
  assert.equal(
    shouldResumeLessonToCompletionSplash({ lessonCompleted: true }, "candlesticks"),
    true,
  );
});

test("resumes when practice was completed (practiceTotal > 0)", () => {
  assert.equal(
    shouldResumeLessonToCompletionSplash(
      { lessonCompleted: true },
      "candlesticks",
      [],
    ),
    true,
  );
});

test("resumes from global lessonsCompleted fallback", () => {
  assert.equal(
    shouldResumeLessonToCompletionSplash(undefined, "candlesticks", ["candlesticks"]),
    true,
  );
});

test("does not resume for incomplete lesson", () => {
  assert.equal(
    shouldResumeLessonToCompletionSplash({ lessonCompleted: false }, "candlesticks", []),
    false,
  );
});
