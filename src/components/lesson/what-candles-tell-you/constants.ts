/**
 * No "use client" here on purpose: page.tsx (a Server Component) needs the
 * real string value of MEANING_LESSON_SLUG at render time to pick which
 * lesson UI to render. Re-exporting a plain constant out of a "use client"
 * module (WhatCandlesTellYouLesson.tsx) resolves to undefined when imported
 * from server code under Turbopack, so this lives in its own plain module.
 */
export const MEANING_LESSON_SLUG = "meaning-of-patterns";
export const MEANING_LESSON_XP = 400;
