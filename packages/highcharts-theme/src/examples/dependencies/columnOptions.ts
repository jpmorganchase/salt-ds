import type { Options } from "highcharts";

export const options: Options = {
  chart: {
    type: "column",
  },
  title: {
    text: "Regional Revenue by Product",
  },
  accessibility: {
    description:
      "A column chart comparing revenue across regions. Each category shows a single column representing the total value for that region.",
  },
  xAxis: {
    categories: ["North America", "EMEA", "APAC", "LATAM"],
    title: {
      text: "Region",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Total revenue (normalized)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
    stickOnContact: true,
  },
  series: [
    {
      name: "Revenue",
      type: "column",
      data: [5, 3, 4, 7],
    },
  ],
};
