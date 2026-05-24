import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const paths = await db.learningPath.findMany({ include: { courses: true }, orderBy: { order: "asc" } });
  return NextResponse.json(paths);
}
