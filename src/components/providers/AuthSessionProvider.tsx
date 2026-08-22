"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchSession } from "@/lib/auth/tradeverseIdClient";

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
  const [user, setUser] = useState<AuthSessionUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const refetch = useCallback(async () => {
    const sessionUser = await fetchSession();
    setUser(sessionUser ? { id: sessionUser.id, email: sessionUser.email, name: null, image: null } : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Reconciles with the live session on every mount, same as before — this is
    // also what picks up a session set by a login on W1 moments earlier (the
    // shared cookie is already there; this just confirms it and hydrates state).
    void refetch();
  }, [refetch]);

  return (
    <AuthSessionContext.Provider value={{ user, isLoading, refetch }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
