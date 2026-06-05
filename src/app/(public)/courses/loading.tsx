import { PAGE_SHELL_CLASSES } from "@/components/layout/pageShell";
import { PageLoader } from "@/components/ui/Loader";

export default function Loading() {
  return (
    <main className={`${PAGE_SHELL_CLASSES} py-8`}>
      <PageLoader />
    </main>
  );
}
