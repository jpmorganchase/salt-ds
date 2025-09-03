import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import bullet from "highcharts/modules/bullet";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

bullet(Highcharts);
accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "bar",
    height: 170,
  },
  title: {
    text: "Revenue Performance vs Target",
  },
  accessibility: {
    description:
      "A bullet chart showing revenue performance vs target for different business units.",
  },
  xAxis: {
    categories: ["North America", "Europe", "Asia Pacific", "Latin America"],
    title: {
      text: "Geography",
    },
  },
  yAxis: {
    title: {
      text: "Revenue (Millions USD)",
    },
    plotBands: [
      {
        from: 0,
        to: 50,
        className: "contrast-lowest",
      },
      {
        from: 50,
        to: 100,
        className: "contrast-low",
      },
      {
        from: 100,
        to: 120,
        className: "contrast-medium",
      },
    ],
    gridLineWidth: 0,
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span><br/><span>Target: </span><span class="value">${point.target}M</span>',
    stickOnContact: true,
  },
  series: [
    {
      name: "Current Revenue",
      type: "bullet",
      data: [{ y: 85, target: 100 }],
    },
  ],
};

export const BulletChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const bulletOptions = useChart(chartRef, options);

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
          options={bulletOptions}
          ref={chartRef}
        />
      </div>
    </div>
  );
};
