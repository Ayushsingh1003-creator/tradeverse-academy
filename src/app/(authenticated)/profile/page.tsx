import { ProfileClient } from "@/components/profile/ProfileClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = isAuthConfigured() ? await getSession() : null;
  const user = session?.user;
  const name = user?.name ?? "Trader";
  const email = user?.email ?? "Sign in to sync your profile";
  const imageUrl = user?.image ?? null;
  const joinedAt = user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString();

  return <ProfileClient name={name} email={email} imageUrl={imageUrl} joinedAt={joinedAt} />;
}
