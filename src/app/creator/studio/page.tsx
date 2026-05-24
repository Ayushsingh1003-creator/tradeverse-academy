import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function CreatorStudioPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">Creator studio</h1>
        <p className="text-text-muted">4-step wizard: course info → curriculum (reuse admin lesson editor) → preview → submit for review.</p>
        <Card>
          <Link href="/creator/studio/earnings" className="text-accent underline">
            Earnings &amp; payouts
          </Link>
        </Card>
      </section>
    </main>
  );
}
