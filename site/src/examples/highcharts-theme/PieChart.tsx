import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibilty tab.
accessibility(Highcharts);

const options: Options = {
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
      "A pie chart showing a breakdown of bank revenue by product line. There are 20 categories, each shown with equal share (5%) for demonstration purposes.",
  },
  series: [
    {
      type: "pie",
      name: "Revenue by product line",
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

export const PieChart = () => {
  const pieRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const pieChartOptions = useChart(pieRef, options);

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
          options={pieChartOptions}
          ref={pieRef}
        />
      </div>
    </div>
  );
};
