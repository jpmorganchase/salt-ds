import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "bar",
  },
  title: {
    text: "Regional Revenue by Product",
  },
  accessibility: {
    description:
      "A bar chart comparing revenue by product across regions. Each region shows side-by-side values for each product category.",
  },
  xAxis: {
    categories: ["North America", "EMEA", "APAC", "LATAM"],
    title: {
      text: "Region",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Total revenue (normalized)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
    stickOnContact: true,
  },
  series: [
    {
      name: "Revenue",
      type: "bar",
      data: [5, 3, 4, 7],
    },
  ],
};

export const BarChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const barChartOptions = useChart(chartRef, options);

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
          options={barChartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
