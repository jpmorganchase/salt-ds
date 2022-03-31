import {
  Breadcrumb,
  Breadcrumbs,
  Card,
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  Metric,
  MetricContent,
  MetricHeader,
  StackLayout,
  VERTICAL_SEPARATOR_VARIANTS,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { DefaultDropdown } from "../dropdown.stories";
import { ToolkitLayerLayoutPreferencesDialog } from "./layer-layout.stories";

export default {
  title: "Layout/FlowLayout",
  component: FlowLayout,
} as ComponentMeta<typeof FlowLayout>;

const flexItemStyles = { background: "lightcyan", padding: "1rem" };
const flexLayoutStyle = {
  background: "lightblue",
};

const Template: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout style={flexLayoutStyle} {...args}>
      {Array.from({ length: 8 }, (i, index) => (
        <FlexItem style={flexItemStyles}>
          <p>{`FlexItem ${index}`}</p>
        </FlexItem>
      ))}
    </FlowLayout>
  );
};
export const ToolkitFlowLayout = Template.bind({});
ToolkitFlowLayout.args = {};

ToolkitFlowLayout.argTypes = {
  alignContent: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  separator: {
    options: VERTICAL_SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
  wrap: {
    options: ["wrap", "nowrap", "wrap-reverse"],
    control: { type: "select" },
  },
};

const getMetric = (base: number) => Math.round(base * Math.random()) / 100;
const MetricsExample: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <StackLayout>
      <Breadcrumbs style={{ margin: "1rem" }}>
        <Breadcrumb>Metrics</Breadcrumb>
        <Breadcrumb>Test</Breadcrumb>
      </Breadcrumbs>
      <FlowLayout separator={"vertical-start"} style={{ margin: "0 1rem" }}>
        <FlexItem>
          <DefaultDropdown source={[]} />
        </FlexItem>
        <FlexItem>
          <DefaultDropdown source={[]} />
        </FlexItem>
        <FlexItem>
          <DefaultDropdown source={[]} />
        </FlexItem>
        <ToolkitLayerLayoutPreferencesDialog />
      </FlowLayout>
      <FlowLayout
        style={{ background: "lightgray", margin: "1rem", padding: "1rem" }}
        {...args}
      >
        <h2 style={{ flexBasis: "100%" }}>Last 30 days</h2>
        {Array.from({ length: 5 }, () => (
          <Card style={{ maxWidth: "33%", minWidth: "200px", flexGrow: 1 }}>
            <Metric>
              <MetricHeader subtitle="Total Value" title="Revenue YTD" />
              <MetricContent
                subvalue={`+${getMetric(2345)} (+${getMetric(234)}%)`}
                value={`$${getMetric(23456)}B`}
              />
            </Metric>
          </Card>
        ))}
      </FlowLayout>
      <FlowLayout
        style={{ background: "lightgray", margin: "1rem", padding: "1rem" }}
        {...args}
      >
        <h2 style={{ flexBasis: "100%" }}>Last year</h2>
        {Array.from({ length: 5 }, () => (
          <Card style={{ maxWidth: "33%", minWidth: "200px", flexGrow: 1 }}>
            <Metric>
              <MetricHeader subtitle="Total Value" title="Revenue YTD" />
              <MetricContent
                subvalue={`+${getMetric(2345)} (+${getMetric(234)}%)`}
                value={`$${getMetric(23456)}B`}
              />
            </Metric>
          </Card>
        ))}
      </FlowLayout>
    </StackLayout>
  );
};
export const MetricsFlowLayout = MetricsExample.bind({});
MetricsFlowLayout.args = {
  alignContent: "stretch",
};

MetricsFlowLayout.argTypes = {
  alignContent: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch"],
    control: { type: "select" },
  },
  justifyContent: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  separator: {
    options: VERTICAL_SEPARATOR_VARIANTS,
    control: { type: "select" },
  },
  wrap: {
    options: ["wrap", "nowrap", "wrap-reverse"],
    control: { type: "select" },
  },
};
