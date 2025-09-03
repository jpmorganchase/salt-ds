import type { Options } from "highcharts";

export const areaOptions: Options = {
  chart: {
    type: "area",
  },
  accessibility: {
    description:
      "Stacked area chart showing how categories contribute to the total over time.",
  },
  title: {
    text: "Assets under management by asset class (2015–2024)",
  },
  yAxis: {
    title: {
      text: "AUM (bn USD)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
    stickOnContact: true,
    shared: true,
  },
  xAxis: {
    title: {
      text: "Years 2015 to 2024",
    },
    accessibility: {
      description: "Years from 2015 to 2024",
    },
    categories: [
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
      "2021",
      "2022",
      "2023",
      "2024",
    ],
    min: 0,
    endOnTick: false,
    startOnTick: false,
    maxPadding: 0,
  },
  legend: {
    symbolWidth: 32,
  },
  plotOptions: {
    area: {
      stacking: "normal",
      marker: {
        enabled: false,
      },
    },
  },
  series: [
    {
      name: "Equities",
      data: [120, 135, 150, 165, 180, 210, 245, 230, 255, 275],
      type: "area",
    },
    {
      name: "Fixed Income",
      data: [90, 95, 105, 110, 120, 140, 160, 170, 165, 180],
      type: "area",
    },
    {
      name: "Alternatives",
      data: [30, 35, 45, 50, 55, 65, 80, 85, 95, 105],
      type: "area",
    },
  ],
};
