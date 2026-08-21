export type IconKey =
  | "candle"
  | "bars"
  | "hammer"
  | "sr"
  | "trend"
  | "building"
  | "people"
  | "pin"
  | "clock"
  | "grid"
  | "priceTag"
  | "arrows"
  | "flag"
  | "card"
  | "briefcase"
  | "sliders"
  | "receipt"
  | "coin"
  | "bolt"
  | "rocket"
  | "warning"
  | "ruler"
  | "shieldCheck"
  | "scale"
  | "notebook"
  | "brain"
  | "guardrail"
  | "oscillator"
  | "maLine"
  | "peaks";

/** Line-art glyph per lesson slug — every course renders bespoke SVGs, never emoji. */
export const SVG_ICON_BY_SLUG: Record<string, IconKey> = {
  // Candlestick Essentials
  "what-is-a-candlestick": "candle",
  "timeframes-explained": "clock",
  "support-resistance": "sr",
  "trend-lines": "trend",
  "chart-patterns": "peaks",

  // Financial Markets 101
  "what-is-the-market": "building",
  "market-participants": "people",
  "indian-markets-101": "pin",
  "market-hours-india": "clock",
  "asset-classes-india": "grid",
  "how-prices-form": "priceTag",
  "bid-ask-spread-cost": "arrows",
  "financial-markets-101-review": "flag",

  // How to Actually Trade
  "demat-and-trading-account": "card",
  "picking-a-broker": "briefcase",
  "order-types-explained": "sliders",
  "anatomy-of-trade": "receipt",
  "brokerage-and-taxes-india": "coin",
  "execution-and-slippage": "bolt",
  "first-trade-walkthrough": "rocket",
  "how-to-trade-review": "flag",

  // Risk & Trader Mindset
  "why-traders-lose": "warning",
  "position-sizing-rule": "ruler",
  "stop-loss-discipline": "shieldCheck",
  "risk-reward-ratio": "scale",
  "journaling-your-trades": "notebook",
  "emotional-traps": "brain",
  "beginner-guardrails": "guardrail",
  "risk-mindset-review": "flag",

  // Indicator Starter Kit
  "rsi-basics": "oscillator",
  "moving-averages": "maLine",
};

