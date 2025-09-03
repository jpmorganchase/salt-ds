import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { lineOptions } from "./dependencies";

export interface LineChartProps {
  patterns?: boolean;
  options?: Options;
}

const LineChart: FC<LineChartProps> = ({
  patterns = false,
  options = lineOptions,
}) => {
  const LineChartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(LineChartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-line-patterns": patterns,
      })}
    >
      <HighchartsReact
        ref={LineChartRef}
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  );
};

export default LineChart;
