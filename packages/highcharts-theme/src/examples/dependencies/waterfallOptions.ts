import type { Options } from "highcharts";

export const waterfallOptions: Options = {
  chart: {
    type: "waterfall",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A waterfall chart showing the cumulative effect of sequential positive and negative values on revenue.",
  },
  xAxis: {
    categories: [
      "Start",
      "Product Sales",
      "Service Revenue",
      "Operating Costs",
      "Marketing",
      "Total",
    ],
    title: {
      text: "Category",
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
  legend: {
    enabled: false,
  },
  plotOptions: {
    waterfall: {
      dataLabels: {
        enabled: true,
        formatter: function () {
          return `$${this.y}M`;
        },
      },
    },
  },
  series: [
    {
      name: "Revenue",
      type: "waterfall",
      data: [
        { y: 50 },
        { y: 25 },
        { y: 15 },
        { y: -20 },
        { y: -10 },
        { isSum: true },
      ],
    },
  ],
};
