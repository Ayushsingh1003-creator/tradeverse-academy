import { db } from "@/lib/db";
import { AUTH_HOME_URL } from "@/lib/auth/urls";
import { ONBOARDING_URL } from "./constants";

export async function resolvePostAuthUrl(authUserId: string, email: string | null): Promise<string> {
  const row = await db.user.findUnique({
    where: { authUserId },
    select: { onboardingAssessmentCompletedAt: true },
  });
  if (row?.onboardingAssessmentCompletedAt) return AUTH_HOME_URL;

  const byEmail =
    !row && email
      ? await db.user.findUnique({
          where: { email },
          select: { onboardingAssessmentCompletedAt: true },
        })
      : null;

  if (byEmail?.onboardingAssessmentCompletedAt) return AUTH_HOME_URL;
  return ONBOARDING_URL;
}
