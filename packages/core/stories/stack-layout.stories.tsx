import { FLEX_ALIGNMENT_BASE, StackLayout } from "@salt-ds/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/stack-layout",
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
    gap: {
      type: "number",
    },
  },
  args: {
    gap: 3,
  },
} as ComponentMeta<typeof StackLayout>;

const DefaultStackLayoutStory: ComponentStory<typeof StackLayout> = (args) => {
  return (
    <StackLayout {...args} className="layout-container">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </StackLayout>
  );
};
export const DefaultStackLayout = DefaultStackLayoutStory.bind({});
DefaultStackLayout.args = {};
