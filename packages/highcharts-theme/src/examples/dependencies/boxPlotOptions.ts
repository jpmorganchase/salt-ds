import type { Options } from "highcharts";

export const boxPlotOptions: Options = {
  chart: {
    type: "boxplot",
  },
  title: {
    text: "Quarterly sales distribution by region",
  },
  accessibility: {
    description:
      "Box plot chart showing quarterly sales distribution across four regions. Each box shows minimum, first quartile, median, third quartile, and maximum sales values in thousands of dollars.",
    point: {
      valuePrefix: "$",
      valueSuffix: "K",
    },
  },
  xAxis: {
    categories: ["Q1", "Q2", "Q3", "Q4"],
    title: {
      text: "Quarter",
    },
  },
  yAxis: {
    title: {
      text: "Sales ($K)",
    },
  },
  tooltip: {
    headerFormat: '<span class="title">{series.name} - {point.key}</span><br/>',
    pointFormat:
      '<span class="label">Maximum: </span><span class="value">$' +
      "{point.high}K</span><br/>" +
      '<span class="label">Q3: </span><span class="value">$' +
      "{point.q3}K</span><br/>" +
      '<span class="label">Median: </span><span class="value">$' +
      "{point.median}K</span><br/>" +
      '<span class="label">Q1: </span><span class="value">$' +
      "{point.q1}K</span><br/>" +
      '<span class="label">Minimum: </span><span class="value">$' +
      "{point.low}K</span>",
  },
  plotOptions: {
    boxplot: {
      pointWidth: 40,
    },
  },
  series: [
    {
      name: "North America",
      type: "boxplot",
      data: [
        [45, 62, 75, 88, 105],
        [52, 68, 82, 95, 112],
        [48, 71, 85, 98, 118],
        [58, 78, 92, 108, 125],
      ],
    },
    {
      name: "Europe",
      type: "boxplot",
      data: [
        [38, 55, 68, 82, 98],
        [42, 60, 75, 88, 105],
        [45, 65, 80, 95, 112],
        [50, 70, 85, 100, 120],
      ],
    },
  ],
};
