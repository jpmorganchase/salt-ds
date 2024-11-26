import { FLEX_ALIGNMENT_BASE, FlexItem, FlowLayout } from "@salt-ds/core";

import type { Meta, StoryFn } from "@storybook/react";
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

const PaddingAndMargins: StoryFn<typeof FlowLayout> = (args) => {
  return (
    <div style={{ border: "solid 1px" }}>
      <FlowLayout style={{ border: "solid 1px" }} {...args}>
        {Array.from({ length: 12 }, (_, index) => (
          <FlexItem
            key={`item-${index + 1}`}
            style={{ border: "solid 1px" }}
            padding={2}
            margin={1}
          >
            <p>Item {index + 1}</p>
          </FlexItem>
        ))}
      </FlowLayout>
    </div>
  );
};
export const WithPaddingAndMargins = PaddingAndMargins.bind({});
WithPaddingAndMargins.args = {
  gap: 1,
  padding: 2,
  margin: 2,
};
