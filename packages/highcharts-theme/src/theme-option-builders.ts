import type { Options } from "highcharts";
import { TRANSLUCENT_FILL_OPACITY } from "./constants";
import {
  CATEGORY_DATAVIZ_TOKENS,
  type SaltChartTokenMap,
} from "./density-token-map";
import type {
  HighchartsOptionsCompat,
  HighchartsSeriesOptionsCompat,
} from "./types";

const AXES_GRID_LINE_SERIES_TYPES = new Set(["bubble", "scatter"]);

const getSeriesType = (
  series: HighchartsSeriesOptionsCompat,
): string | undefined =>
  typeof series.type === "string" ? series.type : undefined;

const shouldShowAxesGridLines = (chartOptions: Options): boolean => {
  if (
    chartOptions.chart?.type &&
    AXES_GRID_LINE_SERIES_TYPES.has(chartOptions.chart.type)
  ) {
    return true;
  }

  return ((chartOptions.series ?? []) as HighchartsSeriesOptionsCompat[]).some(
    (series) => {
      const seriesType = getSeriesType(series);

      return seriesType ? AXES_GRID_LINE_SERIES_TYPES.has(seriesType) : false;
    },
  );
};

const isHeatmapChart = (chartOptions: Options): boolean => {
  const chartType = chartOptions.chart?.type;
  const series = (chartOptions.series ?? []) as HighchartsSeriesOptionsCompat[];

  if (chartType === "heatmap") {
    return series.every(
      (entry) =>
        getSeriesType(entry) == null || getSeriesType(entry) === "heatmap",
    );
  }

  return (
    series.length > 0 &&
    series.every((entry) => getSeriesType(entry) === "heatmap")
  );
};

export const buildChartOptions = (
  tokens: SaltChartTokenMap,
): NonNullable<HighchartsOptionsCompat["chart"]> => ({
  backgroundColor: tokens["--salt-container-primary-background"],
  colorCount: 20,
  style: {
    fontFamily: tokens["--salt-text-fontFamily"],
  },
});

export const buildTextOptions = (
  tokens: SaltChartTokenMap,
): Pick<HighchartsOptionsCompat, "title" | "subtitle"> => ({
  title: {
    margin: tokens["--salt-spacing-200"],
    style: {
      color: tokens["--salt-content-primary-foreground"],
      fontFamily: tokens["--salt-text-h4-fontFamily"],
      fontSize: tokens["--salt-text-h4-fontSize"],
      fontWeight: tokens["--salt-text-h4-fontWeight"],
      lineHeight: tokens["--salt-text-h4-lineHeight"],
    },
  },
  subtitle: {
    style: {
      color: tokens["--salt-content-secondary-foreground"],
      fontFamily: tokens["--salt-text-label-fontFamily"],
      fontSize: tokens["--salt-text-label-fontSize"],
      lineHeight: tokens["--salt-text-label-lineHeight"],
    },
  },
});

