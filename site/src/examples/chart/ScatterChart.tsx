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

const scatterChartOptions: Options = {
  chart: {
    type: "scatter",
  },
  title: {
    text: "Portfolio risk vs return",
  },
  accessibility: {
    description:
      "A scatter plot showing the relationship between portfolio risk (x-axis) and return (y-axis) for sample portfolios.",
    point: {
      descriptionFormatter: (point) =>
        `${point.series.name}, Risk: ${point.x}%, Return: ${point.y}%. Point ${point.index + 1} of ${point.series.points.length}.`,
    },
  },
  xAxis: {
    title: {
      text: "Risk (annualized volatility %)",
    },
    accessibility: {
      description:
        "Risk from low to high, measured as annualized volatility in percent",
    },
    min: 0,
    startOnTick: true,
    endOnTick: true,
  },
  yAxis: {
    title: {
      text: "Return (annualized %)",
    },
    min: 0,
  },
  tooltip: {
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      '<span>Risk: </span><span class="value">{point.x}%</span><br/>' +
      '<span>Return: </span><span class="value">{point.y}%</span>',
  },
  series: [
    {
      type: "scatter",
      name: "Portfolio A",
      data: [
        [6.5, 5.2],
        [8.1, 6.3],
        [10.4, 7.8],
        [12.0, 8.1],
        [14.3, 9.0],
        [16.8, 9.8],
      ],
    },
    {
      type: "scatter",
      name: "Portfolio B",
      data: [
        [5.0, 4.0],
        [7.3, 5.4],
        [9.7, 6.1],
        [11.5, 7.0],
        [13.2, 7.6],
        [15.0, 8.2],
      ],
    },
    {
      type: "scatter",
      name: "Benchmark",
      data: [
        [4.0, 3.5],
        [6.0, 4.3],
        [8.0, 5.0],
        [10.0, 5.7],
        [12.0, 6.3],
        [14.0, 6.8],
      ],
    },
  ],
};

export const ScatterChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, scatterChartOptions);

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
        className={clsx("highcharts-theme-salt", "axes-grid-lines", {
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
