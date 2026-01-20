import type { Options } from "highcharts";

export const bubbleOptions: Options = {
  chart: {
    type: "bubble",
  },
  title: {
    text: "Asset class risk-return profile (bubble size = market cap)",
  },
  accessibility: {
    description:
      "A bubble chart showing the relationship between risk (x-axis) and expected return (y-axis). The bubble size represents market capitalization in trillions of dollars.",
    point: {
      descriptionFormatter: (point) =>
        `${point.name}, Risk: ${point.x}, Return: ${point.y}%, Market cap: $${(point as unknown as { z: number }).z}T. Point ${point.index + 1} of ${point.series.points.length}.`,
    },
  },
  xAxis: {
    title: { text: "Risk score" },
    labels: {
      format: "{value}",
    },
    accessibility: { description: "Risk score from 1 to 10" },
    min: 0,
    max: 10,
    tickInterval: 2,
  },
  yAxis: {
    title: { text: "Expected return (%)" },
    labels: {
      format: "{value}",
    },
    tickInterval: 4,
  },
  legend: { enabled: true },
  plotOptions: {
    bubble: {
      dataLabels: {
        enabled: true,
        format: "{point.name}",
      },
      minSize: 50,
      maxSize: 90,
    },
  },
  tooltip: {
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      "<span>{point.name}</span><br/>" +
      '<span>Risk: </span><span class="value">{point.x}</span><br/>' +
      '<span>Return: </span><span class="value">{point.y}%</span><br/>' +
      '<span>Market cap: </span><span class="value">&#36;{point.z}T</span>',
  },
  series: [
    {
      type: "bubble",
      name: "Equity",
      data: [
        { name: "Stocks", x: 6.5, y: 10, z: 45 },
        { name: "Tech", x: 7.5, y: 12.5, z: 18 },
        { name: "Small", x: 8, y: 9, z: 3 },
        { name: "Mid", x: 5.5, y: 11.5, z: 5 },
        { name: "Intl", x: 7, y: 8, z: 4 },
      ],
    },
    {
      type: "bubble",
      name: "Fixed Income",
      data: [
        { name: "Bonds", x: 2, y: 8, z: 25 },
        { name: "Cash", x: 1, y: 6.4, z: 12 },
        { name: "Tips", x: 2.5, y: 5, z: 3 },
        { name: "Muni", x: 1.5, y: 4, z: 4 },
        { name: "Short", x: 0.7, y: 3, z: 6 },
      ],
    },
    {
      type: "bubble",
      name: "Alternative",
      data: [
        { name: "Crypto", x: 8.5, y: 14, z: 2 },
        { name: "RE", x: 4, y: 5, z: 8 },
        { name: "Goods", x: 4.7, y: 8.5, z: 8 },
        { name: "Gold", x: 3.2, y: 6, z: 3 },
        { name: "PE", x: 6, y: 13, z: 4 },
        { name: "VC", x: 9.4, y: 13, z: 1 },
      ],
    },
  ],
};
