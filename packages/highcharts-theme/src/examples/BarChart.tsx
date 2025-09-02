import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/barOptions";

export interface BarChartProps {
  patterns?: boolean;
}

const BarChart: FC<BarChartProps> = ({ patterns = false }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const barChartOptions: Options = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={barChartOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default BarChart;
