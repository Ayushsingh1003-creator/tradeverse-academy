/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of SUPPORT_RESISTANCE_LESSON_SLUG at render time to pick
 * which lesson UI to render. Re-exporting a plain constant out of a
 * "use client" module (SupportResistanceLesson.tsx) resolves to undefined
 * when imported from server code under Turbopack, so this lives in its own
 * plain module.
 */
export const SUPPORT_RESISTANCE_LESSON_SLUG = "support-resistance";
// 11 interactive scenes × 30 XP first-try award (see SupportResistanceLesson's
// checkAnswer()) = 330. Keep in sync if the scoring model changes.
export const SUPPORT_RESISTANCE_LESSON_XP = 330;