export function IconGlyph({ icon, size, muted }: { icon: IconKey; size: number; muted?: boolean }) {
  const g = muted ? "#6f6f6f" : "#22C55E";
  const r = muted ? "#8a8a8a" : "#EF4444";
  const w = muted ? "#9a9a9a" : "#ffffff";
  const b = muted ? "#7a7a7a" : "#88C9F7";
  const gold = muted ? "#8a8a8a" : "#F7C325";

  switch (icon) {
    case "candle":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="5" x2="20" y2="35" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <rect x="13" y="13" width="14" height="15" rx="2.5" fill={g} stroke={w} strokeWidth="1.4" />
        </svg>
      );
    case "bars":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="14" y1="6" x2="14" y2="34" stroke={g} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="9" y="12" width="10" height="15" rx="1.6" fill={g} />
          <line x1="27" y1="8" x2="27" y2="36" stroke={r} strokeWidth="1.6" strokeLinecap="round" />
          <rect x="22" y="16" width="10" height="13" rx="1.6" fill={r} />
        </svg>
      );
    case "hammer":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="5" x2="20" y2="12" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <rect x="13" y="12" width="14" height="8" rx="2" fill={g} stroke={w} strokeWidth="1.2" />
          <line x1="20" y1="20" x2="20" y2="36" stroke={w} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case "sr":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="5" y1="10" x2="35" y2="10" stroke={b} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
          <line x1="5" y1="31" x2="35" y2="31" stroke={b} strokeWidth="2" strokeDasharray="3 3" strokeLinecap="round" />
          <polyline points="7,27 15,14 22,25 30,13 34,22" fill="none" stroke={w} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "trend":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polyline points="5,31 15,22 22,27 34,9" fill="none" stroke={g} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points="26,9 34,9 34,17" fill="none" stroke={g} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      );
    case "peaks":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polyline points="5,28 12,18 16,24 20,8 24,24 28,16 35,28" fill="none" stroke={w} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="5" y1="28" x2="35" y2="28" stroke={b} strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" />
        </svg>
      );
    case "building":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polygon points="6,15 20,6 34,15" fill={w} />
          <rect x="8" y="16" width="3.5" height="16" fill={w} />
          <rect x="18.25" y="16" width="3.5" height="16" fill={w} />
          <rect x="28.5" y="16" width="3.5" height="16" fill={w} />
          <rect x="5" y="32" width="30" height="3" rx="1" fill={w} />
        </svg>
      );
    case "people":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="25" cy="15" r="5" fill={w} opacity=".75" />
          <path d="M18 33 a7 7 0 0 1 14 0" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" opacity=".75" />
          <circle cx="15" cy="13" r="6.5" fill={b} />
          <path d="M5 33 a10 10 0 0 1 20 0" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case "pin":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 5 a10 10 0 0 1 10 10 c0 8 -10 20 -10 20 s-10 -12 -10 -20 a10 10 0 0 1 10 -10 z" fill={b} />
          <circle cx="20" cy="15" r="4" fill="#141414" />
        </svg>
      );
    case "clock":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="20" r="14" fill="none" stroke={w} strokeWidth="2" />
          <line x1="20" y1="20" x2="20" y2="11" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="20" x2="26" y2="24" stroke={w} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="6" y="6" width="12" height="12" rx="2" fill={g} />
          <rect x="22" y="6" width="12" height="12" rx="2" fill={r} />
          <rect x="6" y="22" width="12" height="12" rx="2" fill={b} />
          <rect x="22" y="22" width="12" height="12" rx="2" fill={gold} />
        </svg>
      );
    case "priceTag":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M8 6 h14 l12 12 -12 12 h-14 a2 2 0 0 1 -2 -2 v-20 a2 2 0 0 1 2 -2 z"
            fill="none"
            stroke={w}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="13" cy="13" r="2.2" fill={g} />
        </svg>
      );
    case "arrows":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="6" y1="20" x2="34" y2="20" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <polyline points="12,13 6,20 12,27" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="28,13 34,20 28,27" fill="none" stroke={w} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "flag":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="10" y1="6" x2="10" y2="34" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <path d="M10 8 h18 l-5 6 5 6 h-18 z" fill={gold} />
        </svg>
      );
    case "card":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="5" y="10" width="30" height="20" rx="3" fill="none" stroke={b} strokeWidth="2" />
          <rect x="5" y="15" width="30" height="4" fill={b} />
          <rect x="9" y="23" width="10" height="3" rx="1" fill={b} opacity=".7" />
        </svg>
      );
    case "briefcase":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="6" y="14" width="28" height="18" rx="2" fill="none" stroke={w} strokeWidth="2" />
          <path d="M15 14 v-4 a2 2 0 0 1 2 -2 h6 a2 2 0 0 1 2 2 v4" fill="none" stroke={w} strokeWidth="2" />
          <line x1="6" y1="22" x2="34" y2="22" stroke={w} strokeWidth="2" />
        </svg>
      );
    case "sliders":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="7" y1="10" x2="33" y2="10" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="10" r="3" fill={g} />
          <line x1="7" y1="20" x2="33" y2="20" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="26" cy="20" r="3" fill={r} />
          <line x1="7" y1="30" x2="33" y2="30" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <circle cx="20" cy="30" r="3" fill={b} />
        </svg>
      );
    case "receipt":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M10 5 h20 v28 l-3 -3 -3 3 -3 -3 -3 3 -3 -3 -3 3 -2 -2 z"
            fill="none"
            stroke={w}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <line x1="14" y1="13" x2="26" y2="13" stroke={w} strokeWidth="1.6" />
          <line x1="14" y1="19" x2="26" y2="19" stroke={w} strokeWidth="1.6" />
          <line x1="14" y1="25" x2="22" y2="25" stroke={w} strokeWidth="1.6" />
        </svg>
      );
    case "coin":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="15" cy="23" r="10" fill={gold} opacity=".9" />
          <circle cx="24" cy="14" r="10" fill="none" stroke={gold} strokeWidth="2" />
        </svg>
      );
    case "bolt":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <polygon points="21,4 9,22 18,22 15,36 31,16 21,16" fill={gold} />
        </svg>
      );
    case "rocket":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 4 c6 4 8 12 8 18 l-8 8 -8 -8 c0 -6 2 -14 8 -18 z" fill={b} />
          <circle cx="20" cy="16" r="3" fill="#141414" />
          <path d="M12 22 l-5 8 8 -3 z" fill={r} />
          <path d="M28 22 l5 8 -8 -3 z" fill={r} />
          <path d="M17 30 l-3 6 M23 30 l3 6" stroke={gold} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "warning":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 5 L36 33 H4 Z" fill="none" stroke={r} strokeWidth="2" strokeLinejoin="round" />
          <line x1="20" y1="15" x2="20" y2="23" stroke={r} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="20" cy="27.5" r="1.6" fill={r} />
        </svg>
      );
    case "ruler":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="4" y="16" width="32" height="8" rx="1" fill="none" stroke={w} strokeWidth="1.8" />
          <line x1="10" y1="16" x2="10" y2="20" stroke={w} strokeWidth="1.6" />
          <line x1="16" y1="16" x2="16" y2="22" stroke={w} strokeWidth="1.6" />
          <line x1="22" y1="16" x2="22" y2="20" stroke={w} strokeWidth="1.6" />
          <line x1="28" y1="16" x2="28" y2="22" stroke={w} strokeWidth="1.6" />
        </svg>
      );
    case "shieldCheck":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path
            d="M20 4 L34 9 V19 C34 28 28 34 20 37 C12 34 6 28 6 19 V9 Z"
            fill="none"
            stroke={b}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polyline points="14,20 18,24 27,14" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "scale":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <line x1="20" y1="6" x2="20" y2="30" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12" x2="32" y2="12" stroke={w} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 12 l-4 10 h8 z" fill="none" stroke={g} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M32 12 l-4 10 h8 z" fill="none" stroke={r} strokeWidth="1.6" strokeLinejoin="round" />
          <line x1="12" y1="32" x2="28" y2="32" stroke={w} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "notebook":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="8" y="5" width="24" height="30" rx="2" fill="none" stroke={w} strokeWidth="1.8" />
          <line x1="8" y1="12" x2="32" y2="12" stroke={w} strokeWidth="1.4" />
          <line x1="13" y1="19" x2="27" y2="19" stroke={w} strokeWidth="1.4" opacity=".7" />
          <line x1="13" y1="24" x2="27" y2="24" stroke={w} strokeWidth="1.4" opacity=".7" />
          <line x1="13" y1="29" x2="22" y2="29" stroke={w} strokeWidth="1.4" opacity=".7" />
        </svg>
      );
    case "brain":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="19" r="13" fill="none" stroke={r} strokeWidth="2" />
          <path d="M12 19 q4 -6 8 0 q4 -6 8 0" fill="none" stroke={r} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "guardrail":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M20 6 L28 30 H12 Z" fill={gold} />
          <rect x="9" y="30" width="22" height="4" rx="1" fill={gold} opacity=".85" />
          <rect x="14" y="17" width="12" height="3" fill="#141414" opacity=".5" />
        </svg>
      );
    case "oscillator":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <rect x="4" y="8" width="32" height="24" rx="2" fill="none" stroke={w} strokeWidth="1.6" />
          <line x1="4" y1="15" x2="36" y2="15" stroke={w} strokeWidth="1" strokeDasharray="2 2" opacity=".5" />
          <line x1="4" y1="25" x2="36" y2="25" stroke={w} strokeWidth="1" strokeDasharray="2 2" opacity=".5" />
          <polyline
            points="6,22 12,10 18,26 24,14 30,20 34,12"
            fill="none"
            stroke={r}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "maLine":
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <path d="M4 24 Q12 8 20 20 T36 14" fill="none" stroke={g} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M4 28 Q12 18 20 26 T36 22" fill="none" stroke={b} strokeWidth="2.2" strokeLinecap="round" opacity=".8" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="block">
          <circle cx="20" cy="20" r="12" fill="none" stroke={w} strokeWidth="2" />
        </svg>
      );
  }
}
