import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import accessibility from "highcharts/modules/accessibility";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import bubbleStyles from "./BubbleChart.module.css";
import styles from "./index.module.css";

// This example uses Highcharts v10 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
highchartsMore(Highcharts);
patternFill(Highcharts);
accessibility(Highcharts);

const assetGroups = [
  {
    name: "Equity",
    points: [
      { id: "1", name: "Stocks", x: 6.5, y: 10, z: 45 },
      { id: "2", name: "Tech", x: 7.5, y: 12.5, z: 18 },
      { id: "3", name: "Intl", x: 5.5, y: 6.5, z: 4 },
    ],
  },
  {
    name: "Fixed Income",
    points: [
      { id: "4", name: "Bonds", x: 2, y: 8, z: 25 },
      { id: "5", name: "Cash", x: 1, y: 4, z: 12 },
      { id: "6", name: "Short", x: 3.2, y: 5, z: 6 },
    ],
  },
  {
    name: "Alternative",
    points: [
      { id: "7", name: "Crypto", x: 8.5, y: 14, z: 2 },
      { id: "8", name: "Property", x: 4, y: 10.5, z: 8 },
      { id: "9", name: "Gold", x: 4.5, y: 3, z: 3 },
    ],
  },
];

const bubbleChartOptions: Options = {
  chart: {
    type: "bubble",
    // Keep bubble sizes comparable when an asset group is hidden or restored.
    ignoreHiddenSeries: false,
  },
  title: {
    text: "Asset class risk-return profile (bubble size = market cap)",
  },
  accessibility: {
    description:
      "A bubble chart showing the relationship between risk (x-axis) and expected return (y-axis). The bubble size represents market capitalization in trillions of dollars.",
    point: {
      descriptionFormatter: (point) =>
        `${point.name}, Risk: ${point.x}, Return: ${point.y}%, Market cap: $${(point as unknown as { z: number }).z}T. Point ${point.index + 1} of ${point.series.points.length}.`,
    },
  },
  xAxis: {
    title: { text: "Risk score" },
    labels: {
      format: "{value}",
    },
    accessibility: { description: "Risk score from 1 to 10" },
    min: 0,
    max: 10,
    tickInterval: 2,
  },
  yAxis: {
    title: { text: "Expected return (%)" },
    labels: {
      format: "{value}",
    },
    tickInterval: 4,
  },
  legend: { enabled: true },
  plotOptions: {
    bubble: {
      dataLabels: {
        enabled: true,
        allowOverlap: false,
        format: "{point.name}",
        padding: 0,
      },
      // Percentages scale with the plot area instead of occupying 50–90px
      // even when the example is displayed at phone widths.
      minSize: "8%",
      maxSize: "18%",
    },
  },
  responsive: {
    rules: [
      {
        condition: { maxWidth: 480 },
        chartOptions: {
          plotOptions: { bubble: { dataLabels: { format: "{point.id}" } } },
          yAxis: { title: { margin: 4 } },
          legend: {
            align: "center",
            layout: "horizontal",
            verticalAlign: "bottom",
            y: 0,
          },
        },
      },
    ],
  },
  tooltip: {
    headerFormat: "<span>{series.name}</span><br/>",
    pointFormat:
      "<span>{point.name}</span><br/>" +
      '<span>Risk: </span><span class="value">{point.x}</span><br/>' +
      '<span>Return: </span><span class="value">{point.y}%</span><br/>' +
      '<span>Market cap: </span><span class="value">&#36;{point.z}T</span>',
  },
  series: assetGroups.map(({ name, points }) => ({
    type: "bubble" as const,
    name,
    data: points,
  })),
};

export const BubbleChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, bubbleChartOptions, {
    fillPatterns: patterns,
  });

  return (
    <div className={`${styles.chartContainer} ${bubbleStyles.container}`}>
      <div className={styles.controlsRow}>
        <Switch
          label="Show patterns"
          checked={patterns}
          onChange={(e) => setPatterns(e.target.checked)}
        />
      </div>
      <HighchartsReact
        containerProps={{ className: bubbleStyles.chart }}
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
      <ul className={styles.chartGroupKey} aria-label="Asset class groups">
        {assetGroups.map(({ name, points }) => (
          <li key={name}>
            <strong>{name}</strong>
            <span>
              {points.map((point, index) => (
                <span key={point.id}>
                  {index > 0 && ", "}
                  <span className={bubbleStyles.pointId}>{point.id}. </span>
                  {point.name}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
