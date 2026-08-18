/**
 * Pattern-space geometry for the Chart Patterns lesson. Unlike trend-lines'
 * geometry.ts (real OHLC price/index bar charts), everything here operates
 * in a synthetic 0-100 "pattern-space" (x: 0-100 across the chart, y: 0-100
 * where 0 = top/high price, 100 = bottom/low price). This is a straight port
 * of the design prototype's `P`/`cData`/`apx`/`ps`/`onTap`/`mini` logic — the
 * exact numbers and PRNG matter because they're what make each shape read as
 * "a double top" / "a head & shoulders" etc.
 */

import { candleBodyColor } from "@/lib/candleColors";

/* ================================================================
 * pattern skeleton dictionary — ported verbatim from the design's `P`
 * ================================================================ */

export type PatternShape =
  | "dtop"
  | "dbot"
  | "hs"
  | "ihs"
  | "ttop"
  | "tbot"
  | "flag"
  | "pennant"
  | "ascTri"
  | "descTri"
  | "symTri"
  | "rect"
  | "ihsExt";

export const PATTERN_SKELETONS: Record<PatternShape, Array<[number, number]>> = {
  dtop: [[2, 78], [10, 64], [18, 44], [26, 22], [34, 30], [42, 44], [50, 52], [58, 36], [66, 20], [74, 32], [82, 52], [90, 70], [98, 84]],
  dbot: [[2, 22], [10, 36], [18, 56], [26, 78], [34, 70], [42, 56], [50, 48], [58, 64], [66, 80], [74, 68], [82, 48], [90, 30], [98, 16]],
  hs: [[2, 82], [9, 72], [16, 52], [23, 42], [30, 54], [37, 60], [44, 34], [51, 16], [58, 32], [65, 58], [72, 44], [79, 30], [86, 52], [93, 72], [99, 86]],
  ihs: [[2, 18], [9, 28], [16, 48], [23, 58], [30, 46], [37, 40], [44, 66], [51, 84], [58, 68], [65, 42], [72, 56], [79, 70], [86, 48], [93, 28], [99, 14]],
  ttop: [[2, 80], [10, 62], [18, 38], [26, 22], [33, 38], [40, 52], [48, 34], [55, 22], [62, 38], [69, 52], [76, 34], [83, 22], [90, 44], [98, 72]],
  tbot: [[2, 20], [10, 38], [18, 62], [26, 78], [33, 62], [40, 48], [48, 66], [55, 78], [62, 62], [69, 48], [76, 66], [83, 78], [90, 56], [98, 28]],
  flag: [[2, 90], [10, 72], [18, 50], [26, 30], [32, 24], [38, 40], [44, 30], [52, 46], [58, 36], [66, 52], [72, 42], [80, 26], [88, 12], [98, 4]],
  pennant: [[2, 88], [12, 68], [22, 44], [32, 20], [40, 44], [48, 30], [56, 40], [64, 34], [72, 37], [80, 22], [90, 10], [98, 4]],
  ascTri: [[2, 74], [10, 56], [18, 26], [26, 50], [34, 26], [42, 42], [50, 26], [58, 36], [66, 26], [74, 18], [86, 10], [98, 4]],
  descTri: [[2, 26], [10, 44], [18, 74], [26, 50], [34, 74], [42, 58], [50, 74], [58, 64], [66, 74], [74, 82], [86, 90], [98, 96]],
  symTri: [[2, 80], [10, 58], [18, 20], [26, 66], [34, 28], [42, 58], [50, 36], [58, 52], [66, 42], [74, 47], [84, 22], [98, 8]],
  rect: [[2, 80], [10, 62], [18, 30], [26, 66], [34, 30], [42, 66], [50, 30], [58, 66], [66, 30], [74, 66], [84, 26], [98, 10]],
  ihsExt: [
    [2, 18], [9, 28], [16, 48], [23, 58], [30, 46], [37, 40], [44, 66], [51, 84], [58, 68], [65, 42], [72, 56], [79, 70], [86, 48], [93, 28], [99, 14],
    [104, 8], [110, 2],
  ],
};

/* ================================================================
 * synthetic candle generator — ported verbatim from the design's
 * `cData`/`apx`. Deterministic (seeded hash + mulberry32-style PRNG, no
 * Math.random), memoized per shape+dense key exactly like the design's
 * `this._cd` memo — here as a module-level Map since this file has no
 * React state.
 * ================================================================ */

/** A single synthesized candle in pattern-space y-units (h/l are the wick
 * extremes; since y is inverted (0=top), h < body top < body bottom < l). */
export type PatternCandleBar = { o: number; h: number; l: number; c: number };

type PatternCandleData = {
  bars: PatternCandleBar[];
  total: number;
  /** index (into `bars`) of the last candle belonging to each skeleton leg */
  anchorIdx: number[];
  /** pattern-space x (0-100) of the candle at each skeleton point */
  anchors: number[];
};

const patternCandleCache = new Map<string, PatternCandleData>();

