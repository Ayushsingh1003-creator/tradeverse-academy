import { ProfileClient } from "@/components/profile/ProfileClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolveUserForAuth } from "@/lib/server/resolveDbUser";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  // createdAt/name/avatar live on the DB2 User row, not the auth session — the
  // Tradeverse ID token only carries identity (id/email), not profile fields.
  const authUserId = isAuthConfigured() ? await getAuthUserId() : null;
  const email = authUserId ? await getAuthUserEmail() : null;
  const dbUser = authUserId ? await resolveUserForAuth(authUserId, email) : null;

  const name = dbUser?.name ?? "Trader";
  const resolvedEmail = dbUser?.email ?? email ?? "Sign in to sync your profile";
  const imageUrl = dbUser?.avatar ?? null;
  const joinedAt = dbUser?.createdAt ? new Date(dbUser.createdAt).toISOString() : new Date().toISOString();

  return <ProfileClient name={name} email={resolvedEmail} imageUrl={imageUrl} joinedAt={joinedAt} />;
}
