import axios from "axios";

export type OHLCVBar = { time: string; open: number; high: number; low: number; close: number; volume?: number };

export const SUPPORTED_SYMBOLS = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "BTC/USD",
  "ETH/USD",
  "USD/INR",
  "EUR/INR",
] as const;

type CacheEntry<T> = { expires: number; value: T };
const mem = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const row = mem.get(key) as CacheEntry<T> | undefined;
  if (!row || Date.now() > row.expires) return null;
  return row.value;
}

function setCached<T>(key: string, ttlMs: number, value: T) {
  mem.set(key, { expires: Date.now() + ttlMs, value });
}

/** Polygon / stocks / crypto / FX ticker */
export function toPolygonTicker(symbol: string): string {
  const s = symbol.trim().toUpperCase();
  if (s === "BTC/USD" || s === "BTC-USD") return "X:BTCUSD";
  if (s === "ETH/USD" || s === "ETH-USD") return "X:ETHUSD";
  if (s.includes("/")) {
    const [a, b] = s.split("/");
    return `C:${a}${b}`;
  }
  return s;
}

function mockBars(symbol: string, limit: number): OHLCVBar[] {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
  const bars: OHLCVBar[] = [];
  let close = 50 + (seed % 200);
  const now = Date.now();
  for (let i = limit - 1; i >= 0; i--) {
    const t = new Date(now - i * 86400000).toISOString().slice(0, 10);
    const o = close;
    const change = ((Math.sin(seed + i) + 1) / 2 - 0.45) * 3;
    close = Math.max(1, o + change);
    const h = Math.max(o, close) + Math.random() * 2;
    const l = Math.min(o, close) - Math.random() * 2;
    bars.push({ time: t, open: o, high: h, low: l, close, volume: 1000000 + i * 1000 });
  }
  return bars;
}

const tfMap: Record<string, { mult: number; span: "minute" | "hour" | "day" }> = {
  "1min": { mult: 1, span: "minute" },
  "5min": { mult: 5, span: "minute" },
  "1hour": { mult: 1, span: "hour" },
  "1day": { mult: 1, span: "day" },
};

export async function getHistoricalBars(
  symbol: string,
  timeframe: "1min" | "5min" | "1hour" | "1day",
  limit = 100,
): Promise<OHLCVBar[]> {
  const key = `bars:${symbol}:${timeframe}:${limit}`;
  const hit = getCached<OHLCVBar[]>(key);
  if (hit) return hit;

  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    const mock = mockBars(symbol, limit);
    setCached(key, 60_000, mock);
    return mock;
  }

  const ticker = toPolygonTicker(symbol);
  const { mult, span } = tfMap[timeframe] ?? tfMap["1day"];
  const to = new Date();
  const from = new Date(to);
  if (span === "day") from.setDate(from.getDate() - Math.max(limit * 2, 400));
  else if (span === "hour") from.setDate(from.getDate() - 60);
  else from.setDate(from.getDate() - 14);

  const fromStr = from.toISOString().slice(0, 10);
  const toStr = to.toISOString().slice(0, 10);
  const url = `https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${mult}/${span}/${fromStr}/${toStr}`;

  try {
    const { data } = await axios.get(url, {
      params: { adjusted: true, sort: "asc", limit, apiKey },
      timeout: 12000,
    });
    const results = (data?.results ?? []) as Array<{
      t: number;
      o: number;
      h: number;
      l: number;
      c: number;
      v?: number;
    }>;
    const bars: OHLCVBar[] = results.map((r) => ({
      time: new Date(r.t).toISOString().slice(0, 19).replace("T", " "),
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v,
    }));
    const out = bars.length ? bars.slice(-limit) : mockBars(symbol, limit);
    setCached(key, 60_000, out);
    return out;
  } catch {
    const mock = mockBars(symbol, limit);
    setCached(key, 30_000, mock);
    return mock;
  }
}

export async function getCurrentPrice(symbol: string): Promise<{ price: number; change24h: number; changePct: number }> {
  const key = `price:${symbol}`;
  const hit = getCached<{ price: number; change24h: number; changePct: number }>(key);
  if (hit) return hit;

  const bars = await getHistoricalBars(symbol, "1day", 2);
  const last = bars[bars.length - 1]?.close ?? 100;
  const prev = bars[bars.length - 2]?.close ?? last;
  const change24h = last - prev;
  const changePct = prev ? (change24h / prev) * 100 : 0;

  const apiKey = process.env.POLYGON_API_KEY;
  if (apiKey) {
    const ticker = toPolygonTicker(symbol);
    try {
      const { data } = await axios.get(`https://api.polygon.io/v2/snapshot/locale/global/markets/crypto/tickers/${ticker}`, {
        params: { apiKey },
        timeout: 8000,
      });
      const p = data?.ticker?.lastTrade?.p ?? data?.ticker?.day?.c;
      if (typeof p === "number") {
        const out = { price: p, change24h, changePct };
        setCached(key, 15_000, out);
        return out;
      }
    } catch {
      /* fall through */
    }
    try {
      const { data } = await axios.get(`https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`, {
        params: { apiKey },
        timeout: 8000,
      });
      const p = data?.ticker?.lastTrade?.p ?? data?.ticker?.day?.c;
      if (typeof p === "number") {
        const out = { price: p, change24h, changePct };
        setCached(key, 15_000, out);
        return out;
      }
    } catch {
      /* fall through */
    }
  }

  const out = { price: last, change24h, changePct };
  setCached(key, 15_000, out);
  return out;
}

export function isEquitySymbol(symbol: string): boolean {
  return /^[A-Z]{1,12}$/.test(symbol.trim());
}

/** Rough India equity session (IST). Crypto/FX treated as always open here. */
export function getMarketStatus(symbol: string): { open: boolean; label: string; nextOpen?: string } {
  if (!isEquitySymbol(symbol)) {
    return { open: true, label: "Market Open (24h)" };
  }
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const day = ist.getDay();
  const h = ist.getHours();
  const m = ist.getMinutes();
  const minutes = h * 60 + m;
  const openM = 9 * 60 + 15;
  const closeM = 15 * 60 + 30;
  const weekday = day >= 1 && day <= 5;
  const open = weekday && minutes >= openM && minutes < closeM;
  if (open) return { open: true, label: "NSE/BSE Market Open" };
  const next = new Date(ist);
  if (weekday && minutes < openM) {
    next.setHours(9, 15, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() + 1);
    next.setHours(9, 15, 0, 0);
  }
  return { open: false, label: "NSE/BSE Market Closed", nextOpen: next.toISOString() };
}
