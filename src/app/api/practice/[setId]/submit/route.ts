import { NextResponse } from "next/server";

type SubmittedAnswer = { correct: boolean };

export async function POST(req: Request) {
  const body = (await req.json()) as { answers?: SubmittedAnswer[]; perfect?: boolean };
  const correct = (body.answers ?? []).filter((a) => a.correct).length;
  return NextResponse.json({ score: correct, total: body.answers?.length ?? 0, xp: 75 + (body.perfect ? 25 : 0) });
}
