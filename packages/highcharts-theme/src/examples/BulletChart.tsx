import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import bullet from "highcharts/modules/bullet";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { bulletOptions } from "./dependencies";

bullet(Highcharts);

export interface BulletChartProps {
  patterns?: boolean;
  options?: Options;
}

const BulletChart: FC<BulletChartProps> = ({
  patterns = false,
  options = bulletOptions,
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const chartOptions: Options = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
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

export default BulletChart;
