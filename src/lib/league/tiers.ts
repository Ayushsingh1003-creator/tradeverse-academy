import { LEAGUE_TIERS } from "@/lib/progression";

export const COMPETITIVE_LEAGUE_IDS = LEAGUE_TIERS.map((t) => t.id) as readonly string[];

export function isValidLeagueId(league: string): boolean {
  return COMPETITIVE_LEAGUE_IDS.includes(league);
}

/** Next competitive tier, or null if already at top (legend). */
export function nextLeagueTier(current: string): string | null {
  const ids = [...COMPETITIVE_LEAGUE_IDS];
  const i = ids.indexOf(current);
  if (i < 0 || i >= ids.length - 1) return null;
  return ids[i + 1] ?? null;
}

export function leagueDisplayName(leagueId: string): string {
  const t = LEAGUE_TIERS.find((x) => x.id === leagueId);
  return (t?.name ?? leagueId).toUpperCase();
}

export function leagueColor(leagueId: string): string {
  return LEAGUE_TIERS.find((x) => x.id === leagueId)?.color ?? "#666";
}
