import { useDensity, useTheme } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import type { Options } from "highcharts";
import type HighchartsReact from "highcharts-react-official";
import { type RefObject, useCallback, useEffect, useState } from "react";
import { resolveSaltColorAxis, type SaltColorAxis } from "./color-axis";
import { getDefaultOptions } from "./default-options";
import {
  getDensityTokenMap,
  type SaltChartTokenMap,
} from "./density-token-map";
import { applyFillPatternOverrides } from "./fill-patterns";
import highchartsThemeCss from "./highcharts-theme.css";
import { mergeChartOptions } from "./merge-chart-options";

export interface UseChartConfig {
  fillPatterns?: boolean;
  saltColorAxis?: SaltColorAxis;
}

export const useChart = (
  chartRef: RefObject<HighchartsReact.RefObject | null>,
  chartOptions: Options,
  { fillPatterns = false, saltColorAxis }: UseChartConfig = {},
) => {
  const density = useDensity();

  const { mode, theme } = useTheme();
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "salt-highcharts-theme",
    css: highchartsThemeCss,
    window: targetWindow,
  });

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
      const chartOptionsWithColorAxis =
        resolvedChartOptions.colorAxis == null && saltColorAxis != null
          ? {
              ...resolvedChartOptions,
              colorAxis: resolveSaltColorAxis(saltColorAxis, tokens),
            }
          : resolvedChartOptions;
      const defaults = getDefaultOptions(
        chartOptionsWithColorAxis,
        tokens,
        fillPatterns,
      );

      return mergeChartOptions(defaults, chartOptionsWithColorAxis);
    },
    [chartOptions, density, fillPatterns, saltColorAxis],
  );

  const [mergedOptions, setMergedOptions] = useState<Options>(() => {
    return getMergedOptions(targetWindow?.document?.documentElement);
  });

  useEffect(() => {
    // From v12 onwards, we can use CSS color variables directly in the Options object
    // which enable us to be reactive to theme changes without this extra step
    void mode;
    void theme;

    const chart = chartRef.current?.chart as Highcharts.Chart | null;
    const container = chart?.container ?? null;

    const elementUsed = container ?? targetWindow?.document?.documentElement;

    setMergedOptions(getMergedOptions(elementUsed));
  }, [chartRef, getMergedOptions, mode, targetWindow, theme]);

  useEffect(() => {
    const fontFaceSet = targetWindow?.document?.fonts;

    // `document.fonts` is unavailable in non-DOM/legacy environments. When the
    // fonts are already loaded (warm navigations, or hosts that load the font
    // before the chart mounts) the first measurement is correct, so there is
    // nothing to re-layout
    if (!fontFaceSet || fontFaceSet.status === "loaded") {
      return;
    }

    let cancelled = false;

    void fontFaceSet.ready.then(() => {
      const chart = chartRef.current?.chart as Highcharts.Chart | undefined;
      const renderer = chart?.renderer as unknown as
        | { cache?: Record<string, unknown>; cacheKeys?: string[] }
        | undefined;

      if (cancelled || !chart || !renderer) {
        return;
      }

      // Highcharts caches SVG text bounding boxes on the renderer, but the
      // cache key (text + fontSize + fontWeight + width + rotation + align)
      // omits the font family. Any label measured before the web font finished
      // loading is therefore stored against fallback-font metrics and reused for
      // the life of the chart, leaving data labels (e.g. pie/donut connectors)
      // positioned as if the fallback font were still active. Clearing the cache
      // forces Highcharts to re-measure with the (now)loaded font - which is the same
      // thing an unmount/remount (e.g. navigating away and back) does implicitly
      renderer.cache = {};
      renderer.cacheKeys = [];

      // `setSize` with undefined dimensions preserves the current (responsive)
      // size while flagging the chart dirty, which forces every visible series -
      // and its data labels - to be re-rendered and re-measured.
      chart.setSize(undefined, undefined, false);
    });

    return () => {
      cancelled = true;
    };
  }, [chartRef, targetWindow]);

  return mergedOptions;
};
