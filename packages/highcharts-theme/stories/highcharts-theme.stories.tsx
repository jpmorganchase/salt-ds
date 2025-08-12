import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";
import type { Decorator } from "@storybook/react-vite";
import Highcharts from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import {
  DonutChart as DonutChartComponent,
  LineChart as LineChartComponent,
} from "../src/examples";

accessibility(Highcharts);

const withHighchartsTheme: Decorator = (Story) => {
  Highcharts.setOptions(highchartsOptionsSalt);
  return <Story />;
};

export default {
  title: "Highcharts/Highcharts Theme",
  component: HighchartsReact,
  decorators: [withHighchartsTheme],
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
  },
};

export const DonutChart = {
  render: (args: { patterns?: boolean }) => <DonutChartComponent {...args} />,
  args: {
    patterns: false,
  },
};
