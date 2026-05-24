import { db } from "@/lib/db";

export async function getLibraryEnrollmentsForUser(userId: string) {
  try {
    return await db.libraryCourseEnrollment.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}
