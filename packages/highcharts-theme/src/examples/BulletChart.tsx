import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts, { type Options } from "highcharts";
import bullet from "highcharts/modules/bullet";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/bulletOptions";

bullet(Highcharts);

export interface BulletChartProps {
  patterns?: boolean;
}

const BulletChart: FC<BulletChartProps> = ({ patterns = false }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  const bulletOptions: Options = useChart(chartRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={bulletOptions}
        ref={chartRef}
      />
    </div>
  );
};

export default BulletChart;
