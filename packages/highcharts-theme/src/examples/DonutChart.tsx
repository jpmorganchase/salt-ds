import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { donutOptions } from "./dependencies";

export interface DonutChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const DonutChart: FC<DonutChartProps> = ({
  fillPatterns = false,
  options = donutOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return (
    <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />
  );
};

export default DonutChart;
