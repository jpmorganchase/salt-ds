import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

patternFill(Highcharts);
accessibility(Highcharts);

const donutChartOptions: Options = {
  chart: {
    type: "pie",
  },
  title: {
    text: "Illustrative bank revenue mix",
    align: "center",
  },
  tooltip: {
    enabled: false,
  },
  accessibility: {
    description:
      "An illustrative donut chart of bank revenue by business line. Cards has the largest share at 22%, followed by Deposits at 20%, Lending at 18%, Wealth at 16%, Markets at 14%, and Other at 10%.",
    point: {
      valueSuffix: "%",
    },
  },
  plotOptions: {
    pie: {
      dataLabels: {
        format:
          '{point.name} <span class="value">{point.percentage:.0f}%</span>',
      },
    },
  },
  series: [
    {
      type: "pie",
      name: "Revenue by business line",
      innerSize: "80%",
      data: [
        { name: "Deposits", y: 20 },
        { name: "Cards", y: 22 },
        { name: "Lending", y: 18 },
        { name: "Wealth", y: 16 },
        { name: "Markets", y: 14 },
        { name: "Other", y: 10 },
      ],
    },
  ],
};

export const DonutChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, donutChartOptions, {
    fillPatterns: patterns,
  });

  return (
    <div className={styles.chartContainer}>
      <div className={styles.controlsRow}>
        <Switch
          label="Show patterns"
          checked={patterns}
          onChange={(e) => setPatterns(e.target.checked)}
        />
      </div>
      <HighchartsReact
        className={styles.chart}
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};
