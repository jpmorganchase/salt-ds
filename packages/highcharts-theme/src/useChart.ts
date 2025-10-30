import { useDensity, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import Highcharts from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useState } from "react";
import { getDefaultOptions } from "./default-options";

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
) => {
  const density = useDensity();
  const targetWindow = useWindow();

  const [hostElement, setHostElement] = useState<Element | null>(null);
  /* Lazily compute a baseline merged options once at mount.
   Why:
    - Before the chart container exists we cannot read DOM-scoped CSS vars for density.
    - Doing a deep merge during render on every pass allocates and can trigger spurious chart.update calls.
    - We recompute in a layout effect once the container is known to read DOM tokens and update before paint,
      avoiding density flicker and keeping the options object stable between renders.
  */
  const [mergedOptions, setMergedOptions] = useState<Options>(() => {
    const defaults = getDefaultOptions(density);
    return Highcharts.merge(defaults, chartOptions);
  });

  // First effect: Capture the chart's DOM container element once it's available
  // Needed to read CSS custom properties from the actual DOM element
  useIsomorphicLayoutEffect(() => {
    const chart = chartRef.current?.chart as Highcharts.Chart | null;
    const container = chart?.container ?? null;
    if (container && hostElement == null) {
      setHostElement(container);
    }
  }, [chartRef, hostElement]);

  // Second effect: Recompute chart options when density or DOM context changes
  // Ensures density tokens are read after DOM classes are applied
  useIsomorphicLayoutEffect(() => {
    const defaults = getDefaultOptions(
      density,
      hostElement ?? targetWindow?.document?.documentElement,
    );
    setMergedOptions(Highcharts.merge(defaults, chartOptions));
  }, [density, hostElement, chartOptions, targetWindow]);

  return mergedOptions;
};
