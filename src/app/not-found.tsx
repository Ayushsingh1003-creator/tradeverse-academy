import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
        <h1 className="text-3xl font-bold">Lesson not found</h1>
        <p className="mt-2 text-text-muted">Try searching for another lesson or return to courses.</p>
        <div className="mt-4 flex justify-center"><SearchBar desktopOnly={false} /></div>
        <Link href="/courses" className="mt-6 inline-block rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">Back to Courses</Link>
      </div>
    </main>
  );
}
