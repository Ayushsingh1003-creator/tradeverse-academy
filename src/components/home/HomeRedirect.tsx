"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AUTH_HOME_URL } from "@/lib/auth/urls";
import { Loader } from "@/components/ui/Loader";

/** Sends all visitors to the dashboard home. */
export function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(AUTH_HOME_URL);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#232228]">
      <Loader size="md" />
    </div>
  );
}
