export type LeaderboardTab = "weekly" | "all-time" | "friends" | "country";

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
