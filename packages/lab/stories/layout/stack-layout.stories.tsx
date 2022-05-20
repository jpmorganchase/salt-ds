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
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    separators: {
      options: ["start", "center", "end", true],
      control: { type: "select" },
    },
  },
} as ComponentMeta<typeof StackLayout>;

const DefaultStackLayoutStory: ComponentStory<typeof StackLayout> = (args) => {
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
export const DefaultStackLayout = DefaultStackLayoutStory.bind({});
DefaultStackLayout.args = {};

const StackLayoutStorySimpleUsage: ComponentStory<typeof StackLayout> = (
  args
) => {
  //  TODO: add example
  return <StackLayout {...args}></StackLayout>;
};
export const StackLayoutSimpleUsage = StackLayoutStorySimpleUsage.bind({});
StackLayoutSimpleUsage.args = {};
