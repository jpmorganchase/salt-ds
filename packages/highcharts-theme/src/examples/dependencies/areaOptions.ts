import type { Options } from "highcharts";

const generateBellCurve = (
  center: number,
  amplitude: number,
  width: number,
  offset = 0,
  dataPoints = 200,
) => {
  return Array.from({ length: dataPoints }, (_, i) => {
    const x = (i / dataPoints) * 10 - 5; // Range from -5 to 5
    const bellValue =
      amplitude * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
    return Math.max(0, bellValue + offset);
  });
};

export const areaOptions: Options = {
  chart: {
    type: "area",
  },
  accessibility: {
    description:
      "Overlapping bell curves showing distribution patterns with high precision data points.",
  },
  title: {
    text: "Overlapping Distribution Curves",
  },
  yAxis: {
    title: {
      text: "Value",
    },
    min: 0,
    startOnTick: true,
    endOnTick: false,
  },
  tooltip: {
    headerFormat: "<span>Point {point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y:.2f}</span>',
    stickOnContact: true,
    shared: false,
  },
  xAxis: {
    title: {
      text: "Data Points (High Precision)",
    },
    accessibility: {
      description:
        "200 high precision data points showing overlapping bell curves",
    },
    categories: Array.from({ length: 200 }, (_, i) => `${i + 1}`),
    min: 0,
    endOnTick: false,
    startOnTick: false,
    maxPadding: 0,
    labels: {
      step: 20,
    },
  },
  legend: {
    symbolWidth: 32,
  },
  plotOptions: {
    series: {
      states: {
        hover: {
          enabled: true,
        },
        inactive: {
          opacity: 0.3,
        },
      },
    },
    area: {
      marker: {
        enabled: false,
        radius: 2,
        states: {
          hover: {
            enabled: true,
          },
        },
      },
      states: {
        hover: {
          enabled: true,
        },
      },
      threshold: 0,
      fillOpacity: 1,
    },
  },
  series: [
    {
      name: "Primary Distribution",
      data: generateBellCurve(-1, 100, 1.5),
      type: "area",
    },
    {
      name: "Secondary Distribution",
      data: generateBellCurve(1.5, 80, 1.2),
      type: "area",
    },
    {
      name: "Secondary Distribution",
      data: generateBellCurve(2.5, 50, 1.2),
      type: "area",
    },
    {
      name: "Secondary Distribution",
      data: generateBellCurve(5, 70, 1.2),
      type: "area",
    },
  ],
};
