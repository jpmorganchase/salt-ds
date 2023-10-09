import { FLEX_ALIGNMENT_BASE, FlowLayout } from "@salt-ds/core";

import { Meta, StoryFn } from "@storybook/react";
import "../layout/layout.stories.css";

export default {
  title: "Core/Layout/Flow Layout",
  component: FlowLayout,
  argTypes: {
    as: { type: "string" },
    align: {
      options: [...FLEX_ALIGNMENT_BASE, "stretch", "baseline"],
      control: { type: "select" },
    },
    gap: {
      type: "number",
    },
  },
} as Meta<typeof FlowLayout>;

const DefaultStory: StoryFn<typeof FlowLayout> = (args) => {
  return (
    <FlowLayout className="layout-container" {...args}>
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} style={{ minWidth: 80 }}>
          <p>Item {index + 1}</p>
        </div>
      ))}
    </FlowLayout>
  );
};
export const Default = DefaultStory.bind({});
Default.args = {};
