import type { Options } from "highcharts";

export const bubbleOptions: Options = {
  chart: {
    type: "bubble",
  },
  title: {
    text: "GDP vs life expectancy (bubble size = population)",
  },
  accessibility: {
    description:
      "A bubble chart showing the relationship between GDP per capita (x-axis) and life expectancy (y-axis). The bubble size represents population in millions.",
  },
  xAxis: {
    title: { text: "GDP per capita ($ thousands)" },
    labels: {
      format: "{value}",
    },
    accessibility: { description: "GDP per capita in thousands of USD" },
    startOnTick: true,
    endOnTick: true,
    tickWidth: 0,
  },
  yAxis: {
    title: { text: "Life expectancy (years)" },
    labels: {
      format: "{value}",
    },
    min: 50,
    max: 85,
    startOnTick: true,
    endOnTick: true,
  },
  legend: { enabled: true },
  plotOptions: {
    bubble: {
      lineWidth: 0,
    },
  },
  tooltip: {
    useHTML: true,
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      "<span>{point.name}</span><br/>" +
      '<span>GDP per capita: </span><span class="value">{point.x}k</span><br/>' +
      '<span>Life expectancy: </span><span class="value">{point.y} yrs</span><br/>' +
      '<span>Population: </span><span class="value">{point.z}M</span>',
  },
  series: [
    {
      type: "bubble",
      name: "Americas",
      data: [
        { name: "USA", x: 63, y: 79, z: 331 },
        { name: "Canada", x: 52, y: 82, z: 38 },
        { name: "Brazil", x: 9, y: 76, z: 213 },
        { name: "Mexico", x: 10, y: 75, z: 128 },
      ],
    },
    {
      type: "bubble",
      name: "Europe",
      data: [
        { name: "Germany", x: 53, y: 81, z: 83 },
        { name: "UK", x: 47, y: 81, z: 67 },
        { name: "France", x: 45, y: 82, z: 65 },
        { name: "Italy", x: 36, y: 83, z: 60 },
      ],
    },
    {
      type: "bubble",
      name: "APAC",
      data: [
        { name: "Japan", x: 41, y: 84, z: 126 },
        { name: "China", x: 12, y: 77, z: 1441 },
        { name: "India", x: 2.2, y: 70, z: 1393 },
        { name: "Australia", x: 62, y: 83, z: 26 },
      ],
    },
  ],
};
