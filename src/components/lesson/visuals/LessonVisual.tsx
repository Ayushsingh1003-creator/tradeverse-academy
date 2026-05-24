"use client";

import type { VisualPage } from "@/types/lessonPage";

export type LessonVisualProps = {
  visualId: VisualPage["visualId"];
  /** When true, lesson footer Continue is hidden (hammer walkthrough in progress). */
  onHammerPlaybackActiveChange?: (active: boolean) => void;
};

import { AssetClassesIndia } from "@/components/lesson/visuals/AssetClassesIndia";
import { BidAskSpreadCostDemo } from "@/components/lesson/visuals/BidAskSpreadCostDemo";
import { BrokerCompare } from "@/components/lesson/visuals/BrokerCompare";
import { BullishVsBearish } from "@/components/lesson/visuals/BullishVsBearish";
import { CandleAnatomy } from "@/components/lesson/visuals/CandleAnatomy";
import { ChargesBreakdown } from "@/components/lesson/visuals/ChargesBreakdown";
import { DematAccountFlow } from "@/components/lesson/visuals/DematAccountFlow";
import { DojiExplainer } from "@/components/lesson/visuals/DojiExplainer";
import { EmotionalTrapsScene } from "@/components/lesson/visuals/EmotionalTrapsScene";
import { ExecutionSlippage } from "@/components/lesson/visuals/ExecutionSlippage";
import { FirstTradeWalkthrough } from "@/components/lesson/visuals/FirstTradeWalkthrough";
import { GuardrailsBoard } from "@/components/lesson/visuals/GuardrailsBoard";
import { HammerCandle } from "@/components/lesson/visuals/HammerCandle";
import { HammerVsShootingStar } from "@/components/lesson/visuals/HammerVsShootingStar";
import { IndianMarketsExplorer } from "@/components/lesson/visuals/IndianMarketsExplorer";
import { JournalDemo } from "@/components/lesson/visuals/JournalDemo";
import { LoseStatsVisual } from "@/components/lesson/visuals/LoseStatsVisual";
import { MarketAuctionDemo } from "@/components/lesson/visuals/MarketAuctionDemo";
import { MarketHoursClock } from "@/components/lesson/visuals/MarketHoursClock";
import { OrderTypesSimulator } from "@/components/lesson/visuals/OrderTypesSimulator";
import { ParticipantsIndia } from "@/components/lesson/visuals/ParticipantsIndia";
import { PositionSizingCalc } from "@/components/lesson/visuals/PositionSizingCalc";
import { PriceFormationDemo } from "@/components/lesson/visuals/PriceFormationDemo";
import { RRRatioVisual } from "@/components/lesson/visuals/RRRatioVisual";
import { StopLossDrill } from "@/components/lesson/visuals/StopLossDrill";
import { SupportResistanceMap } from "@/components/lesson/visuals/SupportResistanceMap";
import { TradeAnatomy } from "@/components/lesson/visuals/TradeAnatomy";
import { TrendLines } from "@/components/lesson/visuals/TrendLines";
import { WickExplainer } from "@/components/lesson/visuals/WickExplainer";

export function LessonVisual({ visualId, onHammerPlaybackActiveChange }: LessonVisualProps) {
  switch (visualId) {
    case "CandleAnatomy":
      return <CandleAnatomy />;
    case "BullishVsBearish":
      return <BullishVsBearish />;
    case "WickExplainer":
      return <WickExplainer />;
    case "DojiExplainer":
      return <DojiExplainer />;
    case "SupportResistanceMap":
      return <SupportResistanceMap />;
    case "TrendLines":
      return <TrendLines />;
    case "HammerCandle":
      return <HammerCandle onPlaybackActiveChange={onHammerPlaybackActiveChange} />;
    case "HammerVsShootingStar":
      return <HammerVsShootingStar />;
    // Financial Markets 101
    case "MarketAuctionDemo":
      return <MarketAuctionDemo />;
    case "ParticipantsIndia":
      return <ParticipantsIndia />;
    case "IndianMarketsExplorer":
      return <IndianMarketsExplorer />;
    case "MarketHoursClock":
      return <MarketHoursClock />;
    case "AssetClassesIndia":
      return <AssetClassesIndia />;
    case "PriceFormationDemo":
      return <PriceFormationDemo />;
    case "BidAskSpreadCostDemo":
      return <BidAskSpreadCostDemo />;
    // How to Actually Trade
    case "DematAccountFlow":
      return <DematAccountFlow />;
    case "BrokerCompare":
      return <BrokerCompare />;
    case "OrderTypesSimulator":
      return <OrderTypesSimulator />;
    case "TradeAnatomy":
      return <TradeAnatomy />;
    case "ChargesBreakdown":
      return <ChargesBreakdown />;
    case "ExecutionSlippage":
      return <ExecutionSlippage />;
    case "FirstTradeWalkthrough":
      return <FirstTradeWalkthrough />;
    // Risk & Trader Mindset
    case "LoseStatsVisual":
      return <LoseStatsVisual />;
    case "PositionSizingCalc":
      return <PositionSizingCalc />;
    case "StopLossDrill":
      return <StopLossDrill />;
    case "RRRatioVisual":
      return <RRRatioVisual />;
    case "JournalDemo":
      return <JournalDemo />;
    case "EmotionalTrapsScene":
      return <EmotionalTrapsScene />;
    case "GuardrailsBoard":
      return <GuardrailsBoard />;
    default:
      return null;
  }
}
