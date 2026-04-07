import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import highchartsMore from "highcharts/highcharts-more";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { bubbleOptions } from "./dependencies";

highchartsMore(Highcharts);

export interface BubbleChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const BubbleChart: FC<BubbleChartProps> = ({
  fillPatterns = false,
  options = bubbleOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions: Options = useChart(chartRef, options, {
    fillPatterns,
  });

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartRef}
    />
  );
};

export default BubbleChart;
