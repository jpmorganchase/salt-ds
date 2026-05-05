import type { Options } from "highcharts";

export const dualAxisOptions: Options = {
  accessibility: {
    description:
      "Monthly rainfall columns paired with a temperature trend line to compare seasonal volume against average temperature.",
  },
  title: {
    text: "Monthly rainfall and temperature",
  },
  xAxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    accessibility: {
      description: "Months from January to December",
    },
    title: {
      text: "Month",
    },
  },
  yAxis: [
    {
      title: {
        text: "Rainfall (mm)",
      },
    },
    {
      opposite: true,
      title: {
        text: "Temperature (C)",
      },
    },
  ],
  tooltip: {
    shared: true,
  },
  series: [
    {
      name: "Rainfall",
      data: [78, 62, 55, 48, 60, 72, 84, 81, 68, 74, 88, 95],
      type: "column",
      yAxis: 0,
    },
    {
      name: "Temperature",
      data: [4, 5, 8, 11, 15, 18, 21, 21, 17, 13, 8, 5],
      type: "line",
      yAxis: 1,
    },
  ],
};
