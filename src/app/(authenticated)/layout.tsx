import { Banner } from "@/components/ui/Banner";
import { AppProviders } from "@/components/providers/AppProviders";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { getSiteBannerConfig } from "@/lib/siteBanner";

/** Cached banner + faster navigations between authenticated routes. */
export const revalidate = 120;

export default async function AuthenticatedGroupLayout({ children }: { children: React.ReactNode }) {
  const banner = await getSiteBannerConfig();
  const show = banner.enabled && banner.message.trim().length > 0;

  return (
    <QueryProvider>
      <AppProviders>
        {show ? (
          <Banner
            id={banner.bannerId}
            storageRevision={banner.revision}
            variant={banner.variant}
            className="border-b border-white/10"
          >
            {banner.message}
          </Banner>
        ) : null}
        {children}
      </AppProviders>
    </QueryProvider>
  );
}
