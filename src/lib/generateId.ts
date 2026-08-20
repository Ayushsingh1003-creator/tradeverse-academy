/** Generates a unique-enough id for UI purposes (toast keys, animation ids,
 * client-side-only state entries) — never for anything security-sensitive.
 * `crypto.randomUUID()` is only exposed in secure contexts (HTTPS, or the literal
 * hostname "localhost"), so a custom local hostname like "w2.local.test" over
 * plain HTTP doesn't have it — this falls back to a non-cryptographic id there. */
export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
