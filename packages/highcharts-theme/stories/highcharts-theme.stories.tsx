import Highcharts, { type Options } from "highcharts";
import accessibility from "highcharts/modules/accessibility";
import HighchartsReact from "highcharts-react-official";
import type { SaltColorAxis } from "../src/color-axis";
import {
  AreaChart as AreaChartComponent,
  BarChart as BarChartComponent,
  BoxPlotChart as BoxPlotChartComponent,
  BubbleChart as BubbleChartComponent,
  BulletChart as BulletChartComponent,
  CandlestickChart as CandlestickChartComponent,
  ColumnChart as ColumnChartComponent,
  DonutChart as DonutChartComponent,
  DualAxisChart as DualAxisChartComponent,
  HeatmapChart as HeatmapChartComponent,
  LineChart as LineChartComponent,
  PieChart as PieChartComponent,
  ScatterChart as ScatterChartComponent,
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
  dualAxisOptions,
  heatmapDataClassesOptions,
  heatmapDataClassesSaltColorAxis,
  heatmapDiscreteRangesOptions,
  heatmapDiscreteRangesSaltColorAxis,
  heatmapOptions,
  heatmapSaltColorAxis,
  heatmapThresholdOptions,
  heatmapThresholdSaltColorAxis,
  heatmapTwoColorDiscreteRangesOptions,
  heatmapTwoColorDiscreteRangesSaltColorAxis,
  lineOptions,
  pieOptions,
  scatterOptions,
  stackedBarOptions,
  waterfallOptions,
} from "../src/examples/dependencies";

accessibility(Highcharts);

interface ChartStoryArgs {
  fillPatterns?: boolean;
  options: Options;
}

interface HeatmapStoryArgs extends ChartStoryArgs {
  saltColorAxis?: SaltColorAxis;
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
    fillPatterns: {
      control: "boolean",
      description: "Toggle fill patterns for better accessibility",
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
    fillPatterns: false,
    options: lineOptions,
  },
};

export const DualAxisChart = {
  render: (args: ChartStoryArgs) => <DualAxisChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: dualAxisOptions,
  },
};

export const HeatmapChart = {
  render: (args: HeatmapStoryArgs) => <HeatmapChartComponent {...args} />,
  argTypes: {
    saltColorAxis: {
      control: "object",
      description: "Salt hook-level colorAxis configuration",
    },
  },
  args: {
    fillPatterns: false,
    options: heatmapOptions,
    saltColorAxis: heatmapSaltColorAxis,
  },
};

export const HeatmapDataClassesChart = {
  render: (args: HeatmapStoryArgs) => <HeatmapChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: heatmapDataClassesOptions,
    saltColorAxis: heatmapDataClassesSaltColorAxis,
  },
};

export const HeatmapDiscreteRangesChart = {
  render: (args: HeatmapStoryArgs) => <HeatmapChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: heatmapDiscreteRangesOptions,
    saltColorAxis: heatmapDiscreteRangesSaltColorAxis,
  },
};

export const HeatmapTwoColorDiscreteRangesChart = {
  render: (args: HeatmapStoryArgs) => <HeatmapChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: heatmapTwoColorDiscreteRangesOptions,
    saltColorAxis: heatmapTwoColorDiscreteRangesSaltColorAxis,
  },
};

export const HeatmapThresholdChart = {
  render: (args: HeatmapStoryArgs) => <HeatmapChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: heatmapThresholdOptions,
    saltColorAxis: heatmapThresholdSaltColorAxis,
  },
};

export const AreaChart = {
  render: (args: ChartStoryArgs) => <AreaChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: areaOptions,
  },
};

export const DonutChart = {
  render: (args: ChartStoryArgs) => <DonutChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: donutOptions,
  },
};

export const PieChart = {
  render: (args: ChartStoryArgs) => <PieChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: pieOptions,
  },
};

export const BubbleChart = {
  render: (args: ChartStoryArgs) => <BubbleChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: bubbleOptions,
  },
};

export const CandlestickChart = {
  render: (args: ChartStoryArgs) => <CandlestickChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: candlestickOptions,
  },
};

export const StackedBarChart = {
  render: (args: ChartStoryArgs) => <StackedBarChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: stackedBarOptions,
  },
};

export const BoxPlotChart = {
  render: (args: ChartStoryArgs) => <BoxPlotChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: boxPlotOptions,
  },
};

export const BulletChart = {
  render: (args: ChartStoryArgs) => <BulletChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: bulletOptions,
  },
};

export const BarChart = {
  render: (args: ChartStoryArgs) => <BarChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: barOptions,
  },
};

export const ColumnChart = {
  render: (args: ChartStoryArgs) => <ColumnChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: columnOptions,
  },
};

export const ScatterChart = {
  render: (args: ChartStoryArgs) => <ScatterChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: scatterOptions,
  },
};

export const WaterfallChart = {
  render: (args: ChartStoryArgs) => <WaterfallChartComponent {...args} />,
  args: {
    fillPatterns: false,
    options: waterfallOptions,
  },
};
