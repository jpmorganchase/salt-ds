import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/donutOptions";

export interface DonutChartProps {
  patterns?: boolean;
}

const DonutChart: FC<DonutChartProps> = ({ patterns = false }) => {
  const DonutRef = useRef<HighchartsReact.RefObject>(null);

  const donutChartOptions = useChart(DonutRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={donutChartOptions}
        ref={DonutRef}
      />
    </div>
  );
};

export default DonutChart;
