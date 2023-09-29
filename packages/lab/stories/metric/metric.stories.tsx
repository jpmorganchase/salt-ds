import { DoubleChevronDownIcon, FavoriteIcon } from "@salt-ds/icons";
import { Metric, MetricContent, MetricHeader } from "@salt-ds/lab";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Lab/Metric",
  component: Metric,
} as Meta<typeof Metric>;

export const FeatureMetric: StoryFn<typeof Metric> = (props) => (
  <Metric {...props}>
    <MetricHeader subtitle="Total Value" title="Revenue YTD" />
    <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
  </Metric>
);

export const DefaultHorizontal: StoryFn<typeof Metric> = (props) => (
  <Metric {...props}>
    <MetricHeader title="Revenue YTD" />
    <MetricContent value="$801.9B" />
  </Metric>
);
DefaultHorizontal.args = {
  orientation: "horizontal",
};

export const DefaultVertical: StoryFn<typeof Metric> = (props) => (
  <Metric {...props}>
    <MetricHeader title="Revenue YTD" />
    <MetricContent value="$801.9B" />
  </Metric>
);
DefaultVertical.args = {
  orientation: "vertical",
};

export const AdditionalContextHorizontal: StoryFn<typeof Metric> = (props) => (
  <Metric {...props}>
    <MetricHeader subtitle="Total Value" title="Revenue YTD" />
    <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
  </Metric>
);
AdditionalContextHorizontal.args = {
  orientation: "horizontal",
  direction: "up",
};

export const AdditionalContextVertical: StoryFn<typeof Metric> = (props) => (
  <Metric {...props}>
    <MetricHeader subtitle="Total Value" title="Revenue YTD" />
    <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
  </Metric>
);
AdditionalContextVertical.args = {
  orientation: "vertical",
  direction: "up",
};

const rowStyles = {
  display: "flex",
  width: 500,
};

const cellStyles = {
  width: "50%",
};

export const Layout: StoryFn<typeof Metric> = () => (
  <div style={rowStyles}>
    <Metric direction="up" style={cellStyles}>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="down" orientation="horizontal" style={cellStyles}>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
  </div>
);

export const WithAlignmentHorizontal: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: 250,
    }}
  >
    <Metric align="left" direction="up" orientation="horizontal">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="center" direction="up" orientation="horizontal">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="right" direction="up" orientation="horizontal">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
  </div>
);

export const WithAlignmentVertical: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      width: 500,
    }}
  >
    <Metric align="left" direction="up">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="center" direction="up">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
    <Metric align="right" direction="up">
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent subvalue="+10.1 (+1.23%)" value="$801.9B" />
    </Metric>
  </div>
);

export const Horizontal: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: 250,
    }}
  >
    <Metric direction="up" size="small" orientation="horizontal" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="up" size="medium" orientation="horizontal" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="up" size="large" orientation="horizontal" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
  </div>
);

export const Vertical: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      width: 600,
    }}
  >
    <Metric direction="up" size="small" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="up" size="medium" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="up" size="large" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
  </div>
);

export const WithIndicator: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      width: 400,
    }}
  >
    <Metric direction="up" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
    <Metric direction="down" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent value="$801.9B" />
    </Metric>
  </div>
);

export const WithLink: StoryFn<typeof Metric> = () => (
  <Metric>
    <MetricHeader
      SubtitleLinkProps={{
        href: "https://www.google.com",
      }}
      subtitle="Total Value"
      title="Revenue YTD"
    />
    <MetricContent value="$801.9B" />
  </Metric>
);

export const WithCustomIndicator: StoryFn<typeof Metric> = () => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      width: 400,
    }}
  >
    <Metric direction="down" showIndicator>
      <MetricHeader subtitle="Total Value" title="Revenue YTD" />
      <MetricContent
        IndicatorIconProps={{
          // Updated from `accessibleText`
          "aria-label": "decrease",
        }}
        // API changes
        // name: "down-expand",
        IndicatorIconComponent={DoubleChevronDownIcon}
        value="$801.9B"
      />
    </Metric>
    <Metric indicatorPosition="start" showIndicator>
      <MetricHeader title="Starred" />
      <MetricContent
        IndicatorIconProps={{
          // Updated from `accessibleText`
          "aria-label": "starred",
        }}
        // API changes
        // name: "favorite",
        IndicatorIconComponent={FavoriteIcon}
        value="1,1128"
      />
    </Metric>
  </div>
);
