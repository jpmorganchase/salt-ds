import { Switch, Tooltip } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import { LinkBase } from "../../components/link/Link";
import styles from "./index.module.css";

highchartsMore(Highcharts);
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const bubbleChartOptions: Options = {
  chart: {
    type: "bubble",
  },
  title: {
    text: "Asset class risk-return profile (bubble size = market cap)",
  },
  accessibility: {
    description:
      "A bubble chart showing the relationship between risk (x-axis) and expected return (y-axis). The bubble size represents market capitalization in trillions of dollars.",
  },
  xAxis: {
    title: { text: "Risk score" },
    labels: {
      format: "{value}",
    },
    accessibility: { description: "Risk score from 1 to 10" },
    min: 0,
    max: 10,
    tickInterval: 2,
  },
  yAxis: {
    title: { text: "Expected return (%)" },
    labels: {
      format: "{value}",
    },
    tickInterval: 4,
  },
  legend: { enabled: true },
  plotOptions: {
    bubble: {
      dataLabels: {
        enabled: true,
        format: "{point.name}",
      },
      minSize: 50,
      maxSize: 90,
    },
  },
  tooltip: {
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      "<span>{point.name}</span><br/>" +
      '<span>Risk: </span><span class="value">{point.x}</span><br/>' +
      '<span>Return: </span><span class="value">{point.y}%</span><br/>' +
      '<span>Market cap: </span><span class="value">&#36;{point.z}T</span>',
  },
  series: [
    {
      type: "bubble",
      name: "Equity",
      data: [
        { name: "Stocks", x: 6.5, y: 10, z: 45 },
        { name: "Tech", x: 7.5, y: 12.5, z: 18 },
        { name: "Small", x: 8, y: 9, z: 3 },
        { name: "Mid", x: 5.5, y: 11.5, z: 5 },
        { name: "Intl", x: 7, y: 8, z: 4 },
      ],
    },
    {
      type: "bubble",
      name: "Fixed Income",
      data: [
        { name: "Bonds", x: 2, y: 8, z: 25 },
        { name: "Cash", x: 1, y: 6.4, z: 12 },
        { name: "Tips", x: 2.5, y: 5, z: 3 },
        { name: "Muni", x: 1.5, y: 4, z: 4 },
        { name: "Short", x: 0.7, y: 3, z: 6 },
      ],
    },
    {
      type: "bubble",
      name: "Alternative",
      data: [
        { name: "Crypto", x: 8.5, y: 14, z: 2 },
        { name: "RE", x: 4, y: 5, z: 8 },
        { name: "Goods", x: 4.7, y: 8.5, z: 8 },
        { name: "Gold", x: 3.2, y: 6, z: 3 },
        { name: "PE", x: 6, y: 13, z: 4 },
        { name: "VC", x: 9.4, y: 13, z: 1 },
      ],
    },
  ],
};

export const BubbleChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, bubbleChartOptions);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.controlsRow}>
        <Tooltip
          content={
            <>
              To ensure the presentation is accessible, fill patterns can be
              applied to the chart (see{" "}
              <LinkBase href="./usage#patterns-and-fills">
                Patterns and Fills
              </LinkBase>{" "}
              for details).
            </>
          }
          placement="left"
        >
          <Switch
            label="Show patterns"
            checked={patterns}
            onChange={(e) => setPatterns(e.target.checked)}
          />
        </Tooltip>
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
