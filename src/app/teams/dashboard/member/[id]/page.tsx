import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function TeamMemberDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <h1 className="text-2xl font-bold">Member {params.id}</h1>
        <Card>
          <p className="text-text-muted">Weak areas, suggested next lesson, and &quot;Send reminder&quot; via Resend hook here.</p>
        </Card>
      </section>
    </main>
  );
}
