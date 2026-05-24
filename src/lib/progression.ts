export const LEVEL_TITLES = [
  "Novice Trader",
  "Market Explorer",
  "Chart Reader",
  "Pattern Spotter",
  "Momentum Learner",
  "Price Action Scout",
  "Trend Tracker",
  "Entry Planner",
  "Risk Aware Trader",
  "Disciplined Starter",
  "Structure Student",
  "Signal Interpreter",
  "Breakout Hunter",
  "Pullback Player",
  "Candle Specialist",
  "Volatility Navigator",
  "Session Strategist",
  "Setup Builder",
  "Probability Thinker",
  "Execution Builder",
  "Technical Analyst",
  "Level Mapper",
  "Swing Architect",
  "Confluence Seeker",
  "Bias Controller",
  "Playbook Crafter",
  "Market Technician",
  "Risk Manager",
  "Stoploss Engineer",
  "Capital Defender",
  "Strategy Operator",
  "Discipline Captain",
  "Flow Reader",
  "Macro Aware Trader",
  "Advanced Executor",
  "Performance Optimizer",
  "Edge Refiner",
  "Adaptive Strategist",
  "Consistency Builder",
  "System Commander",
  "Market Strategist",
  "Elite Analyst",
  "Precision Trader",
  "Portfolio Guardian",
  "Tactical Master",
  "Quant Minded Trader",
  "Execution Virtuoso",
  "Alpha Chaser",
  "Grand Strategist",
  "Legendary Trader",
] as const;

export type LeagueTier = {
  id: string;
  name: string;
  minXp: number;
  color: string;
};

export const LEAGUE_TIERS: LeagueTier[] = [
  { id: "bronze", name: "BRONZE", minXp: 0, color: "#CD7F32" },
  { id: "silver", name: "SILVER", minXp: 1000, color: "#94A3B8" },
  { id: "gold", name: "GOLD", minXp: 3000, color: "#F7C325" },
  { id: "platinum", name: "PLATINUM", minXp: 6000, color: "#60A5FA" },
  { id: "diamond", name: "DIAMOND", minXp: 10000, color: "#22D3EE" },
  { id: "master", name: "MASTER", minXp: 15000, color: "#A78BFA" },
  { id: "grandmaster", name: "GRANDMASTER", minXp: 22000, color: "#F97316" },
  { id: "legend", name: "LEGEND", minXp: 30000, color: "#FB7185" },
];

export function getLevelTitle(level: number) {
  const index = Math.max(0, Math.min(LEVEL_TITLES.length - 1, level - 1));
  return LEVEL_TITLES[index];
}

export function xpForLevel(level: number): number {
  if (level <= 10) return 150;
  if (level <= 25) return 250;
  if (level <= 40) return 400;
  return 600;
}

export function getLeagueTier(totalXp: number): LeagueTier {
  let current = LEAGUE_TIERS[0];
  for (const tier of LEAGUE_TIERS) {
    if (totalXp >= tier.minXp) current = tier;
  }
  return current;
}
