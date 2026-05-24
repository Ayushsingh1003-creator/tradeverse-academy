"use client";

import { create } from "zustand";

export type Position = {
  id: string;
  symbol: string;
  type: "long" | "short";
  entryPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  openedAt: string;
  currentPnL: number;
};

type Trade = Position & { exitPrice: number; closedAt: string; realizedPnL: number };

type SimulatorState = {
  balance: number;
  portfolio: Position[];
  tradeHistory: Trade[];
  totalPnL: number;
  winRate: number;
  currentPrice: number;
  priceHistory: number[];
  setPrice: (price: number) => void;
  resetFromMarket: (price: number, history: number[]) => void;
  openPosition: (position: Omit<Position, "id" | "openedAt" | "currentPnL">) => void;
  closePosition: (id: string, exitPrice: number) => Trade | null;
};

const KEY = "tv_simulator_v1";

const defaultState = {
  balance: 10000,
  portfolio: [] as Position[],
  tradeHistory: [] as Trade[],
  totalPnL: 0,
  winRate: 0,
  currentPrice: 100,
  priceHistory: [100],
};

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  ...defaultState,
  setPrice: (price) => {
    set((state) => ({
      currentPrice: price,
      priceHistory: [...state.priceHistory.slice(-99), price],
      portfolio: state.portfolio.map((position) => {
        const pnl =
          position.type === "long"
            ? (price - position.entryPrice) * position.quantity
            : (position.entryPrice - price) * position.quantity;
        return { ...position, currentPnL: pnl };
      }),
    }));
  },
  resetFromMarket: (price, history) => {
    set((state) => ({
      currentPrice: price,
      priceHistory: history.length ? history.slice(-100) : [price],
      portfolio: state.portfolio.map((position) => {
        const pnl =
          position.type === "long"
            ? (price - position.entryPrice) * position.quantity
            : (position.entryPrice - price) * position.quantity;
        return { ...position, currentPnL: pnl };
      }),
    }));
  },
  openPosition: (position) => {
    set((state) => ({
      portfolio: [
        ...state.portfolio,
        {
          ...position,
          id: crypto.randomUUID(),
          openedAt: new Date().toISOString(),
          currentPnL: 0,
        },
      ],
    }));
  },
  closePosition: (id, exitPrice) => {
    const state = get();
    const position = state.portfolio.find((p) => p.id === id);
    if (!position) return null;
    const realizedPnL =
      position.type === "long"
        ? (exitPrice - position.entryPrice) * position.quantity
        : (position.entryPrice - exitPrice) * position.quantity;
    const trade: Trade = { ...position, exitPrice, closedAt: new Date().toISOString(), realizedPnL };

    const nextHistory = [trade, ...state.tradeHistory];
    const wins = nextHistory.filter((item) => item.realizedPnL > 0).length;
    set({
      portfolio: state.portfolio.filter((p) => p.id !== id),
      tradeHistory: nextHistory,
      balance: state.balance + realizedPnL,
      totalPnL: state.totalPnL + realizedPnL,
      winRate: nextHistory.length ? Math.round((wins / nextHistory.length) * 100) : 0,
    });
    return trade;
  },
}));

if (typeof window !== "undefined") {
  const raw = window.localStorage.getItem(KEY);
  if (raw) {
    try {
      useSimulatorStore.setState({ ...defaultState, ...JSON.parse(raw) });
    } catch {}
  }
  useSimulatorStore.subscribe((state) => {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  });
}
