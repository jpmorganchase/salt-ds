import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { columnOptions } from "./dependencies";

export interface ColumnChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const ColumnChart: FC<ColumnChartProps> = ({
  fillPatterns = false,
  options = columnOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return (
    <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />
  );
};

export default ColumnChart;
