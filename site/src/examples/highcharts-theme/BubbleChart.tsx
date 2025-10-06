import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
highchartsMore(Highcharts);
accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "bubble",
    plotBorderWidth: 1,
  },
  title: {
    text: "GDP vs life expectancy (bubble size = population)",
  },
  accessibility: {
    description:
      "A bubble chart showing the relationship between GDP per capita (x-axis) and life expectancy (y-axis). The bubble size represents population in millions.",
  },
  xAxis: {
    title: { text: "GDP per capita ($ thousands)" },
    labels: {
      format: "{value}",
    },
    accessibility: { description: "GDP per capita in thousands of USD" },
    startOnTick: false,
    endOnTick: false,
  },
  yAxis: {
    title: { text: "Life expectancy (years)" },
    labels: {
      format: "{value}",
    },
    min: 50,
    max: 85,
  },
  legend: { enabled: true },
  plotOptions: {
    bubble: {
      lineWidth: 0,
    },
  },
  tooltip: {
    useHTML: true,
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      "<span>{point.name}</span><br/>" +
      '<span>GDP per capita: </span><span class="value">{point.x}k</span><br/>' +
      '<span>Life expectancy: </span><span class="value">{point.y} yrs</span><br/>' +
      '<span>Population: </span><span class="value">{point.z}M</span>',
  },
  series: [
    {
      type: "bubble",
      name: "Americas",
      data: [
        { name: "USA", x: 63, y: 79, z: 331 },
        { name: "Canada", x: 52, y: 82, z: 38 },
        { name: "Brazil", x: 9, y: 76, z: 213 },
        { name: "Mexico", x: 10, y: 75, z: 128 },
      ],
    },
    {
      type: "bubble",
      name: "Europe",
      data: [
        { name: "Germany", x: 53, y: 81, z: 83 },
        { name: "UK", x: 47, y: 81, z: 67 },
        { name: "France", x: 45, y: 82, z: 65 },
        { name: "Italy", x: 36, y: 83, z: 60 },
      ],
    },
    {
      type: "bubble",
      name: "APAC",
      data: [
        { name: "Japan", x: 41, y: 84, z: 126 },
        { name: "China", x: 12, y: 77, z: 1441 },
        { name: "India", x: 2.2, y: 70, z: 1393 },
        { name: "Australia", x: 62, y: 83, z: 26 },
      ],
    },
  ],
};

export const BubbleChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const bubbleChartOptions = useChart(chartRef, options);

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
          options={bubbleChartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
