import { FLEX_ALIGNMENT_BASE, InlineLayout } from "@salt-ds/core";

import { ComponentMeta, ComponentStory } from "@storybook/react";
import "./layout-stories.css";

export default {
  title: "Core/Layout/InlineLayout",
  component: InlineLayout,
  argTypes: {
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
  },
  args: {
    gap: 3,
  },
} as ComponentMeta<typeof InlineLayout>;

const DefaultInlineLayoutStory: ComponentStory<typeof InlineLayout> = (
  args
) => {
  return (
    <InlineLayout className="layout-container" {...args}>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} style={{ minWidth: 80 }}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </InlineLayout>
  );
};
export const DefaultInlineLayout = DefaultInlineLayoutStory.bind({});
DefaultInlineLayout.args = {};
