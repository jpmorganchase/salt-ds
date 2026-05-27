import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

highchartsMore(Highcharts);
patternFill(Highcharts);
accessibility(Highcharts);

const waterfallChartOptions: Options = {
  chart: {
    type: "waterfall",
  },
  title: {
    text: "Regional revenue by product",
  },
  accessibility: {
    description:
      "A waterfall chart showing the cumulative effect of sequential positive and negative values on revenue.",
    point: {
      valuePrefix: "$",
      valueSuffix: "M",
    },
  },
  xAxis: {
    categories: [
      "Start",
      "Product Sales",
      "Service Revenue",
      "Operating Costs",
      "Marketing",
      "Total",
    ],
    title: {
      text: "Category",
    },
  },
  yAxis: {
    title: {
      text: "Revenue ($ millions)",
    },
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y}M</span>',
  },
  legend: {
    enabled: false,
  },
  plotOptions: {
    waterfall: {
      dataLabels: {
        enabled: true,
        formatter: function () {
          return `$${this.y}M`;
        },
      },
    },
  },
  series: [
    {
      name: "Revenue",
      type: "waterfall",
      data: [
        { y: 50 },
        { y: 25 },
        { y: 15 },
        { y: -20 },
        { y: -10 },
        { isSum: true },
      ],
    },
  ],
};

export const WaterfallChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, waterfallChartOptions, {
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
