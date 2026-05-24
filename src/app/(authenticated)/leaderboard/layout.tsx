import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "See this week's top traders and your league rank.",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
