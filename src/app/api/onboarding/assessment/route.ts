export { dynamic } from "@/lib/route-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireDbUser } from "@/lib/auth/api";
import { db } from "@/lib/db";
import { assessTrader, validateAssessmentAnswers } from "@/lib/onboarding/scoreAssessment";

export async function POST(req: NextRequest) {
  const authResult = await requireDbUser();
  if (authResult.error) return authResult.error;
  const { dbUser } = authResult;

  if (dbUser.onboardingAssessmentCompletedAt) {
    return NextResponse.json({ error: "Assessment already completed." }, { status: 409 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateAssessmentAnswers(
    body && typeof body === "object" && "answers" in (body as object)
      ? (body as { answers: unknown }).answers
      : body,
  );
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = assessTrader(parsed.answers);
  const now = new Date();

  await db.user.update({
    where: { id: dbUser.id },
    data: {
      onboardingAssessmentCompletedAt: now,
      traderPersona: result.stage.key,
      assessmentKScore: result.fields.knowledge,
      assessmentDScore: result.fields.discipline,
      assessmentExperienceScore: result.fields.experience,
      assessmentTrackRecordScore: result.fields.trackRecord,
      assessmentComposite: result.composite,
      assessmentAnswers: JSON.stringify(parsed.answers),
      assessmentNotes: JSON.stringify(result.notes),
    },
  });

  return NextResponse.json({
    completed: true,
    ...result,
  });
}
