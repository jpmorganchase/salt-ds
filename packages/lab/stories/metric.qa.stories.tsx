import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ToolkitProvider } from "@jpmorganchase/uitk-core";
import { Metric, MetricContent, MetricHeader } from "@jpmorganchase/uitk-lab";
import { BackgroundBlock, QAContainer } from "docs/components";
import "./card.qa.stories.css";

export default {
  title: "Lab/Metric/QA",
  component: Metric,
} as ComponentMeta<typeof Metric>;

const metricExamples = (
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

export const CompareWithOriginalToolkit: ComponentStory<typeof Metric> = () => {
  return (
    <QAContainer
      width={700}
      className="uitkMetricQA"
      imgSrc="/visual-regression-screenshots/Metric-vr-snapshot.png"
    >
      <div style={{ width: 700, display: "flex", flex: 1 }}>
        <ToolkitProvider theme={"light"}>
          <BackgroundBlock style={{ background: "white" }}>
            {metricExamples}
          </BackgroundBlock>
        </ToolkitProvider>
        <ToolkitProvider theme={"dark"}>
          <BackgroundBlock>{metricExamples}</BackgroundBlock>
        </ToolkitProvider>
      </div>
    </QAContainer>
  );
};
