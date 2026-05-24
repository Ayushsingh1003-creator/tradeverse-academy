import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const lesson = await db.lesson.findUnique({ where: { slug: params.slug } });
  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lesson);
}
