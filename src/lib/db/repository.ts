import { createId } from "@paralleldrive/cuid2";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  gt,
  inArray,
  type AnyColumn,
  lte,
  max,
  sql,
  type SQL,
} from "drizzle-orm";
import { drizzleDb } from "./client";
import * as s from "./schema";

type WhereRecord = Record<string, unknown>;
type DataRecord = Record<string, unknown>;

function mapAuthFields<T extends DataRecord>(data: T): T {
  const out = { ...data } as DataRecord;
  if ("clerkUserId" in out) {
    out.authUserId = out.clerkUserId;
    delete out.clerkUserId;
  }
  if ("creatorClerkId" in out) {
    out.creatorAuthUserId = out.creatorClerkId;
    delete out.creatorClerkId;
  }
  return out as T;
}

function whereToSql(table: Record<string, unknown>, where: WhereRecord): SQL | undefined {
  const mapped = mapAuthFields(where);
  const parts: SQL[] = [];
  for (const [key, value] of Object.entries(mapped)) {
    if (value === undefined) continue;
    const col = table[key];
    if (!col) continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const obj = value as Record<string, unknown>;
      if ("gte" in obj) parts.push(gte(col as never, obj.gte as never));
      if ("lte" in obj) parts.push(lte(col as never, obj.lte as never));
      if ("gt" in obj) parts.push(gt(col as never, obj.gt as never));
      if ("in" in obj && Array.isArray(obj.in)) {
        parts.push(inArray(col as AnyColumn, obj.in as never[]));
      }
      continue;
    }
    parts.push(eq(col as never, value as never));
  }
  return parts.length ? and(...parts) : undefined;
}

function pickColumns<T extends Record<string, unknown>>(
  row: T,
  select?: Record<string, boolean>,
): Partial<T> {
  if (!select) return row;
  const out: Partial<T> = {};
  for (const key of Object.keys(select)) {
    if (select[key] && key in row) (out as Record<string, unknown>)[key] = row[key];
  }
  return out;
}

function withId(data: DataRecord): DataRecord {
  const mapped = mapAuthFields(data);
  if (!mapped.id) mapped.id = createId();
  return mapped;
}

