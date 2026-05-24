import { currentUser } from "@clerk/nextjs/server";
import { CertificateClient } from "@/components/certificate/CertificateClient";
import { isClerkConfigured } from "@/lib/clerkEnabled";

export default async function CertificatePage({ params }: { params: { courseId: string } }) {
  const user = isClerkConfigured() ? await currentUser() : null;
  const userName = user?.fullName ?? "Trader";
  return <CertificateClient courseId={params.courseId} userName={userName} />;
}
