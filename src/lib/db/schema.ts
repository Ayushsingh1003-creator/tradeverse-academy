import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("User", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  authUserId: text("authUserId").unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  passwordHash: text("passwordHash"),
  role: text("role").notNull().default("user"),
  isPremium: boolean("isPremium").notNull().default(false),
  premiumUntil: timestamp("premiumUntil", { mode: "date" }),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  streakLocalDate: text("streakLocalDate"),
  ianaTimezone: text("ianaTimezone"),
  lastActiveDate: timestamp("lastActiveDate", { mode: "date" }),
  league: text("league").notNull().default("bronze"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  themePreference: text("themePreference"),
  locale: text("locale"),
  isCreator: boolean("isCreator").notNull().default(false),
  stripeConnectAccountId: text("stripeConnectAccountId"),
  country: text("country"),
});

export const xpLedger = pgTable(
  "XpLedger",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    amount: integer("amount").notNull(),
    reason: text("reason").notNull(),
    ref: text("ref"),
    idempotencyKey: text("idempotencyKey").unique(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("XpLedger_userId_createdAt_idx").on(t.userId, t.createdAt)],
);

export const leagueSeasons = pgTable("LeagueSeason", {
  id: text("id").primaryKey(),
  startsAt: timestamp("startsAt", { mode: "date" }).notNull(),
  endsAt: timestamp("endsAt", { mode: "date" }).notNull(),
  finalizedAt: timestamp("finalizedAt", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const learningPaths = pgTable("LearningPath", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  level: text("level").notNull(),
  order: integer("order").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
});

export const courses = pgTable("Course", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  pathId: text("pathId").notNull(),
  order: integer("order").notNull(),
  isFree: boolean("isFree").notNull().default(false),
  thumbnail: text("thumbnail"),
  xpReward: integer("xpReward").notNull().default(100),
});

export const lessons = pgTable("Lesson", {
  id: text("id").primaryKey(),
  courseId: text("courseId").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull(),
  content: text("content").notNull(),
  xpReward: integer("xpReward").notNull().default(50),
  isFree: boolean("isFree").notNull().default(false),
});

export const practiceSets = pgTable("PracticeSet", {
  id: text("id").primaryKey(),
  lessonId: text("lessonId").notNull().unique(),
  questions: text("questions").notNull(),
});

export const lessonProgress = pgTable(
  "LessonProgress",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    lessonId: text("lessonId").notNull(),
    completed: boolean("completed").notNull().default(false),
    score: integer("score"),
    timeSpent: integer("timeSpent"),
    nextReviewDate: timestamp("nextReviewDate", { mode: "date" }),
    completedAt: timestamp("completedAt", { mode: "date" }),
  },
  (t) => [uniqueIndex("LessonProgress_userId_lessonId_key").on(t.userId, t.lessonId)],
);

export const practiceResults = pgTable("PracticeResult", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  practiceSetId: text("practiceSetId").notNull(),
  answers: text("answers").notNull(),
  score: integer("score").notNull(),
  timeSpent: integer("timeSpent").notNull(),
  completedAt: timestamp("completedAt", { mode: "date" }).notNull().defaultNow(),
});

export const achievements = pgTable("Achievement", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  condition: text("condition").notNull(),
  xpReward: integer("xpReward").notNull(),
});

