import { db } from "@/lib/db";
import type { User } from "@/lib/db/schema";

export function userNeedsOnboardingAssessment(
  user: Pick<User, "onboardingAssessmentCompletedAt"> | null | undefined,
): boolean {
  return !user?.onboardingAssessmentCompletedAt;
}

export async function needsOnboardingForAuthUser(
  authUserId: string,
  email: string | null,
): Promise<boolean> {
  const byAuth = await db.user.findUnique({
    where: { authUserId },
    select: { onboardingAssessmentCompletedAt: true },
  });
  if (byAuth) return userNeedsOnboardingAssessment(byAuth);
  if (!email) return true;
  const byEmail = await db.user.findUnique({
    where: { email },
    select: { onboardingAssessmentCompletedAt: true },
  });
  return userNeedsOnboardingAssessment(byEmail);
}
