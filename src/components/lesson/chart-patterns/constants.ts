/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of CHART_PATTERNS_LESSON_SLUG at render time to pick
 * which lesson UI to render. Re-exporting a plain constant out of a
 * "use client" module (ChartPatternsLesson.tsx) resolves to undefined when
 * imported from server code under Turbopack, so this lives in its own plain
 * module.
 */
export const CHART_PATTERNS_LESSON_SLUG = "chart-patterns";
// 8 interactive scenes × 30 XP first-try award = 240
export const CHART_PATTERNS_LESSON_XP = 240;
