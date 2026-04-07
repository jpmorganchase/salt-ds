import type { Density } from "@salt-ds/core";
import type { Options } from "highcharts";
import { getDensityTokenMap } from "./density-token-map";
import { getSentimentPatternColors } from "./patterns";

type FillPatternColor = ReturnType<typeof getSentimentPatternColors>["positive"];
type SentimentColor = FillPatternColor | string;
type SentimentColors = {
  negative: SentimentColor;
  neutral: SentimentColor;
  positive: SentimentColor;
};
type FillPatternPoint = Record<string, unknown> & {
  color?: SentimentColor;
  isIntermediateSum?: boolean;
  isSum?: boolean;
  y?: number;
};
type FillPatternSeries = NonNullable<Options["series"]>[number] & {
  data?: Array<unknown>;
  upColor?: SentimentColor;
  color?: SentimentColor;
};

const getSentimentColors = (
  density: Density,
  hostElement?: Element | null,
  fillPatterns = false,
): SentimentColors => {
  const tokens = getDensityTokenMap(density, hostElement ?? undefined);

  return fillPatterns
    ? getSentimentPatternColors(tokens)
    : {
        negative: tokens["--salt-sentiment-negative-dataviz"],
        neutral: tokens["--salt-sentiment-neutral-dataviz"],
        positive: tokens["--salt-sentiment-positive-dataviz"],
      };
};

const isPointOptionsObject = (
  point: unknown,
): point is FillPatternPoint =>
  typeof point === "object" && point !== null && !Array.isArray(point);

const applyWaterfallPointColors = (
  data: FillPatternSeries["data"],
  sentimentColors: SentimentColors,
): FillPatternSeries["data"] =>
  data?.map((point) => {
    if (!isPointOptionsObject(point) || point.color != null) {
      return point;
    }

    if (point.isSum || point.isIntermediateSum) {
      return {
        ...point,
        color: sentimentColors.neutral,
      };
    }

    if (typeof point.y === "number") {
      return {
        ...point,
        color: point.y < 0 ? sentimentColors.negative : sentimentColors.positive,
      };
    }

    return point;
  });

export const applyFillPatternOverrides = (
  chartOptions: Options,
  density: Density,
  hostElement?: Element | null,
  fillPatterns = false,
): Options => {
  const sentimentColors = getSentimentColors(
    density,
    hostElement,
    fillPatterns,
  );
  const nextSeries = chartOptions.series?.map((series) => {
    if (series.type !== "waterfall") {
      return series;
    }

    const nextWaterfallSeries = { ...series } as FillPatternSeries;

    if (nextWaterfallSeries.data != null) {
      nextWaterfallSeries.data = applyWaterfallPointColors(
        nextWaterfallSeries.data,
        sentimentColors,
      );
    }

    return nextWaterfallSeries;
  });

  return {
    ...chartOptions,
    plotOptions: {
      ...chartOptions.plotOptions,
      candlestick: {
        ...chartOptions.plotOptions?.candlestick,
        color:
          chartOptions.plotOptions?.candlestick?.color ??
          sentimentColors.negative,
        upColor:
          chartOptions.plotOptions?.candlestick?.upColor ??
          sentimentColors.positive,
      },
      waterfall: {
        ...chartOptions.plotOptions?.waterfall,
        color:
          chartOptions.plotOptions?.waterfall?.color ??
          sentimentColors.negative,
        upColor:
          chartOptions.plotOptions?.waterfall?.upColor ??
          sentimentColors.positive,
      },
    },
    series: nextSeries,
  };
};
