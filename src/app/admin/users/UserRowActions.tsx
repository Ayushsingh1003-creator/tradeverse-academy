"use client";

import { useTransition } from "react";
import { grantPremium, revokePremium } from "./actions";

export function UserRowActions({
  userId,
  isPremium,
}: {
  userId: string;
  isPremium: boolean;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isPremium ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void revokePremium(userId))}
          className="rounded-xl border border-amber-500/40 px-3 py-1 text-xs text-amber-200 hover:bg-amber-500/10 disabled:opacity-50"
        >
          Revoke premium
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void grantPremium(userId))}
          className="rounded-xl border border-[#456DFF]/50 px-3 py-1 text-xs text-[#88C9F7] hover:bg-[#456DFF]/10 disabled:opacity-50"
        >
          Grant premium
        </button>
      )}
    </div>
  );
}
