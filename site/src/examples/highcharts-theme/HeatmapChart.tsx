import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import heatmapModule from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

heatmapModule(Highcharts);
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const heatmapChartOptions: Options = {
  chart: {
    type: "heatmap",
    className: "salt-heatmap",
  },
  accessibility: {
    description:
      "A heatmap showing hourly trade tickets processed by each desk to highlight peak routing times across the trading floor.",
  },
  title: {
    text: "Trading desk activity by hour",
    align: "center",
  },
  xAxis: {
    categories: [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
    ],
    title: {
      text: "Trading hour (local time)",
    },
    accessibility: {
      description: "Trading hours from 08:00 to 15:00",
    },
    gridLineWidth: 0,
  },
  yAxis: {
    categories: ["Equities", "Rates", "FX", "Commodities", "Credit"],
    title: {
      text: "Desk",
    },
    reversed: true,
    accessibility: {
      description: "Trading desks",
    },
    gridLineWidth: 0,
  },
  // todo: how to handle legend + colors w/ opacity
  // legend: {
  //   align: "right",
  //   layout: "vertical",
  //   verticalAlign: "top",
  //   symbolHeight: 280,
  //   symbolRadius: 30,
  // },
  // colorAxis: {
  //   showInLegend: true,
  //   min: 0,
  //   max: 120,
  //   labels: {
  //     format: "{value}",
  //   },
  //   stops: [
  //     [0, "rgba(1,1,1, 1)"],
  //     [0.5, "#5c9dff"],
  //     [1, "#0043ce"],
  //   ],
  // },
  tooltip: {
    formatter: function (this: Highcharts.TooltipFormatterContextObject) {
      const series = this.series;
      const point = this.point;
      const xCategory = (series.xAxis as Highcharts.Axis).categories[
        point.x as number
      ];
      const yCategory = (series.yAxis as Highcharts.Axis).categories[
        point.y as number
      ];
      return (
        `<span>Desk: </span><span class="value">${yCategory}</span><br/>` +
        `<span>Hour: </span><span class="value">${xCategory}</span><br/>` +
        `<span>Tickets: </span><span class="value">${point.value}</span>`
      );
    },
  },
  series: [
    {
      type: "heatmap",
      name: "Tickets processed",
      dataLabels: {
        enabled: true,
        format: "{point.value}",
      },
      data: [
        // Equities
        [0, 0, 32],
        [1, 0, 50],
        [2, 0, 72],
        [3, 0, 62],
        [4, 0, 41],
        [5, 0, 44],
        [6, 0, 48],
        [7, 0, 60],
        // Rates
        [0, 1, 28],
        [1, 1, 33],
        [2, 1, 42],
        [3, 1, 47],
        [4, 1, 38],
        [5, 1, 30],
        [6, 1, 31],
        [7, 1, 40],
        // FX
        [0, 2, 22],
        [1, 2, 26],
        [2, 2, 31],
        [3, 2, 35],
        [4, 2, 33],
        [5, 2, 22],
        [6, 2, 28],
        [7, 2, 29],
        // Commodities
        [0, 3, 14],
        [1, 3, 19],
        [2, 3, 27],
        [3, 3, 24],
        [4, 3, 25],
        [5, 3, 17],
        [6, 3, 16],
        [7, 3, 15],
        // Credit
        [0, 4, 18],
        [1, 4, 21],
        [2, 4, 28],
        [3, 4, 32],
        [4, 4, 31],
        [5, 4, 24],
        [6, 4, 27],
        [7, 4, 30],
      ],
    },
  ],
};

export const HeatmapChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, heatmapChartOptions);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.controlsRow}>
        <Switch
          label="Show patterns"
          checked={patterns}
          onChange={(event) => setPatterns(event.target.checked)}
        />
      </div>
      <div
        className={clsx("highcharts-theme-salt", {
          "salt-fill-patterns": patterns,
        })}
      >
        <HighchartsReact
          className={styles.chart}
          highcharts={Highcharts}
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
