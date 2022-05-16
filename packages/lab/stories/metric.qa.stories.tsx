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
      width: 284,
      padding: 0,
    }}
  >
    <Metric
      align="left"
      direction="up"
      emphasis="low"
      orientation="horizontal"
      showIndicator
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric
      align="center"
      direction="down"
      emphasis="medium"
      orientation="horizontal"
      showIndicator
      indicatorPosition="start"
    >
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="right" emphasis="high" orientation="horizontal">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="left" direction="up" emphasis="low" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="center" direction="up" emphasis="medium" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric
      align="right"
      direction="down"
      emphasis="high"
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
      className="uitkMetricQA"
      imgSrc="/visual-regression-screenshots/Metric-vr-snapshot.png"
    >
      <div style={{ width: 600, display: "flex", flex: 1 }}>
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
