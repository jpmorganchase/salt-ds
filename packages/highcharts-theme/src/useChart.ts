import { useDensity, useTheme } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import highchartsThemeCss from "../index.css";
import { getDefaultOptions } from "./default-options";
import {
  getDensityTokenMap,
  type SaltChartTokenMap,
} from "./density-token-map";
import { applyFillPatternOverrides } from "./fill-patterns";

export interface UseChartConfig {
  fillPatterns?: boolean;
}

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
  { fillPatterns = false }: UseChartConfig = {},
) => {
  const density = useDensity();
  const { mode } = useTheme();
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-highcharts-theme",
    css: highchartsThemeCss,
    window: targetWindow,
  });

  const hostElementRef = useRef<Element | null>(null);

  const getMergedOptions = useCallback(
    (hostElement?: Element | null): Options => {
      const tokens: SaltChartTokenMap = getDensityTokenMap(
        density,
        hostElement ?? undefined,
      );
      const resolvedChartOptions = applyFillPatternOverrides(
        chartOptions,
        tokens,
        fillPatterns,
      );
      const defaults = getDefaultOptions(
        resolvedChartOptions,
        tokens,
        fillPatterns,
      );

      return Highcharts.merge(defaults, resolvedChartOptions);
    },
    [chartOptions, density, fillPatterns],
  );

  const [mergedOptions, setMergedOptions] = useState<Options>(() => {
    return getMergedOptions(targetWindow?.document?.documentElement);
  });

  useEffect(() => {
    // From v12 onwards, we can use CSS color variables directly in the Options object
    // which enable us to be reactive to theme changes without this extra step
    void mode;

    const chart = chartRef.current?.chart as Highcharts.Chart | null;
    const container = chart?.container ?? null;

    if (container) {
      hostElementRef.current = container;
    }

    const elementUsed =
      hostElementRef.current ?? targetWindow?.document?.documentElement;

    setMergedOptions(getMergedOptions(elementUsed));
  }, [chartRef, getMergedOptions, mode, targetWindow]);

  return mergedOptions;
};
