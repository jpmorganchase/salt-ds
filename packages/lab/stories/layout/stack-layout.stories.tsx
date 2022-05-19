import {
  FLEX_ALIGNMENT_BASE,
  FlexItem,
  StackLayout,
} from "@jpmorganchase/uitk-lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { FlexContent } from "./flex-item.stories";

export default {
  title: "Layout/StackLayout",
  component: StackLayout,
} as ComponentMeta<typeof StackLayout>;

const Template: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args}>
      {Array.from({ length: 4 }, (_, index) => (
        <FlexItem key={index}>
          <FlexContent />
        </FlexItem>
      ))}
      <FlexContent>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing.</p>
      </FlexContent>
    </StackLayout>
  );
};
export const ToolkitStackLayout = Template.bind({});

ToolkitStackLayout.argTypes = {
  align: {
    options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
    control: { type: "select" },
  },
  gap: {
    type: "number",
  },
  separators: {
    options: ["start", "center", "end", true],
    control: { type: "select" },
  },
};
