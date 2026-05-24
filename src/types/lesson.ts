export type LessonQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type FillBlankQuestion = {
  sentence: string;
  correctAnswer: string;
  explanation: string;
};

export type DragLabelQuestion = {
  prompt: string;
  labels: string[];
  zones: Array<{ id: "above_body" | "below_body" | "top_wick" | "bottom_wick"; label: string; title: string }>;
  explanation: string;
};

export type ChartPatternQuestion = {
  question: string;
  chartData: Array<{ time: string; open: number; high: number; low: number; close: number }>;
  /** When set, lesson charts can load Polygon OHLCV for "Real data" mode */
  symbol?: string;
  mode: "click_candle" | "draw_line" | "click_zone";
  correctAnswer: { price?: number; candleIndex?: number; tolerance?: number };
  explanation: string;
};

export type LessonBlockType =
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | {
      type: "chart";
      config?: {
        data?: Array<{ time: string; open: number; high: number; low: number; close: number }>;
        symbol?: string;
      };
    }
  | ({ type: "question" } & LessonQuestion)
  | ({ type: "fill_blank" } & FillBlankQuestion)
  | ({ type: "drag_label" } & DragLabelQuestion)
  | ({ type: "chart_pattern" } & ChartPatternQuestion);
