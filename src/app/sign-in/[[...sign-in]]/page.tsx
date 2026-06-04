import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignInForm } from "@/components/auth/SignInForm";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserEmail, getAuthUserId } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";

type PageProps = {
  searchParams: { verified?: string };
};

export default async function SignInPage({ searchParams }: PageProps) {
  const authUserId = await getAuthUserId();
  if (authUserId) {
    redirect(await resolvePostAuthUrl(authUserId, await getAuthUserEmail()));
  }

  const authEnabled = isAuthConfigured();

  return (
    <AuthPageShell variant="sign-in" authEnabled={authEnabled}>
      {authEnabled ? <SignInForm emailVerified={searchParams.verified === "1"} /> : null}
    </AuthPageShell>
  );
}
