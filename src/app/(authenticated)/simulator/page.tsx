"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/layout/AppNav";
import { useToast } from "@/components/ui/Toast";
import type { OHLCVBar } from "@/lib/marketData";
import { getMarketStatus, isEquitySymbol, SUPPORTED_SYMBOLS } from "@/lib/marketData";
import { useUserStore } from "@/lib/store";
import { useSimulatorStore } from "@/lib/simulatorStore";

export default function SimulatorPage() {
  const { push } = useToast();
  const addXp = useUserStore((s) => s.addXp);
  const { balance, portfolio, tradeHistory, totalPnL, winRate, currentPrice, setPrice, resetFromMarket, openPosition, closePosition } =
    useSimulatorStore();
  const [symbol, setSymbol] = useState("RELIANCE");
  const [type, setType] = useState<"long" | "short">("long");
  const [quantity, setQuantity] = useState(1);
  const [stopLoss, setStopLoss] = useState(98);
  const [takeProfit, setTakeProfit] = useState(104);
  const [tab, setTab] = useState<"trade" | "scanner">("trade");
  const [bars, setBars] = useState<OHLCVBar[]>([]);
  const [marketLabel, setMarketLabel] = useState("");
  const [scanner, setScanner] = useState<Array<{ symbol: string; price: number; changePct: number; bars: OHLCVBar[]; volume: number }>>([]);

  const refreshPrice = useCallback(async () => {
    const res = await fetch(`/api/market/price?symbol=${encodeURIComponent(symbol)}`);
    const j = (await res.json()) as { price?: number; market?: { open: boolean; label: string; nextOpen?: string } };
    const p = typeof j.price === "number" ? j.price : currentPrice;
    setPrice(p);
    const st = j.market ?? getMarketStatus(symbol);
    const next = st.nextOpen ? ` · Next open ${new Date(st.nextOpen).toLocaleString()}` : "";
    setMarketLabel(`${st.label}${next}`);
  }, [currentPrice, setPrice, symbol]);

  const loadBars = useCallback(async () => {
    const res = await fetch(`/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=1day&limit=120`);
    const j = (await res.json()) as { bars?: OHLCVBar[] };
    const list = j.bars ?? [];
    setBars(list);
    if (list.length) {
      const closes = list.map((b) => b.close);
      resetFromMarket(closes[closes.length - 1], closes);
    }
  }, [resetFromMarket, symbol]);

  useEffect(() => {
    void loadBars();
    void refreshPrice();
  }, [loadBars, refreshPrice]);

  useEffect(() => {
    const t = window.setInterval(() => void refreshPrice(), 5000);
    return () => window.clearInterval(t);
  }, [refreshPrice]);

  useEffect(() => {
    const t = window.setInterval(() => {
      void (async () => {
        const res = await fetch(`/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=1min&limit=5`);
        const j = (await res.json()) as { bars?: OHLCVBar[] };
        const lastClose = j.bars?.length ? j.bars[j.bars.length - 1]!.close : useSimulatorStore.getState().currentPrice;
        setPrice(lastClose);
      })();
    }, 5000);
    return () => window.clearInterval(t);
  }, [setPrice, symbol]);

  useEffect(() => {
    setStopLoss(Number((currentPrice * 0.98).toFixed(2)));
    setTakeProfit(Number((currentPrice * 1.04).toFixed(2)));
  }, [currentPrice]);

  useEffect(() => {
    for (const p of portfolio) {
      const hitTp = p.type === "long" ? currentPrice >= p.takeProfit : currentPrice <= p.takeProfit;
      const hitSl = p.type === "long" ? currentPrice <= p.stopLoss : currentPrice >= p.stopLoss;
      if (hitTp || hitSl) {
        const closed = closePosition(p.id, currentPrice);
        if (closed) {
          addXp(hitTp ? 50 : 20, {
            reason: "simulator",
            idempotencyKey: `sim:${Date.now()}`,
          });
          push(
            hitTp
              ? `Take Profit hit! +₹${closed.realizedPnL.toFixed(2)} 🎯`
              : `Stop Loss hit. ₹${closed.realizedPnL.toFixed(2)} 🛡️`,
            hitTp ? "success" : "warning",
          );
        }
      }
    }
  }, [addXp, closePosition, currentPrice, portfolio, push]);

  const unrealized = useMemo(() => portfolio.reduce((sum, p) => sum + p.currentPnL, 0), [portfolio]);
  const risk = Math.abs((currentPrice - stopLoss) * quantity);
  const riskPct = (risk / balance) * 100;

  const loadScanner = useCallback(async () => {
    const top = SUPPORTED_SYMBOLS.slice(0, 8);
    const rows = await Promise.all(
      top.map(async (sym) => {
        const [pr, br] = await Promise.all([
          fetch(`/api/market/price?symbol=${encodeURIComponent(sym)}`).then((r) => r.json()),
          fetch(`/api/market/bars?symbol=${encodeURIComponent(sym)}&timeframe=1day&limit=20`).then((r) => r.json()),
        ]);
        const price = typeof pr.price === "number" ? pr.price : 0;
        const changePct = typeof pr.changePct === "number" ? pr.changePct : 0;
        const b = (br as { bars?: OHLCVBar[] }).bars ?? [];
        const vol = b.length ? b[b.length - 1]!.volume ?? 0 : 0;
        return { symbol: sym, price, changePct, bars: b, volume: Number(vol) };
      }),
    );
    setScanner(rows);
  }, []);

  useEffect(() => {
    if (tab !== "scanner") return;
    void loadScanner();
    const id = window.setInterval(() => void loadScanner(), 30000);
    return () => window.clearInterval(id);
  }, [loadScanner, tab]);

  const status = getMarketStatus(symbol);
  const equityOpen = isEquitySymbol(symbol) ? status.open : true;

  return (
    <main className="min-h-screen bg-background">
      <AppNav />
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setTab("trade")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${tab === "trade" ? "bg-accent text-slate-900" : "border border-border"}`}
          >
            Trading
          </button>
          <button
            type="button"
            onClick={() => setTab("scanner")}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${tab === "scanner" ? "bg-accent text-slate-900" : "border border-border"}`}
          >
            Market Scanner
          </button>
        </div>

        {tab === "scanner" ? (
          <div className="grid gap-3 md:grid-cols-2">
            {scanner.map((row) => (
              <div key={row.symbol} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{row.symbol}</p>
                  <p className={`text-sm font-medium ${row.changePct >= 0 ? "text-[#456DFF]" : "text-red-400"}`}>
                    {row.changePct >= 0 ? "+" : ""}
                    {row.changePct.toFixed(2)}%
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold">₹{row.price.toFixed(2)}</p>
                <p className="text-xs text-text-muted">Vol {row.volume ? row.volume.toLocaleString() : "—"}</p>
                <div className="mt-3 h-16">
                  <svg viewBox="0 0 100 32" className="h-full w-full">
                    {row.bars.map((b, i, arr) => {
                      if (!i) return null;
                      const x1 = ((i - 1) / Math.max(1, arr.length - 1)) * 90 + 5;
                      const x2 = (i / Math.max(1, arr.length - 1)) * 90 + 5;
                      const min = Math.min(...arr.map((x) => x.low));
                      const max = Math.max(...arr.map((x) => x.high));
                      const r = max - min || 1;
                      const y1 = 28 - ((arr[i - 1]!.close - min) / r) * 24;
                      const y2 = 28 - ((b.close - min) / r) * 24;
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={row.changePct >= 0 ? "#4ade80" : "#f87171"} strokeWidth="1.5" />;
                    })}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className={`mb-3 rounded-2xl border px-4 py-2 text-sm ${equityOpen ? "border-[#456DFF]/40 bg-[rgba(69,109,255,0.15)] text-[#88C9F7]" : "border-red-500/40 bg-red-500/10 text-red-300"}`}
            >
              {marketLabel || status.label}
            </div>
            <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-5">
              <Stat label="Account Balance" value={`₹${balance.toFixed(2)}`} />
              <Stat
                label="Unrealized P&L"
                value={`${unrealized >= 0 ? "+" : ""}₹${unrealized.toFixed(2)}`}
                positive={unrealized >= 0}
              />
              <Stat
                label="Total P&L"
                value={`${totalPnL >= 0 ? "+" : ""}₹${totalPnL.toFixed(2)}`}
                positive={totalPnL >= 0}
              />
              <Stat label="Win Rate" value={`${winRate}%`} />
              <Stat label="Trades" value={`${tradeHistory.length}`} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.4fr_0.6fr]">
              <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                <select
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                  }}
                  className="w-full rounded-2xl border border-border bg-surface2 px-3 py-3"
                >
                  {SUPPORTED_SYMBOLS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <p className="text-4xl font-bold">₹{currentPrice.toFixed(2)}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setType("long")} className={`rounded-2xl px-4 py-3 ${type === "long" ? "bg-accent text-slate-900" : "border border-border"}`}>
                    Long
                  </button>
                  <button type="button" onClick={() => setType("short")} className={`rounded-2xl px-4 py-3 ${type === "short" ? "bg-accent text-slate-900" : "border border-border"}`}>
                    Short
                  </button>
                </div>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-2xl border border-border bg-surface2 px-3 py-3" />
                <input type="number" value={stopLoss} onChange={(e) => setStopLoss(Number(e.target.value))} className="w-full rounded-2xl border border-border bg-surface2 px-3 py-3" />
                <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(Number(e.target.value))} className="w-full rounded-2xl border border-border bg-surface2 px-3 py-3" />
                <p className="text-sm text-text-muted">
                  You are risking ₹{risk.toFixed(2)} ({riskPct.toFixed(2)}% of account)
                </p>
                <button
                  type="button"
                  className="w-full rounded-2xl bg-accent px-6 py-3 font-semibold text-slate-900"
                  onClick={() => openPosition({ symbol, type, entryPrice: currentPrice, quantity, stopLoss, takeProfit })}
                >
                  Open {type === "long" ? "Long" : "Short"}
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="font-semibold">Live Chart (daily closes)</p>
                <div className="mt-3 h-72 rounded-2xl bg-surface2 p-3">
                  <svg viewBox="0 0 600 220" className="h-full w-full">
                    {bars.map((b, index, arr) => {
                      if (!index) return null;
                      const x1 = ((index - 1) / Math.max(1, arr.length - 1)) * 580 + 10;
                      const x2 = (index / Math.max(1, arr.length - 1)) * 580 + 10;
                      const min = Math.min(...arr.map((x) => x.low));
                      const max = Math.max(...arr.map((x) => x.high));
                      const r = max - min || 1;
                      const y1 = 200 - ((arr[index - 1]!.close - min) / r) * 180;
                      const y2 = 200 - ((b.close - min) / r) * 180;
                      return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#60A5FA" strokeWidth="2" />;
                    })}
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <h2 className="text-xl font-semibold">Open Positions</h2>
              <div className="mt-3 space-y-2">
                {portfolio.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface2 px-3 py-2">
                    <span>
                      {p.symbol} · {p.type} · {p.quantity}
                    </span>
                    <span className={p.currentPnL >= 0 ? "text-[#456DFF]" : "text-red-400"}>₹{p.currentPnL.toFixed(2)}</span>
                    <button type="button" className="rounded-2xl border border-border px-3 py-1" onClick={() => closePosition(p.id, currentPrice)}>
                      Close
                    </button>
                  </div>
                ))}
              </div>
              <h2 className="mt-5 text-xl font-semibold">Trade History</h2>
              <div className="mt-3 space-y-2">
                {tradeHistory.slice(0, 10).map((t) => (
                  <div key={t.id + t.closedAt} className="flex items-center justify-between rounded-2xl border border-border bg-surface2 px-3 py-2 text-sm">
                    <span>
                      {t.symbol} {t.type} ₹{t.entryPrice.toFixed(2)}→₹{t.exitPrice.toFixed(2)}
                    </span>
                    <span className={t.realizedPnL >= 0 ? "text-[#456DFF]" : "text-red-400"}>₹{t.realizedPnL.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`text-lg font-semibold ${positive == null ? "" : positive ? "text-[#456DFF]" : "text-red-400"}`}>{value}</p>
    </div>
  );
}
