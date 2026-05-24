import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const passwordHash = await hash(parsed.data.password, 10);
  const user = await db.user.create({
    data: { ...parsed.data, passwordHash },
    select: { id: true, email: true, name: true },
  });
  return NextResponse.json(user, { status: 201 });
}
