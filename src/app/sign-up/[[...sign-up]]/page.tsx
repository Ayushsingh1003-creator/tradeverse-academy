import { redirect } from "next/navigation";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getAuthUserId, getAuthUserEmail } from "@/lib/auth/session";
import { resolvePostAuthUrl } from "@/lib/onboarding/resolvePostAuthUrl";

type PageProps = {
  searchParams: { email?: string };
};

export default async function SignUpPage({ searchParams }: PageProps) {
  const authUserId = await getAuthUserId();
  if (authUserId) {
    redirect(await resolvePostAuthUrl(authUserId, await getAuthUserEmail()));
  }

  const authEnabled = isAuthConfigured();
  const email = searchParams.email?.trim();

  return (
    <AuthPageShell variant="sign-up" authEnabled={authEnabled}>
      {authEnabled ? <SignUpForm defaultEmail={email} /> : null}
    </AuthPageShell>
  );
}
