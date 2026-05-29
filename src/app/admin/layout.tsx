import Link from "next/link";
import { ensureAdminAccess } from "@/lib/admin/ensureAdmin";

/** Admin UI reads session cookies — do not prerender at build time. */
export const dynamic = "force-dynamic";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Courses", href: "/admin/courses", icon: "📚" },
  { label: "Lessons", href: "/admin/lessons", icon: "📝" },
  { label: "Library", href: "/admin/library", icon: "🎬" },
  { label: "Live Cohort", href: "/admin/live-cohort", icon: "🎓" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Analytics", href: "/admin/analytics", icon: "📈" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  { label: "Site banner", href: "/admin/banner", icon: "📣" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await ensureAdminAccess();

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-white/[0.06] bg-[#141414]">
        <div className="flex h-14 items-center border-b border-white/[0.06] px-5">
          <span className="font-black text-white">⚡ Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#999] transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <Link href="/dashboard" className="text-xs text-[#555] hover:text-white">
            ← Back to app
          </Link>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-8 text-white">{children}</main>
    </div>
  );
}
