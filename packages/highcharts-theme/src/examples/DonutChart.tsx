import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { donutOptions } from "./dependencies";

export interface DonutChartProps {
  patterns?: boolean;
  options: Options;
}

const DonutChart: FC<DonutChartProps> = ({
  patterns = false,
  options = donutOptions,
}) => {
  const donutRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(donutRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={donutRef}
      />
    </div>
  );
};

export default DonutChart;
