import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const achievements = [
  "First Step","On a Roll","Week Warrior","Monthly Master","Perfect Practice","Speed Demon","Course Complete","Path Pioneer","Chart Reader","Risk Manager","Top 10%","League Climber","Level 10","Level 25","Level 50","Daily Challenger","Premium Scholar","Early Adopter","Night Owl","Early Bird",
].map((title, idx) => ({
  title,
  description: `${title} unlocked`,
  icon: "trophy",
  condition: JSON.stringify({ type: "milestone", value: idx + 1 }),
  xpReward: 25 + idx * 5,
}));

const candleLessonContent = [
  { type: "heading", content: "The Candlestick: Your Market Snapshot", level: 2 },
  { type: "text", content: "A candlestick captures Open, High, Low, Close in one bar." },
  {
    type: "chart",
    config: {
      assetType: "stock",
      symbol: "AAPL",
      interval: "1D",
      data: [{ time: "2024-01-15", open: 185, high: 192, low: 183, close: 190 }],
      interactive: false,
      showControls: ["zoom"],
    },
  },
  {
    type: "question",
    id: "q_001",
    questionType: "multiple_choice",
    question: "What does candle color indicate?",
    options: ["Direction", "Volume", "P/E", "Sentiment"],
    correctAnswer: "Direction",
    explanation: "Green closes above open, red below.",
  },
];

async function main() {
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.practiceResult.deleteMany();
  await prisma.practiceSet.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  await prisma.achievement.createMany({ data: achievements });

  const path1 = await prisma.learningPath.create({
    data: {
      title: "Trading Foundations",
      slug: "trading-foundations",
      description: "Learn market basics and chart literacy.",
      level: "beginner",
      order: 1,
      color: "#3B82F6",
      icon: "book-open",
    },
  });

  const courses = [
    { title: "How Markets Work", slug: "how-markets-work", isFree: true },
    { title: "Reading Candlestick Charts", slug: "reading-candlestick-charts", isFree: true },
    { title: "Trend Analysis", slug: "trend-analysis", isFree: true },
  ];

  for (let i = 0; i < courses.length; i += 1) {
    const course = await prisma.course.create({
      data: {
        title: courses[i].title,
        slug: courses[i].slug,
        description: `Master ${courses[i].title}`,
        order: i + 1,
        pathId: path1.id,
        isFree: courses[i].isFree,
      },
    });

    for (let l = 0; l < 5; l += 1) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          title: `${course.title} Lesson ${l + 1}`,
          slug: `${course.slug}-lesson-${l + 1}`,
          order: l + 1,
          content: JSON.stringify(candleLessonContent),
          isFree: true,
        },
      });
      await prisma.practiceSet.create({
        data: {
          lessonId: lesson.id,
          questions: JSON.stringify(
            Array.from({ length: 6 }).map((_, q) => ({
              id: `${lesson.slug}-q-${q + 1}`,
              type: "multiple_choice",
              question: `Practice question ${q + 1} for ${lesson.title}`,
              options: ["A", "B", "C", "D"],
              correctAnswer: "A",
              explanation: "A is correct for demo data.",
            })),
          ),
        },
      });
    }
  }

  const pass = await bcrypt.hash("password123", 10);
  const freeUser = await prisma.user.create({
    data: { email: "free@tradeverse.com", name: "Free Trader", passwordHash: pass, xp: 320, level: 2, streak: 3, isPremium: true },
  });
  const premiumUser = await prisma.user.create({
    data: { email: "premium@tradeverse.com", name: "Premium Trader", passwordHash: pass, xp: 2480, level: 8, streak: 14, isPremium: true, role: "admin" },
  });
  await prisma.user.create({
    data: { email: "admin@tradeverse.com", name: "Admin", passwordHash: pass, isPremium: true, role: "admin", xp: 5000, level: 14, streak: 30 },
  });

  await prisma.subscription.create({
    data: {
      clerkUserId: `clerk_${premiumUser.id}`,
      stripeCustomerId: "cus_demo_123",
      stripeSubscriptionId: "sub_demo_123",
      stripePriceId: "price_demo_123",
      plan: "monthly",
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  const firstLesson = await prisma.lesson.findFirstOrThrow();
  await prisma.lessonProgress.create({
    data: { userId: freeUser.id, lessonId: firstLesson.id, completed: true, score: 85, timeSpent: 420, completedAt: new Date() },
  });

  await prisma.siteBannerConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      enabled: true,
      message: "Tradeverse update: Track your streak, XP, and lessons from your dashboard.",
      variant: "rainbow",
      bannerId: "dashboard-top-banner",
    },
    update: {},
  });
}

main().finally(async () => prisma.$disconnect());
