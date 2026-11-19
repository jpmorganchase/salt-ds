import { type SaltColorAxis, useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import heatmap from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { useRef } from "react";
import styles from "./index.module.css";

// This example uses Highcharts v10 - see the usage tab for version-specific module loading.
heatmap(Highcharts);
accessibility(Highcharts);

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

const heatmapChartOptions: Options = {
  chart: {
    type: "heatmap",
    height: 420,
  },
  accessibility: {
    description:
      "A heatmap showing desk activity levels across the trading week.",
  },
  title: {
    text: "Desk activity heatmap",
  },
  xAxis: {
    categories: dayCategories,
    tickPositions: dayCategories.map((_, index) => index),
    title: {
      text: "Day",
    },
  },
  yAxis: {
    categories: deskCategories,
    accessibility: { description: "Desk" },
    title: {
      text: "",
    },
    reversed: true,
  },
  legend: {
    symbolHeight: 200,
  },
  responsive: {
    rules: [
      {
        condition: { maxWidth: 480 },
        chartOptions: {
          legend: {
            layout: "horizontal",
            align: "center",
            verticalAlign: "bottom",
            y: 0,
            symbolHeight: 12,
            symbolWidth: 120,
          },
          colorAxis: { layout: "horizontal" },
          xAxis: { labels: { rotation: -45, step: 1 } },
          plotOptions: { heatmap: { dataLabels: { padding: 0 } } },
        },
      },
    ],
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
  series: [
    {
      type: "heatmap",
      name: "Activity level",
      data: activityHeatmapData,
    },
  ],
};

const heatmapSaltColorAxis: SaltColorAxis = {
  min: 0,
  max: 100,
  color: "--salt-category-1-dataviz",
  minOpacity: 0.12,
  maxOpacity: 1,
  steps: 5,
};

export const HeatmapChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, heatmapChartOptions, {
    saltColorAxis: heatmapSaltColorAxis,
  });

  return (
    <div className={styles.chartContainer}>
      <HighchartsReact
        className={styles.chart}
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};
