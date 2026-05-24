import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: { setId: string } }) {
  const set = await db.practiceSet.findUnique({ where: { id: params.setId } });
  if (!set) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(set);
}
