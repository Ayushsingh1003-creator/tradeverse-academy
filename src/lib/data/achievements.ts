import { COURSES } from "@/lib/data/courses";
import { LESSONS } from "@/lib/data/lessons";

/** Lucide icon name — resolved by AchievementIcon, never an emoji. */
export type AchievementIconKey =
  | "candle"
  | "book"
  | "cap"
  | "bell"
  | "calendarCheck"
  | "trend"
  | "calendar"
  | "flame"
  | "trophy"
  | "coins"
  | "chart"
  | "award"
  | "target"
  | "shield"
  | "peaks"
  | "sunrise"
  | "repeat"
  | "layers"
  | "video"
  | "radio";

/** The progress a rule is measured against — everything the client store knows. */
export type AchievementProgress = {
  xp: number;
  level: number;
  streak: number;
  lessonsCompleted: string[];
  perfectScores: number;
  dailyChallengeCount: number;
};

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: AchievementIconKey;
  /** True once the learner has earned it. Must be pure — it runs on every change. */
  isEarned: (p: AchievementProgress) => boolean;
};

const CANDLESTICK_SLUGS =
  COURSES.find((c) => c.slug === "candlestick-essentials")?.lessonSlugs ?? [];

/** How many whole courses the learner has finished. */
function coursesCompleted(lessonsCompleted: string[]): number {
  const done = new Set(lessonsCompleted);
  return COURSES.filter(
    (course) => course.lessonSlugs.length > 0 && course.lessonSlugs.every((slug) => done.has(slug)),
  ).length;
}

/** How many distinct courses the learner has touched at least one lesson of. */
function coursesTouched(lessonsCompleted: string[]): number {
  const courseIds = new Set<string>();
  for (const slug of lessonsCompleted) {
    const lesson = LESSONS.find((l) => l.slug === slug);
    if (lesson) courseIds.add(lesson.courseId);
  }
  return courseIds.size;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- getting started ----
  {
    id: "a1",
    title: "First Candle",
    description: "Finish your first lesson.",
    icon: "candle",
    isEarned: (p) => p.lessonsCompleted.length >= 1,
  },
  {
    id: "a2",
    title: "Chart Literate",
    description: "Finish 10 lessons.",
    icon: "book",
    isEarned: (p) => p.lessonsCompleted.length >= 10,
  },
  {
    id: "a3",
    title: "Full Session",
    description: "Complete your first course.",
    icon: "cap",
    isEarned: (p) => coursesCompleted(p.lessonsCompleted) >= 1,
  },

  // ---- streaks, matching the milestones in lib/streak ----
  {
    id: "a4",
    title: "Opening Bell",
    description: "Reach a 3-day streak.",
    icon: "bell",
    isEarned: (p) => p.streak >= 3,
  },
  {
    id: "a5",
    title: "Weekly Close",
    description: "Reach a 7-day streak.",
    icon: "calendarCheck",
    isEarned: (p) => p.streak >= 7,
  },
  {
    id: "a6",
    title: "Fortnight Trend",
    description: "Reach a 14-day streak.",
    icon: "trend",
    isEarned: (p) => p.streak >= 14,
  },
  {
    id: "a7",
    title: "Monthly Candle",
    description: "Reach a 30-day streak.",
    icon: "calendar",
    isEarned: (p) => p.streak >= 30,
  },
  {
    id: "a8",
    title: "Century Run",
    description: "Reach a 100-day streak.",
    icon: "flame",
    isEarned: (p) => p.streak >= 100,
  },
  {
    id: "a9",
    title: "Full Year Chart",
    description: "Reach a 365-day streak.",
    icon: "trophy",
    isEarned: (p) => p.streak >= 365,
  },

  // ---- XP and level ----
  {
    id: "a10",
    title: "Paper Profits",
    description: "Earn 1,000 XP.",
    icon: "coins",
    isEarned: (p) => p.xp >= 1000,
  },
  {
    id: "a11",
    title: "Compounding",
    description: "Earn 10,000 XP.",
    icon: "chart",
    isEarned: (p) => p.xp >= 10000,
  },
  {
    id: "a12",
    title: "Market Veteran",
    description: "Reach level 10.",
    icon: "award",
    isEarned: (p) => p.level >= 10,
  },

  // ---- precision ----
  {
    id: "a13",
    title: "Clean Entry",
    description: "Finish a lesson with a perfect score.",
    icon: "target",
    isEarned: (p) => p.perfectScores >= 1,
  },
  {
    id: "a14",
    title: "Risk Managed",
    description: "Finish 10 lessons with a perfect score.",
    icon: "shield",
    isEarned: (p) => p.perfectScores >= 10,
  },
  {
    id: "a15",
    title: "Pattern Recognition",
    description: "Complete every lesson in Candlestick Essentials.",
    icon: "peaks",
    isEarned: (p) =>
      CANDLESTICK_SLUGS.length > 0 &&
      CANDLESTICK_SLUGS.every((slug) => p.lessonsCompleted.includes(slug)),
  },

  // ---- habit ----
  {
    id: "a16",
    title: "Pre-Market Prep",
    description: "Answer your first daily challenge.",
    icon: "sunrise",
    isEarned: (p) => p.dailyChallengeCount >= 1,
  },
  {
    id: "a17",
    title: "Consistent Trader",
    description: "Answer 30 daily challenges.",
    icon: "repeat",
    isEarned: (p) => p.dailyChallengeCount >= 30,
  },

  // ---- breadth ----
  {
    id: "a18",
    title: "Diversified",
    description: "Complete lessons across 3 different courses.",
    icon: "layers",
    isEarned: (p) => coursesTouched(p.lessonsCompleted) >= 3,
  },
  {
    id: "a19",
    title: "Deep Dive",
    description: "Finish 25 lessons.",
    icon: "video",
    isEarned: (p) => p.lessonsCompleted.length >= 25,
  },
  {
    id: "a20",
    title: "Floor Trader",
    description: "Complete 3 courses.",
    icon: "radio",
    isEarned: (p) => coursesCompleted(p.lessonsCompleted) >= 3,
  },
];

/** Ids of every achievement the progress now satisfies. */
export function earnedAchievementIds(progress: AchievementProgress): string[] {
  return ACHIEVEMENTS.filter((a) => a.isEarned(progress)).map((a) => a.id);
}
