import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function CreatorEarningsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <Card>
          <p className="text-text-muted">Totals per course, payout history, and Request payout ($50 min) — connect Stripe Connect transfers.</p>
        </Card>
      </section>
    </main>
  );
}
