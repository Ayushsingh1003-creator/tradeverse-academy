"use client";

import { useQuery } from "@tanstack/react-query";

type SubscriptionStatus = {
  isPremium: boolean;
  plan: string;
  status: string;
};

async function getStatus(): Promise<SubscriptionStatus> {
  const response = await fetch("/api/subscription/status", { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load subscription");
  return response.json();
}

export function useSubscription() {
  const query = useQuery({
    queryKey: ["subscription-status"],
    queryFn: getStatus,
  });

  return {
    isPremium: query.data?.isPremium ?? false,
    plan: query.data?.plan ?? "free",
    status: query.data?.status ?? "inactive",
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
