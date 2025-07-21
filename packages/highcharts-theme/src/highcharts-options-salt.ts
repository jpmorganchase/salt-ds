import type { Options } from "highcharts";
// Properties relating to color will be overrided due to styledMode: true

export const highchartsOptionsSalt: Options = {
  chart: {
    styledMode: true,
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
  },
  legend: {
    layout: "vertical",
    align: "right",
    verticalAlign: "middle",
    symbolWidth: 32,
    itemMarginBottom: 8,
    margin: 24,
  },
  yAxis: {
    title: {
      margin: 18,
    },
  },
  xAxis: {
    title: {
      margin: 24,
    },
  },
  plotOptions: {
    line: {
      marker: {
        enabled: false,
      },
    },
  },
  title: {
    margin: 24,
  },
};
