import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { pieOptions } from "./dependencies";

export interface PieChartProps {
  patterns?: boolean;
  options: Options;
}

const PieChart: FC<PieChartProps> = ({
  patterns = false,
  options = pieOptions,
}) => {
  const pieRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(pieRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={pieRef}
      />
    </div>
  );
};

export default PieChart;
