import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Authentication UI is disabled. All app features are open access." },
    { status: 200 },
  );
}
