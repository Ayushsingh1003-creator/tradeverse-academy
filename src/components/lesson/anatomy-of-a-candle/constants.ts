/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of ANATOMY_LESSON_SLUG at render time to pick which
 * lesson UI to render. Re-exporting a plain constant out of a "use client"
 * module (AnatomyOfACandleLesson.tsx) resolves to undefined when imported
 * from server code under Turbopack, so this lives in its own plain module.
 */
export const ANATOMY_LESSON_SLUG = "what-is-a-candlestick";
export const ANATOMY_LESSON_XP = 120;
