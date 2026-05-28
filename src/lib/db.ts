import path from "path";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma CLI resolves `file:` URLs relative to `prisma/schema.prisma`.
 * Next.js resolves them relative to `process.cwd()` (project root).
 * Normalize so both use `prisma/dev.db`.
 */
function resolveSqliteDatabaseUrl(): void {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith("file:")) return;

  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) return;

  const normalized = filePath.replace(/^\.\//, "");
  const prismaDir = path.join(process.cwd(), "prisma");

  const toFileUrl = (absolutePath: string) =>
    `file:${absolutePath.replace(/\\/g, "/")}`;

  // Already `prisma/dev.db` from project root (Next.js cwd).
  if (normalized.startsWith(`prisma${path.sep}`) || normalized.startsWith("prisma/")) {
    process.env.DATABASE_URL = toFileUrl(path.join(process.cwd(), normalized));
    return;
  }

  // `file:./dev.db` — Prisma CLI convention (relative to schema dir).
  process.env.DATABASE_URL = toFileUrl(path.join(prismaDir, normalized));
}

resolveSqliteDatabaseUrl();

export const db = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = db;
