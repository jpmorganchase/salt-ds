import type { Options } from "highcharts";

export const bulletOptions: Options = {
  chart: {
    type: "bar",
    className: "highcharts-bullet-series-tymon",
    height: "30%",
  },
  title: {
    text: "Revenue Performance vs Target",
  },
  accessibility: {
    description:
      "A bullet chart showing revenue performance vs target for different business units.",
  },
  xAxis: {
    categories: ["North America", "Europe", "Asia Pacific", "Latin America"],
    title: {
      text: "Geography",
    },
  },
  yAxis: {
    title: {
      text: "Revenue (Millions USD)",
    },
    plotBands: [
      {
        from: 0,
        to: 50,
        className: "segment-1",
      },
      {
        from: 50,
        to: 100,
        color: "var(--salt-palette-neutral-strong-background)",
      },
      {
        from: 100,
        to: 150,
        color: "var(--salt-palette-accent-background)",
      },
    ],
    gridLineWidth: 0,
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span><br/><span>Target: </span><span class="value">${point.target}M</span>',
    stickOnContact: true,
  },
  series: [
    {
      name: "Current Revenue",
      type: "bullet",
      data: [{ y: 85, target: 90 }],
    },
  ],
};
