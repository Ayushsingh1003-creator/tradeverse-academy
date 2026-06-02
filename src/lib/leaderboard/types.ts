export type LeaderboardTab = "weekly" | "all-time" | "friends" | "country";

const TAB_SET = new Set<LeaderboardTab>(["weekly", "all-time", "friends", "country"]);

export function parseLeaderboardTabParam(raw: string | null | undefined): LeaderboardTab {
  if (raw && TAB_SET.has(raw as LeaderboardTab)) return raw as LeaderboardTab;
  return "weekly";
}

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  league: string;
  isMe: boolean;
};

export type LeaderboardResult = {
  tab: LeaderboardTab;
  rows: LeaderboardRow[];
  myRank: number | null;
  myXp: number;
  season?: {
    startsAt: string;
    endsAt: string;
    daysLeft: number;
    label: string;
  };
  country?: string | null;
  message?: string;
};
