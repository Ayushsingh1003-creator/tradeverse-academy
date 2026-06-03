import { LESSONS } from "@/lib/data/lessons";

export const DAILY_CHALLENGE_COUNT = 115;

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
      if (page.type !== "multiple_choice") continue;
      refs.push({
        lessonSlug: lesson.slug,
        source: "page",
        questionId: page.id,
        question: page.question,
        options: page.options,
        correctIndex: page.correctIndex,
        explanation: page.explanation,
      });
    }
    if (!lesson.practice) continue;
    for (const q of lesson.practice) {
      if (q.type !== "multiple_choice") continue;
      refs.push({
        lessonSlug: lesson.slug,
        source: "practice",
        questionId: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      });
    }
  }
  return refs;
}

function buildCatalog(): DailyChallengeMcq[] {
  const refs = collectMcqRefs();
  if (refs.length !== DAILY_CHALLENGE_COUNT) {
    throw new Error(
      `Expected ${DAILY_CHALLENGE_COUNT} lesson MCQs, found ${refs.length}. Update DAILY_CHALLENGE_COUNT or lesson data.`,
    );
  }
  const shuffled = seededShuffle(refs, hashSeed("tradeverse-daily-challenge-v1"));
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

/** Today's challenge id: (nth day of year mod 115) + 1 */
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
