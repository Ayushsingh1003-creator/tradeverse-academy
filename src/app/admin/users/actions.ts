"use server";

import { revalidatePath } from "next/cache";
import { guardAdmin } from "@/lib/admin/guardAdmin";
import { db } from "@/lib/db";
import { getUserXpTotalFromLedger } from "@/lib/xp/reconcileUserXpFromLedger";
import { setUserPremium } from "@/lib/admin/syncPremium";

export async function grantPremium(userId: string) {
  await guardAdmin();
  await setUserPremium(userId, true);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function revokePremium(userId: string) {
  await guardAdmin();
  await setUserPremium(userId, false);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function adjustXp(userId: string, amount: number) {
  await guardAdmin();
  const delta = Math.round(amount);
  if (!delta) return;

  await db.$transaction(async (tx: typeof db) => {
    await tx.xpLedger.create({
      data: {
        userId,
        amount: delta,
        reason: "admin_adjustment",
        ref: "admin",
      },
    });
    const { totalXp, level } = await getUserXpTotalFromLedger(userId, tx.xpLedger);
    await tx.user.update({
      where: { id: userId },
      data: { xp: totalXp, level },
    });
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}
