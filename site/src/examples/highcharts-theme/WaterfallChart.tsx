import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

highchartsMore(Highcharts);
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const waterfallChartOptions: Options = {
  chart: {
    type: "waterfall",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A waterfall chart showing the cumulative effect of sequential positive and negative values on revenue.",
  },
  xAxis: {
    categories: [
      "Start",
      "Product Sales",
      "Service Revenue",
      "Operating Costs",
      "Marketing",
      "Total",
    ],
    title: {
      text: "Category",
    },
  },
  yAxis: {
    title: {
      text: "Revenue ($ millions)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span>',
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    waterfall: {
      dataLabels: {
        enabled: true,
        formatter: function () {
          return `$${this.y}M`;
        },
      },
    },
  },
  series: [
    {
      name: "Revenue",
      type: "waterfall",
      data: [
        { y: 50 },
        { y: 25 },
        { y: 15 },
        { y: -20 },
        { y: -10 },
        { isSum: true },
      ],
    },
  ],
};

export const WaterfallChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, waterfallChartOptions);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.controlsRow}>
        <Switch
          label="Show patterns"
          checked={patterns}
          onChange={(e) => setPatterns(e.target.checked)}
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
