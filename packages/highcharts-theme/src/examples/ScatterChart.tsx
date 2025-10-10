import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { scatterChartOptions } from "./dependencies";

export interface ScatterChartProps {
  patterns?: boolean;
  options: Options;
}

const ScatterChart: FC<ScatterChartProps> = ({
  patterns = false,
  options = scatterChartOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", "axes-grid-lines", {
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

export default ScatterChart;
