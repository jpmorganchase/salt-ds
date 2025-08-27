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
// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibilty tab.
accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "bar",
    height: 180,
  },
  title: {
    text: "Revenue Performance vs Target",
  },
  accessibility: {
    description: "A bullet chart showing revenue performance vs target for Q4",
  },
  xAxis: {
    categories: ["Q4"],
  },
  yAxis: {
    title: {
      text: "Revenue ($M)",
    },
    min: 0,
    max: 100,
    tickPositions: [0, 20, 40, 60, 80, 100],
  },
  tooltip: {
    headerFormat: "<span>{point.key}</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">${point.y}M</span><br/><span>Target: </span><span class="value">${point.target}M</span>',
  },
  series: [
    {
      name: "Current Revenue",
      type: "bullet",
      data: [{ y: 60, target: 80 }],
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
