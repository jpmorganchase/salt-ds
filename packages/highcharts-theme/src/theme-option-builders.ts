import type { Options } from "highcharts";
import type { SaltChartTokenMap } from "./density-token-map";
import type { HighchartsOptionsCompat } from "./types";

const AXES_GRID_LINE_SERIES_TYPES = new Set(["bubble", "scatter"]);

const shouldShowAxesGridLines = (chartOptions: Options): boolean => {
  if (
    chartOptions.chart?.type &&
    AXES_GRID_LINE_SERIES_TYPES.has(chartOptions.chart.type)
  ) {
    return true;
  }

  return (chartOptions.series ?? []).some((series) => {
    return typeof series.type === "string"
      ? AXES_GRID_LINE_SERIES_TYPES.has(series.type)
      : false;
  });
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
      lineWidth: tokens["--salt-size-fixed-100"],
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
      gridLineWidth: tokens["--salt-size-fixed-100"],
      labels: {
        style: {
          color: tokens["--salt-content-secondary-foreground"],
          fontFamily: tokens["--salt-text-label-fontFamily"],
          fontSize: tokens["--salt-text-label-fontSize"],
          lineHeight: tokens["--salt-text-label-lineHeight"],
        },
      },
      lineColor: tokens["--salt-separable-primary-borderColor"],
      lineWidth: showAxesGridLines ? tokens["--salt-size-fixed-100"] : 0,
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
  itemHiddenStyle: {
    color: tokens["--salt-content-secondary-foreground"],
    fontFamily: tokens["--salt-text-label-fontFamily"],
    fontSize: tokens["--salt-text-label-fontSize"],
    fontWeight: tokens["--salt-text-label-fontWeight"],
    lineHeight: tokens["--salt-text-label-lineHeight"],
    opacity: 0.2,
    textDecoration: "none",
  },
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

export const buildTooltipOptions = (
  tokens: SaltChartTokenMap,
): NonNullable<HighchartsOptionsCompat["tooltip"]> => ({
  backgroundColor: tokens["--salt-container-primary-background"],
  borderColor: tokens["--salt-container-primary-background"],
  borderRadius: tokens["--salt-palette-corner-weaker"],
  shadow: false,
  stickOnContact: true,
  style: {
    color: tokens["--salt-content-primary-foreground"],
    fontFamily: tokens["--salt-text-label-fontFamily"],
    fontSize: tokens["--salt-text-label-fontSize"],
    fontWeight: tokens["--salt-text-label-fontWeight"],
    lineHeight: tokens["--salt-text-label-lineHeight"],
  },
});

export const buildPlotOptions = (
  tokens: SaltChartTokenMap,
): NonNullable<HighchartsOptionsCompat["plotOptions"]> => ({
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
        textOutline: "none",
      },
    },
    marker: {
      fillOpacity: 0.75,
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
  line: {
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
      format: '{point.name} <span class="value">{point.percentage:.1f}%</span>',
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
        textOutline: "none",
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
});

export const buildSeriesPalette = (
  tokens: SaltChartTokenMap,
): Pick<HighchartsOptionsCompat, "colors"> => ({
  colors: [
    tokens["--salt-category-1-dataviz"],
    tokens["--salt-category-2-dataviz"],
    tokens["--salt-category-3-dataviz"],
    tokens["--salt-category-4-dataviz"],
    tokens["--salt-category-5-dataviz"],
    tokens["--salt-category-6-dataviz"],
    tokens["--salt-category-7-dataviz"],
    tokens["--salt-category-8-dataviz"],
    tokens["--salt-category-9-dataviz"],
    tokens["--salt-category-10-dataviz"],
    tokens["--salt-category-11-dataviz"],
    tokens["--salt-category-12-dataviz"],
    tokens["--salt-category-13-dataviz"],
    tokens["--salt-category-14-dataviz"],
    tokens["--salt-category-15-dataviz"],
    tokens["--salt-category-16-dataviz"],
    tokens["--salt-category-17-dataviz"],
    tokens["--salt-category-18-dataviz"],
    tokens["--salt-category-19-dataviz"],
    tokens["--salt-category-20-dataviz"],
  ],
});
