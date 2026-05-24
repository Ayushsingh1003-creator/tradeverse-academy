import { HomeRedirect } from "@/components/home/HomeRedirect";

/** Site entry — client redirect so signed-out users reliably reach public home. */
export default function HomePage() {
  return <HomeRedirect />;
}
