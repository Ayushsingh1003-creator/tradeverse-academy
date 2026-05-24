/** YYYY-MM-DD for `now` in the given IANA zone (falls back to UTC on invalid zone). */
export function localDateStringInTimeZone(iana: string | null | undefined, now: Date): string {
  const tz = iana && iana.trim().length > 0 ? iana.trim() : "UTC";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  }
}

export function isValidIanaTimezone(tz: string): boolean {
  const t = tz.trim();
  if (t.length === 0 || t.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: t }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
