import { neonAuth } from "@/lib/auth/server";

export async function getSession() {
  try {
    const { data } = await neonAuth.getSession();
    return data;
  } catch (error) {
    console.warn("[auth] getSession failed — treating as signed out:", error);
    return null;
  }
}

export async function getAuthUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

export async function getAuthUserEmail(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.email ?? null;
}

export async function getAuthUserName(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.name ?? null;
}
