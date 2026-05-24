/**
 * Text for TTS only — keeps on-screen coach copy unchanged.
 * Strips bracketed asides the model sometimes adds (not meant to be spoken).
 */
export function textForSpeech(displayText: string): string {
  let s = displayText;

  // Square brackets: [hint], [pause], [e.g. RSI]
  s = s.replace(/\[[^\]]*\]/g, " ");

  // Curly braces: {optional note}
  s = s.replace(/\{[^}]*\}/g, " ");

  // Parentheses only when they look like stage directions, not prices/tickers
  s = s.replace(/\(\s*(?:e\.g\.|i\.e\.|hint|note|optional|pause|aside)[^)]*\)/gi, " ");

  // Markdown emphasis markers (avoid "star star" being read)
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}
