"use client";

import { authClient } from "@/lib/auth/client";
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
  const { data, isPending, isRefetching, refetch } = authClient.useSession();
  const retriedRef = useRef(false);

  const clientUser = data?.user ?? null;
  const resolved = !isPending && !isRefetching;

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (retriedRef.current || clientUser || initialUser) return;
    if (isPending || isRefetching) return;

    retriedRef.current = true;
    const t = window.setTimeout(() => {
      void refetch();
    }, 250);
    return () => window.clearTimeout(t);
  }, [clientUser, initialUser, isPending, isRefetching, refetch]);

  useEffect(() => {
    if (initialUser) retriedRef.current = false;
  }, [initialUser?.id]);

  let user: AuthSessionUser | null;
  if (resolved) {
    user = clientUser;
  } else {
    user = initialUser ?? clientUser ?? null;
  }

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
