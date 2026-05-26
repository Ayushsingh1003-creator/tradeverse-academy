"use client";

import type { CandlestickData } from "lightweight-charts";
import { CandlestickSvg } from "@/components/lesson/CandlestickSvg";
import { TEACHING_CANDLES } from "@/lib/candleGeometry";
import { useEffect, useMemo, useState } from "react";
import { TradingChart } from "@/components/charts/TradingChart";
import { InteractiveChart } from "@/components/charts/InteractiveChart";
import { QuestionBlock } from "@/components/lesson/QuestionBlock";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { OHLCVBar } from "@/lib/marketData";
import { LessonBlockType } from "@/types/lesson";

function toCandles(rows: Array<{ time: string; open: number; high: number; low: number; close: number }>): CandlestickData[] {
  return rows.map((r) => ({
    time: (r.time.length >= 10 ? r.time.slice(0, 10) : r.time) as CandlestickData["time"],
    open: r.open,
    high: r.high,
    low: r.low,
    close: r.close,
  }));
}

export function LessonBlock({
  block,
  onCorrect,
}: {
  block: LessonBlockType;
  onCorrect: () => void;
}) {
  if (block.type === "heading") return <h2 className="text-2xl font-bold">{block.content}</h2>;
  if (block.type === "text") return <p className="text-text-muted">{block.content}</p>;
  if (block.type === "chart") return <LiveTradingChartBlock block={block} />;
  if (block.type === "question") return <QuestionBlock question={block} onCorrect={onCorrect} />;
  if (block.type === "fill_blank") return <FillBlankBlock block={block} onCorrect={onCorrect} />;
  if (block.type === "drag_label") return <DragLabelBlock block={block} onCorrect={onCorrect} />;
  if (block.type === "chart_pattern") return <ChartPatternBlock block={block} onCorrect={onCorrect} />;
  return null;
}

function FillBlankBlock({ block, onCorrect }: { block: Extract<LessonBlockType, { type: "fill_blank" }>; onCorrect: () => void }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const correct = checked && answer.trim().toLowerCase() === block.correctAnswer.trim().toLowerCase();

  return (
    <Card>
      <p className="mb-4 text-lg font-semibold">{block.sentence.replace("_____", "_____")}</p>
      <input
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder="Type your answer"
        className="w-full rounded-2xl border border-accent bg-surface2 px-4 py-3 outline-none ring-accent/40 focus:ring"
      />
      <Button
        className="mt-4"
        onClick={() => {
          setChecked(true);
          if (answer.trim().toLowerCase() === block.correctAnswer.trim().toLowerCase()) onCorrect();
        }}
      >
        Check Answer
      </Button>
      {checked ? (
        <div className={`mt-4 rounded-2xl border p-3 text-sm ${correct ? "border-[#456DFF]/50 bg-[rgba(69,109,255,0.15)]" : "border-red-500/50 bg-red-500/10"}`}>
          <p>{correct ? "Correct!" : "Not quite yet."}</p>
          <p className="mt-1 text-text-muted">{block.explanation}</p>
        </div>
      ) : null}
    </Card>
  );
}