function makeModel<TTable extends Record<string, unknown>>(
  table: TTable,
  tableRef: Parameters<typeof drizzleDb.insert>[0],
  opts?: { compositeKeys?: Record<string, string[]> },
) {
  return {
    async findUnique(args: { where: WhereRecord; select?: Record<string, boolean>; include?: unknown }) {
      const w = whereToSql(table, args.where);
      if (!w) return null;
      const rows = await drizzleDb.select().from(tableRef).where(w).limit(1);
      let row = rows[0] ?? null;
      if (!row) return null;
      if (args.include && tableRef === s.courses) {
        const course = row as typeof s.courses.$inferSelect;
        const lessonRows = await drizzleDb
          .select()
          .from(s.lessons)
          .where(eq(s.lessons.courseId, course.id))
          .orderBy(asc(s.lessons.order));
        row = { ...course, lessons: lessonRows } as never;
      }
      if (args.include && tableRef === s.learningPaths) {
        const path = row as typeof s.learningPaths.$inferSelect;
        const courseRows = await drizzleDb
          .select()
          .from(s.courses)
          .where(eq(s.courses.pathId, path.id))
          .orderBy(asc(s.courses.order));
        row = { ...path, courses: courseRows } as never;
      }
      if (args.include && tableRef === s.libraryCourses) {
        const course = row as typeof s.libraryCourses.$inferSelect;
        const videoRows = await drizzleDb
          .select()
          .from(s.libraryVideos)
          .where(eq(s.libraryVideos.courseId, course.id))
          .orderBy(asc(s.libraryVideos.order));
        row = { ...course, videos: videoRows } as never;
      }
      if (args.include && tableRef === s.liveCohorts) {
        const cohort = row as typeof s.liveCohorts.$inferSelect;
        const enrollmentRows = await drizzleDb
          .select()
          .from(s.liveCohortEnrollments)
          .where(eq(s.liveCohortEnrollments.cohortId, cohort.id))
          .orderBy(desc(s.liveCohortEnrollments.enrolledAt));
        row = { ...cohort, enrollments: enrollmentRows } as never;
      }
      return pickColumns(row as Record<string, unknown>, args.select) as never;
    },
    async findFirst(args: {
      where?: WhereRecord;
      orderBy?: unknown;
      select?: Record<string, boolean>;
      include?: unknown;
    }) {
      let q = drizzleDb.select().from(tableRef);
      if (args.where) {
        const w = whereToSql(table, args.where);
        if (w) q = q.where(w) as typeof q;
      }
      const rows = await q.limit(1);
      let row = (rows[0] ?? null) as Record<string, unknown> | null;
      if (!row) return null;
      if (args.include && tableRef === s.libraryCourses) {
        const course = row as typeof s.libraryCourses.$inferSelect;
        const videoRows = await drizzleDb
          .select()
          .from(s.libraryVideos)
          .where(eq(s.libraryVideos.courseId, course.id))
          .orderBy(asc(s.libraryVideos.order));
        row = { ...course, videos: videoRows };
      }
      return pickColumns(row, args.select) as never;
    },
    async findMany(args?: {
      where?: WhereRecord;
      orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
      take?: number;
      skip?: number;
      select?: Record<string, boolean>;
      include?: unknown;
    }) {
      let q = drizzleDb.select().from(tableRef);
      if (args?.where) {
        const w = whereToSql(table, args.where);
        if (w) q = q.where(w) as typeof q;
      }
      if (args?.orderBy && !Array.isArray(args.orderBy)) {
        const [field, dir] = Object.entries(args.orderBy)[0] ?? [];
        const col = field ? table[field] : undefined;
        if (col) q = (dir === "desc" ? q.orderBy(desc(col as never)) : q.orderBy(asc(col as never))) as typeof q;
      }
      if (args?.take) q = q.limit(args.take) as typeof q;
      if (args?.skip) q = q.offset(args.skip) as typeof q;
      const rows = await q;
      const mapped: Record<string, unknown>[] = rows.map((r) =>
        pickColumns(r as Record<string, unknown>, args?.select),
      );
      if (args?.include && tableRef === s.libraryCourses) {
        const withVideos = await Promise.all(
          mapped.map(async (course: Record<string, unknown>) => {
            const c = course as typeof s.libraryCourses.$inferSelect;
            const videoRows = await drizzleDb
              .select()
              .from(s.libraryVideos)
              .where(eq(s.libraryVideos.courseId, c.id))
              .orderBy(asc(s.libraryVideos.order));
            return { ...c, videos: videoRows };
          }),
        );
        return withVideos as never[];
      }
      return mapped;
    },
    async create(args: { data: DataRecord; select?: Record<string, boolean> }) {
      const data = withId(args.data);
      const rows = await drizzleDb.insert(tableRef).values(data as never).returning();
      return pickColumns(rows[0] as Record<string, unknown>, args.select) as never;
    },
    async update(args: { where: WhereRecord; data: DataRecord }) {
      const w = whereToSql(table, args.where);
      if (!w) throw new Error("update: missing where");
      const data = mapAuthFields(args.data);
      if (tableRef === s.subscriptions || tableRef === s.srsCards) {
        data.updatedAt = new Date();
      }
      const rows = await drizzleDb.update(tableRef).set(data as never).where(w).returning();
      return rows[0] ?? null;
    },
    async updateMany(args: { where: WhereRecord; data: DataRecord }) {
      const w = whereToSql(table, args.where);
      const data = mapAuthFields(args.data);
      if (!w) return { count: 0 };
      const rows = await drizzleDb.update(tableRef).set(data as never).where(w).returning();
      return { count: rows.length };
    },
    async upsert(args: { where: WhereRecord; create: DataRecord; update: DataRecord }) {
      const existing = await this.findUnique({ where: args.where });
      if (existing) {
        return this.update({ where: args.where, data: args.update });
      }
      return this.create({ data: { ...args.create, ...args.where } });
    },
    async delete(args: { where: WhereRecord }) {
      const w = whereToSql(table, args.where);
      if (!w) return null;
      const rows = await drizzleDb.delete(tableRef).where(w).returning();
      return rows[0] ?? null;
    },
    async deleteMany(args: { where: WhereRecord }) {
      const w = whereToSql(table, args.where);
      if (!w) return { count: 0 };
      const rows = await drizzleDb.delete(tableRef).where(w).returning();
      return { count: rows.length };
    },
    async count(args?: { where?: WhereRecord }) {
      let q = drizzleDb.select({ value: count() }).from(tableRef);
      if (args?.where) {
        const w = whereToSql(table, args.where);
        if (w) q = q.where(w) as typeof q;
      }
      const rows = await q;
      return rows[0]?.value ?? 0;
    },
    async aggregate(args: { where?: WhereRecord; _max?: Record<string, boolean> }) {
      if (args._max?.order && table.order) {
        let q = drizzleDb.select({ order: max(s.libraryVideos.order) }).from(s.libraryVideos);
        if (args.where) {
          const w = whereToSql(table, args.where);
          if (w) q = q.where(w) as typeof q;
        }
        const rows = await q;
        return { _max: { order: rows[0]?.order ?? null } };
      }
      return { _max: {} };
    },
    async groupBy(args: {
      by: string[];
      where?: WhereRecord;
      _sum?: Record<string, boolean>;
      _count?: Record<string, boolean>;
    }) {
      if (tableRef === s.xpLedger && args.by.includes("userId")) {
        const conditions: SQL[] = [];
        if (args.where) {
          const mapped = mapAuthFields(args.where);
          for (const [key, value] of Object.entries(mapped)) {
            const col = table[key];
            if (!col) continue;
            if (value && typeof value === "object" && !(value instanceof Date)) {
              const obj = value as Record<string, unknown>;
              if ("gte" in obj) conditions.push(gte(col as never, obj.gte as never));
              if ("lte" in obj) conditions.push(lte(col as never, obj.lte as never));
              if ("gt" in obj && col === s.xpLedger.amount) conditions.push(gt(col as never, obj.gt as never));
            }
          }
        }
        const rows = await drizzleDb
          .select({
            userId: s.xpLedger.userId,
            _sum: { amount: sql<number>`coalesce(sum(${s.xpLedger.amount}), 0)` },
          })
          .from(s.xpLedger)
          .where(conditions.length ? and(...conditions) : undefined)
          .groupBy(s.xpLedger.userId);
        return rows.map((r) => ({ userId: r.userId, _sum: { amount: Number(r._sum.amount) } }));
      }
      if (tableRef === s.lessonProgress && args.by.includes("lessonId")) {
        const rows = await drizzleDb
          .select({ lessonId: s.lessonProgress.lessonId, _count: count() })
          .from(s.lessonProgress)
          .groupBy(s.lessonProgress.lessonId);
        return rows.map((r) => ({ lessonId: r.lessonId, _count: { _all: r._count } }));
      }
      return [];
    },
    opts,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = {
  user: makeModel(
    {
      id: s.users.id,
      email: s.users.email,
      authUserId: s.users.authUserId,
      clerkUserId: s.users.authUserId,
      name: s.users.name,
      country: s.users.country,
    },
    s.users,
  ),
  xpLedger: makeModel({ id: s.xpLedger.id, userId: s.xpLedger.userId, idempotencyKey: s.xpLedger.idempotencyKey, amount: s.xpLedger.amount, createdAt: s.xpLedger.createdAt }, s.xpLedger),
  subscription: makeModel({ authUserId: s.subscriptions.authUserId, clerkUserId: s.subscriptions.authUserId, stripeCustomerId: s.subscriptions.stripeCustomerId }, s.subscriptions),
  libraryCourse: makeModel({ id: s.libraryCourses.id, slug: s.libraryCourses.slug }, s.libraryCourses),
  libraryVideo: makeModel({ id: s.libraryVideos.id, courseId: s.libraryVideos.courseId, order: s.libraryVideos.order }, s.libraryVideos),
  libraryCourseEnrollment: makeModel(
    { id: s.libraryCourseEnrollments.id, userId: s.libraryCourseEnrollments.userId, courseSlug: s.libraryCourseEnrollments.courseSlug },
    s.libraryCourseEnrollments,
  ),
  liveCohort: makeModel({ id: s.liveCohorts.id, slug: s.liveCohorts.slug }, s.liveCohorts),
  liveCohortEnrollment: makeModel({ id: s.liveCohortEnrollments.id, cohortId: s.liveCohortEnrollments.cohortId, authUserId: s.liveCohortEnrollments.authUserId, clerkUserId: s.liveCohortEnrollments.authUserId }, s.liveCohortEnrollments),
  leagueSeason: makeModel({ id: s.leagueSeasons.id }, s.leagueSeasons),
  lessonVideo: makeModel({ lessonSlug: s.lessonVideos.lessonSlug }, s.lessonVideos),
  lesson: makeModel({ slug: s.lessons.slug, id: s.lessons.id }, s.lessons),
  lessonComment: makeModel({ id: s.lessonComments.id, lessonSlug: s.lessonComments.lessonSlug }, s.lessonComments),
  lessonCommentReply: makeModel({ id: s.lessonCommentReplies.id, commentId: s.lessonCommentReplies.commentId }, s.lessonCommentReplies),
  commentUpvote: {
    async findUnique(args: { where: { clerkUserId_commentId?: { clerkUserId: string; commentId: string }; authUserId_commentId?: { authUserId: string; commentId: string } } }) {
      const pair = args.where.clerkUserId_commentId ?? args.where.authUserId_commentId;
      if (!pair) return null;
      const authUserId = "clerkUserId" in pair ? pair.clerkUserId : pair.authUserId;
      const rows = await drizzleDb
        .select()
        .from(s.commentUpvotes)
        .where(and(eq(s.commentUpvotes.authUserId, authUserId), eq(s.commentUpvotes.commentId, pair.commentId)))
        .limit(1);
      return rows[0] ?? null;
    },
    async create(args: { data: DataRecord }) {
      const data = mapAuthFields(withId(args.data));
      const rows = await drizzleDb.insert(s.commentUpvotes).values(data as never).returning();
      return rows[0];
    },
    async delete(args: { where: { clerkUserId_commentId: { clerkUserId: string; commentId: string } } }) {
      const { clerkUserId, commentId } = args.where.clerkUserId_commentId;
      await drizzleDb
        .delete(s.commentUpvotes)
        .where(and(eq(s.commentUpvotes.authUserId, clerkUserId), eq(s.commentUpvotes.commentId, commentId)));
      return null;
    },
  },
  lessonProgress: makeModel({ userId: s.lessonProgress.userId, lessonId: s.lessonProgress.lessonId }, s.lessonProgress),
  course: makeModel({ slug: s.courses.slug, id: s.courses.id }, s.courses),
  learningPath: makeModel({ slug: s.learningPaths.slug, id: s.learningPaths.id }, s.learningPaths),
  siteBannerConfig: makeModel({ id: s.siteBannerConfigs.id }, s.siteBannerConfigs),
  pushSubscription: makeModel({ endpoint: s.pushSubscriptions.endpoint, authUserId: s.pushSubscriptions.authUserId, clerkUserId: s.pushSubscriptions.authUserId }, s.pushSubscriptions),
  referral: makeModel({ code: s.referrals.code }, s.referrals),
  follow: makeModel({ followerId: s.follows.followerId, followingId: s.follows.followingId }, s.follows),
  organization: makeModel({ slug: s.organizations.slug }, s.organizations),
  practiceSet: makeModel({ id: s.practiceSets.id }, s.practiceSets),
  sRSCard: makeModel({ authUserId: s.srsCards.authUserId, clerkUserId: s.srsCards.authUserId, lessonSlug: s.srsCards.lessonSlug }, s.srsCards),
  async $transaction<T>(
    fnOrOps: ((tx: typeof db) => Promise<T>) | Promise<unknown>[],
  ): Promise<T> {
    if (Array.isArray(fnOrOps)) {
      const results = await Promise.all(fnOrOps);
      return results as T;
    }
    return fnOrOps(db);
  },
};
