// Browser-side calls to Tradeverse ID (central auth, shared with
// www.tradeversejournal.com). Logging in here is what sets the shared
// cross-subdomain session cookie, so W1 recognizes the user without a second login.
// Mirrors W1's src/services/api.ts authClient (Phase 3) — same endpoints, same
// credentials:'include' requirement.

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.tradeversejournal.com";

function devHeaders(): Record<string, string> {
  // Outside production this mirrors the backend's own dev bypass (see W1's
  // server.js hostname gate), so Tradeverse ID is reachable for local/staging
  // testing before auth.tradeversejournal.com's DNS/custom domain is live.
  return process.env.NODE_ENV !== "production" ? { "x-tradeverse-id-route": "1" } : {};
}

export interface TradeverseIdUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  [key: string]: unknown;
}

export class TradeverseIdError extends Error {
  status: number;
  data: Record<string, unknown>;
  constructor(message: string, status: number, data: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...devHeaders(),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new TradeverseIdError(
      typeof data?.error === "string" ? data.error : `Request failed (${res.status})`,
      res.status,
      data,
    );
  }
  return data as T;
}

export interface AttributionPayload {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
  platform?: string | null;
  ref?: string | null;
  landingPage?: string | null;
  referrer?: string | null;
}

export function signInWithEmail(email: string, password: string) {
  return request<{ user: TradeverseIdUser; accessToken: string }>("/auth/login", {
    body: { email, password },
  });
}

/** Splits a single "name" field into firstName/lastName — Tradeverse ID's identity
 * table (inherited from W1) requires both separately; W2's sign-up form only
 * collects one field. */
function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || "Trader";
  const lastName = parts.slice(1).join(" ") || firstName;
  return { firstName, lastName };
}

export function signUpWithEmail(
  email: string,
  password: string,
  name: string,
  returnTo: string,
  attribution?: AttributionPayload,
) {
  const { firstName, lastName } = splitName(name);
  return request<{ message: string; requiresVerification: true; email: string }>("/auth/register", {
    body: { email, password, firstName, lastName, returnTo, attribution },
  });
}

export function resendVerificationEmail(email: string, returnTo: string) {
  return request<{ message: string }>("/auth/resend-verification", {
    body: { email, returnTo },
  });
}

// `useGoogleLogin`'s default (implicit) flow returns an OAuth access token, not a
// JWT ID token — same distinction W1 makes (an ID token is a JWT and starts with
// "eyJ"; an access token doesn't). Sending an access token labeled as `idToken`
// makes the backend try to verify it as a JWT and fail with a generic 500.
export function signInWithGoogle(token: string, attribution?: AttributionPayload) {
  const isIdToken = token.startsWith('eyJ');
  const payload = isIdToken ? { idToken: token } : { accessToken: token };
  return request<{ user: TradeverseIdUser; accessToken: string }>("/auth/google", {
    body: { ...payload, attribution },
  });
}

export function signOut() {
  return request<{ message: string }>("/auth/logout", { method: "POST", body: {} });
}

export async function fetchSession(): Promise<TradeverseIdUser | null> {
  try {
    const data = await request<{ user: TradeverseIdUser }>("/auth/session", { method: "GET" });
    return data.user ?? null;
  } catch {
    return null;
  }
}
