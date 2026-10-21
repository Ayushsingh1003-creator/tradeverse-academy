import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";
import { centralAuthUrl, MAIN_SITE_URL } from "@/lib/auth/urls";
import {
  buildSsoReturnUrl,
  resolveReturnPath,
  type AuthSearchParams,
} from "@/lib/auth/central-redirect";

type PageProps = {
  searchParams: AuthSearchParams;
};

// No sign-in UI of its own: login/register/email-verify/phone all happen on W1
// (www.tradeversejournal.com), which sets the shared Tradeverse ID session cookie
// and sends the user back here.
export default async function SignInPage({ searchParams }: PageProps) {
  const returnPath = resolveReturnPath(searchParams);

  const authUserId = await getAuthUserId();
  if (authUserId) {
    redirect(returnPath ?? (await resolvePostAuthUrl(authUserId, await getAuthUserEmail())));
  }

  const signInUrl = centralAuthUrl("sign-in", buildSsoReturnUrl(returnPath));

  // Back from W1 but the shared cookie still isn't visible here (e.g. cookie domain
  // misconfigured) — stop instead of looping between the two sites.
  if (searchParams.sso === "1") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>We couldn&apos;t complete sign-in</h1>
        <p style={{ maxWidth: 420, opacity: 0.75 }}>
          You signed in on Tradeverse, but the session didn&apos;t reach the Academy. Please try again — if
          it keeps happening, make sure cookies are enabled for tradeversejournal.com.
        </p>
        <Link href={signInUrl} className="tvd-btn" data-tone="primary">
          Try again
        </Link>
        <Link href={MAIN_SITE_URL} style={{ fontSize: 14, opacity: 0.7 }}>
          Go to Tradeverse
        </Link>
      </main>
    );
  }

  redirect(signInUrl);
}
