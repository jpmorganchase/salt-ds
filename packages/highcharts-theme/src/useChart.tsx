import { useDensity } from "@salt-ds/core";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useEffect, useMemo } from "react";
import { getDefaultOptions } from "./default-options";

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject>,
  chartOptions: Options,
) => {
  const density = useDensity();

  // biome-ignore lint/correctness/useExhaustiveDependencies: redraw on density change
  useEffect(() => {
    chartRef.current?.chart.redraw();
  }, [density]);

  return useMemo(() => {
    const defaultOptions = getDefaultOptions(density);
    return Highcharts.merge(defaultOptions, chartOptions);
  }, [density, chartOptions]);
};
