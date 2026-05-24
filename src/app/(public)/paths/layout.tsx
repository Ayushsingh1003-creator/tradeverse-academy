import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning Paths",
  description: "Browse structured learning paths and courses in Tradeverse Academy.",
};

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
