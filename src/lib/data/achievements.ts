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
  | "radio"
  | "levels"
  | "activity"
  | "waves"
  | "ruler"
  | "scale"
  | "notebook"
  | "warning"
  | "sliders"
  | "arrows"
  | "clock"
  | "card"
  | "rocket"
  | "building"
  | "receipt"
  | "brain"
  | "medal"
  | "compass"
  | "gem";

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

function courseSlugs(slug: string): string[] {
  return COURSES.find((c) => c.slug === slug)?.lessonSlugs ?? [];
}

function pathCourseSlugs(pathSlug: string): string[] {
  return COURSES.filter((c) => c.pathSlug === pathSlug).flatMap((c) => c.lessonSlugs);
}

function hasAll(done: string[], required: string[]): boolean {
  return required.length > 0 && required.every((slug) => done.includes(slug));
}

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

/** One lesson, one badge. */
function lessonBadge(
  id: string,
  lessonSlug: string,
  title: string,
  description: string,
  icon: AchievementIconKey,
): AchievementDef {
  return {
    id,
    title,
    description,
    icon,
    isEarned: (p) => p.lessonsCompleted.includes(lessonSlug),
  };
}

/** Every lesson in one course. */
function courseBadge(
  id: string,
  slug: string,
  title: string,
  description: string,
  icon: AchievementIconKey,
): AchievementDef {
  return {
    id,
    title,
    description,
    icon,
    isEarned: (p) => hasAll(p.lessonsCompleted, courseSlugs(slug)),
  };
}

/** Every course in one learning path. */
function pathBadge(
  id: string,
  pathSlug: string,
  title: string,
  description: string,
  icon: AchievementIconKey,
): AchievementDef {
  return {
    id,
    title,
    description,
    icon,
    isEarned: (p) => hasAll(p.lessonsCompleted, pathCourseSlugs(pathSlug)),
  };
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---------- milestones by volume ----------
  {
    id: "a1",
    title: "First Candle",
    description: "Finish your first lesson.",
    icon: "candle",
    isEarned: (p) => p.lessonsCompleted.length >= 1,
  },
  {
    id: "a2",
    title: "Double Digits",
    description: "Finish 10 lessons.",
    icon: "book",
    isEarned: (p) => p.lessonsCompleted.length >= 10,
  },
  {
    id: "a19",
    title: "Quarter Century",
    description: "Finish 25 lessons.",
    icon: "medal",
    isEarned: (p) => p.lessonsCompleted.length >= 25,
  },
  {
    id: "a3",
    title: "Graduate",
    description: "Complete your first course.",
    icon: "cap",
    isEarned: (p) => coursesCompleted(p.lessonsCompleted) >= 1,
  },
  {
    id: "a20",
    title: "Course Collector",
    description: "Complete 3 courses.",
    icon: "layers",
    isEarned: (p) => coursesCompleted(p.lessonsCompleted) >= 3,
  },
  {
    id: "a18",
    title: "Diversified",
    description: "Complete lessons across 3 different courses.",
    icon: "compass",
    isEarned: (p) => coursesTouched(p.lessonsCompleted) >= 3,
  },

  // ---------- streaks, matching the milestones in lib/streak ----------
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

  // ---------- XP and level ----------
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

  // ---------- precision ----------
  {
    id: "a13",
    title: "Clean Entry",
    description: "Finish a lesson with a perfect score.",
    icon: "target",
    isEarned: (p) => p.perfectScores >= 1,
  },
  {
    id: "a14",
    title: "Flawless Ten",
    description: "Finish 10 lessons with a perfect score.",
    icon: "gem",
    isEarned: (p) => p.perfectScores >= 10,
  },

  // ---------- habit ----------
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

  // ---------- one badge per notable lesson ----------
  lessonBadge("a21", "what-is-a-candlestick", "Wick and Body", "Learn what a candlestick is made of.", "candle"),
  lessonBadge("a22", "timeframes-explained", "Zoom Control", "Understand how timeframes change the story.", "clock"),
  lessonBadge("a23", "support-resistance", "Level Headed", "Learn to mark support and resistance.", "levels"),
  lessonBadge("a24", "trend-lines", "Trendsetter", "Learn to draw a trendline that holds.", "trend"),
  lessonBadge("a25", "chart-patterns", "Pattern Spotter", "Learn to name the patterns price repeats.", "peaks"),
  lessonBadge("a26", "rsi-basics", "Overbought, Oversold", "Read your first oscillator.", "activity"),
  lessonBadge("a27", "moving-averages", "Smooth Operator", "Learn what a moving average smooths out.", "waves"),
  lessonBadge("a28", "position-sizing-rule", "Right Sized", "Learn to size a position properly.", "ruler"),
  lessonBadge("a29", "stop-loss-discipline", "Line in the Sand", "Learn to set and respect a stop.", "shield"),
  lessonBadge("a30", "risk-reward-ratio", "Worth the Risk", "Learn to weigh reward against risk.", "scale"),
  lessonBadge("a31", "journaling-your-trades", "On the Record", "Start journalling your trades.", "notebook"),
  lessonBadge("a32", "why-traders-lose", "Know the Odds", "Understand why most traders lose.", "warning"),
  lessonBadge("a33", "order-types-explained", "Order Up", "Learn every order type and when to use it.", "sliders"),
  lessonBadge("a34", "bid-ask-spread-cost", "Mind the Spread", "Learn what the spread really costs you.", "arrows"),
  lessonBadge("a35", "market-hours-india", "Bell to Bell", "Learn when the Indian market actually trades.", "clock"),
  lessonBadge("a36", "demat-and-trading-account", "Account Open", "Set up a demat and trading account.", "card"),
  lessonBadge("a37", "first-trade-walkthrough", "Maiden Trade", "Walk through your first trade end to end.", "rocket"),

  // ---------- one badge per course ----------
  courseBadge("a15", "candlestick-essentials", "Candle Master", "Complete every Candlestick Essentials lesson.", "candle"),
  courseBadge("a38", "financial-markets-101", "Market Fundamentals", "Complete every Financial Markets 101 lesson.", "building"),
  courseBadge("a39", "how-to-actually-trade", "Ready to Trade", "Complete every How to Actually Trade lesson.", "receipt"),
  courseBadge("a40", "risk-and-trader-mindset", "Iron Discipline", "Complete every Risk & Trader Mindset lesson.", "brain"),
  courseBadge("a41", "indicator-starter-kit", "Indicator Initiate", "Complete every Indicator Starter Kit lesson.", "activity"),

  // ---------- one badge per learning path ----------
  pathBadge(
    "a42",
    "technical-analysis",
    "Technical Analyst",
    "Complete every course in the Technical Analysis path.",
    "chart",
  ),
  pathBadge(
    "a43",
    "financial-market-trading-foundation",
    "Foundation Laid",
    "Complete every course in the Trading Foundation path.",
    "cap",
  ),
];

/** Ids of every achievement the progress now satisfies. */
export function earnedAchievementIds(progress: AchievementProgress): string[] {
  return ACHIEVEMENTS.filter((a) => a.isEarned(progress)).map((a) => a.id);
}
