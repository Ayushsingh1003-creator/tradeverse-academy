import { currentUser } from "@clerk/nextjs/server";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { isClerkConfigured } from "@/lib/clerkEnabled";

export default async function SettingsPage() {
  const user = isClerkConfigured() ? await currentUser() : null;
  const fullName = user?.fullName ?? "Trader";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Sign in to sync your account";

  return <SettingsClient fullName={fullName} email={email} />;
}
