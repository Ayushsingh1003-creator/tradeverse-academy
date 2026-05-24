import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const path = await db.learningPath.findUnique({
    where: { slug: params.slug },
    include: { courses: { include: { lessons: true }, orderBy: { order: "asc" } } },
  });
  if (!path) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(path);
}