export const userAchievements = pgTable(
  "UserAchievement",
  {
    userId: text("userId").notNull(),
    achievementId: text("achievementId").notNull(),
    earnedAt: timestamp("earnedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })],
);

export const subscriptions = pgTable("Subscription", {
  id: text("id").primaryKey(),
  authUserId: text("authUserId").notNull().unique(),
  stripeCustomerId: text("stripeCustomerId").unique(),
  stripeSubscriptionId: text("stripeSubscriptionId").unique(),
  stripePriceId: text("stripePriceId"),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("inactive"),
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const referrals = pgTable("Referral", {
  id: text("id").primaryKey(),
  referrerId: text("referrerId").notNull(),
  referredId: text("referredId").notNull().unique(),
  code: text("code").notNull().unique(),
  rewardGiven: boolean("rewardGiven").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "Account",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [uniqueIndex("Account_provider_providerAccountId_key").on(t.provider, t.providerAccountId)],
);

export const sessions = pgTable("Session", {
  id: text("id").primaryKey(),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("VerificationToken_identifier_token_key").on(t.identifier, t.token)],
);

export const pushSubscriptions = pgTable(
  "PushSubscription",
  {
    id: text("id").primaryKey(),
    authUserId: text("authUserId").notNull(),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("PushSubscription_authUserId_idx").on(t.authUserId)],
);

export const lessonComments = pgTable(
  "LessonComment",
  {
    id: text("id").primaryKey(),
    lessonSlug: text("lessonSlug").notNull(),
    authUserId: text("authUserId").notNull(),
    userName: text("userName").notNull(),
    userAvatar: text("userAvatar"),
    userLevel: integer("userLevel").notNull(),
    body: text("body").notNull(),
    upvotes: integer("upvotes").notNull().default(0),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("LessonComment_lessonSlug_idx").on(t.lessonSlug)],
);

export const lessonCommentReplies = pgTable("LessonCommentReply", {
  id: text("id").primaryKey(),
  commentId: text("commentId").notNull(),
  authUserId: text("authUserId").notNull(),
  userName: text("userName").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const commentUpvotes = pgTable(
  "CommentUpvote",
  {
    authUserId: text("authUserId").notNull(),
    commentId: text("commentId").notNull(),
  },
  (t) => [primaryKey({ columns: [t.authUserId, t.commentId] })],
);

export const follows = pgTable(
  "Follow",
  {
    followerId: text("followerId").notNull(),
    followingId: text("followingId").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })],
);

export const organizations = pgTable("Organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logoUrl"),
  primaryColor: text("primaryColor").notNull().default("#D4A017"),
  plan: text("plan").notNull().default("teams"),
  seatCount: integer("seatCount").notNull().default(5),
  stripeId: text("stripeId"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const orgMembers = pgTable(
  "OrgMember",
  {
    id: text("id").primaryKey(),
    orgId: text("orgId").notNull(),
    authUserId: text("authUserId").notNull(),
    role: text("role").notNull().default("member"),
    joinedAt: timestamp("joinedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    index("OrgMember_orgId_idx").on(t.orgId),
    index("OrgMember_authUserId_idx").on(t.authUserId),
  ],
);

export const courseAssignments = pgTable(
  "CourseAssignment",
  {
    id: text("id").primaryKey(),
    orgId: text("orgId").notNull(),
    courseId: text("courseId").notNull(),
    dueDate: timestamp("dueDate", { mode: "date" }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("CourseAssignment_orgId_idx").on(t.orgId)],
);

export const liveSessions = pgTable("LiveSession", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorId: text("instructorId").notNull(),
  scheduledAt: timestamp("scheduledAt", { mode: "date" }).notNull(),
  duration: integer("duration").notNull(),
  maxAttendees: integer("maxAttendees").notNull().default(100),
  meetingUrl: text("meetingUrl"),
  recordingUrl: text("recordingUrl"),
  status: text("status").notNull().default("scheduled"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const liveSessionAttendees = pgTable(
  "LiveSessionAttendee",
  {
    sessionId: text("sessionId").notNull(),
    authUserId: text("authUserId").notNull(),
    registeredAt: timestamp("registeredAt", { mode: "date" }).notNull().defaultNow(),
    attended: boolean("attended").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.authUserId] })],
);

export const srsCards = pgTable(
  "SRSCard",
  {
    id: text("id").primaryKey(),
    authUserId: text("authUserId").notNull(),
    lessonSlug: text("lessonSlug").notNull(),
    easeFactor: real("easeFactor").notNull().default(2.5),
    interval: integer("interval").notNull().default(1),
    repetitions: integer("repetitions").notNull().default(0),
    nextReviewDate: timestamp("nextReviewDate", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("SRSCard_authUserId_lessonSlug_key").on(t.authUserId, t.lessonSlug)],
);

export const lessonVideos = pgTable("LessonVideo", {
  id: text("id").primaryKey(),
  lessonSlug: text("lessonSlug").notNull().unique(),
  muxAssetId: text("muxAssetId").notNull(),
  muxPlaybackId: text("muxPlaybackId").notNull(),
  duration: integer("duration").notNull(),
  thumbnail: text("thumbnail"),
});

export const creatorApplications = pgTable("CreatorApplication", {
  id: text("id").primaryKey(),
  authUserId: text("authUserId").notNull(),
  name: text("name").notNull(),
  experience: text("experience").notNull(),
  idea: text("idea").notNull(),
  linkedIn: text("linkedIn"),
  twitter: text("twitter"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const marketplaceCourses = pgTable("MarketplaceCourse", {
  id: text("id").primaryKey(),
  creatorAuthUserId: text("creatorAuthUserId").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  priceCents: integer("priceCents").notNull().default(0),
  coverUrl: text("coverUrl"),
  rating: real("rating").notNull().default(0),
  studentCount: integer("studentCount").notNull().default(0),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const libraryCourses = pgTable("LibraryCourse", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  level: text("level").notNull(),
  tags: text("tags").notNull(),
  estimatedDurationMin: integer("estimatedDurationMin").notNull().default(0),
  published: boolean("published").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const libraryCourseEnrollments = pgTable(
  "LibraryCourseEnrollment",
  {
    id: text("id").primaryKey(),
    userId: text("userId").notNull(),
    courseSlug: text("courseSlug").notNull(),
    lastVideoId: text("lastVideoId"),
    enrolledAt: timestamp("enrolledAt", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("LibraryCourseEnrollment_userId_courseSlug_key").on(t.userId, t.courseSlug),
    index("LibraryCourseEnrollment_userId_idx").on(t.userId),
  ],
);

export const libraryVideos = pgTable(
  "LibraryVideo",
  {
    id: text("id").primaryKey(),
    courseId: text("courseId").notNull(),
    youtubeVideoId: text("youtubeVideoId").notNull(),
    youtubeVideoIdHi: text("youtubeVideoIdHi"),
    title: text("title").notNull(),
    description: text("description").notNull(),
    thumbnailUrl: text("thumbnailUrl").notNull(),
    duration: text("duration").notNull(),
    publishedAt: text("publishedAt").notNull(),
    tags: text("tags").notNull(),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("LibraryVideo_courseId_idx").on(t.courseId)],
);

export const libraryStandaloneVideos = pgTable("LibraryStandaloneVideo", {
  id: text("id").primaryKey(),
  youtubeVideoId: text("youtubeVideoId").notNull(),
  youtubeVideoIdHi: text("youtubeVideoIdHi"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  duration: text("duration").notNull(),
  publishedAt: text("publishedAt").notNull(),
  tags: text("tags").notNull(),
  published: boolean("published").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const liveCohorts = pgTable("LiveCohort", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  description: text("description").notNull(),
  instructorName: text("instructorName").notNull(),
  instructorBio: text("instructorBio").notNull(),
  instructorAvatarUrl: text("instructorAvatarUrl"),
  startDate: text("startDate").notNull(),
  durationWeeks: integer("durationWeeks").notNull(),
  schedule: text("schedule").notNull(),
  priceLabel: text("priceLabel").notNull(),
  priceAmount: integer("priceAmount").notNull(),
  currency: text("currency").notNull().default("INR"),
  stripePriceId: text("stripePriceId"),
  sampleYoutubeVideoId: text("sampleYoutubeVideoId").notNull(),
  heroImageUrl: text("heroImageUrl").notNull(),
  curriculumJson: text("curriculumJson").notNull(),
  seats: integer("seats").notNull().default(100),
  seatsLeft: integer("seatsLeft").notNull().default(100),
  level: text("level").notNull(),
  tags: text("tags").notNull(),
  status: text("status").notNull().default("draft"),
  recordingUrl: text("recordingUrl"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const liveCohortEnrollments = pgTable(
  "LiveCohortEnrollment",
  {
    id: text("id").primaryKey(),
    cohortId: text("cohortId").notNull(),
    authUserId: text("authUserId").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    enrolledAt: timestamp("enrolledAt", { mode: "date" }).notNull().defaultNow(),
    paid: boolean("paid").notNull().default(false),
    attended: boolean("attended").notNull().default(false),
  },
  (t) => [
    uniqueIndex("LiveCohortEnrollment_cohortId_authUserId_key").on(t.cohortId, t.authUserId),
    index("LiveCohortEnrollment_cohortId_idx").on(t.cohortId),
  ],
);

export const courseConfigs = pgTable("CourseConfig", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  emoji: text("emoji").notNull().default("📊"),
  accentColor: text("accentColor").notNull().default("#456DFF"),
  published: boolean("published").notNull().default(true),
  order: integer("order").notNull().default(0),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const siteBannerConfigs = pgTable("SiteBannerConfig", {
  id: text("id").primaryKey().default("default"),
  enabled: boolean("enabled").notNull().default(true),
  message: text("message")
    .notNull()
    .default("Tradeverse update: Track your streak, XP, and lessons from your dashboard."),
  variant: text("variant").notNull().default("rainbow"),
  bannerId: text("bannerId").notNull().default("dashboard-top-banner"),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type XpLedger = typeof xpLedger.$inferSelect;
export type LibraryCourse = typeof libraryCourses.$inferSelect;
export type LibraryVideo = typeof libraryVideos.$inferSelect;
export type LibraryStandaloneVideo = typeof libraryStandaloneVideos.$inferSelect;
export type LessonComment = typeof lessonComments.$inferSelect;
export type SRSCard = typeof srsCards.$inferSelect;
export type LiveCohort = typeof liveCohorts.$inferSelect;
export type LiveCohortEnrollment = typeof liveCohortEnrollments.$inferSelect;
