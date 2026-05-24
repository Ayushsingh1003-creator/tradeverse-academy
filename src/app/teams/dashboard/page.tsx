import Link from "next/link";
import { AppNav } from "@/components/layout/AppNav";
import { Card } from "@/components/ui/Card";

export default function TeamDashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <h1 className="text-3xl font-bold">Team dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-text-muted">Members</p>
            <p className="text-2xl font-bold">12</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Active this week</p>
            <p className="text-2xl font-bold">9</p>
          </Card>
          <Card>
            <p className="text-sm text-text-muted">Lessons completed</p>
            <p className="text-2xl font-bold">186</p>
          </Card>
        </div>
        <Card>
          <p className="font-semibold">Member progress</p>
          <p className="mt-2 text-sm text-text-muted">Table + heatmap + export — populate from OrgMember + LessonProgress.</p>
          <Link href="/teams/dashboard/member/demo" className="mt-4 inline-block text-accent underline">
            Sample member detail
          </Link>
        </Card>
      </section>
    </main>
  );
}