export const buildAxisOptions = (
  tokens: SaltChartTokenMap,
  chartOptions: Options,
): Pick<HighchartsOptionsCompat, "xAxis" | "yAxis"> => {
  const showAxesGridLines = shouldShowAxesGridLines(chartOptions);
  const heatmapChart = isHeatmapChart(chartOptions);

  return {
    xAxis: {
      gridLineColor: tokens["--salt-separable-tertiary-borderColor"],
      gridLineWidth: showAxesGridLines ? tokens["--salt-size-fixed-100"] : 0,
      labels: {
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
      lineColor: tokens["--salt-separable-primary-borderColor"],
      lineWidth: heatmapChart ? 0 : tokens["--salt-size-fixed-100"],
      tickLength: 0,
      title: {
        margin: tokens["--salt-spacing-200"],
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
    },
    yAxis: {
      gridLineColor: tokens["--salt-separable-tertiary-borderColor"],
      gridLineWidth: heatmapChart ? 0 : tokens["--salt-size-fixed-100"],
      labels: {
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
      lineColor: tokens["--salt-separable-primary-borderColor"],
      lineWidth: heatmapChart
        ? 0
        : showAxesGridLines
          ? tokens["--salt-size-fixed-100"]
          : 0,
      title: {
        margin: tokens["--salt-spacing-200"],
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
    },
  };
};

export const buildLegendOptions = (
  tokens: SaltChartTokenMap,
): NonNullable<HighchartsOptionsCompat["legend"]> => ({
  align: "right",
  itemHoverStyle: {
    color: tokens["--salt-content-secondary-foreground"],
  },
  itemMarginBottom: tokens["--salt-spacing-150"],
  itemStyle: {
    color: tokens["--salt-content-secondary-foreground"],
    fontFamily: tokens["--salt-text-label-fontFamily"],
    fontSize: tokens["--salt-text-label-fontSize"],
    fontWeight: tokens["--salt-text-label-fontWeight"],
    lineHeight: tokens["--salt-text-label-lineHeight"],
  },
  layout: "vertical",
  margin: tokens["--salt-spacing-150"],
  navigation: {
    activeColor: tokens["--salt-content-secondary-foreground"],
    inactiveColor: tokens["--salt-content-secondary-foreground-disabled"],
    style: {
      color: tokens["--salt-content-secondary-foreground"],
      fontFamily: tokens["--salt-text-label-fontFamily"],
      fontSize: tokens["--salt-text-label-fontSize"],
      fontWeight: tokens["--salt-text-label-fontWeight"],
      lineHeight: tokens["--salt-text-label-lineHeight"],
    },
  },
  symbolHeight: tokens["--salt-size-icon"],
  symbolRadius: tokens["--salt-palette-corner-weaker"],
  symbolWidth: tokens["--salt-size-icon"],
  verticalAlign: "top",
  y: tokens["--salt-spacing-200"] + tokens["--salt-size-icon"],
});

// For consistency, despite being able to in-line this
export const buildTooltipOptions = (): NonNullable<
  HighchartsOptionsCompat["tooltip"]
> => ({
  stickOnContact: true,
});

export const buildPlotOptions = (
  tokens: SaltChartTokenMap,
  fillPatterns = false,
): NonNullable<HighchartsOptionsCompat["plotOptions"]> => {
  /* 
    Highcharts doesn’t apply dataLabels.style.textOutline through its normal SVG/CSS styling path -
    internally, SVGElement.css() strips out textOutline and then SVGElement.applyTextOutline() parses the string and writes the
    outline color directly onto cloned SVG <tspan> nodes as fill/stroke attributes. This means our CSS variable references do
    not resolve here properly.

    The `contrast` value returns #000000 just so happens to match the value we want
  */
  const strongTextOutline = `${tokens["--salt-size-fixed-100"]}px contrast`;
  const textOutline = fillPatterns ? strongTextOutline : "none";

  return {
    area: {
      dataLabels: {
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
      legendSymbol: "rectangle",
      marker: {
        lineColor: tokens["--salt-content-bold-foreground"],
      },
      states: {
        hover: {
          halo: {
            size: 0,
          },
        },
      },
    },
    bar: {
      borderColor: tokens["--salt-container-primary-background"],
      borderRadius: 0,
      borderWidth: tokens["--salt-size-fixed-100"],
    },
    boxplot: {
      lineWidth: tokens["--salt-size-fixed-200"],
      medianColor: tokens["--salt-content-primary-foreground"],
    },
    bubble: {
      dataLabels: {
        style: {
          color: tokens["--salt-content-bold-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight-strong"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
          textOutline,
        },
      },
      marker: {
        fillOpacity: TRANSLUCENT_FILL_OPACITY,
        lineWidth: 1,
        states: {
          hover: {
            lineWidthPlus: 0,
          },
        },
      },
      states: {
        hover: {
          halo: {
            size: 0,
          },
        },
      },
    },
    bullet: {
      borderRadius: 0,
      borderWidth: 0,
    },
    candlestick: {
      color: tokens["--salt-sentiment-negative-dataviz"],
      lineWidth: tokens["--salt-size-fixed-100"],
      lineColor: tokens["--salt-sentiment-negative-dataviz"],
      states: {
        hover: {
          lineWidth: tokens["--salt-size-fixed-100"],
        },
      },
      upColor: tokens["--salt-sentiment-positive-dataviz"],
      upLineColor: tokens["--salt-sentiment-positive-dataviz"],
    },
    column: {
      borderColor: tokens["--salt-container-primary-background"],
      borderRadius: 0,
      borderWidth: tokens["--salt-size-fixed-100"],
      states: {
        hover: {
          brightness: 0,
        },
      },
    },
    heatmap: {
      borderColor: tokens["--salt-container-primary-background"],
      pointPadding: 0,
      dataLabels: {
        style: {
          color: tokens["--salt-content-bold-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight-strong"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
          textOutline: strongTextOutline,
        },
      },
      states: {
        hover: {
          enabled: false,
        },
      },
    },
    line: {
      ...(fillPatterns
        ? {
            lineWidth: tokens["--salt-size-fixed-200"],
            linecap: "butt" as const,
          }
        : {}),
      marker: {
        enabled: false,
      },
      states: {
        hover: {
          halo: {
            size: 0,
          },
        },
      },
    },
    pie: {
      borderColor: tokens["--salt-container-primary-background"],
      borderRadius: 0,
      borderWidth: tokens["--salt-size-fixed-100"],
      dataLabels: {
        distance: 6,
        enabled: true,
        format:
          '{point.name} <span class="value">{point.percentage:.1f}%</span>',
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
      states: {
        hover: {
          brightness: 0,
          halo: {
            size: 0,
          },
        },
        inactive: {
          opacity: 0.2,
        },
      },
    },
    scatter: {
      marker: {
        radius: 4,
        lineWidth: 1,
        states: {
          hover: {
            lineWidthPlus: 0,
          },
        },
      },
      states: {
        hover: {
          halo: {
            size: 0,
          },
        },
      },
    },
    series: {
      dataLabels: {
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
    },
    waterfall: {
      borderWidth: 0,
      borderRadius: 0,
      color: tokens["--salt-sentiment-negative-dataviz"],
      dataLabels: {
        style: {
          color: tokens["--salt-content-bold-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          fontWeight: tokens["--salt-text-label-fontWeight-strong"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
          textOutline,
        },
      },
      lineColor: tokens["--salt-content-primary-foreground"],
      lineWidth: tokens["--salt-size-fixed-100"],
      states: {
        hover: {
          enabled: false,
        },
      },
      upColor: tokens["--salt-sentiment-positive-dataviz"],
    },
  };
};

export const buildSeriesPalette = (
  tokens: SaltChartTokenMap,
): Pick<HighchartsOptionsCompat, "colors"> => ({
  colors: CATEGORY_DATAVIZ_TOKENS.map((tokenName) => tokens[tokenName]),
});
