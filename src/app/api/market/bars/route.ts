import { NextResponse } from "next/server";
import { getHistoricalBars } from "@/lib/marketData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "RELIANCE";
  const tf = (searchParams.get("timeframe") ?? "1day") as "1min" | "5min" | "1hour" | "1day";
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") ?? 100)));
  try {
    const bars = await getHistoricalBars(symbol, tf, limit);
    return NextResponse.json({ bars });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
