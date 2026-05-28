"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { CLERK_HOME_URL } from "@/lib/clerkUrls";
import { Loader } from "@/components/ui/Loader";

/** Sends all visitors to the dashboard home (guests and signed-in). */
export function HomeRedirect() {
  const { isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isClerkConfigured()) {
      router.replace("/dashboard");
      return;
    }
    if (!isLoaded) return;
    router.replace(CLERK_HOME_URL);
  }, [isLoaded, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#232228]">
      <Loader size="md" />
    </div>
  );
}
