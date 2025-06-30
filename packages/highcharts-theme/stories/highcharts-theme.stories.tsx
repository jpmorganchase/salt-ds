import type { Decorator } from "@storybook/react-vite";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import accessibility from "highcharts/modules/accessibility";

import "../css/highcharts-sb-only.css";
import "../index.css";

import { highchartsOptionsSalt } from "../src";

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
    // chromatic: {
    //   disableSnapshot: false,
    // },
  },
};

export { LineChart } from "../src/examples";
