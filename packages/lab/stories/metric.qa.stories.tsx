import { ComponentMeta, ComponentStory, Story } from "@storybook/react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Metric, MetricContent, MetricHeader } from "@jpmorganchase/uitk-lab";
import { QAContainer } from "docs/components";
import { BackgroundBlock } from "docs/components/BackgroundBlock";

export default {
  title: "Lab/Metric/QA",
  component: Metric,
} as ComponentMeta<typeof Metric>;

const MetricExamples = () => (
  <div
    data-jpmui-test="metric-example"
    style={{
      display: "flex",
      flexDirection: "column",
      width: 334,
      padding: 0,
    }}
  >
    <Metric
      align="left"
      direction="up"
      size="small"
      orientation="horizontal"
      showIndicator
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric
      align="center"
      direction="down"
      size="medium"
      orientation="horizontal"
      showIndicator
      indicatorPosition="start"
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric
      align="right"
      size="large"
      orientation="horizontal"
      direction="up"
      showIndicator
      indicatorPosition="end"
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="left" direction="up" size="small" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="center" direction="up" size="medium" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric
      align="right"
      direction="down"
      size="large"
      indicatorPosition="start"
      showIndicator
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
  </div>
);

export const ExamplesGrid: Story = (props) => {
  return (
    <div style={{ width: 800, display: "flex", flex: 1 }} {...props}>
      <ToolkitProvider theme={"light"}>
        <BackgroundBlock style={{ background: "white" }}>
          <MetricExamples />
        </BackgroundBlock>
      </ToolkitProvider>
      <ToolkitProvider theme={"dark"}>
        <BackgroundBlock>
          <MetricExamples />
        </BackgroundBlock>
      </ToolkitProvider>
    </div>
  );
};

ExamplesGrid.parameters = {
  chromatic: { disableSnapshot: false },
};

export const CompareWithOriginalToolkit: ComponentStory<typeof Metric> = () => {
  return (
    <QAContainer
      width={700}
      className="uitkMetricQA"
      imgSrc="/visual-regression-screenshots/Metric-vr-snapshot.png"
    >
      <ExamplesGrid className="backwardsCompat" />
    </QAContainer>
  );
};
