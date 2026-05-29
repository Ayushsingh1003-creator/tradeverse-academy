"use client";

import { authClient } from "@/lib/auth/client";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";

export type AuthSessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type AuthSessionContextValue = {
  user: AuthSessionUser | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue>({
  user: null,
  isLoading: true,
  refetch: async () => {},
});

export function AuthSessionProvider({
  initialUser,
  children,
}: {
  initialUser: AuthSessionUser | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { data, isPending, isRefetching, refetch } = authClient.useSession();
  const retriedRef = useRef(false);

  useEffect(() => {
    void refetch();
  }, [pathname, refetch]);

  useEffect(() => {
    if (retriedRef.current || data?.user || initialUser) return;
    if (isPending || isRefetching) return;

    retriedRef.current = true;
    const t = window.setTimeout(() => {
      void refetch();
    }, 250);
    return () => window.clearTimeout(t);
  }, [data?.user, initialUser, isPending, isRefetching, refetch]);

  const clientUser = data?.user ?? null;
  const user = clientUser ?? initialUser;
  const isLoading = !user && (isPending || isRefetching);

  return (
    <AuthSessionContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
