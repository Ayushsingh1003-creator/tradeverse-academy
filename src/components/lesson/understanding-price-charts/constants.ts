/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of PRICE_CHARTS_LESSON_SLUG at render time to pick which
 * lesson UI to render. Re-exporting a plain constant out of a "use client"
 * module (UnderstandingPriceChartsLesson.tsx) resolves to undefined when
 * imported from server code under Turbopack, so this lives in its own plain
 * module — same reasoning as anatomy-of-a-candle/constants.ts.
 */
export const PRICE_CHARTS_LESSON_SLUG = "how-to-read-a-chart";
export const PRICE_CHARTS_LESSON_XP = 405;
