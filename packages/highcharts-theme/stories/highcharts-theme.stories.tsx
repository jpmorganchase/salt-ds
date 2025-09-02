import Highcharts from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import {
  BarChart as BarChartComponent,
  DonutChart as DonutChartComponent,
  LineChart as LineChartComponent,
  PieChart as PieChartComponent,
} from "../src/examples";
import {
  barOptions,
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

export const BarChart = {
  render: (args: { patterns?: boolean }) => <BarChartComponent {...args} />,
  args: {
    patterns: false,
    options: barOptions,
  },
};
