import { getPublicAppUrl } from "@/lib/auth/app-url";
import { AUTH_SIGN_IN_URL } from "@/lib/auth/urls";

/** Where Tradeverse ID redirects the browser after a verification link is clicked
 * — this app's own sign-in page, not W1's (see the register/resend calls that pass
 * this as `returnTo`). */
export function getVerifiedReturnUrl(): string {
  return `${getPublicAppUrl()}${AUTH_SIGN_IN_URL}?verified=1`;
}
