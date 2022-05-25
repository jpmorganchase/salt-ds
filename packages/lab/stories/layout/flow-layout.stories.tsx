import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
  Metric,
  MetricContent,
  MetricHeader,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Layout/FlowLayout",
  component: FlowLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof FlowLayout>;

const DefaultFlowLayoutStory: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </FlowLayout>
  );
};
export const DefaultFlowLayout = DefaultFlowLayoutStory.bind({});
DefaultFlowLayout.args = {};

const Responsive: ComponentStory<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout {...args}>
      {Array.from({ length: 6 }, (_, index) => (
        <FlexItem grow={1} key={index}>
          <FlexContent />
        </FlexItem>
      ))}
    </FlowLayout>
  );
};
export const ToolkitFlowLayoutResponsive = Responsive.bind({});
ToolkitFlowLayoutResponsive.args = {};

const FlowLayoutStorySimpleUsage: ComponentStory<typeof FlowLayout> = (
  args
) => {
  return (
    <div style={{ background: "#EAEDEF", padding: 24 }}>
      <FlowLayout {...args}>
        {Array.from({ length: 5 }, (_, index) => (
          <Metric key={index}>
            <MetricHeader title={`Form Stage ${index + 1}`} />
            <MetricContent value="Complete" />
          </Metric>
        ))}
        <Metric>
          <MetricHeader title="Form Stage 6" />
          <MetricContent value="Pending" />
        </Metric>
      </FlowLayout>
    </div>
  );
};
export const FlowLayoutSimpleUsage = FlowLayoutStorySimpleUsage.bind({});
FlowLayoutSimpleUsage.args = {
  gap: 3,
};
