import { AnimatedProgressCard } from "@/components/progress-card";

export function XPBar({ level, xp, needed }: { level: number; xp: number; needed: number }) {
  return (
    <AnimatedProgressCard
      icon={<span className="text-sm font-bold">⚡</span>}
      title={`Level ${level}`}
      progressLabel="XP Progress"
      progressSubLabel={`${needed - xp} XP to next level`}
      currentValue={xp}
      maxValue={needed}
      className="max-w-none border-white/10 bg-[#1E1E1E] text-white shadow-none"
    />
  );
}
