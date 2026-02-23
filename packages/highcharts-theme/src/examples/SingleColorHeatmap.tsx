import {
  type SingleColorAxisConfig,
  useChart,
} from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import heatmap from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { singleColorHeatmapOptions } from "./dependencies";

heatmap(Highcharts);

const singleColorConfig: SingleColorAxisConfig = {
  colorToken: "--salt-category-4-dataviz",
  min: 0,
  max: 100,
};

export interface SingleColorHeatmapProps {
  patterns?: boolean;
  options: Options;
}

const SingleColorHeatmapChart: FC<SingleColorHeatmapProps> = ({
  patterns = false,
  options = singleColorHeatmapOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options, {
    colorAxis: singleColorConfig,
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

export default SingleColorHeatmapChart;