/**
 * Builds an organic candle series that traces a pattern skeleton. Momentum
 * legs get more, larger candles; colors mix with a 3-candle streak cap so no
 * leg looks like an unbroken wall of same-colored candles. `dense === false`
 * produces a sparser series (used by the mini gallery cards); anything else
 * (including undefined) produces the full dense series used by the main
 * chart scenes — mirrors the design's `cData(shape, dense)`.
 */
export function patternCandleData(shape: PatternShape, dense?: boolean): PatternCandleData {
  const cacheKey = `${shape}${dense === false ? "|mini" : ""}`;
  const cached = patternCandleCache.get(cacheKey);
  if (cached) return cached;

  const pts = PATTERN_SKELETONS[shape];
  let s = 0;
  for (let i = 0; i < shape.length; i++) s = (s * 31 + shape.charCodeAt(i)) >>> 0;
  s = Math.imul(s, 2654435761) >>> 0;
  const rnd = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const bars: PatternCandleBar[] = [];
  const anchorIdx: number[] = [0];
  let cur = pts[0]![1];
  let streak = 0;
  let lastBull: boolean | null = null;

  for (let k = 0; k < pts.length - 1; k++) {
    const dy = pts[k + 1]![1] - pts[k]![1];
    const span = Math.abs(dy);
    const n = dense === false ? Math.max(1, Math.min(2, Math.round(span / 15) + 1)) : Math.max(2, Math.min(7, Math.round(span / 5) + 2));
    for (let j = 0; j < n; j++) {
      const o = cur;
      const last = j === n - 1;
      let c: number;
      if (last) c = pts[k + 1]![1];
      else c = pts[k]![1] + dy * ((j + 1) / n) + (rnd() - 0.5) * (span / n) * 1.5;
      let bull = c < o;
      if (bull === lastBull && streak >= 3 && !last) {
        bull = !lastBull;
        c = o + (bull ? -1 : 1) * (span / n) * (0.35 + rnd() * 0.45);
      }
      const bt = Math.min(o, c);
      const bb = Math.max(o, c);
      const ext = Math.max(1.3, (span / n) * 0.6);
      bars.push({ o, c, h: bt - rnd() * ext, l: bb + rnd() * ext });
      cur = c;
      if (bull === lastBull) streak++;
      else {
        streak = 1;
        lastBull = bull;
      }
    }
    anchorIdx.push(bars.length - 1);
  }

  const total = bars.length;
  const result: PatternCandleData = { bars, total, anchorIdx, anchors: anchorIdx.map((ai) => ((ai + 0.5) / total) * 100) };
  patternCandleCache.set(cacheKey, result);
  return result;
}

/** The pattern-space x (0-100) of the candle sitting at the skeleton point
 * nearest `px` — ports the design's `apx(shape,px,dense)`. */
export function patternAnchorX(shape: PatternShape, px: number, dense?: boolean): number {
  const pts = PATTERN_SKELETONS[shape];
  let bi = 0;
  pts.forEach((p, i) => {
    if (Math.abs(p[0] - px) < Math.abs(pts[bi]![0] - px)) bi = i;
  });
  return patternCandleData(shape, dense).anchors[bi]!;
}

/** Bull/bear color for a synthesized pattern candle — bull means the close's
 * y sits above (numerically less than) the open's y, i.e. price rose. */
export function patternCandleColor(bar: PatternCandleBar): string {
  return candleBodyColor(bar.c < bar.o);
}

/* ================================================================
 * pattern-space scale — ports the design's `ps(o)`
 * ================================================================ */

export type PatternScale = {
  W: number;
  H: number;
  padX: number;
  padTop: number;
  padBot: number;
  X: (px: number) => number;
  Y: (py: number) => number;
};

export function patternScale(o: { W?: number; H?: number; padX?: number; padTop?: number; padBot?: number } = {}): PatternScale {
  const W = o.W ?? 840;
  const H = o.H ?? 360;
  const padX = o.padX ?? 54;
  const padTop = o.padTop ?? 34;
  const padBot = o.padBot ?? 32;
  return {
    W,
    H,
    padX,
    padTop,
    padBot,
    X: (px: number) => padX + (W - 2 * padX) * (px / 100),
    Y: (py: number) => padTop + (H - padTop - padBot) * (py / 100),
  };
}

/* ================================================================
 * pointer -> pattern-space locator — ports the design's `onTap`
 * ================================================================ */

/** A tapped point on a pattern chart, in pattern-space (px/py, 0-100) and
 * raw SVG pixel space (x/y). */
export type PatternPoint = { px: number; py: number; x: number; y: number };

export function locatePatternPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
  sc: PatternScale,
): PatternPoint {
  const lx = ((clientX - rect.left) / rect.width) * sc.W;
  const ly = ((clientY - rect.top) / rect.height) * sc.H;
  const py = ((ly - sc.padTop) / (sc.H - sc.padTop - sc.padBot)) * 100;
  const px = ((lx - sc.padX) / (sc.W - 2 * sc.padX)) * 100;
  return { px, py, x: lx, y: ly };
}

