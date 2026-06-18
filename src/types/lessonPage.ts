/** Brilliant-style lesson page discriminated union */

export type LessonPageBase = { id: string };

/** Image slot — `alt` is the stable key; drop a PNG at the resolved path to swap art later. */
export type LessonImageRef = {
  alt: string;
  src?: string;
};

export type ImagePage = LessonPageBase &
  LessonImageRef & {
    type: "image";
    title?: string;
    caption?: string;
    /** Gamified section label, e.g. "Level 1 · Discovery" */
    badge?: string;
  };

export type PretestPage = LessonPageBase & {
  type: "pretest";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TextPage = LessonPageBase & {
  type: "text";
  title?: string;
  body: string;
  highlight?: string;
  image?: LessonImageRef;
  badge?: string;
};

export type VisualPage = LessonPageBase & {
  type: "visual";
  visualId:
    | "CandleAnatomy"
    | "BullishVsBearish"
    | "WickExplainer"
    | "DojiExplainer"
    | "SupportResistanceMap"
    | "TrendLines"
    | "HammerCandle"
    | "HammerVsShootingStar"
    // Financial Markets 101
    | "MarketAuctionDemo"
    | "ParticipantsIndia"
    | "IndianMarketsExplorer"
    | "MarketHoursClock"
    | "AssetClassesIndia"
    | "PriceFormationDemo"
    | "BidAskSpreadCostDemo"
    // How to Actually Trade
    | "DematAccountFlow"
    | "BrokerCompare"
    | "OrderTypesSimulator"
    | "TradeAnatomy"
    | "ChargesBreakdown"
    | "ExecutionSlippage"
    | "FirstTradeWalkthrough"
    // Risk & Trader Mindset
    | "LoseStatsVisual"
    | "PositionSizingCalc"
    | "StopLossDrill"
    | "RRRatioVisual"
    | "JournalDemo"
    | "EmotionalTrapsScene"
    | "GuardrailsBoard";
  caption?: string;
};

export type MultipleChoicePage = LessonPageBase & {
  type: "multiple_choice";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  showBearishCandle?: boolean;
  image?: LessonImageRef;
  challengeBadge?: string;
};

export type TrueFalsePage = LessonPageBase & {
  type: "true_false";
  statement: string;
  correct: boolean;
  explanation: string;
  image?: LessonImageRef;
  challengeBadge?: string;
};

export type FillBlankPage = LessonPageBase & {
  type: "fill_blank";
  sentence: string;
  correctAnswer: string;
  explanation: string;
  image?: LessonImageRef;
  challengeBadge?: string;
};

export type DragLabelPage = LessonPageBase & {
  type: "drag_label";
  instruction: string;
  labels: string[];
  zones: Array<{ id: string; title: string; correctLabel: string }>;
  /** Shown after Check when labels are wrong or as extra context when all correct */
  explanation?: string;
  image?: LessonImageRef;
  challengeBadge?: string;
};

export type ChartTapPage = LessonPageBase & {
  type: "chart_tap";
  question: string;
  correctCandleIndex: number;
  explanation: string;
  /** Which candle has distinctive shape (e.g. long lower wick) */
  highlightStyle?: "longLowerWick" | "shootingStar";
  candleCount?: number;
  image?: LessonImageRef;
  challengeBadge?: string;
};

/** Preset candle shapes for tap-to-pick visual quizzes */
export type CandleChoicePreset =
  | "bullish"
  | "bearish"
  | "doji"
  | "hammer"
  | "shootingStar"
  | "marubozuBull"
  | "marubozuBear";

export type VisualChoiceOption = {
  label: string;
  preset: CandleChoicePreset;
};

export type VisualChoicePage = LessonPageBase & {
  type: "visual_choice";
  question: string;
  options: VisualChoiceOption[];
  correctIndex: number;
  explanation: string;
  image?: LessonImageRef;
  challengeBadge?: string;
};

export type CalloutPage = LessonPageBase & {
  type: "callout";
  variant: "tip" | "warning" | "concept" | "rule";
  title: string;
  content: string;
  image?: LessonImageRef;
  badge?: string;
};

export type LessonPage =
  | PretestPage
  | TextPage
  | ImagePage
  | VisualPage
  | MultipleChoicePage
  | VisualChoicePage
  | TrueFalsePage
  | FillBlankPage
  | DragLabelPage
  | ChartTapPage
  | CalloutPage;

export type PracticeQuestion =
  | (Omit<MultipleChoicePage, "id" | "type"> & { id: string; type: "multiple_choice" })
  | (Omit<VisualChoicePage, "id" | "type"> & { id: string; type: "visual_choice" })
  | (Omit<TrueFalsePage, "id" | "type"> & { id: string; type: "true_false" })
  | (Omit<FillBlankPage, "id" | "type"> & { id: string; type: "fill_blank" })
  | (Omit<ChartTapPage, "id" | "type"> & { id: string; type: "chart_tap" })
  | (Omit<DragLabelPage, "id" | "type"> & { id: string; type: "drag_label" });
