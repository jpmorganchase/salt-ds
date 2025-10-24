import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

highchartsMore(Highcharts);
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const boxPlotChartOptions: Options = {
  chart: {
    type: "boxplot",
  },
  title: {
    text: "Quarterly sales distribution by region",
  },
  accessibility: {
    description:
      "Box plot chart showing quarterly sales distribution across four regions. Each box shows minimum, first quartile, median, third quartile, and maximum sales values in thousands of dollars.",
  },
  xAxis: {
    categories: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
    title: {
      text: "Quarter",
    },
  },
  yAxis: {
    title: {
      text: "Sales ($K)",
    },
  },
  tooltip: {
    headerFormat: '<span class="title">{series.name} - {point.key}</span><br/>',
    pointFormat:
      '<span class="label">Maximum: </span><span class="value">$' +
      "{point.high}K</span><br/>" +
      '<span class="label">Q3: </span><span class="value">$' +
      "{point.q3}K</span><br/>" +
      '<span class="label">Median: </span><span class="value">$' +
      "{point.median}K</span><br/>" +
      '<span class="label">Q1: </span><span class="value">$' +
      "{point.q1}K</span><br/>" +
      '<span class="label">Minimum: </span><span class="value">$' +
      "{point.low}K</span>",
  },
  plotOptions: {
    boxplot: {
      pointWidth: 40,
    },
  },
  series: [
    {
      name: "North America",
      type: "boxplot",
      data: [
        [45, 62, 75, 88, 105], // Q1: [min, Q1, median, Q3, max]
        [52, 68, 82, 95, 112], // Q2
        [48, 71, 85, 98, 118], // Q3
        [58, 78, 92, 108, 125], // Q4
        [62, 82, 98, 115, 135], // Q5
        [55, 75, 90, 105, 128], // Q6
      ],
    },
    {
      name: "Europe",
      type: "boxplot",
      data: [
        [38, 55, 68, 82, 98], // Q1
        [42, 60, 75, 88, 105], // Q2
        [45, 65, 80, 95, 112], // Q3
        [50, 70, 85, 100, 120], // Q4
        [55, 75, 92, 108, 130], // Q5
        [48, 68, 85, 102, 125], // Q6
      ],
    },
    {
      name: "Asia Pacific",
      type: "boxplot",
      data: [
        [35, 50, 62, 75, 92], // Q1
        [40, 58, 72, 85, 102], // Q2
        [48, 68, 85, 100, 120], // Q3
        [55, 75, 92, 110, 132], // Q4
        [60, 82, 100, 118, 145], // Q5
        [58, 78, 95, 112, 138], // Q6
      ],
    },
    {
      name: "Latin America",
      type: "boxplot",
      data: [
        [28, 42, 55, 68, 85], // Q1
        [32, 48, 62, 75, 92], // Q2
        [35, 52, 68, 82, 100], // Q3
        [40, 58, 75, 90, 110], // Q4
        [45, 65, 82, 98, 120], // Q5
        [42, 60, 78, 95, 115], // Q6
      ],
    },
  ],
};

export const BoxPlotChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, boxPlotChartOptions);

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
          options={chartOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
