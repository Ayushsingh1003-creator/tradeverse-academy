import { currentUser } from "@clerk/nextjs/server";
import { ReferClient } from "@/components/refer/ReferClient";
import { isClerkConfigured } from "@/lib/clerkEnabled";

export default async function ReferPage() {
  const user = isClerkConfigured() ? await currentUser() : null;
  const name = (user?.firstName ?? "TRADER").toUpperCase();
  const code = `${name.slice(0, 6)}-X4K2`;
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}?ref=${code}`;

  return <ReferClient referralCode={code} referralLink={link} />;
}
