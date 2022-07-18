import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

import { Metric, MetricContent, MetricHeader } from "@jpmorganchase/uitk-lab";
import { QAContainer, QAContainerProps } from "docs/components";

export default {
  title: "Lab/Metric/QA",
  component: Metric,
} as ComponentMeta<typeof Metric>;

export const AllExamplesGrid: Story<QAContainerProps> = (props) => {
  return (
    <QAContainer
      cols={4}
      vertical
      transposeDensity
      height={1400}
      className="uitkMetricQA"
      imgSrc={props.imgSrc}
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

export const BackwardsCompatGrid = AllExamplesGrid.bind({});
BackwardsCompatGrid.args = {
  className: "backwardsCompat",
};

BackwardsCompatGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Metric> = () => {
  return (
    <AllExamplesGrid
      className="backwardsCompat"
      imgSrc="/visual-regression-screenshots/Metric-vr-snapshot.png"
    />
  );
};
