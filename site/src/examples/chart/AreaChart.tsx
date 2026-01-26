import { Switch } from "@salt-ds/core";
import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import { useRef, useState } from "react";
import styles from "./index.module.css";

// This example uses Highcharts v10.2.0 - for more information on enabling the accessibility module in v11+, visit the accessibility tab.
accessibility(Highcharts);

const areaChartOptions: Options = {
  chart: { type: "area" },
  title: {
    text: "Asset class balances since 1940",
  },
  accessibility: {
    description:
      "Area chart comparing asset class balances since 1940. Government Bonds remain largest across the period, while Corporate Bonds and Municipal Bonds are lower. Values in US dollars.",
    point: {
      valuePrefix: "$",
    },
  },
  yAxis: {
    title: {
      text: "Amount (USD)",
    },
  },
  xAxis: {
    title: {
      text: "Year (from 1940)",
    },
    accessibility: {
      description: "Years from 1940 onward",
    },
  },
  tooltip: {
    headerFormat: '<span class="title">{point.key}</span><br/>',
    pointFormat:
      '<span class="label">{series.name}: </span><span class="value">$' +
      "{point.y:,.0f}</span>",
  },
  plotOptions: {
    area: {
      pointStart: 1940,
      marker: {
        enabled: false,
        states: { hover: { enabled: true } },
      },
    },
  },
  series: [
    {
      name: "Government Bonds",
      type: "area",
      data: [
        6, 11, 32, 110, 235, 369, 640, 1005, 1436, 2063, 3057, 4618, 6444, 9822,
        15468, 20434, 24126, 27387, 29459, 31056, 31982, 32040, 31233, 29224,
        27342, 26662, 26956, 27912, 28999, 28965, 27826, 25579, 25722, 24826,
        24605, 24304, 23464, 23708, 24099, 24357, 24237, 24401, 24344, 23586,
        22380, 21004, 17287, 14747, 13076, 12555, 12144, 11009, 10950, 10871,
        10824, 10577, 10527, 10475, 10421, 10358, 10295, 10104, 9914, 9620,
        9326, 5113, 5113, 4954, 4804, 4761, 4717, 4368, 4018,
      ],
    },
    {
      name: "Corporate Bonds",
      type: "area",
      data: [
        4, 157, 321, 522, 753, 240, 566, 953, 1383, 1941, 1987, 3152, 4489,
        6834, 10654, 13282, 15832, 18102, 19598, 20786, 20788, 20976, 20601,
        19446, 18372, 17330, 17671, 18443, 19299, 19427, 18087, 16776, 17019,
        16587, 16593, 15798, 15402, 15710, 16114, 16432, 15754, 16011, 16124,
        15781, 15147, 13653, 11387, 9886, 8949, 8761, 7894, 7306, 7418, 7516,
        7636, 6875, 6993, 7109, 7224, 7333, 6692, 6718, 6744, 6703, 6662, 3323,
        3473, 3520, 3573, 3695, 3066, 2989, 2912,
      ],
    },
    {
      name: "Municipal Bonds",
      type: "area",
      data: [
        3, 125, 254, 410, 586, 766, 1008, 452, 766, 1168, 1736, 2558, 3500,
        5140, 6961, 9315, 11097, 12684, 13737, 14575, 15112, 14418, 14175,
        13391, 12664, 12478, 12730, 13280, 13050, 13154, 12762, 11871, 12055,
        11772, 11792, 10937, 10679, 10909, 11205, 11441, 11507, 11700, 10955,
        10734, 10311, 9812, 8259, 7236, 6604, 5650, 5585, 5194, 5288, 5372,
        5471, 5480, 4737, 4834, 4929, 5021, 5113, 5147, 5181, 4329, 4317, 2541,
        2661, 2709, 2762, 2862, 2123, 2086, 2048,
      ],
    },
  ],
};

export const AreaChart = () => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const [patterns, setPatterns] = useState(false);

  const chartOptions = useChart(chartRef, areaChartOptions);

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
