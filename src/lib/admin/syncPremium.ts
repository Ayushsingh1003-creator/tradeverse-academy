import { db } from "@/lib/db";

/** Grant or revoke premium in both User and Subscription (app checks Subscription). */
export async function setUserPremium(
  userId: string,
  premium: boolean,
  options?: { months?: number },
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, clerkUserId: true },
  });
  if (!user) return;

  const premiumUntil = premium
    ? (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + (options?.months ?? 12));
        return d;
      })()
    : null;

  await db.user.update({
    where: { id: userId },
    data: { isPremium: premium, premiumUntil },
  });

  if (!user.clerkUserId) return;

  if (premium) {
    await db.subscription.upsert({
      where: { clerkUserId: user.clerkUserId },
      create: {
        clerkUserId: user.clerkUserId,
        plan: "monthly",
        status: "active",
        currentPeriodEnd: premiumUntil,
        cancelAtPeriodEnd: false,
      },
      update: {
        plan: "monthly",
        status: "active",
        currentPeriodEnd: premiumUntil,
        cancelAtPeriodEnd: false,
      },
    });
  } else {
    await db.subscription.upsert({
      where: { clerkUserId: user.clerkUserId },
      create: {
        clerkUserId: user.clerkUserId,
        plan: "free",
        status: "inactive",
      },
      update: {
        plan: "free",
        status: "inactive",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      },
    });
  }
}
