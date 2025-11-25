import { useDensity, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useMemo, useState } from "react";
import { getDefaultOptions } from "./default-options";
import { getDensityTokenMap, type TokenMap } from "./density-token-map";

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
) => {
  const density = useDensity();
  const targetWindow = useWindow();

  const [hostElement, setHostElement] = useState<Element | null>(null);

  // Initialize tokens with default values for the density (no DOM read yet)
  const [tokens, setTokens] = useState<TokenMap>(() =>
    getDensityTokenMap(density),
  );

  // Capture the chart's DOM container element once it's available
  useIsomorphicLayoutEffect(() => {
    const chart = chartRef.current?.chart as Highcharts.Chart | null;
    const container = chart?.container ?? null;
    if (container && hostElement == null) {
      setHostElement(container);
    }
  }, [chartRef, hostElement]);

  // Check for density or DOM context changes and update tokens if needed
  useIsomorphicLayoutEffect(() => {
    const element = hostElement ?? targetWindow?.document?.documentElement;
    const newTokens = getDensityTokenMap(density, element);

    // Shallow comparing to avoid unnecessary updates
    setTokens((prev) => {
      let changed = false;
      for (const key in newTokens) {
        if (prev[key as keyof TokenMap] !== newTokens[key as keyof TokenMap]) {
          changed = true;
          break;
        }
      }
      return changed ? newTokens : prev;
    });
  }, [density, hostElement, targetWindow]);

  const defaults = useMemo(
    () => getDefaultOptions(density, null, tokens),
    [density, tokens],
  );

  const mergedOptions = useMemo(
    () => Highcharts.merge(defaults, chartOptions),
    [defaults, chartOptions],
  );

  return mergedOptions;
};
