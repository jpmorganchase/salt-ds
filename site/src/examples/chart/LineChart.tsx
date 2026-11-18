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

const lineChartOptions: Options = {
  chart: {
    type: "line",
    spacingRight: 52,
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
  plotOptions: {
    line: {
      dataLabels: {
        enabled: true,
        align: "left",
        x: 6,
        crop: false,
        overflow: "allow",
        formatter() {
          return this.point.index === this.series.points.length - 1
            ? this.series.name
            : undefined;
        },
      },
    },
  },
  series: [
    {
      name: "MXN",
      data: [4, 5, 6, 6.5, 6.3, 7, 6, 5, 4, 3],
      type: "line",
      marker: { enabled: true, radius: 3, symbol: "circle" },
    },
    {
      name: "KRW",
      data: [5, 6, 5, 4, 5, 6, 5, 4, 5, 6],
      type: "line",
      marker: { enabled: true, radius: 3, symbol: "diamond" },
    },
    {
      name: "TRY",
      data: [3, 5, 7, 5, 3, 5, 7, 5, 3, 5],
      type: "line",
      marker: { enabled: true, radius: 3, symbol: "square" },
    },
    {
      name: "PLN",
      data: [4, 4.5, 5, 5.5, 6, 5.5, 5, 4.5, 4, 4.5],
      type: "line",
      marker: { enabled: true, radius: 3, symbol: "triangle" },
    },
  ],
};

export const LineChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, lineChartOptions, {
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
