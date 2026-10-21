import { getPublicAppUrl } from "@/lib/auth/app-url";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";

export type AuthSearchParams = {
  redirect?: string;
  redirect_url?: string;
  sso?: string;
};

/** The in-app path to return to after auth, from `redirect` (middleware) or
 * `redirect_url` (older call sites, sometimes an absolute URL on this origin).
 * Anything off-origin is dropped so this can't become an open redirect. */
export function resolveReturnPath(searchParams: AuthSearchParams): string | null {
  const raw = searchParams.redirect || searchParams.redirect_url;
  if (!raw) return null;
  const value = raw.trim();
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value.startsWith("/sign-in") || value.startsWith("/sign-up") ? null : value;
  }
  try {
    const appUrl = new URL(getPublicAppUrl());
    const url = new URL(value);
    if (url.origin !== appUrl.origin) return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return path.startsWith("/sign-in") || path.startsWith("/sign-up") ? null : path;
  } catch {
    return null;
  }
}

/** Absolute URL W1 sends the user back to once they're signed in. Always lands on
 * this app's /sign-in (with `sso=1`), which then forwards to `returnPath` or the
 * dashboard/onboarding — and, if the shared session still isn't visible here,
 * shows an error instead of bouncing back to W1 in a loop. */
export function buildSsoReturnUrl(returnPath: string | null): string {
  const url = new URL(`${getPublicAppUrl()}${AUTH_SIGN_IN_URL}`);
  url.searchParams.set("sso", "1");
  if (returnPath) url.searchParams.set("redirect", returnPath);
  return url.toString();
}
