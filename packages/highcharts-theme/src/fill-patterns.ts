import Highcharts, { type Options } from "highcharts";
import { TRANSLUCENT_FILL_OPACITY } from "./constants";
import {
  CATEGORY_DATAVIZ_TOKENS,
  type SaltChartTokenMap,
} from "./density-token-map";
import { getFillPatternColor, getSentimentPatternColors } from "./patterns";

type FillPatternColor = ReturnType<
  typeof getSentimentPatternColors
>["positive"];

type SeriesColor = NonNullable<Options["colors"]>[number];
type SentimentColor = FillPatternColor | string;

type SentimentColors = {
  negative: SentimentColor;
  neutral: SentimentColor;
  positive: SentimentColor;
};

type ScatterMarkerOptions = Record<string, unknown> & {
  fillColor?: SeriesColor;
  lineColor?: string;
  lineWidth?: number;
  states?: Record<string, unknown> & {
    hover?: Record<string, unknown> & {
      lineWidthPlus?: number;
    };
  };
};

type FillPatternPoint = Record<string, unknown> & {
  color?: SentimentColor;
  isIntermediateSum?: boolean;
  isSum?: boolean;
  y?: number;
};

type FillPatternSeries = NonNullable<Options["series"]>[number] & {
  data?: Array<unknown>;
  fillColor?: SeriesColor;
  lineColor?: SeriesColor;
  marker?: ScatterMarkerOptions;
  upColor?: SentimentColor;
  color?: SentimentColor | string;
  stemColor?: SeriesColor;
  whiskerColor?: SeriesColor;
};

type FillPatternPlotOptions = NonNullable<Options["plotOptions"]> & {
  area?: Record<string, unknown> & {
    fillColor?: SeriesColor;
    lineColor?: SeriesColor;
  };
  boxplot?: Record<string, unknown> & {
    color?: SeriesColor;
    fillColor?: SeriesColor;
    stemColor?: SeriesColor;
    whiskerColor?: SeriesColor;
  };
  bubble?: Record<string, unknown> & {
    marker?: ScatterMarkerOptions;
  };
  scatter?: Record<string, unknown> & {
    marker?: ScatterMarkerOptions;
  };
  series?: Record<string, unknown> & {
    color?: SeriesColor;
    fillColor?: SeriesColor;
    lineColor?: SeriesColor;
    marker?: ScatterMarkerOptions;
  };
};

const getSentimentColors = (
  tokens: SaltChartTokenMap,
  fillPatterns = false,
): SentimentColors => {
  return fillPatterns
    ? getSentimentPatternColors(tokens)
    : {
        negative: tokens["--salt-sentiment-negative-dataviz"],
        neutral: tokens["--salt-sentiment-neutral-dataviz"],
        positive: tokens["--salt-sentiment-positive-dataviz"],
      };
};

const isPointOptionsObject = (point: unknown): point is FillPatternPoint =>
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
        color:
          point.y < 0 ? sentimentColors.negative : sentimentColors.positive,
      };
    }

    return point;
  });

const getScatterSeriesStrokeColor = (
  tokens: SaltChartTokenMap,
  series: FillPatternSeries,
  seriesIndex: number,
): string =>
  typeof series.color === "string"
    ? series.color
    : tokens[
        CATEGORY_DATAVIZ_TOKENS[seriesIndex % CATEGORY_DATAVIZ_TOKENS.length]
      ];

const getBoxPlotSeriesStrokeColor = (
  chartOptions: Options,
  tokens: SaltChartTokenMap,
  series: FillPatternSeries,
  seriesIndex: number,
): string | undefined => {
  if (typeof series.color === "string") {
    return series.color;
  }

  if (series.color != null) {
    return undefined;
  }

  const plotOptions = getPlotOptions(chartOptions);
  const boxPlotColor = plotOptions?.boxplot?.color;

  if (typeof boxPlotColor === "string") {
    return boxPlotColor;
  }

  if (boxPlotColor != null) {
    return undefined;
  }

  const sharedSeriesColor = plotOptions?.series?.color;

  if (typeof sharedSeriesColor === "string") {
    return sharedSeriesColor;
  }

  if (sharedSeriesColor != null) {
    return undefined;
  }

  return tokens[
    CATEGORY_DATAVIZ_TOKENS[seriesIndex % CATEGORY_DATAVIZ_TOKENS.length]
  ];
};

