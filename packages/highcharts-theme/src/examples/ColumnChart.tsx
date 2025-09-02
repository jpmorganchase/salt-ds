import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/columnOptions";

export interface ColumnChartProps {
  patterns?: boolean;
}

const ColumnChart: FC<ColumnChartProps> = ({ patterns = false }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const columnOptions: Options = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={columnOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default ColumnChart;
