import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "bar",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A stacked bar chart showing revenue by product across regions. This demonstrates how categories stack to a total per region.",
  },
  xAxis: {
    categories: ["NA", "EMEA", "APAC", "LATAM"],
    title: {
      text: "Region",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Revenue ($ millions)",
    },
    reversedStacks: false,
  },
  plotOptions: {
    series: {
      stacking: "normal",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span><br/><span>Total: </span><span class="value">{point.stackTotal}</span>',
  },
  series: [
    {
      name: "Equities",
      type: "bar",
      data: [5, 3, 4, 7],
    },
    {
      name: "Fixed Income",
      type: "bar",
      data: [2, 2, 3, 2],
    },
    {
      name: "FX",
      type: "bar",
      data: [3, 4, 4, 2],
    },
  ],
};

export const StackedBarChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const stackedBarOptions = useChart(chartRef, options);

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
          options={stackedBarOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
