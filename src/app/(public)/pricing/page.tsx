"use client";

import { useState } from "react";
import { AppNav } from "@/components/layout/AppNav";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  async function startCheckout(priceId: string) {
    const response = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, returnUrl: window.location.origin }),
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
  }

  const premiumPrice = annual ? "$11/mo" : "$19/mo";
  const premiumLabel = annual ? "Billed $129/year" : "Billed monthly";

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-center text-4xl font-bold">Choose your plan</h1>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => setAnnual(false)} className={`rounded-2xl px-4 py-2 ${!annual ? "bg-accent text-slate-900" : "border border-border"}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`rounded-2xl px-4 py-2 ${annual ? "bg-accent text-slate-900" : "border border-border"}`}>Annual (save 40%)</button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PlanCard title="Free" price="$0/mo" features={["2 free lessons/path", "Daily challenge", "Basic streak"]} cta="Current Plan" />
          <PlanCard
            title="Premium Monthly"
            price={premiumPrice}
            features={["All 50+ lessons", "Full adaptive practice", "Streaks + Leagues", "AI Trading Coach", "Completion certificates", premiumLabel]}
            cta="Start Monthly"
            onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "")}
            highlighted
          />
          <PlanCard
            title="Premium Annual"
            price="$11/mo"
            features={["All 50+ lessons", "AI Trading Coach", "Certificates", "Priority support", "Early access", "Billed $129/year"]}
            cta="Start Annual"
            onClick={() => startCheckout(process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID ?? "")}
          />
          <PlanCard
            title="Teams"
            price="$49/seat/mo"
            features={["Everything in Premium", "Min 5 seats", "Manager dashboard", "Assign courses + deadlines", "CSV/PDF export", "Branded subdomain", "Onboarding call"]}
            cta="Start team trial"
            onClick={() => (window.location.href = "/teams/onboard")}
          />
        </div>
      </section>
    </main>
  );
}

function PlanCard({
  title,
  price,
  features,
  cta,
  onClick,
  highlighted,
}: {
  title: string;
  price: string;
  features: string[];
  cta: string;
  onClick?: () => void;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${highlighted ? "border-accent bg-accent/5" : "border-border bg-surface"}`}>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-accent">{price}</p>
      <ul className="mt-4 space-y-2 text-sm text-text-muted">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <button onClick={onClick} className="mt-6 w-full rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900">{cta}</button>
    </div>
  );
}
