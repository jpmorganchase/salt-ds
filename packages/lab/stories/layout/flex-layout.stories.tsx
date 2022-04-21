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
  gap: {
    type: "number",
  },
  justify: {
    options: FLEX_CONTENT_ALIGNMENT_BASE,
    control: { type: "select" },
  },
  separators: {
    options: ["start", "center", "end", true],
    control: { type: "select" },
  },
  wrap: {
    type: "boolean",
  },
};
