"use client";

import dynamic from "next/dynamic";

const InfiniteGridBackground = dynamic(
  () => import("@/components/the-infinite-grid").then((m) => m.InfiniteGridBackground),
  { ssr: false },
);

/** Animated grid + glow (global). */
export function AppBackground() {
  return <InfiniteGridBackground />;
}
