import type { Density } from "@salt-ds/core";
import type { Options } from "highcharts";
import { getDensityTokenMap } from "./density-token-map";
import { saltPatternDef } from "./patterns";
import type { HighchartsOptionsCompat } from "./types";

export const getDefaultOptions = (
  density: Density,
  hostElement?: Element | null,
): Options => {
  const tokens = getDensityTokenMap(density, hostElement ?? undefined);

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
      symbolRadius: tokens["--salt-palette-corner-weaker"],
      itemMarginBottom: tokens["--salt-spacing-150"],
      margin: tokens["--salt-spacing-150"],
      y: tokens["--salt-spacing-200"] + tokens["--salt-size-icon"],
    },
    tooltip: {
      stickOnContact: true,
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false,
        },
      },
      area: {
        legendSymbol: "rectangle",
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
      bar: {
        borderRadius: 0,
      },
      column: {
        borderRadius: 0,
      },
      bullet: {
        borderRadius: 0,
      },
    },
  };

  return defaultOptions;
};
