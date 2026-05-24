import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import { isClerkConfigured } from "@/lib/clerkEnabled";
import {
  CLERK_AFTER_SIGN_IN_URL,
  CLERK_AFTER_SIGN_OUT_URL,
  CLERK_AFTER_SIGN_UP_URL,
  CLERK_SIGN_IN_URL,
  CLERK_SIGN_UP_URL,
} from "@/lib/clerkUrls";
import { AppBackground } from "@/components/layout/AppBackground";
import { ClerkUserHydration } from "@/components/providers/ClerkUserHydration";
import { LiquidGlassFilter } from "@/components/ui/LiquidGlassFilter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://academy.tradeverse.io"),
  manifest: "/manifest.json",
  title: { default: "Tradeverse Academy", template: "%s | Tradeverse Academy" },
  description: "Master trading one concept at a time. Interactive lessons on candlesticks, technical analysis, risk management, and more.",
  keywords: ["trading education", "technical analysis", "candlestick patterns", "trading course", "learn trading"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://academy.tradeverse.io",
    siteName: "Tradeverse Academy",
    title: "Tradeverse Academy — Master Trading One Concept at a Time",
    description: "Interactive trading education built like a game. Learn candlesticks, RSI, MACD, risk management and more.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: "Tradeverse Academy", description: "Master trading, one concept at a time." },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-background font-sans text-text-primary">
        <LiquidGlassFilter />
        <Script id="tv-theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('tv_theme') || 'system';
            if (t === 'system') {
              document.documentElement.setAttribute('data-theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            } else {
              document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
            }
          } catch (e) {}
        `}</Script>
        <AppBackground />
        <div className="relative z-10">
          {isClerkConfigured() ? (
            <ClerkProvider
              publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
              signInUrl={CLERK_SIGN_IN_URL}
              signUpUrl={CLERK_SIGN_UP_URL}
              afterSignInUrl={CLERK_AFTER_SIGN_IN_URL}
              afterSignUpUrl={CLERK_AFTER_SIGN_UP_URL}
              signInFallbackRedirectUrl={CLERK_AFTER_SIGN_IN_URL}
              signUpFallbackRedirectUrl={CLERK_AFTER_SIGN_UP_URL}
              signOutFallbackRedirectUrl={CLERK_AFTER_SIGN_OUT_URL}
            >
              <ClerkUserHydration />
              {children}
            </ClerkProvider>
          ) : (
            children
          )}
        </div>
      </body>
    </html>
  );
}
