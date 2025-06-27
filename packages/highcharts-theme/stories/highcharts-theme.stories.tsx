import type { Decorator } from "@storybook/react-vite";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import accessibility from "highcharts/modules/accessibility";

import "../index.css";

import { saltHCThemeOptions } from "../src";

accessibility(Highcharts);

const withHighchartsTheme: Decorator = (Story) => {
  Highcharts.setOptions(saltHCThemeOptions);
  return <Story />;
};

export default {
  title: "Highcharts/Highcharts Theme",
  component: HighchartsReact,
  decorators: [withHighchartsTheme],
  parameters: {
    // chromatic: {
    //   disableSnapshot: false,
    // },
  },
};

export { LineChart } from "../src/examples";
