export const XP_EARN_REASONS = [
  "lesson",
  "streak",
  "daily_challenge",
  "simulator",
  "achievement",
  "admin",
  "other",
] as const;

export type XpEarnReason = (typeof XP_EARN_REASONS)[number];

export function isXpEarnReason(s: string): s is XpEarnReason {
  return (XP_EARN_REASONS as readonly string[]).includes(s);
}

export function maxXpForReason(reason: string): number {
  switch (reason) {
    case "lesson":
      return 200;
    case "streak":
      return 150;
    case "daily_challenge":
      return 50;
    case "simulator":
      return 60;
    case "achievement":
      return 200;
    case "admin":
      return 100_000;
    default:
      return 100;
  }
}
