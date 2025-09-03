import { useChart } from "@salt-ds/highcharts-theme";
import { clsx } from "clsx";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { type FC, useRef } from "react";
import { options } from "./dependencies/pieOptions";

export interface PieChartProps {
  patterns?: boolean;
}

const PieChart: FC<PieChartProps> = ({ patterns = false }) => {
  const PieRef = useRef<HighchartsReact.RefObject>(null);

  const pieChartOptions = useChart(PieRef, options);

  return (
    <div
      className={clsx("highcharts-theme-salt", {
        "salt-fill-patterns": patterns,
      })}
    >
      <HighchartsReact
        highcharts={Highcharts}
        options={pieChartOptions}
        ref={PieRef}
      />
    </div>
  );
};

export default PieChart;
