import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/lib/db";
import { buildFishAudioTtsRequest } from "@/lib/server/fishAudioRequest";
import { uploadVoiceClip } from "./s3";
import { generateQuestionReply, type QuestionContext, type ReplyStage } from "./textGen";

import { QUESTION_CONTEXT_BY_STEP as ANATOMY_QUESTIONS } from "@/components/lesson/anatomy-of-a-candle/AnatomyOfACandleLesson";
import { ANATOMY_LESSON_SLUG } from "@/components/lesson/anatomy-of-a-candle/constants";
import { QUESTION_CONTEXT_BY_STEP as TIMEFRAMES_QUESTIONS } from "@/components/lesson/timeframes/TimeFramesLesson";
import { TIME_FRAMES_LESSON_SLUG } from "@/components/lesson/timeframes/constants";
import { QUESTION_CONTEXT_BY_STEP as SUPPORT_RESISTANCE_QUESTIONS } from "@/components/lesson/support-resistance/SupportResistanceLesson";
import { SUPPORT_RESISTANCE_LESSON_SLUG } from "@/components/lesson/support-resistance/constants";
import { QUESTION_CONTEXT_BY_STEP as TREND_LINES_QUESTIONS } from "@/components/lesson/trend-lines/TrendLinesLesson";
import { TREND_LINES_LESSON_SLUG } from "@/components/lesson/trend-lines/constants";
import { QUESTION_CONTEXT_BY_STEP as CHART_PATTERNS_QUESTIONS } from "@/components/lesson/chart-patterns/ChartPatternsLesson";
import { CHART_PATTERNS_LESSON_SLUG } from "@/components/lesson/chart-patterns/constants";

const COURSE_SLUG = "candlestick-essentials";

type LessonRegistryEntry = {
  lessonSlug: string;
  lessonTitle: string;
  lessonTopic: string;
  questions: Partial<Record<number, QuestionContext>>;
};

const LESSONS: LessonRegistryEntry[] = [
  { lessonSlug: ANATOMY_LESSON_SLUG, lessonTitle: "Anatomy of a Candlestick", lessonTopic: "candlestick-anatomy", questions: ANATOMY_QUESTIONS },
  { lessonSlug: TIME_FRAMES_LESSON_SLUG, lessonTitle: "Timeframes Explained", lessonTopic: "timeframes", questions: TIMEFRAMES_QUESTIONS },
  { lessonSlug: SUPPORT_RESISTANCE_LESSON_SLUG, lessonTitle: "Support & Resistance", lessonTopic: "support-resistance", questions: SUPPORT_RESISTANCE_QUESTIONS },
  { lessonSlug: TREND_LINES_LESSON_SLUG, lessonTitle: "Trendlines", lessonTopic: "trend-lines", questions: TREND_LINES_QUESTIONS },
  { lessonSlug: CHART_PATTERNS_LESSON_SLUG, lessonTitle: "Chart Patterns", lessonTopic: "chart-patterns", questions: CHART_PATTERNS_QUESTIONS },
];

const PREFIX_PHRASES: Record<"hint" | "wrong" | "correct", string> = {
  hint: "Wrong, try again",
  wrong: "Wrong answer",
  correct: "Correct",
};

const args = process.argv.slice(2);
const skipExisting = args.includes("--skip-existing");
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg?.slice("--only=".length);
/** Generates + prints the text only — no Fish Audio/S3/DB writes. Lets you review wording before spending TTS credits. */
const textOnly = args.includes("--text-only");
type TextPreviewItem = { lessonSlug: string; questionKey: string; stage: ReplyStage; question: string; text: string };
const TEXT_PREVIEW_PATH = resolve(process.cwd(), "scripts/voice-responses/text-preview.json");

function loadExistingPreview(): TextPreviewItem[] {
  if (!existsSync(TEXT_PREVIEW_PATH)) return [];
  try {
    return JSON.parse(readFileSync(TEXT_PREVIEW_PATH, "utf8")) as TextPreviewItem[];
  } catch {
    return [];
  }
}

const textOnlyResults: TextPreviewItem[] = textOnly ? loadExistingPreview() : [];
const textOnlyDone = new Set(textOnlyResults.map((r) => `${r.lessonSlug}:${r.questionKey}:${r.stage}`));

function savePreview() {
  writeFileSync(TEXT_PREVIEW_PATH, JSON.stringify(textOnlyResults, null, 2));
}

