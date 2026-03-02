import { useDensity } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useEffect, useRef, useState } from "react";
import { buildColorAxis, type ColorAxisConfig } from "./color-axis";
import { getDefaultOptions } from "./default-options";

export interface UseChartConfig {
  colorAxis?: ColorAxisConfig;
}

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
  config?: UseChartConfig,
  containerRef?: RefObject<HTMLElement | null>,
) => {
  const density = useDensity();
  const targetWindow = useWindow();

  const configRef = useRef(config);
  configRef.current = config;

  const colorAxisKey = JSON.stringify(config?.colorAxis);

  const [mergedOptions, setMergedOptions] = useState<Options>(() => {
    const defaults = getDefaultOptions(density);
    const colorAxisOptions = config?.colorAxis
      ? { colorAxis: buildColorAxis(config.colorAxis) }
      : {};
    return Highcharts.merge(defaults, colorAxisOptions, chartOptions);
  });

  useEffect(() => {
    const hostElement =
      containerRef?.current ??
      (chartRef.current?.chart as Highcharts.Chart | null)?.container ??
      targetWindow?.document?.documentElement ??
      null;

    const defaults = getDefaultOptions(density, hostElement);
    const currentConfig = configRef.current;
    const colorAxisOptions = currentConfig?.colorAxis
      ? { colorAxis: buildColorAxis(currentConfig.colorAxis, hostElement) }
      : {};

    setMergedOptions(
      Highcharts.merge(defaults, colorAxisOptions, chartOptions),
    );
  }, [
    density,
    chartOptions,
    targetWindow,
    chartRef,
    colorAxisKey,
    containerRef,
  ]);

  return mergedOptions;
};
