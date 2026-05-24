import { PageLoader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1240px] px-4 py-8">
      <PageLoader />
    </main>
  );
}
