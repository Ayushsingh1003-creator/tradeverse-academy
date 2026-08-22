/**
 * Text for TTS only — keeps on-screen coach copy unchanged.
 * Strips bracketed asides the model sometimes adds (not meant to be spoken).
 */
export function textForSpeech(displayText: string): string {
  let s = displayText;

  // Fenced code blocks — drop entirely, code isn't meant to be read aloud.
  s = s.replace(/```[\s\S]*?```/g, " ");

  // Markdown links: [label](url) -> label
  s = s.replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1");

  // Square brackets: [hint], [pause], [e.g. RSI]
  s = s.replace(/\[[^\]]*\]/g, " ");

  // Curly braces: {optional note}
  s = s.replace(/\{[^}]*\}/g, " ");

  // Parentheses only when they look like stage directions, not prices/tickers
  s = s.replace(/\(\s*(?:e\.g\.|i\.e\.|hint|note|optional|pause|aside)[^)]*\)/gi, " ");

  // Markdown emphasis/inline-code markers (avoid "star star" / "backtick" being read)
  s = s.replace(/\*\*([^*]+)\*\*/g, "$1");
  s = s.replace(/\*([^*]+)\*/g, "$1");
  s = s.replace(/`([^`]+)`/g, "$1");

  // Headings: "## Title" -> "Title"
  s = s.replace(/^#{1,6}\s+/gm, "");

  // List/bullet markers at line start: "- ", "* ", "1. "
  s = s.replace(/^\s*[-*+]\s+/gm, "");
  s = s.replace(/^\s*\d+\.\s+/gm, "");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}
