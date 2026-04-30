import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import heatmap from "highcharts/modules/heatmap";
import patternFill from "highcharts/modules/pattern-fill";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import type { SaltColorAxis } from "../color-axis";
import { heatmapOptions, heatmapSaltColorAxis } from "./dependencies";

heatmap(Highcharts);
patternFill(Highcharts);

export interface HeatmapChartProps {
  fillPatterns?: boolean;
  options: Options;
  saltColorAxis?: SaltColorAxis;
}

const HeatmapChart: FC<HeatmapChartProps> = ({
  fillPatterns = false,
  options = heatmapOptions,
  saltColorAxis = heatmapSaltColorAxis,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
    saltColorAxis,
  });

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartRef}
    />
  );
};

export default HeatmapChart;
