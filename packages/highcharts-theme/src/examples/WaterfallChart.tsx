import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { waterfallOptions } from "./dependencies";

export interface WaterfallChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const WaterfallChart: FC<WaterfallChartProps> = ({
  fillPatterns = false,
  options = waterfallOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />;
};

export default WaterfallChart;
