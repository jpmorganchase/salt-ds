import type { Decorator } from "@storybook/react-vite";
import Highcharts from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";

import "@salt-ds/highcharts-theme/stories/highcharts-default.css";
import "@salt-ds/highcharts-theme/index.css";

import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";

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
