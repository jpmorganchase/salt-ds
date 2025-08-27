import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import {
  DonutChart as DonutChartComponent,
  LineChart as LineChartComponent,
  PieChart as PieChartComponent,
  StackedBarChart as StackedBarChartComponent,
} from "../src/examples";
import {
  donutOptions,
  lineOptions,
  pieOptions,
  stackedBarOptions,
} from "../src/examples/dependencies";

accessibility(Highcharts);

interface ChartStoryArgs {
  patterns?: boolean;
  options: Options;
}

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
    options: {
      control: "object",
      description: "Highcharts options",
    },
  },
};

export const LineChart = {
  render: (args: ChartStoryArgs) => <LineChartComponent {...args} />,
  args: {
    patterns: false,
    options: lineOptions,
  },
};

export const DonutChart = {
  render: (args: ChartStoryArgs) => <DonutChartComponent {...args} />,
  args: {
    patterns: false,
    options: donutOptions,
  },
};

export const PieChart = {
  render: (args: ChartStoryArgs) => <PieChartComponent {...args} />,
  args: {
    patterns: false,
    options: pieOptions,
  },
};

export const StackedBarChart = {
  render: (args: ChartStoryArgs) => <StackedBarChartComponent {...args} />,
  args: {
    patterns: false,
    options: stackedBarOptions,
  },
};
