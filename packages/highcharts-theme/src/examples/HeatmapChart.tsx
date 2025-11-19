import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import heatmapModule from "highcharts/modules/heatmap";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { heatmapOptions } from "./dependencies";

heatmapModule(Highcharts);

export interface HeatmapChartProps {
  patterns?: boolean;
  options: Options;
}

const HeatmapChart: FC<HeatmapChartProps> = ({
  patterns = false,
  options = heatmapOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options);

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