function LiveTradingChartBlock({ block }: { block: Extract<LessonBlockType, { type: "chart" }> }) {
  const symbol = block.config?.symbol;
  const demoRows = useMemo(() => block.config?.data ?? [], [block]);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [series, setSeries] = useState<CandlestickData[] | undefined>(() => (demoRows.length ? toCandles(demoRows) : undefined));

  useEffect(() => {
    if (mode !== "real" || !symbol) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=1day&limit=80`);
      const json = (await res.json()) as { bars?: OHLCVBar[] };
      if (!cancelled && json.bars?.length) setSeries(toCandles(json.bars));
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, symbol]);

  useEffect(() => {
    if (mode === "demo" && demoRows.length) setSeries(toCandles(demoRows));
  }, [mode, demoRows]);

  if (!symbol) return <TradingChart data={demoRows.length ? toCandles(demoRows) : undefined} />;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-text-muted">Using:</span>
        <button
          type="button"
          onClick={() => setMode("demo")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "demo" ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
        >
          Demo data 🎲
        </button>
        <button
          type="button"
          onClick={() => setMode("real")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "real" ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
        >
          Real data 📡
        </button>
        {mode === "real" ? (
          <span className="rounded-full bg-[rgba(69,109,255,0.15)] px-2 py-0.5 text-xs font-medium text-[#456DFF]">Live data</span>
        ) : null}
      </div>
      <TradingChart data={series} />
    </div>
  );
}

function ChartPatternBlock({ block, onCorrect }: { block: Extract<LessonBlockType, { type: "chart_pattern" }>; onCorrect: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [mode, setMode] = useState<"demo" | "real">("demo");
  const [chartData, setChartData] = useState(block.chartData);
  const symbol = block.symbol;
  const tolerance = block.correctAnswer.tolerance ?? 1;
  const isCorrect = checked && picked != null && block.correctAnswer.price != null && Math.abs(picked - block.correctAnswer.price) <= tolerance;

  useEffect(() => {
    if (mode !== "real" || !symbol) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/market/bars?symbol=${encodeURIComponent(symbol)}&timeframe=1day&limit=80`);
      const json = (await res.json()) as { bars?: OHLCVBar[] };
      if (!cancelled && json.bars?.length) {
        setChartData(
          json.bars.map((b) => ({ time: b.time, open: b.open, high: b.high, low: b.low, close: b.close })),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, symbol]);

  useEffect(() => {
    if (mode === "demo") setChartData(block.chartData);
  }, [mode, block.chartData]);

  return (
    <Card>
      {symbol ? (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-muted">Using:</span>
          <button
            type="button"
            onClick={() => setMode("demo")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "demo" ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            Demo data 🎲
          </button>
          <button
            type="button"
            onClick={() => setMode("real")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${mode === "real" ? "bg-accent text-slate-900" : "border border-border bg-surface2"}`}
          >
            Real data 📡
          </button>
          {mode === "real" ? (
            <span className="rounded-full bg-[rgba(69,109,255,0.15)] px-2 py-0.5 text-xs font-medium text-[#456DFF]">Live data</span>
          ) : null}
          {mode === "real" ? (
            <p className="w-full text-xs text-amber-200/90">
              Lesson answer keys match demo candles — use Demo for scored checks, or explore live prices here.
            </p>
          ) : null}
        </div>
      ) : null}
      <InteractiveChart
        data={chartData}
        mode="click_to_identify"
        question={block.question}
        onCandleClick={(bar) => setPicked(bar.close)}
      />
      <p className="mt-2 text-sm text-text-muted">Selected close: {picked?.toFixed(2) ?? "None"}</p>
      <Button
        className="mt-3"
        onClick={() => {
          const nextCorrect = picked != null && block.correctAnswer.price != null && Math.abs(picked - block.correctAnswer.price) <= tolerance;
          setChecked(true);
          if (nextCorrect) onCorrect();
        }}
      >
        Check Pattern
      </Button>
      {checked ? <div className={`mt-3 rounded-2xl border p-3 text-sm ${isCorrect ? "border-[#456DFF]/50 bg-[rgba(69,109,255,0.15)]" : "border-red-500/50 bg-red-500/10"}`}>{block.explanation}</div> : null}
    </Card>
  );
}

function DragLabelBlock({ block, onCorrect }: { block: Extract<LessonBlockType, { type: "drag_label" }>; onCorrect: () => void }) {
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const results = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const zone of block.zones) {
      map[zone.id] = assigned[zone.id] === zone.label;
    }
    return map;
  }, [assigned, block.zones]);

  const onDrop = (zoneId: string, label: string) => {
    setAssigned((state) => ({ ...state, [zoneId]: label }));
  };

  const allCorrect = block.zones.every((zone) => assigned[zone.id] === zone.label);

  return (
    <Card>
      <p className="mb-4 text-lg font-semibold">{block.prompt}</p>
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          {block.labels.map((label) => (
            <div
              key={label}
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", label)}
              className="cursor-grab rounded-2xl border border-border bg-surface2 px-3 py-2 text-center"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border p-4">
          <svg viewBox="0 0 220 220" className="mx-auto h-56 w-56">
            <CandlestickSvg cx={110} bodyWidth={60} ohlc={TEACHING_CANDLES.lessonBlockBullish} bodyRx={8} wickWidth={3} />
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {block.zones.map((zone) => (
              <div
                key={zone.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onDrop(zone.id, event.dataTransfer.getData("text/plain"));
                }}
                className={`min-h-14 rounded-2xl border p-2 text-center text-sm ${
                  checked ? (results[zone.id] ? "border-[#456DFF]/60 bg-[rgba(69,109,255,0.15)]" : "border-red-500/60 bg-red-500/10") : "border-border bg-surface2"
                }`}
              >
                <p className="text-xs text-text-muted">{zone.title}</p>
                <p className="mt-1 font-semibold">{assigned[zone.id] ?? "Drop label"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={() => {
          setChecked(true);
          if (allCorrect) onCorrect();
        }}
      >
        Check
      </Button>
      {checked ? (
        <div className={`mt-4 rounded-2xl border p-3 text-sm ${allCorrect ? "border-[#456DFF]/50 bg-[rgba(69,109,255,0.15)]" : "border-red-500/50 bg-red-500/10"}`}>
          {allCorrect ? "Perfect placement." : "Review the candle anatomy and try again."} {block.explanation}
        </div>
      ) : null}
    </Card>
  );
}