const getTranslucentSeriesFillColor = (
  strokeColor: string,
): SeriesColor | undefined =>
  Highcharts.color(strokeColor)
    ?.setOpacity(TRANSLUCENT_FILL_OPACITY)
    .get("rgba");

const getSeriesType = (
  chartOptions: Options,
  series: FillPatternSeries,
): string | undefined => series.type ?? chartOptions.chart?.type;

const getPlotOptions = (
  chartOptions: Options,
): FillPatternPlotOptions | undefined =>
  chartOptions.plotOptions as FillPatternPlotOptions | undefined;

const hasAreaFillColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.area?.fillColor != null ||
    plotOptions?.series?.fillColor != null
  );
};

const hasAreaLineColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.area?.lineColor != null ||
    plotOptions?.series?.lineColor != null
  );
};

const hasBoxPlotFillColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.boxplot?.fillColor != null ||
    plotOptions?.series?.fillColor != null
  );
};

const hasBoxPlotColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.boxplot?.color != null || plotOptions?.series?.color != null
  );
};

const hasBoxPlotStemColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.boxplot?.stemColor != null ||
    plotOptions?.boxplot?.color != null ||
    plotOptions?.series?.color != null
  );
};

const hasBoxPlotWhiskerColorOverride = (chartOptions: Options): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  return (
    plotOptions?.boxplot?.whiskerColor != null ||
    plotOptions?.boxplot?.color != null ||
    plotOptions?.series?.color != null
  );
};

const hasSeriesMarkerFillColorOverride = (
  chartOptions: Options,
  seriesType: "bubble" | "scatter",
): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  if (seriesType === "bubble") {
    return (
      plotOptions?.bubble?.marker?.fillColor != null ||
      plotOptions?.series?.marker?.fillColor != null
    );
  }

  return (
    plotOptions?.scatter?.marker?.fillColor != null ||
    plotOptions?.series?.marker?.fillColor != null
  );
};

const hasSeriesMarkerLineColorOverride = (
  chartOptions: Options,
  seriesType: "bubble" | "scatter",
): boolean => {
  const plotOptions = getPlotOptions(chartOptions);

  if (seriesType === "bubble") {
    return (
      plotOptions?.bubble?.marker?.lineColor != null ||
      plotOptions?.series?.marker?.lineColor != null
    );
  }

  return (
    plotOptions?.scatter?.marker?.lineColor != null ||
    plotOptions?.series?.marker?.lineColor != null
  );
};

