import { getServerAdminAllowlist } from "@/lib/admin/adminAllowlist";
import { isAuthConfigured } from "@/lib/auth/enabled";

export default function AdminSettingsPage() {
  const hasAuth = isAuthConfigured();
  const allowCount = getServerAdminAllowlist().length;
  const envAdmins = (process.env.ADMIN_EMAILS ?? "").split(",").filter((s) => s.trim()).length;

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-black">Settings</h1>
      <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6 text-sm text-[#ccc]">
        <p>
          <span className="font-semibold text-white">Admin access</span> — allowlisted emails (built-in +{" "}
          <code className="rounded bg-black/40 px-1 text-[#88C9F7]">ADMIN_EMAILS</code>, {allowCount} total) or any
          user with <code className="rounded bg-black/40 px-1">User.role = admin</code> in the database (
          {envAdmins} extra emails from env).
        </p>
        <p>
          <span className="font-semibold text-white">Neon Auth:</span>{" "}
          {hasAuth ? "enabled — non-admins cannot open /admin" : "not configured (admin open for local dev)"}
        </p>
        <p>
          <span className="font-semibold text-white">Content types:</span>
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[#999]">
          <li>
            <strong className="text-[#ccc]">Library & Live cohort</strong> — edit in admin, stored in Neon Postgres
          </li>
          <li>
            <strong className="text-[#ccc]">Courses & lesson pages</strong> — edit in{" "}
            <code className="text-[#88C9F7]">src/lib/data/</code>
          </li>
          <li>
            <strong className="text-[#ccc]">Mux videos</strong> — attach per lesson under Admin → Lessons
          </li>
          <li>
            <strong className="text-[#ccc]">Site banner</strong> — Admin → Site banner
          </li>
        </ul>
        <p className="text-xs text-[#555]">
          Database: <code className="text-[#88C9F7]">npm run db:push</code> then{" "}
          <code className="text-[#88C9F7]">npm run db:setup</code>
        </p>
      </div>
    </div>
  );
}
