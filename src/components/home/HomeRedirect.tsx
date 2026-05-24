"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import { CLERK_AFTER_SIGN_IN_URL, CLERK_HOME_URL } from "@/lib/clerkUrls";
import { Loader } from "@/components/ui/Loader";

/** Sends guests to public home and signed-in users to the app — avoids stale server sessions after sign-out. */
export function HomeRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isClerkConfigured()) {
      router.replace("/courses");
      return;
    }
    if (!isLoaded) return;
    router.replace(isSignedIn ? CLERK_AFTER_SIGN_IN_URL : CLERK_HOME_URL);
  }, [isLoaded, isSignedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#232228]">
      <Loader size="md" />
    </div>
  );
}
