import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const org = await db.organization.findUnique({ where: { slug } });
  if (!org) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    name: org.name,
    logoUrl: org.logoUrl,
    primaryColor: org.primaryColor,
  });
}
