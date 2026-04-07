import { useChart } from "@salt-ds/highcharts-theme";
import Highcharts, { type Options } from "highcharts";
import bullet from "highcharts/modules/bullet";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { bulletOptions } from "./dependencies";

bullet(Highcharts);

export interface BulletChartProps {
  fillPatterns?: boolean;
  options: Options;
}

const BulletChart: FC<BulletChartProps> = ({
  fillPatterns = false,
  options = bulletOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const chartOptions = useChart(chartRef, options, {
    fillPatterns,
  });

  return <HighchartsReact highcharts={Highcharts} options={chartOptions} ref={chartRef} />;
};

export default BulletChart;
