import { currentUser } from "@clerk/nextjs/server";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { isClerkConfigured } from "@/lib/clerkEnabled";

export default async function ProfilePage() {
  const user = isClerkConfigured() ? await currentUser() : null;
  const name = user?.fullName ?? "Trader";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Sign in to sync your profile";
  const imageUrl = user?.imageUrl ?? null;
  const joinedAt = user?.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString();

  return <ProfileClient name={name} email={email} imageUrl={imageUrl} joinedAt={joinedAt} />;
}
