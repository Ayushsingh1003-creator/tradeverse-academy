import { ReferClient } from "@/components/refer/ReferClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ReferPage() {
  const session = isAuthConfigured() ? await getSession() : null;
  const user = session?.user;
  const name = (user?.name?.split(/\s+/)[0] ?? "TRADER").toUpperCase();
  const code = `${name.slice(0, 6)}-X4K2`;
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}?ref=${code}`;

  return <ReferClient referralCode={code} referralLink={link} />;
}
