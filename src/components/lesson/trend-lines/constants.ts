/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of TREND_LINES_LESSON_SLUG at render time to pick which
 * lesson UI to render. Re-exporting a plain constant out of a "use client"
 * module (TrendLinesLesson.tsx) resolves to undefined when imported from
 * server code under Turbopack, so this lives in its own plain module.
 */
export const TREND_LINES_LESSON_SLUG = "trend-lines";
// 12 interactive scenes × 30 XP first-try award (see TrendLinesLesson's
// checkAnswer()) = 360. Keep in sync if the scoring model changes.
export const TREND_LINES_LESSON_XP = 360;
