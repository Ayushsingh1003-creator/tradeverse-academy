import { db } from "@/lib/db";

export function generateReferralCode(name: string) {
  const root = name.replace(/[^a-zA-Z]/g, "").slice(0, 6).toUpperCase() || "TRADER";
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${root}-${rand}`;
}

export async function getOrCreateReferralCode(referrerId: string, name: string) {
  const existing = await db.referral.findFirst({ where: { referrerId } });
  if (existing) return existing.code;
  const code = generateReferralCode(name);
  await db.referral.create({
    data: { referrerId, referredId: `${referrerId}-self`, code, rewardGiven: false },
  });
  return code;
}
