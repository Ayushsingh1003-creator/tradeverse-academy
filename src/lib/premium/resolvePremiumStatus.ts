import { db } from "@/lib/db";

export type PremiumStatus = { plan: string; status: string; isPremium: boolean };

/**
 * Some Subscription rows predate the current auth provider and carry an
 * authUserId that no longer matches any User row, so a Subscription lookup
 * alone can miss real premium users. users.isPremium (set directly by admin
 * actions via setUserPremium) is checked as an independent OR condition.
 */
export async function resolvePremiumStatus(authUserId: string | null): Promise<PremiumStatus> {
  if (!authUserId) return { plan: "free", status: "inactive", isPremium: false };

  const [subscription, dbUser] = await Promise.all([
    db.subscription.findUnique({ where: { authUserId } }),
    db.user.findUnique({ where: { authUserId }, select: { isPremium: true, premiumUntil: true } }),
  ]);

  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "inactive";
  const subscriptionActive = plan !== "free" && ["active", "trialing"].includes(status);
  const userPremiumFlag =
    Boolean(dbUser?.isPremium) && (!dbUser?.premiumUntil || new Date(dbUser.premiumUntil) > new Date());

  return { plan, status, isPremium: subscriptionActive || userPremiumFlag };
}
