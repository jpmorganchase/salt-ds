import { Switch, Tooltip } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import stock from "highcharts/modules/stock";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import { LinkBase } from "../../components/link/Link";
import styles from "./index.module.css";

stock(Highcharts);
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const candlestickChartOptions: Options = {
  chart: {
    type: "candlestick",
  },
  title: {
    text: "Stock price movements",
  },
  accessibility: {
    description:
      "A candlestick chart showing stock price movements over time. Each candlestick represents the open, high, low, and close prices for a trading period.",
  },
  xAxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    title: {
      text: "Month",
    },
  },
  yAxis: {
    title: {
      text: "Stock price ($)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>Open: </span><span class="value">&#36;{point.open}</span><br/>' +
      '<span>High: </span><span class="value">&#36;{point.high}</span><br/>' +
      '<span>Low: </span><span class="value">&#36;{point.low}</span><br/>' +
      '<span>Close: </span><span class="value">&#36;{point.close}</span>',
  },
  legend: {
    enabled: false,
  },
  series: [
    {
      name: "Stock Price",
      type: "candlestick",
      data: [
        { open: 150, high: 165, low: 148, close: 162 },
        { open: 162, high: 170, low: 155, close: 158 },
        { open: 158, high: 168, low: 152, close: 165 },
        { open: 165, high: 172, low: 160, close: 170 },
        { open: 170, high: 178, low: 168, close: 175 },
        { open: 175, high: 180, low: 170, close: 172 },
        { open: 172, high: 176, low: 165, close: 168 },
        { open: 168, high: 175, low: 162, close: 173 },
        { open: 173, high: 182, low: 170, close: 180 },
        { open: 180, high: 188, low: 178, close: 185 },
        { open: 185, high: 190, low: 180, close: 182 },
        { open: 182, high: 186, low: 175, close: 178 },
      ],
    },
  ],
};

export const CandlestickChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, candlestickChartOptions);

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
