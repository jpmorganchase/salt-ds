import {
  FLEX_ALIGNMENT_BASE,
  FLEX_CONTENT_ALIGNMENT_BASE,
  FlexItem,
  FlowLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Layout/FlowLayout",
  component: FlowLayout,
} as ComponentMeta<typeof FlowLayout>;

const Template: ComponentStory<typeof FlowLayout> = (args) => {
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
export const ToolkitFlowLayout = Template.bind({});

ToolkitFlowLayout.argTypes = {
  align: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
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
