import type { Options } from "highcharts";

export const barOptions: Options = {
  chart: {
    type: "bar",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A bar chart comparing revenue by product across regions. Each region shows side-by-side values for each product category.",
    point: {
      valuePrefix: "$",
      valueSuffix: "M",
    },
  },
  xAxis: {
    categories: ["NA", "EMEA", "APAC", "LATAM"],
    title: {
      text: "Region",
    },
  },
  yAxis: {
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
      name: "Equities",
      type: "bar",
      data: [45, 38, 42, 37],
    },
  ],
};
