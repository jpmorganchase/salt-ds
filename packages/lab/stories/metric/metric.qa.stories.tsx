import { Metric, MetricContent, MetricHeader } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react-vite";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Metric/QA",
  component: Metric,
} as Meta<typeof Metric>;

export const AllExamplesGrid: StoryFn<QAContainerProps> = (props) => {
  return (
    <QAContainer
      cols={4}
      vertical
      transposeDensity
      height={1400}
      className="saltMetricQA"
    >
      <Metric
        align="left"
        direction="up"
        size="small"
        orientation="horizontal"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
      <Metric
        align="center"
        direction="down"
        size="medium"
        indicatorPosition="start"
        orientation="horizontal"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
      <Metric
        align="right"
        direction="up"
        size="large"
        orientation="horizontal"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
      <Metric
        align="left"
        direction="up"
        size="small"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
      <Metric
        align="center"
        direction="up"
        size="medium"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
      <Metric
        align="right"
        direction="down"
        size="large"
        indicatorPosition="start"
        showIndicator
        className={props.className}
      >
        <MetricHeader subtitle="Total Value" title="Revenue YTD" />
        <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
      </Metric>
    </QAContainer>
  );
};

AllExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};