/** Reviewed text-preview.json is the source of truth for the real run — reuse it instead of re-calling the AI APIs. */
const reviewedText = new Map<string, string>();
for (const item of loadExistingPreview()) {
  reviewedText.set(`${item.lessonSlug}:${item.questionKey}:${item.stage}`, item.text);
}

async function synthesize(text: string): Promise<Buffer> {
  const request = buildFishAudioTtsRequest(text);
  if (!request) throw new Error("FISH_AUDIO_API_KEY not configured");
  const res = await fetch(request.url, request.init);
  if (!res.ok) throw new Error(`Fish Audio ${res.status}: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function generatePrefixes() {
  for (const [kind, text] of Object.entries(PREFIX_PHRASES) as [keyof typeof PREFIX_PHRASES, string][]) {
    const existing = skipExisting ? await db.voicePrefix.findUnique({ where: { kind } }) : null;
    if (existing) {
      console.log(`[prefix:${kind}] skip (exists)`);
      continue;
    }
    console.log(`[prefix:${kind}] synthesizing "${text}"...`);
    const bytes = await synthesize(text);
    const audioUrl = await uploadVoiceClip(`_prefix/${kind}.mp3`, bytes);
    await db.voicePrefix.upsert({
      where: { kind },
      create: { kind, text, audioUrl },
      update: { text, audioUrl, updatedAt: new Date() },
    });
    console.log(`[prefix:${kind}] done -> ${audioUrl}`);
  }
}

async function generateForLesson(lesson: LessonRegistryEntry) {
  const stages: ReplyStage[] = ["hint", "explain"];
  for (const [stepStr, ctx] of Object.entries(lesson.questions)) {
    if (!ctx) continue;
    const questionKey = stepStr;
    for (const stage of stages) {
      if (textOnly && textOnlyDone.has(`${lesson.lessonSlug}:${questionKey}:${stage}`)) {
        console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] skip (already in text-preview.json)`);
        continue;
      }
      const existing = !textOnly && skipExisting
        ? await db.questionVoiceResponse.findUnique({ where: { lessonSlug: lesson.lessonSlug, questionKey, stage } })
        : null;
      if (existing) {
        console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] skip (exists)`);
        continue;
      }

      const reviewed = !textOnly ? reviewedText.get(`${lesson.lessonSlug}:${questionKey}:${stage}`) : undefined;
      let text: string | null;
      if (reviewed) {
        text = reviewed;
        console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] using reviewed text from text-preview.json`);
      } else {
        console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] generating text...`);
        text = await generateQuestionReply(lesson.lessonTitle, lesson.lessonTopic, ctx, stage);
        // Small pacing gap to stay clear of per-minute rate limits (Cerebras) — separate from Gemini's daily quota.
        await new Promise((r) => setTimeout(r, 5_000));
      }
      if (!text) {
        console.warn(`[${lesson.lessonSlug}:${questionKey}:${stage}] no text generated — skipping (no provider available)`);
        continue;
      }

      if (textOnly) {
        textOnlyResults.push({ lessonSlug: lesson.lessonSlug, questionKey, stage, question: ctx.question, text });
        textOnlyDone.add(`${lesson.lessonSlug}:${questionKey}:${stage}`);
        savePreview();
        console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] "${text}"`);
        continue;
      }

      console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] synthesizing audio...`);
      const bytes = await synthesize(text);
      const audioUrl = await uploadVoiceClip(`${lesson.lessonSlug}/${questionKey}-${stage}.mp3`, bytes);

      await db.questionVoiceResponse.upsert({
        where: { lessonSlug: lesson.lessonSlug, questionKey, stage },
        create: { id: createId(), courseSlug: COURSE_SLUG, lessonSlug: lesson.lessonSlug, questionKey, stage, text, audioUrl },
        update: { text, audioUrl, updatedAt: new Date() },
      });
      console.log(`[${lesson.lessonSlug}:${questionKey}:${stage}] done -> "${text.slice(0, 60)}..." -> ${audioUrl}`);
    }
  }
}

async function main() {
  if (!textOnly) await generatePrefixes();

  const lessons = only ? LESSONS.filter((l) => l.lessonSlug === only) : LESSONS;
  if (only && lessons.length === 0) {
    console.error(`No lesson matches --only=${only}. Known slugs: ${LESSONS.map((l) => l.lessonSlug).join(", ")}`);
    process.exitCode = 1;
    return;
  }

  for (const lesson of lessons) {
    await generateForLesson(lesson);
  }

  if (textOnly) {
    console.log(`\n${textOnlyResults.length} generated replies saved to ${TEXT_PREVIEW_PATH}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
