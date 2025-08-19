import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

accessibility(Highcharts);

export const StackedBarChart = () => {
  const StackedBarRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  useChart({ chartRef: StackedBarRef });

  const stackedBarOptions: Options = {
    chart: {
      type: "bar",
    },
    title: {
      text: "Revenue by division by region",
      align: "center",
    },
    accessibility: {
      description:
        "A stacked bar chart showing revenue by division across regions. Each bar represents a region and the segments represent divisions. The values are illustrative.",
    },
    xAxis: {
      categories: [
        "North America",
        "Europe",
        "APAC",
        "LATAM",
        "MEA",
      ],
      title: {
        text: "Region",
      },
      accessibility: {
        description: "Regions",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Revenue (index)",
      },
      reversedStacks: false,
    },
    plotOptions: {
      series: {
        stacking: "normal",
      },
    },
    series: [
      {
        type: "bar",
        name: "Retail",
        data: [50, 40, 35, 20, 15],
      },
      {
        type: "bar",
        name: "Corporate",
        data: [40, 35, 25, 15, 10],
      },
      {
        type: "bar",
        name: "Investment",
        data: [30, 20, 15, 10, 8],
      },
      {
        type: "bar",
        name: "Wealth",
        data: [20, 15, 10, 6, 5],
      },
      {
        type: "bar",
        name: "Treasury",
        data: [10, 10, 8, 4, 3],
      },
    ],
  };

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
          ref={StackedBarRef}
        />
      </div>
    </div>
  );
};


