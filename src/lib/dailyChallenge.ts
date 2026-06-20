import { LESSONS } from "@/lib/data/lessons";
import type { CandleChoicePreset, VisualChoiceOption } from "@/types/lessonPage";

const PRESET_LABELS: Record<CandleChoicePreset, string> = {
  bullish: "Bullish candle",
  bearish: "Bearish candle",
  doji: "Doji",
  hammer: "Hammer",
  shootingStar: "Shooting star",
  marubozuBull: "Strong bullish candle",
  marubozuBear: "Strong bearish candle",
};

function visualChoiceOptionLabels(options: VisualChoiceOption[]): string[] {
  return options.map((o, i) => o.label ?? PRESET_LABELS[o.preset] ?? `Option ${i + 1}`);
}

function pushMcqRef(
  refs: McqRef[],
  lessonSlug: string,
  source: "page" | "practice",
  item: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  },
) {
  refs.push({
    lessonSlug,
    source,
    questionId: item.id,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
  });
}

export type DailyChallengeMcq = {
  dailyChallengeId: number;
  lessonSlug: string;
  source: "page" | "practice";
  questionId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type McqRef = Omit<DailyChallengeMcq, "dailyChallengeId">;

function hashSeed(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const random = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function collectMcqRefs(): McqRef[] {
  const refs: McqRef[] = [];
  for (const lesson of LESSONS) {
    for (const page of lesson.pages) {
      if (page.type === "multiple_choice") {
        pushMcqRef(refs, lesson.slug, "page", {
          id: page.id,
          question: page.question,
          options: page.options,
          correctIndex: page.correctIndex,
          explanation: page.explanation,
        });
      } else if (page.type === "visual_choice") {
        pushMcqRef(refs, lesson.slug, "page", {
          id: page.id,
          question: page.question,
          options: visualChoiceOptionLabels(page.options),
          correctIndex: page.correctIndex,
          explanation: page.explanation,
        });
      }
    }
    if (!lesson.practice) continue;
    for (const q of lesson.practice) {
      if (q.type === "multiple_choice") {
        pushMcqRef(refs, lesson.slug, "practice", {
          id: q.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        });
      } else if (q.type === "visual_choice") {
        pushMcqRef(refs, lesson.slug, "practice", {
          id: q.id,
          question: q.question,
          options: visualChoiceOptionLabels(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        });
      }
    }
  }
  return refs;
}

const CHALLENGE_REFS = collectMcqRefs();

/** Derived from lesson MCQ + visual-choice pools — stays in sync when lessons change. */
export const DAILY_CHALLENGE_COUNT = CHALLENGE_REFS.length;

function buildCatalog(): DailyChallengeMcq[] {
  if (CHALLENGE_REFS.length === 0) {
    throw new Error("No lesson MCQs found for daily challenge catalog.");
  }
  const shuffled = seededShuffle(CHALLENGE_REFS, hashSeed("tradeverse-daily-challenge-v1"));
  return shuffled.map((ref, index) => ({
    ...ref,
    dailyChallengeId: index + 1,
  }));
}

export const DAILY_CHALLENGE_CATALOG: DailyChallengeMcq[] = buildCatalog();

const byId = new Map(
  DAILY_CHALLENGE_CATALOG.map((item) => [item.dailyChallengeId, item]),
);

export function localDayOfYear(now = new Date()): number {
  const start = new Date(now.getFullYear(), 0, 1);
  const ms = now.getTime() - start.getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** Today's challenge id: (nth day of year mod DAILY_CHALLENGE_COUNT) + 1 */
export function dailyChallengeIdForDate(now = new Date()): number {
  const n = localDayOfYear(now);
  return (n % DAILY_CHALLENGE_COUNT) + 1;
}

export function getDailyChallengeById(id: number): DailyChallengeMcq | undefined {
  return byId.get(id);
}

export function getDailyChallengeForDate(now = new Date()): DailyChallengeMcq {
  const id = dailyChallengeIdForDate(now);
  const challenge = byId.get(id);
  if (!challenge) {
    throw new Error(`Missing daily challenge for id ${id}`);
  }
  return challenge;
}

export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
