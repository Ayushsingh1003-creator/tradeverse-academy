/** Real-price OHLC bar (not SVG pixels). */
export type OhlcBar = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

export type TimeframeCode = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1" | "W1" | "MN";

const MS_MIN = 60_000;

/** Max candles shown in the lesson preview chart (per timeframe). */
export const PREVIEW_MAX_BARS = 8;

export const PREVIEW_BAR_COUNT: Record<TimeframeCode, number> = {
  M1: PREVIEW_MAX_BARS,
  M5: PREVIEW_MAX_BARS,
  M15: PREVIEW_MAX_BARS,
  M30: PREVIEW_MAX_BARS,
  H1: PREVIEW_MAX_BARS,
  H4: PREVIEW_MAX_BARS,
  D1: PREVIEW_MAX_BARS,
  W1: PREVIEW_MAX_BARS,
  MN: 2,
};

/** Seeded PRNG — deterministic 2-month series across builds. */
function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

function isTradingDay(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

/** Sept 1 – Oct 31 2025, Mon–Fri, 10:00–16:29 UTC (1-minute bars). */
function generateTwoMonthM1Bars(): OhlcBar[] {
  const rand = createRng(0xc0ffee01);
  const bars: OhlcBar[] = [];
  let price = 142.5;

  const cursor = new Date(Date.UTC(2025, 8, 1, 10, 0, 0, 0));
  const end = new Date(Date.UTC(2025, 10, 1, 0, 0, 0, 0));

  while (cursor < end) {
    if (isTradingDay(cursor)) {
      const sessionStart = cursor.getUTCHours() * 60 + cursor.getUTCMinutes();
      const sessionEnd = 16 * 60 + 29;
      if (sessionStart >= 10 * 60 && sessionStart <= sessionEnd) {
        const month = cursor.getUTCMonth();
        const o = price;
        // Sept trends up (green month), Oct trends down (red month).
        const driftBias = month === 8 ? 0.42 : month === 9 ? 0.58 : 0.49;
        const drift = (rand() - driftBias) * 0.12;
        const c = Math.max(80, o + drift);
        const wickUp = rand() * 0.18;
        const wickDown = rand() * 0.18;
        const h = Math.max(o, c) + wickUp;
        const l = Math.min(o, c) - wickDown;
        bars.push({ t: cursor.getTime(), o, h, l, c });
        price = c;
      }
    }
    cursor.setUTCMinutes(cursor.getUTCMinutes() + 1);
  }

  return bars;
}

function mergeInto(map: Map<number, OhlcBar>, key: number, bar: OhlcBar) {
  const prev = map.get(key);
  if (!prev) {
    map.set(key, { t: key, o: bar.o, h: bar.h, l: bar.l, c: bar.c });
    return;
  }
  prev.h = Math.max(prev.h, bar.h);
  prev.l = Math.min(prev.l, bar.l);
  prev.c = bar.c;
}

function aggregatePeriod(bars: OhlcBar[], periodMs: number): OhlcBar[] {
  const map = new Map<number, OhlcBar>();
  for (const bar of bars) {
    const key = Math.floor(bar.t / periodMs) * periodMs;
    mergeInto(map, key, bar);
  }
  return [...map.values()].sort((a, b) => a.t - b.t);
}

function startOfUtcDay(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function startOfUtcWeek(t: number): number {
  const d = new Date(t);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function startOfUtcMonth(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

function aggregateCalendar(bars: OhlcBar[], bucket: (t: number) => number): OhlcBar[] {
  const map = new Map<number, OhlcBar>();
  for (const bar of bars) {
    const key = bucket(bar.t);
    mergeInto(map, key, bar);
  }
  return [...map.values()].sort((a, b) => a.t - b.t);
}

let cachedM1: OhlcBar[] | null = null;

/** Full 2-month 1-minute series (generated once, cached). */
export function getTwoMonthM1Bars(): OhlcBar[] {
  if (!cachedM1) cachedM1 = generateTwoMonthM1Bars();
  return cachedM1;
}

export function aggregateToTimeframe(bars: OhlcBar[], code: TimeframeCode): OhlcBar[] {
  switch (code) {
    case "M1":
      return bars;
    case "M5":
      return aggregatePeriod(bars, 5 * MS_MIN);
    case "M15":
      return aggregatePeriod(bars, 15 * MS_MIN);
    case "M30":
      return aggregatePeriod(bars, 30 * MS_MIN);
    case "H1":
      return aggregatePeriod(bars, 60 * MS_MIN);
    case "H4":
      return aggregatePeriod(bars, 4 * 60 * MS_MIN);
    case "D1":
      return aggregateCalendar(bars, startOfUtcDay);
    case "W1":
      return aggregateCalendar(bars, startOfUtcWeek);
    case "MN":
      return aggregateCalendar(bars, startOfUtcMonth);
  }
}

/** Distinct Sept/Oct shapes for the lesson preview — green w/ long lower wick, red w/ long upper wick. */
function shapeMonthlyPreview(bars: OhlcBar[]): OhlcBar[] {
  if (bars.length < 2) return bars;
  const [sept, oct] = bars;
  return [
    {
      t: sept.t,
      o: 148,
      h: 159,
      l: 128,
      c: 156,
    },
    {
      t: oct.t,
      o: 156,
      h: 170,
      l: 140,
      c: 142,
    },
  ];
}

/** Last N bars ending at the final timestamp in the 2-month window. */
export function previewBarsForTimeframe(code: TimeframeCode): OhlcBar[] {
  const m1 = getTwoMonthM1Bars();
  const aggregated = aggregateToTimeframe(m1, code);
  const count = PREVIEW_BAR_COUNT[code];
  const slice = aggregated.slice(-count);
  if (code === "MN") return shapeMonthlyPreview(slice);
  return slice;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

export function formatBarLabel(t: number, code: TimeframeCode): string {
  const d = new Date(t);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");

  switch (code) {
    case "M1":
    case "M5":
    case "M15":
    case "M30":
    case "H1":
    case "H4":
      return `${hh}:${mm}`;
    case "D1":
      return `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
    case "W1":
      return `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`;
    case "MN":
      return MONTH_SHORT[d.getUTCMonth()]!;
  }
}
