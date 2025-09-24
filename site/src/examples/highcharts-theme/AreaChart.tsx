import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

accessibility(Highcharts);

const options: Options = {
  chart: {
    type: "area",
  },
  accessibility: {
    description:
      "Risk distribution curves showing probability density of portfolio returns across different asset classes.",
  },
  title: {
    text: "Portfolio risk distribution by asset class",
  },
  yAxis: {
    title: {
      text: "Probability density (%)",
    },
  },
  tooltip: {
    headerFormat: "<span>Return: {point.key}%</span><br/>",
    pointFormat:
      '<span>{series.name}: </span><span class="value">{point.y:.2f}%</span>',
    shared: false,
  },
  xAxis: {
    title: {
      text: "Portfolio return (% annualized)",
    },
    accessibility: {
      description:
        "Portfolio return distribution from -25% to +25% showing risk profiles across asset classes",
    },
    categories: Array.from(
      { length: 200 },
      (_, i) => `${Math.round(((i / 200) * 50 - 25) * 100) / 100}`,
    ),
    labels: {
      step: 30,
    },
  },
  series: [
    {
      name: "Conservative portfolio",
      // Bell curve calculation: center=2% return, low volatility (width=1.8), moderate amplitude
      data: Array.from({ length: 200 }, (_, i) => {
        const x = (i / 200) * 10 - 5;
        const center = 0.4; // 2% expected return (x = return/5)
        const amplitude = 24; // Realistic probability density peak
        const width = 1.8; // Low volatility
        const bellValue =
          amplitude * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
        return Math.max(0, bellValue);
      }),
      type: "area",
    },
    {
      name: "Balanced portfolio",
      // Bell curve calculation: center=6% return, moderate volatility (width=2.0), good amplitude
      data: Array.from({ length: 200 }, (_, i) => {
        const x = (i / 200) * 10 - 5;
        const center = 1.2; // 6% expected return (x = return/5)
        const amplitude = 22; // Realistic probability density peak
        const width = 2.0; // Moderate volatility
        const bellValue =
          amplitude * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
        return Math.max(0, bellValue);
      }),
      type: "area",
    },
    {
      name: "Growth portfolio",
      // Bell curve calculation: center=10% return, higher volatility (width=2.2), lower amplitude due to spread
      data: Array.from({ length: 200 }, (_, i) => {
        const x = (i / 200) * 10 - 5;
        const center = 2.0; // 10% expected return (x = return/5)
        const amplitude = 19; // Lower due to wider spread
        const width = 2.2; // Higher volatility
        const bellValue =
          amplitude * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
        return Math.max(0, bellValue);
      }),
      type: "area",
    },
    {
      name: "Aggressive portfolio",
      // Bell curve calculation: center=13% return, high volatility (width=2.5), lower amplitude due to high spread
      data: Array.from({ length: 200 }, (_, i) => {
        const x = (i / 200) * 10 - 5;
        const center = 2.6; // 13% expected return (x = return/5)
        const amplitude = 16; // Lower due to very wide spread
        const width = 2.5; // High volatility
        const bellValue =
          amplitude * Math.exp(-((x - center) ** 2) / (2 * width ** 2));
        return Math.max(0, bellValue);
      }),
      type: "area",
    },
  ],
};

export const AreaChart = () => {
  const AreaChartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const areaDataOptions = useChart(AreaChartRef, options);

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
          options={areaDataOptions}
          ref={AreaChartRef}
        />
      </div>
    </div>
  );
};