export const applyFillPatternOverrides = (
  chartOptions: Options,
  tokens: SaltChartTokenMap,
  fillPatterns = false,
): Options => {
  const sentimentColors = getSentimentColors(tokens, fillPatterns);

  const nextSeries = chartOptions.series?.map((series, seriesIndex) => {
    const seriesType = getSeriesType(chartOptions, series as FillPatternSeries);

    if (seriesType === "waterfall") {
      const nextWaterfallSeries = { ...series } as FillPatternSeries;

      if (nextWaterfallSeries.data != null) {
        nextWaterfallSeries.data = applyWaterfallPointColors(
          nextWaterfallSeries.data,
          sentimentColors,
        );
      }

      return nextWaterfallSeries;
    }

    if (seriesType === "area") {
      const nextAreaSeries = { ...series } as FillPatternSeries;
      const strokeColor = getScatterSeriesStrokeColor(
        tokens,
        nextAreaSeries,
        seriesIndex,
      );

      if (
        nextAreaSeries.fillColor == null &&
        !hasAreaFillColorOverride(chartOptions)
      ) {
        nextAreaSeries.fillColor = fillPatterns
          ? getFillPatternColor(tokens, seriesIndex, TRANSLUCENT_FILL_OPACITY)
          : getTranslucentSeriesFillColor(strokeColor);
      }

      if (
        nextAreaSeries.lineColor == null &&
        !hasAreaLineColorOverride(chartOptions)
      ) {
        nextAreaSeries.lineColor = strokeColor;
      }

      return nextAreaSeries;
    }

    if (seriesType === "boxplot") {
      const nextBoxPlotSeries = { ...series } as FillPatternSeries;
      const strokeColor = getBoxPlotSeriesStrokeColor(
        chartOptions,
        tokens,
        nextBoxPlotSeries,
        seriesIndex,
      );
      const hasSeriesColorOverride = nextBoxPlotSeries.color != null;

      if (
        strokeColor !== undefined &&
        nextBoxPlotSeries.fillColor == null &&
        !hasBoxPlotFillColorOverride(chartOptions)
      ) {
        nextBoxPlotSeries.fillColor = fillPatterns
          ? getFillPatternColor(tokens, seriesIndex, TRANSLUCENT_FILL_OPACITY)
          : getTranslucentSeriesFillColor(strokeColor);
      }

      if (
        strokeColor !== undefined &&
        nextBoxPlotSeries.color == null &&
        !hasBoxPlotColorOverride(chartOptions)
      ) {
        nextBoxPlotSeries.color = strokeColor;
      }

      if (
        strokeColor !== undefined &&
        nextBoxPlotSeries.stemColor == null &&
        !hasSeriesColorOverride &&
        !hasBoxPlotStemColorOverride(chartOptions)
      ) {
        nextBoxPlotSeries.stemColor = strokeColor;
      }

      if (
        strokeColor !== undefined &&
        nextBoxPlotSeries.whiskerColor == null &&
        !hasSeriesColorOverride &&
        !hasBoxPlotWhiskerColorOverride(chartOptions)
      ) {
        nextBoxPlotSeries.whiskerColor = strokeColor;
      }

      return nextBoxPlotSeries;
    }

    if (seriesType === "bubble") {
      const nextBubbleSeries = { ...series } as FillPatternSeries;
      const strokeColor = getScatterSeriesStrokeColor(
        tokens,
        nextBubbleSeries,
        seriesIndex,
      );
      const markerFillColor =
        nextBubbleSeries.marker?.fillColor ??
        (hasSeriesMarkerFillColorOverride(chartOptions, "bubble")
          ? undefined
          : fillPatterns
            ? getFillPatternColor(tokens, seriesIndex, TRANSLUCENT_FILL_OPACITY)
            : getTranslucentSeriesFillColor(strokeColor));

      nextBubbleSeries.marker = {
        ...nextBubbleSeries.marker,
        ...(markerFillColor !== undefined
          ? { fillColor: markerFillColor }
          : {}),
        lineColor:
          nextBubbleSeries.marker?.lineColor ??
          (hasSeriesMarkerLineColorOverride(chartOptions, "bubble")
            ? undefined
            : strokeColor),
      };

      return nextBubbleSeries;
    }

    // We need to do this because oddly, scatter does not have a fillOpacity option
    if (seriesType === "scatter") {
      const nextScatterSeries = { ...series } as FillPatternSeries;
      const markerStates = nextScatterSeries.marker?.states;
      const hoverMarkerState = markerStates?.hover;
      const strokeColor = getScatterSeriesStrokeColor(
        tokens,
        nextScatterSeries,
        seriesIndex,
      );
      const markerFillColor =
        nextScatterSeries.marker?.fillColor ??
        (hasSeriesMarkerFillColorOverride(chartOptions, "scatter")
          ? undefined
          : fillPatterns
            ? getFillPatternColor(tokens, seriesIndex, TRANSLUCENT_FILL_OPACITY)
            : getTranslucentSeriesFillColor(strokeColor));

      nextScatterSeries.marker = {
        ...nextScatterSeries.marker,
        ...(markerFillColor !== undefined
          ? { fillColor: markerFillColor }
          : {}),
        lineColor:
          nextScatterSeries.marker?.lineColor ??
          (hasSeriesMarkerLineColorOverride(chartOptions, "scatter")
            ? undefined
            : strokeColor),
        lineWidth: nextScatterSeries.marker?.lineWidth ?? 1,
        states: {
          ...markerStates,
          hover: {
            ...hoverMarkerState,
            lineWidthPlus: hoverMarkerState?.lineWidthPlus ?? 0,
          },
        },
      };

      return nextScatterSeries;
    }

    return series;
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
