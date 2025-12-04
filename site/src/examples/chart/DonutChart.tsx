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

const donutChartOptions: Options = {
  chart: {
    type: "pie",
  },
  title: {
    text: "Bank revenue mix",
    align: "center",
  },
  tooltip: {
    enabled: false,
  },
  accessibility: {
    description:
      "A donut chart showing a breakdown of bank revenue by product line. There are 20 categories, each shown with equal share (5%) for demonstration purposes.",
  },
  series: [
    {
      type: "pie",
      name: "Revenue by product line",
      innerSize: "80%",
      data: [
        { name: "Checking Accounts", y: 5 },
        { name: "Savings Accounts", y: 5 },
        { name: "Credit Cards", y: 5 },
        { name: "Mortgages", y: 5 },
        { name: "Auto Loans", y: 5 },
        { name: "Personal Loans", y: 5 },
        { name: "Student Loans", y: 5 },
        { name: "Small Business Loans", y: 5 },
        { name: "Wealth Management", y: 5 },
        { name: "Robo-Advisory", y: 5 },
        { name: "Brokerage", y: 5 },
        { name: "Investment Banking", y: 5 },
        { name: "Asset Management", y: 5 },
        { name: "Private Banking", y: 5 },
        { name: "Treasury Services", y: 5 },
        { name: "Payments", y: 5 },
        { name: "Foreign Exchange", y: 5 },
        { name: "Custody Services", y: 5 },
        { name: "Insurance", y: 5 },
        { name: "Compliance & Risk Services", y: 5 },
      ],
    },
  ],
};

export const DonutChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, donutChartOptions);

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
