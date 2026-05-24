import { AwardCard } from "@/components/achievement-cards";

export function StreakWidget({ streak }: { streak: number }) {
  return (
    <AwardCard
      icon={<span className="text-3xl">🔥</span>}
      title="Current streak"
      description={`${streak} day${streak === 1 ? "" : "s"} — keep it going!`}
      className="border-white/10 bg-[#1E1E1E] text-white hover:border-[#456DFF]/40"
    />
  );
}
