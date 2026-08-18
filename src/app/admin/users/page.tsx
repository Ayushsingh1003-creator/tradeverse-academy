import { db } from "@/lib/db";
import type { User } from "@/lib/db/schema";
import { UserRowActions } from "./UserRowActions";

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q ?? "";
  const users = (await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      authUserId: true,
      xp: true,
      streak: true,
      streakLocalDate: true,
      lastActiveDate: true,
      createdAt: true,
    },
  })) as User[];

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Users</h1>
      <form className="mb-4" method="get">
        <input
          name="q"
          defaultValue={q}
          className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#1E1E1E] px-4 py-3 text-sm text-white"
          placeholder="Search by name or email"
        />
      </form>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead className="border-b border-white/[0.06] bg-[#1E1E1E] text-left text-xs uppercase tracking-wider text-[#666]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Plan</th>
              <th className="py-3">Joined</th>
              <th className="py-3">Streak day / last active</th>
              <th className="py-3">XP</th>
              <th className="py-3">Streak</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="py-3 text-[#999]">{u.email}</td>
                <td className="py-3">
                  <span className={u.isPremium ? "text-[#88C9F7]" : "text-[#666]"}>
                    {u.isPremium ? "Premium" : "Free"}
                  </span>
                  {!u.authUserId ? (
                    <span className="ml-1 text-[10px] text-amber-400" title="No auth account linked">
                      ⚠
                    </span>
                  ) : null}
                </td>
                <td className="py-3 text-[#666]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-3 text-[#666]">
                  {u.streakLocalDate ??
                    (u.lastActiveDate ? new Date(u.lastActiveDate).toLocaleDateString() : "—")}
                </td>
                <td className="py-3 text-[#F7C325]">{u.xp}</td>
                <td className="py-3">🔥 {u.streak}</td>
                <td className="py-3">
                  <UserRowActions userId={u.id} isPremium={u.isPremium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
