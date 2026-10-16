import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CandlestickChart,
  Coins,
  Flame,
  GraduationCap,
  Layers,
  LineChart,
  Mountain,
  Radio,
  Repeat,
  ShieldCheck,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
  Video,
} from "lucide-react";
import type { AchievementIconKey } from "@/lib/data/achievements";

const BY_KEY: Record<AchievementIconKey, typeof Bell> = {
  candle: CandlestickChart,
  book: BookOpen,
  cap: GraduationCap,
  bell: Bell,
  calendarCheck: CalendarCheck,
  trend: TrendingUp,
  calendar: CalendarDays,
  flame: Flame,
  trophy: Trophy,
  coins: Coins,
  chart: LineChart,
  award: Award,
  target: Target,
  shield: ShieldCheck,
  peaks: Mountain,
  sunrise: Sunrise,
  repeat: Repeat,
  layers: Layers,
  video: Video,
  radio: Radio,
};

export function AchievementIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const Icon = BY_KEY[icon as AchievementIconKey] ?? Award;
  return <Icon size={size} aria-hidden />;
}
