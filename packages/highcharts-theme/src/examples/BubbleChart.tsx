import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { bubbleOptions } from "./dependencies";

highchartsMore(Highcharts);

export interface BubbleChartProps {
  patterns?: boolean;
  options: Options;
}

const BubbleChart: FC<BubbleChartProps> = ({
  patterns = false,
  options = bubbleOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions: Options = useChart(chartRef, options);

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

export default BubbleChart;
