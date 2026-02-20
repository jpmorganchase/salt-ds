import { useDensity } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useEffect, useRef, useState } from "react";
import { getDefaultOptions } from "./default-options";

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
) => {
  const density = useDensity();
  const targetWindow = useWindow();

  const hostElementRef = useRef<Element | null>(null);

  const [mergedOptions, setMergedOptions] = useState<Options>(() => {
    const defaults = getDefaultOptions(density);
    return Highcharts.merge(defaults, chartOptions);
  });

  useEffect(() => {
    const chart = chartRef.current?.chart as Highcharts.Chart | null;
    const container = chart?.container ?? null;

    if (container) {
      hostElementRef.current = container;
    }

    const elementUsed =
      hostElementRef.current ?? targetWindow?.document?.documentElement;

    const defaults = getDefaultOptions(density, elementUsed);

    setMergedOptions(Highcharts.merge(defaults, chartOptions));
  }, [density, chartOptions, targetWindow, chartRef]);

  return mergedOptions;
};
