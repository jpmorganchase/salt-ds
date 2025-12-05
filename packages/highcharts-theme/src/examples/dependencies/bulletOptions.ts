import type { Options } from "highcharts";

export const bulletOptions: Options = {
  chart: {
    type: "bullet",
    inverted: true,
    height: 180,
  },
  title: {
    text: "Revenue performance vs target",
  },
  accessibility: {
    description: "A bullet chart showing revenue performance vs target for Q4",
    point: {
      valuePrefix: "$",
      valueSuffix: "M",
    },
  },
  xAxis: {
    categories: ["Q4"],
    title: {
      text: "Quarter",
    },
  },
  yAxis: {
    title: {
      text: "Revenue ($M)",
    },
    min: 0,
    max: 100,
    tickPositions: [0, 20, 40, 60, 80, 100],
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span><br/><span>Target: </span><span class="value">${point.target}M</span>',
  },
  series: [
    {
      name: "Current revenue",
      type: "bullet",
      data: [{ y: 60, target: 80 }],
    },
  ],
};
