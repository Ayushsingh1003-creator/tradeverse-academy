import { ThemeScope } from "@/components/layout/AppShell";
import { DashboardPageClient } from "./DashboardPageClient";

export default function DashboardPage() {
  return (
    <ThemeScope>
      <DashboardPageClient />
    </ThemeScope>
  );
}
