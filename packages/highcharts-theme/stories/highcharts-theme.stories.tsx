import Highcharts from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import {
  ColumnChart as ColumnChartComponent,
  DonutChart as DonutChartComponent,
  LineChart as LineChartComponent,
  PieChart as PieChartComponent,
} from "../src/examples";
import {
  columnOptions,
  donutOptions,
  lineOptions,
  pieOptions,
} from "../src/examples/dependencies";

accessibility(Highcharts);

export default {
  title: "Highcharts/Highcharts Theme",
  component: HighchartsReact,
  parameters: {
    chromatic: {
      disableSnapshot: false,
    },
  },
  argTypes: {
    patterns: {
      control: "boolean",
      description: "Toggle fill/line patterns for better accessibility",
      defaultValue: false,
    },
  },
};

export const LineChart = {
  render: (args: { patterns?: boolean }) => <LineChartComponent {...args} />,
  args: {
    patterns: false,
    options: lineOptions,
  },
};

export const DonutChart = {
  render: (args: { patterns?: boolean }) => <DonutChartComponent {...args} />,
  args: {
    patterns: false,
    options: donutOptions,
  },
};

export const PieChart = {
  render: (args: { patterns?: boolean }) => <PieChartComponent {...args} />,
  args: {
    patterns: false,
    options: pieOptions,
  },
};

export const ColumnChart = {
  render: (args: { patterns?: boolean }) => <ColumnChartComponent {...args} />,
  args: {
    patterns: false,
    options: columnOptions,
  },
};
