import { QueryProvider } from "@/components/providers/QueryProvider";

/** OAuth callback must run at request time (query params + session cookies). */
export const dynamic = "force-dynamic";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
