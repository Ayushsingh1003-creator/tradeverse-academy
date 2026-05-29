import { SettingsClient } from "@/components/settings/SettingsClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = isAuthConfigured() ? await getSession() : null;
  const user = session?.user;
  const fullName = user?.name ?? "Trader";
  const email = user?.email ?? "Sign in to sync your account";

  return <SettingsClient fullName={fullName} email={email} />;
}
