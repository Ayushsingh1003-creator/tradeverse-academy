/** Rule-based instant AI tutor replies — short, beginner-friendly; no quiz answers */

const AI_RESPONSES: Record<string, string> = {
  "what is a wick":
    "The wick is the thin line above or below the body. It shows how high or low price went before the candle closed.",
  wick: "The wick shows the highest and lowest price in that candle. A long wick means price was tested and rejected.",
  bullish:
    "Bullish means buyers won that candle. Green candle: close is above open, so price ended higher.",
  bearish:
    "Bearish means sellers won that candle. Red candle: close is below open, so price ended lower.",
  doji: "A Doji means open and close are almost the same. Neither side won — the market was undecided.",
  support:
    "Support is a price zone where buyers often step in. Think of it as a floor where dips tend to stop.",
  resistance:
    "Resistance is a price zone where sellers often step in. Think of it as a ceiling where rallies tend to stall.",
  hammer:
    "A hammer has a small body at the top and a long lower wick. Sellers pushed down, then buyers pushed back up.",
  trend:
    "A trend is price mostly moving one way. Uptrend: higher lows. Downtrend: lower highs. Trade with the trend.",
  ohlc: "OHLC is open, high, low, close — the four prices in every candle.",
  body: "The body is the thick box from open to close. A big body means a strong move; a tiny body means indecision.",
  default:
    "Focus on who won that candle — buyers or sellers. What does the body and wicks tell you?",
};

function normalizeKey(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

export function matchAiResponse(userMessage: string): string {
  const q = normalizeKey(userMessage);
  if (!q) return AI_RESPONSES.default;
  for (const [key, text] of Object.entries(AI_RESPONSES)) {
    if (key === "default") continue;
    if (q.includes(key)) return text;
  }
  const words = q.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (w.length > 3 && AI_RESPONSES[w]) return AI_RESPONSES[w] as string;
  }
  return AI_RESPONSES.default;
}

export function suggestedChipsForPage(pageType: string, visualId?: string): string[] {
  if (pageType === "visual" && visualId === "CandleAnatomy") {
    return ["What's a wick?", "Bullish vs bearish?", "Why do candles matter?"];
  }
  if (pageType === "multiple_choice" || pageType === "true_false" || pageType === "chart_tap") {
    return ["Explain this simply", "Give a quick example", "Why was I wrong?"];
  }
  return ["Explain OHLC", "What is support?", "What is a trend?"];
}
