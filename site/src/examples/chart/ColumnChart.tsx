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

const columnChartOptions: Options = {
  chart: {
    type: "column",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A column chart comparing revenue across regions. Each category shows a single column representing the total value for that region.",
    point: {
      valuePrefix: "$",
      valueSuffix: "M",
    },
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
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">&#36;{point.y}M</span>',
  },
  series: [
    {
      name: "Revenue",
      type: "column",
      data: [5, 3, 4, 7],
    },
  ],
};

export const ColumnChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, columnChartOptions, {
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
