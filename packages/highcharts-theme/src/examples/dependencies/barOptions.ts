import type { Options } from "highcharts";

export const options: Options = {
  chart: {
    type: "bar",
  },
  title: {
    text: "Regional Revenue by Product",
  },
  accessibility: {
    description:
      "A bar chart comparing revenue by product across regions. Each region shows side-by-side values for each product category.",
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
      type: "bar",
      data: [5, 3, 4, 7],
    },
  ],
};
