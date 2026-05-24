import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function ReviewPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">SRS review session</h1>
        <p className="text-text-muted">
          Due cards from spaced repetition appear here for interleaved practice. Wire <code className="rounded bg-surface2 px-1">SRSCard</code> rows to this flow after
          practice submit updates SM-2 intervals.
        </p>
        <Card>
          <p className="font-semibold">No reviews due (demo)</p>
          <p className="mt-2 text-sm text-text-muted">Complete practice sets to populate your review queue.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-accent underline">
            Back to dashboard
          </Link>
        </Card>
      </section>
    </main>
  );
}
