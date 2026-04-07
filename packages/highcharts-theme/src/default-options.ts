import type { Density } from "@salt-ds/core";
import type { Options } from "highcharts";
import { getDensityTokenMap } from "./density-token-map";
import { getFillPatternColors } from "./patterns";
import {
  buildAxisOptions,
  buildChartOptions,
  buildLegendOptions,
  buildPlotOptions,
  buildSeriesPalette,
  buildTextOptions,
  buildTooltipOptions,
} from "./theme-option-builders";
import type { HighchartsOptionsCompat } from "./types";

export const getDefaultOptions = (
  density: Density,
  chartOptions: Options,
  hostElement?: Element | null,
  fillPatterns = false,
): Options => {
  const tokens = getDensityTokenMap(density, hostElement ?? undefined);
  const textOptions = buildTextOptions(tokens);
  const axisOptions = buildAxisOptions(tokens, chartOptions);

  const defaultOptions: HighchartsOptionsCompat = {
    chart: buildChartOptions(tokens),
    colors: fillPatterns
      ? getFillPatternColors(tokens)
      : buildSeriesPalette(tokens).colors,
    legend: buildLegendOptions(tokens),
    plotOptions: buildPlotOptions(tokens),
    subtitle: textOptions.subtitle,
    title: textOptions.title,
    tooltip: buildTooltipOptions(tokens),
    xAxis: axisOptions.xAxis,
    yAxis: axisOptions.yAxis,
  };

  return defaultOptions;
};
