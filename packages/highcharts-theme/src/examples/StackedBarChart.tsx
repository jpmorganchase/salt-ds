import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { stackedBarOptions } from "./dependencies";

export interface StackedBarChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const StackedBarChart: FC<StackedBarChartProps> = ({
  fillPatterns = false,
  options = stackedBarOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />;
};

export default StackedBarChart;