/* ================================================================
 * mini gallery-card helpers — levels/slopes/mark-label placement, ported
 * from the design's `mini()`
 * ================================================================ */

export type PatternLevelSpec = { y: number; x1?: number; x2?: number; color?: string };

/** A diagonal rail for a mini card. `thru`, when given, is a pair of
 * skeleton-space [px,py] points the rail is linearly fit through (in
 * candle-snapped x-space) — ports the design's `mini()`'s inline slope
 * fitting, distinct from the main-chart `slope()`'s direct p1->p2 draw. */
export type MiniSlopeSpec = { p1: [number, number]; p2: [number, number]; thru?: [[number, number], [number, number]]; color?: string };

export function miniSlopeLine(shape: PatternShape, sc: PatternScale, spec: MiniSlopeSpec): { x1: number; y1: number; x2: number; y2: number } {
  const ax = patternAnchorX(shape, spec.p1[0], false);
  const bx = patternAnchorX(shape, spec.p2[0], false);
  let y1 = spec.p1[1];
  let y2 = spec.p2[1];
  if (spec.thru) {
    const [p, q] = spec.thru;
    const pax = patternAnchorX(shape, p[0], false);
    const qax = patternAnchorX(shape, q[0], false);
    const m = (q[1] - p[1]) / (qax - pax);
    y1 = p[1] + (ax - pax) * m;
    y2 = p[1] + (bx - pax) * m;
  }
  return { x1: sc.X(ax), y1: sc.Y(y1), x2: sc.X(bx), y2: sc.Y(y2) };
}

/** Skeleton-space points for a mini card's dashed shape outline, ported from
 * the design's `mini()` polyline (`o.shape`). */
export function miniShapePolylinePoints(shape: PatternShape, sc: PatternScale, points: Array<[number, number]>): string {
  return points.map(([px, py]) => `${sc.X(patternAnchorX(shape, px, false))},${sc.Y(py)}`).join(" ");
}

export type PatternMarkSpec = { px: number; py: number; label?: string; color?: string; below?: boolean };

export type PlacedMark = {
  ring: { cx: number; cy: number; color: string };
  label: { x: number; y: number; w: number; h: number; text: string; color: string } | null;
};

/**
 * Places a mini card's mark label (a small ringed pivot + text chip),
 * trying several candidate positions around the mark and picking the first
 * that doesn't overlap any candle body/wick box — a faithful port of the
 * design's `mini()` `hits`/`clamp`/`cands` anti-collision loop.
 */
export function placeMarkLabel(shape: PatternShape, sc: PatternScale, mark: PatternMarkSpec): PlacedMark {
  const mx = sc.X(patternAnchorX(shape, mark.px, false));
  const my = sc.Y(mark.py);
  const color = mark.color ?? "#F7C325";
  if (!mark.label) {
    return { ring: { cx: mx, cy: my, color }, label: null };
  }

  const d = patternCandleData(shape, false);
  const span = sc.X(100) - sc.X(0);
  const bw = Math.max(3.4, (span / d.total) * 0.62);
  const sw = Math.max(1.3, bw * 0.22);
  const boxes: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];
  d.bars.forEach((b, k) => {
    const bx = sc.X(((k + 0.5) / d.total) * 100);
    boxes.push({ x0: bx - bw / 2, x1: bx + bw / 2, y0: sc.Y(Math.min(b.o, b.c)), y1: sc.Y(Math.max(b.o, b.c)) });
    boxes.push({ x0: bx - sw / 2, x1: bx + sw / 2, y0: sc.Y(b.h), y1: sc.Y(b.l) });
  });

  const w = mark.label.length * 5.2 + 10;
  const PAD = 1.5;
  const hits = (px: number, py: number): boolean => {
    const a = { x0: px - w / 2 - PAD, x1: px + w / 2 + PAD, y0: py - 8 - PAD, y1: py + 4 + PAD };
    return boxes.some((b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0);
  };
  const clamp = (px: number) => Math.max(sc.padX + w / 2, Math.min(sc.W - sc.padX - w / 2, px));
  const below = !!mark.below;
  const dy = below ? [21, -15] : [-15, 21];
  const cands: Array<[number, number]> = [];
  dy.forEach((v) => {
    cands.push([mx, my + v]);
    cands.push([mx + 10 + w / 2, my + v]);
    cands.push([mx - 10 - w / 2, my + v]);
  });
  dy.forEach((v) => cands.push([mx, my + (v < 0 ? v - 13 : v + 13)]));

  let pick: [number, number] | null = null;
  for (const [cx0, cy0] of cands) {
    const px = clamp(cx0);
    if (!hits(px, cy0)) {
      pick = [px, cy0];
      break;
    }
  }
  if (!pick) pick = [clamp(mx), my + dy[0]!];
  const [tx, ty] = pick;

  return {
    ring: { cx: mx, cy: my, color },
    label: { x: tx - w / 2, y: ty - 8, w, h: 12, text: mark.label, color },
  };
}
