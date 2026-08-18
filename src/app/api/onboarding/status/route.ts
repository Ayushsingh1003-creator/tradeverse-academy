export { dynamic } from "@/lib/route-dynamic";

import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/api";
import { userNeedsOnboardingAssessment } from "@/lib/onboarding/needsAssessment";

export async function GET() {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  const completed = Boolean(dbUser.onboardingAssessmentCompletedAt);
  return NextResponse.json({
    completed,
    needsAssessment: userNeedsOnboardingAssessment(dbUser),
    persona: dbUser.traderPersona ?? null,
    kScore: dbUser.assessmentKScore ?? null,
    dScore: dbUser.assessmentDScore ?? null,
    acceleratedPace: dbUser.assessmentAcceleratedPace ?? false,
  });
}
