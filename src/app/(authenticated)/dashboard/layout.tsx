import type { Metadata } from "next";
import "@/styles/dashboard-shell.css";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Track XP, streaks, and continue your next trading lesson.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
