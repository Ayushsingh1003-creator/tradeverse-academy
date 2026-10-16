import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Brain,
  Briefcase,
  CandlestickChart,
  Clock,
  Coins,
  Construction,
  CreditCard,
  Flag,
  Hammer,
  Landmark,
  LayoutGrid,
  MapPin,
  Mountain,
  NotebookPen,
  Receipt,
  Rocket,
  Ruler,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
  StretchHorizontal,
  Tag,
  TrendingUp,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { SVG_ICON_BY_SLUG, type IconKey } from "@/components/icons/LessonIconGlyph";

/**
 * Theme-safe lesson glyphs. Unlike `IconGlyph`, these draw in `currentColor`,
 * so they read correctly on light and dark surfaces alike.
 */
const LUCIDE_BY_ICON_KEY: Record<IconKey, typeof Clock> = {
  candle: CandlestickChart,
  bars: BarChart3,
  hammer: Hammer,
  sr: StretchHorizontal,
  trend: TrendingUp,
  building: Landmark,
  people: Users,
  pin: MapPin,
  clock: Clock,
  grid: LayoutGrid,
  priceTag: Tag,
  arrows: ArrowLeftRight,
  flag: Flag,
  card: CreditCard,
  briefcase: Briefcase,
  sliders: SlidersHorizontal,
  receipt: Receipt,
  coin: Coins,
  bolt: Zap,
  rocket: Rocket,
  warning: AlertTriangle,
  ruler: Ruler,
  shieldCheck: ShieldCheck,
  scale: Scale,
  notebook: NotebookPen,
  brain: Brain,
  guardrail: Construction,
  oscillator: Activity,
  maLine: Waves,
  peaks: Mountain,
};

export function LessonLucideIcon({
  slug,
  size = 20,
  strokeWidth = 2,
}: {
  slug: string;
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = LUCIDE_BY_ICON_KEY[SVG_ICON_BY_SLUG[slug] ?? "grid"];
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden />;
}

export function IconKeyLucide({ icon, size = 20 }: { icon: IconKey; size?: number }) {
  const Icon = LUCIDE_BY_ICON_KEY[icon];
  return <Icon size={size} aria-hidden />;
}
