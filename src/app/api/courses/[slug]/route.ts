import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const course = await db.course.findUnique({ where: { slug: params.slug }, include: { lessons: { orderBy: { order: "asc" } } } });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(course);
}
