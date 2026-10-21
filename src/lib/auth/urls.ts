export const AUTH_SIGN_IN_URL = process.env.NEXT_PUBLIC_AUTH_SIGN_IN_URL ?? "/sign-in";
export const AUTH_SIGN_UP_URL = process.env.NEXT_PUBLIC_AUTH_SIGN_UP_URL ?? "/sign-up";
export const AUTH_HOME_URL = process.env.NEXT_PUBLIC_AUTH_HOME_URL ?? "/dashboard";
export const AUTH_AFTER_SIGN_IN_URL = process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_IN_URL ?? "/onboarding";
export const AUTH_AFTER_SIGN_UP_URL = process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_UP_URL ?? "/onboarding";
// Not the sign-in page: that now bounces to W1's login, which is an odd place to
// land right after choosing to log out.
export const AUTH_AFTER_SIGN_OUT_URL = process.env.NEXT_PUBLIC_AUTH_AFTER_SIGN_OUT_URL ?? "/";

// W1 (www.tradeversejournal.com) hosts the only login/register/email-verify/phone
// flow for both apps. This app's /sign-in and /sign-up just redirect there with an
// absolute `redirect` back to this app (allowlisted on W1's side).
export const MAIN_SITE_URL = (
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? "https://www.tradeversejournal.com"
).replace(/\/$/, "");

export function centralAuthUrl(mode: "sign-in" | "sign-up", returnTo: string): string {
  const path = mode === "sign-in" ? "/auth/login" : "/auth/register";
  return `${MAIN_SITE_URL}${path}?redirect=${encodeURIComponent(returnTo)}`;
}
