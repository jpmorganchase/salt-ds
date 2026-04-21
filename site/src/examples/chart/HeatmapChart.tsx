import { useChart } from "@salt-ds/highcharts-theme";
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

const heatmapData: Array<[number, number, number]> = [
  [0, 0, 42],
  [1, 0, 55],
  [2, 0, 61],
  [3, 0, 73],
  [4, 0, 68],
  [0, 1, 38],
  [1, 1, 47],
  [2, 1, 58],
  [3, 1, 64],
  [4, 1, 59],
  [0, 2, 29],
  [1, 2, 36],
  [2, 2, 44],
  [3, 2, 57],
  [4, 2, 62],
  [0, 3, 21],
  [1, 3, 34],
  [2, 3, 49],
  [3, 3, 52],
  [4, 3, 100],
];

const heatmapOptions: Options = {
  chart: {
    type: "heatmap",
    height: 420,
  },
  title: {
    text: "Desk activity heatmap",
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
  legend: {
    symbolHeight: 200,
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
      data: heatmapData,
    },
  ],
};

const heatmapColorAxis = {
  min: 0,
  max: 100,
  color: "--salt-category-1-dataviz",
  minOpacity: 0.12,
  maxOpacity: 1,
  steps: 5,
};

export const HeatmapChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, heatmapOptions, {
    saltColorAxis: heatmapColorAxis,
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
