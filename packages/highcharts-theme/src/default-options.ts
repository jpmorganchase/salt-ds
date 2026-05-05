import type { Options } from "highcharts";
import type { SaltChartTokenMap } from "./density-token-map";
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
  chartOptions: Options,
  tokens: SaltChartTokenMap,
  fillPatterns = false,
): Options => {
  const textOptions = buildTextOptions(tokens);
  const axisOptions = buildAxisOptions(tokens, chartOptions);

  const defaultOptions: HighchartsOptionsCompat = {
    chart: buildChartOptions(tokens),
    colors: fillPatterns
      ? getFillPatternColors(tokens)
      : buildSeriesPalette(tokens).colors,
    legend: buildLegendOptions(tokens),
    plotOptions: buildPlotOptions(tokens, fillPatterns),
    subtitle: textOptions.subtitle,
    title: textOptions.title,
    tooltip: buildTooltipOptions(),
    xAxis: axisOptions.xAxis,
    yAxis: axisOptions.yAxis,
  };

  return defaultOptions;
};
