"use client";

import { AppShell, ThemeScope } from "@/components/layout/AppShell";

export function LiveClassesPageShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeScope>
      <AppShell>{children}</AppShell>
    </ThemeScope>
  );
}
