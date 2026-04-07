import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { lineOptions } from "./dependencies";

export interface LineChartProps {
  options: Options;
}

const LineChart: FC<LineChartProps> = ({ options = lineOptions }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions = useChart(chartRef, options);

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />;
};

export default LineChart;
