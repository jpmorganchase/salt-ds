import type { Options } from "highcharts";
import type { SaltColorAxis } from "../../color-axis";

const dayCategories = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const deskCategories = ["Equities", "Rates", "Credit", "FX"];

const activityHeatmapData: Array<[number, number, number]> = [
  [0, 0, 52],
  [1, 0, 35],
  [2, 0, 54],
  [3, 0, 80],
  [4, 0, 72],
  [0, 1, 78],
  [1, 1, 27],
  [2, 1, 49],
  [3, 1, 67],
  [4, 1, 100],
  [0, 2, 8],
  [1, 2, 55],
  [2, 2, 42],
  [3, 2, 74],
  [4, 2, 94],
  [0, 3, 30],
  [1, 3, 10],
  [2, 3, 25],
  [3, 3, 51],
  [4, 3, 100],
];

const thresholdHeatmapData: Array<[number, number, number]> = [
  [0, 0, -4],
  [1, 0, -2],
  [2, 0, 1],
  [3, 0, 3],
  [4, 0, 5],
  [0, 1, -3],
  [1, 1, -1],
  [2, 1, 0],
  [3, 1, 2],
  [4, 1, 4],
  [0, 2, -5],
  [1, 2, -2],
  [2, 2, 1],
  [3, 2, 2],
  [4, 2, 6],
  [0, 3, -6],
  [1, 3, -3],
  [2, 3, -1],
  [3, 3, 1],
  [4, 3, 3],
];

const baseHeatmapOptions: Options = {
  chart: {
    type: "heatmap",
    height: 420,
  },
  accessibility: {
    description:
      "A heatmap showing desk activity levels across the trading week.",
  },
  xAxis: {
    categories: dayCategories,
    title: {
      text: "Day",
    },
  },
  yAxis: {
    categories: deskCategories,
    title: {
      text: "Desk",
    },
    reversed: true,
  },
  plotOptions: {
    heatmap: {
      borderWidth: 1,
      dataLabels: {
        enabled: true,
        format: "{point.value}",
      },
    },
  },
  tooltip: {
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat: '<span>Value: </span><span class="value">{point.value}</span>',
  },
};

const continuousHeatmapOptions: Options = {
  ...baseHeatmapOptions,
  legend: {
    symbolHeight: 200,
  },
};

export const heatmapOptions: Options = {
  ...continuousHeatmapOptions,
  title: {
    text: "Desk activity heatmap",
  },
  series: [
    {
      type: "heatmap",
      name: "Activity level",
      data: activityHeatmapData,
    },
  ],
};

export const heatmapSaltColorAxis: SaltColorAxis = {
  min: 0,
  max: 100,
  color: "--salt-category-1-dataviz",
  minOpacity: 0.12,
  maxOpacity: 1,
  steps: 5,
};

export const heatmapDiscreteRangesSaltColorAxis: SaltColorAxis = {
  dataClassOpacityRamp: true,
  dataClasses: [
    {
      to: 30,
      color: "--salt-category-1-dataviz",
      name: "0 - 30",
    },
    {
      from: 30,
      to: 45,
      color: "--salt-category-1-dataviz",
      name: "30 - 45",
    },
    {
      from: 45,
      to: 60,
      color: "--salt-category-1-dataviz",
      name: "45 - 60",
    },
    {
      from: 60,
      to: 75,
      color: "--salt-category-1-dataviz",
      name: "60 - 75",
    },
    {
      from: 75,
      color: "--salt-category-1-dataviz",
      name: "75 - 100",
    },
  ],
};

export const heatmapDiscreteRangesOptions: Options = {
  ...baseHeatmapOptions,
  accessibility: {
    description:
      "A heatmap showing desk activity grouped into discrete numeric ranges with stepped opacity classes.",
  },
  title: {
    text: "Desk activity heatmap with discrete ranges",
  },
  series: [
    {
      type: "heatmap",
      name: "Activity range",
      data: activityHeatmapData,
    },
  ],
};

export const heatmapTwoColorDiscreteRangesSaltColorAxis: SaltColorAxis = {
  dataClassOpacityRamp: true,
  dataClasses: [
    {
      to: 30,
      color: "--salt-category-4-dataviz",
      name: "0 - 30",
    },
    {
      from: 30,
      to: 45,
      color: "--salt-category-4-dataviz",
      name: "30 - 45",
    },
    {
      from: 45,
      to: 60,
      color: "--salt-category-1-dataviz",
      name: "45 - 60",
    },
    {
      from: 60,
      to: 75,
      color: "--salt-category-1-dataviz",
      name: "60 - 75",
    },
    {
      from: 75,
      color: "--salt-category-1-dataviz",
      name: "75 - 100",
    },
  ],
};

export const heatmapTwoColorDiscreteRangesOptions: Options = {
  ...baseHeatmapOptions,
  accessibility: {
    description:
      "A heatmap showing desk activity grouped into discrete numeric ranges with stepped opacity classes split across two Salt data visualization colors.",
  },
  title: {
    text: "Desk activity heatmap with two-color discrete ranges",
  },
  series: [
    {
      type: "heatmap",
      name: "Activity band",
      data: activityHeatmapData,
    },
  ],
};

export const heatmapDataClassesSaltColorAxis: SaltColorAxis = {
  dataClasses: [
    {
      to: 30,
      color: "--salt-sentiment-negative-dataviz",
      name: "Low",
    },
    {
      from: 30,
      to: 55,
      color: "--salt-sentiment-caution-dataviz",
      name: "Moderate",
    },
    {
      from: 55,
      color: "--salt-sentiment-positive-dataviz",
      name: "High",
    },
  ],
};

export const heatmapDataClassesOptions: Options = {
  ...baseHeatmapOptions,
  accessibility: {
    description:
      "A heatmap showing desk activity grouped into low, moderate, and high data classes.",
  },
  title: {
    text: "Desk activity heatmap with data classes",
  },
  series: [
    {
      type: "heatmap",
      name: "Activity class",
      data: activityHeatmapData,
    },
  ],
};

export const heatmapThresholdSaltColorAxis: SaltColorAxis = {
  min: -6,
  max: 6,
  threshold: 0,
  lowColor: "--salt-category-4-dataviz",
  highColor: "--salt-category-9-dataviz",
  minOpacity: 0.16,
  maxOpacity: 1,
  steps: 4,
};

export const heatmapThresholdOptions: Options = {
  ...continuousHeatmapOptions,
  accessibility: {
    description:
      "A divergent heatmap showing desk performance variance against a zero threshold.",
  },
  title: {
    text: "Desk variance heatmap with threshold",
  },
  series: [
    {
      type: "heatmap",
      name: "Variance vs threshold",
      data: thresholdHeatmapData,
    },
  ],
};
