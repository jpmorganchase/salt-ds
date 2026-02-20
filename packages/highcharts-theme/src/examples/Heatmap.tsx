import {
  type ThresholdColorAxisConfig,
  useChart,
} from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import heatmap from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { heatmapOptions } from "./dependencies";

heatmap(Highcharts);

const heatmapColorConfig: ThresholdColorAxisConfig = {
  lowColorToken: "--salt-sentiment-positive-dataviz",
  highColorToken: "--salt-sentiment-negative-dataviz",
  min: -50,
  max: 50,
  threshold: 0,
};

export interface HeatmapProps {
  patterns?: boolean;
  options: Options;
}

const HeatmapChart: FC<HeatmapProps> = ({
  patterns = false,
  options = heatmapOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options, {
    colorAxis: heatmapColorConfig,
  });

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default HeatmapChart;
