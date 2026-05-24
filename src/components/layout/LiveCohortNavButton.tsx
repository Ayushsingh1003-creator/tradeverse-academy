import Link from "next/link";
import { LiquidButton } from "@/components/ui/LiquidButton";

export function LiveCohortNavButton() {
  return (
    <LiquidButton asChild size="nav" className="font-semibold no-underline">
      <Link href="/live-classes" prefetch>
        Live Cohort
      </Link>
    </LiquidButton>
  );
}
