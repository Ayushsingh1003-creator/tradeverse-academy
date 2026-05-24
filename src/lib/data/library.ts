export type LibraryVideo = {
  id: string;
  youtubeVideoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  tags: string[];
  courseId?: string;
};

export type LibraryCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  tags: string[];
  estimatedDurationMin: number;
  videos: LibraryVideo[];
};

export type LibraryResumeItem = {
  course: LibraryCourse;
  lastVideoId: string | null;
};

const COURSES: LibraryCourse[] = [
  {
    id: "yc-1",
    slug: "price-action-bootcamp",
    title: "Price Action Bootcamp",
    description: "Build chart reading confidence with support, resistance, and trend structure.",
    thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
    level: "Beginner",
    tags: ["Price Action", "Candles", "Structure"],
    estimatedDurationMin: 95,
    videos: [
      {
        id: "yc-1-v1",
        youtubeVideoId: "dQw4w9WgXcQ",
        title: "Reading Candle Structure Fast",
        description: "Understand body, wick, momentum, and rejection in one framework.",
        thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        duration: "14:20",
        publishedAt: "2025-09-12",
        tags: ["Candles", "Beginner"],
        courseId: "yc-1",
      },
      {
        id: "yc-1-v2",
        youtubeVideoId: "9bZkp7q19f0",
        title: "Support and Resistance Mapping",
        description: "How to mark high-probability levels without over-drawing lines.",
        thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
        duration: "19:40",
        publishedAt: "2025-09-20",
        tags: ["Support", "Resistance"],
        courseId: "yc-1",
      },
      {
        id: "yc-1-v3",
        youtubeVideoId: "J---aiyznGQ",
        title: "Trend Continuation and Pullback Entries",
        description: "Use trend context to avoid late entries and false breakouts.",
        thumbnailUrl: "https://i.ytimg.com/vi/J---aiyznGQ/hqdefault.jpg",
        duration: "21:05",
        publishedAt: "2025-09-28",
        tags: ["Trend", "Entries"],
        courseId: "yc-1",
      },
    ],
  },
  {
    id: "yc-2",
    slug: "indicator-mastery",
    title: "Indicator Mastery",
    description: "Use RSI, moving averages, and confluence to filter weak setups.",
    thumbnailUrl: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
    level: "Intermediate",
    tags: ["RSI", "Moving Average", "Confluence"],
    estimatedDurationMin: 110,
    videos: [
      {
        id: "yc-2-v1",
        youtubeVideoId: "3JZ_D3ELwOQ",
        title: "RSI for Context, Not Prediction",
        description: "Use RSI to frame momentum quality instead of guessing tops and bottoms.",
        thumbnailUrl: "https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg",
        duration: "18:32",
        publishedAt: "2025-10-02",
        tags: ["RSI", "Momentum"],
        courseId: "yc-2",
      },
      {
        id: "yc-2-v2",
        youtubeVideoId: "kJQP7kiw5Fk",
        title: "MA Stacking and Trend Bias",
        description: "Define trend regime quickly with moving average alignment.",
        thumbnailUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
        duration: "16:10",
        publishedAt: "2025-10-11",
        tags: ["Moving Average", "Trend"],
        courseId: "yc-2",
      },
      {
        id: "yc-2-v3",
        youtubeVideoId: "L_jWHffIx5E",
        title: "Confluence Checklist for Entries",
        description: "A practical checklist to reduce low-quality trades.",
        thumbnailUrl: "https://i.ytimg.com/vi/L_jWHffIx5E/hqdefault.jpg",
        duration: "22:48",
        publishedAt: "2025-10-19",
        tags: ["Checklist", "Execution"],
        courseId: "yc-2",
      },
    ],
  },
  {
    id: "yc-3",
    slug: "risk-and-psychology",
    title: "Risk and Psychology",
    description: "Position sizing, drawdown control, and emotional discipline frameworks.",
    thumbnailUrl: "https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg",
    level: "Advanced",
    tags: ["Risk", "Psychology", "Discipline"],
    estimatedDurationMin: 102,
    videos: [
      {
        id: "yc-3-v1",
        youtubeVideoId: "fLexgOxsZu0",
        title: "Position Sizing That Survives Volatility",
        description: "Frameworks for sizing when market conditions shift quickly.",
        thumbnailUrl: "https://i.ytimg.com/vi/fLexgOxsZu0/hqdefault.jpg",
        duration: "20:22",
        publishedAt: "2025-10-26",
        tags: ["Risk", "Position Sizing"],
        courseId: "yc-3",
      },
      {
        id: "yc-3-v2",
        youtubeVideoId: "e-ORhEE9VVg",
        title: "Drawdown Recovery Playbook",
        description: "How to recover process and confidence without revenge trading.",
        thumbnailUrl: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg",
        duration: "17:54",
        publishedAt: "2025-11-03",
        tags: ["Drawdown", "Mindset"],
        courseId: "yc-3",
      },
      {
        id: "yc-3-v3",
        youtubeVideoId: "CevxZvSJLk8",
        title: "Trader Discipline System",
        description: "Daily routines that keep execution consistent under pressure.",
        thumbnailUrl: "https://i.ytimg.com/vi/CevxZvSJLk8/hqdefault.jpg",
        duration: "19:36",
        publishedAt: "2025-11-10",
        tags: ["Discipline", "Routine"],
        courseId: "yc-3",
      },
    ],
  },
];

const STANDALONE_VIDEOS: LibraryVideo[] = [
  {
    id: "yv-1",
    youtubeVideoId: "hT_nvWreIhg",
    title: "Pre-market Checklist in 7 Minutes",
    description: "Quick routine to prepare bias, risk, and key levels before session open.",
    thumbnailUrl: "https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg",
    duration: "07:06",
    publishedAt: "2025-11-18",
    tags: ["Checklist", "Routine"],
  },
  {
    id: "yv-2",
    youtubeVideoId: "OPf0YbXqDm0",
    title: "When to Skip a Trade",
    description: "Three warning signs that save capital when setups look tempting but weak.",
    thumbnailUrl: "https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg",
    duration: "11:48",
    publishedAt: "2025-11-22",
    tags: ["Risk", "Discipline"],
  },
  {
    id: "yv-3",
    youtubeVideoId: "60ItHLz5WEA",
    title: "Build a Weekly Review Dashboard",
    description: "Track win-rate, RR, rule breaks, and execution quality in one dashboard.",
    thumbnailUrl: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg",
    duration: "15:27",
    publishedAt: "2025-11-27",
    tags: ["Review", "Metrics"],
  },
];

export function getLibraryCourses() {
  return COURSES;
}

/** Static catalog lookup when DB has no row for this slug. */
export function getLibraryCourseBySlug(slug: string): LibraryCourse | null {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function getStandaloneVideos() {
  return STANDALONE_VIDEOS;
}

export function getAllLibraryTags() {
  const tags = new Set<string>();
  for (const course of COURSES) {
    course.tags.forEach((tag) => tags.add(tag));
    course.videos.forEach((video) => video.tags.forEach((tag) => tags.add(tag)));
  }
  STANDALONE_VIDEOS.forEach((video) => video.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}
