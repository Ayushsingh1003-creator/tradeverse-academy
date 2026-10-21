import { redirect } from "next/navigation";
import { getAuthUserId, getAuthUserEmail } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";
import { centralAuthUrl } from "@/lib/auth/urls";
import {
  buildSsoReturnUrl,
  resolveReturnPath,
  type AuthSearchParams,
} from "@/lib/auth/central-redirect";

type PageProps = {
  searchParams: AuthSearchParams;
};

// Registration (and its email verification + phone step) happens on W1; this route
// only exists so existing /sign-up links keep working.
export default async function SignUpPage({ searchParams }: PageProps) {
  const returnPath = resolveReturnPath(searchParams);

  const authUserId = await getAuthUserId();
  if (authUserId) {
    redirect(returnPath ?? (await resolvePostAuthUrl(authUserId, await getAuthUserEmail())));
  }

  redirect(centralAuthUrl("sign-up", buildSsoReturnUrl(returnPath)));
}
