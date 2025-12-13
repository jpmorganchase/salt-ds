import type { Options } from "highcharts";

export const columnOptions: Options = {
  chart: {
    type: "column",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A column chart comparing revenue across regions. Each category shows a single column representing the total value for that region.",
  },
  xAxis: {
    categories: ["NA", "EMEA", "APAC", "LATAM"],
    title: {
      text: "Region",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Revenue ($ millions)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span>',
  },
  series: [
    {
      name: "Revenue",
      type: "column",
      data: [5, 3, 4, 7],
    },
  ],
};
