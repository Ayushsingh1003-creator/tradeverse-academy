import { db } from "@/lib/db";
import { getLevelFromTotalXp } from "@/lib/xp";

type XpLedgerClient = Pick<typeof db.xpLedger, "groupBy">;

type XpLedgerSumRow = {
  userId: string;
  _sum: { amount: number };
};

export async function getUserXpTotalFromLedger(
  userId: string,
  ledger: XpLedgerClient = db.xpLedger,
) {
  const sums = (await ledger.groupBy({
    by: ["userId"],
    where: { userId },
    _sum: { amount: true },
  })) as XpLedgerSumRow[];
  const row = sums.find((entry: XpLedgerSumRow) => entry.userId === userId) ?? sums[0];
  const totalXp = Math.max(0, Number(row?._sum.amount ?? 0));
  const { level } = getLevelFromTotalXp(totalXp);
  return { totalXp, level };
}

/** Set User.xp / level from the sum of XpLedger rows (source of truth). */
export async function reconcileUserXpFromLedger(userId: string) {
  const { totalXp, level } = await getUserXpTotalFromLedger(userId);

  return db.user.update({
    where: { id: userId },
    data: { xp: totalXp, level },
    select: { streak: true, streakLocalDate: true, xp: true, level: true },
  });
}
