import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { barOptions } from "./dependencies/barOptions";

export interface BarChartProps {
  patterns?: boolean;
  options: Options;
}

const BarChart: FC<BarChartProps> = ({
  patterns = false,
  options = barOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions: Options = useChart(chartRef, options);

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

export default BarChart;
