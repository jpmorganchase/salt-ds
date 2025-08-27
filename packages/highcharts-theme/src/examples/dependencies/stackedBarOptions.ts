import type { Options } from "highcharts";

export const stackedBarOptions: Options = {
  chart: {
    type: "bar",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A stacked bar chart showing revenue by product across regions. This demonstrates how categories stack to a total per region.",
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
    reversedStacks: false,
  },
  plotOptions: {
    series: {
      stacking: "normal",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span><br/><span>Total: </span><span class="value">{point.stackTotal}</span>',
    stickOnContact: true,
  },
  series: [
    {
      name: "Equities",
      type: "bar",
      data: [5, 3, 4, 7],
    },
    {
      name: "Fixed Income",
      type: "bar",
      data: [2, 2, 3, 2],
    },
    {
      name: "FX",
      type: "bar",
      data: [3, 4, 4, 2],
    },
  ],
};
