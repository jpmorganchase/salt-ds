import type { Options } from "highcharts";
import Highcharts from "highcharts";

type AxisOptions = Options["xAxis"] | Options["yAxis"];

const mergeAxisOptions = (
  defaultAxis: AxisOptions,
  resolvedAxis: AxisOptions,
): AxisOptions => {
  if (resolvedAxis == null) {
    return defaultAxis;
  }

  const axisDefaults = Array.isArray(defaultAxis) ? defaultAxis[0] : defaultAxis;

  if (axisDefaults == null) {
    return resolvedAxis;
  }

  if (Array.isArray(resolvedAxis)) {
    // Highcharts does not reliably merge object axis defaults into axis arrays,
    // so we normalize each axis entry before the top-level merge instead.
    // See: https://github.com/highcharts/highcharts/issues/21155
    return resolvedAxis.map((axis) => Highcharts.merge(axisDefaults, axis));
  }

  return Highcharts.merge(axisDefaults, resolvedAxis);
};

export const mergeChartOptions = (
  defaultOptions: Options,
  resolvedOptions: Options,
): Options => {
  const {
    xAxis: defaultXAxis,
    yAxis: defaultYAxis,
    ...otherDefaultOptions
  } = defaultOptions;
  const {
    xAxis: resolvedXAxis,
    yAxis: resolvedYAxis,
    ...otherResolvedOptions
  } = resolvedOptions;

  return Highcharts.merge(otherDefaultOptions, otherResolvedOptions, {
    xAxis: mergeAxisOptions(defaultXAxis, resolvedXAxis),
    yAxis: mergeAxisOptions(defaultYAxis, resolvedYAxis),
  });
};
