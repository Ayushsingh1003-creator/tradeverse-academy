/* ================================================================
 * chart math — ported from the design prototype's mscale()/locate()
 * helpers, mirroring the sibling lessons' geometry.ts convention.
 * ================================================================ */

export type CandleBar = { o: number; h: number; l: number; c: number };

export type BarChartScale = {
  W: number;
  H: number;
  padX: number;
  padTop: number;
  padBot: number;
  min: number;
  max: number;
  n: number;
  x0: number;
  x1: number;
  x: (i: number) => number;
  y: (price: number) => number;
  bw: number;
};

type ScaleOpts = {
  W?: number;
  H?: number;
  padX?: number;
  padTop?: number;
  padBot?: number;
  x0?: number;
  x1?: number;
};

/**
 * Straight port of the design's `mscale(bars,o)` — auto-fits the price axis
 * to the bar set (with a 10% breathing-room pad) and lays candles evenly
 * across [x0,x1] (defaulting to [padX, W-padX]). Unlike the sibling lessons'
 * barChartScale(), min/max come from the data itself rather than being
 * passed in, matching every scene in this design that doesn't hardcode an
 * axis range.
 */
export function autoScale(bars: CandleBar[], o: ScaleOpts = {}): BarChartScale {
  const W = o.W ?? 840;
  const H = o.H ?? 380;
  const padX = o.padX ?? 60;
  const padTop = o.padTop ?? 30;
  const padBot = o.padBot ?? 30;
  const x0 = o.x0 ?? padX;
  const x1 = o.x1 ?? W - padX;
  let lo = Math.min(...bars.map((b) => b.l));
  let hi = Math.max(...bars.map((b) => b.h));
  const pad = (hi - lo) * 0.1;
  lo -= pad;
  hi += pad;
  const n = bars.length;
  return {
    W,
    H,
    padX,
    padTop,
    padBot,
    min: lo,
    max: hi,
    n,
    x0,
    x1,
    x: (i: number) => x0 + (x1 - x0) * ((i + 0.5) / n),
    y: (price: number) => padTop + (H - padTop - padBot) * (1 - (price - lo) / (hi - lo)),
    bw: Math.max(2.5, Math.min(((x1 - x0) / n) * 0.58, 22)),
  };
}

/** A tapped/located point on a bar chart, in price + candle-index space. */
export type ChartPoint = { price: number; x: number; idx: number };

/** Converts a pointer's client position into a price + fractional candle index. */
export function locateChartPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  sc: BarChartScale,
): ChartPoint {
  const lx = ((clientX - rect.left) / rect.width) * sc.W;
  const ly = ((clientY - rect.top) / rect.height) * sc.H;
  const u = (ly - sc.padTop) / (sc.H - sc.padTop - sc.padBot);
  return {
    price: sc.min + (1 - u) * (sc.max - sc.min),
    x: lx,
    idx: Math.round(((lx - sc.x0) / (sc.x1 - sc.x0)) * sc.n - 0.5),
  };
}

/** ₹-formats a price with Indian digit grouping, matching the design's fmt(). */
export function formatPrice(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/**
 * Merges every `k` consecutive bars into one aggregated OHLC bar — the
 * exact mechanic this whole lesson teaches. Mirrors the design's agg().
 */
export function aggregateBars(bars: CandleBar[], k: number): CandleBar[] {
  const out: CandleBar[] = [];
  for (let i = 0; i < bars.length; i += k) {
    const g = bars.slice(i, i + k);
    out.push({
      o: g[0]!.o,
      c: g[g.length - 1]!.c,
      h: Math.max(...g.map((b) => b.h)),
      l: Math.min(...g.map((b) => b.l)),
    });
  }
  return out;
}

/**
 * Mulberry32-style PRNG matching the design's inline generator exactly (same
 * xorshift/imul mix), so a given seed reproduces the identical bar sequence.
 */
export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RandomWalkLeg = { n: number; d: number };

/**
 * Ports the design's `data()` random-walk builder: generates a run of bars
 * from a sequence of directional "legs", breaking any 4th consecutive
 * same-color candle so real charts don't look artificially streaky.
 */
export function buildRandomWalk(seed: number, legs: RandomWalkLeg[], startPrice: number): CandleBar[] {
  const rnd = makeRng(seed);
  const bars: CandleBar[] = [];
  let px = startPrice;
  let streak = 0;
  let lastBull: boolean | null = null;
  for (const leg of legs) {
    for (let k = 0; k < leg.n; k++) {
      const o = px;
      const step = 9 + rnd() * 13;
      let move = leg.d * step + (rnd() - 0.5) * step * 3.1;
      let c = o + move;
      let bull = c >= o;
      if (bull === lastBull && streak >= 3) {
        bull = !lastBull;
        move = bull ? step * (0.4 + rnd() * 0.5) : -step * (0.4 + rnd() * 0.5);
        c = o + move;
      }
      const hi = Math.max(o, c) + rnd() * step * 0.9;
      const lo = Math.min(o, c) - rnd() * step * 0.9;
      bars.push({ o: Math.round(o), h: Math.round(hi), l: Math.round(lo), c: Math.round(c) });
      px = c;
      if (bull === lastBull) streak++;
      else {
        streak = 1;
        lastBull = bull;
      }
    }
  }
  return bars;
}

/**
 * Second random-walk formula used only by the conflictQuiz daily dataset —
 * ports the design's inline `daily` generator, which uses wider steps and a
 * different move/wick-pad shape than buildRandomWalk() so it reads as a
 * slower, chunkier daily chart rather than a 5-minute one.
 */
export function buildDailyRandomWalk(seed: number, legs: RandomWalkLeg[], startPrice: number): CandleBar[] {
  const rnd = makeRng(seed);
  const bars: CandleBar[] = [];
  let px = startPrice;
  let streak = 0;
  let lastBull: boolean | null = null;
  for (const leg of legs) {
    for (let k = 0; k < leg.n; k++) {
      const o = px;
      const step = 60 + rnd() * 90;
      let move = leg.d * step * (0.55 + rnd() * 0.7);
      let c = o + move;
      let bull = c >= o;
      if (bull === lastBull && streak >= 3) {
        bull = !lastBull;
        move = bull ? step * 0.3 : -step * 0.3;
        c = o + move;
      }
      const hi = Math.max(o, c) + rnd() * step * 0.35;
      const lo = Math.min(o, c) - rnd() * step * 0.4;
      bars.push({ o: Math.round(o), h: Math.round(hi), l: Math.round(lo), c: Math.round(c) });
      px = c;
      if (bull === lastBull) streak++;
      else {
        streak = 1;
        lastBull = bull;
      }
    }
  }
  return bars;
}

/** Index of the bar with the highest high (first one wins ties). */
export function indexOfHigh(bars: CandleBar[]): number {
  let bi = 0;
  bars.forEach((b, i) => {
    if (b.h > bars[bi]!.h) bi = i;
  });
  return bi;
}

/** Index of the bar with the lowest low (first one wins ties). */
export function indexOfLow(bars: CandleBar[]): number {
  let bi = 0;
  bars.forEach((b, i) => {
    if (b.l < bars[bi]!.l) bi = i;
  });
  return bi;
}
