/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of TIME_FRAMES_LESSON_SLUG at render time to pick which
 * lesson UI to render. Re-exporting a plain constant out of a "use client"
 * module (TimeFramesLesson.tsx) resolves to undefined when imported from
 * server code under Turbopack, so this lives in its own plain module.
 */
export const TIME_FRAMES_LESSON_SLUG = "timeframes-explained";
// 10 interactive scenes × 30 XP first-try award (see TimeFramesLesson's
// checkAnswer()) = 300. Keep in sync if the scoring model changes.
export const TIME_FRAMES_LESSON_XP = 300;
