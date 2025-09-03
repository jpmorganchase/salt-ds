import type { Density } from "@salt-ds/core";
import type { Options } from "highcharts";
import { getDensityTokenMap } from "./density-token-map";
import { saltPatternDef } from "./patterns";
import type { HighchartsOptionsCompat } from "./types";

export const getDefaultOptions = (density: Density): Options => {
  const tokens = getDensityTokenMap(density);

  const defaultOptions: HighchartsOptionsCompat = {
    chart: {
      styledMode: true,
      colorCount: 20,
    },
    defs: saltPatternDef,
    title: {
      margin: tokens["--salt-spacing-200"],
    },
    yAxis: {
      title: {
        margin: tokens["--salt-spacing-200"],
      },
    },
    xAxis: {
      title: {
        margin: tokens["--salt-spacing-200"],
      },
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "top",
      symbolWidth: tokens["--salt-size-icon"],
      symbolHeight: tokens["--salt-size-icon"],
      symbolRadius: 3,
      itemMarginBottom: tokens["--salt-spacing-150"],
      margin: tokens["--salt-spacing-150"],
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false,
        },
      },
      pie: {
        borderRadius: 0,
        dataLabels: {
          distance: 6,
          format:
            '{point.name} <span class="value">{point.percentage:.1f}%</span>',
          enabled: true,
        },
      },
      bullet: {
        borderRadius: 0,
      },
    },
  };

  return defaultOptions;
};
