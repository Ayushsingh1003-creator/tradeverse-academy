import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse structured trading courses on Tradeverse Academy.",
};

/** Cache course listing shell; progress still hydrates client-side. */
export const revalidate = 300;

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
