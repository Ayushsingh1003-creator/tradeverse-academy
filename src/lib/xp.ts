import { xpForLevel } from "@/lib/progression";

export { xpForLevel };

export function getLevelFromTotalXp(totalXp: number) {
  let remaining = Math.max(0, totalXp);
  let level = 1;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpNeededForLevel: xpForLevel(level) };
}

export function applyXp(currentXp: number, _currentLevel: number, gainedXp: number) {
  const nextTotalXp = Math.max(0, currentXp + gainedXp);
  const { level } = getLevelFromTotalXp(nextTotalXp);
  return { xp: nextTotalXp, level };
}
