import { CertificateClient } from "@/components/certificate/CertificateClient";
import { isAuthConfigured } from "@/lib/auth/enabled";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
  const session = isAuthConfigured() ? await getSession() : null;
  const userName = session?.user?.name ?? "Trader";
  return <CertificateClient courseId={params.courseId} userName={userName} />;
}
