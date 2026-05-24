import { NextResponse } from "next/server";
import { getCurrentPrice, getMarketStatus } from "@/lib/marketData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") ?? "RELIANCE";
  try {
    const { price, change24h, changePct } = await getCurrentPrice(symbol);
    const status = getMarketStatus(symbol);
    return NextResponse.json({ symbol, price, change24h, changePct, market: status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
