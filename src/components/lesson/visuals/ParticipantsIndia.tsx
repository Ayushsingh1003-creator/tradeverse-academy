"use client";

import { useState } from "react";

type Role = "retail" | "fii" | "dii" | "mm" | "broker";

const ROLES: { id: Role; emoji: string; name: string; tagline: string; details: string }[] = [
  {
    id: "retail",
    emoji: "🧑‍💻",
    name: "Retail Trader",
    tagline: "Individual trading personal money",
    details: "You, a friend, an uncle who watches CNBC — anyone trading their own capital through a broker.",
  },
  {
    id: "fii",
    emoji: "🌍",
    name: "FII",
    tagline: "Foreign Institutional Investor",
    details: "Large foreign funds, banks, and asset managers investing in Indian stocks. Their flows often move Nifty heavily.",
  },
  {
    id: "dii",
    emoji: "🏢",
    name: "DII",
    tagline: "Domestic Institutional Investor",
    details: "Indian mutual funds (HDFC AMC, SBI MF), insurance giants (LIC), and pension funds.",
  },
  {
    id: "mm",
    emoji: "🤖",
    name: "Market Maker",
    tagline: "Posts buy & sell quotes to keep markets liquid",
    details: "Professional firms that always quote bid & ask, earning the spread. They make tradability possible.",
  },
  {
    id: "broker",
    emoji: "🏦",
    name: "Broker",
    tagline: "Your gateway to the exchange",
    details: "Zerodha, Groww, Upstox, ICICI Direct — they route your order to NSE/BSE and hold your demat account.",
  },
];

export function ParticipantsIndia() {
  const [active, setActive] = useState<Role>("retail");
  const current = ROLES.find((r) => r.id === active)!;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setActive(r.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center text-xs transition-colors ${
              active === r.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface2 text-text-primary hover:bg-surface"
            }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="font-semibold">{r.name}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{current.emoji}</span>
          <div>
            <p className="text-base font-bold text-white">{current.name}</p>
            <p className="text-xs text-text-muted">{current.tagline}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-text-muted">{current.details}</p>
      </div>
    </div>
  );
}
