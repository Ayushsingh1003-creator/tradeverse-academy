import bundleAnalyzer from "@next/bundle-analyzer";
import withPWA from "next-pwa";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 8, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\/api\/(?!ai-tutor|stripe|voice).*/i,
      handler: "NetworkFirst",
      options: { cacheName: "api-cache", networkTimeoutSeconds: 10 },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "static-assets" },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep heavy server-only packages out of the dev/client graph when possible.
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "bcryptjs",
    "stripe",
    "@mux/mux-node",
    "socket.io",
    "resend",
    "openai",
    "web-push",
  ],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "swiper",
      "@react-three/fiber",
      "@react-three/drei",
      "gsap",
      "lightweight-charts",
      "@mux/mux-player-react",
      "@clerk/nextjs",
      "@tanstack/react-query",
    ],
  },
};

// next-pwa injects Webpack config; skip it in dev so `next dev --turbo` stays clean.
const isDev = process.env.NODE_ENV === "development";

export default isDev ? nextConfig : withBundleAnalyzer(withPWAConfig(nextConfig));
