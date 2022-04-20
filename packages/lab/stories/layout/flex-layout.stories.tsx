import {
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  FlexItem,
  FlexLayout,
} from "@brandname/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Layout/FlexLayout",
  component: FlexLayout,
} as ComponentMeta<typeof FlexLayout>;

const Template: ComponentStory<typeof FlexLayout> = (args) => {
  return (
    <FlexLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
    </FlexLayout>
  );
};
export const ToolkitFlexLayout = Template.bind({});

ToolkitFlexLayout.argTypes = {
  align: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  direction: {
    options: ["row", "column"],
    control: { type: "radio" },
  },
  gapMultiplier: {
    options: [1, 2, 3, 4],
    control: { type: "select" },
  },
  justify: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  separator: {
    options: ["start", "center", "end"],
    control: { type: "select" },
  },
  wrap: {
    options: ["wrap", "nowrap"],
    control: { type: "select" },
  },
};
