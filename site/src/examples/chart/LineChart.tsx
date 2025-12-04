import { Switch, Tooltip } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import { LinkBase } from "../../components/link/Link";
import styles from "./index.module.css";

// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const lineChartOptions: Options = {
  chart: {
    type: "line",
  },
  accessibility: {
    description:
      "A summary communicating the trends, insights, or patterns the chart is intended to provide in a couple sentences.",
  },
  title: {
    text: "Currency performance trends",
  },
  yAxis: {
    title: {
      text: "CCY strength indicator",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}</span>',
  },
  xAxis: {
    title: {
      text: "Time from 2011 to 2020",
    },
    accessibility: {
      description: "Time from 2011 to 2020",
    },
    categories: [
      "2011",
      "2012",
      "2013",
      "2014",
      "2015",
      "2016",
      "2017",
      "2018",
      "2019",
      "2020",
    ],
    min: 0,
    endOnTick: false,
    startOnTick: false,
    maxPadding: 0,
  },
  legend: {
    symbolWidth: 32,
  },
  series: [
    {
      name: "USD",
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      type: "line",
    },
    {
      name: "EUR",
      data: [5, 6, 7, 6, 5, 4, 3, 4, 5, 6],
      type: "line",
    },
    {
      name: "CAD",
      data: [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      type: "line",
    },
    {
      name: "AUD",
      data: [2, 3, 4, 5, 6, 7, 8, 7, 6, 5],
      type: "line",
    },
    {
      name: "GBP",
      data: [8, 7, 6, 5, 4, 3, 2, 3, 4, 5],
      type: "line",
    },
    {
      name: "JPY",
      data: [3, 4, 5, 6, 7, 8, 7, 6, 5, 4],
      type: "line",
    },
    {
      name: "CHF",
      data: [7, 6, 5, 4, 3, 2, 3, 4, 5, 6],
      type: "line",
    },
    {
      name: "NZD",
      data: [2, 4, 6, 8, 6, 4, 2, 4, 6, 8],
      type: "line",
    },
    {
      name: "SEK",
      data: [5, 5.5, 6, 5.5, 5, 4.5, 4, 4.5, 5, 5.5],
      type: "line",
    },
    {
      name: "NOK",
      data: [1, 3, 5, 7, 9, 7, 5, 3, 1, 3],
      type: "line",
    },
    {
      name: "SGD",
      data: [6, 5, 4, 3, 2, 3, 4, 5, 6, 7],
      type: "line",
    },
    {
      name: "MXN",
      data: [4, 5, 6, 7, 8, 7, 6, 5, 4, 3],
      type: "line",
    },
    {
      name: "ZAR",
      data: [3, 4, 5, 6, 7, 6, 5, 4, 3, 2],
      type: "line",
    },
    {
      name: "INR",
      data: [7, 8, 9, 8, 7, 6, 5, 6, 7, 8],
      type: "line",
    },
    {
      name: "BRL",
      data: [2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
      type: "line",
    },
    {
      name: "CNY",
      data: [8, 7, 6, 5, 4, 5, 6, 7, 8, 9],
      type: "line",
    },
    {
      name: "KRW",
      data: [5, 6, 5, 4, 5, 6, 5, 4, 5, 6],
      type: "line",
    },
    {
      name: "TRY",
      data: [3, 5, 7, 5, 3, 5, 7, 5, 3, 5],
      type: "line",
    },
    {
      name: "PLN",
      data: [4, 4.5, 5, 5.5, 6, 5.5, 5, 4.5, 4, 4.5],
      type: "line",
    },
  ],
};

export const LineChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, lineChartOptions);

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
        className={clsx("highcharts-theme-salt", {
          "salt-line-patterns": patterns,
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
