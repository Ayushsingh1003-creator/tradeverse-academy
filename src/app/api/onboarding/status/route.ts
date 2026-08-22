export { dynamic } from "@/lib/route-dynamic";

import { NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/api";
import { userNeedsOnboardingAssessment } from "@/lib/onboarding/needsAssessment";

export async function GET() {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  const completed = Boolean(dbUser.onboardingAssessmentCompletedAt);
  let notes: string[] = [];
  try {
    notes = dbUser.assessmentNotes ? JSON.parse(dbUser.assessmentNotes) : [];
  } catch {
    notes = [];
  }

  return NextResponse.json({
    completed,
    needsAssessment: userNeedsOnboardingAssessment(dbUser),
    stage: dbUser.traderPersona ?? null,
    composite: dbUser.assessmentComposite ?? null,
    fields: {
      knowledge: dbUser.assessmentKScore ?? null,
      discipline: dbUser.assessmentDScore ?? null,
      experience: dbUser.assessmentExperienceScore ?? null,
      trackRecord: dbUser.assessmentTrackRecordScore ?? null,
    },
    notes,
  });
}
