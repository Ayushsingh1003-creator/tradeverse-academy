"use server";

import { db } from "@/lib/db";
import { LESSONS } from "@/lib/data/lessons";

export async function getLessons() {
  return LESSONS;
}

export async function updateLesson(id: string, data: Record<string, unknown>) {
  return { id, updated: true, data };
}

export async function getUsers(page = 1, search = "") {
  const take = 20;
  const skip = (page - 1) * take;
  const where = search ? { OR: [{ email: { contains: search } }, { name: { contains: search } }] } : {};
  const [users, total] = await Promise.all([db.user.findMany({ where, take, skip, orderBy: { createdAt: "desc" } }), db.user.count({ where })]);
  return { users, total, page, take };
}

export async function getDailyStats(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const users = await db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } });
  return users;
}

export async function getLessonCompletionStats() {
  return db.lessonProgress.groupBy({
    by: ["lessonId"],
    _count: { lessonId: true },
    where: { completed: true },
  });
}
