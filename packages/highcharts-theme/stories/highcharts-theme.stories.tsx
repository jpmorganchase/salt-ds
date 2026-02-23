import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import {
  AreaChart as AreaChartComponent,
  BarChart as BarChartComponent,
  BoxPlotChart as BoxPlotChartComponent,
  BubbleChart as BubbleChartComponent,
  BulletChart as BulletChartComponent,
  CandlestickChart as CandlestickChartComponent,
  ColumnChart as ColumnChartComponent,
  DonutChart as DonutChartComponent,
  Heatmap as HeatmapComponent,
  LineChart as LineChartComponent,
  PieChart as PieChartComponent,
  ScatterChart as ScatterChartComponent,
  SingleColorHeatmap as SingleColorHeatmapComponent,
  StackedBarChart as StackedBarChartComponent,
  WaterfallChart as WaterfallChartComponent,
} from "../src/examples";
import {
  areaOptions,
  barOptions,
  boxPlotOptions,
  bubbleOptions,
  bulletOptions,
  candlestickOptions,
  columnOptions,
  donutOptions,
  heatmapOptions,
  lineOptions,
  pieOptions,
  scatterOptions,
  singleColorHeatmapOptions,
  stackedBarOptions,
  waterfallOptions,
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

export const AreaChart = {
  render: (args: ChartStoryArgs) => <AreaChartComponent {...args} />,
  args: {
    patterns: false,
    options: areaOptions,
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

export const BubbleChart = {
  render: (args: ChartStoryArgs) => <BubbleChartComponent {...args} />,
  args: {
    patterns: false,
    options: bubbleOptions,
  },
};

export const CandlestickChart = {
  render: (args: ChartStoryArgs) => <CandlestickChartComponent {...args} />,
  args: {
    patterns: false,
    options: candlestickOptions,
  },
};

export const StackedBarChart = {
  render: (args: ChartStoryArgs) => <StackedBarChartComponent {...args} />,
  args: {
    patterns: false,
    options: stackedBarOptions,
  },
};

export const BoxPlotChart = {
  render: (args: ChartStoryArgs) => <BoxPlotChartComponent {...args} />,
  args: {
    patterns: false,
    options: boxPlotOptions,
  },
};

export const BulletChart = {
  render: (args: ChartStoryArgs) => <BulletChartComponent {...args} />,
  args: {
    patterns: false,
    options: bulletOptions,
  },
};

export const BarChart = {
  render: (args: ChartStoryArgs) => <BarChartComponent {...args} />,
  args: {
    patterns: false,
    options: barOptions,
  },
};

export const ColumnChart = {
  render: (args: ChartStoryArgs) => <ColumnChartComponent {...args} />,
  args: {
    patterns: false,
    options: columnOptions,
  },
};

export const ScatterChart = {
  render: (args: ChartStoryArgs) => <ScatterChartComponent {...args} />,
  args: {
    patterns: false,
    options: scatterOptions,
  },
};

export const WaterfallChart = {
  render: (args: ChartStoryArgs) => <WaterfallChartComponent {...args} />,
  args: {
    patterns: false,
    options: waterfallOptions,
  },
};

export const Heatmap = {
  render: (args: ChartStoryArgs) => <HeatmapComponent {...args} />,
  args: {
    patterns: false,
    options: heatmapOptions,
  },
};

export const SingleColorHeatmap = {
  render: (args: ChartStoryArgs) => <SingleColorHeatmapComponent {...args} />,
  args: {
    patterns: false,
    options: singleColorHeatmapOptions,
  },
};
